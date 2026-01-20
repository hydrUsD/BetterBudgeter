# Baseline Verification — OopsBudgeter Import

This document verifies the baseline state of the imported OopsBudgeter codebase.
No functional changes were made during this verification.

---

## 1. Setup

### Required Versions
- **Node.js**: v20+ (tested with v25.3.0)
- **Bun**: v1.0+ (tested with v1.3.3)

### Environment Variables (`.env.local`)
| Variable | Required | Description |
|----------|----------|-------------|
| `PASSCODE` | Yes | 6-digit PIN for app access |
| `JWT_SECRET` | Yes | 32-character secret for JWT |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXT_PUBLIC_CURRENCY` | No | Currency code (default: USD) |

### Install & Start Commands
```bash
bun install          # Install dependencies
bun run dev          # Start dev server (port 3031)
bun run build        # Build for production (requires DATABASE_URL)
bun run typecheck    # Run TypeScript type checking
```

---

## 2. Tech Stack Summary

- **Framework**: Next.js 15.2.1 (App Router)
- **Runtime**: React 19
- **Language**: TypeScript (strict mode)
- **Database**: PostgreSQL via Drizzle ORM
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **Notifications**: Sonner (toast)
- **PWA**: @ducanh2912/next-pwa
- **Authentication**: Passcode + JWT (custom implementation)

---

## 3. Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard — balance, income/expense cards, transaction list |
| `/analytics` | Analytics page — spending trends, charts |
| `/achievements` | Achievements page — gamification badges |
| `/api/auth/login` | POST — passcode validation, JWT issuance |
| `/api/transactions` | Transaction CRUD operations |
| `/api/achievements` | Achievement CRUD operations |
| `/api/cron` | Background job endpoint |

---

## 4. Manual Smoke Test Checklist

### Prerequisites
- [ ] `.env.local` file configured with valid credentials
- [ ] PostgreSQL database accessible

### Tests
- [ ] `bun install` completes without errors
- [ ] `bun run dev` starts server on http://localhost:3031
- [ ] Landing page loads (passcode prompt appears)
- [ ] Passcode entry works (using PASSCODE env value)
- [ ] Dashboard loads after authentication
- [ ] Balance card displays
- [ ] Income/Expense cards display
- [ ] Add transaction form is accessible
- [ ] Date picker works
- [ ] Transaction list renders
- [ ] Navigation to `/analytics` works
- [ ] Analytics charts render (if data exists)
- [ ] Navigation to `/achievements` works
- [ ] Achievements page renders
- [ ] Theme toggle (light/dark) works
- [ ] Settings dialog opens

---

## 5. Known Limitations (NOT FIXED)

These issues exist in the imported codebase and were intentionally not addressed:

### Build Errors
- **Production build fails** with `jsonwebtoken` library
  - Error: `TypeError: Cannot read properties of undefined (reading 'prototype')`
  - Location: `/api/auth/login` route during static generation
  - Root cause: `jsonwebtoken` package not fully compatible with Next.js App Router server context at build time
  - Impact: Production builds require investigation; dev server works fine

### Database Dependency
- `bun run build` script includes `drizzle-kit push`
  - Requires valid `DATABASE_URL` to execute
  - Build will fail without database connection

### Warnings
- Browserslist data is 11 months outdated
  - This is a warning only, not blocking
  - Can be updated with `npx update-browserslist-db@latest` (not done)

### Code Quality Observations (NOT FIXED)
- No explicit error boundaries
- Passcode stored in localStorage (client-side)
- No existing test suite
- No typecheck script existed (added in this task)
- Some unused dependencies in package.json (mongoose, mysql2, quick.db)

---

## 6. Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── achievements/ # Achievements page
│   ├── analytics/    # Analytics page
│   ├── api/          # API routes
│   └── page.tsx      # Dashboard (home)
├── components/       # Reusable UI components
├── constants/        # Static constants
├── contexts/         # React contexts (BudgetContext, AppContext)
├── hooks/            # Custom React hooks
├── lib/              # Business logic, DB access, utilities
└── schema/           # Drizzle ORM schema definitions
```

---

## 7. Verification Date

- **Date**: 2026-01-20
- **Verified by**: Claude Code (Task 0)
- **Commit**: (pending)