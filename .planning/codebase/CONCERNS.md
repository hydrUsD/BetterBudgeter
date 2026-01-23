# Codebase Concerns

**Analysis Date:** 2026-01-23

## Tech Debt

**Analytics Component Complexity:**
- Issue: `src/components/common/Analytics.tsx` (592 lines) performs significant in-memory calculations without memoization or performance optimization
- Files: `src/components/common/Analytics.tsx`
- Impact: Component re-renders may cause visible lag when processing large transaction datasets; calculations include monthly trends, category breakdowns, net worth tracking, and 30-day predictions all computed on every render
- Fix approach: Implement `useMemo` for expensive calculations; consider moving calculations to server-side or separating into smaller memoized sub-components; profile rendering performance with large datasets

**Unfinished Finance Module:**
- Issue: `src/lib/finance/index.ts` contains skeleton functions with TODO comments indicating incomplete implementation
- Files: `src/lib/finance/index.ts`
- Impact: Functions like `calculateTrendData` return empty arrays; placeholder implementations may mask logic gaps if code is accidentally called in production
- Fix approach: Either remove unused skeleton functions or implement them fully; consolidate financial calculations currently scattered across Analytics component into this module

**Incomplete Notifications Endpoint:**
- Issue: `/api/notifications` route returns placeholder responses with `_meta.skeleton: true` flag
- Files: `src/app/api/notifications/route.ts`
- Impact: Endpoint provides no actual functionality; returns hardcoded placeholder data; blocks future notification features
- Fix approach: Implement full endpoint with database queries for notification retrieval and marking as read; or remove endpoint if not needed for MVP

**Account Balance Calculation:**
- Issue: Account balance is updated via `updateAccountBalance()` which applies a delta, but there's no reconciliation against actual transaction sums
- Files: `src/lib/db/accounts.ts`, `src/lib/import/index.ts` (line 319)
- Impact: Inconsistency possible if multiple imports occur simultaneously or if balances are manually adjusted; no audit trail
- Fix approach: Consider implementing a recalculation function that derives balance from transaction sum instead of storing separate balance; add transaction count validation

**Category Mapping Simplicity:**
- Issue: `src/lib/import/index.ts` `mapCategory()` function (lines 71-117) uses simple string matching on German merchant names
- Files: `src/lib/import/index.ts`
- Impact: Miscategorization likely for non-German merchants or unfamiliar descriptions; users cannot configure or override mappings; no learning from corrections
- Fix approach: Expand merchant patterns database; add user-defined category rules; implement ML-based categorizer for post-MVP

## Known Bugs

**Date Parsing in BudgetContext:**
- Symptoms: Potential timezone issues when parsing transaction dates in `BudgetContext`
- Files: `src/contexts/BudgetContext.tsx` (line 130)
- Trigger: Transactions created in different timezones; parsing ISO string with `parseISO()` without explicit timezone handling
- Workaround: Ensure all transaction dates are stored as UTC ISO strings in database

**Exchange Rate Fetching Silent Failure:**
- Symptoms: Exchange rates fail to load but no error is shown to user
- Files: `src/components/transactions/NewTransaction.tsx` (lines 63-69)
- Trigger: `fetchExchangeRates()` API call fails; `setExchangeRates` gets empty object but no user feedback
- Workaround: Check browser console for network errors; rates default to empty (no conversion happens)

**Sorting Logic Edge Case:**
- Symptoms: Filter by "recurring" in Analytics applies incorrect logic
- Files: `src/contexts/BudgetContext.tsx` (lines 127-128)
- Trigger: When `sortKey === "recurring"`, filter shows only recurring OR non-recurring based on that key, but logic inverts based on sort state
- Workaround: Don't rely on "recurring" filter until logic is reviewed

**Empty Transaction List Handling:**
- Symptoms: Components may render placeholders or blank states unexpectedly
- Files: `src/lib/api.ts` (line 30)
- Trigger: API fetch fails; function returns empty array with only toast error; calling code may not distinguish between "no data" and "error"
- Workaround: Check Sonner toast notifications for error messages

## Security Considerations

