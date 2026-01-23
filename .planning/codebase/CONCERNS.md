# Codebase Concerns

**Analysis Date:** 2025-01-23

## Tech Debt

### Incomplete Placeholder Implementations

**Finance Module Stubs:**
- Issue: `src/lib/finance/index.ts` exports placeholder functions with TODO comments and empty implementations
- Files: `src/lib/finance/index.ts` (lines 10-124)
  - `calculateDashboardSummary()` - returns basic totals only
  - `calculateCategoryBreakdown()` - placeholder implementation
  - `calculateTrendData()` - returns empty array
  - `calculateBudgetProgress()` - returns hardcoded zero values
- Impact: Dashboard aggregation logic and trend charts cannot be properly implemented until these are filled in. Currently blocking advanced reporting features.
- Fix approach: Implement real aggregation logic based on database queries. See `docs/DASHBOARD_STRATEGY.md` for specifications.

**Notifications Skeleton:**
- Issue: `src/lib/notifications/index.ts` has eslint-disable for unused vars and incomplete functions
- Files: `src/app/api/notifications/route.ts` (lines 1-84)
  - GET endpoint returns hardcoded placeholder data
  - POST endpoint is unimplemented (returns dummy response)
  - PATCH endpoint is unimplemented (mark as read not functional)
- Impact: Notification persistence and retrieval is not functional. Users will always see the same placeholder notification.
- Fix approach: Implement database query layer for notifications table once persistence schema is available.

### Dependency Conflicts

**Package Manager Inconsistency:**
- Issue: `package.json` uses npm scripts and npm version commands, but CLAUDE.md mandates bun-only usage
- Files: `package.json` (lines 5-16)
- Impact: Team members may inadvertently use npm, bypassing bun-specific optimizations. CI/CD scripts will fail if npm is invoked.
- Fix approach: Replace all npm scripts with bun equivalents. Update CI/CD to enforce `bun` only.

**Multiple Database Drivers Installed:**
- Issue: package.json includes multiple database packages that may conflict
- Files: `package.json` (lines 35, 47-48, 52)
  - `better-sqlite3` v11.8.1 (local SQLite)
  - `mongoose` v8.12.1 (MongoDB ORM)
  - `mysql2` v3.13.0 (MySQL driver)
  - `pg` v8.14.0 (PostgreSQL driver)
- Impact: Code confusion about which database is authoritative. Supabase (PostgreSQL) is the canonical source, but having SQLite, MongoDB, and MySQL drivers in dependencies creates ambiguity.
- Fix approach: Remove `better-sqlite3`, `mongoose`, and `mysql2`. Keep only `pg` and `@supabase/supabase-js`. These are likely legacy dependencies from OopsBudgeter.

### Disabled ESLint Rules

**Unused Variables Suppression:**
- Issue: Two files disable the `@typescript-eslint/no-unused-vars` rule entirely
- Files:
  - `src/lib/finance/index.ts` (line 1) - because functions are stubs
  - `src/lib/notifications/index.ts` (line 1) - incomplete implementation
- Impact: Future developers may not notice when new code introduces unused variables. Makes codebase harder to maintain.
- Fix approach: Remove these disables once functions are implemented. Use inline `// eslint-disable-next-line` only when necessary.

**React Hooks Dependency Bypass:**
- Issue: `src/contexts/BudgetContext.tsx` disables exhaustive-deps check
- Files: `src/contexts/BudgetContext.tsx` (line 97)
- Impact: Effect dependencies may be incomplete, leading to stale closures or missed updates.
- Fix approach: Review the dependency array and either include proper dependencies or document why skipping is safe.

---

## Security Considerations

### Exposed Credentials in Repository

**Critical: .env.local Committed to Git:**
- Risk: All sensitive values are stored in `.env.local` and checked into version control
- Files: `.env.local` (lines 1-7)
  - `PASSCODE=123456` - trivial auth code
  - `JWT_SECRET=ermyouneeda32tokencodeherefrfr` - weak secret exposed
  - `DATABASE_URL` - Supabase connection string with password visible
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - JWT token visible
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - API key visible
- Current mitigation: This is noted as a demo/development environment, but credentials should still be protected
- Recommendations:
  1. Add `.env.local` to `.gitignore` immediately
  2. Rotate all exposed credentials in Supabase console
  3. Use `.env.example` template instead
  4. For production: use environment secrets through deployment platform

### Missing CSRF Protection

**Issue: No CSRF token validation on state-changing requests**
- Files: `src/app/api/import/route.ts`, `src/app/api/budgets/route.ts`
- Risk: POST endpoints accept requests without verifying origin. Cross-site requests could import transactions or modify budgets.
- Current mitigation: Authentication check (Supabase session) provides some protection
- Recommendations:
  1. Validate Origin and Referer headers
  2. Implement SameSite cookie attribute (check Supabase configuration)
  3. For sensitive operations, require additional verification (e.g., re-authentication)

