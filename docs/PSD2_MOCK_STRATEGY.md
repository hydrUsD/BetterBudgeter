# PSD2 Mock API Strategy

**Version:** 1.1
**Status:** Implemented
**Scope:** MVP Mock API Specification

---

## 1. Purpose & Context

This document specifies a **PSD2-like mock API** that simulates AISP (Account Information Services) behavior for the BetterBudget MVP.

### What This Document Covers

- Domain mapping from real PSD2 to mock
- Mock API responsibilities and boundaries
- Endpoint specifications (read-only)
- Consent flow for MVP
- Data flow and trust boundaries
- Forward compatibility design

### What This Document Does NOT Cover

- Payment initiation (PISP) — out of scope
- OAuth / third-party redirects — not simulated
- Certificate handling / eIDAS — not applicable
- Real bank authentication — Supabase Auth only
- Background polling / webhooks — not implemented

---

## 2. PSD2 / AISP Domain Mapping

### 2.1 Concept Mapping

| Real PSD2 Concept | Mock Implementation | Simulated | Omitted |
|-------------------|---------------------|-----------|---------|
| **Account** | `bb_accounts` table | Metadata, balance, IBAN | Multi-currency, joint accounts |
| **Balance** | `balance` field | Current snapshot | Balance history, credit limits |
| **Transaction** | `bb_transactions` table | Full PSD2 shape | Pending transactions, holds |
| **Consent** | `bb_accounts.user_id` link | User grants access | OAuth, eIDAS, consent expiry |

### 2.2 Database Mapping

| PSD2 Entity | DB Table | Key Fields |
|-------------|----------|------------|
| ASPSP (Bank) | None (hardcoded) | `bank_id`, `bank_name` |
| Account | `bb_accounts` | `id`, `user_id`, `bank_id`, `iban`, `balance` |
| Transaction | `bb_transactions` | `id`, `external_id`, `booking_date`, `amount` |
| Consent | Implicit | Account existence = active consent |

### 2.3 Critical Clarifications

- **Consent is internal**: Creating a row in `bb_accounts` represents consent. No external OAuth.
- **No redirect flows**: Real PSD2 requires bank redirects. The mock skips this.
- **Supabase Auth only**: Mock API does not authenticate — relies on session tokens.

---

## 3. Mock API Responsibilities

### 3.1 Provided by Mock API

| Responsibility | Description |
|----------------|-------------|
| Bank list | Static, deterministic list of available banks |
| Account list | Mock accounts for a given bank |
| Balance | Current balance per account |
| Transactions | Historical transactions in PSD2 format |
| Stable IDs | User-specific, reproducible transaction identifiers |

### 3.2 NOT Provided by Mock API

| Excluded | Reason |
|----------|--------|
| Payment initiation | PISP out of scope |
| Real-time data | Determinism requires static snapshots |
| User authentication | Supabase handles this |
| Cross-user data | RLS prevents at DB level |
| Balance history | Not needed for MVP |

### 3.3 Invariants (Guarantees)

1. **Content Determinism**: Same `bankId + accountId` → same transaction content
2. **ID Uniqueness**: Same `userId + bankId + accountId` → same transaction IDs (unique per user)
3. **PSD2 Format**: Response shapes match real PSD2 AIS
4. **Read-Only**: All endpoints are GET-only
5. **Idempotent Imports**: Re-importing produces identical results

### 3.4 UI Boundary Rule

| Rule | Rationale |
|------|-----------|
| UI reads from `bb_*` tables only | Database is single source of truth |
| Mock API is for import pipeline only | Data flows: Mock → Import → DB → UI |
| UI never calls mock endpoints | Prevents stale/inconsistent display |

---

## 4. Endpoint Specifications

