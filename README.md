# BetterBudget

> A web-based personal finance tracker designed for people with ADHD — built to reduce cognitive load, not add to it.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)

**🔗 Live demo:** [better-budgeter.app](https://www.better-budgeter.app)

> ⚠️ **Active learning project, not a finished product.** It started as an IHK vocational-school project and is being continued privately. The focus is on deliberate, documented decisions — and it keeps evolving in focused milestones.

---

## About

BetterBudget imports transactions from a **PSD2-style mock banking API** and turns them into a calm, predictable budgeting experience. The product goal is narrow on purpose: support people with ADHD where typical finance apps overwhelm them — through less noise, clearer defaults, and feedback that guides instead of shames.

It is built on top of the open-source [OopsBudgeter](OOPSBUDGETER_README.md). Because it was developed under a strict school-project time budget, **stability, explainability, and reproducibility were prioritized over feature completeness.**

---

## Three Core Pillars

Everything in BetterBudget rests on three principles that work together:

1. **Deterministic data flows** — the same input always produces the same output. The mock banking API is reproducible, imports are idempotent (safe to re-run), and the database is the single source of truth.
2. **Reduced cognitive load** — a hub-and-spoke UI shows only what matters first, a small fixed set of broad categories, traffic-light status instead of raw numbers, and soft colors instead of alarming red.
3. **Clear visual hierarchy** — a token-based design system (typography scale, 4px spacing grid, layered color roles) so a user can understand their financial state at a glance.

Pillar 1 comes from the MVP; pillars 2 and 3 come from the dedicated ADHD design-system work (see [Design System](#design-system-adhd-focused)).

---

## Key Features

- **Home hub (ADHD-friendly):** a single landing page with a *Safe-to-Spend* hero, compact budget indicators, the last few transactions, and one sync button — detail lives on dedicated spoke pages.
- **Budget tracking:** per-category monthly limits with a three-level traffic-light status (on track / getting close / over budget). Progress is calculated from transaction data, never stored stale.
- **Idempotent import pipeline:** UPSERT-based and safe to run repeatedly. A `UNIQUE(user_id, external_id)` constraint means no duplicate transactions, ever.
- **PSD2-style mock banking API:** deterministic, read-only data in a real PSD2 shape (`transactionId`, `bookingDate`, `transactionAmount`, …).
- **Bank-linking flow:** a simulated OAuth-style consent step, mirroring a real PSD2 connection.
- **Spending insights:** spending-by-category donut chart (Recharts via shadcn/ui).
- **Compassionate notifications:** budget alerts at 80% and 100% thresholds, worded to guide rather than shame.
- **Supabase Auth + Row Level Security:** email/password auth with middleware-protected routes; every user's financial data is isolated at the database level.
- **Light & dark mode:** every design token ships light and dark values.
- **Accessibility & motion:** semantic HTML, WCAG 2.2 AA targets, visible focus states, and full `prefers-reduced-motion` support.

---

## Design System (ADHD-focused)

A central part of the project is a custom, research-backed design system (documented in `docs/DESIGN_SYSTEM.md`, `docs/DESIGN.md`, and `docs/ADHD_UX_RESEARCH.md`).

**Five design principles** guide every UI decision:
1. **Calm over Comprehensive** — show the essentials first, hide depth until asked.
2. **Compassion over Correction** — soft coral instead of bright red, "getting close" instead of "warning".
3. **Clarity over Cleverness** — plain component names and predictable patterns.
4. **Consistency over Customization** — the same tokens and patterns everywhere.
5. **Progressive over Prescriptive** — smart defaults, with advanced options available but never required.

**Design tokens** are defined as `--bb-*` CSS custom properties in `src/app/globals.css` and exposed to Tailwind v4 via `@theme inline`:
- **Color** in `oklch()` with light/dark values; soft semantic financial colors (a calm coral deliberately replaces alarm-red to avoid anxiety triggers).
- **Spacing** on a strict 4px grid; **radius** and a **typography scale** with matching line-height and weight tokens.

**Architecture & components:** a hub-and-spoke layout (Home hub + `/budgets`, `/transactions`, `/settings` spokes, with a persistent tab bar) and a small, focused component set — `KpiCard`, `BudgetProgressCard`, `TransactionItem`, `SpendingByCategoryChart`, `EmptyState` — each consuming the same tokens.

The design system also ships a copy pass (shame-free language), a WCAG 2.2 AA accessibility pass, and a functional-only motion system with `prefers-reduced-motion` support.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19, TypeScript |
| Database & Auth | Supabase (PostgreSQL + Auth, RLS) |
| Charts | Recharts (via shadcn/ui charts) |
| Styling | Tailwind CSS v4 (`@theme inline` tokens) |
| UI Components | shadcn/ui · Base UI (headless gaps) · Radix UI (legacy only) |
| Notifications | Sonner |
| Theming | next-themes (light/dark) |
| Testing | Vitest, @testing-library/react |
| Package Manager | Bun |
| Deployment | Vercel |

---

## Architecture & Key Decisions

This project treats *why* as more important than *what*. The decisions that shaped it:

- **Database is the single source of truth.** Dashboards and notifications read persisted, user-isolated data — never the mock API directly. This keeps behavior deterministic and explainable.
- **Idempotency is mandatory.** Imports are UPSERTs keyed on a stable `external_id`, so re-running an import can never create duplicates.
- **Budget progress is calculated, not stored.** It is derived from transaction data on every load, so it can never go stale.
- **PSD2 patterns without real banking.** Real certification is out of scope, but the data shapes, consent flow, and RLS isolation deliberately mimic it — a future migration to a real banking API would be a small change, not a rewrite.
- **Additive over rewrite.** New BetterBudget code lives in its own route groups (`(bb)`, `(auth)`) alongside the original OopsBudgeter app (`(legacy)`), which stays reachable at `/legacy`.

Every decision is written up in its own strategy document — see [Documentation](#documentation).

---

## Project Structure

```
src/
├── app/
│   ├── (bb)/        # New BetterBudget routes (hub + spokes)
│   ├── (auth)/      # Login
│   ├── (legacy)/    # Original OopsBudgeter app (untouched)
│   └── api/         # Mock banking API + import endpoint
├── components/
│   ├── dashboard/   # BetterBudget components (KpiCard, BudgetProgressCard, …)
│   ├── ui/          # shadcn/ui primitives
│   └── legacy/      # Preserved legacy components
├── lib/             # Business logic (safe-to-spend, budgets, import, auth)
└── utils/           # Pure, stateless helpers (formatting, category colors)

tests/               # Vitest suite (smoke + render)
docs/                # Architecture, strategy & design documents
```

---

## Getting Started

```bash
bun install        # install dependencies
bun dev            # dev server (port 3031, Turbopack)
bun run test       # run the Vitest suite
bun run typecheck  # TypeScript check
bun run build      # production build
```

### Environment Variables

Create a `.env.local`:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `PASSCODE` | Legacy | PIN for legacy app access |
| `JWT_SECRET` | Legacy | Secret for legacy JWT auth |
| `DATABASE_URL` | Legacy | PostgreSQL connection (Drizzle ORM) |

---

## Routing

| Route | Description |
|-------|-------------|
| `/` | Home hub (protected) |
| `/budgets` | Budget overview + spending-by-category chart |
| `/transactions` | Full transaction history + income/expense KPIs |
| `/settings` | Budgets, linked accounts, notification preferences |
| `/login` | Authentication |
| `/link-bank` | Bank-linking flow |
| `/dashboard` | Redirects to `/` (legacy path) |
| `/legacy` | Original OopsBudgeter app (kept for demo) |

---

## Scope & Status

**Done:** the MVP (deterministic data flows, mock API, idempotent imports, auth, RLS, budget tracking) and the full ADHD design system — tokens, hub-and-spoke layout, spoke pages, component library, dark mode, plus a copy / accessibility / motion pass (WCAG 2.2 AA, semantic HTML, `prefers-reduced-motion`).

**Deliberately out of scope** — a design choice, not a gap: multi-user or sharing features (BetterBudget is single-user by design).

**Possible future directions:** integration with a real banking API (the PSD2-style architecture is built for exactly this migration) and, building on it, automatic sync — one of the simplest, highest-impact ways to reduce a user's cognitive load, and a priority once a real API is connected. Beyond that: push/email notifications, multi-currency support, and richer financial insights.

It remains an active learning project — the scope of each milestone was and will be kept deliberately small, polished, and explainable.

---

## What I Learned

- The biggest surprise: how much an upfront ADHD focus decides for you. Designing around the ADHD research — and the design system that grew out of it — settled most of the important choices at the architecture level, so by the time I reached implementation there was surprisingly little left to decide.
- How a single database constraint (`UNIQUE(user_id, external_id)`) removes a whole class of duplicate-data bugs.
- How Row Level Security enforces data isolation at the database layer instead of trusting application code.
- Keeping `utils/` pure and pushing data access and decisions into `lib/` keeps the codebase explainable.

---

## How This Was Built

BetterBudget was developed solo using the [GSD ("Get Shit Done")](https://github.com/open-gsd/gsd-pi) framework — a **human-in-the-loop** workflow — together with **Claude Code** as a development and knowledge assistant. Architectural decisions were made and documented by me; AI tooling assisted the implementation. The documented decision-making in `docs/` is the part I care most about and can speak to.

---

## Documentation

Detailed strategy and design documents live in `docs/`:

| Document | Content |
|----------|---------|
| `ARCHITECTURE_SKELETON.md` | Architecture, route groups, layer responsibilities |
| `SUPABASE_STRATEGY.md` | Auth, database, RLS decisions |
| `PSD2_MOCK_STRATEGY.md` | Mock banking API specification |
| `IMPORT_PIPELINE_STRATEGY.md` | Transaction import & UPSERT pipeline |
| `DASHBOARD_STRATEGY.md` | Home hub layout & Safe-to-Spend |
| `BUDGET_STRATEGY.md` | Budget tracking & notification design |
| `DATABASE_SETUP.md` | SQL schema with RLS policies |
| `DESIGN_SYSTEM.md` | ADHD design principles, tokens, components |
| `DESIGN.md` | Machine-readable design spec (tokens, typography) |
| `UI_ARCHITECTURE.md` | UI library boundaries (shadcn/ui, Base UI, Recharts) |
| `ADHD_UX_RESEARCH.md` | Research behind the ADHD-focused decisions |
| `TESTING_STRATEGY.md` | MVP testing approach (Vitest) |

---

## Built on OopsBudgeter

This project extends [OopsBudgeter](OOPSBUDGETER_README.md) by Laith Alkhaddam. The original app remains accessible at `/legacy`. Thanks to the OopsBudgeter project for the open-source foundation.

---

## License

Apache License 2.0 — see [LICENSE](LICENSE).
