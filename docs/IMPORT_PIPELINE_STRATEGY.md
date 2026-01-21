# Import Pipeline Strategy

**Version:** 1.0
**Status:** Specified
**Scope:** MVP Manual Import Pipeline

---

## 1. Purpose & Context

This document specifies the manual transaction import and UPSERT pipeline for the BetterBudget MVP.

### Goals

- Imports are deterministic and idempotent
- Database is the single source of truth
- User explicitly controls when imports happen
- Pipeline is forward-compatible with real PSD2 / FinTS APIs

### What This Document Covers

- Manual import trigger (UI-level)
- Import flow from mock API → DB
- UPSERT and idempotency guarantees
- Error handling and user feedback
- MVP vs Post-MVP boundaries

### What This Document Does NOT Cover

- Background jobs or scheduled imports
- Real-time syncing
- Analytics or aggregations
- Schema changes

---

## 2. Manual Import Trigger

### 2.1 Trigger Location

| Location | Component | Action |
|----------|-----------|--------|
| Dashboard page | "Sync Transactions" button | Imports transactions for all linked accounts |

**MVP Decision:** Single dashboard-level button only. Per-account import is Post-MVP.

### 2.2 Preconditions

For import to proceed, **all** of the following must be true:

| Precondition | Enforcement Point | Failure Behavior |
|--------------|-------------------|------------------|
| User authenticated | Middleware + API route | Redirect to `/login` |
| At least one bank linked | UI check | Show "Link Bank" CTA instead |
| Account exists for user | Import endpoint | Return error with message |
| User owns account (RLS) | Database layer | Query returns empty / error |

### 2.3 Precondition Failure Responses

| Missing Precondition | UI Response |
|---------------------|-------------|
| Not authenticated | Redirect to `/login?redirect=/dashboard` |
| No banks linked | Empty state with "Link a Bank" button |
| Account not found | Toast: "Account not found. Please refresh." |
| Access denied | Toast: "Unable to access this account." |

### 2.4 Why Manual Import for MVP

| Reason | Explanation |
|--------|-------------|
| **Reduced complexity** | No background jobs, no scheduling infrastructure |
| **User control** | User decides when data is refreshed |
| **Cognitive load** | Clear cause-effect (button press → data appears) |
| **Explainability** | Easy to answer "where does my data come from?" |
| **Debugging** | Deterministic behavior |

---

## 3. Import Pipeline (Step-by-Step)

### 3.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPORT PIPELINE FLOW                          │
└─────────────────────────────────────────────────────────────────┘

Step 1: User Action
   User clicks "Sync Transactions" on dashboard
                │
                ▼
Step 2: UI → Import Endpoint
   POST /api/import
   Body: { accountId, dateFrom?, dateTo? }
   (Called once per linked account)
                │
                ▼
Step 3: Import Endpoint → Mock Data
   Call generateMockTransactions()
   (Uses generators directly, not HTTP)
                │
                ▼
Step 4: Normalization
   Transform PSD2 format → DB format
                │
                ▼
Step 5: UPSERT into Database
   supabase.upsert(transactions, {
     onConflict: 'user_id,external_id'
   })
                │
                ▼
Step 6: Result Reporting
   Return { success, imported, updated, skipped, errors }
   UI displays toast notification
