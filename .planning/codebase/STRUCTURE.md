# Codebase Structure

**Analysis Date:** 2026-01-23

## Directory Layout

```
BetterBudgeter/
├── src/
│   ├── app/                          # Next.js App Router (pages + API routes)
│   │   ├── layout.tsx                # Root layout with providers, theme, navigation
│   │   ├── page.tsx                  # BetterBudget main dashboard (PRIMARY landing page)
│   │   ├── globals.css               # Global styles (Tailwind, theme variables)
│   │   ├── (auth)/                   # Auth route group (layout wrapper for login)
│   │   │   └── login/
│   │   │       └── page.tsx          # Supabase Auth UI
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Redirect to / (HTTP 308)
│   │   ├── link-bank/
│   │   │   └── page.tsx              # Bank linking flow (account consent simulation)
│   │   ├── settings/
│   │   │   └── page.tsx              # User preferences and budget configuration
│   │   ├── legacy/                   # Legacy OopsBudgeter dashboard (read-only)
│   │   │   └── page.tsx              # Accessible at /legacy for reference
│   │   ├── legacy-index/             # Legacy navigation index
│   │   │   └── page.tsx
│   │   ├── analytics/ & achievements/ # Legacy features (unchanged)
│   │   │   └── page.tsx
│   │   └── api/
│   │       ├── auth/                 # Legacy passcode auth API (unchanged)
│   │       ├── transactions/         # Legacy transactions API (unchanged)
│   │       ├── achievements/         # Legacy achievements API (unchanged)
│   │       ├── cron/                 # Legacy cron endpoint (unchanged)
│   │       ├── mock/                 # PSD2 mock banking API (new)
│   │       │   ├── banks/
│   │       │   │   └── route.ts      # GET list of available mock banks
│   │       │   ├── accounts/
│   │       │   │   └── route.ts      # GET accounts for a linked bank
│   │       │   └── transactions/
│   │       │       └── route.ts      # GET transactions for an account (date range)
│   │       ├── import/               # Transaction import orchestration (new)
│   │       │   └── route.ts          # POST to trigger import pipeline
│   │       ├── link-bank/            # Bank linking endpoint (new)
│   │       │   └── route.ts          # POST to create linked account
│   │       ├── budgets/              # Budget endpoints (new)
│   │       │   └── route.ts          # GET/POST budget configuration
│   │       └── notifications/        # Notification endpoints (new)
│   │           └── route.ts          # GET notification preferences
│   │
│   ├── components/                   # React components (UI + logic)
│   │   ├── dashboard/                # Dashboard-specific components
│   │   │   ├── SyncTransactionsButton.tsx      # Manual import trigger
│   │   │   ├── BudgetProgressSection.tsx       # Budget display with traffic lights
│   │   │   ├── SpendingByCategoryChart.tsx     # Category breakdown chart (Recharts)
│   │   │   └── BudgetNotificationDialogs.tsx   # Budget alert modals
│   │   ├── finance/                  # Finance-related components
│   │   │   ├── LinkBankFlow.tsx      # Bank selection and consent form
│   │   │   └── AccountsList.tsx      # Linked accounts display
│   │   ├── ui/                       # Radix UI primitives + styling
│   │   │   ├── button.tsx            # Styled button (Radix + CVA)
│   │   │   ├── dialog.tsx            # Modal dialog (Radix)
│   │   │   ├── form.tsx              # Form controls (React Hook Form + Radix)
│   │   │   └── ... (20+ UI components)
│   │   ├── common/                   # Shared components across app
│   │   │   ├── Logo.tsx              # BetterBudget logo and branding
│   │   │   ├── ThemeToggle.tsx       # Dark/light theme switcher
│   │   │   ├── Settings.tsx          # Settings menu button
│   │   │   └── Achievements.tsx      # Legacy achievements badge
│   │   ├── auth/                     # Authentication components
│   │   │   ├── SignOutButton.tsx     # Sign-out action
│   │   │   └── AuthGuard.tsx         # Render guard for auth state
│   │   ├── providers/                # React context providers
│   │   │   └── ThemeProvider.tsx     # Next-themes wrapper
│   │   ├── helpers/                  # Utility components
│   │   │   ├── PageLayout.tsx        # Main layout wrapper
│   │   │   └── GoToTop.tsx           # Scroll-to-top button
│   │   ├── effects/                  # Side effects and integrations
│   │   │   └── Sonner.tsx            # Sonner toast provider
│   │   ├── security/                 # Security-related components
│   │   │   └── PasscodeWrapper.tsx   # Legacy passcode protection (unchanged)
│   │   └── ... (legacy folders: cards, categories, sorting, transactions)
│   │
│   ├── lib/                          # Business logic and orchestration
│   │   ├── auth/
│   │   │   └── index.ts              # User auth helpers (getUser, requireUser, sign in/out)
│   │   ├── db/                       # Database layer (Supabase)
│   │   │   ├── supabase.ts           # Browser client setup
│   │   │   ├── supabaseServer.ts     # Server client setup
│   │   │   ├── index.ts              # Exports all DB modules
│   │   │   ├── accounts.ts           # bb_accounts queries
│   │   │   ├── transactions.ts       # bb_transactions queries (with UPSERT)
│   │   │   ├── budgets.ts            # bb_budgets queries
│   │   │   ├── settings.ts           # bb_user_settings and notification prefs queries
│   │   │   └── types.ts              # Database row types (DbAccount, DbTransaction, etc.)
│   │   ├── import/
│   │   │   └── index.ts              # Transaction import orchestration
│   │   │                             # Transforms mock data → DB format → UPSERT
│   │   ├── budgets/
│   │   │   └── index.ts              # Budget progress calculation
│   │   │                             # Thresholds: 80% (warning), 100% (over)
│   │   ├── notifications/
│   │   │   └── index.ts              # Notification generation from import + budgets
│   │   ├── mock/                     # Mock banking API (PSD2 format)
│   │   │   ├── index.ts              # Mock data generators (deterministic)
│   │   │   └── types.ts              # PSD2 API types (MockBank, MockAccount, MockTransaction)
│   │   ├── finance/                  # Financial calculations and utilities
│   │   │   └── ... (legacy finance helpers)
│   │   ├── head.ts                   # Metadata generation helper
│   │   ├── api.ts                    # Legacy API client (unchanged)
│   │   └── ... (legacy files: download, recurring, monthlyTrends, etc.)
│   │
│   ├── utils/                        # Pure, stateless helpers
│   │   ├── format/
│   │   │   └── index.ts              # Date and currency formatting
│   │   ├── mapping/
│   │   │   └── index.ts              # Category mappings, labels, colors
│   │   └── charts/
│   │       └── index.ts              # Tremor chart configuration builders
│   │
│   ├── types/
│   │   └── finance.ts                # Application-level DTOs
│   │                                  # Transaction, Account, BudgetProgress, etc.
│   │
│   ├── contexts/                     # React contexts
│   │   ├── BudgetContext.tsx         # Budget state provider
│   │   └── AppContext.tsx            # App-wide state provider
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useclient.ts              # useClient wrapper
│   │   └── usemouse.ts               # Mouse tracking hook
│   │
│   ├── constants/                    # App constants and configuration
│   │   └── ... (legacy constants)
│   │
│   ├── schema/                       # Drizzle ORM schema (legacy)
│   │   └── ... (unchanged)
│   │
│   └── middleware.ts                 # Auth protection middleware for routes
│                                      # Protects: /, /settings, /link-bank, /api/import, /api/mock/*
│
├── public/                           # Static assets
│   └── ... (logo, icons, fonts)
│
├── tests/                            # Test files (MVP baseline)
│   └── ... (vitest configuration and sample tests)
│
├── docs/                             # Architecture and strategy documents
│   ├── ARCHITECTURE_SKELETON.md      # Overview of folder structure and design
│   ├── SUPABASE_STRATEGY.md          # Database and auth architecture
│   ├── IMPORT_PIPELINE_STRATEGY.md   # Transaction import design
│   ├── PSD2_MOCK_STRATEGY.md         # Mock banking API specification
│   ├── BUDGET_STRATEGY.md            # Budget calculation and notifications
│   ├── DASHBOARD_STRATEGY.md         # Dashboard design and ADHD principles
│   ├── TESTING_STRATEGY.md           # Testing approach and patterns
│   └── ... (other strategy docs)
│
├── supabase/                         # Supabase configuration
│   ├── migrations/                   # SQL migration files
│   └── ... (Supabase local setup)
│
├── drizzle/                          # Drizzle ORM configuration (legacy)
│   └── ... (schema definitions)
│
├── .claude/                          # Claude Code instructions
│   └── rules/                        # Workflow and safety rules
│
├── .planning/                        # GSD planning output
│   └── codebase/                     # This folder
│       ├── ARCHITECTURE.md
│       ├── STRUCTURE.md
│       ├── STACK.md
│       ├── INTEGRATIONS.md
│       ├── CONVENTIONS.md
│       ├── TESTING.md
│       └── CONCERNS.md
│
├── .env.local                        # Local environment (git-ignored)
├── .env.example                      # Environment template
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript configuration (with @ alias)
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── postcss.config.mjs                # PostCSS configuration
├── drizzle.config.ts                 # Drizzle ORM configuration
├── eslint.config.mjs                 # ESLint configuration
├── bun.lockb                         # Bun package lock file
└── README.md                         # Project overview
```

