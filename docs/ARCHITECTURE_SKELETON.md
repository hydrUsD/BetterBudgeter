# BetterBudget Architecture

This document describes the architecture of the BetterBudget project.
Originally created as a skeleton in Task 1, the architecture has since been
fully implemented through Tasks 2–6.

---

## Overview

BetterBudget is being built **additively** on top of OopsBudgeter.
This means:

- Legacy routes and functionality remain untouched
- New features are implemented in parallel
- Migration happens incrementally, not all at once

---

## Folder Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth route group (implemented)
│   │   └── login/          # Supabase Auth login page
│   ├── link-bank/          # Bank linking flow (implemented)
│   ├── dashboard/          # Redirect to / (HTTP 308)
│   ├── settings/           # User preferences (implemented)
│   ├── legacy/             # Legacy OopsBudgeter dashboard (moved from /)
│   ├── legacy-index/       # Legacy navigation index
│   ├── api/
│   │   ├── mock/           # Fake-Finance API (implemented)
│   │   │   ├── banks/      # List mock banks
│   │   │   ├── accounts/   # List mock accounts
│   │   │   └── transactions/ # List mock transactions
│   │   ├── import/         # Transaction import endpoint (implemented)
│   │   ├── notifications/  # In-app notifications (implemented)
│   │   ├── auth/           # Legacy passcode auth (unchanged)
│   │   ├── transactions/   # Legacy transactions API (unchanged)
│   │   ├── achievements/   # Legacy achievements API (unchanged)
│   │   └── cron/           # Legacy cron endpoint (unchanged)
│   │
│   ├── analytics/          # Legacy analytics page (unchanged)
│   ├── achievements/       # Legacy achievements page (unchanged)
│   └── page.tsx            # BetterBudget dashboard (primary landing page)
│
├── components/
│   ├── dashboard/          # Dashboard-specific components (implemented)
│   ├── finance/            # Finance-related components (implemented)
│   ├── common/             # Shared components (exists)
│   ├── ui/                 # UI primitives (exists)
│   └── ...                 # Other legacy component folders (unchanged)
│
├── lib/
│   ├── auth/               # Supabase Auth module (implemented)
│   ├── db/                 # Supabase database module (implemented)
│   ├── import/             # Import pipeline logic (implemented)
│   ├── finance/            # Financial calculations (implemented)
│   ├── budgets/            # Budget calculation logic (new — Task 6)
│   ├── notifications/      # Notification logic (implemented)
│   └── ...                 # Legacy lib files (unchanged)
│
├── utils/
│   ├── format/             # Formatting helpers (implemented)
│   ├── charts/             # Chart config helpers (implemented)
│   ├── mapping/            # Category/data mapping (implemented)
│   └── ...                 # Legacy utils (unchanged)
│
├── types/
│   └── finance.ts          # Shared finance DTOs (implemented)
│
├── contexts/               # React contexts (unchanged)
├── hooks/                  # React hooks (unchanged)
├── schema/                 # Drizzle schema (unchanged)
└── constants/              # App constants (unchanged)
```

---

## Routing Strategy

### BetterBudget Routes (Supabase Auth Protected)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Main dashboard (primary landing page) | Implemented |
| `/login` | Supabase Auth login | Implemented |
| `/link-bank` | Bank linking flow | Implemented |
| `/dashboard` | Redirect to `/` (HTTP 308) | Implemented |
| `/settings` | User preferences & budget configuration | Implemented |

### Legacy Routes (OopsBudgeter)

| Route | Purpose | Status |
|-------|---------|--------|
| `/legacy` | Legacy OopsBudgeter dashboard (for demo) | Implemented |
| `/legacy-index` | Legacy navigation index | Implemented |
| `/analytics` | Spending trends | Unchanged |
| `/achievements` | Gamification | Unchanged |

### API Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/mock/banks` | List mock banks | Implemented |
| `/api/mock/accounts` | List mock accounts | Implemented |
| `/api/mock/transactions` | List mock transactions | Implemented |
| `/api/import` | Transaction import | Implemented |
| `/api/notifications` | In-app notifications | Skeleton |
| `/api/auth/login` | Legacy passcode auth | Unchanged |
| `/api/transactions` | Legacy transactions | Unchanged |
| `/api/achievements` | Legacy achievements | Unchanged |

---

## Layer Responsibilities

### `app/` — Routing & UI