**Environment Variable Validation at Runtime:**
- Risk: Missing or invalid Supabase environment variables cause runtime exceptions instead of fail-fast startup validation
- Files: `src/lib/db/supabaseServer.ts` (lines 60-71)
- Current mitigation: Error thrown with helpful message; checks happen in `createServerSupabaseClient()`
- Recommendations: Add startup validation in middleware or app initialization; prevent server from starting if env vars missing

**RLS Policy Reliance:**
- Risk: Security depends entirely on Supabase RLS policies being correctly configured in database
- Files: All database query files (`src/lib/db/*.ts`), import pipeline (`src/lib/import/index.ts`)
- Current mitigation: Code includes comments about RLS; double-check on account ownership (line 257-267 in import)
- Recommendations: Add integration tests that verify RLS blocks unauthorized access; document exact RLS policy rules required; implement server-side ownership validation before critical operations

**Mock API Hardcoded in Production:**
- Risk: If code accidentally calls mock API endpoints in production instead of real banking APIs
- Files: `src/lib/mock/index.ts`, `src/app/api/mock/*` endpoints
- Current mitigation: Import pipeline uses generator directly (not HTTP); UI should never call mock API
- Recommendations: Add assertion that mock API is never called from client code; implement feature flag to disable mock endpoints in production; document that mock API is development-only

**No Rate Limiting on Import:**
- Risk: User could repeatedly trigger `/api/import` causing database load or duplicating notifications
- Files: `src/app/api/import/route.ts`
- Current mitigation: UNIQUE constraint on `external_id` prevents duplicate transactions; idempotent design
- Recommendations: Implement rate limiting on import endpoint (e.g., max 1 import per minute); add request throttling; log import attempts for audit

**Deterministic Mock Data Not Cryptographically Random:**
- Risk: Mock transaction IDs and balances are predictable (intentional for MVP, but creates false sense of realism)
- Files: `src/lib/mock/index.ts` (lines 73-88)
- Current mitigation: Documented in comments that hash is not cryptographically secure
- Recommendations: In production migration, replace with real banking API; if mock stays, document its non-randomness clearly to prevent false assumptions

## Performance Bottlenecks

**Large Transaction List Rendering:**
- Problem: `src/components/transactions/TransactionsList.tsx` and Analytics render all transactions in memory without virtualization
- Files: `src/components/common/Analytics.tsx`, `src/components/transactions/TransactionsList.tsx`
- Cause: Multiple `.map()` calls over full transaction array; no pagination or windowing
- Improvement path: Implement react-window or similar for virtualized lists; add pagination; lazy-load older months

**Monthly Trends Calculation on Every Render:**
- Problem: `getMonthlyTrends()` iterates full transaction list to build trend data structure
- Files: `src/components/common/Analytics.tsx` (line 45), `src/lib/monthlyTrends.ts`
- Cause: No caching; called on every component render
- Improvement path: Move calculation to server; memoize; implement incremental updates instead of full recalc

**Analytics Component Renders Multiple Charts:**
- Problem: Component renders 8+ separate Recharts instances in single page
- Files: `src/components/common/Analytics.tsx` (multiple Recharts components)
- Cause: No lazy loading; all charts rendered immediately
- Improvement path: Implement tabs or accordion to show one chart at a time; lazy-load chart data; consider pagination

**Exchange Rate API Called on Every Component Mount:**
- Problem: `fetchExchangeRates()` called without caching in NewTransaction component
- Files: `src/components/transactions/NewTransaction.tsx` (lines 63-69)
- Cause: No cache; no request deduplication; called every time component mounts
- Improvement path: Move to global context or React Query; cache with sensible TTL (e.g., 1 hour)

**No Database Query Caching:**
- Problem: Each server component/route handler re-queries same data
- Files: Multiple files in `src/lib/db/*`
- Cause: Supabase queries don't use caching; no Next.js revalidation/caching strategy defined
- Improvement path: Implement Next.js `revalidateTag()` strategy; add Redis caching layer for frequently accessed data

## Fragile Areas

**Import Pipeline Account Reconstruction:**
- Files: `src/lib/import/index.ts` (lines 353-357, `constructMockAccountId()`)
- Why fragile: Mock account ID reconstructed from `bank_id` and `account_type` by assuming "001" index; if index changes or multiple accounts per type exist, reconstruction fails silently
- Safe modification: Validate reconstructed ID matches account before use; consider storing original mock account ID in database instead of deriving it
- Test coverage: No tests verify this reconstruction works correctly; import test (if exists) doesn't validate account ID matching

