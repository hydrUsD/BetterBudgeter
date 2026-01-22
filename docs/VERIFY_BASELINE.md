# Baseline Verification — BetterBudget

This document verifies the baseline state of the BetterBudget project after
completing the initial setup tasks (Task 0-2b). The project is now ready for
feature implementation.

---

## 1. Setup

### Required Versions
- **Node.js**: v20+ (tested with v25.3.0)
- **Bun**: v1.0+ (tested with v1.3.3)

### Environment Variables (`.env.local`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `PASSCODE` | Yes (legacy) | 6-digit PIN for legacy app access |
| `JWT_SECRET` | Yes (legacy) | 32-character secret for legacy JWT |
| `DATABASE_URL` | Yes (legacy) | PostgreSQL connection string for Drizzle |
| `NEXT_PUBLIC_CURRENCY` | No | Currency code (default: USD) |

### Install & Start Commands
```bash
bun install          # Install dependencies
bun run dev          # Start dev server (port 3031, Turbopack)
bun run build        # Build for production
bun run start        # Start production server
bun run typecheck    # Run TypeScript type checking
```

---

## 2. Tech Stack Summary

### Core
- **Framework**: Next.js 15.2.1 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript (strict mode)
- **Package Manager**: Bun

### Database & Auth
- **Auth (New)**: Supabase Auth (Email/Password)
- **Database (New)**: Supabase PostgreSQL with RLS
- **JWT Library**: jose (Edge-compatible)
- **Database (Legacy)**: PostgreSQL via Drizzle ORM

### UI & Styling
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Charts**: Tremor v4 (uses Recharts internally)
- **Notifications**: Sonner (toast)
- **PWA**: @ducanh2912/next-pwa

### Testing
- **Test Runner**: Vitest 4.0.18
- **React Testing**: @testing-library/react 16.3.2
- **DOM Assertions**: @testing-library/jest-dom 6.9.1
- **Environment**: jsdom 27.4.0

---

## 3. Routes

### BetterBudget Routes (Supabase Auth)

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Protected | Main dashboard (primary landing page) |
| `/login` | Public | Supabase email/password login |
| `/dashboard` | Redirect | HTTP 308 redirect to `/` |
| `/settings` | Protected | Budget configuration & preferences |
| `/link-bank` | Protected | Bank linking flow |

### API Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/api/import` | Protected | Transaction import endpoint |
| `/api/mock/banks` | Protected | Mock bank list |
| `/api/mock/accounts` | Protected | Mock accounts |
| `/api/mock/transactions` | Protected | Mock transactions (PSD2 format) |
| `/api/notifications` | Protected | Notifications endpoint (skeleton) |

### Legacy Routes (Preserved for Demo)

| Route | Description |
|-------|-------------|
| `/legacy` | Legacy OopsBudgeter dashboard — passcode protected |
| `/legacy-index` | Legacy navigation index |
| `/analytics` | Legacy analytics page |
| `/achievements` | Legacy achievements page |
| `/api/auth/login` | Legacy passcode login (jose JWT) |
| `/api/transactions` | Legacy transaction CRUD (jose JWT) |
| `/api/achievements` | Legacy achievements CRUD |
| `/api/cron` | Legacy background job endpoint |

---

## 4. Manual Smoke Test Checklist

### Prerequisites
- [ ] `.env.local` file configured with all required variables
- [ ] Supabase project created with Auth enabled
- [ ] SQL migration applied to Supabase (see `supabase/migrations/`)
- [ ] PostgreSQL database accessible (for legacy features)

### New Features (BetterBudget)
- [ ] `/login` page loads
- [ ] Sign up creates new user in Supabase
- [ ] Sign in works with valid credentials
- [ ] `/` redirects to `/login` when not authenticated
- [ ] `/` (dashboard) loads when authenticated
- [ ] Sign out button works
- [ ] User email displays on dashboard

### Budget Features (Implemented — Task 6)
- [x] Budget configuration available in `/settings`
- [x] Budget progress displays on dashboard (traffic light cards)
- [x] Warning notification at 80% threshold (dialog)
- [x] Over-budget notification at 100% threshold (dialog)
- [x] Notifications triggered after import

### Legacy Features (OopsBudgeter)
- [ ] `/legacy` loads with passcode prompt
- [ ] Legacy passcode entry works
- [ ] Legacy dashboard loads after authentication
- [ ] Transaction list renders
- [ ] `/analytics` page works
- [ ] `/achievements` page works

### Build & Runtime
- [ ] `bun run typecheck` passes
- [ ] `bun run build` completes successfully
- [ ] `bun run start` runs without errors
- [ ] All routes return correct status codes

---

## 5. Known Limitations

### Resolved Issues

