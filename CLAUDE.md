# BetterBudget / BetterBudgeter — Project Memory (CLAUDE.md)

## Project Overview

BetterBudget is a web-based personal finance tracker built on top of the open-source project "OopsBudgeter".

The goal of this project is to adapt and extend the existing codebase to better support users with ADHD by focusing on:

- reduced cognitive load
- clear visual hierarchy
- deterministic and reliable data flows
- minimal but meaningful features ("small but polished")

This project is developed as part of a school project with a strict time budget.
Stability, explainability, and reproducibility are more important than feature completeness.

---

## Team Context (IMPORTANT)

The development team consists **exclusively of junior developers** with **limited experience in Next.js, App Router, and Supabase**.

Because of this:

- Code must prioritize **readability and explainability**
- Architectural decisions should be **explicitly documented**
- Non-trivial logic should include **clear code comments**

Claude Code is expected to:

- Add **section-level comments** explaining what a file or block is responsible for
- Explain **why** a specific approach is used (not only *what* it does)
- Highlight **extension points** (e.g. “this is where feature X could be added later”)
- Avoid overly clever or obscure patterns

The goal is that a junior developer can:

- understand the codebase structure
- follow data flow and responsibilities
- safely extend features with guidance from comments

---

## Core Principles (DO NOT VIOLATE)

1. **Do not break existing OopsBudgeter functionality**

   - Existing routes, components, and features must continue to work.
   - Refactors must be additive and incremental.
   - If something must be deprecated, it must remain accessible or clearly isolated.
2. **Prefer additive changes over refactors**

   - New architecture lives alongside the old one.
   - Migration happens step-by-step, never in one big rewrite.
3. **Database is the single source of truth**

   - UI must never read directly from mock APIs.
   - All dashboards and notifications are based on persisted DB data.
4. **Idempotency is mandatory**

   - Transaction imports must be safe to run multiple times.
   - Stable `external_id` values are required.
   - DB constraints (UNIQUE(user_id, external_id)) must be respected.
5. **Deterministic behavior over realism**

   - Fake-Finance-API must return deterministic data.
   - Same input → same output (important for demos and tests).


## Fixed Architecture Decisions (DO NOT CHANGE WITHOUT ASKING)

### Tech Stack

- Next.js (App Router)
- TypeScript
- Supabase (PostgreSQL + Auth)
- Tremor (Charts)
- Radix UI (UI primitives)
- Sonner (In-app notifications)
- **bun (Package Manager & Runtime)**

Package management rules:

- `bun` MUST be used for:
  - dependency installation
  - running scripts
  - development and build commands
- `npm` and `yarn` must NOT be introduced or used
- If new scripts are added, they must be compatible with `bun`

Example:

- `bun install`
- `bun dev`
- `bun run build`

### Authentication

- Supabase Auth is the **single authentication system**
- Email/Password or Magic Link is sufficient for MVP
- Auth is required for accessing:
  - dashboard
  - import
  - settings
- No custom auth systems should be introduced

### High-Level Feature Modules

- Fake-Finance-API (PSD2-style mock)
- Import Pipeline (UPSERT-based, idempotent)
- Dashboard & Visualizations
- Notifications & UI Personalization

### Routing (Canonical)

- `/link-bank` — PSD2-style mock linking flow
- `/dashboard` — main dashboard (DB-backed)
- `/settings` — UI variants & notification preferences
- Legacy OopsBudgeter routes remain reachable

---

## Project Structure (Conceptual)

The project follows a layered structure with clear responsibility boundaries.

### `app/`

- Routes and route-level UI
- Authentication boundaries
- No business logic
- No direct database access

### `components/`

- Reusable UI components
- No direct data fetching
- Prefer composition over complex props

### `lib/`

- Business logic and orchestration
- Import logic
- Notification logic
- Supabase DB access
- Auth helpers

### `utils/` (REQUIRED)

The `utils` folder contains **pure, stateless helper functions**.

Allowed in `utils/`:

- formatting helpers (dates, currency, numbers)
- small deterministic calculations
- Tremor-related helpers (chart config, color mapping)
- mapping helpers (e.g. category → color/label)

Explicitly NOT allowed in `utils/`:

- database access
- API calls
- side effects
- global state
- business rules

If logic needs data access or decisions → it belongs in `lib/`, not `utils/`.

---

## Data Model (Conceptual)

Key tables:

- users
- accounts
- transactions
- budgets
- ui_settings
- notification_preferences

Important constraints:

- `transactions`: UNIQUE(user_id, external_id)

---

## Scope Boundaries (Explicitly Out of Scope)

The following are intentionally NOT implemented in this project:

- Real banking APIs
- Real PSD2 / OAuth / eIDAS flows
- Push notifications
- Background jobs / cron
- Complex multi-user permission models
- Currency conversion
- Financial advice or predictions

---

## UX Philosophy (ADHD-focused)

- Few elements, high signal
- Clear defaults, minimal configuration
- Avoid visual noise
- Prefer summaries over raw tables
- Empty states must guide the user (CTA instead of blank UI)

---

## When to STOP and ASK

Claude MUST stop and ask for clarification if:

- A change could break existing OopsBudgeter functionality
- A refactor would remove or significantly alter an existing route/component
- Authentication behavior or session handling changes
- Database schema changes affect existing data
- Logic is unclear whether it belongs in `utils/` or `lib/`
- A design decision is ambiguous or has multiple valid options

In these cases, ask a short, concrete question before proceeding.
