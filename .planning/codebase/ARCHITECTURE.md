# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Next.js App Router with layered architecture (Next.js best practices)

**Key Characteristics:**
- Server-side rendering for data-driven pages (reduces client complexity)
- Clear separation between route handlers, business logic, and data access
- Additive architecture: new BetterBudget features alongside legacy OopsBudgeter code
- PSD2-style mock banking API with deterministic data generation
- Supabase for authentication and database (single source of truth)
- Row Level Security (RLS) enforces user data isolation at database level

## Layers

**Routing Layer (App Router):**
- Purpose: HTTP request handling, parameter extraction, basic validation
- Location: `src/app/**/*.tsx`, `src/app/api/**/*.ts`
- Contains: Page components, API route handlers
- Depends on: Business logic (lib/), database layer (lib/db/)
- Used by: HTTP clients (browsers, fetch)
- Notes: Protected routes verified by middleware at `src/middleware.ts`

**Page Components (Server Components):**
- Purpose: Render UI with data, orchestrate page-level concerns
- Location: `src/app/page.tsx`, `src/app/settings/page.tsx`, `src/app/link-bank/page.tsx`, `src/app/dashboard/page.tsx`
- Contains: Server components, metadata generation, data fetching
- Depends on: Auth module (`lib/auth/`), database queries (`lib/db/*`)
- Used by: Routing layer
- Example: `src/app/page.tsx` fetches accounts and transactions, renders dashboard

**Business Logic Layer:**
- Purpose: Core algorithms and orchestration (no data access or UI)
- Location: `src/lib/`
- Contains: Import pipeline, budget calculations, notification generation
- Depends on: Data access layer (lib/db/), types (types/)
- Used by: API routes, page components
- Key modules:
  - `lib/import/` — Transaction import orchestration with UPSERT logic
  - `lib/budgets/` — Budget progress calculation and threshold checking
  - `lib/notifications/` — Notification generation from import results and budget alerts
  - `lib/auth/` — User authentication and session management
  - `lib/mock/` — PSD2 mock API data generation (deterministic)

**UI Component Layer:**
- Purpose: Reusable React components for UI
- Location: `src/components/`
- Contains: Page-specific components, shared UI primitives, providers
- Depends on: UI libraries (Radix UI, Tremor), utilities
- Used by: Page components
- Key directories:
  - `components/dashboard/` — Dashboard-specific components (charts, progress sections)
  - `components/finance/` — Bank linking flow, account UI
  - `components/ui/` — Radix UI primitives (buttons, dialogs, forms)
  - `components/common/` — Shared components (Logo, ThemeToggle, Settings)
  - `components/providers/` — React context providers (ThemeProvider, BudgetProvider)

**Database Layer (Supabase):**
- Purpose: User data persistence and retrieval
- Location: `src/lib/db/`
- Contains: Queries, client setup, type definitions
- Depends on: Supabase SDK
- Used by: Business logic, page components
- Key modules:
  - `lib/db/supabase.ts` — Browser client (for auth UI)
  - `lib/db/supabaseServer.ts` — Server client (for data fetching)
  - `lib/db/accounts.ts` — Linked bank account queries
  - `lib/db/transactions.ts` — Transaction queries (with UPSERT for imports)
  - `lib/db/budgets.ts` — Budget configuration queries
  - `lib/db/settings.ts` — User preferences and notification settings
  - `lib/db/types.ts` — Database row types (DbAccount, DbTransaction, etc.)

**Utility Layer:**
- Purpose: Pure, stateless helper functions
- Location: `src/utils/`
- Contains: Formatting, mapping, chart configuration
- Depends on: Types only (no data access, no side effects)
- Used by: Components, business logic
- Key modules:
  - `utils/format/` — Date/currency formatting helpers
  - `utils/mapping/` — Category mappings, label lookups
  - `utils/charts/` — Tremor chart configuration builders

## Data Flow

**Import Pipeline (Manual Transaction Sync):**

1. User clicks "Sync Transactions" on dashboard
2. Frontend calls `POST /api/import`
3. Middleware verifies authentication
4. API route orchestrates:
   - Get user's linked accounts from `bb_accounts` table
   - For each account:
     - Call `generateMockTransactions()` from `lib/mock/` (PSD2 format)
     - Transform to internal format in `lib/import/`
     - UPSERT to `bb_transactions` table (UNIQUE(user_id, external_id))
     - Update account balance in `bb_accounts`
   - Calculate budget alerts via `lib/budgets/`
5. Return aggregated import result + notifications
6. Frontend displays Sonner toast notifications
7. Dashboard refreshes to show updated transactions and balances

**Dashboard Data Flow:**

1. User navigates to `/` (middleware verifies auth)
2. Server component fetches:
   - Accounts from `getAccounts()` (db query)
   - Transactions from `getRecentTransactions()` (db query)
   - Summary stats from `getTransactionSummary()` (aggregation)
   - Budget progress from `calculateAllBudgetProgress()` (calculation)
   - Expense breakdown from `getExpensesByCategory()` (aggregation)
3. Component renders static page with fetched data
4. User interactions (Sync button) trigger API calls
5. No real-time updates (manual refresh only)

**Budget Notifications Flow:**

1. After import, `generatePostImportNotifications()` in `lib/notifications/`
2. Check budget thresholds via `checkBudgetThresholds()` in `lib/budgets/`
3. For each category over threshold, create notification object
4. Return notifications array to API response
5. Frontend renders via Sonner toast
6. No persistent notification storage (MVP scope)

**State Management:**

