# Phase 8: Home Hub — Research

**Researched:** 2026-05-20
**Domain:** Next.js 15 App Router server components, pure TypeScript helpers, shadcn/ui + Tailwind v4 token composition
**Confidence:** HIGH (all critical claims verified against the live codebase; no new external dependencies)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Safe-to-Spend formula (`lib/safe-to-spend.ts`)**
- D-S2S-01: `ESSENTIAL_CATEGORIES = ['Rent', 'Utilities', 'Food', 'Transport'] as const`
- D-S2S-02: `remaining = Math.max(0, limit - spent)` — over-budget categories contribute 0, never negative
- D-S2S-03: `totalBalance = Σ accounts where type ∈ {'checking', 'savings'}` — excludes `credit` and `investment`
- Final formula: `safeToSpend = totalBalance − Σ Math.max(0, budget.monthlyLimit − spent)` for essential-category budgets in current calendar month

**Greeting + name + locale**
- D-GR-01: `nameFromEmail(email): string | null` — `email.split('@')[0]` → split on `[._-]` → first chunk → must start with letter → capitalized. Returns `null` if unparseable.
- D-GR-02: Three bands — morning 05:00–11:59, afternoon 12:00–17:59, evening 18:00–04:59 (wrapping). Helper: `greetingForTime(now: Date): 'morning' | 'afternoon' | 'evening'`
- D-GR-03: Timezone = hardcoded `Europe/Berlin` via `toLocaleString('en-US', { timeZone: 'Europe/Berlin' })`
- D-GR-04: Greeting computed server-side per request in `(bb)/page.tsx` — no client component

**Component extraction strategy**
- D-CMP-01: Phase 8 creates exactly: `src/lib/safe-to-spend.ts`, `src/utils/greeting.ts`, `src/utils/format.ts`, `src/components/dashboard/TransactionItem.tsx`
- D-CMP-02: `TransactionItem` accepts a view-model: `{ merchant: string; amount: number; type: 'income' | 'expense'; category: TransactionCategory; date: string }`
- D-CMP-03: `BudgetStatusRow` is a **private function** inside `(bb)/page.tsx` — not a separate file

**Legacy cutover + edge states**
- D-CUT-01: Replace `(bb)/page.tsx` outright in a single commit (no feature flag, no parallel route)
- D-CUT-02: Edge-state policy:
  - 0 accounts → replace entire hub with full-screen single-CTA card linking to `/link-bank`
  - 0 budgets → hub renders; budget section shows inline "Set up your first budget →" `/settings` link
  - 0 transactions → hub renders; transactions section shows "Your transactions will appear here." + `<SyncTransactionsButton />`
  - DB error → hub renders; hero shows `€—`; inline paragraph "Couldn't load data. Try refreshing." at bottom — NO red banner
- D-CUT-03: "Set up your first budget" links to `/settings`
- D-CUT-04: `formatCurrency` extracted from legacy inline helper into `src/utils/format.ts`; behavior unchanged: `new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)`

### Claude's Discretion
- TransactionItem CSS structure (Tailwind class composition)
- Budget status sort order — alphabetical by category name
- "This month" boundary — calendar month via `getCurrentMonthStart()`
- Hero typography exact Tailwind class composition — use `text-bb-3xl` per DESIGN_SYSTEM §5.1
- Greeting fallback string when name is null — "Good morning." / "Good afternoon." / "Good evening."
- Empty-state copy wording (Phase 11 copy pass finalizes)

### Deferred Ideas (OUT OF SCOPE)
- PSD2 / FinTS production readiness
- v3+ migration of `ESSENTIAL_CATEGORIES` to per-budget `is_essential` boolean
- Credit-debt-aware Safe-to-Spend
- Rolling 30-day window
- Greeting customization (preferred name, emoji, quote)
- i18n / German UI
- `BudgetStatusSummary` extraction to reusable component
- Safe-to-Spend trend / sparkline
- `<BudgetNotificationDialogs/>` placement — Phase 9 decides
- PSD2 storage-grounds analysis doc
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| PAGE-01 | Home page contains exactly 4 sections: greeting + Safe-to-Spend hero, compact budget status indicators, 3–5 most recent transactions, "Sync Transactions" button | §Architecture Patterns — server component data-fetch pattern, section order, edge state routing |
| PAGE-02 | Budget status indicators are compact single-line elements (NOT full Budget Progress Cards) | §Code Examples — `BudgetStatusRow` private function pattern; `BudgetProgress.status` from `calculateAllBudgetProgress()` drives the dot color |
| PAGE-03 | Recent transactions use TransactionItem pattern (merchant + amount + category + date, no icons) | §Code Examples — `TransactionItem` view-model shape from D-CMP-02; merchant derived from `DbTransaction.description`; date from `booking_date` |
| PAGE-07 | All new pages use PageShell layout (max-width 768px, correct spacing) | §Architecture Patterns — page renders inside `(bb)/layout.tsx`'s `<PageShell>` — must NOT add a second shell |
| PAGE-08 | `lib/safe-to-spend.ts` with formula comments and limitations | §Code Examples — pure function accepting `DbAccount[]` and `BudgetProgress[]`; formula locked in CONTEXT D-S2S-01..03 |
</phase_requirements>

---

## Summary

Phase 8 replaces `src/app/(bb)/page.tsx` with the calm Home hub described in DESIGN_SYSTEM.md §7.2. The page is a Next.js App Router Server Component that fetches four data sources in a single parallel `Promise.all`, renders four locked sections, and delegates all interactivity to the single existing client island: `<SyncTransactionsButton>`.

The only genuinely novel code is `src/lib/safe-to-spend.ts` (pure business logic, ~40 lines), `src/utils/greeting.ts` (pure helpers, ~30 lines), `src/utils/format.ts` (one function extracted from the existing inline helper), and `src/components/dashboard/TransactionItem.tsx` (a presentational component with a locked view-model interface). Everything else in the phase is composition and routing of existing modules.

Confidence is HIGH because every data source (`getAccounts`, `calculateAllBudgetProgress`, `getRecentTransactions`, `getUser`), every design token (`--bb-*`), every layout primitive (`PageShell`, `PageHeader`), and the one reused component (`SyncTransactionsButton`) is already in the codebase and verified. No new packages are introduced.

