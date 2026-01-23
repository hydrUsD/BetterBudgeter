# Architecture

**Analysis Date:** 2026-01-23

## Pattern Overview

**Overall:** Layered Next.js App Router with clear separation between routing, components, business logic, and data access. Server-centric design with server components and server actions for data operations.

**Key Characteristics:**
- Server-first rendering (Server Components as default)
- API routes for orchestration and external integrations
- Supabase as the single database with Row Level Security (RLS) enabled
- Idempotent import pipeline with external_id as conflict key
- PSD2-style mock API simulation (no real banking integration)
- ADHD-optimized UI with reduced cognitive load and clear visual hierarchy

## Layers

**Routing Layer (app/):**
- Purpose: Route definitions, layout scaffolding, auth boundaries
- Location: `src/app/`
- Contains: Page components (Server Components), API routes, layouts
- Depends on: Authentication, business logic (lib/), UI components
- Used by: Next.js App Router, browser

**Authentication Middleware:**
- Purpose: Guard protected routes, verify user sessions
- Location: Implicit in page structure + `src/lib/auth/`
- Contains: Auth checks via getUser(), requireUser()
- Depends on: Supabase Auth, cookies (via SSR)
- Used by: Protected routes like `/`, `/dashboard`, `/settings`

**Business Logic Layer (lib/):**
- Purpose: Core application logic, data transformation, orchestration
- Location: `src/lib/`
- Contains:
  - `auth/` - User authentication state and operations
  - `db/` - Supabase queries (transactions, accounts, budgets, etc.)
  - `import/` - Transaction import pipeline (mock API → DB)
  - `budgets/` - Budget calculation and threshold logic
  - `notifications/` - Notification generation from events
  - `mock/` - PSD2 mock bank data generators
  - `finance/` - Financial calculations and transformations
- Depends on: Database (Supabase), external services
- Used by: API routes, components, page components

**UI Component Layer (components/):**
- Purpose: Reusable React components for UI
- Location: `src/components/`
- Contains: Modular UI components organized by feature area
- Depends on: Business logic (passed via props), utility functions
- Used by: Page components, layout components

**Data Access Layer (lib/db/):**
- Purpose: Encapsulate all database queries with RLS enforcement
- Location: `src/lib/db/`
- Contains: Query functions for each table (transactions, accounts, budgets, etc.)
- Depends on: Supabase client with server-side cookies
- Used by: Business logic layer, API routes

**Utilities Layer (utils/):**
- Purpose: Pure, stateless helper functions
- Location: `src/utils/`
- Contains:
  - `format/` - Currency, date, number formatting
  - `charts/` - Tremor chart configuration and color mapping
  - `mapping/` - Category to color/label mapping
- Depends on: Nothing (pure functions)
- Used by: Components, business logic for formatting

**Types & Constants:**
- Purpose: Shared type definitions and constant values
- Location: `src/types/`, `src/constants/`
- Contains: TypeScript interfaces, enum-like objects, configuration constants
- Depends on: Nothing
- Used by: All layers

## Data Flow

**Transaction Import (PSD2-style AIS):**

1. User clicks "Sync Transactions" button
2. `SyncTransactionsButton` component calls POST `/api/import`
3. `/api/import` route:
   - Authenticates user via Supabase Auth
   - Fetches user's linked accounts from `bb_accounts` table (RLS filtered)
   - For each account, calls `importTransactions()` from `lib/import/`
4. `lib/import/importTransactions()`:
   - Calls `generateMockTransactions()` from `lib/mock/` (simulates bank API)
   - Transforms PSD2-format mock data to internal `DbTransactionInsert` type
   - Maps transaction description to category (rule-based categorizer)
   - Calls `upsertTransactions()` to persist (UPSERT with external_id conflict key)
5. Database enforces UNIQUE(user_id, external_id) constraint → no duplicates
6. API returns aggregated result + notifications
7. Component displays toast notification and refreshes dashboard

**Dashboard Data Fetch:**

1. User navigates to `/` (protected by auth middleware)
2. Server Component `DashboardPage` calls auth functions to verify session
3. Server Component directly calls data functions:
   - `getAccounts()` → fetches `bb_accounts` (RLS applies)
   - `getRecentTransactions()` → fetches `bb_transactions` (RLS applies)
   - `getTransactionSummary()` → calculates totals
   - `calculateAllBudgetProgress()` → compares spending to `bb_budgets`
4. Components receive data as props (no client-side fetching)
5. Client-side interactivity: theme toggle, settings modal, etc.

**Budget Alert Flow:**

1. Dashboard page calls `calculateAllBudgetProgress()`
2. `lib/budgets/calculateAllBudgetProgress()`:
   - Fetches user's budgets from `bb_budgets`
   - Fetches current month's transactions from `bb_transactions`
   - Calculates spent_amount per category
   - Derives status (on_track, warning, over_budget) based on thresholds
3. `BudgetNotificationDialogs` component receives BudgetProgress array
4. Component renders alert dialogs for warning/over-budget states (one at a time)
5. User acknowledges dialog → session-level memory prevents re-display

**State Management:**

- **Server-side state:** Database is single source of truth for persistent data
- **Client-side state:** React Context (BudgetContext, AppContext) for UI state only
  - Budget notifications: displayed/dismissed state
  - Settings: UI preferences, dark mode toggle
- **Session state:** Auth user stored in Supabase session cookies
- **No global state management (Redux, Zustand)** - Context is sufficient for MVP

