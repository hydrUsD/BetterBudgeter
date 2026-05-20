# Phase 8: Home Hub — Pattern Map

**Mapped:** 2026-05-20
**Files analyzed:** 9 (4 created, 1 replaced, 4 test files)
**Analogs found:** 9 / 9

---

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---------------------|------|-----------|----------------|---------------|
| `src/lib/safe-to-spend.ts` | service / pure logic | transform | `src/lib/budgets/index.ts` | role-match |
| `src/utils/greeting.ts` | utility | transform | `src/utils/charts/index.ts` | role-match |
| `src/utils/currency.ts` | utility | transform | `src/utils/format/index.ts` | exact |
| `src/components/dashboard/TransactionItem.tsx` | component | request-response | `src/app/(bb)/page.tsx` lines 255–279 | role-match |
| `src/app/(bb)/page.tsx` (REPLACED) | page / controller | request-response | current `src/app/(bb)/page.tsx` + `src/app/(bb)/settings/page.tsx` | exact (self-analog) |
| `tests/lib/safe-to-spend.test.ts` | test | — | `tests/utils/charts.test.ts` | role-match |
| `tests/utils/greeting.test.ts` | test | — | `tests/utils/charts.test.ts` | role-match |
| `tests/utils/currency.test.ts` | test | — | `tests/utils/charts.test.ts` | exact |
| `tests/components/TransactionItem.test.tsx` | test | — | `tests/components/PageShell.test.tsx` | exact |

---

## Pattern Assignments

### `src/lib/safe-to-spend.ts` (service, transform)

**Analog:** `src/lib/budgets/index.ts`

**File-header comment pattern** (`src/lib/budgets/index.ts` lines 1–20):
```ts
/**
 * Budget Calculation Module
 *
 * Calculates budget progress from transaction data.
 * This module contains the core business logic for budget tracking.
 *
 * KEY DESIGN DECISIONS:
 * - Budget progress is CALCULATED, not stored (transactions are source of truth)
 * - Time window is always the current calendar month
 * - Thresholds: 80% = warning, 100% = over budget
 * - Only expense categories have budgets (income budgets are out of scope)
 *
 * DATA FLOW:
 * 1. ...
 *
 * @see docs/BUDGET_STRATEGY.md for detailed design and ADHD rationale
 */
```
Copy this multi-block structure verbatim: file docblock → `@see` pointer → constants section → helper functions section → main export functions section.

**Section dividers pattern** (`src/lib/budgets/index.ts` lines 33–35):
```ts
// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
```
Use this exact separator (`─` U+2500, 80 chars) for every section header in the new file.

**Named const with ADHD rationale comment** (`src/lib/budgets/index.ts` lines 44–49):
```ts
/**
 * Budget threshold percentages.
 * These are fixed for MVP to provide consistent, predictable feedback.
 *
 * ADHD DESIGN: Fixed thresholds reduce decision fatigue.
 * Users don't need to configure these — they "just work".
 */
export const BUDGET_THRESHOLDS = {
  WARNING: 80,
  OVER_BUDGET: 100,
} as const;
```
Mirror this for `ESSENTIAL_CATEGORIES`: named const → `as const` → ADHD rationale in JSDoc → TODO v3+ comment. The comment must explain WHY it is hardcoded (policy, not user data) and reference the future migration path.

**Imports pattern** (`src/lib/budgets/index.ts` lines 22–31):
```ts
import { getBudgets } from "@/lib/db/budgets";
import { getTransactions } from "@/lib/db/transactions";
import type { DbBudget } from "@/lib/db/types";
import type {
  Budget,
  BudgetProgress,
  BudgetStatus,
  BudgetAlert,
  ExpenseCategory,
} from "@/types/finance";
```
`@/` path aliases throughout. Separate runtime imports from `import type`. Import `DbAccount` from `@/lib/db/types` and `BudgetProgress` from `@/types/finance`.

**Two-layer function design pattern** (`src/lib/budgets/index.ts` lines 158–192):
The analog has `calculateAllBudgetProgress()` which is an orchestrator (fetches then computes). Safe-to-Spend must follow the same two-layer split:
1. `computeSafeToSpend(accounts: DbAccount[], budgetProgress: BudgetProgress[]): number` — pure, unit-testable.
2. Optional `getSafeToSpend(): Promise<number>` — orchestrates DB calls and delegates to (1).

