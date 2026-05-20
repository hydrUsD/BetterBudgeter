---
phase: 08-home-hub
plan: "03"
subsystem: utils
tags: [phase-8, home-hub, currency, tdd, pure-utility, extraction]
dependency_graph:
  requires: ["08-00"]
  provides: ["src/utils/currency.ts — formatCurrency(amount: number): string"]
  affects: ["08-04 (TransactionItem imports @/utils/currency)", "08-05 (home page rewrite removes legacy inline)"]
tech_stack:
  added: []
  patterns: ["Intl.NumberFormat de-DE/EUR pure extraction", "TDD RED/GREEN cycle"]
key_files:
  created:
    - src/utils/currency.ts
  modified:
    - tests/utils/currency.test.ts
decisions:
  - "Filename: currency.ts (not format.ts) — avoids TS module-resolution ambiguity with legacy src/utils/format/index.ts (USD-defaulting 3-param helper)"
  - "Function signature: formatCurrency(amount: number): string — single param, locked de-DE/EUR, no locale/currency opts"
  - "Behavior byte-identical to legacy inline at src/app/(bb)/page.tsx:316-321 — extraction only, not a rewrite"
  - "Pre-existing typecheck error (TransactionItem stub, Wave 2) is out of scope — confirmed pre-existing"
metrics:
  duration: "~8 minutes"
  completed: "2026-05-20"
  tasks_completed: 2
  files_changed: 2
---

# Phase 8 Plan 03: EUR Currency Formatter Extraction — Summary

EUR currency formatter (`formatCurrency`) extracted from the legacy `src/app/(bb)/page.tsx` inline helper into `src/utils/currency.ts`, becoming the single source of truth for de-DE/EUR formatting in BetterBudgeter. TDD RED/GREEN cycle complete with 5 passing tests.

## What Was Done

### Task 1 — RED: Failing tests

Replaced the `it.todo` stub in `tests/utils/currency.test.ts` with 5 real `it()` cases inside `describe("formatCurrency", ...)`:

1. `formatCurrency(0)` → `"0,00 €"` — zero with German decimal comma
2. `formatCurrency(1234.5)` → `"1.234,50 €"` — German thousand separator + decimal comma
3. `formatCurrency(10000)` → `"10.000,00 €"` — large positive with thousand separator
4. `formatCurrency(-50.5)` → `"-50,50 €"` — negative with hyphen-minus (not U+2212)
5. `formatCurrency(0.05)` → `"0,05 €"` — fractional below 1

All assertion strings use the confirmed U+00A0 NO-BREAK SPACE (ICU de-DE output, charCode 160) between the number and the euro sign. The NOTE comment is present inline per plan spec.

Tests failed as expected: `"Failed to resolve import @/utils/currency"` — file did not exist yet.

**Commit:** `668418f` — `test(08-03): RED — add failing formatCurrency unit tests`

### Task 2 — GREEN: Implementation

Created `src/utils/currency.ts` with:

- Full JSDoc file header explaining extraction source (D-CUT-04), filename rename rationale, and v3+ extension point
- Single named export: `formatCurrency(amount: number): string`
- Body byte-identical to the legacy inline at `(bb)/page.tsx:316-321`:
  `new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount)`
- No imports. No `"use client"`. No side effects.

All 5 tests pass. Typecheck confirms no module-resolution collision with legacy `@/utils/format`.

**Commit:** `4248abf` — `feat(08-03): GREEN — implement formatCurrency EUR formatter`

## Deviations from Plan

### Planning-time rename: `format.ts` → `currency.ts`

**Type:** Intentional planning decision, documented throughout Phase 8 artifacts.

The original CONTEXT.md D-CMP-01 listed the output as `src/utils/format.ts`. During research, 08-RESEARCH.md finding 6 and 08-PATTERNS.md identified that `src/utils/format/index.ts` already exists (the legacy USD-defaulting 3-param helper). Creating a flat `src/utils/format.ts` alongside that directory would cause TypeScript module-resolution ambiguity. The planner renamed the new file to `currency.ts` — semantically more accurate AND conflict-free. This deviation was documented in the plan frontmatter, objective, and interfaces sections. No scope reduction — same function, same behavior, better name.

**Import paths are unambiguous:**
- Legacy USD helper: `@/utils/format` → `src/utils/format/index.ts`
- New EUR formatter: `@/utils/currency` → `src/utils/currency.ts`

### Pre-existing typecheck error (out of scope)

`tests/components/TransactionItem.test.tsx` references `@/components/dashboard/TransactionItem` which does not exist yet (Wave 2 stub, plan 08-04). This error existed before this plan and is unchanged. Confirmed by reverting implementation and re-running typecheck — same error present.

## Known Stubs

None. The formatter is fully implemented. The legacy inline helper in `src/app/(bb)/page.tsx:316-321` is intentionally left in place — plan 08-05 (home page rewrite) is responsible for removing it.

## Threat Surface Scan

No new network endpoints, auth paths, file access patterns, or schema changes introduced. The function is pure and stateless. T-08-03-01 (locale tampering) is mitigated by the locked single-param signature.

## TDD Gate Compliance

- RED gate: `test(08-03)` commit `668418f` — tests written first, failing confirmed
- GREEN gate: `feat(08-03)` commit `4248abf` — implementation written, all tests pass

## Self-Check

- [x] `src/utils/currency.ts` exists at correct path
- [x] `src/utils/format.ts` does NOT exist (rename applied correctly)
- [x] `tests/utils/currency.test.ts` has 5 real `it()` cases inside `describe("formatCurrency", ...)`
- [x] Inline NOTE comment about U+00A0 present
- [x] All assertions use confirmed runtime byte sequences (not eyeballed)
- [x] `bun run test tests/utils/currency.test.ts` passes (5/5)
- [x] Typecheck: no new errors introduced
- [x] 2 TDD commits present (RED `668418f`, GREEN `4248abf`)
- [x] No modifications to legacy `src/utils/format/index.ts`
- [x] Filename rename documented in SUMMARY (per plan output requirement)

## Self-Check: PASSED
