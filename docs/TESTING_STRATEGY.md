# TESTING STRATEGY (MVP)

## Document Purpose

This document defines the minimal, MVP-appropriate testing strategy for the BetterBudget project using Vitest. It establishes what is tested, what is not, and why.

---

## 1. Testing Philosophy

### Role of Testing in This MVP

BetterBudget is a school project with a **strict time budget**, maintained by **junior developers**. Testing serves a single purpose here:

> **Prevent regressions that would break the demo.**

Testing is NOT used for:
- Proving correctness of business logic
- Achieving coverage metrics
- Replacing manual verification
- Simulating user journeys

### Why Smoke Tests and Basic Render Tests Are Sufficient

1. **Time constraint**: The project has a fixed deadline. Writing comprehensive tests would consume time better spent on features and stability.
2. **Team experience**: Junior developers benefit more from readable code with comments than from complex test infrastructure they can't maintain.
3. **Demo-focused**: The app needs to start, render, and not crash. That's the bar.
4. **Build verification already exists**: `bun run typecheck` and `bun x next build` already catch type errors and compilation issues.

### Why Full Coverage Is Explicitly Out of Scope

| Coverage Type | Why Out of Scope |
|---------------|-----------------|
| Unit tests for business logic | Business logic is simple; bugs are caught during manual testing |
| Integration tests (DB) | Requires Supabase test environment; too complex for MVP |
| E2E tests | Requires Playwright/Cypress setup; maintenance cost too high |
| Visual regression | Requires screenshot tooling; overkill for school project |
| Performance tests | Not a requirement for MVP; app is small |

---

## 2. Test Scope

### IN SCOPE

| Test Target | What Is Verified | Why |
|-------------|-----------------|-----|
| Application build | `next build` completes without errors | Catches import errors, type issues, dead code |
| Dashboard page render | Page component renders without throwing | Core feature must not crash |
| BudgetProgressSection render | Component renders with mock data | Critical ADHD-friendly feature |
| SpendingByCategoryChart render | Component renders with mock data | Tremor/Recharts integration point |
| Utility functions | Pure functions return expected values | Easy to test, high confidence value |
| Auth boundary (conceptual) | Middleware matcher config is correct | Prevents accidental public exposure |

### OUT OF SCOPE