## Directory Purposes

**`src/app/`** - Next.js App Router Pages and API Routes
- Purpose: HTTP request handling and page rendering
- Contains: Page components, API route handlers, layouts
- Key patterns: Server components by default, client components for interactivity
- Auth: Middleware protects routes via matcher config

**`src/components/`** - React Components
- Purpose: Reusable UI and logic components
- Organized by: Feature area (dashboard, finance, auth) + type (ui, common, helpers)
- Key principle: Components are presentation only (no data fetching)
- Example: `SpendingByCategoryChart.tsx` receives data props and renders Recharts

**`src/lib/`** - Business Logic and Data Access
- Purpose: Stateless, testable logic layers
- Modules:
  - `auth/` - Supabase authentication
  - `db/` - Database queries and types
  - `import/` - Transaction import pipeline
  - `budgets/` - Budget calculations
  - `notifications/` - Alert generation
  - `mock/` - Deterministic test data
- Pattern: Each module exports well-defined functions and types

**`src/utils/`** - Pure Utility Functions
- Purpose: Formatting, mapping, and configuration helpers
- Constraint: No database access, no side effects, no state
- Examples: `formatCurrency()`, `getCategoriesForType()`, `getChartColors()`

**`src/types/`** - Shared TypeScript Types
- Purpose: Application-level data transfer objects (DTOs)
- Current: `finance.ts` with Transaction, Account, Budget types
- Boundary: These are NOT database types (those are in `lib/db/types.ts`)

