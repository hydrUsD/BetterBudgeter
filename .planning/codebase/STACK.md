# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5.x - Core application logic, type-safe components and utilities
- JSX/TSX - React component definitions and UI rendering

**Secondary:**
- JavaScript - Configuration files (eslint.config.mjs, postcss.config.mjs, next.config.ts)

## Runtime

**Environment:**
- Node.js 25.4.0 (used for npm tasks and build chain)
- Bun 1.3.3 (primary package manager and runtime for development/build)

**Package Manager:**
- Bun 1.3.3 - All dependency installation, script execution, and build commands
- Lockfile: `bun.lockb` (present)

## Frameworks

**Core:**
- Next.js 15.2.1 - Full-stack React framework with App Router
  - Server Components and Server Actions
  - API Routes (handled by `/api/` directory)
  - Built-in middleware support
  - Turbopack for fast dev server

**UI & Components:**
- React 19.0.0 - Component library and state management
- Radix UI 1.x - Unstyled, accessible UI primitives (`@radix-ui/*` packages)
  - Alert dialogs, context menus, modals, labels, popovers, selects, switches, tooltips
- Tremor 4.0.0-beta - React charting library for financial visualizations
- Recharts 2.15.1 - Alternative charting library for data visualization

**Forms & Validation:**
- React Hook Form 7.54.2 - Form state management and submission
- Hookform/resolvers 4.1.3 - Zod integration for form validation
- Zod 3.24.2 - Runtime schema validation for TypeScript

**Styling:**
- Tailwind CSS 4.0+ - Utility-first CSS framework
- Class Variance Authority (CVA) 0.7.1 - Component variant patterns
- Tailwind Merge 3.0.2 - Intelligent class merging for dynamic Tailwind
- Tailwind Animate 1.0.7 - Animation utilities

**Date & Time:**
- date-fns 4.1.0 - Date formatting, parsing, and manipulation utilities
- React Day Picker 8.10.1 - Calendar component for date selection

**Testing:**
- Vitest 4.0.18 - Fast unit testing framework
- Testing Library/React 16.3.2 - React component testing utilities
- Testing Library/Jest-DOM 6.9.1 - Custom Jest matchers for DOM testing
- jsdom 27.4.0 - Simulated browser environment for testing

**Build/Dev:**
- Drizzle ORM 0.40.0 - TypeScript ORM for database queries
- Drizzle Kit 0.30.5 - Database migration tooling
- Drizzle Zod 0.7.0 - Zod validation integration for Drizzle schemas
- TSX 4.19.3 - Execute TypeScript files directly
- Next PWA 10.2.9 - Progressive Web App support (offline capability)

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.91.0 - Client SDK for Supabase auth and database
- `@supabase/ssr` 0.8.0 - SSR utilities for cookie-based session management
- `pg` 8.14.0 - PostgreSQL client for Drizzle ORM queries
- `better-sqlite3` 11.8.1 - SQLite client (may be legacy from OopsBudgeter)

**Infrastructure & Utilities:**
- Sonner 2.0.1 - Toast notification library
- Iconify/React 5.2.0 - Icon library integration
- Lucide React 0.479.0 - SVG icon components
- Input OTP 1.4.2 - OTP input component
- Vaul 1.1.2 - Dialog/drawer UI component
- Timescape 0.7.1 - Time input component
- File Saver 2.0.5 - Download file utilities
- React to Print 3.0.5 - Print functionality
- Write File Atomic 6.0.0 - Atomic file writing
- JOSE 6.1.3 - JWT signing and verification
- Node Cron 3.0.3 - Scheduled task execution
- Dotenv 16.4.7 - Environment variable loading
- Clsx 2.1.1 - Conditional class name utility
- Next Themes 0.4.6 - Dark mode/theme management

**Deprecated/Legacy (from OopsBudgeter):**
- Mongoose 8.12.1 - MongoDB ODM (likely not used, can be removed)
- MySQL2 3.13.0 - MySQL client (likely not used, should be pg only)
- Quick.db 9.1.7 - Simple database (likely not used, superseded by Supabase)

## Configuration

**Environment:**
- Loaded from `.env.local` (Git-ignored)
- All Supabase variables are public (`NEXT_PUBLIC_` prefix) except service role key
- Key required variables:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
  - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` - Alternative key format
  - `DATABASE_URL` - PostgreSQL connection string (for Drizzle migrations)
  - `SUPABASE_SERVICE_ROLE_KEY` - Server-only admin key (optional, for admin operations)
  - `JWT_SECRET` - For custom JWT operations (32+ char required)
  - `NEXT_PUBLIC_CURRENCY` - Default currency code (e.g., "USD")
  - `PASSCODE` - Legacy passcode for OopsBudgeter features

**Build:**
- `tsconfig.json` - TypeScript strict mode, ES2017 target, path aliases (`@/*` → `./src/*`)
- `next.config.ts` - PWA support via `next-pwa`, caching and reload-on-online configured
- `drizzle.config.ts` - PostgreSQL dialect, schema at `./src/schema/dbSchema.ts`
- `vitest.config.ts` - jsdom environment, path aliases, test files in `tests/**/*.test.ts`
- `eslint.config.mjs` - Next.js core and TypeScript rules via flat config
- `postcss.config.mjs` - Tailwind CSS integration

## Platform Requirements

**Development:**
- Node.js 25.x or Bun 1.3.x
- PostgreSQL 12+ (via Supabase or local connection)
- Bun package manager (mandatory per CLAUDE.md)
- All dependencies installable via `bun install`

**Production:**
- Vercel (typical Next.js deployment platform)
- Supabase PostgreSQL database
- PWA-capable browser for offline functionality
- Build process: `bun run build` (runs drizzle migrations then Next.js build)

---

*Stack analysis: 2026-01-23*
