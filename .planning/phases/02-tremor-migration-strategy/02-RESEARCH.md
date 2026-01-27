# Phase 2: Tremor Migration Strategy - Research

**Researched:** 2026-01-27
**Domain:** React chart library version management and migration
**Confidence:** HIGH

## Summary

This research investigates the Tremor library ecosystem to plan a safe migration strategy. **Critical finding: The project is already running Tremor v4.0.0-beta-tremor-v4.4**, having migrated from v3.18.7 in earlier commits. The target "v1.0.0 stable" mentioned in phase context appears to reference the Tremor Raw (copy-paste) component versioning system, not the @tremor/react npm package.

Tremor exists in two distinct forms:
1. **@tremor/react (npm package)**: v3.18.7 stable, v4.0.0-beta for React 19 + Tailwind v4
2. **Tremor Raw (tremor.so)**: Copy-paste components, all released as individual v1.0.0 components (April 2025)

The project uses the npm package approach and is currently on the v4 beta track due to React 19 and Tailwind v4 requirements. No stable v1.0.0 @tremor/react package exists—the latest stable npm package is v3.18.7 (incompatible with current stack).

**Primary recommendation:** Document the CURRENT state (v4 beta) and establish a watching strategy for when v4 reaches stable release. The migration has already occurred; this phase should audit what was done and create a stability monitoring plan.

## Standard Stack

### Current Installation (Already Migrated)

| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| @tremor/react | 4.0.0-beta-tremor-v4.4 | Chart visualization components | **INSTALLED** (beta) |
| recharts | ^2.15.1 | Underlying chart rendering (Tremor dependency) | Installed |
| react | ^19.0.0 | UI framework | Required for v4 beta |
| tailwindcss | ^4.0.11 | Styling framework | Required for v4 beta |

### Tremor Ecosystem Versions

| Version Track | Package Version | React | Tailwind | Status |
|---------------|----------------|-------|----------|--------|
| **v3 Stable** | 3.18.7 | ^18.2.0 | ^3.4+ | INCOMPATIBLE with current stack |
| **v4 Beta** | 4.0.0-beta-tremor-v4.x | ^19.0.0 | v4+ (via tailwind-variants) | **CURRENT** |
| **v4 Stable** | Not yet released | TBD | TBD | Target when available |
| **Tremor Raw** | Individual component v1.0.0 | ^18.2.0+ | ^4.0+ | Different distribution model |

### Tremor Distribution Models

| Model | Source | Versioning | Installation | Current Use |
|-------|--------|------------|--------------|-------------|
| **NPM Package** | npm.tremor.so | Package-level (3.18.7, 4.0.0-beta) | `bun install @tremor/react` | **ACTIVE** |
| **Copy-Paste (Raw)** | tremor.so | Component-level (all v1.0.0) | Copy source from website | Not used |

**Installation (current):**
```bash
bun install @tremor/react@4.0.0-beta-tremor-v4.4
```

## Architecture Patterns

### Current Usage Pattern (Already Implemented)

```
src/
├── components/
│   └── dashboard/
│       └── SpendingByCategoryChart.tsx    # DonutChart consumer
└── utils/
    └── charts/
        └── index.ts                        # Color mapping helpers
```

**Component count:** 1 Tremor component used (DonutChart only)

### Pattern 1: Tremor Chart Component Usage

**What:** Importing and configuring Tremor chart components with typed props

**When to use:** Visualizing aggregated financial data in dashboard

**Current implementation:**
```typescript
// Source: src/components/dashboard/SpendingByCategoryChart.tsx (project file)
import { DonutChart } from "@tremor/react";

<DonutChart
  data={chartData}           // { name: string, value: number }[]
  category="value"           // quantitative data key
  index="name"               // categorical data key
  colors={colors}            // Tremor color names: ["red", "blue", "orange"]
  valueFormatter={formatCurrency}
  showAnimation={true}
  animationDuration={300}
  className="h-64"
  showTooltip={true}
/>
```

### Pattern 2: Tremor Color Name Mapping

**What:** Converting category identifiers to Tremor's named color palette

**When to use:** Ensuring consistent colors across Tremor components and custom UI

