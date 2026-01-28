# UI Library Strategy

**Created:** 2026-01-28
**Phase:** 02-ui-library-strategy
**Status:** LOCKED - Ready for Phase 3 execution

---

## Current State

**Component inventory:** See [UI_COMPONENT_INVENTORY.md](./UI_COMPONENT_INVENTORY.md)

| Category | Count | Status |
|----------|-------|--------|
| shadcn/ui components | 20 | OK - in use |
| BetterBudgeter custom | 9 | 1 needs migration (SpendingByCategoryChart) |
| Legacy OopsBudgeter | 29 | FROZEN |
| Tremor components | 1 | TO REMOVE |

---

## Library Architecture

| Library | Role | Scope | Status |
|---------|------|-------|--------|
| **shadcn/ui** | Primary UI framework | All new BetterBudgeter components | ACTIVE |
| **Base UI** (@base-ui/react) | Headless primitives | When shadcn/ui doesn't cover a need | AVAILABLE |
| **Radix UI** (@radix-ui/*) | Legacy primitives | Legacy OopsBudgeter only | FROZEN |
| **Recharts** (via shadcn/ui charts) | Chart rendering | All new charts | ACTIVE |
| **Sonner** | Toast notifications | Already integrated | ACTIVE |
| **Tremor** (@tremor/react) | Charts (deprecated) | None | **REMOVE** |

### Why Remove Tremor

- **Unmaintained:** No npm publishes in over a year (last v3.18.7 Jan 2025)
- **Beta-only React 19 support:** v4.0.0-beta required for current stack
- **Minimal footprint:** Only 1 component in use (DonutChart)
- **Better alternative:** shadcn/ui charts provide same functionality with active maintenance

---

## Boundary Rules

### Rule 1: shadcn/ui First

**All new BetterBudgeter components must use shadcn/ui.**

```typescript
// CORRECT
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
```

### Rule 2: No Direct Radix Imports in BetterBudgeter

**BetterBudgeter components must NEVER import from @radix-ui directly.**

```typescript
// FORBIDDEN in BetterBudgeter components
import * as Dialog from "@radix-ui/react-dialog";

// CORRECT - use shadcn/ui wrapper
import { Dialog } from "@/components/ui/dialog";
```

### Rule 3: Legacy Stays Frozen

**Legacy OopsBudgeter pages stay on their current libraries. No shadcn/ui adoption in legacy.**

- Legacy can continue using shadcn/ui wrappers (already in use)
- Legacy can continue using Recharts directly
- Do NOT refactor legacy components to "modernize" them

### Rule 4: Charts Use shadcn/ui

**All new charts must use shadcn/ui charts (Recharts wrapper).**

```typescript
// CORRECT for new charts
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

// FORBIDDEN in new code
import { DonutChart } from "@tremor/react";
```

### Rule 5: Base UI for Gaps Only

**Use Base UI only when shadcn/ui doesn't provide the component.**

Current shadcn/ui gaps: None identified. Evaluate as needs arise.

---

## Tremor Removal Scope

### Findings from 02-01 Audit

- **1 component:** DonutChart in `src/components/dashboard/SpendingByCategoryChart.tsx`
- **Tailwind config:** globals.css lines 5-53 contain Tremor-specific utilities

### Files to Modify

| File | Action |
|------|--------|
| `src/components/dashboard/SpendingByCategoryChart.tsx` | Replace DonutChart with shadcn/ui PieChart |
| `src/app/globals.css` | Remove lines 5-53 (Tremor utilities) |
| `package.json` | Remove @tremor/react dependency |
| `bun.lockb` | Regenerate after dependency removal |

### Verification

- `bun run build` passes
- `bun run typecheck` passes (if script exists)
- DonutChart replacement renders data correctly (visual match not required)

---

## Migration Path (Phase 3)

### Phase 3 Tasks

1. **Replace SpendingByCategoryChart**
   - Remove Tremor DonutChart import
   - Implement using shadcn/ui ChartContainer + Recharts PieChart
   - Data format: `{ name: string, value: number }[]` (same structure)
   - Visual appearance can change (will be redesigned later)

2. **Remove Tremor dependency**
   - `bun remove @tremor/react`
   - Verify no other imports exist

3. **Clean Tailwind config**
   - Remove globals.css lines 5-53
   - These include:
     - `@source "../node_modules/@tremor/react/dist/**/*.mjs"`
     - `@utility fill-*` and `@utility stroke-*` definitions
     - Tremor color mappings

4. **Verify build**
   - `bun run build` must pass
   - App must start (`bun dev`)

---

## CLAUDE.md Updates Required

After Phase 3 completion, add these rules to CLAUDE.md:

```markdown
### UI Library Boundaries

- **shadcn/ui** is the primary UI framework for BetterBudgeter
- BetterBudgeter components must NEVER import from @radix-ui directly
- Legacy OopsBudgeter components stay frozen on their current libraries
- All new charts use shadcn/ui charts (Recharts wrapper)
- Base UI (@base-ui/react) is available for gaps shadcn/ui doesn't cover
```

---

## Decision Log

| Decision | Date | Rationale |
|----------|------|-----------|
| Remove Tremor entirely | 2026-01-28 | Unmaintained, beta-only, minimal usage |
| shadcn/ui as primary framework | 2026-01-28 | Copy-paste model, actively maintained, Tailwind native |
| Base UI for headless primitives | 2026-01-28 | Modern successor to Radix, v1.0 stable |
| Radix UI frozen to legacy | 2026-01-28 | Maintenance risk (WorkOS acquisition), but works for legacy |
| Charts via shadcn/ui | 2026-01-28 | Consistent styling, Recharts under the hood |

---

*Document created: 2026-01-28*
*Phase: 02-ui-library-strategy*