- Contains only route-level pages and layouts
- No business logic
- No direct database access
- Delegates to `lib/` for data operations

### `components/` — Reusable UI

- Presentational components
- No direct data fetching (receive props)
- Organized by domain (`dashboard/`, `finance/`)

### `lib/` — Business Logic

- Database operations (Supabase)
- Authentication logic
- Import pipeline
- Financial calculations
- Notification management

### `utils/` — Pure Helpers

- **Stateless** — no side effects
- **Pure** — same input → same output
- No database access
- No API calls
- Examples: formatters, chart config, mappings

### `types/` — Type Definitions

- Shared TypeScript interfaces
- DTOs for data transfer
- No runtime code

---

## Migration Progress

### Phase 1: Skeleton — Completed
- Created folder structure
- Added route placeholders
- Defined types and interfaces

### Phase 2: Supabase Integration — Completed
- Set up Supabase client (server + browser)
- Implemented auth module (email/password)
- Created database schema with RLS
- Middleware-based route protection

### Phase 3: Feature Implementation — Completed
- Implemented mock bank API (PSD2-like)
- Implemented import pipeline (idempotent UPSERT)
- Built dashboard components (KPIs, charts, budget progress)
- Budget tracking with ADHD-friendly notifications

### Phase 4: Routing Restructure — Completed
- `/` is now the BetterBudget dashboard (protected)
- `/dashboard` redirects to `/` via HTTP 308
- Legacy OopsBudgeter moved to `/legacy` (public, for demo)
- Legacy navigation preserved at `/legacy-index`

---

## Key Design Decisions

### Why Additive?
- Reduces risk of breaking existing functionality
- Allows parallel development
- Users can fall back to legacy if needed
- Easier to test incrementally

### Why Separate `lib/db/`?
- Legacy uses Drizzle directly
- New features use Supabase client
- Clean separation prevents coupling
- Can migrate Drizzle → Supabase gradually

### Why `utils/` Rules?
- Prevents side effects in helpers
- Easier to test
- Clear responsibility boundaries
- Junior-dev friendly

---

## Key Files (Implemented)

### Pages
- `src/app/page.tsx` — BetterBudget dashboard (primary landing page)
- `src/app/(auth)/login/page.tsx` — Supabase Auth login
- `src/app/link-bank/page.tsx` — Bank linking flow
- `src/app/dashboard/page.tsx` — Redirect to `/` (HTTP 308)
- `src/app/settings/page.tsx` — Budget configuration & preferences
- `src/app/legacy/page.tsx` — Legacy OopsBudgeter dashboard
- `src/app/legacy-index/page.tsx` — Legacy navigation index

### API Routes
- `src/app/api/mock/banks/route.ts` — Mock bank list
- `src/app/api/mock/accounts/route.ts` — Mock accounts
- `src/app/api/mock/transactions/route.ts` — Mock transactions (PSD2 format)
- `src/app/api/import/route.ts` — Transaction import (UPSERT)

### Library Modules
- `src/lib/auth/` — Supabase Auth helpers (server + client)
- `src/lib/db/` — Database access (accounts, transactions, budgets, settings)
- `src/lib/import/` — Import pipeline logic
- `src/lib/budgets/` — Budget progress calculation
- `src/lib/notifications/` — Budget threshold notifications

### Dashboard Components
- `src/components/dashboard/BudgetProgressSection.tsx` — Traffic light budget cards
- `src/components/dashboard/SpendingByCategoryChart.tsx` — Donut chart (Tremor v4)
- `src/components/dashboard/index.ts` — Barrel exports

### Utilities
- `src/utils/charts/` — Chart color helpers, pie chart data transform
- `src/utils/mapping/` — Category mapping
- `src/utils/format/` — Formatting helpers

### Types
- `src/types/finance.ts` — Shared finance DTOs (BudgetProgress, etc.)

---

## Implementation History

| Task | Description | Status |
|------|-------------|--------|
| Task 1 | Architecture skeleton | Completed |
| Task 2 | Supabase Auth integration | Completed |
| Task 3 | Mock Finance API (PSD2) | Completed |
| Task 4 | Import pipeline (UPSERT) | Completed |
| Task 5 | Dashboard & visualizations | Completed |
| Task 6 | Budget tracking & notifications | Completed |

---

*Document created: Task 1 — Architecture Skeleton*
*Last updated: Documentation sync (reflects current implemented state)*
