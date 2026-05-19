# Phase 6: Design Tokens — Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 1 (modified)
**Analogs found:** 1 / 1 (exact — the file being modified is its own pattern source)

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/app/globals.css` | config | transform | `src/app/globals.css` (existing blocks) | exact — same file, additive blocks |

---

## Pattern Assignments

### `src/app/globals.css` (config, transform)

**Analog:** `src/app/globals.css` — existing shadcn blocks (lines 7–126)

This is a pure additive CSS change. The existing file defines the exact two-step pattern
to replicate for BB tokens. All four new blocks mirror the shadcn structure.

---

### Pattern 1: `@theme inline` mapping block

**Source:** `src/app/globals.css` lines 7–46 (existing shadcn block)

```css
/* EXISTING shadcn block — DO NOT MODIFY */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
  --color-border: var(--border);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  /* ... rest of shadcn mappings ... */
}
```

**New BB block to add immediately after** (lines after 46):

```css
/* BetterBudgeter Tailwind Mappings
   Two-step pattern: token defined in :root → exposed here as Tailwind utility.
   Naming convention (D-02): --color-bb-{name} → bg-bb-{name}, text-bb-{name}
                              --spacing-bb-{n}  → p-bb-{n}, m-bb-{n}
                              --radius-bb-{name}→ rounded-bb-{name}
                              --text-bb-{name}  → text-bb-{name}
*/
@theme inline {
  /* Foundation colors (TOKEN-01) */
  --color-bb-bg: var(--bb-bg);
  --color-bb-surface: var(--bb-surface);
  --color-bb-surface-raised: var(--bb-surface-raised);
  --color-bb-text: var(--bb-text);
  --color-bb-text-secondary: var(--bb-text-secondary);
  --color-bb-border: var(--bb-border);

  /* Semantic financial colors (TOKEN-02) */
  --color-bb-positive: var(--bb-positive);
  --color-bb-positive-bg: var(--bb-positive-bg);
  --color-bb-caution: var(--bb-caution);
  --color-bb-caution-bg: var(--bb-caution-bg);
  --color-bb-negative: var(--bb-negative);
  --color-bb-negative-bg: var(--bb-negative-bg);
  --color-bb-info: var(--bb-info);
  --color-bb-info-bg: var(--bb-info-bg);

  /* Budget category colors (TOKEN-03) */
  --color-bb-cat-essentials: var(--bb-cat-essentials);
  --color-bb-cat-discretionary: var(--bb-cat-discretionary);
  --color-bb-cat-savings: var(--bb-cat-savings);
  --color-bb-cat-food: var(--bb-cat-food);
  --color-bb-cat-transport: var(--bb-cat-transport);
  --color-bb-cat-entertainment: var(--bb-cat-entertainment);
  --color-bb-cat-other: var(--bb-cat-other);

  /* Spacing scale (TOKEN-05) — 4px grid, named steps */
  --spacing-bb-1: var(--bb-space-1);
  --spacing-bb-2: var(--bb-space-2);
  --spacing-bb-3: var(--bb-space-3);
  --spacing-bb-4: var(--bb-space-4);
  --spacing-bb-5: var(--bb-space-5);
  --spacing-bb-6: var(--bb-space-6);
  --spacing-bb-8: var(--bb-space-8);
  --spacing-bb-10: var(--bb-space-10);
  --spacing-bb-12: var(--bb-space-12);

  /* Border radius (TOKEN-06) */
  --radius-bb-sm: var(--bb-radius-sm);
  --radius-bb-md: var(--bb-radius-md);
  --radius-bb-lg: var(--bb-radius-lg);
  --radius-bb-xl: var(--bb-radius-xl);

  /* Typography scale (TOKEN-07) — 4 sizes, 2 weights only */
  --text-bb-sm: var(--bb-text-sm);
  --text-bb-base: var(--bb-text-base);
  --text-bb-xl: var(--bb-text-xl);
  --text-bb-3xl: var(--bb-text-3xl);
}
```

---

### Pattern 2: `:root` token definition block

**Source:** `src/app/globals.css` lines 48–82 (existing shadcn `:root` block)

```css
/* EXISTING shadcn block — DO NOT MODIFY */
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.141 0.005 285.823);
  --border: oklch(0.92 0.004 286.32);
  --radius: 0.625rem;
  /* ... rest of shadcn variables ... */
}
```

**New BB block to add immediately after** (lines after 82):

```css
/* BetterBudgeter Design System Tokens — Light Mode
   Step 1 of the two-step pattern: define raw values here.
   Step 2: exposed as Tailwind utilities in @theme inline above.
   Source: docs/DESIGN_SYSTEM.md §2–4, REQUIREMENTS.md TOKEN-01 to TOKEN-07
*/
:root {
  /* Foundation colors (TOKEN-01) — 60/30/10 split
     60% dominant: page backgrounds
     30% secondary: raised surfaces, borders
     10% accent: semantic signals (--bb-info) */
  --bb-bg: oklch(0.985 0.002 280);
  --bb-surface: oklch(1 0 0);
  --bb-surface-raised: oklch(0.975 0.002 280);
  --bb-text: oklch(0.205 0.006 280);
  --bb-text-secondary: oklch(0.48 0.012 280);
  --bb-border: oklch(0.91 0.004 280);

  /* Semantic financial colors (TOKEN-02)
     --bb-negative is soft coral, NEVER bright red — avoids ADHD anxiety/shame response */
  --bb-positive: oklch(0.62 0.14 155);
  --bb-positive-bg: oklch(0.95 0.04 155);
  --bb-caution: oklch(0.72 0.14 75);
  --bb-caution-bg: oklch(0.95 0.04 75);
  --bb-negative: oklch(0.58 0.16 25);
  --bb-negative-bg: oklch(0.95 0.04 25);
  --bb-info: oklch(0.60 0.12 245);
  --bb-info-bg: oklch(0.95 0.03 245);

  /* Budget category colors (TOKEN-03) — for charts and indicators only
     Less saturated than Tailwind defaults. Same values in .dark (chart context). */
  --bb-cat-essentials: oklch(0.62 0.10 245);
  --bb-cat-discretionary: oklch(0.65 0.12 165);
  --bb-cat-savings: oklch(0.62 0.14 155);
  --bb-cat-food: oklch(0.68 0.10 55);
  --bb-cat-transport: oklch(0.62 0.10 200);
  --bb-cat-entertainment: oklch(0.65 0.12 290);
  --bb-cat-other: oklch(0.58 0.02 280);

  /* Spacing scale (TOKEN-05) — 4px grid
     Steps 7, 9, 11 are intentionally omitted (not in spec). */
  --bb-space-1: 4px;
  --bb-space-2: 8px;
  --bb-space-3: 12px;
  --bb-space-4: 16px;
  --bb-space-5: 20px;
  --bb-space-6: 24px;
  --bb-space-8: 32px;
  --bb-space-10: 40px;
  --bb-space-12: 48px;

  /* Border radius (TOKEN-06) */
  --bb-radius-sm: 6px;
  --bb-radius-md: 10px;
  --bb-radius-lg: 14px;
  --bb-radius-xl: 20px;

  /* Shadow tokens (TOKEN-06) — intentionally minimal
     Prefer border + background for elevation over heavy shadows */
  --bb-shadow-sm: 0 1px 2px oklch(0 0 0 / 0.04);
  --bb-shadow-md: 0 2px 8px oklch(0 0 0 / 0.06);
  --bb-shadow-lg: 0 4px 16px oklch(0 0 0 / 0.08);

  /* Font stacks (TOKEN-07)
     --bb-font-sans: Lucida-led prototype — open letterforms aid ADHD legibility.
     Verdana fallback: designed for screen legibility, best b/d differentiation.
     System tail: covers all remaining platforms.
     NOTE: This is a prototype. Finalize in Phase 11. */
  --bb-font-sans: "Lucida Sans Unicode", "Lucida Grande", "Lucida Sans", Verdana,
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --bb-font-mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace;

  /* Type scale (TOKEN-07) — 4 sizes, 2 weights only (minimalism for ADHD clarity) */
  --bb-text-sm: 14px;
  --bb-text-base: 16px;
  --bb-text-xl: 22px;
  --bb-text-3xl: 36px;
}
```

---

### Pattern 3: `.dark` token override block

**Source:** `src/app/globals.css` lines 84–117 (existing shadcn `.dark` block)

```css
/* EXISTING shadcn block — DO NOT MODIFY */
.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  /* ... rest of shadcn dark overrides ... */
}
```

**New BB block to add immediately after** (lines after 117):

```css
/* BetterBudgeter Design System Tokens — Dark Mode
   Dark mode activated by next-themes via .dark class on <html>.
   Dark variant registered via @custom-variant dark (&:is(.dark *)) at line 5.
   Category colors are the same in light and dark — chart contexts manage contrast. */
