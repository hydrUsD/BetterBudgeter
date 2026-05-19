---
plan: 06-03
phase: 06-design-tokens
status: complete
commit: 383c619
completed: 2026-05-19
requirements_covered:
  - TOKEN-01
  - TOKEN-02
  - TOKEN-03
  - TOKEN-04
  - TOKEN-05
  - TOKEN-06
  - TOKEN-07
---

# Plan 06-03 Summary: BB @theme inline Tailwind Mappings

## What Was Built

Added the BB `@theme inline` block to `src/app/globals.css`, immediately after the existing shadcn `@theme inline` block. This completes Step 2 of the two-step token pattern — all `--bb-*` custom properties are now accessible as Tailwind utility classes.

## Mapping Inventory — 49 total

### Color Mappings (TOKEN-01/02/03) — 21 entries
- `--color-bb-{name}: var(--bb-{name})` → enables `bg-bb-*`, `text-bb-*`, `border-bb-*`
- Foundation: bg, surface, surface-raised, text, text-secondary, border
- Semantic: positive, positive-bg, caution, caution-bg, negative, negative-bg, info, info-bg
- Category: cat-essentials, cat-discretionary, cat-savings, cat-food, cat-transport, cat-entertainment, cat-other

### Spacing Mappings (TOKEN-05) — 9 entries
- `--spacing-bb-{n}: var(--bb-space-{n})` → enables `p-bb-*`, `m-bb-*`
- Steps: 1, 2, 3, 4, 5, 6, 8, 10, 12 (steps 7/9/11 absent, matching :root)

### Radius Mappings (TOKEN-06) — 4 entries
- `--radius-bb-{name}: var(--bb-radius-{name})` → enables `rounded-bb-*`
- sm, md, lg, xl

### Typography Mappings (TOKEN-07) — 15 entries
- 5 size tokens: `--text-bb-{xs/sm/base/xl/3xl}`
- 5 line-height companions: `--text-bb-{size}-lh`
- 5 font-weight companions: `--text-bb-{size}-fw`

**Shadow tokens intentionally excluded** — Tailwind v4 has no `--shadow-*` convention for arbitrary shadow values. Consumed via `var(--bb-shadow-*)` directly in component CSS.

## Verification Results

- BB @theme header present ✓
- 2 actual `@theme inline {` declarations exist (shadcn at L7 + BB at L55) ✓
- `--color-bb-*` count: **21** ✓
- All spot checks pass: color, spacing, radius, type scale, lh/fw companions ✓
- `shadow-bb` absent from @theme ✓
- `spacing-bb-7` absent ✓
- Shadcn `@theme inline` untouched (`--color-background: var(--background)` still present) ✓
- `bun run build` exits 0 ✓

## Final Phase 6 State

`src/app/globals.css` structure after all 3 plans:
1. shadcn `@theme inline` (unchanged)
2. **BB `@theme inline`** (Plan 03 — 49 Tailwind mappings)
3. shadcn `:root` (unchanged)
4. **BB `:root`** (Plans 01+02 — 54 tokens: 21 color + 9 spacing + 4 radius + 3 shadow + 2 font + 15 type)
5. shadcn `.dark` (unchanged)
6. **BB `.dark`** (Plan 01 — 21 color tokens, dark-mode values)
7. `@layer base` with TOKEN-04 body style (Plan 02 — font-size: 16px + line-height: 1.5)

## Files Changed

- `src/app/globals.css` — +75 lines (additive only — new @theme inline block)
