# Phase 2: Tremor Migration Strategy - Context

**Gathered:** 2026-01-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Create a safe migration plan from Tremor v4 beta to v1.0.0 stable. This phase produces strategy documentation — no code changes. Deliverables: usage audit, API difference docs, step-by-step migration plan, risk assessment. Phase 3 executes the migration.

</domain>

<decisions>
## Implementation Decisions

### Audit depth
- Full prop mapping: every Tremor component, every prop used, every value passed
- Check both legacy and BetterBudgeter components (expectation: legacy doesn't use Tremor, but verify)
- Include utility/type imports from @tremor/react, not just visual components
- Map each Tremor component to the page/route where it renders
- Include side-by-side API comparison: current v4 beta vs target version
- Audit Tremor's transitive dependencies (Recharts, Tailwind, etc.) to catch upstream changes

### Migration risk tolerance
- Claude assesses risk per component and decides grouping (one-at-a-time for high-risk, batched for low-risk)
- Verification standard: build + typecheck passes (visual check is manual, separate)
- Direct rewrite preferred over adapter patterns — update consuming code to new API directly
- Rollback documentation: Claude's discretion per step

### Documentation format
- Claude decides document structure (single doc vs multiple files)
- API differences must include before/after code examples (not just tables) — junior dev audience
- Strategy docs live in `.planning/phases/02-tremor-migration-strategy/`
- Must include recommended migration ORDER (sequenced by risk, dependencies, complexity)

### Fallback approach
- If a component is dropped in target version: find Tremor alternative first (stay in ecosystem)
- If behavior changes fundamentally: accept new v1.0.0 behavior (aligning to stable is the goal)
- Tremor version viability is a research deliverable — investigate whether v1.0.0 actually exists and is stable
- If no suitable stable Tremor version exists: FLAG AND PAUSE — stop Phase 2, revisit roadmap decision
- NOT open to switching chart libraries within this phase — that would be a roadmap-level decision

### Claude's Discretion
- Document structure (single vs multiple files)
- Rollback documentation per migration step
- Component grouping strategy (batch vs individual)

</decisions>

<specifics>
## Specific Ideas

- Junior dev audience is critical — code examples over abstract tables
- The team has never worked with Tremor before, so migration docs double as learning material
- Tremor v4 beta to v1.0.0 might be a significant version jump — the research must establish whether the target version is actually viable before planning migration steps

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-tremor-migration-strategy*
*Context gathered: 2026-01-27*
