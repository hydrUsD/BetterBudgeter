# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
BetterBudgeter/
├── src/
│   ├── app/                          # Next.js App Router (routes, layouts, API)
│   │   ├── (auth)/                   # Auth group layout
│   │   │   └── login/
│   │   │       └── page.tsx          # Login page
│   │   ├── api/                      # API routes (endpoints)
│   │   │   ├── import/               # Transaction import orchestration
│   │   │   ├── link-bank/            # Bank linking flow
│   │   │   ├── auth/                 # Auth endpoints
│   │   │   ├── budgets/              # Budget operations
│   │   │   ├── transactions/         # Transaction operations
│   │   │   ├── mock/                 # Mock bank API endpoints
│   │   │   ├── notifications/        # Notification endpoints
│   │   │   ├── achievements/         # Achievement endpoints
│   │   │   └── cron/                 # Scheduled tasks
│   │   ├── dashboard/                # Dashboard redirect
│   │   ├── settings/                 # Settings page
│   │   ├── link-bank/                # Bank linking UI
│   │   ├── legacy/                   # Legacy OopsBudgeter routes
│   │   ├── analytics/                # Analytics page
│   │   ├── achievements/             # Achievements page
│   │   ├── page.tsx                  # HOME: Main dashboard (new)
│   │   ├── layout.tsx                # Root layout (providers, globals)
│   │
│   ├── components/                   # Reusable React components
│   │   ├── auth/                     # Auth components (login form, sign out)
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── SyncTransactionsButton.tsx
│   │   │   ├── BudgetProgressSection.tsx
│   │   │   ├── BudgetNotificationDialogs.tsx
│   │   │   ├── SpendingByCategoryChart.tsx
│   │   │   └── index.ts              # Barrel export
│   │   ├── transactions/             # Transaction list/display components
│   │   ├── budgets/                  # Budget UI components
│   │   ├── categories/               # Category-related components
│   │   ├── finance/                  # Financial display helpers
│   │   ├── settings/                 # Settings page components
│   │   ├── common/                   # Shared utilities (logo, theme toggle)
│   │   ├── ui/                       # Base UI primitives (button, dialog, etc.)
│   │   ├── providers/                # React Context providers
│   │   │   └── ThemeProvider.tsx
│   │   ├── security/                 # Security components (passcode)
│   │   ├── helpers/                  # Helper components (layout, nav)
│   │   ├── effects/                  # Side effect components (toaster, etc.)
│   │   ├── cards/                    # Card components (legacy)
│   │   ├── sorting/                  # Sorting UI components
│   │   └── icons/                    # Icon components (deprecated: use lucide-react)
│   │
│   ├── lib/                          # Business logic & data access
│   │   ├── auth/
│   │   │   └── index.ts              # getUser, requireUser, signIn, signUp, signOut
│   │   │
│   │   ├── db/                       # Database queries (Supabase)
│   │   │   ├── index.ts              # Barrel export
│   │   │   ├── supabase.ts           # Browser client factory
│   │   │   ├── supabaseServer.ts     # Server client factory
│   │   │   ├── transactions.ts       # Transaction queries
│   │   │   ├── accounts.ts           # Account queries
│   │   │   ├── budgets.ts            # Budget queries
│   │   │   ├── settings.ts           # User settings queries
│   │   │   ├── types.ts              # Database row types
│   │   │   └── index.ts              # Public query export
│   │   │
│   │   ├── import/
│   │   │   └── index.ts              # importTransactions, category mapping
│   │   │
│   │   ├── budgets/
│   │   │   └── index.ts              # calculateAllBudgetProgress, threshold logic
│   │   │
│   │   ├── mock/
│   │   │   ├── index.ts              # generateMockTransactions, generateMockAccounts
│   │   │   └── types.ts              # PSD2 format types
│   │   │
│   │   ├── notifications/
│   │   │   └── index.ts              # generatePostImportNotifications
│   │   │
│   │   ├── finance/
│   │   │   └── index.ts              # Financial calculations
│   │   │
│   │   ├── api.ts                    # Fetch wrappers (legacy, minimize use)
│   │   ├── head.ts                   # Metadata generation
│   │   ├── utils.ts                  # General utilities (thin)
│   │   ├── db.ts                     # Legacy Drizzle setup (deprecated)
│   │   ├── categories.ts             # Category constants/helpers
│   │   ├── download.ts               # File export logic
│   │   └── recurring.ts              # Recurring transaction helpers
│   │
│   ├── utils/                        # Pure stateless helpers
│   │   ├── format/
│   │   │   └── index.ts              # formatCurrency, formatDate, etc.
│   │   ├── charts/
│   │   │   └── index.ts              # Tremor chart config helpers
│   │   └── mapping/
│   │       └── index.ts              # Category → color/label mapping
│   │
│   ├── types/
│   │   ├── finance.ts                # Transaction, Account, Budget types (DTOs)
│   │
│   ├── contexts/
│   │   ├── BudgetContext.tsx         # Budget state (client-side)
│   │   └── AppContext.tsx            # App-wide state (client-side)
│   │
│   ├── constants/                    # Configuration constants
│   │
│   ├── hooks/
│   │   ├── useclient.ts              # useClient hook (legacy)
│   │   └── usemouse.ts               # Mouse position hook
│   │
│   ├── schema/
│   │   ├── dbSchema.ts               # Legacy Drizzle schema
│   │   └── transactionForm.ts        # Form validation schemas (Zod)
│   │
│   └── globals.css                   # Tailwind + global styles
│
├── drizzle/                          # Database migrations (legacy Drizzle, not used)
│   └── *.sql
│
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Supabase RLS schema
│
├── public/                           # Static assets
│   ├── manifest.json                 # PWA manifest
│   └── [images, fonts, etc]
│
├── tests/                            # Test files
│   └── [test files]
│
├── docs/                             # Documentation
│   ├── ARCHITECTURE.md
│   ├── BUDGET_STRATEGY.md
│   ├── SUPABASE_STRATEGY.md
│   ├── IMPORT_PIPELINE_STRATEGY.md
│   ├── PSD2_MOCK_STRATEGY.md
│   ├── DASHBOARD_STRATEGY.md
│   └── [other strategy docs]
│
├── .planning/
│   └── codebase/                     # GSD codebase analysis (this dir)
│
├── package.json
├── tsconfig.json
├── next.config.ts                    # Next.js config with PWA
├── drizzle.config.ts                 # Drizzle config (not actively used)
└── .env.local                        # Local environment (not committed)
```

## Directory Purposes

**`src/app/`:**
- Purpose: Next.js App Router pages and API routes
- Contains: Page components, layouts, API endpoints
- Key files:
  - `page.tsx` - Main dashboard (authenticated homepage)
  - `layout.tsx` - Root layout with theme/auth providers
  - `api/import/route.ts` - Transaction import endpoint
  - `api/link-bank/route.ts` - Bank linking endpoint
  - `(auth)/login/page.tsx` - Login page

**`src/components/`:**
- Purpose: Reusable React components
- Contains: UI components organized by feature
- Key files:
  - `dashboard/` - Dashboard section components
  - `auth/` - Login/logout components
  - `ui/` - Base UI primitives (from shadcn/ui)
  - `common/` - Shared components (logo, theme toggle)

**`src/lib/`:**
- Purpose: Business logic and data access
- Contains: Database queries, import logic, calculations
- Key files:
  - `db/transactions.ts` - Transaction queries
  - `db/accounts.ts` - Account queries
  - `import/index.ts` - Import orchestration
  - `budgets/index.ts` - Budget calculation
  - `auth/index.ts` - Auth helpers

**`src/utils/`:**
- Purpose: Pure, stateless helper functions
- Contains: Formatting, mapping, chart helpers
- Key files:
  - `format/index.ts` - Currency/date formatting
  - `charts/index.ts` - Tremor config
  - `mapping/index.ts` - Category mapping

**`src/types/`:**
- Purpose: Shared TypeScript type definitions
- Contains: Application-level DTOs (not database-specific)
- Key files: `finance.ts`

**`src/contexts/`:**
- Purpose: React Context providers for client state
- Contains: BudgetContext, AppContext
- Usage: Wrapped in root layout for app-wide access

**`src/schema/`:**
- Purpose: Data validation and database schema
- Contains: Zod form schemas, Drizzle ORM schema (legacy)
- Key files: `transactionForm.ts` (active), `dbSchema.ts` (legacy)

**`docs/`:**
- Purpose: Architecture and strategy documentation
- Contains: Design decisions for major features
- Key files:
  - `BUDGET_STRATEGY.md` - Budget calculation design
  - `SUPABASE_STRATEGY.md` - Database design and RLS
  - `IMPORT_PIPELINE_STRATEGY.md` - Import flow
  - `PSD2_MOCK_STRATEGY.md` - Mock bank API
  - `DASHBOARD_STRATEGY.md` - Dashboard design

**`public/`:**
- Purpose: Static assets served directly
- Contains: Images, fonts, PWA manifest

**`tests/`:**
- Purpose: Test files (Vitest)
- Structure: Mirrors src/ structure

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Main dashboard (home)
- `src/app/layout.tsx` - Root layout (providers)
- `src/app/(auth)/login/page.tsx` - Login page

**Configuration:**
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript config with path alias `@/*` → `src/`
- `next.config.ts` - Next.js config (PWA support)
- `.env.local` - Environment variables (not committed)

**Core Logic:**
- `src/lib/db/transactions.ts` - Transaction queries
- `src/lib/db/accounts.ts` - Account queries
- `src/lib/import/index.ts` - Import pipeline
- `src/lib/budgets/index.ts` - Budget calculation
- `src/lib/auth/index.ts` - Authentication

**Testing:**
- `tests/` - Vitest test files
- `vitest.config.ts` - Vitest configuration

**Database:**
- `supabase/migrations/001_initial_schema.sql` - Schema with RLS
- `src/lib/db/types.ts` - Database row types

## Naming Conventions

**Files:**
- `.tsx` - React components (Server or Client)
- `.ts` - Standalone modules/utilities
- `index.ts` - Barrel exports (collect and re-export from directory)
- `route.ts` - Next.js API route handlers
- `page.tsx` - Route page components
- `layout.tsx` - Route layout components
- `*.test.ts(x)` - Vitest test files

**Directories:**
- Lowercase with hyphens for routes: `link-bank/`, `user-settings/`
- Lowercase with hyphens for feature directories: `dashboard/`, `transactions/`
- Lowercase without hyphens for internal modules: `lib/`, `utils/`, `components/`

**Components:**
- PascalCase: `SyncTransactionsButton`, `BudgetProgressSection`
- Descriptive names reflecting responsibility

**Variables & Functions:**
- camelCase: `getUser()`, `importTransactions()`, `totalBalance`
- Private/internal with leading underscore if needed: `_calculateSpending()`

**Database:**
- Supabase table names prefixed with `bb_`: `bb_accounts`, `bb_transactions`, `bb_budgets`
- Column names snake_case: `user_id`, `created_at`, `account_name`
- Primary keys always `id` (UUID)
- Foreign key pattern: `{table_singular}_id` (e.g., `account_id`, `user_id`)

## Where to Add New Code

**New Feature:**
- Primary code: `src/lib/{feature}/index.ts`
- UI Components: `src/components/{feature}/`
- API endpoint: `src/app/api/{feature}/route.ts`
- Route page: `src/app/{feature}/page.tsx`
- Tests: `tests/{feature}.test.ts`
- Example: Adding "Goals" feature:
  - `src/lib/goals/index.ts` - Core logic
  - `src/components/goals/GoalCard.tsx` - UI
  - `src/app/api/goals/route.ts` - API
  - `src/app/goals/page.tsx` - Route page

**New Component/Module:**
- If reusable UI → `src/components/{category}/ComponentName.tsx`
- If business logic → `src/lib/{feature}/index.ts`
- If helper function → `src/utils/{category}/index.ts`
- If hook → `src/hooks/{hookName}.ts`
- If type → `src/types/{domain}.ts`

**Utilities:**
- Shared formatting → `src/utils/format/`
- Shared mapping → `src/utils/mapping/`
- Chart helpers → `src/utils/charts/`
- Constants → `src/constants/`

**Database Functions:**
- Query for table X → `src/lib/db/{table}.ts`
- Type for table X → `src/lib/db/types.ts`

## Special Directories

**`src/app/api/mock/`:**
- Purpose: Mock PSD2 bank API for development
- Generated: Yes (deterministically from seed data)
- Committed: Yes (part of codebase for reproducibility)
- Files:
  - `accounts/route.ts` - List mock accounts
  - `transactions/route.ts` - List mock transactions
  - `banks/route.ts` - List mock banks

**`src/app/legacy/`:**
- Purpose: Preserve OopsBudgeter routes for backward compatibility
- Generated: No
- Committed: Yes (required by CLAUDE.md)
- Files: Original OopsBudgeter pages (largely untouched)

**`src/components/ui/`:**
- Purpose: Base UI primitives from shadcn/ui
- Generated: Yes (via CLI install)
- Committed: Yes (modified versions checked in)
- Usage: Build higher-level components on top of these

**`drizzle/`:**
- Purpose: Legacy database migrations (Drizzle ORM)
- Status: Deprecated in favor of Supabase migrations
- Committed: Yes (historical record)
- Usage: Do not use for new migrations; use Supabase instead

**`.planning/codebase/`:**
- Purpose: GSD analysis documents
- Generated: Yes (by Claude mapping agent)
- Committed: Yes (reference for future development)
- Contents: ARCHITECTURE.md, STRUCTURE.md, TESTING.md, CONCERNS.md

**`public/`:**
- Purpose: Static assets (images, fonts, favicon)
- Generated: No
- Committed: Yes
- PWA manifest: `public/manifest.json`

## Database Schema Quick Reference

**Key Tables:**
- `bb_accounts` - Linked bank accounts (user_id, bank_name, balance)
- `bb_transactions` - Imported transactions (user_id, account_id, external_id, amount, category)
- `bb_budgets` - Monthly spending limits (user_id, category, limit_amount)
- `bb_user_settings` - UI preferences (user_id, dark_mode, notifications_enabled)
- `bb_notification_prefs` - Notification subscriptions (user_id, event_type, enabled)

**Key Constraints:**
- UNIQUE(user_id, external_id) on bb_transactions (prevents duplicates on reimport)
- UNIQUE(user_id, category) on bb_budgets (one budget per category per user)
- RLS enabled on all sensitive tables (filtered by auth.uid())

**Location:** `supabase/migrations/001_initial_schema.sql`

---

*Structure analysis: 2026-01-23*