Unit tests target only (1). The page component calls `computeSafeToSpend` after its own parallel `Promise.all` — no need for `getSafeToSpend` in Phase 8.

**`remainingAmount` already clamped** (`src/lib/budgets/index.ts` line 174):
```ts
const remainingAmount = Math.max(0, budget.monthlyLimit - spentAmount);
```
`BudgetProgress.remainingAmount` is pre-clamped here. `computeSafeToSpend` uses `p.remainingAmount` directly — no second `Math.max`. Add a comment: `// Note: BudgetProgress.remainingAmount is already Math.max(0, ...) — see lib/budgets/index.ts:174`.

**`account_type` field name** (`src/lib/db/types.ts` lines 19–31):
`DbAccount.account_type` is the field name (snake_case string, not typed enum). Filter: `acc.account_type === 'checking' || acc.account_type === 'savings'`. Do NOT use `acc.type`.

---

### `src/utils/greeting.ts` (utility, transform)

**Analog:** `src/utils/charts/index.ts`

**File-header comment pattern** (`src/utils/charts/index.ts` lines 1–8):
```ts
/**
 * Chart Utilities
 *
 * Pure, stateless helpers for chart configuration (Recharts via shadcn/ui).
 * Provides consistent colors, formatting, and config across charts.
 *
 * These functions have NO side effects and do NOT access external state.
 */
```
Copy this structure for `greeting.ts`: short file-level docblock explaining scope, explicit "no side effects" statement.

**Section dividers:** Same `// ─────...` separator as `charts/index.ts`. Create sections: `// Greeting Helpers` or similar.

**Named export functions** (not default exports). Both `nameFromEmail` and `greetingForTime` are named exports — match the `export function` style used throughout `utils/`.

**`utils/` directory already exists.** The `src/utils/` directory contains `charts/`, `format/`, and `mapping/` subdirectories (all as `index.ts` barrel files). However, `greeting.ts` and `format.ts` are **flat files** (per CONTEXT D-CMP-01: `src/utils/greeting.ts`, not `src/utils/greeting/index.ts`). This is the correct pattern for single-function utility modules.

**Critical:** `src/utils/format/index.ts` already exists (legacy OopsBudgeter utility with `formatCurrency(amount, currency?, locale?)` — 3 params, USD default). The NEW utility was **renamed during planning** from `src/utils/currency.ts` to `src/utils/currency.ts` to avoid TypeScript module-resolution ambiguity with the legacy `src/utils/format/index.ts`. The new file is a flat `.ts` at the `utils/` root with a single `formatCurrency(amount: number): string` locked to `de-DE/EUR` (D-CUT-04). All plans (08-03, 08-04, 08-05) and VALIDATION.md import from `@/utils/currency`; the legacy `@/utils/format` is untouched.

> **Resolution applied (planning-time decision):** Renamed new file `src/utils/currency.ts` → `src/utils/currency.ts`. Replaces the earlier "try the flat file first" guidance — Option A (the rename) was chosen because it eliminates ambiguity at the source rather than relying on TypeScript resolution order. This is a filename change ONLY; the function signature and behavior are unchanged per CONTEXT.md D-CMP-01.

---

### `src/utils/currency.ts` (utility, transform)

**Analog:** `src/utils/format/index.ts` lines 26–37 (legacy version) AND `src/app/(bb)/page.tsx` lines 316–321 (inline source to extract from)

**Inline helper being extracted** (`src/app/(bb)/page.tsx` lines 316–321):
```ts
/**
 * Format a number as currency (EUR)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
```
This is the **exact behavior** to preserve (D-CUT-04). Copy this function body verbatim. Do not add parameters. Do not default to USD.

**File-header pattern** (from `src/utils/format/index.ts` lines 1–9):
```ts
/**
 * Format Utilities
 *
 * Pure, stateless formatting helpers for dates, currency, and numbers.
 * These functions have NO side effects and do NOT access external state.
 *
 * Usage: Import individual functions as needed.
 */
```
Adapt for the new flat file with a narrower scope description: "EUR currency formatter extracted from the legacy (bb)/page.tsx inline helper. Single source of truth for de-DE EUR formatting across home page and TransactionItem."

**Extension point comment:** Add `// EXTENSION POINT: Add currency parameter when multi-currency is needed (v3+).` below the function — matches the junior-dev comment discipline in CLAUDE.md rules.

---

### `src/components/dashboard/TransactionItem.tsx` (component, request-response)