**`src/contexts/`** - React Context Providers
- Purpose: Global state management
- Current: `BudgetContext` (budget UI state), `AppContext` (general app state)
- Used by: Root layout and components needing cross-component state

**`tests/`** - Test Files
- Pattern: Co-located with source (e.g., `component.test.tsx` next to `component.tsx`)
- Framework: Vitest + @testing-library/react
- Coverage: Key business logic (budgets, import) prioritized over UI tests

**`docs/`** - Strategy Documents
- Purpose: Architecture decisions and design rationale
- Audience: Developers maintaining or extending the codebase
- Key documents:
  - `SUPABASE_STRATEGY.md` - How auth and RLS work
  - `IMPORT_PIPELINE_STRATEGY.md` - How transactions are imported idempotently
  - `BUDGET_STRATEGY.md` - Budget calculation and ADHD design
  - `PSD2_MOCK_STRATEGY.md` - How the mock banking API simulates real PSD2

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Main dashboard (root route, auth-protected)
- `src/app/(auth)/login/page.tsx` - Login page (public)
- `src/middleware.ts` - Auth middleware (runs before route handlers)
- `src/app/layout.tsx` - Root HTML layout with providers

**Configuration:**
- `tsconfig.json` - TypeScript config with `@/*` path alias
- `next.config.ts` - Next.js config (turbopack, PWA, etc.)
- `tailwind.config.ts` - Tailwind CSS theme (colors, spacing)
- `package.json` - Dependencies (bun is required)
- `.env.local` - Supabase URL, keys, service role key (git-ignored)

**Core Logic:**
- `src/lib/db/index.ts` - Database query exports and convenience layer
- `src/lib/db/transactions.ts` - Transaction queries (includes UPSERT for import)
- `src/lib/import/index.ts` - Import pipeline orchestration
- `src/lib/budgets/index.ts` - Budget progress calculation
- `src/lib/notifications/index.ts` - Notification generation
- `src/lib/mock/index.ts` - Mock banking API (deterministic generators)

**Testing:**
- `tests/` - Test directory (pattern: `*.test.ts` or `*.spec.ts`)
- `vitest.config.ts` - Vitest configuration (if present in future)

## Naming Conventions

**Files:**
- Page routes: `page.tsx` (Next.js App Router convention)
- API routes: `route.ts` (Next.js App Router convention)
- Components: `PascalCase.tsx` (e.g., `SpendingByCategoryChart.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatCurrency.ts`)
- Tests: `*.test.ts` or `*.spec.ts` (e.g., `import.test.ts`)
- Exported modules: `index.ts` for directory exports (e.g., `lib/db/index.ts`)

**Directories:**
- Features: kebab-case (e.g., `link-bank`, `mock-api`) for routes; camelCase (e.g., `mockApi`) for lib modules
- Types: PascalCase for interfaces, lowercase for files (e.g., `finance.ts`)
- Components: Feature-based grouping (e.g., `components/dashboard/`, `components/finance/`)

