# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `vitest.config.ts`
- Environment: jsdom (browser simulation for React components)

**Assertion Library:**
- Vitest native expect() API (Jest-compatible)
- @testing-library/jest-dom matchers for DOM assertions
- @testing-library/react for component rendering

**Run Commands:**
```bash
bun run test                    # Run all tests (one pass)
bun run test:watch            # Watch mode (re-run on file change)
bun run test -- --coverage    # Generate coverage report (not enforced)
```

Note: `test:watch` command not in package.json; use `vitest --watch` directly if needed.

## Test File Organization

**Location:**
- All tests in `tests/` directory (not co-located with source)
- Organized by layer: `tests/smoke/`, `tests/components/`, `tests/utils/`

**Naming:**
- Test files: `{subject}.test.ts` or `{subject}.test.tsx`
- Examples: `budget-progress.test.tsx`, `charts.test.ts`, `imports.test.ts`

**Structure:**
```
tests/
├── setup.ts                        # Environment setup
├── smoke/
│   └── imports.test.ts            # Critical module imports
├── components/
│   ├── budget-progress.test.tsx   # Component render tests
│   └── spending-chart.test.tsx    # Component render tests
└── utils/
    └── charts.test.ts             # Pure function tests
```

## Test Structure

**Suite Organization:**

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const mockBudgetProgress = [
  {
    budget: { id: "1", category: "Food", monthlyLimit: 500 },
    spentAmount: 250,
    remainingAmount: 250,
    usagePercentage: 50,
    status: "on_track",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("BudgetProgressSection", () => {
  it("renders without crashing with budget data", () => {
    const { container } = render(
      <BudgetProgressSection budgetProgress={mockBudgetProgress} />
    );
    expect(container).toBeTruthy();
  });

  it("renders empty state when no budgets exist", () => {
    render(<BudgetProgressSection budgetProgress={[]} />);
    expect(screen.getByText("Budget Tracking")).toBeTruthy();
  });
});
```

**Patterns:**

- Describe blocks organize tests by component/function name
- Arrange-Act-Assert pattern in each test (minimal setup, clear assertion)
- Mock data blocks at top of file for readability
- Section dividers (`// ───────`) separate logical groups

## Mocking

**Framework:**
- Vitest native `vi` module for stubs and spies
- @testing-library/react for component rendering mocks

**Patterns:**

**ResizeObserver Stub** (required by Recharts):
```typescript
// From tests/setup.ts
vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
```

**Component Props with Mock Data:**
```typescript
const mockBudgetProgress = [
  {
    budget: { id: "1", category: "Food", monthlyLimit: 500 },
    spentAmount: 250,
    usagePercentage: 50,
    status: "on_track",
  },
];

render(<BudgetProgressSection budgetProgress={mockBudgetProgress} />);
```

**What to Mock:**
- Environment globals (ResizeObserver, window APIs)
- Data props to components (fixtures passed as props)
- External dependencies (only if unavoidable)

**What NOT to Mock:**
- DOM methods (use testing-library instead)
- Internal component behavior (test through rendered output)
- Pure utility functions (test directly, don't mock)
- Supabase/database calls (avoid in tests; unit test business logic separately if needed)

**Database/API Calls:**
- NOT mocked in component tests (components use props instead)
- Data is passed as mock fixtures through props
- Example: `BudgetProgressSection` receives pre-computed `budgetProgress` array
- Server-side data fetching happens outside tests (in Next.js server components)

## Fixtures and Factories

**Test Data:**

```typescript
// From tests/components/budget-progress.test.tsx
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
];
```

**Fixture Location:**
- Defined at top of test file (in "Mock Data" section)
- Not in separate factory files (too simple for MVP)
- Include all required fields to match type signatures
- Vary fixture data to test different scenarios (on_track, warning, over_budget)

## Coverage

**Requirements:**
- No minimum coverage threshold enforced
- Coverage is tracked locally only (not CI-enforced)
- MVP focuses on preventing regressions, not coverage metrics

**View Coverage:**
```bash
bun run test -- --coverage
```

**Philosophy:**
- Coverage percentage is not a goal for MVP
- Testing exists to prevent demo-breaking bugs
- Business logic bugs are caught during manual testing
- Infrastructure (imports, rendering) is tested; complex logic is manually verified

## Test Types

**Unit Tests (Pure Functions):**

From `tests/utils/charts.test.ts`:
```typescript
describe("getCategoryColor", () => {
  it("returns correct color for known expense categories", () => {
    expect(getCategoryColor("Food")).toBe("#ef4444");
    expect(getCategoryColor("Rent")).toBe("#f97316");
  });

  it("returns fallback color for unknown categories", () => {
    expect(getCategoryColor("NonExistent")).toBe(CATEGORY_COLORS.Other);
  });
});
```

- Scope: Pure utility functions with no side effects
- No setup required; direct function calls
- Assertions are simple: input → expected output
- Examples: `getCategoryColor()`, `toPieChartData()`, `formatAxisCurrency()`

**Component Render Tests:**

From `tests/components/budget-progress.test.tsx`:
```typescript
describe("BudgetProgressSection", () => {
  it("renders without crashing with budget data", () => {
    const { container } = render(
      <BudgetProgressSection budgetProgress={mockBudgetProgress} />
    );
    expect(container).toBeTruthy();
  });

  it("renders empty state when no budgets exist", () => {
    render(<BudgetProgressSection budgetProgress={[]} />);
    expect(screen.getByText("Budget Tracking")).toBeTruthy();
  });

  it("displays category names", () => {
    render(<BudgetProgressSection budgetProgress={mockBudgetProgress} />);
    expect(screen.getByText("Food")).toBeTruthy();
    expect(screen.getByText("Entertainment")).toBeTruthy();
  });
});
```

- Scope: Client components render with mock data
- Setup: Mock data fixtures, render with props
- Assertions: Check text content, existence of elements
- Does NOT test: Database calls, user interactions, navigation

**Smoke Tests:**

From `tests/smoke/imports.test.ts`:
```typescript
describe("Smoke: Critical Module Imports", () => {
  it("imports BudgetProgressSection without errors", async () => {
    const module = await import(
      "@/components/dashboard/BudgetProgressSection"
    );
    expect(module.BudgetProgressSection).toBeDefined();
  });

  it("imports dashboard barrel export without errors", async () => {
    const module = await import("@/components/dashboard");
    expect(module.BudgetProgressSection).toBeDefined();
    expect(module.SpendingByCategoryChart).toBeDefined();
  });
});
```

- Scope: Verify application builds and critical modules import
- No rendering or execution of logic
- Catches: Broken imports, circular dependencies, syntax errors
- Examples: Module import validation, API route existence checks

## Common Patterns

**Async Testing:**

```typescript
// From tests/smoke/imports.test.ts
it("imports BudgetProgressSection without errors", async () => {
  const module = await import(
    "@/components/dashboard/BudgetProgressSection"
  );
  expect(module.BudgetProgressSection).toBeDefined();
});
```

- Use `async` on test function and `await` on async operations
- Async imports: `await import("@/path")`
- Async functions: `await functionName()`

**Error Testing:**

Error testing is minimal in MVP. When needed:
```typescript
it("returns validation errors for missing fields", () => {
  const result = validateTransaction({});
  expect(result.valid).toBe(false);
  expect(result.errors).toContain("Missing external_id");
});
```

- Test validation logic that returns error arrays
- NOT testing thrown exceptions (avoids complex try/catch in tests)
- NOT testing API error responses (requires mocking)

**Conditional Rendering:**

```typescript
it("renders empty state when no budgets exist", () => {
  render(<BudgetProgressSection budgetProgress={[]} />);
  expect(screen.getByText("Set monthly budgets")).toBeTruthy();
});

it("renders budget cards when budgets exist", () => {
  render(<BudgetProgressSection budgetProgress={mockBudgetProgress} />);
  expect(screen.getByText("Food")).toBeTruthy();
});
```

- Test both branches: empty state and data state
- Pass different prop values to trigger conditionals

## Environment Setup

**Setup File:** `tests/setup.ts`

```typescript
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Clean up DOM after each test to prevent state leakage
afterEach(() => {
  cleanup();
});

// Stub ResizeObserver (not available in jsdom, required by Recharts)
vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
```

**Vitest Config:** `vitest.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- `jsdom` simulates browser DOM
- `setupFiles` runs cleanup and mocks
- `include` pattern finds all test files
- `alias` provides `@/` path mapping

## What Is NOT Tested

**Explicitly Out of Scope (by design):**
- Database access (lib/db/*) — Requires Supabase test environment
- API routes (/api/*) — Requires request mocking; low ROI
- Import pipeline — Complex async; tested manually
- Auth flows — Requires Supabase Auth mocking
- UI interactions — No user-event tests (manual testing sufficient)
- Legacy OopsBudgeter pages — Assumed stable
- Tremor/Recharts rendering — Visual verification only
- Integration tests — Not configured

**Rationale:**
- MVP has fixed time budget
- Testing serves to prevent demo-breaking regressions only
- Manual testing during development catches business logic bugs
- Build verification (`bun run build`) catches type/import errors
- RLS and database constraints enforce data integrity

---

*Testing analysis: 2026-01-23*