**Primary analog:** `src/app/(bb)/page.tsx` lines 255–279 (transaction row JSX being extracted)

**Transaction row JSX being extracted** (`src/app/(bb)/page.tsx` lines 255–279):
```tsx
{recentTransactions.map((tx) => (
  <div
    key={tx.id}
    className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
  >
    <div>
      <p className="font-medium">{tx.description || "Transaction"}</p>
      <p className="text-sm text-muted-foreground">
        {tx.category} · {formatDate(tx.booking_date)}
      </p>
    </div>
    <div
      className={`font-medium ${
        tx.type === "income"
          ? "text-green-600 dark:text-green-400"
          : "text-red-600 dark:text-red-400"
      }`}
    >
      {tx.type === "income" ? "+" : "-"}
      {formatCurrency(tx.amount)}
    </div>
  </div>
))}
```
The new component replaces this pattern but upgrades: raw DB fields → view-model props; `text-green-600` → `text-bb-positive`; `text-red-600` → `text-bb-negative`; `-` hyphen → `−` U+2212 minus sign; `font-medium` → default weight for merchant, `font-bold` for amount (UI-SPEC Revision 1).

**Secondary analog — peer component file-header pattern** (`src/components/dashboard/SyncTransactionsButton.tsx` lines 1–21):
```ts
"use client";

/**
 * Sync Transactions Button Component
 *
 * A client component that triggers manual transaction import from linked banks.
 * ...
 *
 * @see docs/IMPORT_PIPELINE_STRATEGY.md Section 2
 */
```
`TransactionItem.tsx` is a **server component** — no `"use client"` directive. The file-header must explicitly state: `// Server component — do NOT add "use client". No interactivity.`

**Props interface placement** (`src/components/dashboard/SyncTransactionsButton.tsx` lines 32–37):
```ts
interface SyncTransactionsButtonProps {
  /** Number of linked accounts (0 = no banks linked) */
  accountCount: number;
  /** Optional: custom class name */
  className?: string;
}
```
Props interface defined immediately after imports, before the component function. Named interface (not inline type). Each prop documented with JSDoc `/** ... */`.

**Named export (not default)** — `export function TransactionItem(...)`. Matches `SyncTransactionsButton` which also uses a named export. The barrel `src/components/dashboard/index.ts` will need updating to re-export `TransactionItem` in Phase 8.

**`cn()` helper import** (`src/lib/utils.ts` — verified present per RESEARCH.md):
```ts
import { cn } from "@/lib/utils";
```
Use `cn()` for conditional class composition (income vs expense amount color).

---

### `src/app/(bb)/page.tsx` (page, REPLACED — D-CUT-01)

**Primary analog:** The CURRENT `src/app/(bb)/page.tsx` (self-analog — the replacement must preserve the established conventions while cutting scope)

**File-header comment pattern** (`src/app/(bb)/page.tsx` lines 1–41):
```ts
/**
 * BetterBudget Dashboard Page (Home)
 *
 * This is the main dashboard showing financial overview.
 * ...
 *
 * DATA FLOW:
 * - UI reads from database only (never from mock API)
 * ...
 *
 * ROUTING:
 * - This page lives at `/`
 * ...
 *
 * @see docs/DASHBOARD_STRATEGY.md for design decisions
 * @see docs/SUPABASE_STRATEGY.md for data flow
 */
```
New file header should update: title → "Home Hub", list the 4 sections not the old feature list, update `@see` refs to point to DESIGN_SYSTEM.md and ADHD_UX_RESEARCH.md instead of the old docs.

**`metadata` export** (`src/app/(bb)/page.tsx` lines 62–64):
```ts
export const metadata = generateMetadata({
  title: "Dashboard",
});
```
Copy pattern. Update title to `"Home"`.

**Data-fetch + try/catch pattern** (`src/app/(bb)/page.tsx` lines 66–93):
```ts
export default async function DashboardPage() {
  const user = await getUser();

  let accounts: Awaited<ReturnType<typeof getAccounts>> = [];
  let recentTransactions: Awaited<ReturnType<typeof getRecentTransactions>> = [];
  let budgetProgress: BudgetProgress[] = [];
  let dataError: string | null = null;

  try {
    accounts = await getAccounts();
    recentTransactions = await getRecentTransactions(5);
    budgetProgress = await calculateAllBudgetProgress();
  } catch (error) {
    console.error("[dashboard] Error fetching data:", error);
    dataError = error instanceof Error ? error.message : "Failed to load data";
  }
  ...
```
Phase 8 simplifies to 4 parallel fetches using `Promise.all`. The `let` + default-value + try/catch + `dataError: string | null` pattern is preserved exactly. The legacy page uses sequential `await`s — the new page upgrades to `Promise.all` per RESEARCH Pattern 1. Note: `getUser()` is called separately (before `Promise.all`) since user is needed for greeting regardless of DB errors.

