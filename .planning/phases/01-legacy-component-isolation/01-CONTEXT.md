# Phase 1: Legacy Component Isolation - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Structurally separate legacy OopsBudgeter components from BetterBudgeter components. Move legacy components into `components/legacy/`, update all imports, and reorganize freed BetterBudgeter components into the new structure. Zero functional changes — both apps must work identically after isolation.

</domain>

<decisions>
## Implementation Decisions

### Legacy boundary criteria
- Claude determines which components are "legacy" based on codebase analysis
- Three-bucket approach:
  1. **Unmodified legacy components** (only used by OopsBudgeter routes) → move to `components/legacy/`
  2. **Modified components** (adapted for BetterBudgeter) → duplicate: restore original to `components/legacy/`, keep BetterBudgeter version in main structure
  3. **Pure BetterBudgeter components** (new code) → stay where they are
- Use git history to restore original OopsBudgeter versions of modified components

### Directory structure
- `components/legacy/` preserves the original subfolder structure (e.g. `legacy/cards/`, `legacy/transactions/`, `legacy/categories/`)
- Mirrors the original component organization for familiarity

### Import rewiring
- Legacy routes (`/legacy`, `/legacy-index`) must be updated to import from `components/legacy/`
- Full separation: legacy routes use legacy components, new routes use new components
- Shared `utils/` and `lib/` imports remain shared — only UI components are isolated

### BetterBudgeter reorganization (DEFERRED)
- After legacy components are moved out, freed BetterBudgeter components could be reorganized into the new structure (e.g. `dashboard/`, `auth/`, `finance/`)
- Follows the pattern already established by `components/dashboard/` and `components/auth/`
- **Deferred:** Not in ROADMAP deliverables for Phase 1 (which is file moves + import rewiring only). Can be a follow-up task.

### Claude's Discretion
- Determining which specific components fall into each bucket (legacy, modified, new)
- Component naming in `components/legacy/` (same name vs prefixed)
- Exact reorganization targets for freed BetterBudgeter components
- Verification approach for ensuring both apps still work

</decisions>

<specifics>
## Specific Ideas

- Legacy OopsBudgeter must remain fully functional for demo purposes — this drives the duplicate-and-restore approach for modified components
- The pattern of `components/dashboard/` with barrel exports and documentation is the target structure for reorganized BetterBudgeter components

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-legacy-component-isolation*
*Context gathered: 2026-01-27*
