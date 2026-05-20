---
phase: 08-home-hub
plan: "05"
subsystem: home-page
tags: [phase-8, home-hub, page-rewrite, composition, server-component, wave-3, final]

dependency_graph:
  requires:
    - "08-01"  # src/lib/safe-to-spend.ts (computeSafeToSpend)
    - "08-02"  # src/utils/greeting.ts (nameFromEmail, greetingForTime)
    - "08-03"  # src/utils/currency.ts (formatCurrency)
    - "08-04"  # src/components/dashboard/TransactionItem.tsx (TransactionItem, TransactionItemProps)
  provides:
    - "Home hub page (4 sections, all edge states, PAGE-01/02/03/07/08)"
  affects:
    - "All authenticated users landing at /"
    - "Phase 9 spoke pages (budgets, transactions, settings) — TODO pointer left for BudgetNotificationDialogs"

tech_stack:
  added: []
  patterns:
    - "Server component (no use client) — data-fetch happens server-side"
    - "Promise.all for 3 parallel DB calls (getAccounts + getRecentTransactions + calculateAllBudgetProgress)"
    - "view-model mapping (DbTransaction → TransactionItemProps) in the page"
    - "Private inline function component (BudgetStatusRow) — D-CMP-03"
    - "Europe/Berlin timezone via greetingForTime(new Date()) — D-GR-03"
    - "4 edge states: 0-accounts (full-screen CTA), 0-budgets (inline link), 0-transactions (inline+sync), DB error (inline note)"

key_files:
  created: []
  modified:
    - "src/app/(bb)/page.tsx   — full rewrite per D-CUT-01 (legacy 349-line dashboard → 461-line calm hub)"
    - "src/lib/safe-to-spend.ts — removed unused EssentialCategory type (ESLint no-unused-vars fix)"

decisions:
  - "BudgetNotificationDialogs removed from home page with TODO pointing to Phase 9 (/settings or /budgets)"
  - "0-accounts CTA uses direct Link+Button, NOT SyncTransactionsButton (RESEARCH Pitfall 7 — the component renders 'Link a Bank' at accountCount=0 which is the wrong UX inside a dedicated full-screen card)"
  - "Safe-to-Spend hero always text-bb-text (neutral), never colored red/green (UI-SPEC Hero color rule — no anxiety signals)"
  - "BudgetStatusRow defined as private inline function in page.tsx (D-CMP-03) — used exactly once"
  - "key prop for TransactionItem synthesized from merchant+date+idx (view-model has no id field); Phase 9 may add id"
  - "Greeting timezone: new Date() passed to greetingForTime() which handles Berlin projection internally via Intl.DateTimeFormat.formatToParts() — page does not construct a Berlin Date"

metrics:
  duration: "~25 minutes"
  completed: "2026-05-20"
  tasks_completed: 1
  files_created: 0
  files_modified: 2
---

# Phase 08 Plan 05: Home Hub Page Rewrite Summary

**One-liner:** Full rewrite of `(bb)/page.tsx` as a 4-section calm hub composing all Phase 8 modules — greeting+S2S hero, compact budget rows, TransactionItem list, sync button — with all 4 edge states (0-accounts full-screen CTA, 0-budgets inline, 0-transactions inline+sync, DB error inline note) and a passing `bun run build`.

---

## What Was Built

`src/app/(bb)/page.tsx` was replaced outright (D-CUT-01) — the 349-line legacy dashboard with donut charts, income/expense KPIs, linked accounts table, and red error banners became a 461-line calm hub with:

1. **Greeting + Safe-to-Spend hero** (Section 1): Time-aware greeting from `greetingForTime()` + `nameFromEmail()`, hero EUR number from `computeSafeToSpend()`. Always neutral `text-bb-text` — no anxiety-inducing color coding.

2. **Compact budget status indicators** (Section 2): Private `BudgetStatusRow` function — traffic-light dot (8px, `--bb-positive/caution/negative`) + category name + remaining EUR. Alphabetically sorted. NOT the full `BudgetProgressSection` cards (those move to /budgets, Phase 9).