### Weak Mock Data Determinism vs. Realism

**Issue: Deterministic hashing used for generating transaction IDs**
- Files: `src/lib/mock/index.ts` (lines 73-88)
- Risk: Using simple djb2 hash instead of cryptographic hash. While documented as non-secure (line 71), it could create hash collisions for adversarial seeds.
- Impact: Low for MVP, but if mock API is ever exposed to real users, collisions could cause duplicate imports.
- Fix approach: Use `crypto.subtle.digest()` for hash generation instead of manual djb2 algorithm, even if not cryptographically required.

---

## Performance Bottlenecks

### Unoptimized Analytics Component

**Issue: Large Analytics component with inline calculations and no memoization**
- Files: `src/components/common/Analytics.tsx` (592 lines)
- Problem:
  - Line 44: Calls `getMonthlyTrends(transactions)` on every render
  - Lines 47-62: Recalculates category totals without caching
  - Lines 72-93: Rebuilds net worth trend data on every render
  - No React.memo() or useMemo() to prevent re-renders
- Impact: With 1000+ transactions, component becomes sluggish. Switching date ranges or filters causes full recalculation.
- Improvement path:
  1. Wrap calculation logic in `useMemo()` with transaction list as dependency
  2. Extract chart data generation into separate, memoized functions
  3. Consider pagination if transaction list grows beyond 5000 items

### N+1 Query Pattern in Budget Calculations

**Issue: `calculateMonthlySpending()` fetches all transactions, then calculates in-memory**
- Files: `src/lib/budgets/index.ts` (lines 122-149)
- Problem:
  - Calls `getTransactions({ fromDate, toDate })` which fetches entire month's data
  - Then iterates through ALL transactions to sum by category
  - No database-side aggregation (GROUP BY in SQL)
- Impact: If user has 50,000 transactions in a month, all are fetched to memory and recalculated on each request
- Improvement path:
  1. Add SQL aggregation function to `src/lib/db/transactions.ts` that groups by category server-side
  2. Return only category summaries, not full transaction rows
  3. Example: `SELECT category, SUM(amount), COUNT(*) FROM bb_transactions WHERE user_id = ? AND booking_date BETWEEN ? AND ?`

### Large NewTransaction Component

**Issue: Complex form component (468 lines) with all UI and logic tightly coupled**
- Files: `src/components/transactions/NewTransaction.tsx` (468 lines)
- Problem:
  - Form state management, validation, submission all in one component
  - No separation of concerns
  - Likely causes full component re-renders on field changes
- Impact: Slow form interactions, especially with many categories or accounts
- Improvement path:
  1. Extract form state to a custom hook (`useTransactionForm`)
  2. Split into smaller sub-components (FormFields, CategorySelect, DatePicker)
  3. Memoize expensive sub-components

---

## Fragile Areas

### BudgetContext Global State Complexity

**Issue: Context manages 13+ state values with complex filter/sort logic**
- Files: `src/contexts/BudgetContext.tsx` (394 lines)
- Why fragile:
  - Multiple interdependent state variables (transactions, filteredTransactions, sortKey, sortOrder, etc.)
  - Filtering logic depends on multiple state variables (lines 80-98)
  - Missing dependency in useEffect (line 97 disables exhaustive-deps check)
  - Cached state with useRef but unclear invalidation strategy (line 77)
- Safe modification:
  1. Run full test suite after any changes to this file
  2. Test all filter/sort combinations
  3. Verify BudgetContext still provides consistent data to child components
- Test coverage: No unit tests for context logic. Only end-to-end tests via components.

### Import Pipeline with External ID Dependency

**Issue: Import idempotency relies entirely on external_id uniqueness**
- Files: `src/lib/import/index.ts`, `src/lib/db/transactions.ts`
- Why fragile:
  - `transformMockTransaction()` extracts external_id from mock API (line 142)
  - Database has UNIQUE(user_id, external_id) constraint
  - If external_id generation changes, duplicate imports will fail
  - If external_id is null/missing, upsert behaves as insert (creates duplicates)
- Safe modification:
  1. Never change external_id generation logic without migration plan
  2. Add validation that external_id is always present before upsert
  3. Write tests that verify same import twice = same result
- Test coverage: Import logic tested in `tests/smoke/imports.test.ts`, but idempotency edge cases not covered

### Mixed Legacy and New Code Patterns