**Primary recommendation:** Implement as a 3-wave plan — Wave 0 (create test files and new pure modules), Wave 1 (implement `(bb)/page.tsx` replacement and `TransactionItem`), Wave 2 (validation and commit). The page should be treated as a single-concern rewrite, not an incremental patch.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Safe-to-Spend calculation | API / Backend | — | Pure business logic; no DOM; consumes DB modules. Lives in `lib/` per CLAUDE.md project structure. [VERIFIED: codebase] |
| Greeting + time-band computation | Frontend Server (SSR) | — | Computed per-request server-side (D-GR-04). No client hydration needed; timezone is fixed to Europe/Berlin in server context. [VERIFIED: CONTEXT.md] |
| Currency formatting | Frontend Server (SSR) | Browser / Client | Pure function called in both server page and client-rendered `TransactionItem`. Extracted to `utils/format.ts`. [VERIFIED: CONTEXT.md D-CUT-04] |
| Data fetching (accounts, budgets, transactions, user) | Frontend Server (SSR) | — | All fetches in the `async` server page component via Supabase server client with RLS. No client-side fetch. [VERIFIED: existing `(bb)/page.tsx` pattern] |
| TransactionItem rendering | Frontend Server (SSR) | — | Pure presentational server component. No interactivity; no `"use client"`. [VERIFIED: D-CMP-02 — no interactive props] |
| BudgetStatusRow rendering | Frontend Server (SSR) | — | Private function in page file; server-only. Not clickable in Phase 8. [VERIFIED: D-CMP-03] |
| Sync action (import trigger) | Browser / Client | — | `SyncTransactionsButton` is the only `"use client"` island. Already implemented. [VERIFIED: SyncTransactionsButton.tsx line 1] |
| 0-accounts edge state (full-screen CTA) | Frontend Server (SSR) | — | Conditional server-render: if `accounts.length === 0`, return CTA card instead of hub. [VERIFIED: D-CUT-02] |
| DB error edge state | Frontend Server (SSR) | — | try/catch at page level; error state passed as `dataError: string | null`. [VERIFIED: existing page.tsx pattern lines 84–93] |

---

## Standard Stack

### Core (no new dependencies — all already installed)

| Library | Installed Version | Purpose | Why Standard |
|---------|-------------------|---------|--------------|
| `next` | `15.2.8` | App Router server components, page routing | Project framework [VERIFIED: package.json] |
| `react` | `19.0.0` | UI runtime | Required for Next.js 15 [VERIFIED: package.json] |
| `typescript` | (project config) | Type safety across all new modules | Project standard [VERIFIED: tsconfig.json exists] |
| `tailwindcss` | `^4` | All styling via `--bb-*` Tailwind utilities | Phase 6 wired `@theme inline` mappings [VERIFIED: src/app/globals.css] |
| `shadcn/ui` (Button) | new-york / zinc | Only used by `SyncTransactionsButton` — already installed | Project primary UI library [VERIFIED: components.json] |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | `4.0.18` | Unit tests for pure modules | All Wave 0 test files for `safe-to-spend.ts`, `greeting.ts`, `format.ts`, `TransactionItem` |
| `@testing-library/react` | `16.3.2` | Component render tests | `TransactionItem.test.tsx` |
| `@testing-library/jest-dom` | `6.9.1` | DOM assertions | Already in `tests/setup.ts` |

**Installation:** None required. All dependencies already present in lockfile.

**Version verification:**
```bash
bun pm ls 2>&1 | grep -E "(next@|react@|tailwindcss|vitest)"
# Expected: next@15.2.8, react@19.0.0, tailwindcss@^4, vitest@4.0.18
```

---

## Package Legitimacy Audit

> Phase 8 installs **NO new packages**. All libraries are existing lockfile entries vetted in previous phases.

| Package | Registry | Status | Disposition |
|---------|----------|--------|-------------|
| `next@15.2.8` | npm | Existing — core framework | Approved — existing |
| `react@19.0.0` | npm | Existing — core runtime | Approved — existing |
| `vitest@4.0.18` | npm | Existing — test runner | Approved — existing |
| `@testing-library/react@16.3.2` | npm | Existing — component tests | Approved — existing |

**Packages removed due to slopcheck [SLOP] verdict:** none (no new installs)
**Packages flagged as suspicious [SUS]:** none

---

## Architecture Patterns

### System Architecture Diagram

```
Browser GET /
      ↓
src/middleware.ts  (auth gate — passes authenticated users through)
      ↓
(bb)/layout.tsx    [SERVER]
  └── <PageShell> (max-width 768px, pb clearance for TabBar)
        ├── (bb)/page.tsx  [SERVER, async]
        │     │
        │     ├── Promise.all([
        │     │     getUser()                   → AuthUser | null
        │     │     getAccounts()               → DbAccount[]
        │     │     calculateAllBudgetProgress() → BudgetProgress[]
        │     │     getRecentTransactions(5)     → DbTransaction[]
        │     │   ])
        │     │
        │     ├── computeSafeToSpend(accounts, budgetProgress)  [lib/safe-to-spend.ts]
        │     ├── nameFromEmail(user.email)                     [utils/greeting.ts]
        │     ├── greetingForTime(now)                          [utils/greeting.ts]
        │     │
        │     ├── if accounts.length === 0 → FULL-SCREEN CTA (link to /link-bank)
        │     │
        │     └── else → 4-section hub:
        │           ├── Section 1: Hero card (greeting + "Safe to spend" label + EUR number)
        │           ├── Section 2: Budget status card
        │           │     └── BudgetStatusRow × N  [private fn in page.tsx]
        │           │         OR 0-budgets inline empty state
        │           ├── Section 3: Recent transactions card
        │           │     └── <TransactionItem /> × 3–5  [new component]
        │           │         OR 0-transactions inline empty state + SyncTransactionsButton
        │           └── Section 4: <SyncTransactionsButton accountCount={n} />  [CLIENT island]
        │
        └── <TabBar />  [CLIENT, existing Phase 7]
```

**Data flow note:** All fetches complete server-side before HTML is sent. First paint = final paint for data. No loading states on the page level (ADHD-hostile layout shift eliminated). The only client-side activity is `SyncTransactionsButton`'s own internal loading spinner on click.

### Recommended Project Structure (Phase 8 additions)

```
src/
├── app/
│   └── (bb)/
│       └── page.tsx          ← REPLACED outright (D-CUT-01)
│
├── components/
│   └── dashboard/
│       └── TransactionItem.tsx   ← NEW (D-CMP-01)
│
├── lib/
│   └── safe-to-spend.ts          ← NEW (D-CMP-01, PAGE-08)
│
└── utils/
    ├── greeting.ts               ← NEW (D-CMP-01)
    └── format.ts                 ← NEW (D-CMP-01, D-CUT-04)
```

### Pattern 1: Parallel data-fetch then try/catch in server page

**What:** Existing `(bb)/page.tsx` establishes the pattern — declare empty defaults, try Promise.all(), catch into `dataError`.

**When to use:** Every BB server page that fetches from Supabase.

**Example (verified from `src/app/(bb)/page.tsx` lines 72–93):**
```tsx
// Source: existing src/app/(bb)/page.tsx lines 72–93 [VERIFIED: codebase]
let accounts: DbAccount[] = [];
let recentTransactions: DbTransaction[] = [];
let budgetProgress: BudgetProgress[] = [];
let dataError: string | null = null;

try {
  [accounts, recentTransactions, budgetProgress] = await Promise.all([
    getAccounts(),
    getRecentTransactions(5),
    calculateAllBudgetProgress(),
  ]);
} catch (error) {
  console.error("[home] Error fetching data:", error);
  dataError = error instanceof Error ? error.message : "Failed to load data";
}
```

