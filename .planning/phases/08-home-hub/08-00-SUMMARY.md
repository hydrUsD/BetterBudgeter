---
phase: 08-home-hub
plan: "00"
subsystem: testing
tags: [phase-8, home-hub, test-scaffolding, wave-0, tdd]
dependency_graph:
  requires: []
  provides:
    - tests/lib/safe-to-spend.test.ts
    - tests/utils/greeting.test.ts
    - tests/utils/currency.test.ts
    - tests/components/TransactionItem.test.tsx
  affects:
    - Wave 1 TDD RED step (08-01, 08-02, 08-03)
    - Wave 2 TDD RED step (08-04)
tech_stack:
  added: []
  patterns:
    - vitest it.todo scaffold pattern (one describe+todo per exported symbol)
    - tests/lib/ subdirectory (new, follows tests/utils/ convention)
key_files:
  created:
    - tests/lib/safe-to-spend.test.ts
    - tests/utils/greeting.test.ts
    - tests/utils/currency.test.ts
    - tests/components/TransactionItem.test.tsx
  modified: []
decisions:
  - "No stub source files required — vitest defers module resolution for it.todo placeholders; all 4 files collect without import errors"
  - "Pre-existing @tremor/react smoke test failures are out of scope (SpendingByCategoryChart.tsx legacy dependency; not caused by Wave 0)"
metrics:
  duration: "~4 minutes"
  completed: "2026-05-20"
  tasks_completed: 1
  tasks_total: 1
  files_created: 4
  files_modified: 0
---

# Phase 8 Plan 00: Phase 8 TDD Test Scaffolding (Wave 0) Summary

**One-liner:** Created 4 vitest test scaffold files with `it.todo()` placeholders and `tests/lib/` directory so Wave 1 can begin TDD RED step without module-not-found collection errors.

---

## Tasks Completed

| # | Name | Commit | Files |
|---|------|--------|-------|
| 1 | Create tests/lib/ directory and four Phase 8 test scaffolds | 63ff146 | tests/lib/safe-to-spend.test.ts, tests/utils/greeting.test.ts, tests/utils/currency.test.ts, tests/components/TransactionItem.test.tsx |

---

## What Was Built

Four vitest test scaffold files were created following the established `tests/utils/charts.test.ts` boilerplate pattern. Each file:

- Has a file-level docblock with "Does NOT test:" scope section and `@see docs/TESTING_STRATEGY.md`
- Imports from `vitest` (`describe`, `it`, `expect`)
- Imports from the future Phase 8 module path (these modules do not yet exist)
- Uses `// ─────...` (U+2500, 80-char) section dividers between describe blocks
- Contains `it.todo()` placeholders that Wave 1 will replace with real failing `it()` cases

The `tests/lib/` subdirectory was created (previously non-existent; `tests/utils/` and `tests/components/` already existed).

**Stub source files fallback:** NOT applied. Vitest 4.x defers module resolution for `it.todo()` placeholders — all 4 files collected successfully (6 todos shown as "skipped") without needing empty stub source files. Wave 1 starts clean.

---

## Verification

- All 4 files exist at exact required paths
- `bun run test tests/lib/ tests/utils/greeting.test.ts tests/utils/currency.test.ts tests/components/TransactionItem.test.tsx` exits 0 (4 files, 6 todos, 0 failures)
- `tests/lib/` directory confirmed created
- No production code added — test scaffolds only
- No hardcoded color values, no assertions, no module stubs

---

## Deviations from Plan

None — plan executed exactly as written.

**Pre-existing issue noted (out of scope):** `tests/smoke/imports.test.ts` has 2 pre-existing failures caused by `SpendingByCategoryChart.tsx` importing the removed `@tremor/react` library. This failure predates Wave 0 and is not caused by these changes. Logged to `deferred-items.md` for Phase 9 cleanup.

---

## Known Stubs

None. This plan creates test scaffolds (by design), not production code. The `it.todo()` placeholders are intentional Wave 0 deliverables, not stubs in the sense of incomplete production code.

---

## Threat Flags

No new network endpoints, auth paths, file access patterns, or schema changes introduced. Test scaffolds are dev/CI-only.

---

## Self-Check: PASSED

Files exist:
- FOUND: tests/lib/safe-to-spend.test.ts
- FOUND: tests/utils/greeting.test.ts
- FOUND: tests/utils/currency.test.ts
- FOUND: tests/components/TransactionItem.test.tsx

Commits exist:
- FOUND: 63ff146 (test(08-00): scaffold Phase 8 TDD test stubs (Wave 0))