**Budget Threshold Hardcoded:**
- Files: `src/lib/budgets/index.ts` (lines 44-49)
- Why fragile: Thresholds (80% warning, 100% over) are constants; users cannot customize; if requirements change, must modify and redeploy
- Safe modification: Add budget customization to user settings table; migrate constants to database
- Test coverage: No tests verify threshold behavior; need test for each status (on_track, warning, over_budget)

**Transaction Type Filter Logic:**
- Files: `src/contexts/BudgetContext.tsx` (lines 127-132)
- Why fragile: Filter combines multiple conditions (recurring check AND date range AND type); logic is unclear and may have edge cases
- Safe modification: Extract filter logic to named function with clear parameter names; add test cases for each combination
- Test coverage: No tests for context filtering; need unit tests for each filter type

**Date Range Calculations:**
- Files: `src/lib/budgets/index.ts` (lines 58-76, month start/end functions)
- Why fragile: Manual date arithmetic to get month boundaries; timezone not explicitly handled; DST transitions not considered
- Safe modification: Use date-fns `startOfMonth()` and `endOfMonth()` consistently instead of manual calculation
- Test coverage: No tests for edge dates (Dec 31, Jan 1, Feb 28/29); need test matrix for leap years

**RLS Policy Assumptions:**
- Files: All database query files assume RLS handles filtering
- Why fragile: Security depends on external database configuration; no in-code verification
- Safe modification: Add server-side user_id validation for critical operations; log access attempts; implement deny-by-default pattern
- Test coverage: No integration tests verifying RLS; need E2E tests that confirm RLS blocks cross-user access

## Scaling Limits

**No Pagination on Transactions:**
- Current capacity: Renders all transactions in Analytics component; DOM includes every transaction element
- Limit: ~1000 transactions becomes noticeable lag; analytics page becomes unusable; bundle includes all transaction data
- Scaling path: Implement server-side pagination with cursor or offset; lazy-load data as user scrolls; aggregate old transactions (e.g., "March 2025: $X")

**In-Memory Filter/Sort/Calculate:**
- Current capacity: All filtering, sorting, and calculations happen in BudgetContext in-memory
- Limit: With ~10,000 transactions, each context update triggers full recalculation; filter/sort/calculation O(n) operations
- Scaling path: Move filtering/sorting to server API layer; implement database indexes on date, category, type; use SQL aggregations instead of client-side

**Single Account Balance Field:**
- Current capacity: Account balance stored as single number; no transaction reconciliation
- Limit: Cannot audit balance changes; no history; if balance becomes incorrect, no way to rebuild without manual intervention
- Scaling path: Implement balance history table; derive balance from transaction sum; add reconciliation job

**No Analytics Caching:**
- Current capacity: Each Analytics page load recalculates all trends, categories, predictions
- Limit: With 10K transactions, analytics page takes seconds to load; predictions inefficient
- Scaling path: Pre-calculate and cache analytics on import; store as materialized views; implement incremental updates instead of full recalc

## Dependencies at Risk

**Drizzle + Supabase Mismatch:**
- Risk: Legacy code uses Drizzle ORM + Postgres driver; new code uses Supabase JS SDK; two database access patterns in same codebase create confusion
- Impact: Code duplication; inconsistent error handling; migration path unclear
- Migration plan: Standardize on Supabase SDK for all new code; gradually migrate legacy queries to Supabase; document when each is used

**Old npm Scripts with npx drizzle-kit:**
- Risk: `package.json` uses `npx drizzle-kit` but project should use `bun` exclusively per CLAUDE.md
- Impact: Inconsistency in dependency management; npm may be used accidentally
- Migration plan: Update build script to use `bunx drizzle-kit` instead of `npx`; document bun-only policy

**Multiple ORM/Query Systems:**
- Risk: Project uses Drizzle, Supabase SDK, raw query functions, and fetch() in different layers
- Impact: Inconsistent error handling; hard to add features; junior devs confused about which tool to use
- Migration plan: Document which system to use for each layer; plan consolidation to single access pattern