**No `<main>` at the page level** (`src/app/(bb)/page.tsx` line 100 + comment):
```tsx
// Outer wrapper downgraded from <main> to <div> per Phase 7 D-07 — PageShell (in (bb)/layout.tsx per D-06) now provides the single <main> landmark for this route. See RESEARCH §Pitfall 5.
<div className="flex flex-col gap-6">
```
New page uses the same wrapper pattern. Update `gap-6` → `gap-bb-8` (Phase 6 token). Include the same comment explaining WHY `<div>` not `<main>`.

**Secondary analog — BB page convention (post-Phase-7)** (`src/app/(bb)/settings/page.tsx` lines 26–68):
```tsx
export default async function SettingsPage() {
  // ... auth check ...
  // ... data fetch with try/catch ...

  return (
    // Outer wrapper downgraded from <main> to <div> per Phase 7 D-07 ...
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        ...
      </div>
      <section className="border rounded-lg p-6">
        ...
      </section>
    </div>
  );
}
```
The settings page shows that post-Phase-7 BB pages do NOT use `<PageHeader>` — they use an inline `<div>` with `<h1>` + `<p>`. **However, Phase 8 DOES use `<PageHeader>` per 08-CONTEXT D-GR-04 and UI-SPEC page structure.** The settings page is a partial analog — its structural pattern (no double shell, `<div>` root, `gap-6`) is correct, but the heading pattern is superseded by the Phase 8 explicit decision to use `<PageHeader title="Home" />`.

---

### `tests/lib/safe-to-spend.test.ts` (test, unit)

**Analog:** `tests/utils/charts.test.ts`

**Full test file pattern** (`tests/utils/charts.test.ts` lines 1–37):
```ts
/**
 * Chart Utility Function Tests
 *
 * Tests pure, stateless helper functions from utils/charts.
 * These functions have no side effects and return deterministic results.
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import {
  CATEGORY_COLORS,
  getCategoryColor,
  toPieChartData,
} from "@/utils/charts";

// ─────────────────────────────────────────────────────────────────────────────
// getCategoryColor
// ─────────────────────────────────────────────────────────────────────────────

describe("getCategoryColor", () => {
  it("returns correct color for known expense categories", () => {
    expect(getCategoryColor("Food")).toBe("#ef4444");
  });
  ...
});
```
Copy this structure:
- File-level docblock with `@see docs/TESTING_STRATEGY.md`
- Named imports from `vitest`: `describe, it, expect`
- `@/` alias imports from the module under test
- `// ─────...` section dividers between `describe` blocks
- One `describe` block per exported function
- `it("description of behavior", () => { ... })` test style (not `test()`)
- No `beforeAll` / `afterAll` needed for pure functions

**Mock data pattern for `computeSafeToSpend`** (from `tests/components/budget-progress.test.tsx` lines 24–70):
```ts
const mockBudgetProgress: BudgetProgress[] = [
  {
    budget: {
      id: "1",
      userId: "user-1",
      category: "Food",
      monthlyLimit: 500,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    spentAmount: 250,
    remainingAmount: 250,
    usagePercentage: 50,
    status: "on_track",
    transactionCount: 10,
  },
  ...
];
```
Build `DbAccount[]` mock objects with the `DbAccount` shape from `src/lib/db/types.ts` — must include `account_type: string` (not `type`). Build `BudgetProgress[]` mock objects matching the `BudgetProgress` shape from `src/types/finance.ts` (same shape as the mock above).

**Test directory location:** `tests/lib/safe-to-spend.test.ts` — the `tests/lib/` subdirectory does not yet exist. Create it alongside the test file (the same way `tests/utils/charts.test.ts` lives under `tests/utils/`).

---

### `tests/utils/greeting.test.ts` (test, unit)

**Analog:** `tests/utils/charts.test.ts` (exact same structure)