**Phase 8 change vs legacy:** The legacy page uses 5 separate awaits + `getTransactionSummary()` + `getExpensesByCategory()`. Phase 8 simplifies to 4 parallel fetches (`getUser`, `getAccounts`, `calculateAllBudgetProgress`, `getRecentTransactions`). `getTransactionSummary`, `getExpensesByCategory`, `getTransactions`, and `getTransactionsByPeriod` are NOT called from the new home page.

### Pattern 2: `BudgetProgress[]` as the single data source for two hub sections

**What:** `calculateAllBudgetProgress()` returns the full `BudgetProgress[]` DTO. This single call satisfies both the Safe-to-Spend calculation AND the budget status indicator rows — no second DB query.

**Source:** `src/lib/budgets/index.ts:158` [VERIFIED: codebase]

**BudgetProgress shape (verified):**
```ts
// Source: src/types/finance.ts:196 [VERIFIED: codebase]
interface BudgetProgress {
  budget: {
    id: string;
    category: ExpenseCategory;   // 'Food' | 'Rent' | 'Utilities' | 'Transport' | 'Entertainment' | 'Shopping' | 'Other'
    monthlyLimit: number;
    // ...
  };
  spentAmount: number;
  remainingAmount: number;       // Already Math.max(0, limit - spent) — line 174 [VERIFIED]
  usagePercentage: number;
  status: BudgetStatus;          // 'on_track' | 'warning' | 'over_budget'
  transactionCount: number;
}
```

**Key implementation note:** `remainingAmount` in `BudgetProgress` is ALREADY clamped to `Math.max(0, ...)` at `src/lib/budgets/index.ts:174`. Safe-to-Spend uses this same clamped value per D-S2S-02. No additional clamping needed in `safe-to-spend.ts` when consuming from `BudgetProgress.remainingAmount`.

### Pattern 3: `DbAccount.account_type` string for type filtering

**What:** `DbAccount.account_type` is a `string` (not a typed enum) in `src/lib/db/types.ts`. The `AccountType` enum (`'checking' | 'savings' | 'credit' | 'investment'`) lives in `src/types/finance.ts`. Safe-to-Spend must filter using string comparison.

**Source:** `src/lib/db/types.ts:27` [VERIFIED: codebase]

**Implementation pattern:**
```ts
// src/lib/safe-to-spend.ts
const SPENDABLE_ACCOUNT_TYPES = ['checking', 'savings'] as const;
const totalBalance = accounts
  .filter(acc => SPENDABLE_ACCOUNT_TYPES.includes(acc.account_type as 'checking' | 'savings'))
  .reduce((sum, acc) => sum + (acc.balance ?? 0), 0);
```

**Alternative (simpler):**
```ts
const totalBalance = accounts
  .filter(acc => acc.account_type === 'checking' || acc.account_type === 'savings')
  .reduce((sum, acc) => sum + (acc.balance ?? 0), 0);
```

Both are equivalent. The simpler form is preferred per CLAUDE.md "clarity over brevity."

### Pattern 4: Merchant name derivation for TransactionItem

**What:** `DbTransaction` has `description: string | null`, `creditor_name: string | null`, `debtor_name: string | null`. The legacy dashboard uses `tx.description || "Transaction"` as the display name (page.tsx line 261). Phase 8 must define a canonical merchant-name rule.

**Source:** `src/lib/db/types.ts:81–83`, `src/app/(bb)/page.tsx:261` [VERIFIED: codebase]

**Recommended implementation (D-CMP-02 says merchant is `string` — page maps DB row → view-model):**
```ts
// In (bb)/page.tsx, when mapping DbTransaction → TransactionItemProps:
const merchant = tx.description
  ?? tx.creditor_name
  ?? tx.debtor_name
  ?? "Transaction";
```

This is more expressive than the legacy fallback and uses the richer fields the import pipeline stores (`creditor_name`, `debtor_name` from mock PSD2 data — see `src/lib/import/index.ts:175–176`).

### Pattern 5: `greetingForTime` timezone computation

**What:** Vercel servers run UTC. To compute the correct time band (D-GR-02, D-GR-03), use `toLocaleString` to project the current UTC time into Europe/Berlin, then parse the hour.

**Implementation (derived from locked decisions D-GR-02, D-GR-03):**
```ts
// src/utils/greeting.ts
export function greetingForTime(now: Date): 'morning' | 'afternoon' | 'evening' {
  // Project UTC → Europe/Berlin
  const berlinString = now.toLocaleString('en-US', {
    timeZone: 'Europe/Berlin',
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(berlinString, 10);
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening'; // 18–23 + 0–4 wraps to evening
}
```

**Pitfall:** `toLocaleString('en-US', { hour: 'numeric', hour12: false })` returns `"0"` for midnight (not `"24"`), and `"5"` for 05:00 — the `parseInt` is safe. Do NOT use `Intl.DateTimeFormat(...).format(now)` and parse — the output format varies by Node.js version and locale. `toLocaleString` with explicit `hour12: false` and `hour: 'numeric'` is the stable cross-platform pattern.

### Pattern 6: No `<main>` in the page — PageShell owns it

**What:** `PageShell` renders `<main>` (verified: `src/components/layout/PageShell.tsx:46`). The new `(bb)/page.tsx` must use a fragment or `<div>` as its outermost element. This was the same lesson from Phase 7 Pitfall 5.

**Critical:** The CURRENT `(bb)/page.tsx` uses `<div className="flex flex-col gap-6">` as root (line 100 — already fixed during Phase 7). The new page MUST NOT add another `<main>`. Its root should be:
```tsx
return (
  <>
    <PageHeader title="Home" />
    <div className="flex flex-col gap-bb-8">
      {/* four sections */}
    </div>
  </>
);
```

### Anti-Patterns to Avoid