- Authentication: Supabase Auth (handled by middleware + client)
- Database state: Row Level Security (RLS) ensures only user's data is visible
- UI state: React Context (`BudgetContext`, `AppContext`)
- Form state: React Hook Form (in components)
- Notifications: Sonner toast (ephemeral)

## Key Abstractions

**Account Linking (PSD2 Simulation):**
- Purpose: Represent user's connection to a mock bank
- Examples: `src/app/api/link-bank/route.ts`, `src/components/finance/LinkBankFlow.tsx`
- Pattern: User selects bank → confirms consent → account created in DB
- Database table: `bb_accounts`

**Transaction Import (Idempotent UPSERT):**
- Purpose: Safely import mock transactions without creating duplicates
- Examples: `src/lib/import/index.ts`, `src/app/api/import/route.ts`
- Pattern: Generate mock data → normalize → UPSERT with external_id as key
- Database constraint: UNIQUE(user_id, external_id)

**Budget Progress Calculation:**
- Purpose: Derive budget status from transaction data
- Examples: `src/lib/budgets/index.ts`
- Pattern: Get budgets → get month transactions → calculate spent → compare thresholds
- Status values: "ok" (< 80%), "warning" (80-99%), "over" (100%+)

**Mock Banking API (PSD2 Format):**
- Purpose: Generate deterministic transaction data for testing
- Examples: `src/lib/mock/index.ts`, `src/app/api/mock/transactions/route.ts`
- Pattern: Account ID → date range → array of transactions (PSD2 structure)
- Key fields: transactionId, bookingDate, transactionAmount, creditorName/debtorName

## Entry Points

**Web Application (`/`):**
- Location: `src/app/page.tsx`
- Triggers: HTTP GET to root domain
- Responsibilities:
  - Verify authentication (via middleware)
  - Fetch dashboard data from database
  - Render budget overview, recent transactions, and charts
  - Provide sync button for manual imports
- Flow: Middleware → Auth check → Data fetch → Server render → Send HTML

**Authentication (`/login`):**
- Location: `src/app/(auth)/login/page.tsx`
- Triggers: Unauthenticated users or explicit navigation
- Responsibilities:
  - Display Supabase Auth UI
  - Handle sign-in with email/password or magic link
  - Redirect to original URL after auth success
- Flow: Auth form → Supabase API → Session created → Redirect to /

**Bank Linking (`/link-bank`):**
- Location: `src/app/link-bank/page.tsx`
- Triggers: Authenticated user navigates or completes signup
- Responsibilities:
  - Display list of mock banks (from `MOCK_BANKS` constant)
  - Collect user bank selection
  - Create account records in database
  - Simulate PSD2 consent flow
- Flow: User selects bank → Submit → API creates account → Redirect to /

**Transaction Import (POST `/api/import`):**
- Location: `src/app/api/import/route.ts`
- Triggers: User clicks "Sync Transactions" on dashboard
- Responsibilities:
  - Verify authentication
  - Fetch linked accounts
  - Generate mock transactions per account
  - UPSERT transactions to database (idempotent)
  - Calculate budget alerts
  - Return notification list
- Flow: Auth check → Get accounts → Import per account → DB updates → Return notifications

**Mock Banking API (GET `/api/mock/banks`, `/api/mock/accounts`, `/api/mock/transactions`):**
- Location: `src/app/api/mock/*/route.ts`
- Triggers: Frontend requests (or direct API calls)
- Responsibilities:
  - Return deterministic mock data in PSD2 format
  - Verify authentication
  - Simulate real banking API behavior
- Flow: Auth check → Generate data → Return JSON

**Settings (`/settings`):**
- Location: `src/app/settings/page.tsx`
- Triggers: Authenticated user navigates
- Responsibilities:
  - Display user preferences (theme, notifications)
  - Display budget configuration UI
  - Save preferences to database
- Flow: Load preferences → Render form → User changes → Submit → DB update

## Error Handling

**Strategy:** Graceful degradation with user-facing error messages

**Patterns:**

- **Database Errors:** Try-catch in page components, show "Failed to load data" message
  - Example: `src/app/page.tsx` catches `getTransactionSummary()` errors
  - User sees partial dashboard but continues

- **Authentication Errors:** Middleware redirects to `/login` with return URL
  - Unauthenticated users never see protected pages
  - Session refresh happens transparently

- **API Errors:** Return structured error responses with HTTP status codes
  - 401: Not authenticated → redirect to /login
  - 400: Invalid request → client error message
  - 500: Server error → generic error toast

- **Import Failures:** Partial success is acceptable (UPSERT per transaction)
  - Some transactions succeed, some fail
  - Return aggregate counts + error details
  - User sees notification with summary

- **Budget Calculations:** Defaults to 0 if no budget configured
  - Never breaks UI
  - Silent fallback (not an error state)

## Cross-Cutting Concerns

**Logging:**
- Pattern: `console.error()` for exceptions, `console.log()` for major operations
- Examples: `[import]`, `[dashboard]`, `[middleware]` prefixes for context
- Future: Structured logging to external service

**Validation:**
- Authentication: Middleware checks session
- Database: RLS enforces user isolation
- Input: Zod schemas (where used)
- Example: `src/lib/import/index.ts` validates category mapping

**Authentication:**
- Provider: Supabase Auth (email/password, magic link)
- Storage: HTTP-only cookies (via @supabase/ssr)
- Middleware: `src/middleware.ts` protects routes by matcher
- Session: Auto-refresh via Supabase client

**Authorization (Future):**
- Currently: All authenticated users have same access
- Planned: Per-feature opt-in (budgets, notifications)
- Database: RLS already filters by user_id

---

*Architecture analysis: 2026-01-23*