**Current implementation:**
```typescript
// Source: src/components/dashboard/SpendingByCategoryChart.tsx:157-175
function getTremorColor(category: string): string {
  const colorMap: Record<string, string> = {
    Food: "red",           // Tremor named colors
    Rent: "orange",
    Utilities: "amber",
    Transport: "emerald",
    Entertainment: "blue",
    Shopping: "violet",
    Other: "gray",
  };
  return colorMap[category] ?? "gray";
}
```

**Tremor supported color names (v4 beta):**
`blue, cyan, sky, teal, emerald, green, lime, yellow, amber, orange, red, rose, pink, fuchsia, purple, violet, indigo, gray, slate, zinc, neutral, stone`

### Pattern 3: Parallel Color Systems

**What:** Maintaining HEX colors for non-Tremor components, Tremor names for Tremor components

**Current implementation:**
```typescript
// Source: src/utils/charts/index.ts:18-33
export const CATEGORY_COLORS = {
  Food: "#ef4444",        // HEX for custom components
  Rent: "#f97316",
  // ... (used for legend rendering, non-Tremor UI)
};

// Separate mapping for Tremor (in component file)
// getTremorColor() returns "red", "orange", etc.
```

**Why:** Tremor v4 beta with Tailwind v4 uses `tailwind-variants` internally; HEX values don't work reliably in `colors` prop.

### Anti-Patterns to Avoid

- **HEX colors in Tremor `colors` prop**: Causes Tailwind v4 class generation issues (see git commit `13e23ac`)
- **Mixing Tremor v3 with React 19**: Peer dependency mismatch causes runtime errors
- **Assuming npm package versions match Tremor Raw component versions**: Completely different versioning schemes

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Chart component library | Custom Recharts wrappers | Tremor's pre-built components | Handles responsive sizing, theming, tooltips, animations out-of-box |
| Color palette mapping | Manual Tailwind class strings | Tremor named colors | Tremor manages Tailwind v4 class generation internally via `tailwind-variants` |
| Chart data transformation | Complex mappers | Tremor's expected data format | `{ [index]: string, [category]: number }[]` is simple and well-documented |

**Key insight:** Tremor abstracts Recharts complexity and Tailwind v4 styling challenges. For this project's single chart use case, the beta is stable enough and saves significant implementation time.

## Common Pitfalls

### Pitfall 1: Confusing Tremor Distribution Models

**What goes wrong:** Developer assumes "v1.0.0" refers to npm package version and tries to install `@tremor/react@1.0.0`

**Why it happens:** Tremor has two products with different versioning:
- Tremor Raw (tremor.so): Individual components at v1.0.0 (April 2025)
- @tremor/react (npm.tremor.so): Package at v3.18.7 stable / v4.0.0-beta

**How to avoid:**
- Check which distribution model is in use (`package.json` shows npm package)
- Verify versions on npm.tremor.so, NOT tremor.so
- v1.0.0 doesn't exist as an npm package version

**Warning signs:** Installation fails with "version not found" error

### Pitfall 2: Beta Version Stability Assumptions

**What goes wrong:** Treating beta version as unstable/unusable for production

**Why it happens:** General software convention that "beta" = risky

**How to avoid:**
- For Tremor v4 specifically, the beta is the ONLY version compatible with React 19 + Tailwind v4
- The current stable (v3.18.7) is actually MORE broken for this stack
- Beta stability varies by component; DonutChart is confirmed working (verified in TREMOR_MIGRATION_ANALYSIS.md)

**Warning signs:** Attempting to downgrade to v3 causes peer dependency errors

### Pitfall 3: Color Format Incompatibility

**What goes wrong:** Using HEX color values in Tremor v4's `colors` prop causes charts to render with default colors or fail

**Why it happens:** Tremor v4 uses `tailwind-variants` library which expects Tailwind color names, not HEX

**How to avoid:**
- Always use Tremor's named color palette: `["red", "blue", "emerald"]`
- Maintain separate HEX palette for non-Tremor components
- Check git history: commits `d4f0139`, `13e23ac`, `b5cfbf8` document this exact issue and fix

**Warning signs:** Chart renders but all segments are same color, or console warnings about unrecognized color values

### Pitfall 4: Missing Migration Has Already Occurred

**What goes wrong:** Planning a migration that already happened, duplicating work

