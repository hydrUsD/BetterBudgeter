# Phase 6: Design Tokens - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 06-design-tokens
**Areas discussed:** Tailwind utility exposure, Token block structure, Font strategy, Base style application (TOKEN-04), Typographic rules scope (TOKEN-07)

---

## Tailwind Utility Exposure

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — map to Tailwind | Add --bb-* to @theme inline (following shadcn pattern). Components use bg-bb-surface etc. | ✓ |
| No — CSS vars only | Skip @theme inline registration; components use var(--bb-*) directly | |
| You decide | Claude picks based on project patterns | |

**User's choice:** Map all token categories to Tailwind utilities (colors, spacing, radius, shadows, typography)
**Notes:** User selected "all categories" — full Tailwind exposure for every token group, not just colors.

---

## Token Block Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Separate labeled block | Second :root block with clear comment header after shadcn block | ✓ |
| Merged into existing blocks | Add --bb-* vars inside the existing :root / .dark blocks | |

**User's choice:** Separate labeled block for :root and for .dark
**Follow-up question — @theme inline separation:**

| Option | Description | Selected |
|--------|-------------|----------|
| Separate @theme block | Second @theme inline block just for BB tokens, with comment header | ✓ |
| Merged into existing @theme block | Add --color-bb-* etc. into the existing @theme inline block | |

**User's choice:** Separate @theme inline block for BB tokens too
**Notes:** Full visual separation maintained at every level — shadcn first, then BB, in @theme, :root, and .dark.

---

## Font Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Alias Geist Sans | --bb-font-sans: var(--font-geist-sans) | |
| System font stack | Per DESIGN_SYSTEM.md §3.1 exactly | |

**User's choice (free text):** Lucida Sans / Grande led stack, with the DESIGN_SYSTEM.md system stack appended after Verdana. Prototype — not finalized.

**Full discussion:** User had reviewed ADHD accessibility font research (sdrc.ucr.edu) and created a visual font comparison. They prefer Lucida Sans/Grande for its distinctive, open letterforms over generic system fonts. Claude recommended a Lucida-led stack with Verdana as fallback for its ADHD-legibility pedigree.

**Agreed prototype stack:**
```
"Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Verdana,
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

**Notes:** User confirmed this is a prototype. Font stack to be finalized during Phase 11 copy/accessibility pass.

---

## Base Style Application (TOKEN-04)

| Option | Description | Selected |
|--------|-------------|----------|
| Apply globally | Extend @layer base body {} — 16px already browser default, 1.5x marginal improvement | ✓ |
| Scope to BB pages only | Leave @layer base untouched; PageShell applies it in Phase 7 | |

**User's choice:** Apply globally
**Notes:** Raised by Claude as a missed item during roadmap double-check. User agreed global application is fine.

---

## Typographic Rules Scope (TOKEN-07)

| Option | Description | Selected |
|--------|-------------|----------|
| Phase 6 — global CSS reset | Add em { font-style: normal } etc. to @layer base now | |
| Phase 10+ — component guidelines | Defer to component-level conventions; no global resets | ✓ |

**User's choice:** Phase 10+ — component guidelines only
**Notes:** Raised by Claude as a missed item. Global resets (no-italics etc.) risk touching legacy OopsBudgeter pages. Deferred to safer phase.

---

## Claude's Discretion

None — all decisions confirmed with user.

## Deferred Ideas

- **Scrollbar token migration** — Hardcoded dark scrollbar colors in globals.css; defer to Phase 11
- **TOKEN-07 typographic rules** — Global no-italics, left-align resets; defer to Phase 10+
- **Font stack finalization** — Prototype agreed; finalize in Phase 11