**Key test pattern for timezone-dependent functions** (from RESEARCH Pitfall 3 + Pattern 5):
```ts
// To test 05:00 Berlin (CET = UTC+1), pass a UTC date at 04:00:
const morningBerlin = new Date('2026-01-15T04:00:00Z');
expect(greetingForTime(morningBerlin)).toBe('morning');

// To test 18:00 Berlin (CEST = UTC+2 in summer), pass UTC 16:00:
const eveningBerlinSummer = new Date('2026-07-15T16:00:00Z');
expect(greetingForTime(eveningBerlinSummer)).toBe('evening');
```
Use fixed ISO date strings (not `new Date()`) so tests are deterministic regardless of when they run. Note CET (UTC+1) vs CEST (UTC+2) offset for winter vs summer test dates.

**Test directory location:** `tests/utils/greeting.test.ts` — `tests/utils/` directory already exists (contains `charts.test.ts`). File is a sibling.

---

### `tests/utils/currency.test.ts` (test, unit)

**Analog:** `tests/utils/charts.test.ts` (exact same structure)

**Test cases to mirror the existing charts test style:**
```ts
describe("formatCurrency", () => {
  it("formats positive amount as de-DE EUR", () => {
    expect(formatCurrency(1234.5)).toBe("1.234,50 €");
  });
  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("0,00 €");
  });
  it("formats large amount with thousand separator", () => {
    expect(formatCurrency(10000)).toBe("10.000,00 €");
  });
});
```
The `de-DE` locale uses `.` as thousands separator and `,` as decimal. Verify exact output string format locally if unsure — the test value must match what `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })` actually produces on Node.js.

**Test directory location:** `tests/utils/currency.test.ts` — sibling of `charts.test.ts`.

---

### `tests/components/TransactionItem.test.tsx` (test, React component)

**Analog:** `tests/components/PageShell.test.tsx` (exact role match)

**Full test file pattern** (`tests/components/PageShell.test.tsx` lines 1–60):
```ts
/**
 * PageShell Render Tests
 *
 * Verifies that the PageShell layout primitive renders with the correct
 * HTML landmark, max-width constraint, bottom padding formula, and
 * optional className merge (NAV-05, D-11).
 *
 * Does NOT test:
 * - Visual appearance or pixel measurements
 * ...
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageShell } from "@/components/layout/PageShell";

describe("PageShell", () => {
  it("renders children inside a main landmark", () => {
    render(<PageShell><p>hello</p></PageShell>);
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();
  });
  ...
});
```
Copy this structure for `TransactionItem.test.tsx`:
- File docblock with "Does NOT test" section (visual appearance, CSS variable resolution, etc.)
- `import { describe, it, expect } from "vitest"`
- `import { render, screen } from "@testing-library/react"`
- `import { TransactionItem } from "@/components/dashboard/TransactionItem"`
- No module mocks needed (TransactionItem is a pure server component with no `usePathname`, `useRouter`, etc.)
- Use `screen.getByText()` to assert rendered text
- Use `container.querySelector()` for class assertions (matches `PageShell.test.tsx` pattern)

**No module mocks** — unlike `TabBar.test.tsx` which mocks `next/navigation` and `next/link`, `TransactionItem` has no client-side imports. No `vi.mock()` needed.

**Secondary analog for test data shape** (`tests/components/budget-progress.test.tsx` lines 24–70):
Use the `mockBudgetProgress` fixture style as inspiration — build a `const mockExpenseTx: TransactionItemProps` and `const mockIncomeTx: TransactionItemProps` at the top of the describe block.

---

## Shared Patterns

### Section Dividers (all new files)

**Source:** `src/lib/budgets/index.ts` line 33 / `src/utils/charts/index.ts` line 10
**Apply to:** All new `.ts` and `.tsx` files in Phase 8
```ts
// ─────────────────────────────────────────────────────────────────────────────
// Section Name
// ─────────────────────────────────────────────────────────────────────────────
```
This exact separator (U+2500 `─`, 80 chars total) is the established project convention for section-level visual breaks. Every new Phase 8 file must use it between sections.

---

### `@/` Path Alias Imports

**Source:** `src/lib/budgets/index.ts` lines 22–31 / `src/utils/mapping/index.ts` lines 10–15
**Apply to:** All new files
```ts
import type { DbAccount } from "@/lib/db/types";
import type { BudgetProgress } from "@/types/finance";
import { cn } from "@/lib/utils";
```
Always use `@/` alias (never relative `../../`). Separate `import type` from runtime imports.