**Why it happens:** Outdated roadmap documents don't reflect recent implementation commits

**How to avoid:**
- Check `git log --grep="tremor"` before planning migration
- Verify `package.json` current version
- Read existing docs/TREMOR_MIGRATION_ANALYSIS.md if present

**Warning signs:** Phase deliverable asks to "plan migration to v1.0.0" but package.json shows v4.0.0-beta

## Code Examples

### DonutChart Implementation (Current)

```typescript
// Source: src/components/dashboard/SpendingByCategoryChart.tsx
"use client";

import { DonutChart } from "@tremor/react";
import { CATEGORY_COLORS } from "@/utils/charts";

interface CategoryData {
  category: string;
  amount: number;
  transactionCount: number;
}

export function SpendingByCategoryChart({ data }: { data: CategoryData[] }) {
  // Transform to Tremor's expected format
  const chartData = data.map((item) => ({
    name: item.category,     // index key
    value: item.amount,      // category key
  }));

  // Map categories to Tremor color names
  const colors = data.map((item) => getTremorColor(item.category));

  return (
    <DonutChart
      data={chartData}
      category="value"
      index="name"
      colors={colors}
      valueFormatter={(val) => `€${val.toFixed(2)}`}
      showAnimation={true}
      animationDuration={300}
      showTooltip={true}
      className="h-64"
    />
  );
}

function getTremorColor(category: string): string {
  const map: Record<string, string> = {
    Food: "red",
    Rent: "orange",
    Utilities: "amber",
    Transport: "emerald",
    Other: "gray",
  };
  return map[category] ?? "gray";
}
```

### TypeScript Type Definitions (v4 Beta)

```typescript
// Source: node_modules/@tremor/react/dist/index.d.ts
interface DonutChartProps {
  data: any[];                          // Required: chart data array
  category?: string;                    // Optional: data key (default: "value")
  index?: string;                       // Optional: label key (default: "name")
  colors?: (Color | string)[];          // Optional: Tremor color names
  variant?: "donut" | "pie";            // Optional: chart style
  valueFormatter?: ValueFormatter;      // Optional: format function
  label?: string;                       // Optional: center text
  showLabel?: boolean;                  // Optional: show center label
  showAnimation?: boolean;              // Optional: enable animation
  animationDuration?: number;           // Optional: animation timing (ms)
  showTooltip?: boolean;                // Optional: enable tooltips
  noDataText?: string;                  // Optional: empty state message
  className?: string;                   // Optional: Tailwind classes
  onValueChange?: (value: EventProps) => void;
  customTooltip?: React.ComponentType<CustomTooltipProps>;
}
```

## State of the Art

| Migration Aspect | Old Approach (v3.18.7) | Current Approach (v4 beta) | When Changed | Impact |
|------------------|------------------------|---------------------------|--------------|--------|
| React compatibility | React ^18.2.0 | React ^19.0.0 | v4.0.0-beta | BREAKING: Must upgrade React |
| Tailwind integration | Direct Tailwind classes (v3) | tailwind-variants library (v4) | v4.0.0-beta | Color prop format changed |
| Color specification | HEX or named colors | Named colors only (reliable) | v4.0.0-beta | Must map HEX → names |
| Installation source | npm.tremor.so package | npm package OR tremor.so copy-paste | April 2025 (Raw launch) | Two distribution models exist |

**Deprecated/outdated:**
- **@tremor/react@3.x for React 19 projects**: Peer dependency incompatible, runtime errors
- **HEX colors in v4 `colors` prop**: Works in v3, unreliable in v4 due to Tailwind v4 + tailwind-variants
- **"v1.0.0" as npm package target**: No such npm package version exists (component versioning only)

## Open Questions

### 1. When will Tremor v4 reach stable release?

**What we know:**
- v4.0.0-beta-tremor-v4.4 released December 2024
- Beta track is actively maintained (multiple beta releases)
- Tremor was acquired by Vercel (announced on tremor.so homepage)

**What's unclear:**
- Timeline for v4 stable release
- Whether API will change before stable
- Vercel's long-term plans post-acquisition