- **Calling `getTransactionSummary()` or `getExpensesByCategory()` from the new home page** — these are not needed for the 4-section hub and were removed intentionally. The legacy imports these; the new page should NOT.
- **Wrapping the page in a second `<PageShell>`** — `(bb)/layout.tsx` already wraps all `(bb)` pages. This is Pitfall 5 from Phase 7 research.
- **Hardcoding hex colors** — all colors MUST use `--bb-*` tokens (e.g. `text-bb-positive`, not `text-green-600`). The legacy page uses `text-green-600 dark:text-green-400` — Phase 8 replaces all such hardcoded values.
- **Using `@radix-ui` imports** — CLAUDE.md forbids Radix imports in BB code. `TransactionItem` and `BudgetStatusRow` use only Tailwind utilities.
- **Coloring the Safe-to-Spend hero number based on value** — UI-SPEC locks it to `text-bb-text` always (neutral dark). No `text-bb-positive` / `text-bb-negative` on the hero number.
- **Rendering `<BudgetNotificationDialogs>` on the new home page** — CONTEXT.md defers the placement decision to Phase 9. Phase 8 drops it from the home page file; Phase 9 decides where it lives.
- **Using `font-medium` (weight 500)** — UI-SPEC Revision 1 eliminates `font-medium`. Only `font-bold` (700) and default weight 400.
- **Using `text-bb-xs` (12px)** — UI-SPEC Revision 1 eliminates it. Minimum is `text-bb-sm` (14px).

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Budget spending per category for current month | Custom SQL aggregate in `safe-to-spend.ts` | `calculateAllBudgetProgress()` already returns `spentAmount` per category for current month [VERIFIED: lib/budgets/index.ts:158] | Avoids duplicate DB query; stays consistent with budget display |
| Month boundary calculation | Custom date math | `getCurrentMonthStart()` from `src/lib/budgets/index.ts:58` [VERIFIED] | Same time window everywhere; avoids drift between budget progress and S2S |
| EUR formatting | Custom number formatter | `new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })` extracted to `utils/format.ts` (D-CUT-04) | `Intl` handles edge cases (locale grouping, negative, fractional digits) |
| Date formatting in TransactionItem | Custom date string manipulator | `new Date(date).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })` inline in `TransactionItem` (per UI-SPEC) | `Intl` handles locale rules |
| Conditional Tailwind classes | Inline ternaries everywhere | `cn()` from `@/lib/utils` (already installed: clsx + tailwind-merge) [VERIFIED: lib/utils.ts exists] | Handles class conflicts correctly; readable |

**Key insight:** Phase 8 is composition of existing building blocks, not new infrastructure. The four new files total roughly 120 lines of logic across all of them.

---

## Common Pitfalls

### Pitfall 1: Calling `getAccounts()` returns `account_type` as `string`, not typed `AccountType`

**What goes wrong:** Developer writes `acc.type === 'checking'` but `DbAccount` has `account_type`, not `type`. The type is `string`, not `AccountType`. TypeScript may not catch this if the developer uses `any` anywhere.

**Why it happens:** `DbAccount.account_type` (DB type) vs `Account.accountType` (DTO type) — two different shapes for accounts in the codebase. The DB type is what `getAccounts()` returns.

**How to avoid:** Always use `acc.account_type` (snake_case, from `DbAccount`). Check `src/lib/db/types.ts:27` for the field name before writing Safe-to-Spend. Write unit tests that explicitly pass `DbAccount` shaped inputs.

**Warning signs:** TypeScript error "Property 'type' does not exist on type 'DbAccount'" — correct, it's `account_type`.

### Pitfall 2: Safe-to-Spend imports `calculateAllBudgetProgress()` — but this calls `getUser()` internally via RLS

**What goes wrong:** `safe-to-spend.ts` is in `lib/` and calls budget/account DB functions. These functions require an authenticated Supabase server client (which uses cookies). If the function is ever called outside a request context (e.g. from a test without a mock), it will fail.

**Why it happens:** `safe-to-spend.ts` is NOT a pure function at the module level — it depends on DB functions that depend on the request context. However, its calculation logic IS pure given inputs.

**How to avoid:** Design `src/lib/safe-to-spend.ts` as two layers:
1. A pure calculation function `computeSafeToSpend(accounts: DbAccount[], budgetProgress: BudgetProgress[]): number` — fully unit-testable with no DB dependency.
2. An optional orchestrating function `getSafeToSpend(): Promise<number>` that fetches from DB and delegates to the pure function — integration-tested or browser-smoke-tested.

**Unit tests MUST test the pure `computeSafeToSpend` function, NOT the orchestrating wrapper.**

### Pitfall 3: `greetingForTime` may return `NaN` if `toLocaleString` format changes

**What goes wrong:** `parseInt(berlinString, 10)` returns `NaN` if `berlinString` contains unexpected text (e.g. `"5 AM"` instead of `"5"`). This would cause all time bands to fail.

**Why it happens:** The exact output of `toLocaleString` with `hour12: false` depends on Node.js version and ICU data. In some environments it returns `"17"`, in others `"17:00"`.

**How to avoid:** In the implementation, use `Intl.DateTimeFormat` with `{ hour: 'numeric', hour12: false }` and check `formatToParts` for the `'hour'` part — this is unambiguous:
```ts
const parts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Berlin',
  hour: 'numeric',
  hour12: false,
}).formatToParts(now);
const hour = parseInt(parts.find(p => p.type === 'hour')?.value ?? '12', 10);
```
Unit tests MUST cover boundary hours: 4:59, 5:00, 11:59, 12:00, 17:59, 18:00 (all in Europe/Berlin).

### Pitfall 4: TransactionItem receives `date: string` — must handle `null` or empty booking_date

**What goes wrong:** `DbTransaction.booking_date` is typed as `string` (not `string | null`), but old data or test fixtures might have empty strings. `new Date("")` returns an Invalid Date object and `toLocaleDateString` returns `"Invalid Date"`.

**Why it happens:** The DB schema defines `booking_date` as NOT NULL, but the TS type says `string` without guaranteeing non-empty.

**How to avoid:** In the page's DB-row → view-model mapping, validate the booking_date before passing to `TransactionItem`:
```ts
date: tx.booking_date || new Date().toISOString().split('T')[0], // fallback to today
```
Unit test for `TransactionItem` should include a case with an ISO date string and verify output is `"14 Apr"` style.

### Pitfall 5: `"use client"` leaking into server modules

**What goes wrong:** Developer adds `"use client"` to `TransactionItem.tsx` "just in case" because it looks like a UI component. This makes all imports of it — including the server page — client-bundle. The page can no longer use Supabase server client.

**Why it happens:** New developers default to `"use client"` for any JSX component. Phase 7 research (Pitfall 4) documents the cascade effect.

**How to avoid:** `TransactionItem.tsx` has NO interactivity, NO hooks. It MUST NOT have `"use client"`. The component is a pure presentational server component. Add a comment to the file header explicitly stating: "Server component — do NOT add 'use client'. No interactivity."

### Pitfall 6: `nameFromEmail` must NOT crash on `null` or undefined email

**What goes wrong:** `getUser()` returns `AuthUser | null`. If middleware somehow allows an unauthenticated user through (edge case), `user?.email` is `undefined`. Calling `nameFromEmail(undefined)` would throw.

**How to avoid:** `nameFromEmail` accepts `string | null | undefined` and returns `null` for any non-string input. The caller pattern is:
```ts
const name = user?.email ? nameFromEmail(user.email) : null;
const greeting = greetingForTime(new Date());
// "Good morning, Paul." or "Good morning." if name is null
```
Unit tests MUST cover `nameFromEmail(null)`, `nameFromEmail(undefined)`, `nameFromEmail("")`.

### Pitfall 7: `SyncTransactionsButton` with `accountCount={0}` renders "Link a Bank" button

**What goes wrong:** If a developer passes `accountCount={0}` to `SyncTransactionsButton` in the 0-accounts edge state (full-screen CTA card), the button renders as "Link a Bank" internally. This is redundant because the CTA card already links to `/link-bank`.

**Why it happens:** `SyncTransactionsButton` has a built-in guard (verified: `SyncTransactionsButton.tsx:80`): when `accountCount === 0`, it renders `<Button onClick={() => router.push('/link-bank')}>Link a Bank</Button>`. This is the WRONG behavior inside the 0-accounts full-screen CTA.

