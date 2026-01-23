# Testing Patterns

**Analysis Date:** 2026-01-23

## Test Framework

**Runner:**
- Vitest 4.0.18
- Config: `vitest.config.ts`
- Environment: jsdom (simulates browser for React component testing)

**Assertion Library:**
- Vitest built-in expect()
- @testing-library/jest-dom matchers for DOM assertions
- @testing-library/react for component rendering

**Run Commands:**
```bash
bun run test              # Run all tests (single run)
bun run test --watch     # Watch mode (re-run on file changes)
bun run test --coverage  # Generate coverage report
```

Note: Package.json `test` script runs `vitest run` (single execution, no watch).

## Test File Organization

**Location:**
- Centralized in `tests/` directory at project root
- Not co-located with source files (separate from implementation)

**Naming:**
- Convention: `*.test.ts` or `*.test.tsx`
- Example: `charts.test.ts`, `spending-chart.test.tsx`

**Structure:**
```
tests/
├── setup.ts                      # Global test setup
├── smoke/
│   └── imports.test.ts           # Module import smoke tests
├── utils/
│   └── charts.test.ts            # Utility function tests
└── components/
    ├── spending-chart.test.tsx    # Component render tests
    └── budget-progress.test.tsx   # Component render tests
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Module or Component Name", () => {
  it("does something specific", () => {
    // Arrange
    const input = ...;

    // Act
    const result = ...;

    // Assert
    expect(result).toBe(...);
  });

  it("handles edge case", () => {
    // Test code
  });
});
```

**Patterns:**
- Organize tests by logical feature (one describe per function/component)
- Use nested describe blocks for related test groups
- Descriptive test names starting with lowercase: `it("renders without crashing with category data")`
- Three-phase pattern: Arrange → Act → Assert

Example from `charts.test.ts`:
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

## Setup and Teardown

**Global Setup:**
- File: `tests/setup.ts`
- Runs before all tests
- Configures:
  - jest-dom matchers for DOM assertions
  - DOM cleanup between tests (prevents state leakage)
  - ResizeObserver stub (required by Recharts, not available in jsdom)

Setup code:
```typescript
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Clean up DOM after each test
afterEach(() => {
  cleanup();
});

// Stub ResizeObserver (not available in jsdom)
vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
```

## Test Data and Mocks

**Fixtures:**
- Defined inline within test files
- No separate fixture files yet

**Mock Data Pattern:**
```typescript
const mockCategoryData = [
  { category: "Food", amount: 250, transactionCount: 10 },
  { category: "Rent", amount: 800, transactionCount: 1 },
];
```

**Component Mocks:**
- For complex dependencies, mock data is placed at top of test file
- Budget progress tests use representative mock data showing all three status states

Example from `budget-progress.test.tsx`:
```typescript
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
  // ... more test data
];
```

## Mocking Patterns

**Framework:** Vitest's built-in `vi` for stubbing

**Patterns:**
- Use `vi.stubGlobal()` for browser APIs (e.g., ResizeObserver)
- Stubs are global and set up once in `tests/setup.ts`
- Component mocks use direct props instead of complex setup

**What to Mock:**
- Browser APIs not available in jsdom (ResizeObserver, localStorage, etc.)
- External libraries that can't run in test environment

**What NOT to Mock:**
- User auth (use smoke tests for import verification instead)
- Supabase/database calls (test utility functions independently, use component render tests)
- Component prop behavior (verify with rendered output)

## Fixture and Factory Patterns

**Test Data Location:**
- Inline in test files under "Mock Data" section
- Separated from test cases with comments

**Pattern:**
- Constants for reusable mock data at top of describe block
- Data structured to match domain types exactly

Example:
```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const mockCategoryData = [...];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("SpendingByCategoryChart", () => {
  it("renders", () => { ... });
});
```

## Coverage Requirements

**Target:** Not enforced (no CI/CD checks configured)

**View Coverage:**
```bash
bun run test --coverage
```

**Current Focus:**
- MVP covers smoke tests (imports work) and utility functions
- Component render tests cover critical dashboard components
- No coverage enforcement to allow rapid development

## Test Types

**Unit Tests:**
- Scope: Pure utility functions (no side effects, no I/O)
- Example: `tests/utils/charts.test.ts` tests color mapping and chart data transformation
- No mocking needed (unless testing error handling)
- Fast execution

