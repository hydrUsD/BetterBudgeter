# External Integrations

**Analysis Date:** 2026-01-23

## APIs & External Services

**Mock Banking API (PSD2-Compliant):**
- **Endpoint:** `/api/mock/*` (internal)
- **Purpose:** Simulates PSD2-compliant banking data without real banking integration
- **Components:**
  - `/api/mock/banks` - Returns list of mock banks (GET)
  - `/api/mock/accounts` - Returns accounts for a given bankId (GET)
  - `/api/mock/transactions` - Returns transactions for an account (GET)
- **Implementation:** `src/lib/mock/index.ts` generates deterministic mock data
- **Auth:** Requires Supabase authentication
- **Data Format:** PSD2-style structures (transactionId, bookingDate, transactionAmount, etc.)

**Import Pipeline:**
- **Endpoint:** `/api/import` (internal)
- **Purpose:** Fetches mock transactions and UPSERTs to database
- **Flow:** Mock API → Transform → Database UPSERT
- **Idempotency:** Uses external_id as conflict key (UNIQUE constraint)
- **Implementation:** `src/lib/import/index.ts`
- **Auth:** Requires authentication

**Transactions API (Legacy):**
- **Endpoint:** `/api/transactions` (legacy OopsBudgeter)
- **Purpose:** Legacy transaction CRUD operations
- **Auth:** Public (uses passcode wrapper)

**Budgets API:**
- **Endpoint:** `/api/budgets` (new BetterBudget)
- **Purpose:** Create, read, update budget limits per category
- **Implementation:** Route handlers in `src/app/api/budgets/route.ts`
- **Auth:** Requires authentication
- **Data Model:** Per-user, per-category monthly limits

**Achievements API (Legacy):**
- **Endpoint:** `/api/achievements` (legacy)
- **Purpose:** Track user achievements/milestones
- **Implementation:** `src/app/api/achievements/route.ts`
- **Auth:** Public (uses passcode wrapper)

## Data Storage

**Databases:**

**PostgreSQL (Primary):**
- **Provider:** Supabase (managed PostgreSQL)
- **Connection:** Pooled connection via `DATABASE_URL`
- **Client:** Drizzle ORM
- **Schema Location:** `src/schema/dbSchema.ts`
- **Tables:**
  - `transactions` - Imported financial transactions
  - `achievements` - User achievement records
  - Additional tables managed by Supabase Auth

**SQLite (Legacy):**
- **Provider:** better-sqlite3 (local file-based)
- **Purpose:** Legacy OopsBudgeter compatibility
- **Not used in BetterBudget core**

**MongoDB (Legacy):**
- **Provider:** Mongoose ORM
- **Purpose:** Legacy OopsBudgeter compatibility
- **Not used in BetterBudget core**

**File Storage:**
- **Local filesystem only** - No cloud storage integration
- **File Download:** Via react-to-print and file-saver for exports

**Caching:**
- **No caching layer** detected in dependencies
- **Browser caching:** PWA service worker (via next-pwa)

## Authentication & Identity

**Auth Provider:**
- **Service:** Supabase Auth (self-hosted)
- **Implementation:** Email/Password authentication
- **Packages:**
  - `@supabase/supabase-js` - Client SDK
  - `@supabase/ssr` - Server-side session management

**Session Management:**
- **Type:** Cookie-based with JWT tokens
- **Middleware:** `src/middleware.ts` enforces auth on protected routes
- **Cookie Handling:** via `next/headers` in App Router
- **Session Refresh:** Automatic via Supabase middleware

**Protected Routes:**
- `/` - Main dashboard (requires auth)
- `/settings` - User settings (requires auth)
- `/link-bank` - Bank linking (requires auth)
- `/api/import/*` - Import endpoint (requires auth)
- `/api/mock/*` - Mock API (requires auth)

**Public Routes:**
- `/login` - Login page
- `/auth/*` - Auth callback pages
- `/legacy`, `/legacy-index` - Legacy OopsBudgeter (uses passcode wrapper)
- `/achievements`, `/analytics` - Legacy (uses passcode wrapper)

## Monitoring & Observability

**Error Tracking:**
- **Not detected** - No Sentry, Rollbar, or Datadog integration

**Logging:**
- **Approach:** Console logging only
  - Server logs: `console.log()`, `console.error()`
  - Client logs: Browser console
  - Examples: `[api/import]`, `[dashboard]`, `[notifications]` prefixes in logs
- **Structured Logging:** Not implemented

**Performance Monitoring:**
- **Not detected** - No performance monitoring tools

## CI/CD & Deployment

**Hosting:**
- **Deployment Platform:** Not specified in codebase
- **Expected:** Vercel (compatible with Next.js), or self-hosted Node.js

**Build & Deploy:**
- **Build Command:** `bun run build`
  - Runs Drizzle migrations: `npx drizzle-kit push`
  - Builds Next.js: `next build`
- **Start Command:** `bun start`

**CI Pipeline:**
- **Not detected** - No GitHub Actions, GitLab CI, or Jenkins config

## Environment Configuration

**Required Environment Variables:**

```ini
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_...

# Database (Required)
DATABASE_URL=postgresql://user:password@host:port/database

# Application (Required)
NEXT_PUBLIC_CURRENCY=USD                 # Display currency (e.g., USD, EUR)

# Legacy / Optional
JWT_SECRET=your-secret-key-here          # 32+ character JWT signing key
PASSCODE=123456                          # Passcode for legacy routes
SUPABASE_SERVICE_ROLE_KEY=...            # Optional: for admin operations
```

**Secrets Location:**
- Development: `.env.local` (git-ignored)
- Production: Platform-managed secrets (Vercel, Docker, etc.)
- Never commit `.env.local` or keys to git

## Webhooks & Callbacks

**Incoming Webhooks:**
- **None detected** - No external services triggering actions in BetterBudget

**Outgoing Webhooks:**
- **None detected** - No external service notifications

**Auth Callbacks:**
- Supabase Auth redirects to `/auth/callback` after login (implied by SSR setup)

## Third-Party Services Summary

**In Use:**
- Supabase - Authentication and PostgreSQL hosting
- Next.js Vercel deployment-ready (but not required)

**Not Used:**
- Real banking APIs (Plaid, Wise, etc.) - Simulated with mock API
- Payment processors (Stripe, PayPal)
- Email service (SendGrid, AWS SES)
- Push notification services
- Analytics services (Google Analytics, Mixpanel)
- Error tracking (Sentry, Rollbar)
- APM (DataDog, New Relic)

## Integration Patterns

**Internal Data Flow:**

1. **Import Flow:**
   - `POST /api/import` (client initiates)
   - Middleware: Auth check
   - Handler fetches mock transactions via `generateMockTransactions()`
   - Transforms to `DbTransactionInsert` format
   - UPSERT via `upsertTransactions()` with `external_id` conflict key
   - Returns import result summary
   - Client displays toast notification via Sonner

2. **Authentication Flow:**
   - User submits login form
   - Handler calls `signInWithEmail()` via Supabase
   - Supabase returns JWT token, stored in httpOnly cookies
   - Middleware refreshes session on each request
   - Protected routes redirect to `/login` if no session

3. **Budget Notifications:**
   - Import completes successfully
   - `checkBudgetThresholds()` queries database
   - Compares spending vs limits per category
   - Returns list of `BudgetAlert` objects
   - Converted to Sonner toast notifications
   - Non-blocking: if budget check fails, import still succeeds

---

*Integration audit: 2026-01-23*
