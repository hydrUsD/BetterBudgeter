# Supabase Integration Strategy

*Analysis document for BetterBudget — Task 2 Analysis*

---

## Decisions Summary

| Question | Decision | Rationale |
|----------|----------|-----------|
| RLS | **Enable from start** | Mimic real PSD2 environment requirements |
| Schema | **New tables, new data** | Clean separation from legacy |
| Legacy migration | **Not needed** | Fresh PSD2-compliant mock data instead |
| Auth UI | **Pre-built components** | Minimize custom work (shadcn/ui, Radix, Supabase) |

---

## 1. Supabase Auth Strategy

### 1.1 Auth Method: Email + Password

**Decision:** Use Email/Password authentication for MVP.

**Rationale:**
- Simpler for junior devs to implement and debug
- Familiar mental model for users
- No email delivery setup required for local testing
- Magic Link can be added later as enhancement

---

### 1.2 Auth UI: Pre-built Components

**Decision:** Use pre-built components, prioritizing shadcn/ui.

**Component sources (in order of preference):**
1. **shadcn/ui** — Already Radix-based, fits existing stack
2. **Radix UI** — Low-level primitives if needed
3. **Supabase Auth UI** — If it simplifies implementation

**Login form components needed:**
- Input (email, password) — shadcn/ui
- Button — shadcn/ui
- Form validation — react-hook-form + zod (already in stack)
- Error display — Sonner toast (already in stack)

---

### 1.3 Session Handling in Next.js App Router

**Client structure:**
```
src/lib/auth/
├── server.ts      # createServerClient for Server Components & API routes
├── client.ts      # createBrowserClient for Client Components
├── middleware.ts  # Auth check helper for middleware
└── index.ts       # Re-exports + types
```

**Session flow:**
1. User logs in via `/login` form
2. Supabase sets session cookie (httpOnly)
3. Middleware validates session on protected routes
4. Server Components read user via `getUser()`

---

### 1.4 Auth Boundaries

| Route | Auth Required | Enforcement |
|-------|---------------|-------------|
| `/login` | No | Public |
| `/dashboard` | **Yes** | Middleware redirect |
| `/settings` | **Yes** | Middleware redirect |
| `/link-bank` | **Yes** | Middleware redirect |
| `/api/import` | **Yes** | 401 response |
| `/api/mock/*` | **Yes** | 401 response |
| `/api/notifications` | **Yes** | 401 response |
| `/` (legacy) | PasscodeWrapper | Unchanged |
| `/analytics` (legacy) | PasscodeWrapper | Unchanged |
| `/legacy` | No | Navigation only |

**Unauthenticated behavior:**
- Page routes → Redirect to `/login?redirect={originalPath}`
- API routes → Return `{ error: "Unauthorized" }` with 401

---

### 1.5 Legacy Route Interaction

**Decision:** Legacy routes remain completely unchanged.

- PasscodeWrapper stays in root layout
- Legacy API routes keep JWT-based auth
- Both auth systems coexist during migration
- No data sharing between legacy and new system

---

## 2. Database Access Strategy

### 2.1 Access Method: Supabase JS Client

**Decision:** Use `@supabase/supabase-js` for new BetterBudget features.

**Why:**
- Automatic RLS integration via auth context
- TypeScript support with generated types
- Junior-dev friendly API
- Matches Supabase documentation patterns

**Legacy Drizzle stays:** For existing OopsBudgeter functionality only.

---

### 2.2 New Tables (Separate from Legacy)

**Decision:** Create entirely new tables with `user_id` from the start.

**New schema (conceptual):**

```sql
-- Linked bank accounts
CREATE TABLE bb_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  bank_id TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  currency TEXT DEFAULT 'EUR',
  balance DECIMAL(12,2) DEFAULT 0,
  iban TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Imported transactions
CREATE TABLE bb_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  account_id UUID REFERENCES bb_accounts(id) NOT NULL,
  external_id TEXT NOT NULL,  -- From mock API, for idempotency
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL,
  description TEXT,
  category TEXT,
  booking_date DATE NOT NULL,
  value_date DATE,
  creditor_name TEXT,
  debtor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, external_id)  -- Idempotency constraint
);

-- User preferences
CREATE TABLE bb_user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_currency TEXT DEFAULT 'EUR',
  theme TEXT DEFAULT 'system',
  compact_view BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Notification preferences
CREATE TABLE bb_notification_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  budget_alerts BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  import_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Budget configuration (Task 6 — MVP feature)
-- See docs/BUDGET_STRATEGY.md for detailed design
CREATE TABLE bb_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  category TEXT NOT NULL,
  monthly_limit DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(user_id, category)  -- One budget per category per user
);
```

