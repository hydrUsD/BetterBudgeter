---
phase: 8
slug: home-hub
status: human_needed
verified: 2026-05-20T18:28:00Z
verifier: gsd-verifier
score: 5/5 roadmap success criteria verified
overrides_applied: 0
human_verification:
  - test: "Hub renders the calm 4-section layout in a real browser"
    expected: "4 sections visible at 375px, 768px, and 1280px; PageShell centered at >=768px; TabBar visible at bottom"
    why_human: "Visual rendering, max-width centering, and tab bar spacing require real browser pixels — cannot be asserted by grep or unit tests"
  - test: "0-accounts state replaces hub with full-screen 'Link your bank' CTA"
    expected: "Sign in as fresh user (no accounts in Supabase). Open /. Hub is entirely replaced by the centered card; no section cards visible."
    why_human: "Requires a live DB with zero linked accounts; cannot be replicated in unit tests"
  - test: "DB error state shows euro-dash hero and inline note — no red banner"
    expected: "Hero shows '€—'; 'Couldn't load data. Try refreshing.' at page bottom; NO red banner at top"
    why_human: "Requires deliberately breaking getAccounts() (e.g. revoke RLS) — not automatable"
  - test: "Dark-mode parity: hero number, traffic-light dots, inline note are all readable"
    expected: "Toggle dark mode; hero text on --bb-bg-dark is legible; traffic-light dots visible; error note legible"
    why_human: "CSS variable contrast requires visual inspection; automated contrast audit is Phase 11"
---

# Phase 8: Home Hub — Verification Report

**Phase Goal:** The Home page (`/`) delivers the hub experience — a Safe-to-Spend hero metric computed from real account data, a compact one-line-per-budget status indicator, a short recent-transaction list, and a Sync button. Everything else that was on the old dashboard is moved to its spoke page.
**Verified:** 2026-05-20T18:28:00Z
**Status:** human_needed (all 5 automated criteria PASS; 4 items require browser/DB smoke testing)
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| SC-1 | Home page displays exactly 4 sections in locked order: greeting+S2S hero, compact budget status indicators, 3–5 most recent transactions, "Sync Transactions" button | VERIFIED | `src/app/(bb)/page.tsx` lines 337–445: 4 `<section>` elements in exact spec order inside `<div className="flex flex-col gap-bb-8">`. Section 4 (Sync button) sits outside a `<section>` wrapper but is the 4th child — consistent with UI-SPEC §Section 4 "no card wrapper". |
| SC-2 | Safe-to-Spend value is computed by `lib/safe-to-spend.ts` (not raw balance) and shows a meaningful number when transactions exist | VERIFIED | `page.tsx:68` imports `computeSafeToSpend` from `@/lib/safe-to-spend`; line 275: `computeSafeToSpend(accounts, budgetProgress)`. `safe-to-spend.ts` filters liquid accounts (`account_type === "checking" \|\| "savings"`) and subtracts essential-category remainders. 11/11 unit tests pass. |
| SC-3 | Budget status indicators are compact single-line elements (NOT full Budget Progress Cards) | VERIFIED | `BudgetStatusRow` is a private function inside `page.tsx` (line 187). No import of `BudgetProgressSection` — confirmed by grep. Each row renders a single `<div className="flex items-center gap-bb-2 py-bb-2">` per budget. |
| SC-4 | Page uses PageShell layout (max-width 768px, correct spacing from token scale) | VERIFIED | `(bb)/layout.tsx` wraps ALL BB pages in `<PageShell>`. `page.tsx` does NOT contain `<PageShell` in JSX (grep confirmed — only referenced in a comment on line 322). No double-wrap. Spacing uses `gap-bb-8`, `p-bb-5`, `mt-bb-2`, `mt-bb-8` from token scale. |
| SC-5 | `bun run build` passes with no errors | VERIFIED | `bun run build` exits 0. "Compiled successfully", "26/26 static pages generated". The `[home] Error fetching data: DYNAMIC_SERVER_USAGE` log during static generation is expected — the route correctly renders as `ƒ` (Dynamic) because it uses `cookies()` via Supabase auth. Not a build error. `bun run typecheck` also exits 0 (tsc --noEmit with no output). |