3. **Recent transactions** (Section 3): `TransactionItem` view-model pattern. DB rows mapped via `toTransactionItemProps()` before passing to the component — decoupled from schema.

4. **Sync Transactions button** (Section 4): Full-width `SyncTransactionsButton` — the single primary action per view.

---

## Commits

| Hash | Message |
|------|---------|
| `9ff565a` | feat(08-05): rewrite (bb)/page.tsx as calm Home hub (4-section composition) |

---

## Build Gate Results

```
bun run build  → ✓ Compiled successfully (26/26 static pages)
bun run typecheck → tsc --noEmit (exit 0)
bun run test   → 11 test files, 85 tests PASSED
```

**Final 10 lines of bun run build output:**
```
Route (app)                                 Size  First Load JS
┌ ƒ /                                    6.62 kB         242 kB
...
 ✓ Generating static pages (26/26)
   Finalizing page optimization ...
   Collecting build traces ...
```

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused `EssentialCategory` type in `src/lib/safe-to-spend.ts`**
- **Found during:** Task 1, first build attempt
- **Issue:** `type EssentialCategory = typeof ESSENTIAL_CATEGORIES[number]` on line 70 was defined but never used — ESLint `@typescript-eslint/no-unused-vars` error blocked `bun run build` with exit code 1.
- **Fix:** Removed the `type EssentialCategory` declaration. The type was purely documentary (the filter uses `as readonly string[]` inline cast instead). No functional change.
- **Files modified:** `src/lib/safe-to-spend.ts`
- **Commit:** included in `9ff565a`

**2. [Rule 3 - Blocking] Missing `.env.local` in worktree**
- **Found during:** Task 1, second build attempt
- **Issue:** Worktree had no `.env.local` — Next.js static generation phase failed with "Missing Supabase environment variables" for pages that call `createServerSupabaseClient()` at build time.
- **Fix:** Copied `.env.local` from main repo to worktree. Not committed (`.env.local` is in `.gitignore`).
- **Impact:** No code changes. Environment setup only.

**3. [Worktree reset] Base commit was behind master**
- **Found during:** Startup
- **Issue:** Worktree branch was at `5e787a3` (old UI-tests commit) but the plan depends on Wave 1/2 modules (08-01 through 08-04). `<worktree_branch_check>` specified reset to `dbe83887`.
- **Fix:** `git reset --hard dbe83887bcd4c60c572238137e540eeb14f3c5d8` — brought worktree to Phase 8 Wave 1/2 baseline.
- **Impact:** All required modules (`safe-to-spend.ts`, `greeting.ts`, `currency.ts`, `TransactionItem.tsx`) became available.

---

## Phase 8 Success Criteria — Final Status

| # | Criterion | Status |
|---|-----------|--------|
| 1 | 4 sections in order (greeting+S2S, budget status, transactions, sync) | ✅ PASS |
| 2 | Safe-to-Spend value from `lib/safe-to-spend.ts` (not raw balance sum) | ✅ PASS |
| 3 | Compact single-line budget rows (not full BudgetProgressSection cards) | ✅ PASS |
| 4 | Uses PageShell layout from `(bb)/layout.tsx` (page does NOT re-wrap) | ✅ PASS |
| 5 | `bun run build` passes | ✅ PASS |

---

## Requirements Satisfied

| ID | Description | Status |
|----|-------------|--------|
| PAGE-01 | Home page exactly 4 sections in locked order | ✅ |
| PAGE-02 | Compact single-line budget indicators (NOT full progress cards) | ✅ |
| PAGE-03 | TransactionItem pattern (merchant + amount + category + date, no icons) | ✅ |
| PAGE-07 | PageShell layout from Phase 7 (no double `<main>`) | ✅ |
| PAGE-08 | Consumes `computeSafeToSpend` from `lib/safe-to-spend.ts` | ✅ |