**Naming convention:** `bb_` prefix distinguishes BetterBudget tables from legacy `transactions`/`achievements` tables.

**Budget note:** The `bb_budgets` table stores configuration only (limits). Budget progress is calculated from `bb_transactions` at query time.

---

### 2.3 Row Level Security (RLS)

**Decision:** Enable RLS on all new tables.

**Policy pattern (same for all tables):**
```sql
-- Enable RLS
ALTER TABLE bb_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own transactions"
  ON bb_transactions FOR SELECT
  USING (user_id = auth.uid());

-- Users can only insert their own data
CREATE POLICY "Users can insert own transactions"
  ON bb_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can only update their own data
CREATE POLICY "Users can update own transactions"
  ON bb_transactions FOR UPDATE
  USING (user_id = auth.uid());

-- Users can only delete their own data
CREATE POLICY "Users can delete own transactions"
  ON bb_transactions FOR DELETE
  USING (user_id = auth.uid());
```

**Why this matters for PSD2 simulation:**
- Real banking APIs enforce strict data isolation
- RLS provides defense-in-depth
- Even if application code has bugs, DB prevents data leakage

---

### 2.4 DB Access Location

Per CLAUDE.md, database access only in `lib/`:

```
src/lib/db/
├── index.ts          # Supabase client setup
├── accounts.ts       # bb_accounts queries
├── transactions.ts   # bb_transactions queries
├── budgets.ts        # bb_budgets queries (Task 6)
├── settings.ts       # bb_user_settings queries
└── types.ts          # Generated or manual types
```

**Rules:**
- `app/` routes call `lib/db/*` functions
- `components/` receive data via props only
- `utils/` have zero database access
- All queries automatically filtered by RLS

---

### 2.5 Idempotency Enforcement

**Constraint:** `UNIQUE(user_id, external_id)` on `bb_transactions`

**Import pattern:**
```typescript
// Conceptual - uses Supabase upsert
await supabase
  .from('bb_transactions')
  .upsert(transactions, {
    onConflict: 'user_id,external_id',
    ignoreDuplicates: false  // Update existing records
  })
```

**Why this works:**
- Mock API returns stable `external_id` per transaction
- Re-importing same data updates existing records
- No duplicates created on repeated imports

---

## 3. Data Flow (PSD2 Simulation)

### 3.1 Complete Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     PSD2-STYLE DATA FLOW                         │
└─────────────────────────────────────────────────────────────────┘

1. USER AUTHENTICATION
   ┌──────┐    ┌─────────────┐    ┌──────────────┐
   │ User │───►│ /login form │───►│ Supabase Auth│
   └──────┘    └─────────────┘    └──────┬───────┘
                                         │
                                    Session cookie
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  /dashboard  │
                                  └──────────────┘

2. BANK LINKING (PSD2 Consent)
   ┌──────┐    ┌─────────────┐    ┌──────────────┐    ┌────────┐
   │ User │───►│ /link-bank  │───►│/api/mock/banks│───►│ Select │
   └──────┘    └─────────────┘    └──────────────┘    │  bank  │
                                                       └───┬────┘
                                                           │
                                  Mock OAuth consent flow  │
                                                           ▼
                                                    ┌──────────────┐
                                                    │ bb_accounts  │
                                                    │   (DB)       │
                                                    └──────────────┘