**How to avoid:** The 0-accounts full-screen CTA uses a direct `<a href="/link-bank">` wrapped around a shadcn `<Button>` — it does NOT use `SyncTransactionsButton`. The `SyncTransactionsButton` only appears in Section 4 (accounts > 0 path) and in the 0-transactions inline empty state (where accounts > 0 is already guaranteed by the outer condition).

---

## Code Examples

### Example 1: Safe-to-Spend pure calculation

```ts
// Source: derived from CONTEXT.md D-S2S-01..03 + verified types [VERIFIED: codebase types]
// src/lib/safe-to-spend.ts

/**
 * Pure calculation: given account balances and budget progress, compute Safe-to-Spend.
 *
 * Formula:
 *   safeToSpend =
 *       Σ (balance of checking and savings accounts)
 *     − Σ Math.max(0, budget.monthlyLimit - spent)
 *         for budgets where category ∈ ESSENTIAL_CATEGORIES (current month)
 *
 * WHY pure: unit-testable without DB, deterministic for demo/testing.
 * The orchestrating function getSafeToSpend() (in the same file) fetches from DB
 * and delegates here.
 */

import type { DbAccount } from '@/lib/db/types';
import type { BudgetProgress } from '@/types/finance';

// The four categories whose committed budget reduces Safe-to-Spend.
// Entertainment / Shopping / Other remain discretionary — they ARE what S2S is protecting.
// TODO (v3+ milestone): Move to per-budget is_essential boolean on bb_budgets.
//   Requires ADR + schema migration + RLS update + Settings UI.
export const ESSENTIAL_CATEGORIES = ['Rent', 'Utilities', 'Food', 'Transport'] as const;

type EssentialCategory = typeof ESSENTIAL_CATEGORIES[number];

export function computeSafeToSpend(
  accounts: DbAccount[],
  budgetProgress: BudgetProgress[]
): number {
  // Step 1: Sum only liquid accounts (D-S2S-03).
  // Credit = debt, not money you have. Investment = illiquid.
  const totalBalance = accounts
    .filter(acc => acc.account_type === 'checking' || acc.account_type === 'savings')
    .reduce((sum, acc) => sum + (acc.balance ?? 0), 0);

  // Step 2: Subtract committed essential budget allowances (D-S2S-02).
  // Note: BudgetProgress.remainingAmount is already Math.max(0, limit - spent)
  // (src/lib/budgets/index.ts:174) — so overages contribute 0, never inflate S2S.
  const essentialCommitted = budgetProgress
    .filter(p => (ESSENTIAL_CATEGORIES as readonly string[]).includes(p.budget.category))
    .reduce((sum, p) => sum + p.remainingAmount, 0);

  // Result: can be 0 but never negative (totalBalance may be < essentialCommitted).
  return Math.max(0, totalBalance - essentialCommitted);
}
```

### Example 2: `nameFromEmail` helper

```ts
// Source: derived from CONTEXT.md D-GR-01 [VERIFIED: CONTEXT.md]
// src/utils/greeting.ts

/**
 * Extract a display name from an email address.
 *
 * Algorithm (D-GR-01):
 * 1. Take the local part (before @)
 * 2. Split on any of [._-]
 * 3. Take the first chunk
 * 4. Reject if it doesn't start with a letter (numeric-prefix emails return null)
 * 5. Capitalize first letter, lowercase rest
 *
 * Returns null for unparseable input → caller shows "Good morning." (no name).
 */
export function nameFromEmail(email: string | null | undefined): string | null {
  if (!email || typeof email !== 'string') return null;
  const localPart = email.split('@')[0];
  if (!localPart) return null;

  const firstChunk = localPart.split(/[._-]/)[0];
  if (!firstChunk || !/^[a-zA-Z]/.test(firstChunk)) return null;

  return firstChunk.charAt(0).toUpperCase() + firstChunk.slice(1).toLowerCase();
}
```

### Example 3: `greetingForTime` with `Intl.DateTimeFormat` (robust)

```ts
// Source: derived from CONTEXT.md D-GR-02, D-GR-03 [VERIFIED: CONTEXT.md]
// src/utils/greeting.ts

/**
 * Determine time-of-day band for the greeting (D-GR-02, D-GR-03).
 * Timezone: hardcoded Europe/Berlin — user base is DE-resident; Vercel servers are UTC.
 *
 * Bands:
 * - morning:   05:00–11:59 Berlin time
 * - afternoon: 12:00–17:59 Berlin time
 * - evening:   18:00–04:59 Berlin time (wraps midnight)
 *
 * TODO (future i18n milestone): accept user-preferred timezone from bb_user_settings.
 */
export function greetingForTime(now: Date): 'morning' | 'afternoon' | 'evening' {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Berlin',
    hour: 'numeric',
    hour12: false,
  }).formatToParts(now);

  const hourStr = parts.find(p => p.type === 'hour')?.value ?? '12';
  const hour = parseInt(hourStr, 10);

  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 18) return 'afternoon';
  return 'evening';
}
```

### Example 4: `TransactionItem` component

```tsx
// Source: D-CMP-02 (CONTEXT.md) + UI-SPEC.md visual contract [VERIFIED: CONTEXT.md, UI-SPEC.md]
// src/components/dashboard/TransactionItem.tsx

/**
 * TransactionItem — single transaction row for the Home hub (Phase 8) and Transactions
 * page (Phase 9).
 *
 * Server component — do NOT add "use client". No interactivity.
 *
 * Accepts a view-model (not a raw DbTransaction row). The parent page maps DB → view-model.
 * This decoupling makes the component testable without DB mocking.
 *
 * DESIGN_SYSTEM §5.3: merchant (primary, left) + amount (right, colored) + category · date (secondary line)
 * UI-SPEC typography: merchant text-bb-base weight 400; amount text-bb-base font-bold;
 *   secondary line text-bb-sm text-bb-text-secondary.
 * Note: U+2212 MINUS SIGN (−) for expenses, not hyphen-minus (-).
 */

import { cn } from '@/lib/utils';
import { formatCurrency } from '@/utils/currency';  // renamed from utils/format during planning — see 08-PATTERNS.md "Naming conflict note"
import type { TransactionCategory } from '@/types/finance';

export interface TransactionItemProps {
  merchant: string;
  amount: number;     // positive number; sign rendered from type
  type: 'income' | 'expense';
  category: TransactionCategory;
  date: string;       // ISO 8601; formatted to "14 Apr" inside component
}

export function TransactionItem({ merchant, amount, type, category, date }: TransactionItemProps) {
  // Format: "14 Apr" in German locale (day + short month, no year, per UI-SPEC)
  const formattedDate = new Date(date).toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'short',
  });

  // U+2212 MINUS SIGN for expenses (not hyphen), "+" for income
  const prefix = type === 'income' ? '+' : '−';
  const amountClass = type === 'income' ? 'text-bb-positive' : 'text-bb-negative';

  return (
    <div className="flex flex-col gap-bb-1 py-bb-3 border-b border-bb-border last:border-b-0">
      {/* Primary row: merchant (left) + amount (right) */}
      <div className="flex items-baseline justify-between">
        <span className="text-bb-base text-bb-text">{merchant}</span>
        <span className={cn('text-bb-base font-bold', amountClass)}>
          {prefix}{formatCurrency(amount)}
        </span>
      </div>
      {/* Secondary row: category · date */}
      <div className="flex items-center gap-bb-1">
        <span className="text-bb-sm text-bb-text-secondary">{category}</span>
        <span className="text-bb-sm text-bb-text-secondary">&middot;</span>
        <span className="text-bb-sm text-bb-text-secondary">{formattedDate}</span>
      </div>
    </div>
  );
}
```