### 4.1 Overview

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/mock/banks` | GET | List available banks | Required |
| `/api/mock/accounts` | GET | List accounts for bank | Required |
| `/api/mock/transactions` | GET | List transactions for account | Required |

### 4.2 `GET /api/mock/banks`

**Purpose:** Return list of banks available for linking.

**Parameters:** None

**Response DTO:**

```json
{
  "banks": [
    {
      "bankId": "string",
      "name": "string",
      "bic": "string",
      "country": "string",
      "status": "available"
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `bankId` | string | Stable identifier, e.g. `demo-bank-001` |
| `name` | string | Display name, e.g. `Demo Bank` |
| `bic` | string | Mock BIC/SWIFT code |
| `country` | string | ISO country code, e.g. `DE` |
| `status` | string | Always `available` for mock |

**Determinism:** Hardcoded list — identical on every call.

---

### 4.3 `GET /api/mock/accounts`

**Purpose:** Return accounts for a linked bank.

**Parameters:**

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `bankId` | string | Yes | Bank identifier |

**Response DTO:**

```json
{
  "accounts": [
    {
      "accountId": "string",
      "iban": "string",
      "name": "string",
      "accountType": "checking | savings | credit",
      "currency": "string",
      "balances": {
        "available": {
          "amount": "string",
          "currency": "string"
        }
      }
    }
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | string | Stable identifier |
| `iban` | string | Mock IBAN |
| `name` | string | Account name |
| `accountType` | string | `checking`, `savings`, or `credit` |
| `currency` | string | ISO 4217, e.g. `EUR` |
| `balances.available.amount` | string | Decimal string |
| `balances.available.currency` | string | ISO 4217 |

**Determinism:** For a given `bankId`, returns identical accounts. IDs derived as `{bankId}-{type}-{index}`.

---

### 4.4 `GET /api/mock/transactions`

**Purpose:** Return transactions for an account in PSD2 format.

**Parameters:**

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `accountId` | string | Yes | — | Account identifier |
| `dateFrom` | string | No | 90 days ago | ISO date |
| `dateTo` | string | No | Today | ISO date |

**Response DTO:**

```json
{
  "transactions": {
    "booked": [
      {
        "transactionId": "string",
        "bookingDate": "string",
        "valueDate": "string",
        "transactionAmount": {
          "amount": "string",
          "currency": "string"
        },
        "creditorName": "string | null",
        "debtorName": "string | null",
        "remittanceInformationUnstructured": "string"
      }
    ]
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `transactionId` | string | User-specific stable ID |
| `bookingDate` | string | ISO date |
| `valueDate` | string | ISO date |
| `transactionAmount.amount` | string | Signed decimal string |
| `transactionAmount.currency` | string | ISO 4217 |
| `creditorName` | string or null | Recipient for outgoing payments |
| `debtorName` | string or null | Sender for incoming payments |
| `remittanceInformationUnstructured` | string | Transaction description |

**Determinism (Hybrid Strategy):**

| Aspect | Seed | Behavior |
|--------|------|----------|
| Transaction content | `bankId + accountId` | Same for all users |
| Transaction ID | `userId + bankId + accountId + bookingDate + index` | Unique per user |

**Volume:** 50-100 transactions per account for realistic testing.

---

## 5. Consent & User Flow

### 5.1 MVP Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BANK LINKING FLOW (MVP)                       │
└─────────────────────────────────────────────────────────────────┘

Step 1: Authentication
   User → /login → Supabase Auth → Session cookie

Step 2: Navigate to Link Bank
   /dashboard → "Link Bank" button → /link-bank

Step 3: Bank Selection
   /link-bank → GET /api/mock/banks → Display bank list
   User selects a bank

Step 4: Consent (Simplified)
   ┌─────────────────────────────────────────────────────────────┐
   │ "Grant Access to Demo Bank?"                                 │
   │                                                               │
   │ This will allow BetterBudget to:                             │
   │ • View your account balances                                 │
   │ • View your transaction history                              │
   │                                                               │
   │                    [Grant Access]  [Cancel]                  │
   └─────────────────────────────────────────────────────────────┘
   User clicks "Grant Access"

Step 5: Account Creation
   POST /api/import/link
     → Fetch mock accounts for bank
     → Create bb_accounts rows with user_id
     → Return success

Step 6: Completion
   Redirect to /dashboard
   Toast: "Demo Bank linked successfully"
```

### 5.2 Consent Representation

| Concept | Implementation |
|---------|----------------|
| Active consent | Row exists in `bb_accounts` with `user_id` |
| Consent scope | All accounts from linked bank |
| Consent time | `bb_accounts.created_at` |
| Last sync | `bb_accounts.last_synced_at` |

### 5.3 Consent Revocation (Design Only — Not MVP)

| Action | Implementation |
|--------|----------------|
| "Unlink Bank" | Delete `bb_accounts` rows for that bank |
| Cascade | Delete linked `bb_transactions` |
| Feedback | Confirmation dialog, redirect to dashboard |

### 5.4 No Consent State

- `/dashboard` shows empty state with CTA to link bank
- Import endpoint returns error if no accounts exist
- No data to display until user links a bank

---

## 6. Data Flow & Boundaries

### 6.1 Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW                                   │
└─────────────────────────────────────────────────────────────────┘

   ┌──────────┐
   │   USER   │
   │   (UI)   │
   └────┬─────┘
        │
  ══════╪══════════════════════════════════════
        │  TRUST BOUNDARY: Session
  ══════╪══════════════════════════════════════
        │
        ▼
   ┌──────────────┐     ┌──────────────────┐
   │ /api/import  │────►│ /api/mock/*      │
   │              │     │ (PSD2 format)    │
   └──────┬───────┘     └──────────────────┘
          │
          │ Validate + Normalize
          │
  ════════╪════════════════════════════════════
          │  TRUST BOUNDARY: Internal
  ════════╪════════════════════════════════════
          │
          ▼
   ┌──────────────┐
   │   UPSERT     │
   │  (Idempotent)│
   └──────┬───────┘
          │
  ════════╪════════════════════════════════════
          │  TRUST BOUNDARY: RLS
  ════════╪════════════════════════════════════
          │
          ▼
   ┌──────────────┐
   │ bb_accounts  │
   │bb_transactions│
   │   (DB)       │
   └──────┬───────┘
          │
          │ Query (RLS filtered)
          ▼
   ┌──────────────┐
   │  /dashboard  │
   │  (UI reads   │
   │   from DB)   │
   └──────────────┘
```

### 6.2 Trust Boundaries

| Boundary | Location | Enforcement |
|----------|----------|-------------|
| Session | Middleware | Supabase session token |
| Internal | `/api/import` | Only import calls mock |
| RLS | Database | `user_id = auth.uid()` |

### 6.3 Validation Points

| Stage | Validation |
|-------|------------|
| Middleware | User authenticated |
| Import endpoint | User owns account |
| Import endpoint | Date range valid |
| Import endpoint | Mock response well-formed |
| Database | UNIQUE constraint (no duplicates) |
| Database | RLS (no cross-user access) |

### 6.4 Normalization (PSD2 → App)

| PSD2 Field | App Field | Transformation |
|------------|-----------|----------------|
| `transactionId` | `external_id` | Direct copy |
| `bookingDate` | `booking_date` | ISO string → DATE |
| `transactionAmount.amount` | `amount` | String → Decimal |
| `transactionAmount.currency` | `currency` | Direct copy |
| `creditorName` | `creditor_name` | Direct copy |
| `debtorName` | `debtor_name` | Direct copy |
| `remittanceInformationUnstructured` | `description` | Truncate if needed |
| (derived) | `type` | `income` if amount > 0, else `expense` |
| (derived) | `category` | Rule-based from description |

---

## 7. Forward Compatibility

### 7.1 Replacement Strategy

The mock is designed to be replaceable without changing:

| Component | Why Unchanged |
|-----------|---------------|
| UI | Never calls mock — reads from DB only |
| Database schema | Already PSD2-aligned |
| Import logic | Consumes standard PSD2 DTOs |

### 7.2 Adapter Pattern

```
CURRENT (Mock):
  /api/import → /api/mock/transactions → bb_transactions

FUTURE (Real PSD2):
  /api/import → lib/adapters/psd2.ts → Real Bank API → bb_transactions

FUTURE (FinTS):
  /api/import → lib/adapters/fints.ts → FinTS/HBCI → bb_transactions
```

### 7.3 Migration Tasks (Future, Not MVP)

| Task | Scope |
|------|-------|
| Create `lib/adapters/` | New module |
| Add real API credentials | Environment config |
| Implement OAuth flow | `/link-bank` changes |
| Store refresh tokens | New table or encrypted field |
| Handle real API errors | Import error handling |

### 7.4 What Stays the Same

- `bb_accounts` schema
- `bb_transactions` schema
- Import UPSERT logic
- Dashboard queries
- All UI components

---

## 8. Design Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Seed strategy** | Hybrid | Content from `bankId + accountId`, IDs from `userId + bankId + accountId + index` |
| **Date range** | 90 days default, configurable | Matches PSD2 minimum, allows override via query param |
| **Transaction volume** | 50-100 per account | Realistic for testing, validates performance |
| **Endpoints** | 3 read-only | Minimal viable surface |
| **Consent model** | Implicit via account creation | No OAuth complexity |

---

## 9. MVP vs Post-MVP

### 9.1 MVP Scope

| Feature | Included |
|---------|----------|
| Hardcoded bank list | Yes |
| Deterministic account generation | Yes |
| Deterministic transaction generation (hybrid) | Yes |
| PSD2-format responses | Yes |
| User-specific transaction IDs | Yes |
| Single consent button | Yes |
| Read-only endpoints | Yes |
| 90-day default with configurable range | Yes |
| 50-100 transactions per account | Yes |

### 9.2 Explicitly NOT MVP

| Feature | Reason |
|---------|--------|
| Consent expiry / renewal | Complexity |
| Balance history endpoint | Not needed |
| Pagination | Dataset is small |
| Rate limiting | No external users |
| Error simulation | Determinism priority |
| Multiple currencies per account | Out of scope |
| Standing orders | Out of scope |
| Unlink bank UI | Post-MVP |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **AISP** | Account Information Service Provider — read-only access to account data |
| **ASPSP** | Account Servicing Payment Service Provider — the bank |
| **PSD2** | Payment Services Directive 2 — EU regulation for bank API access |
| **RLS** | Row Level Security — database-enforced data isolation |
| **UPSERT** | Insert or update — idempotent database operation |
| **External ID** | Bank-provided transaction identifier for deduplication |

---

*Document created: Task 3 Analysis — PSD2 Mock Strategy*