```

### 3.2 Step Responsibilities

#### Step 1: User Action

| Aspect | Detail |
|--------|--------|
| Responsibility | UI component (dashboard) |
| Input | User click event |
| Output | Disable button, show loading state |
| Failure modes | None |

#### Step 2: UI → Import Endpoint

| Aspect | Detail |
|--------|--------|
| Responsibility | API route handler |
| Input | `{ accountId: string, dateFrom?: string, dateTo?: string }` |
| Output | Validated request, user context from session |
| Failure modes | 401 (not authenticated), 400 (invalid body) |

#### Step 3: Import Endpoint → Mock Data

| Aspect | Detail |
|--------|--------|
| Responsibility | Import module (`lib/import/`) |
| Input | Account details, user ID, date range |
| Output | Array of `MockTransaction` objects |
| Failure modes | Account not found, invalid mock account ID |

#### Step 4: Normalization

| Aspect | Detail |
|--------|--------|
| Responsibility | `transformMockTransaction()` function |
| Input | `MockTransaction` (PSD2 format) |
| Output | `DbTransactionInsert` (app format) |
| Failure modes | Invalid amount format, missing required fields |

**Field Mapping:**

| PSD2 Field | DB Field | Transformation |
|------------|----------|----------------|
| `transactionId` | `external_id` | Direct copy |
| `bookingDate` | `booking_date` | Direct copy (ISO date) |
| `valueDate` | `value_date` | Direct copy or null |
| `transactionAmount.amount` | `amount` | Parse string, absolute value |
| `transactionAmount.currency` | `currency` | Direct copy |
| (derived from sign) | `type` | Negative → expense, Positive → income |
| `remittanceInformationUnstructured` | `description` | Direct copy |
| (derived from description) | `category` | Rule-based mapping |
| `creditorName` | `creditor_name` | Direct copy |
| `debtorName` | `debtor_name` | Direct copy |

#### Step 5: UPSERT into Database

| Aspect | Detail |
|--------|--------|
| Responsibility | `upsertTransactions()` function |
| Input | Array of `DbTransactionInsert` |
| Output | Array of `DbTransaction` (persisted) |
| Failure modes | Database connection error, constraint violation |

#### Step 6: Result Reporting

| Aspect | Detail |
|--------|--------|
| Responsibility | Import endpoint → UI |
| Input | UPSERT result, error count |
| Output | `ImportResult` object |
| Failure modes | None (always returns structured response) |

---

## 4. Idempotency & UPSERT Strategy

### 4.1 Uniqueness Definition

**Constraint:** `UNIQUE(user_id, external_id)` on `bb_transactions`

| Field | Role |
|-------|------|
| `user_id` | Identifies owner (from auth session) |
| `external_id` | Bank-provided transaction identifier |

### 4.2 Import Scenarios

| Scenario | Behavior | Result |
|----------|----------|--------|
| First import | All transactions are new | INSERT all |
| Re-import (same data) | All `external_id` match | UPDATE all (no-op) |
| Re-import (new data) | Mix of existing and new | UPDATE existing, INSERT new |
| Partial overlap | Some `external_id` match | UPDATE matched, INSERT unmatched |

### 4.3 Why DB-Level Enforcement

| Reason | Explanation |
|--------|-------------|
| Single enforcement point | No duplicate checks in business logic |
| Race condition safe | Database handles concurrent imports |
| Defense in depth | DB prevents duplicates even if app has bugs |
| Simpler business logic | Import sends data, DB handles conflict |

### 4.4 Why Business Logic Does NOT Deduplicate

| Anti-pattern | Problem |
|--------------|---------|
| Pre-check for existing | Race conditions, extra queries |
| App-level deduplication | Duplicated logic, error-prone |
| Skip if exists | Would miss legitimate updates |

**Correct approach:** Send all transactions to DB, let UPSERT handle it.

---

## 5. Error Handling & User Feedback

### 5.1 Error Types

| Error Type | Cause | User Message |
|------------|-------|--------------|
| Authentication | Session expired | "Please log in again" |
| Account Not Found | Invalid account ID | "Account not found" |
| Access Denied | RLS violation | "Unable to access this account" |
| No Accounts Linked | No banks linked | "Link a bank first" |
| Transform Error | Invalid transaction data | "Some transactions could not be imported" |
| Database Error | Connection/constraint | "Import failed. Please try again." |

### 5.2 Error Surfacing Rules

| Rule | Rationale |
|------|-----------|
| User-friendly messages only | Non-technical users |
| No technical details in UI | Errors stay in logs |
| Actionable guidance | Tell user what to do |
| Partial success acknowledged | Report both success and failure counts |

### 5.3 Success Feedback

| Scenario | Toast Message |
|----------|---------------|
| All imported | "Imported {N} transactions" |
| Mixed result | "Imported {N} transactions. {M} skipped." |
| No new data | "All transactions already up to date" |

### 5.4 Error Feedback

| Scenario | Toast Message |
|----------|---------------|
| Auth error | "Session expired. Please log in." |
| Account error | "Account not found. Please refresh." |
| Partial failure | "Imported {N} transactions. {M} failed." |
| Total failure | "Import failed. Please try again later." |

---

## 6. MVP vs Post-MVP

### 6.1 MVP Scope

| Feature | Included |
|---------|----------|
| Manual "Sync Transactions" button on dashboard | Yes |
| Import all linked accounts at once | Yes |
| Date range defaults to 90 days | Yes |
| UPSERT idempotency | Yes |
| Success/error toast notifications | Yes |
| Import result summary in toast | Yes |

### 6.2 Post-MVP (Not Implemented)

| Feature | Reason Excluded |
|---------|-----------------|
| Per-account import button | Adds UI complexity |
| Scheduled imports | Requires background jobs |
| Auto-sync on login | Implicit behavior confuses users |
| Incremental sync (delta) | Mock API doesn't track position |
| Import progress bar | Fast enough for MVP dataset |
| Import history/log | Complexity without clear value |
| Rate limiting | No external API calls |
| Retry on failure | Manual retry sufficient |
| Bank-specific errors | Mock API is uniform |
| Conflict resolution UI | UPSERT handles automatically |
| Undo import | Can delete transactions manually |

### 6.3 Explicit Non-Goals

| Non-Goal | Rationale |
|----------|-----------|
| Real-time sync | Requires webhooks/polling |
| Background refresh | Requires job infrastructure |
| Push notifications | Requires notification service |
| Import analytics | Not needed for budgeting |

---

## 7. Forward Compatibility

### 7.1 Adapter Pattern

```
CURRENT (MVP):
  /api/import → lib/import/ → generateMockTransactions() → DB

FUTURE (Real PSD2):
  /api/import → lib/import/ → lib/adapters/psd2.ts → Bank API → DB

FUTURE (FinTS):
  /api/import → lib/import/ → lib/adapters/fints.ts → FinTS/HBCI → DB
```

### 7.2 What Changes for Real APIs

| Component | Change Required |
|-----------|-----------------|
| Mock generators | Replace with real API calls |
| OAuth flow | Add real bank redirect |
| Token storage | Add refresh token handling |
| Error handling | Add bank-specific error codes |

### 7.3 What Stays the Same

| Component | Why Unchanged |
|-----------|---------------|
| `bb_accounts` schema | Already PSD2-aligned |
| `bb_transactions` schema | Already PSD2-aligned |
| UPSERT logic | Works with any `external_id` source |
| Transform function | PSD2 format is standardized |
| UI components | Read from DB only |
| Import result type | Generic counts |
| Error messages | User-friendly, not API-specific |

---

## 8. Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Import trigger | Dashboard button only | Simplicity for MVP |
| Deduplication | DB constraint | Single source of truth |
| Conflict key | `user_id + external_id` | Unique per user |
| Conflict behavior | UPSERT (update existing) | Allows data correction |
| Error handling | User-friendly messages | ADHD-focused UX |
| Scheduling | Not MVP | Adds complexity |
| Data source | Mock generators directly | No HTTP overhead |

---

*Document created: Task 4 Analysis — Import Pipeline Strategy*