**Issue: Codebase contains both OopsBudgeter legacy code and new BetterBudget code with different patterns**
- Files: Multiple locations
  - Legacy: Uses drizzle-orm schemas (not visible in exploration but referenced in package.json)
  - New: Direct Supabase client calls
  - Legacy: Classes and inheritance-based components
  - New: Functional components with hooks
- Why fragile:
  - Developers may follow the wrong pattern by copying existing code
  - Two authentication systems coexist (legacy PasscodeWrapper + new Supabase)
  - Database queries inconsistent (drizzle vs. raw Supabase)
- Safe modification:
  1. Document which pattern to follow (new Supabase + functional components)
  2. When touching legacy code, consider whether to migrate or leave as-is
  3. Keep legacy and new code separate (legacy/* routes, new/* routes)

---

## Database & Data Flow Concerns

### Account Balance Not Updated After Import

**Issue: `updateAccountBalance()` is called but balance calculation may not reflect actual imported transactions**
- Files: `src/lib/import/index.ts` (function exists but implementation unclear), `src/lib/db/accounts.ts`
- Risk:
  - Imported transactions update bb_transactions table
  - But bb_accounts.balance is manually updated (not calculated from transactions)
  - If import fails mid-way, balance becomes stale
  - No transaction/rollback mechanism if partial import occurs
- Fix approach:
  1. Calculate balance as: `SUM(amount) WHERE account_id = ? AND type = 'income'` - `SUM(ABS(amount)) WHERE account_id = ? AND type = 'expense'`
  2. Trigger balance recalculation after successful import completion
  3. Add database transaction wrapper around entire import process

### Missing Error Recovery in Import

**Issue: Import endpoint aggregates errors but doesn't roll back partial imports**
- Files: `src/app/api/import/route.ts` (lines 151-180)
- Problem:
  - Loop imports each account
  - If account N fails, accounts 1 to N-1 are already imported
  - No way to rollback those imports
  - Error details collected but not actionable for retry
- Impact: If import fails halfway, database is left in inconsistent state
- Fix approach:
  1. Wrap import in database transaction
  2. Either all accounts succeed or all fail
  3. Return clearer error indicating which specific account failed and why

### Notification Persistence Not Implemented

**Issue: Notifications are generated but not stored (MVP design choice)**
- Files: `src/lib/notifications/index.ts`, `src/app/api/notifications/route.ts`
- Risk:
  - Notifications exist only in memory (Sonner toast)
  - If user refreshes page, all notifications disappear
  - No notification history
  - Budget alerts can't be tracked to verify they were shown
- Current mitigation: MVP choice noted in comments
- Post-MVP fix: Implement `bb_notifications` table with read/unread status, creation timestamp, and soft-delete

---

## Scaling Limits

### Fixed Category List Not Extensible

**Issue: Expense and income categories are hardcoded constants**
- Files: `src/utils/mapping/index.ts`, `src/constants/` (referenced in budgets validation)
- Current capacity: Fixed set of ~15 categories
- Limit: Users cannot add custom categories. Reports using unmapped merchants as "Other".
- Scaling path:
  1. Add `bb_categories` table with user-defined categories
  2. Allow users to create and customize categories
  3. Implement category mapping rules (merchant → category)

### Mock API Data Volume Limits

**Issue: Mock transaction generation is deterministic but not paginated**
- Files: `src/lib/mock/index.ts` (line 39 calculates all dates, no limit)
- Current capacity: Generates ~90 days of transactions per account
- Limit: For large account histories (5+ years), retrieval becomes slow
- Scaling path:
  1. Add pagination to mock API endpoints
  2. Support date range limiting in `generateMockTransactions()`
  3. Consider caching generated data

### No Batch Processing for Imports

**Issue: Import processes one account at a time in sequence**
- Files: `src/app/api/import/route.ts` (lines 151-180)
- Current capacity: 2-3 accounts import ~5-10 seconds
- Limit: With 10+ accounts, import takes 30+ seconds. Can timeout.
- Scaling path:
  1. Implement parallel import with Promise.all() (but careful with database limits)
  2. Add import queue/background job system
  3. Return import status ID and poll for completion

---

## Missing Critical Features

### No Rate Limiting on API Endpoints

**Issue: Import, budget, and transaction endpoints have no rate limiting**
- Files: `src/app/api/import/route.ts`, `src/app/api/budgets/route.ts`, etc.
- Risk: User could spam import endpoint 1000x in rapid succession, causing database load
- Fix: Implement rate limiting middleware (e.g., `Ratelimit` package or Vercel's middleware)

### No Input Validation on Budget Limits

**Issue: Budget limits not validated for reasonable ranges**
- Files: `src/app/api/budgets/route.ts` (lines 69-74)
- Current check: `budget.limit <= 0`
- Missing:
  - Maximum limit (prevent billion-dollar budgets)
  - Currency-aware validation (e.g., USD vs. JPY have different ranges)
  - Fraction validation (no -1.50 limits)
- Fix: Add validation for min/max per currency

### No Automatic Transaction Categorization Training

**Issue: Category mapping is hardcoded rules (see `src/lib/import/index.ts` lines 71-117)**
- Risk: New merchants won't be recognized. All unmapped transactions go to "Other"
- MVP approach: Acceptable (hardcoded rules sufficient for demo)
- Post-MVP: Implement user feedback loop where users can correct categories, and system learns

---

## Test Coverage Gaps

### Missing Integration Tests for Import Pipeline

**What's not tested:**
- Files: `src/lib/import/index.ts`, `src/lib/db/transactions.ts`
- Specific gaps:
  - Idempotency (running import twice produces same result)
  - Transaction rollback on partial failure
  - Balance updates after import
  - Category mapping for edge cases (empty description, special characters)
- Risk: Importer could be broken and not caught until user runs it
- Priority: **High** - import is critical path

### No Tests for Budget Calculation Logic

**What's not tested:**
- Files: `src/lib/budgets/index.ts`
- Gaps:
  - `calculateMonthlySpending()` with various transaction patterns
  - Budget status transitions (on_track → warning → over_budget)
  - Edge cases (negative amounts, zero budget, no transactions)
- Risk: Budget alerts could display wrong status
- Priority: **Medium** - affects UX but not data integrity

### Analytics Component Render Tests Limited

**What's not tested:**
- Files: `src/components/common/Analytics.tsx`
- Gaps:
  - Actual chart rendering (tests mock Recharts)
  - Pie chart data correctness
  - Net worth trend calculation
  - Empty state handling (no transactions)
- Risk: Charts could show wrong data without breaking tests
- Priority: **Medium** - visual correctness not validated

### No End-to-End Tests

**What's missing:**
- Complete user flows (login → link bank → import → set budget → view dashboard)
- Multi-account scenarios
- Session persistence and refresh
- Current state: 22 unit tests passing, but no E2E coverage
- Risk: Regressions in user-facing flows not caught
- Priority: **High** - critical for production release

---

## Known Limitations & Workarounds

### Recharts Warnings in JSDOM

**Issue: Recharts emits width/height warnings when running tests in jsdom**
- Cause: jsdom has no layout engine, so SVG elements have no dimensions
- Workaround: Warnings suppressed in `tests/setup.ts` (acceptable for MVP)
- Impact: No visual validation of charts, only that they render without errors
- Fix: Use visual regression testing tool (Percy, Chromatic) in CI/CD

### Dashboard Page Not Directly Testable

**Issue: Dashboard is an async server component with cookie access**
- Files: `src/app/dashboard/page.tsx`
- Why: Next.js server components can't be rendered in jsdom
- Workaround: Test child components (BudgetProgressSection, SpendingByCategoryChart) separately
- Limitation: Page-level integration not tested
- Fix: Use Playwright or Cypress for E2E tests instead

### Legacy OopsBudgeter Code Still in Use

**Issue: Codebase contains legacy code that conflicts with new architecture**
- Files:
  - `src/lib/monthlyTrends.ts` - legacy calculation logic
  - `src/lib/my1DollarAI.ts` - legacy analytics
  - `src/contexts/AppContext.tsx` - legacy context
- Why kept: Removing would break existing routes (/legacy, /analytics, /achievements)
- Migration plan needed: Document which legacy code is deprecated vs. reusable

---

## Recommendations by Priority

### Critical (Fix Before Production)

1. **Remove .env.local from version control** - Rotate all credentials
2. **Implement import transaction wrapping** - Prevent partial imports
3. **Add rate limiting** - Protect API endpoints
4. **Add E2E tests** - Validate complete user flows

### High (Fix in Next Phase)

1. **Remove unused database drivers** - Clean up dependencies
2. **Complete finance module** - Implement dashboard aggregations
3. **Implement notification persistence** - Allow users to see notification history
4. **Fix eslint disables** - Remove global disables once code is complete

### Medium (Improve Code Quality)

1. **Optimize Analytics component** - Add memoization
2. **Refactor BudgetContext** - Better state management
3. **Add budget calculation tests** - Improve confidence in calculations
4. **Remove package manager scripts conflict** - Enforce bun-only

### Low (Post-MVP Enhancements)

1. **Implement custom categories** - Allow user-defined categories
2. **Add category learning** - Train on user corrections
3. **Implement parallel imports** - Speed up multi-account import
4. **Add batch transaction processing** - Support large imports

---

*Concerns audit: 2025-01-23*
