# Technology Stack

**Analysis Date:** 2026-01-23

## Languages

**Primary:**
- TypeScript 5.x - Full codebase (Next.js App Router, React components, API routes)
- JavaScript (ES2020+) - Build tooling and configuration files

**Secondary:**
- SQL - PostgreSQL database queries (via Drizzle ORM)
- CSS - Tailwind CSS for styling

## Runtime

**Environment:**
- Node.js - Server-side runtime (version not pinned; uses compatible range)
- Bun - Package manager and alternative runtime (as per `CLAUDE.md` requirements)

**Package Manager:**
- Bun (mandatory for this project)
  - All dependencies installed via `bun install`
  - Lockfile: `bun.lockb` (generated)

## Frameworks

**Core:**
- Next.js 15.2.1 - Full-stack React framework with App Router
  - `next dev --turbopack -p 3031` - Development server with Turbopack bundler
  - `next build` - Production builds

**Frontend UI:**
- React 19.0.0 - Component library
- Radix UI (multiple packages) - Unstyled, accessible UI primitives
  - `@radix-ui/react-dialog`, `@radix-ui/react-select`, `@radix-ui/react-switch`, etc.
- Tremor 4.0.0-beta - Charts and data visualization (`@tremor/react`)
- Recharts 2.15.1 - Alternative charting library
- Sonner 2.0.1 - Toast notifications
- Tailwind CSS 4.x - Utility-first CSS framework
- Lucide React 0.479.0 - Icon library (SVG icons)
- Iconify React 5.2.0 - Extended icon support

**Forms & Input:**
- React Hook Form 7.54.2 - Form state management
- Zod 3.24.2 - Schema validation
- @hookform/resolvers 4.1.3 - Integration between RHF and Zod
- Input OTP 1.4.2 - OTP input component
- Timescape 0.7.1 - Date/time input

**Utilities:**
- Date-fns 4.1.0 - Date manipulation and formatting
- Class Variance Authority 0.7.1 - Conditional className merging
- clsx 2.1.1 - Conditional className utility
- Tailwind Merge 3.0.2 - Tailwind class conflict resolution
- React Day Picker 8.10.1 - Date picker component
- React to Print 3.0.5 - PDF/print functionality
- Vaul 1.1.2 - Drawer/modal component
- File Saver 2.0.5 - Download file utilities

**Theme & UI:**
- Next Themes 0.4.6 - Light/dark mode support

## Database

**Primary:**
- PostgreSQL - Hosted on Supabase
- Connection: Via `DATABASE_URL` env var (pooled connection)

**ORM & Migration:**
- Drizzle ORM 0.40.0 - Type-safe ORM for PostgreSQL
  - `drizzle-kit push` - Database migrations
  - Schema: `src/schema/dbSchema.ts`
- Drizzle Kit 0.30.5 - Migration and introspection tooling
- `pg` 8.14.0 - PostgreSQL client driver

**Legacy Database Support:**
- Better SQLite3 11.8.1 - Local SQLite for legacy features
- MySQL2 3.13.0 - MySQL driver (may be legacy OopsBudgeter)
- Mongoose 8.12.1 - MongoDB driver (may be legacy)
- quick.db 9.1.7 - Simple JSON database (legacy)

## Authentication

**Provider:**
- Supabase Auth - Self-hosted via PostgreSQL
  - `@supabase/supabase-js` 2.91.0 - JavaScript client
  - `@supabase/ssr` 0.8.0 - Server-side auth support (cookie handling)

**Auth Methods:**
- Email/Password - Implemented
- Magic Link - Supported by Supabase (optional)

**Session Management:**
- Cookie-based sessions (via Supabase middleware)
- JWT tokens from Supabase Auth

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.91.0 - All auth and realtime communication
- `drizzle-orm` 0.40.0 - Database access layer
- `next` 15.2.1 - Framework and routing
- `react` 19.0.0 - UI rendering
- `@tremor/react` 4.0.0-beta - Dashboard visualizations

**Development & Compilation:**
- TypeScript 5.x - Type checking and compilation
- TSX 4.19.3 - TypeScript/JSX execution
- ESLint 9.x - Code linting
- Tailwind CSS 4.x - CSS compilation (with @tailwindcss/postcss)

## Build & Development Tools

**Build:**
- Next.js Turbopack - High-performance bundler (in dev mode)
- PostCSS 4.x with @tailwindcss/postcss - CSS processing

**Testing:**
- Vitest 4.0.18 - Unit/component test runner
  - Environment: jsdom (simulated browser)
  - Config: `vitest.config.ts`
  - Command: `bun run test`
- @testing-library/react 16.3.2 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - DOM matchers
- jsdom 27.4.0 - DOM simulation for tests

**Type Checking:**
- TypeScript 5.x strict mode
- Command: `bun run typecheck`

**Linting:**
- ESLint 9.x with Next.js preset
- Command: `bun run lint`

**PWA & Offline:**
- @ducanh2912/next-pwa 10.2.9 - Progressive Web App support
  - Disabled in development
  - Service worker caching in production

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Compiler options with path aliases (`@/*` → `./src/*`)

**Build:**
- `next.config.ts` - Next.js configuration with PWA plugin
- `postcss.config.mjs` - PostCSS plugins for Tailwind
- `drizzle.config.ts` - Drizzle ORM migration config
- `vitest.config.ts` - Test runner configuration
- `eslint.config.mjs` - ESLint rules

## Environment Configuration

**Required Environment Variables:**
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL              # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY         # Supabase anonymous API key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY  # Alternative anon key (optional)

# Database
DATABASE_URL                          # PostgreSQL connection string (pooled)

# Auth (optional)
SUPABASE_SERVICE_ROLE_KEY            # Admin/service role key (optional, for migrations)

# Application
NEXT_PUBLIC_CURRENCY                  # Default currency (e.g., USD, EUR)
JWT_SECRET                            # JWT signing secret (legacy, 32+ chars required)
PASSCODE                              # Passcode for legacy routes (if used)
```

**Notes:**
- `NEXT_PUBLIC_*` variables are embedded in client bundle
- `DATABASE_URL` contains pooled connection credentials
- Sensitive keys (`JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) never exposed to client

## Platform Requirements

**Development:**
- Node.js compatible runtime (Node 18+ or Bun equivalent)
- PostgreSQL 12+ (via Supabase)
- Bun package manager

**Production:**
- Node.js 18+ compatible runtime
- PostgreSQL database (Supabase)
- Server-side rendering support (Next.js)
- HTTPS required for Supabase Auth

## Deployment Readiness

**Entry Point:**
- `src/app/layout.tsx` - Root layout component
- `src/middleware.ts` - Authentication middleware
- `next.config.ts` - PWA and build configuration

**Build Process:**
```bash
bun install                 # Install dependencies
bun run typecheck          # Type check
bun run build              # Build with Drizzle migrations + Next.js
```

**Start Command:**
```bash
bun start                  # Start production server
```

---

*Stack analysis: 2026-01-23*
