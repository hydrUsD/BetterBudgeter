# Phase 3: UI Library Migration - Context

**Gathered:** 2026-01-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Replace Tremor with shadcn/ui charts, install Base UI as the secondary primitive layer, remove Tremor dependency entirely, and clean up all related configuration. This phase executes the migration strategy defined in Phase 2.

</domain>

<decisions>
## Implementation Decisions

### DonutChart replacement
- Fresh look is acceptable — no need to match current Tremor appearance exactly
- Data correctness matters, visual styling will be reworked in redesign phase anyway
- Labels, colors, center total: Claude's discretion based on what shadcn/ui charts support easily

### Cleanup scope
- **Unify color system**: Remove getTremorColor(), use only CATEGORY_COLORS throughout
- **Grep before removing**: Check globals.css utilities (lines 5-53) for usage before deleting
- **Full Tremor cleanup**: Remove all traces — types, utils, any references in codebase
- **Full dependency cleanup**: Prune unused transitive dependencies after removing @tremor/react

### Verification approach
- **Level**: Build + typecheck + data verification (no visual spot-check needed)
- **Data verification**: All spending categories from the data must appear in the chart
- **Failure handling**: Fix and retry, but document all issues encountered for post-execution discussion

### Base UI setup
- **Install now**: Add @base-ui/react dependency in this phase
- **Document usage**: Add guidance to CLAUDE.md about when to use Base UI vs shadcn/ui
- **Version pinning**: Claude's discretion based on stability assessment

### Claude's Discretion
- Label positioning on the new chart (tooltip, legend, or on-chart)
- Color palette for chart segments (use CSS variables or CATEGORY_COLORS)
- Whether to show center total in donut
- Exact Base UI version pinning strategy

</decisions>

<specifics>
## Specific Ideas

- Visual appearance changes are acceptable since full UI redesign is coming
- Focus on data correctness over visual fidelity
- Any issues encountered during migration should be documented for discussion

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-ui-library-migration*
*Context gathered: 2026-01-28*