---

### Test File Boilerplate

**Source:** `tests/components/PageShell.test.tsx` lines 1–22 / `tests/utils/charts.test.ts` lines 1–15
**Apply to:** All 4 test files in Phase 8
```ts
/**
 * [Component/Module] [Tests|Render Tests]
 *
 * [One sentence what is tested]
 *
 * Does NOT test:
 * - [what is explicitly excluded]
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
```
The "Does NOT test" section is a **required** part of the docblock per established convention. It sets clear scope expectations.

---

### `tests/setup.ts` is already configured

**Source:** `tests/setup.ts`
```ts
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

afterEach(() => { cleanup(); });
vi.stubGlobal("ResizeObserver", class ResizeObserver { ... });
```
Do NOT repeat this setup in individual test files. `jest-dom` matchers (`.toBeInTheDocument()`, etc.) are available globally. `cleanup()` runs automatically after each test. New test files only need `import { describe, it, expect } from "vitest"` — no per-file setup.

---

### No `"use client"` in New Server Components

**Source:** `src/app/(bb)/page.tsx` line 1 (no directive = server component) / RESEARCH.md Pitfall 5
**Apply to:** `src/lib/safe-to-spend.ts`, `src/utils/greeting.ts`, `src/utils/currency.ts`, `src/components/dashboard/TransactionItem.tsx`, `src/app/(bb)/page.tsx`

None of these files are client components. They must NOT have `"use client"` at the top. `TransactionItem.tsx` must include a header comment: `// Server component — do NOT add "use client". No interactivity.` to prevent future regression.

---

### Token-Only Styling (no hardcoded colors)

**Source:** `src/app/(bb)/page.tsx` lines 267–270 (OLD pattern to replace):
```tsx
// OLD — do NOT copy:
className={`font-medium ${tx.type === "income"
  ? "text-green-600 dark:text-green-400"
  : "text-red-600 dark:text-red-400"}`}

// NEW — Phase 8 pattern:
className={cn("text-bb-base font-bold", type === "income"
  ? "text-bb-positive"
  : "text-bb-negative")}
```
**Apply to:** `TransactionItem.tsx`, `BudgetStatusRow` private function in `page.tsx`.
All colors via `--bb-*` tokens. No `text-green-*`, `text-red-*`, `text-gray-*`, or inline hex.

---

### `cn()` for Conditional Classes

**Source:** `src/lib/utils.ts` (verified present per RESEARCH.md) / `src/components/dashboard/SyncTransactionsButton.tsx`
**Apply to:** `TransactionItem.tsx`, BudgetStatusRow in `page.tsx`
```ts
import { cn } from "@/lib/utils";

// Usage:
<span className={cn("text-bb-base font-bold", type === "income" ? "text-bb-positive" : "text-bb-negative")}>
```
Use `cn()` for all conditional Tailwind class compositions. Never string template literals with ternaries for class names.

---

## No Analog Found

No files in Phase 8 lack a codebase analog. All patterns are mapped.

---

## Naming Conflict Warning

`src/utils/format/index.ts` (legacy OopsBudgeter module — exports `formatCurrency(amount, currency?, locale?)` defaulting to USD/en-US) and the new `src/utils/currency.ts` (exports `formatCurrency(amount: number)` locked to de-DE/EUR) will both resolve as `@/utils/format` in TypeScript module resolution.

**TypeScript resolves a flat `.ts` file before a directory `index.ts`**, so `import { formatCurrency } from "@/utils/format"` will prefer the new flat file. Verify this with `bun run typecheck` immediately after creating `src/utils/currency.ts`.

If type errors appear, rename to `src/utils/currency.ts` (exported as `formatCurrency`) and update all Phase 8 imports to `@/utils/currency`. This is a low-risk fallback that requires no logic change.

---

## `src/utils/` Directory Status

`src/utils/` already exists and contains subdirectories (`charts/`, `format/`, `mapping/`). The new files (`greeting.ts`, `format.ts`) are **flat files at the `src/utils/` root** — not inside subdirectories. This is consistent with CONTEXT D-CMP-01 file paths. No `mkdir` needed; the directory exists.

---

## Metadata

**Analog search scope:** `src/lib/`, `src/utils/`, `src/components/dashboard/`, `src/app/(bb)/`, `tests/`
**Files scanned:** 14 source files + 5 test files
**Pattern extraction date:** 2026-05-20
