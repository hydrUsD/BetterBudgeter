---
phase: 08-home-hub
plan: "01"
subsystem: lib/safe-to-spend
tags: [phase-8, home-hub, safe-to-spend, tdd, business-logic, pure-function]
completed: "2026-05-20T15:59:12Z"

dependency_graph:
  requires:
    - "08-00 (Wave 0 TDD scaffold — stub test file)"
    - "src/lib/db/types.ts (DbAccount interface)"
    - "src/types/finance.ts (BudgetProgress interface)"
  provides:
    - "src/lib/safe-to-spend.ts — pure Safe-to-Spend calculation (PAGE-08)"
    - "ESSENTIAL_CATEGORIES const — locked by D-S2S-01"
    - "computeSafeToSpend function — consumed by (bb)/page.tsx in Wave 3"
  affects:
    - "src/app/(bb)/page.tsx — will import computeSafeToSpend in 08-03"

tech_stack:
  added: []
  patterns:
    - "Two-layer function design: pure compute fn (this plan) + DB orchestration (page, 08-03)"
    - "Policy-in-code: ESSENTIAL_CATEGORIES follows BUDGET_THRESHOLDS precedent"
    - "balance ?? 0 guard for unpopulated DB rows"
    - "Direct use of BudgetProgress.remainingAmount (already clamped upstream at budgets/index.ts:174)"

key_files:
  created:
    - src/lib/safe-to-spend.ts
  modified:
    - tests/lib/safe-to-spend.test.ts

decisions:
  - "ESSENTIAL_CATEGORIES hardcoded as const tuple per D-S2S-01 — not user-configurable in v2.0"
  - "No getSafeToSpend() orchestrating wrapper in this plan — page owns DB orchestration per D-CMP-01"
  - "result clamped with Math.max(0, ...) to prevent negative S2S signaling false 'overdraft headroom'"
  - "p.remainingAmount used directly — NOT re-calculated — because src/lib/budgets/index.ts:174 already clamps it"
  - "account_type string comparison (not enum) because DbAccount.account_type is plain string from DB"

metrics:
  duration_minutes: 4
  tasks_completed: 1
  files_created: 1
  files_modified: 1
  tests_total: 11
  tests_passing: 11
---

# Phase 8 Plan 01: Safe-to-Spend Pure Calculation Summary

**One-liner:** Pure `computeSafeToSpend(accounts, budgetProgress)` implementing the D-S2S-01..03 formula — liquid balance minus essential committed budget remainders, clamped to zero.

## What Was Built

`src/lib/safe-to-spend.ts` — a single-purpose pure TypeScript module (~132 lines) that implements the Safe-to-Spend formula locked in 08-CONTEXT.md.

### Public API (locked per plan spec)

```ts
export const ESSENTIAL_CATEGORIES = ['Rent', 'Utilities', 'Food', 'Transport'] as const;

export function computeSafeToSpend(
  accounts: DbAccount[],
  budgetProgress: BudgetProgress[]
): number
```

### Formula implemented

```
safeToSpend =
    Σ (balance where account_type ∈ {'checking', 'savings'})   // D-S2S-03
  − Σ remainingAmount where budget.category ∈ ESSENTIAL_CATEGORIES  // D-S2S-02
  clamped to Math.max(0, ...)
```

### File structure (mirrors src/lib/budgets/index.ts conventions)

1. Multi-paragraph JSDoc file header — WHAT / FORMULA / WHY / LIMITATIONS / TODO (v3+)
2. `─── Constants ───` section — `ESSENTIAL_CATEGORIES` + `EssentialCategory` type alias
3. `─── Pure Calculation ───` section — `computeSafeToSpend` with inline step comments
4. NOTE footer explaining no DB code lives in this module

## TDD Discipline

| Commit | Hash | Description |
|--------|------|-------------|
| RED | `46a7307` | 9 failing tests — import resolution error (module not yet created) |
| GREEN | `f60dfde` | 11/11 tests passing — implementation complete |

