# BetterBudget Architecture Skeleton

This document describes the architecture skeleton implemented in Task 1.
The skeleton provides the foundation for BetterBudget features without
modifying any existing OopsBudgeter functionality.

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
│   ├── (auth)/             # Auth route group (new)
│   │   └── login/          # Supabase Auth login page
│   ├── link-bank/          # Bank linking flow (new)
│   ├── dashboard/          # DB-backed dashboard (new)
│   ├── settings/           # User preferences (new)
│   ├── legacy/             # Legacy navigation index (new)
│   ├── api/
│   │   ├── mock/           # Fake-Finance API (new)
│   │   │   ├── banks/      # List mock banks
│   │   │   ├── accounts/   # List mock accounts
│   │   │   └── transactions/ # List mock transactions
│   │   ├── import/         # Transaction import endpoint (new)
│   │   ├── notifications/  # In-app notifications (new)
│   │   ├── auth/           # Legacy passcode auth (unchanged)
│   │   ├── transactions/   # Legacy transactions API (unchanged)
│   │   ├── achievements/   # Legacy achievements API (unchanged)
│   │   └── cron/           # Legacy cron endpoint (unchanged)
│   │
│   ├── analytics/          # Legacy analytics page (unchanged)
│   ├── achievements/       # Legacy achievements page (unchanged)
│   └── page.tsx            # Legacy home/dashboard (unchanged)
│
├── components/
│   ├── dashboard/          # Dashboard-specific components (new)
│   ├── finance/            # Finance-related components (new)
│   ├── common/             # Shared components (exists)
│   ├── ui/                 # UI primitives (exists)
│   └── ...                 # Other legacy component folders (unchanged)
│
├── lib/
│   ├── auth/               # Supabase Auth module (new)
│   ├── db/                 # Supabase database module (new)
│   ├── import/             # Import pipeline logic (new)
│   ├── finance/            # Financial calculations (new)
│   ├── notifications/      # Notification logic (new)
│   └── ...                 # Legacy lib files (unchanged)
│
├── utils/
│   ├── format/             # Formatting helpers (new)
│   ├── charts/             # Chart config helpers (new)
│   ├── mapping/            # Category/data mapping (new)
│   └── ...                 # Legacy utils (unchanged)
│
├── types/
│   └── finance.ts          # Shared finance DTOs (new)
│
├── contexts/               # React contexts (unchanged)
├── hooks/                  # React hooks (unchanged)
├── schema/                 # Drizzle schema (unchanged)
└── constants/              # App constants (unchanged)
```

---

## Routing Strategy

### New Routes (BetterBudget)

| Route | Purpose | Status |
|-------|---------|--------|
| `/login` | Supabase Auth login | Skeleton |
| `/link-bank` | Bank linking flow | Skeleton |
| `/dashboard` | DB-backed dashboard | Skeleton |
| `/settings` | User preferences | Skeleton |
| `/legacy` | Legacy navigation | Implemented |

### Legacy Routes (OopsBudgeter)

| Route | Purpose | Status |
|-------|---------|--------|
| `/` | Original dashboard | Unchanged |
| `/analytics` | Spending trends | Unchanged |
| `/achievements` | Gamification | Unchanged |

### API Routes

| Route | Purpose | Status |
|-------|---------|--------|
| `/api/mock/banks` | List mock banks | Skeleton |
| `/api/mock/accounts` | List mock accounts | Skeleton |
| `/api/mock/transactions` | List mock transactions | Skeleton |
| `/api/import` | Transaction import | Skeleton |
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

## Legacy Migration Approach

### Phase 1: Skeleton (Current)
- Create folder structure
- Add route placeholders
- Define types and interfaces
- No functional changes

### Phase 2: Supabase Integration
- Set up Supabase client
- Implement auth module
- Create database schema
- No data migration yet

### Phase 3: Feature Implementation
- Implement mock bank API
- Implement import pipeline
- Build dashboard components
- Data flows through new stack

### Phase 4: Gradual Migration
- Replace legacy routes one-by-one
- Keep legacy available as fallback
- Migrate data when ready

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

## Files Added in This Task

### Routes (4 pages)
- `src/app/(auth)/login/page.tsx`
- `src/app/link-bank/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/settings/page.tsx`
- `src/app/legacy/page.tsx`

### API Routes (6 endpoints)
- `src/app/api/mock/banks/route.ts`
- `src/app/api/mock/accounts/route.ts`
- `src/app/api/mock/transactions/route.ts`
- `src/app/api/import/route.ts`
- `src/app/api/notifications/route.ts`

### Library Modules (5 modules)
- `src/lib/auth/index.ts`
- `src/lib/db/index.ts`
- `src/lib/import/index.ts`
- `src/lib/finance/index.ts`
- `src/lib/notifications/index.ts`

### Utilities (3 modules)
- `src/utils/format/index.ts`
- `src/utils/charts/index.ts`
- `src/utils/mapping/index.ts`

### Components (2 index files)
- `src/components/dashboard/index.ts`
- `src/components/finance/index.ts`

### Types (1 file)
- `src/types/finance.ts`

---

## Next Steps

1. **Task 2**: Supabase Auth integration
2. **Task 3**: Mock Finance API implementation
3. **Task 4**: Import pipeline implementation
4. **Task 5**: Dashboard data integration

---

*Document created: Task 1 — Architecture Skeleton*