| Area | Why Not Tested | Risk Mitigation |
|------|---------------|-----------------|
| Database access (lib/db/*) | Requires live Supabase connection | Manual testing during development |
| API routes (/api/*) | Requires request mocking; low ROI | Build verification catches syntax errors |
| Import pipeline | Complex async flow; needs DB | Idempotency guaranteed by DB constraints |
| Auth flows (login/logout) | Requires Supabase Auth mocking | Manual testing; middleware config verified |
| Legacy OopsBudgeter pages | Not modified; assumed stable | Build verification catches breakage |
| UI interactions (clicks, forms) | Requires @testing-library/user-event | Manual testing sufficient for MVP |
| Tremor/Recharts rendering | Requires canvas/SVG mocking | Visual verification during development |

---

## 3. Test Types

### USED

#### Smoke Tests
- **Purpose**: Verify the application builds and critical paths don't crash
- **Scope**: Build stability, key component mounting
- **Example**: "Dashboard page renders without throwing an error"
- **Why chosen**: Lowest effort, highest confidence-per-line-of-test

#### Simple Render Tests
- **Purpose**: Verify components mount with expected props without errors
- **Scope**: Dashboard components with mock data
- **Example**: "BudgetProgressSection renders 3 budget cards when given 3 items"
- **Why chosen**: Catches import breaks, prop type mismatches, conditional logic errors

#### Pure Function Tests
- **Purpose**: Verify deterministic helper functions
- **Scope**: `utils/charts`, `utils/mapping`, formatting helpers
- **Example**: "getCategoryColor('Food') returns '#ef4444'"
- **Why chosen**: Zero setup, fast, high confidence

### NOT USED

| Test Type | Why Not Used |
|-----------|-------------|
| Integration tests | Require database/API setup; too complex for MVP |
| E2E tests | Require browser automation (Playwright/Cypress); maintenance burden |
| Snapshot tests | Brittle; break on every styling change; low signal |
| Visual regression | Require screenshot comparison tooling |
| Load/performance tests | Not a requirement; app is small |
| Contract tests | No real external APIs to validate against |

---

## 4. Test Structure

### Why Vitest

| Reason | Detail |
|--------|--------|
| Speed | Fastest test runner for Vite/Next.js projects |
| Compatibility | Native ESM support; works with React 19 |
| Familiarity | Jest-compatible API (describe/it/expect) |
| Minimal config | Works out of the box with TypeScript |
| Ecosystem | Well-maintained; active community |

### Directory Structure (Implemented)

```
tests/
├── setup.ts                      # Cleanup + ResizeObserver stub
├── smoke/
│   └── imports.test.ts           # Verifies critical module imports
├── components/
│   ├── budget-progress.test.tsx  # BudgetProgressSection render
│   └── spending-chart.test.tsx   # SpendingByCategoryChart render
└── utils/
    └── charts.test.ts            # Chart utility functions
```

### Why `tests/` (Not `__tests__` or Co-Located)

1. **Separation of concerns**: Tests are infrastructure, not application code
2. **Visibility**: Junior developers can find all tests in one place
3. **No clutter**: Keeps `src/` focused on production code
4. **Easy exclusion**: Simple to exclude from builds

### Naming Conventions

- Test files: `<subject>.test.ts` or `<subject>.test.tsx`
- Describe blocks: Name of the component or function under test
- Test names: Plain English, describe expected behavior
  - `"renders without crashing when given valid data"`
  - `"shows empty state when budgetProgress is empty"`
  - `"returns correct hex color for known categories"`

### Grouping

Tests are grouped by **layer**, not by feature:
- `smoke/` — Does the app build and start?
- `components/` — Do key components render?
- `utils/` — Do pure functions return correct values?

---

## 5. Explicit Decisions & Non-Decisions

### Decisions Made

| Decision | Rationale |
|----------|-----------|
| Use Vitest (not Jest) | Faster, better ESM support, simpler config |
| Tests in `tests/` | Clear separation, easy to find |
| Mock Supabase calls | Components shouldn't need a database to render |
| No coverage threshold | Coverage metrics add pressure without value at MVP scale |
| No CI integration | School project; local verification is sufficient |

### Non-Decisions (Deferred)

| Topic | Why Deferred |
|-------|-------------|
| Coverage percentage target | Not meaningful until test suite grows |
| E2E framework choice | Only needed post-MVP |
| Test database setup | Only needed if DB-level testing is added |
| CI/CD pipeline | Only needed if team grows or deployment automates |

---

## 6. Future Testing (Post-MVP)

### Phase 2: After Demo

| Addition | Trigger Condition |
|----------|-------------------|
| Budget calculation unit tests | When budget logic becomes more complex |
| Import pipeline integration tests | When real banking APIs are introduced |
| API route tests | When API surface grows beyond current scope |
| Auth flow E2E tests | When authentication bugs are reported |

### Phase 3: Production Readiness

| Addition | Trigger Condition |
|----------|-------------------|
| Playwright E2E | When app moves beyond school project |
| Visual regression (Chromatic) | When design system stabilizes |
| Load testing | When user base grows |
| Coverage enforcement | When team agrees on thresholds |

### How Current Strategy Supports Future Expansion

1. **Vitest is extensible**: Same runner supports unit, integration, and component tests
2. **`tests/` directory is modular**: New folders can be added without restructuring
3. **Mock patterns established**: Supabase mocking pattern can be reused for integration tests
4. **No technical debt**: Minimal tests don't create maintenance burden for future test authors

---

## 7. Dependencies (Installed)

```json
{
  "devDependencies": {
    "vitest": "4.0.18",
    "@vitejs/plugin-react": "5.1.2",
    "@testing-library/react": "16.3.2",
    "@testing-library/jest-dom": "6.9.1",
    "jsdom": "27.4.0"
  }
}
```

All versions are the latest at time of installation. `jsdom` is required for simulating browser APIs in the test environment.

---

## 8. Summary

| Aspect | Decision |
|--------|----------|
| Test runner | Vitest |
| Test types | Smoke + Render + Pure function |
| Scope | Build stability, key component renders, utility functions |
| Coverage target | None (not meaningful at MVP) |
| CI integration | None (local only) |
| Maintenance cost | Minimal (< 10 test files) |
| Junior-friendly | Yes (simple assertions, clear naming) |

---

**Document Status**: Implemented. 22 tests passing across 4 test files. See `docs/MVP_TESTS_REPORT.md` for details.