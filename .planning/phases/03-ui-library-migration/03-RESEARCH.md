# Phase 3: UI Library Migration - Research

**Researched:** 2026-01-28
**Domain:** React charting libraries migration (Tremor → shadcn/ui charts with Recharts), UI primitive layers (Radix UI → Base UI)
**Confidence:** HIGH

## Summary

This phase involves migrating from Tremor charts to shadcn/ui charts (both built on Recharts) and introducing Base UI as a secondary primitive layer alongside existing Radix UI components. The migration is straightforward because both Tremor and shadcn/ui use Recharts underneath, meaning data structures remain compatible.

**Key findings:**
- shadcn/ui charts are composition-based wrappers around Recharts, not abstractions - you use Recharts components directly
- Both Tremor and shadcn/ui use the same underlying library (Recharts), making data transformation minimal
- Base UI (v1.1.0, stable since Dec 2025) provides an alternative primitive layer with similar API to Radix UI
- The codebase has only one Tremor chart component (DonutChart in SpendingByCategoryChart.tsx) to migrate
- Color system unification required: remove getTremorColor(), use existing CATEGORY_COLORS throughout

**Primary recommendation:** Use shadcn/ui's ChartContainer with native Recharts PieChart component, set innerRadius to create donut effect, leverage existing CATEGORY_COLORS from utils/charts for consistent theming, and remove all Tremor dependencies in a single atomic migration.

## Standard Stack

The established libraries/tools for this migration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| **shadcn/ui chart** | Latest (2026) | Chart component wrapper | Official shadcn/ui charting solution, composition-based, non-locking |
| **Recharts** | ^2.15.1 (already installed) | Charting library | Industry standard React charting library, used by both Tremor and shadcn/ui |
| **@base-ui/react** | 1.1.0 | Headless UI primitives | Stable v1 released Dec 2025, alternative to Radix UI with similar API |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **@types/recharts** | ^1.8.29 (already installed) | TypeScript types | TypeScript projects using Recharts |
| **depcheck** | Latest | Dependency auditing | Finding unused dependencies after removal |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| shadcn/ui charts | Keep Tremor | Tremor recently acquired by Vercel (uncertain future), less composable |
| Base UI | Radix UI only | Base UI offers more complex components (Combobox, Autocomplete), actively maintained |
| Manual Recharts | shadcn/ui wrapper | shadcn/ui provides theming, CSS variables, dark mode out of box |

**Installation:**
```bash
# Add shadcn/ui chart component
bun x shadcn@latest add chart

# Add Base UI primitives
bun add @base-ui/react

# Remove Tremor (after migration complete)
bun remove @tremor/react
```

## Architecture Patterns

### Recommended Chart Structure

shadcn/ui charts follow a **composition pattern** where you use Recharts components directly:

```
ChartContainer (shadcn/ui wrapper)
├── config: ChartConfig (color/label mapping)
├── className: min-h-[VALUE] (required for responsiveness)
└── children: Recharts components
    ├── PieChart (from recharts)
    │   ├── Pie (with innerRadius for donut)
    │   │   └── Cell[] (for per-slice colors)
    │   └── Tooltip (optional: ChartTooltipContent)
    └── Legend (optional: ChartLegendContent)
```

### Pattern 1: shadcn/ui Chart with ChartConfig
**What:** Define colors and labels in a config object, reference via CSS variables
**When to use:** All shadcn/ui charts for consistent theming and dark mode support

**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/chart

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"

const chartConfig = {
  Food: {
    label: "Food",
    color: "var(--color-food)", // or "#ef4444" directly
  },
  Rent: {
    label: "Rent",
    color: "var(--color-rent)",
  },
} satisfies ChartConfig

function MyChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={100}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartConfig[entry.name]?.color || "#6b7280"} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}
```

### Pattern 2: Donut Chart with Recharts
**What:** Use `innerRadius` prop on Pie component to create hollow center
**When to use:** Creating donut/ring charts instead of full pie charts

**Example:**
```typescript
// Source: https://www.geeksforgeeks.org/create-a-donut-chart-using-recharts-in-reactjs/