**Recommendation:** Monitor [Tremor GitHub releases](https://github.com/tremorlabs/tremor/releases) and [@tremorlabs Twitter](https://x.com/tremorlabs) for v4 stable announcement. Set a quarterly review (every 3 months) to check if v4 has stabilized.

### 2. Should the project switch to Tremor Raw (copy-paste model)?

**What we know:**
- Tremor Raw components are at v1.0.0 (individual component versions)
- Raw approach gives full source code control
- Raw components require Tailwind v4.0+
- Current npm package approach works with only 1 component used

**What's unclear:**
- Maintenance burden of copy-paste vs npm updates
- Whether Raw offers better stability than v4 beta
- Migration effort to switch distribution models

**Recommendation:** DEFER. Current npm package approach works. Switching to Raw is a roadmap-level decision (would affect dependency management strategy project-wide). Only consider if v4 beta becomes unstable or blocking.

### 3. What's the fallback if v4 beta breaks?

**What we know:**
- Project already has recharts ^2.15.1 as dependency (Tremor uses it internally)
- DonutChart could be replaced with recharts PieChart directly
- Only 1 Tremor component is used, making replacement feasible

**What's unclear:**
- Specific recharts API for equivalent functionality
- Effort required to match current visual design

**Recommendation:** Document a rollback plan:
1. If v4 beta fails during development: Implement custom recharts PieChart
2. Keep CATEGORY_COLORS (already in utils/) as source of truth
3. Budget 2-4 hours for recharts replacement if needed

## Sources

### Primary (HIGH confidence)
- **Installed package inspection**: `node_modules/@tremor/react/package.json` - v4.0.0-beta-tremor-v4.4 verified
- **TypeScript definitions**: `node_modules/@tremor/react/dist/index.d.ts` - DonutChartProps interface
- **Project codebase**: `src/components/dashboard/SpendingByCategoryChart.tsx` - actual usage
- **Git history**: Commits `6a9657c`, `13e23ac`, `d4f0139` - migration evidence
- **Existing analysis**: `docs/TREMOR_MIGRATION_ANALYSIS.md` - prior migration documentation

### Secondary (MEDIUM confidence)
- [Tremor NPM changelog](https://npm.tremor.so/changelog) - WebFetch verified, shows v3.18.0-3.18.4 releases
- [Tremor.so changelog](https://www.tremor.so/changelog) - WebFetch verified, shows component v1.0.0 releases (April 2025)
- [Tremor.so installation docs](https://www.tremor.so/docs/getting-started/installation) - Tremor Raw requirements
- [npm.tremor.so installation docs](https://npm.tremor.so/docs/getting-started/installation) - v3.18.0+ requirements
- [Tremor DonutChart API docs](https://www.tremor.so/docs/visualizations/donut-chart) - Raw component API
- [Tremor NPM DonutChart API docs](https://npm.tremor.so/docs/visualizations/donut-chart) - npm package API

### Tertiary (LOW confidence - WebSearch only)
- [@tremorlabs Twitter announcement](https://x.com/tremorlabs/status/1868722998590759361) - v4 beta announcement (React 19, Tailwind v4, CSS-first theming)
- NPM registry metadata via WebSearch - v3.18.7 latest stable, 4.0.0-beta versions exist
- Vercel acquisition announcement banner on tremor.so

## Metadata

**Confidence breakdown:**
- **Current state (v4 beta installed)**: HIGH - Verified via package.json, git history, and existing docs
- **API differences v3 vs v4**: MEDIUM - TypeScript definitions and docs reviewed, but missing official migration guide
- **Tremor ecosystem structure**: HIGH - Two distribution models confirmed via official sites
- **v1.0.0 target clarification**: HIGH - Verified "v1.0.0" refers to Raw components, not npm package version
- **Stability timeline**: LOW - No official roadmap found for v4 stable release

**Research date:** 2026-01-27
**Valid until:** 2026-04-27 (90 days) - Tremor is in active development (beta track), recommend quarterly review for v4 stable release

**Critical clarification for planner:**
The phase context mentions "v1.0.0 stable" as the target, but this appears to be based on a misunderstanding. There is no @tremor/react npm package v1.0.0. The project is already on v4.0.0-beta and should STAY there. Planning should focus on:
1. Auditing the completed migration
2. Documenting current usage
3. Establishing monitoring for v4 stable release
4. Creating rollback procedures

NOT planning a new migration to a non-existent v1.0.0 package.