### Example 5: `formatCurrency` extracted to `utils/format.ts`

```ts
// Source: existing (bb)/page.tsx lines 316–320 [VERIFIED: codebase]
// src/utils/format.ts

/**
 * Format a number as EUR currency using German locale conventions.
 *
 * Example: formatCurrency(1234.5) → "1.234,50 €"
 *
 * Uses Intl.NumberFormat for correct thousand-separator and decimal rules.
 * Behavior is identical to the inline helper formerly in (bb)/page.tsx.
 *
 * EXTENSION POINT: Add currency parameter when multi-currency is needed (v3+).
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
```

### Example 6: Page-level DB-row → TransactionItemProps mapping

```tsx
// In src/app/(bb)/page.tsx — mapping DbTransaction to TransactionItemProps
// Source: DbTransaction shape from src/lib/db/types.ts [VERIFIED: codebase]
import type { DbTransaction } from '@/lib/db/types';
import type { TransactionItemProps } from '@/components/dashboard/TransactionItem';

function toTransactionItemProps(tx: DbTransaction): TransactionItemProps {
  // Merchant name: prefer description, then creditor/debtor name, fallback
  const merchant = tx.description
    ?? tx.creditor_name
    ?? tx.debtor_name
    ?? 'Transaction';

  return {
    merchant,
    amount: Math.abs(tx.amount),   // TransactionItem renders sign from type
    type: tx.type,                  // DbTransactionType = 'income' | 'expense'
    category: (tx.category ?? 'Other') as TransactionCategory,
    date: tx.booking_date,
  };
}
```

---

## State of the Art

| Old Approach (current page.tsx) | Phase 8 Approach | Rationale |
|----------------------------------|------------------|-----------|
| Sum ALL account balances (`accounts.reduce(...)`) | Sum only `checking` + `savings` accounts | D-S2S-03: credit is debt; investment is illiquid |
| Show full OopsBudgeter dashboard content (donut chart, linked accounts, income/expense KPIs) | 4 sections only per PAGE-01 | Cognitive load reduction — ADHD design principle P1 |
| Hardcoded `text-green-600 dark:text-green-400` colors | `text-bb-positive` / `text-bb-negative` via token system | TOKEN-02: semantic colors with light/dark parity |
| Red banner for DB errors (`border-red-200 bg-red-50`) | Inline `text-bb-text-secondary` note at page bottom | D-CUT-02: calm-over-comprehensive; no anxiety signals |
| "No Banks Linked" dashed section inline with dashboard | Full-screen CTA card replacing entire hub | D-CUT-02: nothing is meaningful without an account |
| `tx.description || "Transaction"` merchant fallback | `tx.description ?? tx.creditor_name ?? tx.debtor_name ?? "Transaction"` | Uses richer PSD2-style fields stored by import pipeline |
| `formatCurrency` inline helper in page file | `utils/format.ts` module | Single source of truth; reused by TransactionItem |
| Greeting: none (shows raw email) | `nameFromEmail(email)` + time-band greeting | ADHD UX: personal, calm first interaction |

**Deprecated in Phase 8 home page (not elsewhere):**
- `getTransactionSummary()` — no longer needed on home; Phase 9 Transactions page uses it
- `getExpensesByCategory()` — SpendingByCategoryChart moves to /budgets (Phase 9)
- `<BudgetProgressSection>` — replaced by compact `BudgetStatusRow` private function; full cards move to /budgets (Phase 9)
- `<SpendingByCategoryChart>` — moved to /budgets (Phase 9); import removed from home
- `<SignOutButton>` — removed from home (settings page is the appropriate home for sign-out)
- Debug user ID paragraph — removed permanently per CONTEXT.md boundary

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `DbAccount.account_type` values in production data are exactly `'checking'`, `'savings'`, `'credit'`, `'investment'` — no other strings | Pattern 3, Safe-to-Spend | If other values exist (e.g. `'business_checking'`), they would be excluded from S2S balance. Low risk: Fake-Finance-API and link-bank flow create accounts with the 4 known types [VERIFIED: src/app/api/link-bank/route.ts line 151 uses `mockAccount.accountType` from the mock which has `AccountType` values]. |
| A2 | `BudgetProgress.remainingAmount` from `calculateAllBudgetProgress()` is already clamped to `Math.max(0, ...)` | Pattern 2, Code Example 1 | If the clamping were removed in a future lib/budgets refactor, Safe-to-Spend would over-subtract and show a lower (more conservative) number — not a dangerous direction, but misleading. [VERIFIED: src/lib/budgets/index.ts:174 — clamping is present]. |
| A3 | `Intl.DateTimeFormat` with `formatToParts` for Europe/Berlin is stable across Vercel's Node.js version | Code Example 3 | Minor risk: ICU data version could vary across Node.js versions. Mitigation: unit tests cover boundary hours and will catch any format regression. |
| A4 | `(bb)/page.tsx` can be fully replaced (no other file imports from it) | §Architecture | If anything imports from `(bb)/page.tsx`, the replacement could break it. [ASSUMED: page files are not typically imported; confirmed the legacy page exports only `default` + `metadata` and no other named exports are used elsewhere — but not grepped exhaustively.] |

**If this table has [ASSUMED] items:** A4 should be verified with a quick grep before the plan executor writes the replacement.

---

## Open Questions

1. **`<BudgetNotificationDialogs>` — remove from home in Phase 8 or leave?**
   - What we know: CONTEXT.md deferred this decision to Phase 9. Phase 8 CONTEXT.md canonical refs say "UNCHANGED" for `BudgetNotificationDialogs.tsx`. The current page.tsx renders it at the top (line 106). The new home page PAGE-01 lists exactly 4 sections — `BudgetNotificationDialogs` is not one of them.
   - What's unclear: If it stays on the home page but outside the 4 sections, does that violate PAGE-01? If it's removed from home entirely, Phase 9 must place it before the phase 9 plan is written.
   - Recommendation: **Remove from home in Phase 8** — it does not belong in the 4-section hub per PAGE-01, and `/settings` is the natural home once Phase 9 expands that page. Add a comment in the new `(bb)/page.tsx`: "// TODO (Phase 9): Re-host BudgetNotificationDialogs on /settings or /budgets."