<Pie
  data={chartData}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  innerRadius={60}    // Creates the donut hole (0 = full pie)
  outerRadius={100}   // Sets overall size
  fill="#8884d8"
>
  {chartData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
  ))}
</Pie>
```

### Pattern 3: Base UI Component Selection
**What:** Choose between Radix UI (existing) and Base UI (new) based on component needs
**When to use:**
- **Use Radix UI** for existing components, simple primitives already in use
- **Use Base UI** for new complex components (Combobox, Autocomplete), nested dialogs, hover menus

**Coexistence strategy:**
- Both libraries can coexist in the same project
- Document in CLAUDE.md: "Use Radix UI for existing components, Base UI for new complex components"
- No need to migrate existing Radix components unless specific Base UI features needed

### Anti-Patterns to Avoid
- **Don't wrap Recharts in custom abstractions:** shadcn/ui uses direct Recharts components to avoid lock-in and ensure upgrade paths work
- **Don't use Tremor color names with shadcn/ui:** Tremor uses color names like "red", "blue" - shadcn/ui expects hex/CSS variables
- **Don't forget min-h on ChartContainer:** Charts won't be responsive without explicit height constraint
- **Don't use CSS variable format from Tailwind v3:** Tailwind v4 uses `var(--chart-1)` not `hsl(var(--chart-1))`

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart theming with dark mode | Custom CSS per chart | shadcn/ui ChartConfig with CSS variables | Automatic light/dark mode switching, consistent with existing shadcn/ui components |
| Chart tooltips | Custom hover components | ChartTooltipContent from shadcn/ui | Accessible, styled consistently, handles edge cases |
| Chart legends | Custom legend rendering | ChartLegendContent from shadcn/ui | Accessible, handles overflow, consistent styling |
| Color palette for categories | Inline color arrays | CATEGORY_COLORS from utils/charts | Already defined, consistent across app, accessible colors |
| Finding unused dependencies | Manual package.json inspection | depcheck or npm-check | Catches transitive dependencies, shows actual usage |

**Key insight:** shadcn/ui charts are **not** a charting library - they're styled wrappers around Recharts. The value is in theming integration, not chart logic. Use Recharts APIs directly for chart functionality.

## Common Pitfalls

### Pitfall 1: React 19/Next.js 15 Compatibility Issues
**What goes wrong:** Recharts v2 has compatibility issues with React 19 (default in Next.js 15), causing charts not to render or throwing errors
**Why it happens:** React 19 is in canary and breaks packages like Recharts that shadcn/ui relies on
**How to avoid:**
- Use Recharts v2.15.1 (currently installed - check if compatible)
- shadcn/ui is working on Recharts v3 upgrade (watch for updates)
- Test chart rendering after installation
**Warning signs:** Charts render as blank, console errors about React version mismatch

### Pitfall 2: TypeScript ChartConfig Errors in Non-TS Projects
**What goes wrong:** `satisfies ChartConfig` syntax causes IDE errors if project isn't fully TypeScript
**Why it happens:** TypeScript-specific syntax in JavaScript files
**How to avoid:** This project uses TypeScript, so not an issue - keep `satisfies ChartConfig`
**Warning signs:** Red squiggles in editor on chartConfig declaration

### Pitfall 3: Missing min-h on ChartContainer
**What goes wrong:** Chart doesn't render or has zero height
**Why it happens:** ChartContainer requires explicit height for ResponsiveContainer to calculate size
**How to avoid:** Always add `className="min-h-[200px]"` or similar to ChartContainer
**Warning signs:** Empty space where chart should be, no errors in console

### Pitfall 4: Forgetting to Remove Tremor Utilities from globals.css
**What goes wrong:** Build size stays large, unused CSS utilities generated
**Why it happens:** `@source` directive in globals.css (lines 5-53) forces Tailwind to scan Tremor files
**How to avoid:**
1. Grep for usage of Tremor fill-* utilities before removing
2. Remove `@source "../../node_modules/@tremor/react/dist/**/*.js"` line
3. Remove `@utility fill-*` definitions (lines 14-52)
**Warning signs:** Build process still scans node_modules/@tremor, bundle size doesn't decrease

### Pitfall 5: CSS Variable Format Mismatch (Tailwind v4)
**What goes wrong:** Colors don't apply or throw errors
**Why it happens:** Tailwind v4 changed CSS variable format - no longer needs `hsl()` wrapper
**How to avoid:** Use `var(--chart-1)` directly, not `hsl(var(--chart-1))`
**Warning signs:** Colors appear unstyled or show literal "var(--chart-1)" as color

### Pitfall 6: Assuming Bun Has Native Prune Command
**What goes wrong:** Unused transitive dependencies remain after removing @tremor/react
**Why it happens:** Bun doesn't have native `bun prune` like npm/yarn/pnpm
**How to avoid:**
- Use `depcheck` to find unused dependencies
- Manually review bun.lockb changes after `bun remove`
- Or use Knip (supports Bun since v2.33.0)
**Warning signs:** node_modules size doesn't decrease after removal

## Code Examples

Verified patterns from official sources:

### Migrating Tremor DonutChart to shadcn/ui
```typescript
// BEFORE (Tremor):
import { DonutChart } from "@tremor/react";