| Issue | Status | Resolution |
|-------|--------|------------|
| `jsonwebtoken` build error | **FIXED** | Replaced with `jose` library |
| Production build fails | **FIXED** | jose is Edge-compatible |

### Remaining Limitations

#### Database Dependencies
- `bun run build` script includes `drizzle-kit push`
  - Requires valid `DATABASE_URL` to execute
  - Build will fail without database connection
  - Workaround: Run `bun x next build` directly to skip Drizzle

#### Legacy Code
- Legacy routes still use PasscodeWrapper (localStorage-based)
- No migration path from legacy data to new Supabase tables
- Two auth systems coexist (legacy passcode + Supabase)

#### Warnings
- Browserslist data is outdated
  - This is a warning only, not blocking
  - Can be updated with `npx update-browserslist-db@latest`

#### Code Quality Observations
- No explicit error boundaries
- Test suite: Vitest with 22 passing tests (smoke + render + utility)
- Some unused legacy dependencies in package.json (mongoose, mysql2, quick.db)

---

## 6. Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Auth route group
│   │   └── login/          # Login page (Supabase)
│   ├── achievements/       # Legacy achievements
│   ├── analytics/          # Legacy analytics
│   ├── api/                # API routes
│   │   ├── auth/           # Legacy auth (jose)
│   │   ├── import/         # Transaction import (implemented)
│   │   ├── mock/           # Mock banking API (implemented)
│   │   └── notifications/  # Notifications (skeleton)
│   ├── dashboard/          # Redirect to / (HTTP 308)
│   ├── legacy/             # Legacy OopsBudgeter dashboard
│   ├── legacy-index/       # Legacy navigation index
│   ├── link-bank/          # Bank linking flow (implemented)
│   ├── settings/           # Budget config & preferences (implemented)
│   └── page.tsx            # BetterBudget dashboard (primary landing)
├── components/
│   ├── auth/               # Auth components (LoginForm, SignOutButton)
│   ├── providers/          # Context providers
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── auth/               # Auth helpers (getUser, requireUser)
│   ├── db/                 # Database access
│   │   ├── supabase.ts     # Browser client
│   │   ├── supabaseServer.ts # Server client
│   │   ├── accounts.ts     # Account queries
│   │   ├── transactions.ts # Transaction queries
│   │   ├── budgets.ts      # Budget queries
│   │   ├── settings.ts     # Settings queries
│   │   └── types.ts        # Database types
│   ├── budgets/            # Budget progress calculation
│   ├── import/             # Import pipeline logic (implemented)
│   ├── mock/               # Mock data generators (PSD2 format)
│   └── notifications/      # Budget threshold notifications
├── middleware.ts           # Route protection (Supabase)
├── schema/                 # Drizzle ORM schema (legacy)
├── types/                  # Shared TypeScript types
├── utils/                  # Utility functions
│   ├── format/             # Date/currency formatting
│   ├── charts/             # Chart color helpers, pie chart data transform
│   └── mapping/            # Category mapping
│
tests/                      # Vitest test suite
├── smoke/                  # Import smoke tests
├── components/             # Component render tests
└── utils/                  # Pure utility function tests

supabase/
└── migrations/
    └── 001_initial_schema.sql  # RLS-enabled tables
```

---

## 7. Database Schema (Supabase)

New tables with Row Level Security (RLS):

| Table | Description |
|-------|-------------|
| `bb_accounts` | Linked bank accounts |
| `bb_transactions` | Imported transactions (idempotent via `external_id`) |
| `bb_budgets` | Per-category monthly spending limits (MVP feature) |
| `bb_user_settings` | User preferences (theme, currency) |
| `bb_notification_prefs` | Notification preferences |

All tables enforce `user_id = auth.uid()` via RLS policies.

See `supabase/migrations/001_initial_schema.sql` for full schema.
See `docs/BUDGET_STRATEGY.md` for budget feature design.

---

## 8. Verification History

| Date | Task | Verified By |
|------|------|-------------|
| 2026-01-20 | Task 0: Baseline import | Claude Code |
| 2026-01-20 | Task 1: Architecture skeleton | Claude Code |
| 2026-01-20 | Task 2: Supabase strategy | Claude Code |
| 2026-01-20 | Task 2b: Supabase integration | Claude Code |
| 2026-01-20 | Fix: jose migration | Claude Code |
| 2026-01-22 | Task 3-4: PSD2 Mock + Import pipeline | Claude Code |
| 2026-01-22 | Task 5: Dashboard & visualizations | Claude Code |
| 2026-01-22 | Task 6: Budget tracking & notifications | Claude Code |
| 2026-01-22 | Tremor v4 migration | Claude Code |
| 2026-01-22 | Routing restructure (/ as primary) | Claude Code |
| 2026-01-22 | MVP test suite (Vitest, 22 tests) | Claude Code |

**Current Branch**: `feat/budget-notifications`