2. **`utils/format.ts` — does a `src/utils/` directory already exist?**
   - What we know: CLAUDE.md specifies `utils/` as a project directory. No `utils/format.ts` currently exists.
   - Recommendation: Planner should add a Wave 0 task: `mkdir -p src/utils && touch src/utils/format.ts` to create the directory if absent.

---

## Environment Availability

> Phase 8 is a pure code/component change with no new external dependencies. Checking runtime prerequisites only.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `bun` runtime | Build, test, dev | ✓ | (project standard) | None — project rule |
| `next` 15 (App Router) | Server component page | ✓ | 15.2.8 | — |
| `vitest` | Unit tests | ✓ | 4.0.18 | — |
| `@testing-library/react` | Component render tests | ✓ | 16.3.2 | — |
| `Intl.DateTimeFormat` with Europe/Berlin timezone | `greetingForTime()` | ✓ | Node.js built-in (ICU full-icu) | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json`. Section is required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `vitest@4.0.18` + `@testing-library/react@16.3.2` + `jsdom@27.4.0` + `@testing-library/jest-dom@6.9.1` |
| Config file | `vitest.config.ts` (root) — already configured, `include: ["tests/**/*.test.{ts,tsx}"]`, `environment: "jsdom"` [VERIFIED: vitest.config.ts] |
| Quick run command | `bun run test` (runs all vitest tests; scoped to new files: `bun run test tests/lib/ tests/utils/ tests/components/TransactionItem.test.tsx`) |
| Full suite command | `bun run test && bun run typecheck && bun run build` |

**Existing test infrastructure:** `tests/setup.ts` provides `ResizeObserver` stub and `jest-dom` matchers. `tests/components/` has 5 existing test files. Pattern established. No new framework install needed.

**TDD mode is enabled** (`tdd_mode: true` in config.json). All testable modules must have their test file created in Wave 0 BEFORE implementation.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| PAGE-08 | `computeSafeToSpend` returns correct value for empty accounts | unit | `bun run test tests/lib/safe-to-spend.test.ts` | ❌ Wave 0 |
| PAGE-08 | `computeSafeToSpend` with only checking + savings accounts (no credit/investment) | unit | `bun run test tests/lib/safe-to-spend.test.ts` | ❌ Wave 0 |
| PAGE-08 | `computeSafeToSpend` with all-essential budgets, some over-limit (clamp at 0) | unit | `bun run test tests/lib/safe-to-spend.test.ts` | ❌ Wave 0 |
| PAGE-08 | `computeSafeToSpend` with no essential-category budgets (discretionary only) | unit | `bun run test tests/lib/safe-to-spend.test.ts` | ❌ Wave 0 |
| PAGE-08 | `computeSafeToSpend` result is always ≥ 0 (no negatives) | unit | `bun run test tests/lib/safe-to-spend.test.ts` | ❌ Wave 0 |
| PAGE-01 | `nameFromEmail` parses typical email (paul.heuwer@example.com → "Paul") | unit | `bun run test tests/utils/greeting.test.ts` | ❌ Wave 0 |
| PAGE-01 | `nameFromEmail` returns null for numeric-prefix email (123abc@example.com) | unit | `bun run test tests/utils/greeting.test.ts` | ❌ Wave 0 |
| PAGE-01 | `nameFromEmail` returns null for null/undefined/empty input | unit | `bun run test tests/utils/greeting.test.ts` | ❌ Wave 0 |
| PAGE-01 | `greetingForTime` returns 'morning' at 05:00 Berlin, 'morning' at 11:59, NOT at 04:59 | unit | `bun run test tests/utils/greeting.test.ts` | ❌ Wave 0 |
| PAGE-01 | `greetingForTime` returns 'afternoon' at 12:00 Berlin, 'afternoon' at 17:59 | unit | `bun run test tests/utils/greeting.test.ts` | ❌ Wave 0 |
| PAGE-01 | `greetingForTime` returns 'evening' at 18:00 Berlin and at 00:00 Berlin | unit | `bun run test tests/utils/greeting.test.ts` | ❌ Wave 0 |
| PAGE-01 | `formatCurrency` formats 0, positive, and large values as "de-DE EUR" | unit | `bun run test tests/utils/format.test.ts` | ❌ Wave 0 |
| PAGE-03 | `TransactionItem` renders merchant name, positive amount with "+", category, date | unit | `bun run test tests/components/TransactionItem.test.tsx` | ❌ Wave 0 |
| PAGE-03 | `TransactionItem` renders expense amount with "−" (U+2212) and `text-bb-negative` class | unit | `bun run test tests/components/TransactionItem.test.tsx` | ❌ Wave 0 |
| PAGE-03 | `TransactionItem` renders income amount with "+" and `text-bb-positive` class | unit | `bun run test tests/components/TransactionItem.test.tsx` | ❌ Wave 0 |
| PAGE-01–08 | `bun run build` passes with no TypeScript errors | build | `bun run build` | n/a — build gate |
| PAGE-01 | Home page renders 4 sections (hero, budget, transactions, sync button) | browser smoke | manual — navigate to `/` in dev | n/a — server component |
| PAGE-01 | 0-accounts state renders full-screen CTA, not the hub | browser smoke | manual — link-bank, then unlink or use test account with 0 | n/a — manual |
| PAGE-01 | DB error state renders `€—` hero and inline note (no red banner) | browser smoke | manual — disable Supabase connection | n/a — manual |
| PAGE-02 | Budget rows are compact single-line (dot + name + remaining), NOT full progress cards | browser smoke | manual — visual check in browser | n/a — manual |
| PAGE-07 | Home page renders inside PageShell (max-width 768px), no double `<main>` | browser smoke | manual + W3C validator or axe-core dev tool | n/a — manual |

### Nyquist Sampling Rationale

**`computeSafeToSpend` — minimum 5 test cases (Nyquist covers all essential variation axes):**
- Empty accounts (no balance) — boundary
- Only checking accounts (verify savings included, credit excluded)
- Mix of all 4 account types (verify credit/investment exclusion)
- Essential budget fully spent (remaining = 0, contributes 0)
- Essential budget over-budget (remaining already clamped, same result)
- Discretionary-only budgets (contribute nothing to subtraction)
- Month with no budgets at all (S2S = total liquid balance)

**`nameFromEmail` — minimum 5 test cases:**
- Standard format: `paul.heuwer@example.com` → `"Paul"`
- Underscore separator: `paul_h@example.com` → `"Paul"`
- Dash separator: `paul-heuwer@example.com` → `"Paul"`
- Numeric prefix: `123paul@example.com` → `null`
- Single character: `a@example.com` → `"A"`
- Null/undefined/empty → `null`

**`greetingForTime` — minimum 6 test cases (all 3 band boundaries, both sides):**
- 04:59 Berlin → `'evening'`
- 05:00 Berlin → `'morning'`
- 11:59 Berlin → `'morning'`
- 12:00 Berlin → `'afternoon'`
- 17:59 Berlin → `'afternoon'`
- 18:00 Berlin → `'evening'`
- 00:00 Berlin → `'evening'`

**Note on timezone testing:** Tests pass UTC `Date` objects representing known Berlin times. E.g., to test 05:00 Berlin (CET = UTC+1): pass `new Date('2026-01-15T04:00:00Z')`.

### Sampling Rate

- **Per task commit:** `bun run test` (all vitest tests) + `bun run typecheck`
- **Per wave merge:** `bun run test && bun run typecheck && bun run build`
- **Phase gate:** Full suite green + manual browser smoke of home page in all 4 states (normal hub, 0-accounts, 0-budgets, 0-transactions) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/lib/safe-to-spend.test.ts` — covers PAGE-08 (7 test cases for `computeSafeToSpend`)
- [ ] `tests/utils/greeting.test.ts` — covers PAGE-01 greeting (7 `nameFromEmail` cases + 7 `greetingForTime` boundary cases)
- [ ] `tests/utils/format.test.ts` — covers D-CUT-04 (zero, positive, large value, negative-input guard)
- [ ] `tests/components/TransactionItem.test.tsx` — covers PAGE-03 (income rendering, expense rendering, U+2212 minus sign, date format "14 Apr")
- [ ] `src/utils/` directory — may not exist yet; create with first `utils/*.ts` file

