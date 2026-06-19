# BetterBudget

> A web-based personal finance tracker designed for users with ADHD — built to reduce cognitive load, not add to it.

<!-- BADGES — values are real where known; CI/coverage are placeholders, remove if unused -->
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-149ECA?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Auth-3FCF8E?logo=supabase)
![License](https://img.shields.io/badge/License-Apache%202.0-blue)

**🔗 Live demo:** [better-budgeter.app](https://www.better-budgeter.app)

> ⚠️ **This is an active learning project, not a finished product.** It started as an IHK vocational-school project and is being continued privately. The focus is on deliberate architecture decisions, documentation, and process — you will see work still in progress.

<!-- TODO: 1–3 screenshots or a short GIF of the dashboard + bank-linking flow. Recruiters look here first. -->
<!-- ![Dashboard](docs/screenshots/dashboard.png) -->

---

## About

BetterBudget imports transactions from a **PSD2-style mock banking API** and turns them into a calm, predictable budgeting dashboard. The product goal is narrow on purpose: support people with ADHD through **reduced cognitive load, clear visual hierarchy, and deterministic data flows** — summaries over raw tables, guidance over blank screens.

It is built on top of the open-source [OopsBudgeter](OOPSBUDGETER_README.md). Because it was developed under a strict school-project time budget, **stability, explainability, and reproducibility were prioritized over feature completeness.**

---

## Key Features

- **PSD2-style Mock Banking API** — deterministic transaction data in a real PSD2 shape (`transactionId`, `bookingDate`, `transactionAmount`, etc.). Same input → same output, which keeps demos and tests reproducible.
- **Idempotent import pipeline** — UPSERT-based and safe to run repeatedly. Stable `external_id` + a `UNIQUE(user_id, external_id)` constraint mean no duplicate transactions, ever.
- **Bank-linking flow** — a simulated OAuth-style consent screen, mirroring how a real PSD2 connection would work.
- **Dashboard** — KPI cards, budget progress, and spending-by-category visualization.
- **Budget tracking** — per-category monthly limits with traffic-light status (green / yellow / red) and clear alerts at 80% and 100%.
- **Row Level Security** — every user's financial data is isolated at the database level, the way a real banking app must be.
- **Supabase Auth** — email/password with middleware-protected routes.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19, TypeScript |
| Database & Auth | Supabase (PostgreSQL + Auth, RLS) |
| Charts | Recharts (via shadcn/ui charts) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui · Base UI (headless gaps) · Radix UI (legacy only) |
| Notifications | Sonner |
| Testing | Vitest, @testing-library/react |
| Package Manager | Bun |
| Deployment | Vercel |

---

## Architecture & Key Decisions

This project treats *why* as more important than *what*. The most relevant decisions:

- **Database is the single source of truth.** Dashboards and notifications never read from the mock API directly — they read persisted, user-isolated DB data. This keeps behavior deterministic and explainable.
- **Idempotency is mandatory.** Imports are UPSERTs keyed on a stable `external_id`, so re-running an import can never create duplicates. This is the core reliability guarantee of the app.
- **PSD2 patterns without real banking.** Real PSD2 certification is out of scope, but the data shapes, consent flow, and RLS isolation deliberately mimic it — so a future migration to a real banking API would be a small change, not a rewrite.
- **Additive over rewrite.** New BetterBudget architecture lives alongside the original OopsBudgeter code rather than replacing it; the legacy app stays reachable at `/legacy`.

Each decision is written up in its own strategy document — see [Documentation](#documentation).

---

## Project Structure

```
src/
├── app/            # Next.js App Router (routes & layouts) — UI only
├── components/     # Reusable UI components
├── lib/            # Business logic, DB access, auth orchestration
├── utils/          # Pure, stateless helpers (formatting, mapping)
└── types/          # Shared TypeScript interfaces

tests/              # Vitest suite (smoke, render, utility)
docs/               # Architecture & strategy documents
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
| `PASSCODE` | Legacy | 6-digit PIN for legacy app access |
| `JWT_SECRET` | Legacy | Secret for legacy JWT auth |
| `DATABASE_URL` | Legacy | PostgreSQL connection (Drizzle ORM) |

<!-- TODO (optional but recommended): a read-only demo login so reviewers can click through without setup. -->

---

## Routing

| Route | Description |
|-------|-------------|
| `/` | BetterBudget dashboard (protected) |
| `/login` | Authentication |
| `/settings` | Budget configuration |
| `/link-bank` | Bank-linking flow |
| `/legacy` | Original OopsBudgeter app (kept for demo) |

---

## Scope & Status

Intentionally **out of scope** (and why): real banking APIs, background jobs, push/email notifications, multi-user sharing, currency conversion, financial advice. The point was a small, polished, explainable slice — not a feature race.

**Status:** active learning project. Some areas are still being refined (UI polish, broader test coverage).

---

## What I Learned

<!-- Paul: 2–4 honest bullets in your own words. Starter ideas below — rewrite freely. -->
- Why idempotency matters in practice — and how a single DB constraint removes a whole class of duplicate-data bugs.
- How RLS enforces data isolation at the database layer instead of trusting application code.
- Where logic belongs: keeping `utils/` pure and pushing data access / decisions into `lib/`.
- Designing for a specific user need (ADHD: less noise, clearer defaults) instead of adding features.

---

## How This Was Built

BetterBudget was developed solo, using the [GSD ("Get Shit Done")](https://github.com/open-gsd/gsd-pi) framework — a **human-in-the-loop** workflow — together with **Claude Code** as a development and knowledge assistant. Architectural decisions were made and documented by me; AI tooling assisted the implementation. The documented decision-making (in `docs/`) is the part I care most about and can speak to.

---

## Documentation

Detailed strategy documents live in `docs/`:

| Document | Content |
|----------|---------|
| `ARCHITECTURE_SKELETON.md` | Architecture, routing, layer responsibilities |
| `SUPABASE_STRATEGY.md` | Auth, database, RLS decisions |
| `PSD2_MOCK_STRATEGY.md` | Mock banking API specification |
| `IMPORT_PIPELINE_STRATEGY.md` | Transaction import & UPSERT pipeline |
| `DASHBOARD_STRATEGY.md` | Dashboard layout, KPIs, charts |
| `BUDGET_STRATEGY.md` | Budget tracking & notification design |
| `DATABASE_SETUP.md` | SQL schema with RLS policies |
| `TESTING_STRATEGY.md` | MVP testing approach (Vitest) |

---

## Built on OopsBudgeter

This project extends [OopsBudgeter](OOPSBUDGETER_README.md) by Laith Alkhaddam. The original app remains accessible at `/legacy`. Thanks to the OopsBudgeter project for the open-source foundation.

---

## License

Apache License 2.0 — see [LICENSE](LICENSE).
