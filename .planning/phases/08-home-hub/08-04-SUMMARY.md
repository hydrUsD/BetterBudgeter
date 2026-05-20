---
phase: 08-home-hub
plan: "04"
subsystem: dashboard-components
tags: [phase-8, home-hub, transaction-item, tdd, server-component, ui, page-03]

dependency_graph:
  requires:
    - "08-03"  # src/utils/currency.ts (formatCurrency)
    - "08-00"  # test infrastructure + Wave 0 stub
  provides:
    - "TransactionItem component (PAGE-03)"
    - "TransactionItemProps interface (D-CMP-02)"
    - "barrel re-export in src/components/dashboard/index.ts"
  affects:
    - "08-05"  # home page rewrite — imports TransactionItem from barrel

tech_stack:
  added: []
  patterns:
    - "TDD RED/GREEN (no REFACTOR needed)"
    - "Server component (no use client)"
    - "View-model decoupling (D-CMP-02)"
    - "U+2212 MINUS SIGN typography requirement"
    - "de-DE locale date formatting"

key_files:
  created:
    - "src/components/dashboard/TransactionItem.tsx"
    - "(test) tests/components/TransactionItem.test.tsx (replaced Wave 0 stub)"
  modified:
    - "src/components/dashboard/index.ts"

decisions:
  - "NO_CLIENT_DIRECTIVE test uses /^[\"']use client[\"']/m regex (not simple substring) to avoid false positive from comment text mentioning the directive"
  - "Test fixture pre-computes EXPECTED_DATE_2026_04_14 dynamically via same Intl call as component — ICU-version safe"
  - "14 test cases implemented (plan required >=6; expanded for thorough coverage)"

metrics:
  duration: "3 minutes"
  completed: "2026-05-20"
  tasks_completed: 1
  files_created: 2
  files_modified: 1
---

# Phase 08 Plan 04: TransactionItem Server Component Summary

**One-liner:** Pure server component rendering merchant + colored amount (U+2212) + category + date via view-model props, fully TDD with 14 passing render tests.

---

## What Was Built

`src/components/dashboard/TransactionItem.tsx` — the presentational transaction row component required by PAGE-03 and locked by CONTEXT D-CMP-02. The component:

- Is a **pure server component** (no "use client", no hooks, no state, no event handlers)
- Accepts a **view-model** (`TransactionItemProps`) rather than a raw DB row — parent page maps `DbTransaction → TransactionItemProps`
- Renders a **two-line layout**: primary row (merchant left + amount right) + secondary row (category · formatted date)
- Uses **U+2212 MINUS SIGN** (`−`, charCode 8722) for expense prefix — not ASCII hyphen-minus (`-`, charCode 45)
- Colors income amounts `text-bb-positive` and expense amounts `text-bb-negative`, both `font-bold`
- Formats dates as `"14. Apr."` via `toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })`
- Imports `formatCurrency` from `@/utils/currency` (Wave 1 rename from `format.ts`)
- Uses only `--bb-*` Tailwind token utilities — zero hardcoded hex/RGB/named colors

`src/components/dashboard/index.ts` — barrel export updated with `TransactionItem` and `TransactionItemProps` re-export for plan 08-05 to import from.

---

## TDD Commits

| Gate | Commit | Description |
|------|--------|-------------|
| RED  | `9752074` | `test(08-04): add failing render tests for TransactionItem component` |
| GREEN | `49f8c1c` | `feat(08-04): implement TransactionItem server component (PAGE-03)` |

---

## Test Results

`bun run test tests/components/TransactionItem.test.tsx` → **14 passed, 0 failed**

| Case | Description | Result |
|------|-------------|--------|
| EXPENSE_BASIC (×4) | merchant text, U+2212 charCodeAt(0)===8722, text-bb-negative class, category + date in secondary line | PASS |
| INCOME_BASIC (×3) | "+" prefix, text-bb-positive class, Salary category | PASS |
| AMOUNT_FORMATTING | 1234.5 renders "1.234,50" with U+2212 | PASS |
| ZERO_AMOUNT (×2) | +0,00 € for income, −0,00 € for expense (no special zero branch) | PASS |
| CATEGORY_VARIETY | "Other" category renders | PASS |
| DATE_FORMATTING | Dynamically computed de-DE format matches component output | PASS |
| NO_ICONS | container.querySelector('svg') is null | PASS |
| NO_CLIENT_DIRECTIVE | /^["']use client["']/m not present in source | PASS |

---

## Acceptance Criteria Verification

- [x] `src/components/dashboard/TransactionItem.tsx` exists, exports `TransactionItem` (function) and `TransactionItemProps` (interface)
- [x] File does NOT contain the client-directive string at module top — regex guard passes
- [x] U+2212 MINUS SIGN present: `node -e "...includes('−')"` → `true`
- [x] No hardcoded color utilities: `grep -E "text-(green|red|gray|blue|yellow)-" ... | wc -l` → `0`
- [x] All required token classes present: `text-bb-base`, `text-bb-sm`, `text-bb-text`, `text-bb-text-secondary`, `text-bb-positive`, `text-bb-negative`, `border-bb-border`, `font-bold`
- [x] Imports `cn` from `@/lib/utils` and `formatCurrency` from `@/utils/currency`
- [x] `src/components/dashboard/index.ts` re-exports `TransactionItem` and `type TransactionItemProps`
- [x] Test file contains 14 `it()` cases (plan required ≥6)
- [x] `bun run test tests/components/TransactionItem.test.tsx` exits 0
- [x] `bun run typecheck` exits 0
- [x] 2 TDD commits on branch (RED `9752074` + GREEN `49f8c1c`)

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] NO_CLIENT_DIRECTIVE test false positive on comment text**

- **Found during:** GREEN phase test run (13/14 passed; case 8 failed)
- **Issue:** The test used `expect(first200).not.toContain("use client")` — a simple substring check. The first line of the component file is a comment that mentions `"use client"` by name (as guidance to future readers), so the check found the substring inside the comment text, not as a module directive.
- **Fix:** Changed the assertion to `expect(content).not.toMatch(/^["']use client["']/m)` — a multiline regex that only matches the directive when it appears as a quoted string literal at the start of a line. This is the exact syntax that Next.js recognizes as a module boundary directive.
- **Files modified:** `tests/components/TransactionItem.test.tsx`
- **Commit:** Included in GREEN commit `49f8c1c`

No other deviations — plan executed as written.

---

## Known Stubs

None. `TransactionItem` is a pure presenter — it renders exactly what it receives. No placeholder text, no hardcoded empty values, no mock data wired.

---

## Threat Flags

No new security surface introduced. Component is purely presentational, receives view-model from upstream RLS-filtered queries, uses React's default JSX escaping (no raw HTML props), and introduces no network endpoints, auth paths, or file access patterns.

---

## TDD Gate Compliance

- RED gate commit: `9752074` (`test(08-04): ...`) — confirmed tests failed with import error
- GREEN gate commit: `49f8c1c` (`feat(08-04): ...`) — confirmed 14 tests pass

No REFACTOR commit needed — component is clean as implemented.
