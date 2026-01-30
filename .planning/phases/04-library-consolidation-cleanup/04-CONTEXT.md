# Phase 4: Library Consolidation & Cleanup - Context

**Gathered:** 2026-01-30
**Status:** Ready for planning

<domain>
## Phase Boundary

Remove unused code, establish clear library boundaries, and document the new UI library system. This completes the technical debt cleanup from the Tremor migration and prepares the codebase for the redesign phase.

</domain>

<decisions>
## Implementation Decisions

### Tremor artifact cleanup
- Check usage of utils.ts Tremor utilities (focusInput, focusRing, hasErrorInput) first — remove if unused, rename to generic if used
- Update outdated Tremor comments in 3 files (dashboard/index.ts, utils/charts/index.ts, app/page.tsx) to reflect Recharts/shadcn-ui reality
- Do a comprehensive grep for any remaining 'tremor' references (case-insensitive) across entire src/ directory
- Update planning docs (.planning/) as well — change Tremor references to past tense for consistency

### Code documentation
- Document library responsibilities in BOTH header comments (in key files) AND a central documentation file
- Create docs/UI_ARCHITECTURE.md with Mermaid diagrams showing library relationships
- Document the chart color system (CATEGORY_COLORS) and how to use it
- Document Sonner notification patterns and where toasts are triggered

### Claude's Discretion
- Whether to include extension point guidance in header comments (based on file importance)

### Dependency audit
- Run full dependency audit with depcheck or similar — check ALL dependencies, not just Tremor-related
- Review findings before removing anything — some "unused" deps may be needed at runtime
- Check for and dedupe duplicate dependencies (same package at different versions)
- Don't update dependency versions — strictly removal only
- Document outdated dependencies in .planning/codebase/CONCERNS.md and add as a todo for future

### Sonner verification
- Verify via build + typecheck + code inspection (no manual testing required in this phase)
- If issues found during inspection: STOP, EXPLAIN, and ASK before fixing
- Document Sonner usage patterns as part of library documentation

</decisions>

<specifics>
## Specific Ideas

No specific requirements — decisions above are comprehensive.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-library-consolidation-cleanup*
*Context gathered: 2026-01-30*
