# BetterBudget

BetterBudget is a web-based personal finance tracker designed to support users with ADHD. It focuses on reduced cognitive load, clear visual hierarchy, and predictable data flows. The application simulates a PSD2-compliant banking environment, importing transaction data from a mock banking API and providing budget tracking with ADHD-friendly feedback.

This project is built on top of the open-source [OopsBudgeter](OOPSBUDGETER_README.md) and was developed as part of a school project (IHK). Stability, explainability, and reproducibility are prioritized over feature completeness.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| Runtime | React 19, TypeScript |
| Database & Auth | Supabase (PostgreSQL + Auth, RLS) |
| Charts | Tremor v4 (Recharts internally) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Notifications | Sonner (toast) |
| Testing | Vitest, @testing-library/react |
| Package Manager | Bun |

---

## MVP Features

- **PSD2-style Mock Banking API**: Deterministic transaction data in PSD2 format
- **Bank Linking Flow**: Simulated consent/OAuth with mock banks
- **Idempotent Transaction Import**: UPSERT-based pipeline, safe to run multiple times
- **Dashboard**: KPI cards, budget progress, spending by category (donut chart)
- **Budget Tracking**: Per-category monthly limits with traffic-light status (green/yellow/red)
- **ADHD-friendly Notifications**: Clear, actionable budget alerts at 80% and 100% thresholds
- **Supabase Auth**: Email/password authentication with middleware-protected routes
- **Row Level Security**: All user data isolated at the database level

---

## MVP Scope

This project implements a focused, minimal feature set. The following are **intentionally not implemented**:

- Real banking APIs (PSD2 format is simulated)
- Background jobs or scheduled imports
- Push notifications or email alerts
- Multi-user features (teams, sharing)
- Currency conversion
- Financial advice or predictions

See individual strategy documents in `docs/` for detailed rationale.

---

## Getting Started

```bash
# Install dependencies
bun install

# Start development server (port 3031, Turbopack)
bun dev

# Run tests
bun run test

# Type checking
bun run typecheck

# Production build
bun run build
```

### Environment Variables

Create a `.env.local` file:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `PASSCODE` | Legacy | 6-digit PIN for legacy app access |
| `JWT_SECRET` | Legacy | Secret for legacy JWT auth |
| `DATABASE_URL` | Legacy | PostgreSQL connection (Drizzle ORM) |

---

## Project Structure

```
src/
├── app/            # Next.js App Router (routes & layouts)
├── components/     # Reusable UI components
├── lib/            # Business logic, DB access, auth
├── utils/          # Pure, stateless helper functions
└── types/          # Shared TypeScript interfaces

tests/              # Vitest test suite (smoke, render, utility)
docs/               # Architecture & strategy documents
```

---

## Documentation

Detailed architecture and strategy documents are in the `docs/` directory:

| Document | Content |
|----------|---------|
| `ARCHITECTURE_SKELETON.md` | Project architecture, routing, layer responsibilities |
| `SUPABASE_STRATEGY.md` | Auth, database, RLS decisions |
| `PSD2_MOCK_STRATEGY.md` | Mock banking API specification |
| `IMPORT_PIPELINE_STRATEGY.md` | Transaction import & UPSERT pipeline |
| `DASHBOARD_STRATEGY.md` | Dashboard layout, KPIs, charts |
| `BUDGET_STRATEGY.md` | Budget tracking & notification design |
| `DATABASE_SETUP.md` | SQL schema with RLS policies |
| `TESTING_STRATEGY.md` | MVP testing approach (Vitest) |
| `TREMOR_MIGRATION_ANALYSIS.md` | Tremor v3 to v4 migration |

---

## Routing

| Route | Description |
|-------|-------------|
| `/` | BetterBudget dashboard (protected) |
| `/login` | Authentication page |
| `/settings` | Budget configuration |
| `/link-bank` | Bank linking flow |
| `/legacy` | Legacy OopsBudgeter (for demo) |

---

## Legacy OopsBudgeter

This project is built on top of OopsBudgeter, a personal finance management app. The legacy application remains accessible at `/legacy` for demonstration purposes.

See [OOPSBUDGETER_README.md](OOPSBUDGETER_README.md) for the original project documentation.

---

## License

This project is licensed under the **Apache License 2.0**. See the [LICENSE](LICENSE) file for details.
