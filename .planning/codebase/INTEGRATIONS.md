# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**Fake-Finance API (Mock PSD2):**
- Mock Banking Service - Simulates PSD2-compliant banking API for development/demo
  - SDK/Client: Built-in Next.js API routes (no external package)
  - Endpoints:
    - `GET /api/mock/banks` - List available mock banks
    - `GET /api/mock/accounts` - Get accounts for linked bank (returns `MockAccountsResponse`)
    - `GET /api/mock/transactions` - Get transactions for account (returns `MockTransactionsResponse`)
  - Auth: Requires Supabase session (checked by middleware)
  - Purpose: Provides deterministic, reproducible transaction data for demo and testing
  - Location: `src/app/api/mock/` routes, types in `src/lib/mock/types.ts`

**Data Format (PSD2 Simulation):**
- Transaction format mimics real PSD2 AISP (Account Information Services)
- Key fields: `transactionId`, `bookingDate`, `valueDate`, `transactionAmount`, `creditorName`/`debtorName`, `remittanceInformationUnstructured`
- Hybrid seed strategy: Same transaction content for all users per bank, unique IDs per user

## Data Storage

**Primary Database:**
- PostgreSQL (via Supabase)
  - Connection: `DATABASE_URL` environment variable (for Drizzle migrations)
  - Client: Drizzle ORM 0.40.0 with PostgreSQL driver (`pg`)
  - Tables (prefixed `bb_`):
    - `bb_accounts` - Linked bank accounts (legacy schema may vary)
    - `bb_transactions` - Imported transactions with stable `external_id`
    - `bb_budgets` - Per-category monthly spending limits
    - `bb_user_settings` - UI preferences and personalization
    - `bb_notification_prefs` - Notification settings
  - Row Level Security (RLS): Enabled on all tables for user data isolation
  - Schema location: `src/schema/dbSchema.ts` (Drizzle schema definition)
  - Migrations: Managed via Drizzle Kit (`drizzle-kit push`)

**Legacy/Supplementary Storage (May be unused):**
- SQLite via `better-sqlite3` 11.8.1 (from OopsBudgeter, likely not used)
- MongoDB via Mongoose 8.12.1 (from OopsBudgeter, likely not used)
- Quick.db 9.1.7 (from OopsBudgeter, likely not used)

**File Storage:**
- Local filesystem only - No S3 or cloud storage integration
- File saver for client-side downloads (CSV exports, print)
- Location: Uses `file-saver` package for browser-side file operations

**Caching:**
- None explicitly configured - Relies on:
  - Next.js built-in caching (static generation, revalidation)
  - Browser cache via PWA service worker
  - No Redis or external cache layer

## Authentication & Identity

**Auth Provider:**
- Supabase Auth (Primary)
  - Implementation: Email/Password authentication with session management
  - Auth methods: `signInWithPassword()`, `signUp()`, `signOut()`
  - Session persistence: Cookie-based (handled by `@supabase/ssr`)
  - Session scope: Protected routes verified via middleware (`src/middleware.ts`)
  - Location: `src/lib/auth/index.ts` (auth helpers), `src/lib/db/supabase.ts` (client creation)

**Session Management:**
- Cookies set by Supabase Auth (SSR-compatible)
- Middleware reads cookies and refreshes session on each request
- Server Components access session via `createServerSupabaseClient()`
- Client Components access session via `createBrowserSupabaseClient()`

**Protected Routes (via middleware):**
- Page routes: `/`, `/settings`, `/link-bank` - Redirect to `/login` if not authenticated
- API routes: `/api/import`, `/api/mock/*`, `/api/notifications` - Return 401 if not authenticated
- Public routes: `/login`, `/auth/*`, legacy routes `/legacy`, `/analytics` (use PasscodeWrapper for legacy access)

**User Identification:**
- Supabase `user.id` (UUID) is the primary user identifier
- Passed through to DB queries via RLS policies
- All user data scoped by `user_id` column

## Monitoring & Observability

**Error Tracking:**
- None configured - No Sentry, LogRocket, or external error service

**Logs:**
- Console logging only:
  - `console.warn()` for Supabase configuration issues (middleware)
  - `console.error()` for failed imports or API errors
  - Location: Ad-hoc throughout codebase, no centralized logging

## CI/CD & Deployment

**Hosting:**
- Vercel (typical deployment for Next.js)
- Supabase (database and auth hosting)

**CI Pipeline:**
- None explicitly configured in repository
- Manual deployment expected (or Vercel Git integration)
- Build command: `bun run build` (runs `drizzle-kit push` then `next build`)
- Start command: `bun start` (Next.js production server)
- Dev command: `bun dev --turbopack -p 3031` (Turbopack-enabled dev server on port 3031)

**Type Checking & Linting:**
- TypeScript: `bun typecheck` (strict mode)
- ESLint: `bun lint` (Next.js + TypeScript rules)
- No pre-commit hooks configured in repository

## Environment Configuration

**Required env vars (for core functionality):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public auth key
- `DATABASE_URL` - PostgreSQL connection string (for migrations)

**Optional env vars (for features):**
- `SUPABASE_SERVICE_ROLE_KEY` - Admin operations (if needed)
- `JWT_SECRET` - Custom JWT operations (32+ chars)
- `NEXT_PUBLIC_CURRENCY` - Default currency (defaults to "USD")
- `PASSCODE` - Legacy OopsBudgeter passcode protection
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Alternative Supabase key format

**Secrets location:**
- `.env.local` (Git-ignored, local development only)
- Vercel Environment Variables (for production)
- Supabase Project Settings > API > Keys (for configuration)

## Webhooks & Callbacks

**Incoming:**
- None configured - No Stripe webhooks, Supabase webhooks, or external webhook consumers

**Outgoing:**
- None configured - No API calls to external services for callbacks
- In-app notifications only: Sonner toasts for user feedback

## Legacy OopsBudgeter APIs (Deprecated but preserved)

**Routes still present:**
- `/legacy` - Legacy dashboard
- `/legacy-index` - Legacy navigation
- `/analytics` - Legacy analytics (uses PasscodeWrapper)
- `/achievements` - Legacy achievements (uses PasscodeWrapper)

**API Routes (legacy, may still work):**
- `/api/auth/*` - Legacy auth endpoints
- `/api/transactions` - Legacy transactions endpoint
- `/api/achievements` - Legacy achievements endpoint

**Purpose:** Preserve existing functionality and allow gradual migration to new Supabase/BetterBudget architecture

---

*Integration audit: 2026-01-23*