.dark {
  /* Foundation colors — dark mode */
  --bb-bg: oklch(0.155 0.005 280);
  --bb-surface: oklch(0.195 0.005 280);
  --bb-surface-raised: oklch(0.235 0.006 280);
  --bb-text: oklch(0.965 0.002 280);
  --bb-text-secondary: oklch(0.66 0.012 280);
  --bb-border: oklch(0.28 0.006 280);

  /* Semantic financial colors — dark mode */
  --bb-positive: oklch(0.72 0.14 155);
  --bb-positive-bg: oklch(0.22 0.04 155);
  --bb-caution: oklch(0.78 0.14 75);
  --bb-caution-bg: oklch(0.22 0.04 75);
  --bb-negative: oklch(0.68 0.18 25);
  --bb-negative-bg: oklch(0.22 0.04 25);
  --bb-info: oklch(0.70 0.12 245);
  --bb-info-bg: oklch(0.22 0.03 245);

  /* Category colors — same as light mode (chart context provides own contrast) */
  --bb-cat-essentials: oklch(0.62 0.10 245);
  --bb-cat-discretionary: oklch(0.65 0.12 165);
  --bb-cat-savings: oklch(0.62 0.14 155);
  --bb-cat-food: oklch(0.68 0.10 55);
  --bb-cat-transport: oklch(0.62 0.10 200);
  --bb-cat-entertainment: oklch(0.65 0.12 290);
  --bb-cat-other: oklch(0.58 0.02 280);
}
```

---

### Pattern 4: `@layer base body {}` extension

**Source:** `src/app/globals.css` lines 119–126 (existing `@layer base` block)

```css
/* EXISTING shadcn block — DO NOT MODIFY the * rule or existing body rule */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Modified form** (extend the existing `body {}` rule in-place per D-07):

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    /* TOKEN-04: Minimum 16px body text + 1.5x line-height for ADHD readability.
       16px is browser default — no visual regression expected.
       1.5 line-height is a modest global improvement to reading comfort. */
    font-size: 16px;
    line-height: 1.5;
  }
}
```

---

## Shared Patterns

### Two-Step Token Registration (applies to all BB token categories)

**Source:** Existing shadcn pattern in `src/app/globals.css` (lines 7–117)

```css
/* Step 1 — define raw value in :root (and .dark override) */
:root {
  --bb-example: oklch(0.985 0.002 280);
}
.dark {
  --bb-example: oklch(0.155 0.005 280);
}