3. TRANSACTION IMPORT (PSD2 AIS)
   ┌──────┐    ┌─────────────┐    ┌─────────────────────┐
   │ User │───►│ Import btn  │───►│ /api/import         │
   └──────┘    └─────────────┘    └──────────┬──────────┘
                                              │
                                              ▼
                                  ┌─────────────────────┐
                                  │ /api/mock/          │
                                  │   transactions      │
                                  │ (PSD2-format data)  │
                                  └──────────┬──────────┘
                                              │
                                    Transform + UPSERT
                                              │
                                              ▼
                                  ┌─────────────────────┐
                                  │  bb_transactions    │
                                  │      (DB)           │
                                  └─────────────────────┘

4. DASHBOARD DISPLAY
   ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
   │  /dashboard  │───►│  lib/db/*   │───►│ bb_* tables  │
   │              │◄───│  (queries)  │◄───│   (DB)       │
   └──────────────┘    └─────────────┘    └──────────────┘
         │
         ▼
   UI renders from DB only (never from mock API)
```

---

### 3.2 Data Source Rules

| Data | Source | Display Allowed | Cache |
|------|--------|-----------------|-------|
| Bank list | `/api/mock/banks` | Yes (selection UI) | Yes |
| Mock transactions | `/api/mock/transactions` | **No** (import only) | No |
| Imported transactions | `bb_transactions` | **Yes** | Yes |
| Account balance | `bb_accounts` | **Yes** | Short |
| Dashboard charts | `bb_transactions` aggregated | **Yes** | Yes |

**Key rule:** Mock API is for import pipeline only. UI always reads from database.

---

### 3.3 PSD2 Data Format Alignment

**Mock API must return PSD2-style fields:**

```typescript
// Mock transaction from Fake-Finance API
interface PSD2Transaction {
  transactionId: string;          // → external_id
  bookingDate: string;            // ISO date
  valueDate?: string;             // ISO date
  transactionAmount: {
    amount: string;               // Decimal string
    currency: string;             // ISO 4217
  };
  creditorName?: string;
  debtorName?: string;
  remittanceInformationUnstructured?: string;  // → description
}
```

**This ensures:** If/when real PSD2 APIs are integrated, minimal code changes needed.

---

## 4. Environment Variables

### 4.1 Required Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anon key |
| `DATABASE_URL` | Server | Legacy Drizzle (keep) |
| `PASSCODE` | Server | Legacy auth (keep) |
| `JWT_SECRET` | Server | Legacy JWT (keep) |

**Optional for later:**
| Variable | Type | Purpose |
|----------|------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Admin operations |

---

### 4.2 Validation

**Hard fail on missing Supabase vars:**
```typescript
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}
```

**Legacy vars:** Keep existing behavior (already validated or fail gracefully).

---

## 5. MVP Decisions Summary

| Question | Answer | Note |
|----------|--------|------|
| Supabase Auth required? | **Yes** | Single auth system per CLAUDE.md |
| RLS required? | **Yes** | Mimics real PSD2 security requirements |
| Multi-user support? | **Schema ready, features no** | `user_id` everywhere, no sharing UI |
| Guest/demo user? | **No** | Legacy passcode serves this purpose |
| Data persistence? | **Yes** | Database is source of truth |
| Legacy data migration? | **No** | Fresh PSD2-compliant mock data |
| Custom auth UI? | **No** | Use shadcn/ui components |

---

## 6. Implementation Checklist

For the implementation task that follows:

### Phase 1: Supabase Setup
- [ ] Add `@supabase/supabase-js` and `@supabase/ssr` packages
- [ ] Create `lib/auth/server.ts` and `lib/auth/client.ts`
- [ ] Add middleware for protected routes
- [ ] Create `/login` page with shadcn/ui form

### Phase 2: Database Schema
- [ ] Create `bb_accounts` table with RLS
- [ ] Create `bb_transactions` table with RLS
- [ ] Create `bb_user_settings` table with RLS
- [ ] Create `bb_notification_prefs` table with RLS

### Phase 3: Integration
- [ ] Update `lib/db/` to use Supabase client
- [ ] Wire up `/dashboard` to read from new tables
- [ ] Wire up `/settings` to user settings table

---

## 7. Open Items (Not Blocking)

1. **Password reset flow** — Required but can use Supabase default
2. **Email verification** — Optional for MVP, can add later
3. **Session duration** — Default to 7 days (matches legacy)
4. **Type generation** — Use Supabase CLI or manual types

---

*Document created: Task 2 Analysis*
