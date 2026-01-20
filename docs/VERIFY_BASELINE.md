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
- **Charts**: Recharts
- **Notifications**: Sonner (toast)
- **PWA**: @ducanh2912/next-pwa

---

## 3. Routes

### New BetterBudget Routes (Supabase Auth)

| Route | Auth | Description |
|-------|------|-------------|
| `/login` | Public | Supabase email/password login |
| `/dashboard` | Protected | Main dashboard (placeholder) |
| `/settings` | Protected | User settings (placeholder) |
| `/link-bank` | Protected | Bank linking flow (placeholder) |
| `/legacy` | Public | Navigation to legacy app |

### New API Routes

| Route | Auth | Description |
|-------|------|-------------|
| `/api/import` | Protected | Transaction import endpoint (placeholder) |
| `/api/mock/banks` | Protected | Mock bank list (placeholder) |
| `/api/mock/accounts` | Protected | Mock accounts (placeholder) |
| `/api/mock/transactions` | Protected | Mock transactions (placeholder) |
| `/api/notifications` | Protected | Notifications endpoint (placeholder) |

### Legacy Routes (Unchanged)

| Route | Description |
|-------|-------------|
| `/` | Legacy dashboard — passcode protected |
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
- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] `/dashboard` loads when authenticated
- [ ] Sign out button works
- [ ] User email displays on dashboard

### Legacy Features (OopsBudgeter)
- [ ] `/` (legacy home) loads with passcode prompt
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
- No existing test suite
- Some unused dependencies in package.json (mongoose, mysql2, quick.db)

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
│   │   ├── import/         # Transaction import (placeholder)
│   │   ├── mock/           # Mock banking API (placeholder)
│   │   └── notifications/  # Notifications (placeholder)
│   ├── dashboard/          # New dashboard (Supabase)
│   ├── legacy/             # Legacy navigation
│   ├── link-bank/          # Bank linking (placeholder)
│   ├── settings/           # User settings (placeholder)
│   └── page.tsx            # Legacy home
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
│   │   ├── settings.ts     # Settings queries
│   │   └── types.ts        # Database types
│   ├── finance/            # Financial calculations (placeholder)
│   ├── import/             # Import logic (placeholder)
│   └── notifications/      # Notification logic (placeholder)
├── middleware.ts           # Route protection (Supabase)
├── schema/                 # Drizzle ORM schema (legacy)
├── types/                  # Shared TypeScript types
└── utils/                  # Utility functions
    ├── format/             # Date/currency formatting
    ├── charts/             # Chart helpers (placeholder)
    └── mapping/            # Data mapping (placeholder)

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
| `bb_user_settings` | User preferences (theme, currency) |
| `bb_notification_prefs` | Notification preferences |

All tables enforce `user_id = auth.uid()` via RLS policies.

See `supabase/migrations/001_initial_schema.sql` for full schema.

---

## 8. Verification History

| Date | Task | Verified By |
|------|------|-------------|
| 2026-01-20 | Task 0: Baseline import | Claude Code |
| 2026-01-20 | Task 1: Architecture skeleton | Claude Code |
| 2026-01-20 | Task 2: Supabase strategy | Claude Code |
| 2026-01-20 | Task 2b: Supabase integration | Claude Code |
| 2026-01-20 | Fix: jose migration | Claude Code |

**Current Branch**: `task-2b/supabase-auth-integration`

**Latest Commit**: `c7a9ab1` — fix: replace jsonwebtoken with jose for Edge compatibility