/* Step 2 — map to Tailwind utility in @theme inline */
@theme inline {
  --color-bb-example: var(--bb-example);
  /* enables: bg-bb-example, text-bb-example, border-bb-example */
}
```

This two-step registration is how shadcn/ui exposes all of its own design tokens. The BB
tokens follow the exact same convention so Tailwind v4 picks them up correctly.

### Dark Mode Mechanism

**Source:** `src/app/globals.css` line 5

```css
@custom-variant dark (&:is(.dark *));
```

The `.dark` class is applied to `<html>` by next-themes (ThemeProvider already in place
at `src/components/providers/ThemeProvider.tsx` — no changes needed in Phase 6). All BB
dark tokens go in `.dark {}` and are activated automatically.

### oklch Color Syntax

**Source:** `src/app/globals.css` lines 49–116 (shadcn values throughout)

All colors use `oklch(lightness chroma hue)` — the same format shadcn uses. BB tokens use
the same hue anchor (280 = cool-neutral violet-gray) for all foundation colors to maintain
palette coherence. Semantic and category colors use different hues by design.

---

## No Analog Found

No files in Phase 6 lack a codebase analog. The single file being modified (`src/app/globals.css`)
already contains the exact two-step pattern that all new BB blocks must replicate. No external
pattern references are needed.

---

## Exact File Structure After Phase 6

Lines in `src/app/globals.css` after this phase (with insertion points marked):

```
L1–4   @import "tailwindcss" + @plugin directives         [unchanged]
L5     @custom-variant dark (&:is(.dark *))                [unchanged]
L7–46  @theme inline { /* shadcn */ }                      [unchanged]
       @theme inline { /* BetterBudgeter Tailwind Mappings */ }  [NEW — insert after L46]
L48–82 :root { /* shadcn */ }                              [unchanged]
       :root { /* BetterBudgeter Design System Tokens */ } [NEW — insert after L82]
L84–117 .dark { /* shadcn */ }                             [unchanged]
        .dark { /* BetterBudgeter dark tokens */ }         [NEW — insert after L117]
L119–126 @layer base { * + body }                          [EXTEND body rule — D-07]
L128–169 scrollbar + @layer utilities                      [unchanged]
```

---

## Metadata

**Analog search scope:** `src/app/globals.css` (only file in scope — pure CSS phase)
**Files scanned:** 1
**Pattern extraction date:** 2026-05-19
