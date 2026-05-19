# Phase 6: Design Tokens - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Establish all `--bb-*` CSS custom properties in `src/app/globals.css` — covering colors, typography, spacing, border radius, and shadows in both light and dark mode. This is a pure CSS phase: no component changes, no routes, no backend changes. No visible UI change. The tokens are the foundation all subsequent phases (7–11) consume.

</domain>

<decisions>
## Implementation Decisions

### Tailwind Utility Exposure
- **D-01:** All `--bb-*` tokens are mapped to Tailwind utilities via a **separate, labeled `@theme inline` block** (separate from the existing shadcn `@theme inline` block). All token categories are included: colors, spacing, radius, shadows, and typography.
- **D-02:** Naming follows shadcn's convention — e.g., `--color-bb-surface: var(--bb-surface)` → enables `bg-bb-surface` in Tailwind classes. Spacing uses `--spacing-bb-*`, radius uses `--radius-bb-*`, etc.

### Token Block Structure
- **D-03:** `--bb-*` custom property definitions go in a **separate `:root` block** with a clear comment header (`/* BetterBudgeter Design System Tokens */`), placed after the existing shadcn `:root` block. Same separation applies to `.dark {}`.
- **D-04:** The `@theme inline` mappings for BB tokens go in a **separate labeled `@theme inline` block**, placed after the existing shadcn `@theme inline` block.
- **Structure pattern:**
  1. Existing shadcn `@theme inline { }` block (unchanged)
  2. New BB `@theme inline { /* BetterBudgeter */ }` block
  3. Existing shadcn `:root { }` block (unchanged)
  4. New BB `:root { /* BetterBudgeter Design System Tokens */ }` block
  5. Existing shadcn `.dark { }` block (unchanged)
  6. New BB `.dark { /* BetterBudgeter dark tokens */ }` block

### Font Strategy
- **D-05:** `--bb-font-sans` uses a **Lucida-led prototype stack** with the DESIGN_SYSTEM.md system stack appended as fallback:
  ```css
  --bb-font-sans: "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Verdana,
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  ```
  Rationale: Lucida covers ~90% of desktops with open humanist letterforms (ADHD-legible). Verdana is the ideal fallback (designed for screen legibility, best-in-class b/d differentiation). System stack tail covers everything else. **This is a prototype — finalize in Phase 11.**
- **D-06:** `--bb-font-mono` uses the spec stack: `ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace`.

### Base Style Application
- **D-07:** TOKEN-04 (16px body text / 1.5× line-height) is applied **globally** by extending the existing `@layer base body {}` rule. 16px is already the browser default so no visual regression expected. 1.5× line-height is a modest improvement everywhere.
- **D-08:** TOKEN-07 **typographic rules** (no italics for emphasis, always left-aligned, never justified, max 65–75 chars/line, heading spacing) are **NOT implemented as global CSS resets in Phase 6**. They are deferred to Phase 10+ as component-level conventions. Reason: global resets like `em { font-style: normal }` would touch legacy OopsBudgeter pages.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Specification (primary source of truth for token values)
- `docs/DESIGN_SYSTEM.md` §2 — Color palette (exact oklch values for all `--bb-*` color tokens, both light and dark)
- `docs/DESIGN_SYSTEM.md` §2.2 — Border radius tokens (`--bb-radius-sm` through `--bb-radius-xl`)
- `docs/DESIGN_SYSTEM.md` §2.3 — Shadow tokens (`--bb-shadow-sm/md/lg`)
- `docs/DESIGN_SYSTEM.md` §3.1 — Font stack specification (basis for D-05/D-06)
- `docs/DESIGN_SYSTEM.md` §3.2 — Type scale (exact sizes, line heights, weights for `--bb-text-xs` through `--bb-text-3xl`)
- `docs/DESIGN_SYSTEM.md` §4.1 — Spacing scale (4px-grid, `--bb-space-1` through `--bb-space-12`)

### Requirements (exact values and light/dark pairs)
- `.planning/REQUIREMENTS.md` — TOKEN-01 through TOKEN-07; each requirement includes exact values and acceptance criteria

### Target file to modify
- `src/app/globals.css` — File where all `--bb-*` tokens are added. Already uses Tailwind v4 (`@import "tailwindcss"`), `@theme inline {}`, `:root {}`, `.dark {}`, `@custom-variant dark (&:is(.dark *))`.

### ADHD rationale (for color choices)
- `docs/ADHD_UX_RESEARCH.md` — Why soft coral instead of bright red, why desaturated palette, etc.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/app/globals.css` — Existing shadcn/ui tokens follow the exact two-step pattern to replicate: define in `:root`/`.dark`, then map in `@theme inline`. Mirror this structure exactly for `--bb-*` tokens.
- `@custom-variant dark (&:is(.dark *))` — Dark mode mechanism. All `.dark { }` token blocks work via this variant. No changes needed to dark mode setup.

### Established Patterns
- **Two-step token pattern:** shadcn defines `--background: oklch(...)` in `:root`, then `--color-background: var(--background)` in `@theme inline`. The same pattern applies: define `--bb-bg: oklch(...)` in `:root`, then `--color-bb-bg: var(--bb-bg)` in `@theme inline`.
- **Dark mode via class:** next-themes applies `.dark` class to `<html>`. BB dark tokens go in the `.dark {}` block, consistent with shadcn.
- **Tailwind v4 syntax:** Uses `@import "tailwindcss"` (v4 style), NOT `@tailwind base/components/utilities`. Token registration uses `@theme inline {}`.

### Integration Points
- All `--bb-*` tokens land in `src/app/globals.css` only. No other files change in Phase 6.
- Phase 7 (Layout Shell) will be the first phase to actually consume these tokens in component code.
- The `next-themes` ThemeProvider in `src/components/providers/ThemeProvider.tsx` already handles dark/light switching — no changes needed.

</code_context>

<specifics>
## Specific Ideas

- **Font stack origin:** The prototype font stack (D-05) was informed by ADHD accessibility font research at https://sdrc.ucr.edu/accessible-powerpoint-fonts. User compared fonts visually and prefers Lucida Sans / Grande for its open letterforms and aesthetic distinctiveness over generic system fonts. Verdana is the chosen fallback for its screen legibility design pedigree.
- **Prototype caveat:** The font stack is explicitly a prototype. User explicitly said: "this is not the finalized font stack, but a prototype for it, that might become our finalized font stack later." Finalize in Phase 11.

</specifics>

<deferred>
## Deferred Ideas

- **Scrollbar token migration** — Current `globals.css` has hardcoded dark scrollbar colors (`#0a0a0a`, `#2e2e2e`, `#555555`). Could be updated to use `--bb-bg`/`--bb-border` tokens. Deferred to Phase 11 (cleanup pass).
- **TOKEN-07 typographic rules** — No-italics, left-align, max 65–75 chars/line, 8px heading spacing. These are component-level conventions, not Phase 6 CSS resets. Implement in Phase 10+ to avoid touching legacy pages.
- **Font stack finalization** — Prototype font stack (D-05) to be reviewed and confirmed in Phase 11 during the copy/accessibility pass.

</deferred>

---

*Phase: 06-design-tokens*
*Context gathered: 2026-05-19*
