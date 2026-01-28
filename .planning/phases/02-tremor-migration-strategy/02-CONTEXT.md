# Phase 2: UI Library Strategy - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Audit current UI library usage across the codebase, document the new library architecture (shadcn/ui + Base UI replacing Tremor), and produce a strategy document with component inventory, boundary rules, and migration risk assessment. This phase produces documentation and decisions — Phase 3 executes the migration.

</domain>

<decisions>
## Implementation Decisions

### Audit scope (from session 1)
- Full component inventory: every UI component mapped to its library
- Separate sections for legacy OopsBudgeter vs BetterBudgeter components
- Flag components that are candidates for shadcn/ui replacement
- Include existing shadcn/ui components too (full picture)
- Previous Tremor audit (02-01-PLAN.md) remains valid: only 1 Tremor component found (DonutChart)

### Library boundary rules
- **shadcn/ui first**: default choice for all new BetterBudgeter components
- **Base UI**: only when shadcn/ui doesn't cover the need (headless primitives)
- **Radix UI**: legacy OopsBudgeter only — strict separation, no mixing into BB components
- **Strict import rule**: BetterBudgeter components must never import from `@radix-ui` directly
- **Legacy frozen**: legacy OopsBudgeter pages stay on Radix only, no shadcn/ui adoption
- **Charts**: only new BetterBudgeter charts use shadcn/ui charts. If legacy happens to use Tremor charts, do NOT change them (legacy stays frozen)

### Tremor removal criteria
- **Scope**: Claude's discretion — remove component usage, and determine whether types/utils/configs should also go based on what's actually imported
- **Tailwind config**: remove all Tremor-specific entries (clean slate)
- **DonutChart replacement**: data match is sufficient, visual appearance can change (will be redesigned later)
- **Verification**: build + typecheck only. No visual screenshot comparison required

### Decision document format
- **Audience**: developer (me) and Claude only — no junior-dev explanations needed
- **Content**: include full component inventory (every component → which library)
- **Location**: `.planning/` (internal planning artifact)
- **CLAUDE.md update**: yes, add library boundary rules to CLAUDE.md once strategy is finalized

### Claude's Discretion
- Tremor removal depth (full vs partial) based on actual imports found
- Document structure (single vs multiple files)
- Component grouping in the inventory

</decisions>

<specifics>
## Specific Ideas

- Project is now a personal project (no longer school project) — audience is just developer and Claude
- Previous Tremor audit from 02-01-PLAN.md is still valid and should be incorporated
- Library rules should be enforced via CLAUDE.md update, not just documented in strategy

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-ui-library-strategy*
*Context gathered: 2026-01-28*