<DonutChart
  data={chartData}
  category="value"
  index="name"
  colors={["red", "blue", "green"]} // Tremor color names
  valueFormatter={formatCurrency}
  showAnimation={true}
  animationDuration={300}
  className="h-64"
/>

// AFTER (shadcn/ui + Recharts):
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import { CATEGORY_COLORS } from "@/utils/charts"

const chartConfig = {
  ...Object.keys(CATEGORY_COLORS).reduce((acc, key) => ({
    ...acc,
    [key]: { label: key, color: CATEGORY_COLORS[key] }
  }), {})
} satisfies ChartConfig

<ChartContainer config={chartConfig} className="min-h-[256px] w-full">
  <PieChart>
    <ChartTooltip content={<ChartTooltipContent />} />
    <Pie
      data={chartData}
      dataKey="value"
      nameKey="name"
      innerRadius={60}
      outerRadius={100}
      cx="50%"
      cy="50%"
    >
      {chartData.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || CATEGORY_COLORS.Other}
        />
      ))}
    </Pie>
  </PieChart>
</ChartContainer>
```

### Installing Base UI
```typescript
// Source: https://base-ui.com/ and https://www.npmjs.com/package/@base-ui/react

// Installation
// bun add @base-ui/react

// Basic usage (similar to Radix UI)
import { Dialog } from '@base-ui/react'

function MyDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>Open</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Title</Dialog.Title>
          <Dialog.Description>Description</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
```

### Generating ChartConfig from CATEGORY_COLORS
```typescript
// Source: Project codebase (src/utils/charts/index.ts)

import { CATEGORY_COLORS } from "@/utils/charts"
import type { ChartConfig } from "@/components/ui/chart"

// Generate ChartConfig from existing color constants
const chartConfig = Object.entries(CATEGORY_COLORS).reduce((acc, [key, color]) => ({
  ...acc,
  [key]: {
    label: key,
    color: color, // Already hex format, works directly
  }
}), {}) satisfies ChartConfig
```

### Finding Unused Dependencies
```bash
# Source: https://www.npmjs.com/package/depcheck

# Install depcheck globally
bun add -g depcheck

# Run analysis
depcheck

# Or use Knip (supports Bun)
bun add -D knip
bunx knip
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tremor v4 beta charts | shadcn/ui charts (Recharts direct) | shadcn/ui charts released mid-2024 | Direct Recharts access, official upgrade paths, no lock-in |
| Tremor color names ("red", "blue") | CSS variables or hex colors | Tailwind v4 / shadcn/ui adoption | Better theming, dark mode support, design system integration |
| `hsl(var(--chart-1))` format | `var(--chart-1)` direct | Tailwind v4 release | Simpler syntax, built-in color support |
| Radix UI only | Radix UI + Base UI options | Base UI v1.0 stable (Dec 2025) | More component options, active maintenance, choice for complex components |
| @base-ui-components/react | @base-ui/react | Package rename in 2025 | Use new package name for v1+ |