---

## Acceptance Criteria Verification

| Check | Result |
|-------|--------|
| File contains `"Safe to spend this month"`, `"Budget status"`, `"Recent transactions"` | ✅ |
| File contains `"Link your bank to get started"` (0-accounts heading) | ✅ |
| File contains exactly 1 `<PageHeader title="Home" />` instance | ✅ (count=1) |
| File does NOT contain `<PageShell` as JSX | ✅ (only in comment) |
| File does NOT contain `BudgetProgressSection` / `SpendingByCategoryChart` / etc. in code | ✅ |
| File imports `computeSafeToSpend` from `@/lib/safe-to-spend` | ✅ |
| File imports `nameFromEmail`, `greetingForTime` from `@/utils/greeting` | ✅ |
| File imports `formatCurrency` from `@/utils/currency` | ✅ |
| File imports `TransactionItem` from `@/components/dashboard` | ✅ |
| File contains `Promise.all([` (exactly one actual call) | ✅ |
| File contains `if (accounts.length === 0` early-return guard | ✅ |
| File contains `Couldn't load data. Try refreshing.` inline note | ✅ |
| File does NOT contain `border-red-` / `bg-red-` / `text-red-` / `text-green-` / `text-gray-` in code | ✅ |
| File does NOT contain `font-medium` or `text-bb-xs` in code | ✅ |
| No `"use client"` at file top | ✅ |
| `BudgetStatusRow` defined as private function in this file | ✅ |
| Phase 9 TODO for `BudgetNotificationDialogs` present | ✅ |
| `bun run build` exits 0 | ✅ |
| `bun run typecheck` exits 0 | ✅ |
| `bun run test` 85/85 green | ✅ |

---

## Known Stubs

None — all four sections render from real data sources. The `// TODO (Phase 9)` comment for `BudgetNotificationDialogs` is a tracked deferral, not a stub that affects the plan's goal.

The 0-budgets link `/settings` is a forward link to a Phase 9 destination (the settings page exists but the Budget Settings UI is not yet expanded). This is intentional and documented in CONTEXT D-CUT-03.

---

## Threat Flags

No new security-relevant surface introduced. Existing DB calls, middleware protection, and RLS remain unchanged. The `dataError` message is never rendered to the UI (STRIDE T-08-05-01 mitigated).

---

## Features for Phase 9/10/11 Backlog

| Feature | Why Deferred | Target Phase |
|---------|-------------|--------------|
| `BudgetNotificationDialogs` re-hosting | Belongs on /settings or /budgets where budget editing lives | Phase 9 |
| `/budgets` spoke page | BudgetProgressSection (full cards) + SpendingByCategoryChart moved here | Phase 9 |
| `/transactions` spoke page | getTransactionSummary + income/expense KPIs moved here | Phase 9 |
| Expanded `/settings` for budget editing | Link target for 0-budgets CTA already points here | Phase 9 |
| KPICard generic primitive | Hero card and budget status rows will be refactored to consume it | Phase 10 |
| EmptyState primitive with dashed border | 0-budgets / 0-transactions inline states currently use plain text | Phase 10 |
| TransactionItemProps.id | Stable key for list animations; Phase 9 /transactions may need it | Phase 9/10 |
| Motion system / reduced-motion | MOTION-01, MOTION-02 | Phase 11 |
| WCAG 2.2 AA audit | A11Y-01 | Phase 11 |
| Final copy pass (shame test) | Placeholder copy ships readable; Phase 11 refines | Phase 11 |
| User-controlled timezone in greetingForTime() | Hardcoded Europe/Berlin for v2.0 school-project scope | Future i18n |

---

## Self-Check

```bash
# File exists
[ -f src/app/(bb)/page.tsx ] → FOUND

# Commit exists
git log --oneline | grep 9ff565a → FOUND: feat(08-05): rewrite (bb)/page.tsx as calm Home hub
```

## Self-Check: PASSED