**Test count increase from RED to GREEN:** 2 extra tests were added relative to the 9 initially failing (2 for `ESSENTIAL_CATEGORIES` describe block — exact values + as-const readonliness). Total: 11 tests across 2 describe blocks.

## Test Coverage (11 cases)

### computeSafeToSpend (9 cases)

| # | Case | Input → Expected |
|---|------|-----------------|
| 1 | EMPTY | `([], [])` → `0` |
| 2 | LIQUID-ONLY | checking €1000 + savings €500 → `1500` |
| 3 | ACCOUNT-FILTER | checking + credit + investment + savings → `1500` (credit/investment excluded) |
| 4 | ESSENTIAL-SUB | checking €2000, Rent remaining €800, Food remaining €200 → `1000` |
| 5 | DISCRETIONARY | checking €1000, Entertainment €500, Shopping €100 → `1000` (no subtraction) |
| 6 | ALREADY-CLAMPED | Rent remaining `0`, Food remaining €200 → `800` (clamped 0 contributes nothing) |
| 7 | CLAMP-RESULT | checking €100, Rent remaining €500 → `0` (not -400) |
| 8 | UNDEFINED-BALANCE | `balance: undefined` → treated as `0` via `??` guard |
| 9 | NEGATIVE-BALANCE | checking -€100 + savings €600 → `500` (overdraft summed as-is) |

### ESSENTIAL_CATEGORIES (2 cases)

| # | Case | Assertion |
|---|------|-----------|
| 10 | EXACT-VALUES | `toEqual(['Rent', 'Utilities', 'Food', 'Transport'])` |
| 11 | AS-CONST | `toHaveLength(4)` + `const first: "Rent" = ESSENTIAL_CATEGORIES[0]` type-pins literal |

## Acceptance Criteria Verification

- [x] `src/lib/safe-to-spend.ts` exports exactly two symbols: `ESSENTIAL_CATEGORIES` and `computeSafeToSpend`
- [x] File header contains FORMULA, LIMITATIONS, and "TODO (v3+ milestone)"
- [x] 11 `it()` cases, zero `it.todo()` remaining
- [x] `bun run test tests/lib/safe-to-spend.test.ts` exits 0 (11/11 passing)
- [x] `bun run typecheck` — zero new errors from safe-to-spend (3 pre-existing errors from other Wave 0 stubs, unrelated)
- [x] Filter uses `acc.account_type` (snake_case) with literals `'checking'` and `'savings'`
- [x] Essential subtraction uses `p.remainingAmount` directly — no re-clamp
- [x] Final expression: `Math.max(0, totalBalance - essentialCommitted)`
- [x] No `"use client"` directive
- [x] No React, no `next/`, no `@radix-ui` imports
- [x] RED commit `46a7307` precedes GREEN commit `f60dfde` on branch `worktree-agent-afcaf45ab361fc3ab`

## Deviations from Plan

### Auto-added: 2 extra boundary test cases

**Rule 2 (missing critical functionality) — behavior coverage**
- **Found during:** Writing the RED test file
- **Issue:** Plan specified "7 Nyquist cases" but the behavior spec in the plan also described `balance: undefined` and negative-balance boundary cases explicitly. Omitting them would leave the acceptance criteria partially uncovered (the spec names them in the `<behavior>` block).
- **Fix:** Added 2 extra `it()` cases beyond the 7 Nyquist cases — still within a single describe block, no new files.
- **Result:** 9 computeSafeToSpend cases + 2 ESSENTIAL_CATEGORIES cases = 11 total (exceeds the 7 minimum).

No other deviations. Plan executed exactly as written in all other respects.

## Known Stubs

None. The module is complete and fully wired. There are no placeholder values, TODO-at-runtime guards, or hardcoded empty returns.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. This module is a pure function with no side effects — it receives data, returns a number. No threat flags.

## Self-Check

### Files created/modified exist

- [x] `src/lib/safe-to-spend.ts` — FOUND
- [x] `tests/lib/safe-to-spend.test.ts` — FOUND (modified)

### Commits exist on branch

- [x] `46a7307` — RED commit — FOUND
- [x] `f60dfde` — GREEN commit — FOUND

## Self-Check: PASSED