**No new framework install required** — vitest, Testing Library, and jsdom are all configured and working.

### TDD Applicability (per `tdd_mode: true`)

| Task Candidate | TDD-Eligible? | Rationale |
|----------------|---------------|-----------|
| `computeSafeToSpend` in `safe-to-spend.ts` | ✓ YES | Pure function of inputs → output. Write all 7 test cases first, then implement. |
| `nameFromEmail` in `greeting.ts` | ✓ YES | Pure string → string | null. Test-first for all edge cases. |
| `greetingForTime` in `greeting.ts` | ✓ YES | Pure Date → band string. Write 7 boundary tests first. |
| `formatCurrency` in `format.ts` | ✓ YES | Pure number → string. Test-first; trivial to implement after. |
| `TransactionItem` component | ✓ YES | Pure presentational render. Write render tests first for income/expense/date cases. |
| `BudgetStatusRow` private fn in `page.tsx` | partial | Private function; test via the page render test or extract as named helper with direct test. Recommended: extract as named function, write unit test. |
| `(bb)/page.tsx` page itself (server component) | ✗ NO | Server component with async DB calls; cannot unit-test without mocking Supabase. Verify via `bun run build` + manual browser smoke. The `tests/smoke/imports.test.ts` pattern (dynamic import check) can verify the module loads cleanly. |

---

## Security Domain

> `security_enforcement` defaults to enabled (absent = enabled).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (existing) | Supabase Auth via `src/middleware.ts` — Phase 8 does NOT modify middleware. `getUser()` in the server page safely returns `null` if session is invalid; the middleware already redirects unauthenticated requests. |
| V3 Session Management | yes (existing) | Supabase session cookies — Phase 8 does NOT modify auth or session handling. |
| V4 Access Control | yes (existing) | RLS on all `bb_*` tables means even if auth slips through, DB queries return empty for the wrong user. Phase 8 adds no new DB queries that bypass this. |
| V5 Input Validation | no | Phase 8 accepts no user input. The home page is read-only. `SyncTransactionsButton` triggers an API call but that component is unchanged. |
| V6 Cryptography | no | No cryptographic operations in Phase 8. |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| User email displayed to the browser (greeting uses email-derived name) | Information Disclosure | `nameFromEmail` strips the domain and extracts only the local name fragment — never shows full email. Middleware guarantees the user is authenticated to their own data before the page renders. |
| `computeSafeToSpend` showing incorrect balance due to type confusion | Tampering | `DbAccount.account_type` is a `string` from the DB; filtering uses exact string comparison, not type coercion. Unit tests cover the filter logic. |

---

## Sources

### Primary (HIGH confidence — verified in this codebase)
- `src/app/(bb)/page.tsx` — current dashboard data-fetch pattern (try/catch, Promise.all, formatCurrency inline helper), line references throughout
- `src/app/(bb)/layout.tsx` — confirms `<PageShell>` wraps all `(bb)` pages; no second shell needed
- `src/lib/budgets/index.ts:158–192` — `calculateAllBudgetProgress()` return shape; line 174 confirms `Math.max(0, ...)` clamping
- `src/lib/budgets/index.ts:58` — `getCurrentMonthStart()` helper
- `src/lib/db/accounts.ts:25` — `getAccounts()` return type `DbAccount[]`
- `src/lib/db/transactions.ts:140` — `getRecentTransactions(limit)` return type `DbTransaction[]`
- `src/lib/auth/index.ts:77` — `getUser()` returns `AuthUser | null` with `{ id, email, createdAt }`
- `src/lib/db/types.ts:19–31` — `DbAccount.account_type` is `string` (not typed enum); `DbTransaction` shape
- `src/types/finance.ts:33–44` — `ExpenseCategory`, `AccountType`, `BudgetProgress` shape
- `src/components/dashboard/SyncTransactionsButton.tsx` — `accountCount` prop; 0-count renders "Link a Bank" button (line 80); `className?: string` optional
- `src/components/layout/PageShell.tsx` — renders `<main>` (line 46); `className` prop available
- `src/components/layout/PageHeader.tsx` — `title`, `subtitle?`, `className?` props
- `src/app/globals.css` — all `--bb-*` tokens confirmed wired as Tailwind utilities via `@theme inline`
- `components.json` — `style: "new-york"`, `baseColor: "zinc"`, `cssVariables: true`, `rsc: true`
- `vitest.config.ts` + `tests/setup.ts` — test framework configured
- `.planning/config.json` — `nyquist_validation: true`, `tdd_mode: true`

### Secondary (MEDIUM confidence — from planning documents verified against codebase)
- `.planning/phases/08-home-hub/08-CONTEXT.md` — 14 locked decisions; all cross-checked against live code
- `.planning/phases/08-home-hub/08-UI-SPEC.md` — visual contracts; all token names verified against globals.css
- `.planning/phases/07-layout-shell-navigation/07-RESEARCH.md` — Phase 7 pitfall list (Pitfall 4, 5 carried forward); Validation Architecture section used as model

### Tertiary (LOW confidence — no items)

---

## Metadata

**Confidence breakdown:**
- Standard Stack: HIGH — no new packages; all existing; versions from package.json
- Architecture: HIGH — server component pattern verified from existing page.tsx; layout composition verified from layout.tsx
- Pure logic modules: HIGH — pure functions with locked formulas from CONTEXT.md; unit-testable
- Pitfalls: HIGH — verified against codebase (account_type field name, SyncTransactionsButton behavior, PageShell ownership of `<main>`)
- Validation Architecture: HIGH — vitest infrastructure confirmed working; test patterns verified from existing test files

**Research date:** 2026-05-20
**Valid until:** 2026-06-20 (stable — no external dependency changes expected; formula locked in CONTEXT.md)