**Functions:**
- Async data fetchers: Prefix `get` or `fetch` (e.g., `getAccounts()`, `fetchTransactions()`)
- Calculations: Prefix `calculate` or `compute` (e.g., `calculateBudgetProgress()`)
- Generators: Prefix `generate` (e.g., `generateMockTransactions()`)
- Helpers: Descriptive verb (e.g., `formatCurrency()`, `mapCategory()`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `BUDGET_THRESHOLDS`)
- Booleans: Prefix `is`, `has`, `can` (e.g., `isExpense`, `hasLinkedAccounts`)
- Callbacks: Prefix `on` (e.g., `onSyncClick`, `onImportSuccess`)

**Types:**
- Interfaces: PascalCase (e.g., `BudgetProgress`, `ImportResult`)
- Type unions: PascalCase (e.g., `TransactionType = "income" | "expense"`)
- Generic: Single letter (e.g., `T`) or descriptive (e.g., `TData`)
- Database types: Prefix `Db` (e.g., `DbAccount`, `DbTransaction`)
- API types: Prefix with domain (e.g., `MockBank`, `ImportRequest`)

## Where to Add New Code

**New Feature (e.g., Recurring Transactions):**
- Primary code: `src/lib/recurring/index.ts` (business logic)
- Database: `src/lib/db/recurring.ts` (queries)
- API endpoint: `src/app/api/recurring/route.ts` (HTTP handler)
- Components: `src/components/recurring/` (UI)
- Types: Add to `src/types/finance.ts` if shared, else local interfaces
- Tests: `tests/lib/recurring.test.ts`

**New Component/Module:**
- Simple component: `src/components/{feature}/NewComponent.tsx`
- Complex component: `src/components/{feature}/NewComponent/index.tsx` + subfolder
- With state: Wrap with React Context in `src/contexts/` if cross-feature, else use local state
- With queries: Call exported functions from `src/lib/db/{module}.ts`

**Utilities:**
- Formatting helpers: `src/utils/format/index.ts`
- Mapping/configuration: `src/utils/mapping/index.ts`
- Chart builders: `src/utils/charts/index.ts`
- Create new file only if it exceeds ~200 lines

**New Page/Route:**
- Page: `src/app/{route-name}/page.tsx`
- Nested routes: `src/app/{route-name}/{sub-route}/page.tsx`
- Layout wrapper: `src/app/{route-name}/layout.tsx` (if needed)
- API endpoint: `src/app/api/{resource}/{action}/route.ts`
- Auth required: Middleware will protect automatically (see `src/middleware.ts` matcher)

**New API Endpoint:**
- Location: `src/app/api/{resource}/route.ts` (multiple methods) or `src/app/api/{resource}/{action}/route.ts` (single method)
- Pattern:
  ```typescript
  export async function POST(request: NextRequest) {
    // 1. Verify auth (middleware already did this, but you can check again)
    // 2. Parse + validate request body
    // 3. Call business logic from lib/
    // 4. Return JSON response with proper status code
  }
  ```
- Response types: Use interfaces to define shape (e.g., `interface ImportResult {}`)
- Error handling: Return `NextResponse.json({ error: "..." }, { status: 4xx })`

## Special Directories

**`.planning/codebase/`** - GSD Planning Output
- Purpose: Architecture analysis documents for orchestration
- Generated by: `/gsd:map-codebase` command
- Committed to: Git (for context in future tasks)
- Files: ARCHITECTURE.md, STRUCTURE.md, STACK.md, INTEGRATIONS.md, CONVENTIONS.md, TESTING.md, CONCERNS.md

**`docs/`** - Strategy and Design Documents
- Purpose: Architectural decisions, design rationale, implementation guides
- Committed to: Git (living documentation)
- Audience: Junior developers extending the codebase
- Update: When architecture decisions change or new patterns are introduced

**`.claude/rules/`** - Claude Code Instructions
- Purpose: Enforce consistent development workflow and safety
- Files:
  - `01-safety-and-workflow.md` - Commit discipline, no silent decisions
  - `02-task-execution.md` - Task types, decomposition, verification
- Committed to: Git (enforces team consistency)

**`.env.local`** - Local Environment (Git-Ignored)
- Purpose: Development secrets (Supabase keys, database URLs)
- Never committed
- Template: `.env.example` checked into git
- Required for: Supabase client setup, auth, API calls

**`supabase/migrations/`** - Database Migrations
- Purpose: Version-controlled schema changes
- Format: SQL files with timestamps (e.g., `001_initial_schema.sql`)
- Executed by: `bun run build` (via drizzle-kit)

---

*Structure analysis: 2026-01-23*