## Key Abstractions

**Database Abstraction (lib/db/):**
- Purpose: Hide Supabase client complexity, enforce RLS
- Examples: `src/lib/db/transactions.ts`, `src/lib/db/accounts.ts`, `src/lib/db/budgets.ts`
- Pattern: Each table gets dedicated query module with typed insert/update operations
- Benefit: RLS automatically filters by `auth.uid()` - no explicit filtering needed

**Import Pipeline (lib/import/):**
- Purpose: Orchestrate mock API → database flow with idempotency
- Examples: `src/lib/import/index.ts` with transformation functions
- Pattern: Fetch from mock, transform, UPSERT with external_id conflict
- Benefit: Safe to re-run multiple times - same data → same result

**Budget Calculation (lib/budgets/):**
- Purpose: Calculate budget progress from transaction data
- Examples: `src/lib/budgets/index.ts` with threshold functions
- Pattern: Query budgets + transactions, calculate spent, derive status
- Benefit: Calculated values stay in sync with transaction data (no stale state)

**Mock Bank API (lib/mock/):**
- Purpose: Simulate PSD2 bank API for development/testing
- Examples: `src/lib/mock/index.ts` with transaction/account generators
- Pattern: Deterministic data generation (same input → same output)
- Benefit: No external dependencies, fast feedback, reproducible data

**Auth Abstraction (lib/auth/):**
- Purpose: Hide Supabase Auth API, provide application-level auth types
- Examples: `src/lib/auth/index.ts` with getUser, requireUser, signInWithEmail
- Pattern: Transform Supabase User to AuthUser, handle redirects
- Benefit: Type-safe auth checks, clear boundaries for authentication concerns

## Entry Points

**Web Home (`src/app/page.tsx`):**
- Location: `/` (root URL)
- Triggers: User navigates to app or revisits after login
- Responsibilities:
  - Verify authentication (middleware redirects unauthenticated users to /login)
  - Fetch account/transaction data from database
  - Render dashboard with balance, budget progress, spending chart
  - Show transaction sync button for manual imports
  - Extend points: Notification bell, spending trends chart

**API Import (`src/app/api/import/route.ts`):**
- Location: `POST /api/import`
- Triggers: User clicks "Sync Transactions" button or scheduled job
- Responsibilities:
  - Verify authentication
  - Orchestrate transaction import for all linked accounts
  - Return aggregated result with notifications
  - Responsibility boundary: ONLY entry point that calls mock API

**API Link Bank (`src/app/api/link-bank/route.ts`):**
- Location: `POST /api/link-bank`
- Triggers: User completes bank linking flow
- Responsibilities:
  - Create account record in `bb_accounts`
  - Simulate PSD2 consent flow
  - Return linked account data

**Login Page (`src/app/(auth)/login/page.tsx`):**
- Location: `/login`
- Triggers: Unauthenticated user tries to access protected route
- Responsibilities:
  - Display email/password login form
  - Call Supabase Auth sign-in
  - Redirect to dashboard on success

**Settings Page (`src/app/settings/page.tsx`):**
- Location: `/settings`
- Triggers: User clicks settings in navigation
- Responsibilities:
  - Display UI preferences (dark mode, notification settings)
  - Fetch/update user settings from `bb_user_settings`

## Error Handling

**Strategy:** Graceful degradation with user feedback

**Patterns:**

- **Data Fetch Errors:**
  - Try-catch in Server Components
  - Display error banner with user-friendly message
  - Example: Dashboard error state shows "Unable to Load Data"

- **API Errors:**
  - API routes catch exceptions, return 400/500 with error details
  - Client displays toast notification via Sonner
  - Example: Import API returns { success: false, errorDetails: [...] }

- **Authentication Errors:**
  - Middleware redirects unauthenticated users to /login
  - Auth functions check for null user and return null
  - Server Components use `requireUser()` to enforce authentication

- **Validation Errors:**
  - Forms use React Hook Form + Zod for client-side validation
  - Server actions re-validate before persisting
  - Display validation error messages inline

- **Database Errors:**
  - RLS violations return 403 Forbidden (Supabase enforces)
  - Constraint violations handled by UPSERT logic (external_id uniqueness)
  - Connection errors logged to console, user sees generic error message

## Cross-Cutting Concerns

**Logging:**
- Strategy: Console.error/warn in development, sent to external service in production
- Patterns:
  - Error logging in try-catch blocks: `console.error("[module] Error:", error.message)`
  - Debug logging for import/budget calculations
  - No sensitive data (passwords, tokens) logged

**Validation:**
- Strategy: Zod schemas for type-safe runtime validation
- Patterns:
  - Form schemas in `src/schema/` (e.g., transactionForm.ts)
  - API request validation before processing
  - Database types ensure type safety for queries

**Authentication:**
- Strategy: Supabase Auth + RLS on all tables
- Patterns:
  - Session verified via cookies (SSR)
  - `getUser()` for optional auth checks
  - `requireUser()` for mandatory auth checks
  - RLS automatically filters queries by user_id = auth.uid()

**Authorization:**
- Strategy: RLS policies on all sensitive tables
- Patterns:
  - Users can only see their own transactions (RLS enforces)
  - Users can only modify their own accounts/budgets
  - No explicit role-based access control (not needed for MVP)

**Real-time Subscriptions:**
- Strategy: Not implemented yet (out of MVP scope)
- Extension point: Supabase real-time could watch for transaction updates

---

*Architecture analysis: 2026-01-23*