**mongoose Dependency Unused:**
- Risk: `package.json` includes mongoose but it's not used in codebase
- Impact: Unnecessary bundle size; confusion about database choice; maintenance burden
- Migration plan: Remove mongoose; verify no hidden imports

**quick.db Dependency Unused:**
- Risk: `package.json` includes quick.db but no usage found
- Impact: Unnecessary bundle size; legacy dependency
- Migration plan: Remove quick.db if not used; document why Supabase was chosen instead

## Missing Critical Features

**No Persistent Notification State:**
- Problem: Notifications are toast-only; no persistence in database; user can't view history or snooze
- Blocks: Notification preferences, notification history, smart alerts
- Implementation path: Add `bb_notifications` table; implement mark-as-read; add notification center UI

**No User Settings UI:**
- Problem: Settings table exists (`bb_user_settings`, `bb_notification_prefs`) but no UI to edit them
- Blocks: Theme customization, notification preferences, currency selection
- Implementation path: Create `/settings` page; implement form for preferences; add validation

**No Recurring Transaction Scheduling:**
- Problem: Transactions marked `is_recurring` but no background job executes them
- Blocks: Automatic recurring expense creation, recurring income tracking
- Implementation path: Add cron job for recurring transaction execution; implement schedule table

**No Multi-Currency Support:**
- Problem: Currency field exists but no conversion logic; exchange rates fetched but unused
- Blocks: Multi-currency accounts, currency conversion
- Implementation path: Implement exchange rate fetching on import; convert all amounts to base currency; add currency indicator in UI

**No Transaction Attachments:**
- Problem: No way to attach receipts, documents, or images to transactions
- Blocks: Receipt management, audit trail
- Implementation path: Add attachment column; implement S3 file storage; add file upload UI

## Test Coverage Gaps

**No Import Pipeline Integration Tests:**
- What's not tested: Full import flow (mock API → transform → UPSERT); idempotency verification; error handling
- Files: `src/lib/import/index.ts`, `src/app/api/import/route.ts`
- Risk: Imports could silently fail or create duplicates; regression on import changes undetected
- Priority: High - import is core MVP feature; needs end-to-end test

**No Budget Calculation Tests:**
- What's not tested: Budget status determination (on_track/warning/over_budget); threshold boundary conditions; multiple categories
- Files: `src/lib/budgets/index.ts`
- Risk: Budget feedback could be incorrect without detection; edge cases (exactly 80%, over 100%) untested
- Priority: High - users rely on accurate budget feedback; need comprehensive test matrix

**No Context/Hook Tests:**
- What's not tested: BudgetContext filter/sort logic; AppContext state management; data consistency across operations
- Files: `src/contexts/BudgetContext.tsx`, `src/contexts/AppContext.tsx`
- Risk: Complex state transformations have no verification; context bugs affect entire app
- Priority: Medium - context changes are high-impact but currently unguarded

**No Database Query Error Tests:**
- What's not tested: Error handling in DB functions; RLS policy blocking; missing data cases
- Files: `src/lib/db/*.ts`
- Risk: Silent failures; unhandled errors; security policy violations undetected
- Priority: Medium - security-critical; need RLS verification tests

**No Component Snapshot Tests:**
- What's not tested: UI rendering with different data states; visual regressions; prop combinations
- Files: Large components like `Analytics.tsx`, `Dashboard`, `NewTransaction`
- Risk: UI bugs go unnoticed; refactors break rendering without detection
- Priority: Low - nice-to-have; existing smoke tests provide some coverage

**No Performance/Load Tests:**
- What's not tested: Rendering large transaction lists; analytics calculation speed; import with large transaction batch
- Files: Analytics, BudgetContext, import pipeline
- Risk: Performance degradation undetected until user reports slowness
- Priority: Medium - important as data grows; need load test suite

**No E2E/User Flow Tests:**
- What's not tested: Full user journeys (link bank → import → view budget → set budget → get alert); cross-feature interactions
- Files: Entire app
- Risk: Integration bugs between features; routing issues; data flow problems
- Priority: High - MVP-critical; need E2E test scenarios

---

*Concerns audit: 2026-01-23*