**Score:** 5/5 roadmap success criteria verified

---

### Deferred Items

No items identified as deferred to a later phase. All Phase 8 deliverables are present.

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/app/(bb)/page.tsx` | Full hub rewrite — 4 sections, all edge states | VERIFIED | 461 lines; all imports wired; all 4 edge states implemented (0-accounts, 0-budgets, 0-transactions, DB error) |
| `src/lib/safe-to-spend.ts` | Pure computation — no DB calls | VERIFIED | 130 lines; exports `computeSafeToSpend` + `ESSENTIAL_CATEGORIES`; pure function with no side effects |
| `src/utils/greeting.ts` | `nameFromEmail` + `greetingForTime` | VERIFIED | 129 lines; both exports present; Europe/Berlin hardcoded via `Intl.DateTimeFormat` |
| `src/utils/currency.ts` | `formatCurrency` (de-DE EUR) | VERIFIED | 48 lines; single export; behavior byte-identical to legacy inline |
| `src/components/dashboard/TransactionItem.tsx` | View-model presentational component | VERIFIED | 157 lines; no `"use client"`; accepts `TransactionItemProps` (not raw DB row) |
| `src/components/dashboard/index.ts` | Barrel export including `TransactionItem` | VERIFIED | Line 57: `export { TransactionItem, type TransactionItemProps } from "./TransactionItem"` |
| `tests/lib/safe-to-spend.test.ts` | 11 unit tests | VERIFIED | 11 tests pass (runner-confirmed) |
| `tests/utils/greeting.test.ts` | 18 unit tests | VERIFIED | 18 tests pass (runner-confirmed) |
| `tests/utils/currency.test.ts` | 5 unit tests | VERIFIED | 5 tests pass (runner-confirmed) |
| `tests/components/TransactionItem.test.tsx` | 14 render tests | VERIFIED | 14 tests pass (runner-confirmed) |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `(bb)/page.tsx` | `lib/safe-to-spend.ts` | `import { computeSafeToSpend }` line 68, called line 275 | VERIFIED | Import present; result assigned to `safeToSpend`; rendered on line 365 |
| `(bb)/page.tsx` | `utils/greeting.ts` | `import { nameFromEmail, greetingForTime }` line 70, called lines 264 + 270 | VERIFIED | Both functions called; result fed to `buildGreeting()`; rendered line 341 |
| `(bb)/page.tsx` | `utils/currency.ts` | `import { formatCurrency }` line 71, called lines 210, 362, 365 | VERIFIED | 3 call sites; all render dynamic values |
| `(bb)/page.tsx` | `components/dashboard/TransactionItem` | imported via barrel `@/components/dashboard` line 77; used lines 429–433 | VERIFIED | Used in `.map()` render; not orphaned |
| `(bb)/page.tsx` | `(bb)/layout.tsx` (PageShell) | Layout wraps page automatically via Next.js route groups | VERIFIED | `(bb)/layout.tsx` uses `<PageShell>` on all children; page does not double-wrap |
| `TransactionItem.tsx` | `utils/currency.ts` | `import { formatCurrency }` line 46, called line 142 | VERIFIED | Single import; called in render |
| `page.tsx` Promise.all | `getAccounts` + `getRecentTransactions` + `calculateAllBudgetProgress` | `Promise.all([...])` lines 248–252 | VERIFIED | All 3 DB calls parallelized; result destructured correctly |

---

## Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|-------------------|--------|
| `(bb)/page.tsx` — hero EUR number | `safeToSpend` | `computeSafeToSpend(accounts, budgetProgress)` — pure function over `getAccounts()` + `calculateAllBudgetProgress()` DB results | Yes — liquid account balances minus essential budget remainders from real DB | FLOWING |
| `(bb)/page.tsx` — greeting line | `greeting` | `buildGreeting(nameFromEmail(user?.email), new Date())` — real user from `getUser()` | Yes — user email from Supabase auth; `new Date()` server-per-request | FLOWING |
| `(bb)/page.tsx` — budget status rows | `sortedBudgets` | `calculateAllBudgetProgress()` → `budgetProgress` from DB | Yes — real `bb_budgets` rows with monthly spend calculation | FLOWING |
| `(bb)/page.tsx` — transaction list | `transactionItems` | `getRecentTransactions(5)` → `recentTransactions.map(toTransactionItemProps)` | Yes — real `bb_transactions` rows mapped to view-model | FLOWING |

---

## Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `bun run test` (all 85 tests) | `bun run test 2>&1` | 11 files, 85 tests, 0 failures | PASS |
| `bun run typecheck` | `bun run typecheck 2>&1` | tsc --noEmit, exit 0, no output | PASS |
| `bun run build` | `bun run build 2>&1` | "Compiled successfully", 26/26 pages | PASS |
| Module exports `computeSafeToSpend` | Verified by test: `import { computeSafeToSpend } from "@/lib/safe-to-spend"` in test file | 11 passing tests | PASS |
| Module exports `nameFromEmail` + `greetingForTime` | Verified by test: `import { nameFromEmail, greetingForTime } from "@/utils/greeting"` | 18 passing tests | PASS |
| `formatCurrency(1234.5)` returns `"1.234,50 €"` | Verified by unit test | PASS | PASS |

---

## Probe Execution

No `scripts/*/tests/probe-*.sh` files discovered for Phase 8. Phase 8 VALIDATION.md specifies vitest-based automated verification (not shell probes). No probe execution section applicable.

---

## Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| PAGE-01 | 08-05-PLAN | Home page 4 sections in locked order | SATISFIED | `page.tsx` sections at lines 337, 375, 408, 445 in exact spec order |
| PAGE-02 | 08-05-PLAN | Budget status as compact single-line elements, NOT full progress cards | SATISFIED | `BudgetStatusRow` private function (line 187); no `BudgetProgressSection` import |
| PAGE-03 | 08-04-PLAN | TransactionItem pattern (merchant + amount + category + date, no icons) | SATISFIED | `TransactionItem.tsx` renders 2-line layout; no SVG elements (test verifies); `cn("text-bb-negative")` confirms no icons |
| PAGE-07 | 08-05-PLAN | PageShell layout (max-width 768px, `--bb-space-*` tokens) | SATISFIED | `(bb)/layout.tsx` provides PageShell; page uses `gap-bb-8`, `p-bb-5`, `mt-bb-2`, `mt-bb-8` |
| PAGE-08 | 08-01-PLAN | `lib/safe-to-spend.ts` with formula + comments | SATISFIED | File at `src/lib/safe-to-spend.ts`; formula documented; ESSENTIAL_CATEGORIES const; limitations listed; v3+ TODO present |

---

## Focus Invariants — Context Decisions

| Decision | Status | Evidence |
|----------|--------|---------|
| D-S2S-01: `ESSENTIAL_CATEGORIES = ['Rent', 'Utilities', 'Food', 'Transport'] as const` | VERIFIED | `safe-to-spend.ts` lines 62–67: exact 4 values, `as const` on line 67; ESSENTIAL_CATEGORIES test verifies `["Rent","Utilities","Food","Transport"]` |
| D-S2S-02: `remainingAmount` used directly — NOT re-clamped inside `essentialCommitted` | VERIFIED | `safe-to-spend.ts` line 116: `.reduce((sum, p) => sum + p.remainingAmount, 0)` — no `Math.max(0, ...)` wrapper around `p.remainingAmount`; only final result is clamped (line 123) |
| D-S2S-03: `acc.account_type` (snake_case) filter for `"checking"` and `"savings"` | VERIFIED | `safe-to-spend.ts` line 102: `acc.account_type === "checking" \|\| acc.account_type === "savings"` — exact literals and exact snake_case field name |
| D-GR-01/02: `nameFromEmail` + `greetingForTime` in `utils/greeting.ts` | VERIFIED | Both exports present; 10 nameFromEmail tests + 8 greetingForTime tests all green |
| D-GR-03: Europe/Berlin timezone in `greetingForTime` | VERIFIED | `greeting.ts` line 113: `timeZone: "Europe/Berlin"` in Intl.DateTimeFormat; DST test (greeting.test.ts line 138) verifies live TZ handling |
| D-GR-04: Greeting computed server-side per request | VERIFIED | `page.tsx` is a server component (no `"use client"`); `buildGreeting(name, new Date())` called directly in page render |
| D-CMP-01: `TransactionItem` as separate file; SafeToSpend hero + BudgetStatusRow inline in page.tsx | VERIFIED | `TransactionItem.tsx` is a standalone file; hero and `BudgetStatusRow` are inline in `page.tsx` |
| D-CMP-02: `TransactionItem` accepts view-model props (merchant, amount, type, category, date) | VERIFIED | `TransactionItem.tsx` lines 59–88: `TransactionItemProps` interface with exact 5 fields; no DbTransaction import |
| D-CMP-03: `BudgetStatusRow` as private function inside page.tsx | VERIFIED | `page.tsx` line 187: `function BudgetStatusRow(...)` — not exported, not in a separate file; used exactly once (line 397) |
| D-CUT-01: page.tsx replaced outright; legacy components removed | VERIFIED | No import of `BudgetProgressSection`, `SpendingByCategoryChart`, `BudgetNotificationDialogs`, or `<p>User ID:</p>` in page.tsx (grep confirmed) |
| D-CUT-02: 4 edge states implemented | VERIFIED | 0-accounts (line 299 early return with full-screen CTA); 0-budgets (line 378); 0-transactions (line 411); DB error (line 454 inline note) |
| D-CUT-03: 0-budgets link targets `/settings` | VERIFIED | `page.tsx` line 387: `href="/settings"` |
| D-CUT-04: `formatCurrency` in `src/utils/currency.ts` (NOT `format.ts`); imported via `@/utils/currency` | VERIFIED | File at `src/utils/currency.ts`; `page.tsx` line 71: `import { formatCurrency } from "@/utils/currency"`; `TransactionItem.tsx` line 46: same import path |
| Pitfall 7: 0-accounts CTA uses `<Link href="/link-bank"><Button>` NOT `<SyncTransactionsButton>` | VERIFIED | `page.tsx` line 312: `<Link href="/link-bank">` wrapping `<Button>Link your bank</Button>` inside the 0-accounts guard block |
| Promise.all parallelization for 3 DB calls | VERIFIED | `page.tsx` lines 248–252: `Promise.all([getAccounts(), getRecentTransactions(5), calculateAllBudgetProgress()])` |
| PageShell NOT double-wrapped in page.tsx | VERIFIED | Grep finds no `<PageShell` JSX in page.tsx — only a reference in a comment (line 322) |
| No `@radix-ui` imports in Phase 8 BB files | VERIFIED | Grep of `src/app/(bb)/`, `src/lib/safe-to-spend.ts`, `src/utils/`, `src/components/dashboard/TransactionItem.tsx` returns no matches |
| OopsBudgeter preservation (legacy route untouched) | VERIFIED | `git diff 02f92e4..65d65ee --name-only` shows zero changes to any `src/app/(legacy)/` file |

---

## Test Coverage Verification

| File | Expected Tests | Actual Tests (Runner) | Status |
|------|---------------|----------------------|--------|
| `tests/lib/safe-to-spend.test.ts` | 11 | 11 | PASS |
| `tests/utils/greeting.test.ts` | 18 | 18 | PASS |
| `tests/utils/currency.test.ts` | 5 | 5 | PASS |
| `tests/components/TransactionItem.test.tsx` | 14 | 14 | PASS |
| **Total Phase 8 new tests** | **48** | **48** | **PASS** |

All 85 tests in the full suite pass (48 Phase 8 new + 37 pre-existing from Phases 6–7).

---

## Anti-Patterns Found

Grep for TBD, FIXME, XXX across all 5 Phase 8 source files: **none found.**

`TODO` markers present in Phase 8 files are intentional forward-reference deferred items (v3+ milestone, Phase 9, future i18n) — not unresolved work. They match the debt-marker gate exception: each TODO is clearly scoped to a named future milestone or phase.

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `safe-to-spend.ts` | 31 | `TODO (v3+ milestone)` | Info | Tracked deferral per CONTEXT.md "Deferred Ideas" — not a blocker |
| `greeting.ts` | 52 | `TODO (future)` | Info | Tracked deferral for display_name source |
| `greeting.ts` | 101 | `TODO (future i18n milestone)` | Info | Tracked deferral |
| `page.tsx` | 53 | `// TODO (Phase 9)` | Info | BudgetNotificationDialogs re-hosting — tracked in SUMMARY |

No stub patterns, no hardcoded empty data passed to renderers, no `return null` / `return {}` implementations.

---

## Human Verification Required

### 1. Hub Visual Layout at Multiple Viewports

**Test:** Run `bun dev`. Sign in. Open `/` in Chrome DevTools at 375px (mobile), 768px (tablet boundary), and 1280px (desktop). Verify: 4 sections visible in order; PageShell content is centered with max-width 768px at >=768px; TabBar is visible and not overlapping the Sync button.

**Expected:** Calm single-column layout; no horizontal scroll; section cards separated by ~32px gap; Sync button not obscured by TabBar.

**Why human:** Visual layout, max-width behavior, and safe-area inset bottom clearance cannot be verified by grep or unit tests.

---

### 2. 0-Accounts Edge State (Full-Screen CTA)

**Test:** Sign in as a fresh user who has no linked accounts (create one in Supabase dashboard or use a dedicated test email). Open `/`.

**Expected:** The hub is entirely replaced by a centered dashed card with heading "Link your bank to get started", one-sentence body copy, and a single "Link your bank" button pointing to `/link-bank`. No section cards are visible.

**Why human:** Requires a live Supabase DB with zero `bb_accounts` rows for the test user.

---

### 3. DB Error Edge State (Inline Note, No Red Banner)

**Test:** Temporarily break `getAccounts()` (e.g. temporarily revoke SELECT on `bb_accounts` via RLS or drop the network). Open `/`.

**Expected:** Hero shows "€—" in secondary text color. Budget status section shows 0-budgets inline state. Transactions section shows 0-transactions inline state. At the bottom of the page (below the Sync button): "Couldn't load data. Try refreshing." in small secondary text. NO red banner at the top of the page.

**Why human:** Requires deliberately inducing a DB error, which cannot be automated without side effects. Restoring RLS after the test is manual.

---

### 4. Dark-Mode Parity

**Test:** Toggle dark mode via the existing theme toggle. View `/`.

**Expected:** Hero EUR number readable on `--bb-bg` dark background; traffic-light dots (positive/caution/negative) visible against dark card surfaces; inline error note legible; no white-text-on-white-background or invisible elements.

**Why human:** CSS variable contrast requires visual inspection. Automated contrast audit tooling (axe, Lighthouse) is Phase 11 scope per VALIDATION.md.

---

## Gaps Summary

No gaps. All 5 roadmap success criteria are verified in code. All 5 phase requirements (PAGE-01 through PAGE-03, PAGE-07, PAGE-08) are satisfied. All 14 CONTEXT.md locked decisions are honored. Build, typecheck, and full test suite pass. The `human_needed` status reflects the 4 manual browser/DB smoke tests specified in VALIDATION.md §Manual-Only Verifications — these are planned manual checks, not discovered defects.

---

_Verified: 2026-05-20T18:28:00Z_
_Verifier: Claude (gsd-verifier)_
