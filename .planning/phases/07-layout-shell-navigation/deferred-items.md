# Phase 07 Deferred Items

## Pre-existing Issues (Out of Scope for Plan 01)

### 1. @tremor/react import in SpendingByCategoryChart.tsx

**File:** `src/components/dashboard/SpendingByCategoryChart.tsx`
**Issue:** Imports from `@tremor/react` which is not installed. Tremor was removed per CLAUDE.md UI Library Boundaries ("Tremor is removed — do not reintroduce") but the import was left in the file.
**Effect:** `bun run build` fails with "Module not found: Can't resolve '@tremor/react'". Tests for this component also fail.
**Discovered during:** Plan 07-01 Task 3 build gate.
**Action required:** Remove or replace the Tremor import in `SpendingByCategoryChart.tsx`. This is a pre-existing regression, not introduced by Phase 7.
**TypeScript:** `bun run typecheck` also reports `TS2307: Cannot find module '@tremor/react'` in the same file.

### 2. SpendingByCategoryChart tests fail

**File:** `tests/components/spending-chart.test.tsx`, `tests/smoke/imports.test.ts`
**Cause:** Same as #1 — tests import `SpendingByCategoryChart` which cannot be resolved.
**Action required:** Resolved by fixing item #1 above.