Example unit test:
```typescript
describe("toPieChartData", () => {
  it("transforms category breakdown to pie chart format", () => {
    const input = [
      { category: "Food", amount: 250 },
      { category: "Rent", amount: 800 },
    ];

    const result = toPieChartData(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: "Food",
      value: 250,
      fill: "#ef4444",
    });
  });
});
```

**Integration Tests:**
- Scope: Component rendering with mock data
- Example: `tests/components/spending-chart.test.tsx`
- Uses `@testing-library/react` to render components
- Verifies component mounts and displays expected content

Example integration test:
```typescript
describe("SpendingByCategoryChart", () => {
  it("renders without crashing with category data", () => {
    const { container } = render(
      <SpendingByCategoryChart data={mockCategoryData} />
    );
    expect(container).toBeTruthy();
  });

  it("displays category names in legend", () => {
    render(<SpendingByCategoryChart data={mockCategoryData} />);
    expect(screen.getByText("Food")).toBeTruthy();
  });
});
```

**E2E Tests:**
- Not implemented (out of MVP scope)
- Would require Playwright or Cypress
- Would test full user flows (link bank → import → view dashboard)

**Smoke Tests:**
- Scope: Verify critical modules can be imported without errors
- Example: `tests/smoke/imports.test.ts`
- Catches broken imports, circular dependencies, config issues

Example smoke test:
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

## Common Testing Patterns

**Async Testing:**
```typescript
// Using async/await
it("imports module", async () => {
  const module = await import("@/utils/charts");
  expect(module.getCategoryColor).toBeDefined();
});

// Vitest automatically handles Promise returns
it("async function works", async () => {
  const result = await someAsyncFunction();
  expect(result).toBeTruthy();
});
```

**Error Testing:**
- Not yet used in MVP tests
- Would use try/catch or expect().rejects pattern when needed

**Component Rendering Edge Cases:**
```typescript
// Empty state
it("renders empty state when no data exists", () => {
  render(<SpendingByCategoryChart data={[]} />);
  expect(screen.getByText(/No expense data/)).toBeTruthy();
});

// Data validation
it("displays total expenses", () => {
  render(<SpendingByCategoryChart data={mockCategoryData} />);
  expect(screen.getByText("Total Expenses")).toBeTruthy();
});
```

## Testing Limitations and Known Issues

**jsdom SVG Support:**
- jsdom has limited SVG rendering support
- Tremor DonutChart (which uses Recharts internally) renders SVG
- Tests verify component mounts and text content, NOT chart SVG accuracy
- Visual verification of chart colors is manual

From `spending-chart.test.tsx` comments:
```typescript
/**
 * Note: The Tremor DonutChart uses Recharts internally which renders SVG.
 * jsdom has limited SVG support, so we only test that the component
 * mounts and renders its non-chart elements (legend, totals).
 *
 * Does NOT test:
 * - Chart SVG rendering accuracy
 * - Color correctness (visual verification only)
 * - Tooltip behavior
 */
```

**Server Components:**
- Dashboard page is a server component with async DB calls
- Cannot be rendered in tests without mocking Supabase
- Workaround: Test child components (which can accept mock props) instead
- Smoke tests verify child component imports work

**Styling:**
- Component tests don't verify CSS/Tailwind classes
- Tests verify structure and text content, not visual appearance
- Color and layout verified manually

## Test Documentation Pattern

All test files include:
1. File-level header comment explaining scope
2. Reference to testing strategy documentation
3. Clear description of what is and isn't tested

Example from `budget-progress.test.tsx`:
```typescript
/**
 * BudgetProgressSection Render Tests
 *
 * Verifies that the BudgetProgressSection component renders
 * without crashing with various mock data scenarios.
 *
 * Does NOT test:
 * - Database calls
 * - Real budget calculations
 * - User interactions
 *
 * @see docs/TESTING_STRATEGY.md
 */
```

## Running Tests

**Single run:**
```bash
bun run test
```

**Watch mode (development):**
```bash
bun run test --watch
```

**Specific test file:**
```bash
bun run test tests/utils/charts.test.ts
```

**Specific test case:**
```bash
bun run test -t "getCategoryColor"
```

**With coverage:**
```bash
bun run test --coverage
```

## Integration with Build

**Build command:**
```bash
bun run build
```

Does NOT run tests (testing is separate from build in this project).

**Type checking:**
```bash
bun run typecheck
```

Runs TypeScript compiler to catch type errors (separate from test runner).

---

*Testing analysis: 2026-01-23*