**Deprecated/outdated:**
- **Tremor as primary chart library:** Now acquired by Vercel with uncertain future, shadcn/ui recommended
- **getTremorColor() function:** Tremor-specific color mapping no longer needed with hex colors in CATEGORY_COLORS
- **@source directive for Tremor:** Tailwind v4 optimization - should be removed after migration
- **Recharts v2 with React 19:** Compatibility issues, v3 upgrade in progress

## Open Questions

Things that couldn't be fully resolved:

1. **Recharts v3 Timing**
   - What we know: shadcn/ui is working on Recharts v3 support, testing code available
   - What's unclear: Exact release timeline, whether current React 19 issues fully resolved
   - Recommendation: Proceed with Recharts v2.15.1 (already installed), monitor for v3 release, plan upgrade if issues arise

2. **Transitive Dependency Cleanup**
   - What we know: Bun doesn't have native `bun prune` command
   - What's unclear: Exactly which transitive dependencies Tremor brought in that are now unused
   - Recommendation: Run `depcheck` or `knip` after removing @tremor/react, review and remove unused deps manually

3. **Base UI Component Feature Parity**
   - What we know: Base UI offers more complex components than Radix, similar API
   - What's unclear: Exact differences for components both libraries offer, migration path if needed
   - Recommendation: Use Base UI only for new components not yet implemented, keep existing Radix components, document decision in CLAUDE.md

4. **globals.css Tremor Utilities Usage**
   - What we know: Lines 5-53 contain Tremor-specific utilities and @source directive
   - What's unclear: Whether any other components in codebase reference these fill-* utilities
   - Recommendation: Grep entire codebase for "fill-red-500", "fill-blue-500" etc. before removing, Phase 2 already identified only DonutChart uses Tremor

## Sources

### Primary (HIGH confidence)
- [Chart - shadcn/ui](https://ui.shadcn.com/docs/components/chart) - Official chart component documentation
- [Pie Charts - shadcn/ui](https://ui.shadcn.com/charts/pie) - Official pie/donut chart examples
- [Base UI](https://base-ui.com/) - Official Base UI documentation
- [Recharts PieChart Examples](https://www.geeksforgeeks.org/create-a-donut-chart-using-recharts-in-reactjs/) - Recharts donut chart tutorial
- [Best practice to use theme chart colors in ChartConfig](https://github.com/shadcn-ui/ui/discussions/6014) - Official guidance on CSS variables
- [@base-ui/react npm](https://www.npmjs.com/package/@base-ui/react) - Base UI package information (v1.1.0)

### Secondary (MEDIUM confidence)
- [shadcn/ui charts common issues (GitHub)](https://github.com/shadcn-ui/ui/issues) - React 19 compatibility issues
- [Support Recharts v3](https://github.com/shadcn-ui/ui/issues/7669) - Recharts v3 upgrade tracking
- [Recharts TypeScript issues](https://github.com/recharts/recharts/issues) - Active TypeScript compatibility work
- [depcheck npm](https://www.npmjs.com/package/depcheck) - Dependency analysis tool
- [Knip unused dependencies](https://knip.dev/typescript/unused-dependencies) - Bun-compatible dependency checker
- [bun prune issue](https://github.com/oven-sh/bun/issues/3605) - Native prune command request

### Tertiary (LOW confidence)
- [Starting a React Project: shadcn/ui, Radix, and Base UI Explained](https://certificates.dev/blog/starting-a-react-project-shadcnui-radix-and-base-ui-explained) - Community comparison
- [Base UI React npm package version stable 2026](https://www.npmjs.com/package/@base-ui/react) - Version confirmation (WebSearch verified with npm)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - shadcn/ui and Base UI officially documented, Recharts industry standard
- Architecture: HIGH - Verified from official shadcn/ui docs, confirmed composition pattern
- Pitfalls: HIGH - Cross-referenced multiple sources, confirmed React 19 issues, Tailwind v4 changes
- Migration approach: HIGH - Both libraries use Recharts, data structures compatible, only one component to migrate

**Research date:** 2026-01-28
**Valid until:** 2026-02-28 (30 days) - shadcn/ui and Base UI are stable, but Recharts v3 release may change recommendations
