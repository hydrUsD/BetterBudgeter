# Phase 02: UI Library Strategy - Research

**Researched:** 2026-01-28
**Domain:** UI component libraries (Tremor, shadcn/ui, Base UI, Radix UI, Recharts)
**Confidence:** HIGH

## Summary

This phase is a **documentation-only phase** that defines the new UI library architecture for BetterBudgeter. The goal is to produce a complete component inventory mapping every UI component to its library, establish library boundary rules, and assess migration risks.

**Current state:**
- Project uses 4 UI library ecosystems: Tremor (1 component), Radix UI (11 shadcn/ui components using Radix primitives), shadcn/ui (21 components installed), and Recharts (via Tremor + legacy Analytics)
- Tremor v4.0.0-beta-tremor-v4.4 is installed for React 19 + Tailwind v4 compatibility
- shadcn/ui is already initialized (components.json exists, 21 components in src/components/ui/)
- Previous audit (02-01-PLAN.md) found only 1 Tremor component: DonutChart

**Locked decisions (from CONTEXT.md):**
- Tremor removed entirely (unmaintained, no commits in over a year)
- shadcn/ui = primary UI framework for BetterBudgeter
- Base UI = headless primitives for gaps shadcn/ui doesn't cover
- Radix UI = legacy OopsBudgeter only (strict separation)
- Charts = shadcn/ui charts (Recharts wrapper)

**Primary recommendation:** Create a full component inventory documenting all 21 shadcn/ui components, all Radix UI direct imports (legacy only), Tremor usage (1 component), and Recharts usage (legacy Analytics). Document strict boundary rules: BetterBudgeter components must NEVER import from @radix-ui directly, only via shadcn/ui wrappers.

## Standard Stack

### Core Libraries

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| shadcn/ui | Latest (via CLI) | Primary UI component system for BetterBudgeter | Copy-paste components, full control, Tailwind CSS styled, accessibility built-in |
| Base UI | 1.1.0 (@base-ui/react) | Headless primitives for custom components | From creators of Radix/Material UI, accessible, unstyled, for gaps shadcn doesn't cover |
| Radix UI | Various (legacy) | Legacy OopsBudgeter only | Already in project, battle-tested, must NOT be imported in new BB code |
| Recharts | 2.15.1 | Chart rendering engine | Used by shadcn/ui charts and legacy Analytics component |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.479.0 | Icon library | shadcn/ui's default icon library |
| class-variance-authority | 0.7.1 | Variant styling | Used by shadcn/ui for component variants |
| tailwind-merge | 3.0.2 | Tailwind class merging | Used by shadcn/ui's cn() utility |
| sonner | 2.0.1 | Toast notifications | Already integrated via shadcn/ui sonner component |

### Libraries to Remove

| Library | Current Version | Reason for Removal |
|---------|----------------|-------------------|
| @tremor/react | 4.0.0-beta-tremor-v4.4 | Unmaintained (last npm publish ~1 year ago), beta-only React 19 support, only 1 component in use |

**Installation (Base UI only - shadcn/ui uses CLI):**
```bash
bun add @base-ui/react
```

**shadcn/ui component installation:**
```bash
# Already initialized (components.json exists)
bunx shadcn@latest add [component-name]
```

## Architecture Patterns

### Current Project Structure

```
src/components/
├── ui/                    # shadcn/ui components (21 files)
│   ├── alert-dialog.tsx  # Uses @radix-ui/react-alert-dialog
│   ├── button.tsx        # Uses @radix-ui/react-slot
│   ├── chart.tsx         # Uses recharts
│   ├── dialog.tsx        # Uses @radix-ui/react-dialog
│   └── ...               # 17 more shadcn components
├── legacy/               # OopsBudgeter components (frozen)
│   ├── common/
│   ├── transactions/
│   └── ...               # Uses Radix UI directly, Recharts
├── dashboard/            # BetterBudgeter components
│   └── SpendingByCategoryChart.tsx  # Uses Tremor DonutChart
├── finance/              # BetterBudgeter components
├── settings/             # BetterBudgeter components
└── auth/                 # BetterBudgeter components
```

### Pattern 1: shadcn/ui Component Usage (BetterBudgeter)

**What:** Use shadcn/ui components for all new BetterBudgeter UI needs.

**When to use:** Default choice for buttons, forms, dialogs, cards, etc.

**Example:**
```typescript
// ✓ CORRECT: BetterBudgeter component using shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function BudgetSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Button>Save</Button>
      </CardContent>
    </Card>
  );
}
```

### Pattern 2: Radix UI Direct Usage (Legacy Only)

**What:** Direct @radix-ui imports allowed ONLY in legacy OopsBudgeter components.

**When to use:** Only when editing existing legacy components. NEVER in new code.

**Example:**
```typescript
// ✓ CORRECT: Legacy component can use Radix directly
// File: src/components/legacy/transactions/OldTransactionDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";

// ✗ INCORRECT: New BetterBudgeter component must NOT import Radix directly
// File: src/components/dashboard/NewFeature.tsx
import * as Dialog from "@radix-ui/react-dialog"; // FORBIDDEN
```

### Pattern 3: shadcn/ui Charts (Recharts Wrapper)

**What:** Use shadcn/ui chart components for all new charts.

**When to use:** Replacing Tremor DonutChart, adding new charts to BetterBudgeter.

**Example:**
```typescript
// Source: https://ui.shadcn.com/docs/components/chart
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

const chartConfig = {
  food: { label: "Food", color: "hsl(var(--chart-1))" },
  rent: { label: "Rent", color: "hsl(var(--chart-2))" },
};

export function SpendingChart({ data }: { data: ChartData[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64">
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}
          outerRadius={100}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
}
```

### Pattern 4: Base UI for Custom Primitives

**What:** Use Base UI when shadcn/ui doesn't provide the needed component.

**When to use:** Rare cases where you need a headless primitive not covered by shadcn/ui.

**Example:**
```typescript
// Hypothetical: shadcn/ui doesn't have a Tree component
import { Tree, TreeItem } from "@base-ui/react";

export function FileTree() {
  return (
    <Tree>
      <TreeItem>Folder 1</TreeItem>
      <TreeItem>Folder 2</TreeItem>
    </Tree>
  );
}
```

### Anti-Patterns to Avoid

- **Mixing libraries in one component:** Never use both Radix direct imports AND shadcn/ui in the same BetterBudgeter component
- **Bypassing shadcn/ui:** Don't install Radix components directly when shadcn/ui provides them
- **Legacy leakage:** Don't refactor legacy components to use shadcn/ui (legacy stays frozen)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Accessible dialogs | Custom modal with focus trap | shadcn/ui Dialog or AlertDialog | Keyboard navigation, focus management, ESC handling, backdrop clicks all handled |
| Form validation UI | Custom error messages | shadcn/ui Form (with react-hook-form) | Accessible error announcements, proper labeling, ARIA attributes |
| Toast notifications | Custom notification system | shadcn/ui Sonner | Queue management, positioning, animations, dismiss handling |
| Chart tooltips | Custom hover overlays | shadcn/ui ChartTooltip | Positioned correctly, responsive, themeable |
| Dropdown menus | Custom popover + click outside | shadcn/ui DropdownMenu or ContextMenu | Keyboard navigation, submenus, disabled states, separators |
| Date pickers | Calendar UI from scratch | shadcn/ui Calendar + DatePicker | Locale support, timezone handling, keyboard navigation |

**Key insight:** Accessibility is hard. shadcn/ui (via Radix primitives) handles ARIA attributes, focus management, keyboard navigation, and screen reader announcements. Custom solutions almost always miss edge cases.

## Common Pitfalls

### Pitfall 1: Importing Radix Directly in BetterBudgeter Components

**What goes wrong:** Developer imports `@radix-ui/react-dialog` directly in a new BetterBudgeter component instead of using `@/components/ui/dialog`.

**Why it happens:** Familiarity with Radix from legacy code, or not understanding the library boundary rules.

**How to avoid:**
- Document the import rule in CLAUDE.md: "BetterBudgeter components must NEVER import from @radix-ui directly"
- Use ESLint rule to forbid @radix-ui imports outside components/legacy/
- Code review checklist: verify no direct Radix imports in new code

**Warning signs:**
- `import * as Dialog from "@radix-ui/react-dialog"` in non-legacy files
- TypeScript errors about Radix component props in BetterBudgeter code

### Pitfall 2: Tremor Color Format Confusion

**What goes wrong:** Using HEX colors with Tremor v4 causes charts to render with incorrect colors.

**Why it happens:** Tremor v4 uses tailwind-variants which expects Tailwind color names, not HEX values.

**How to avoid:**
- Remove Tremor entirely (already planned)
- shadcn/ui charts use CSS variables (no HEX issues)
- Document in migration plan: DonutChart replacement must use CSS variables

**Warning signs:**
- Chart renders but all segments are the same color
- Tailwind v4 not generating fill-* utilities

### Pitfall 3: shadcn/ui and Radix Version Conflicts

**What goes wrong:** Upgrading Radix packages manually causes version mismatches with shadcn/ui's expected versions.

**Why it happens:** Developer sees Radix update, runs `bun update @radix-ui/*`, breaks shadcn/ui components.

**How to avoid:**
- Let shadcn/ui manage Radix versions (don't manually update)
- If Radix security update needed, check shadcn/ui GitHub for compatibility
- Document in CLAUDE.md: "Do not manually upgrade @radix-ui packages"

**Warning signs:**
- shadcn/ui components throw TypeScript errors after Radix update
- Props no longer match expected types

### Pitfall 4: Tailwind v4 Class Generation with Tremor

**What goes wrong:** Tremor-specific utilities (fill-*, stroke-*) not generated by Tailwind v4.

**Why it happens:** Tailwind v4 only generates classes found in source code. Tremor uses runtime class generation.

**How to avoid:**
- Remove Tremor (already planned)
- Clean up globals.css after Tremor removal (remove @source directive and @utility definitions)

**Warning signs:**
- Charts render but colors missing
- Browser console shows unknown Tailwind classes

### Pitfall 5: Legacy Component Refactoring Scope Creep

**What goes wrong:** While adding new BetterBudgeter features, developer "improves" legacy components to use shadcn/ui.

**Why it happens:** Good intentions - seeing old Radix code and wanting to modernize it.

**How to avoid:**
- Document in CLAUDE.md: "Legacy components stay frozen on Radix UI"
- Separate legacy/ directory visually signals "do not touch"
- Code review: flag any changes to components/legacy/ not explicitly requested

**Warning signs:**
- PR includes both new feature AND legacy component changes
- Removal of @radix-ui imports from legacy files

## Code Examples

Verified patterns from official sources and existing codebase:

### shadcn/ui Button Usage

```typescript
// Source: src/components/auth/LoginForm.tsx
import { Button } from "@/components/ui/button";

export function LoginForm() {
  return (
    <form>
      <Button type="submit" variant="default" size="default">
        Log In
      </Button>
      <Button type="button" variant="outline" size="sm">
        Cancel
      </Button>
    </form>
  );
}
```

### shadcn/ui Dialog Usage

```typescript
// Source: src/components/legacy/transactions/EditTransactionDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function EditDialog({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>
        {/* Form content */}
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### shadcn/ui Chart (PieChart/Donut)

```typescript
// Source: https://ui.shadcn.com/charts/pie (adapted)
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart } from "recharts";

const chartConfig = {
  food: { label: "Food", color: "hsl(var(--chart-1))" },
  rent: { label: "Rent", color: "hsl(var(--chart-2))" },
  utilities: { label: "Utilities", color: "hsl(var(--chart-3))" },
};

export function CategoryChart({ data }: { data: CategoryData[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-64">
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          innerRadius={60}     // innerRadius > 0 = donut
          outerRadius={100}
          label
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </PieChart>
    </ChartContainer>
  );
}
```

### Base UI Example (Hypothetical)

```typescript
// Example: Using Base UI for a custom Slider (if shadcn/ui didn't have one)
import { Slider } from "@base-ui/react";

export function BudgetSlider({ value, onChange }) {
  return (
    <Slider
      value={value}
      onChange={onChange}
      min={0}
      max={5000}
      step={50}
      className="w-full"
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Tremor v3.18.7 stable | Tremor v4 beta (React 19) | Dec 2024 | Required for React 19 + Tailwind v4 stack |
| HEX colors in Tremor | Named colors only | Dec 2024 | Tremor v4 + tailwind-variants requires color names |
| shadcn/ui Radix-only | shadcn/ui Radix OR Base UI | Jan 2026 | New components have Base UI variants (choice at init) |
| Manual @radix-ui installs | shadcn/ui CLI manages deps | Ongoing | shadcn/ui CLI handles Radix version compatibility |

**Deprecated/outdated:**
- **Tremor stable (v3.x):** Incompatible with React 19, last published ~1 year ago
- **Tremor HEX color support:** Unreliable with Tailwind v4, use named colors or CSS variables
- **@base-ui-components/react package name:** Renamed to @base-ui/react in 2026

## Component Inventory

### shadcn/ui Components (Installed)

All located in `src/components/ui/`:

| Component | Underlying Primitive | Used In | Purpose |
|-----------|---------------------|---------|---------|
| alert-dialog.tsx | @radix-ui/react-alert-dialog | Legacy DeleteTransactionDialog | Confirm destructive actions |
| button.tsx | @radix-ui/react-slot | Multiple (auth, dashboard, settings) | Primary action buttons |
| calendar.tsx | react-day-picker | UI library (internal) | Date selection |
| card.tsx | Native div | Finance LinkBankFlow | Content containers |
| chart.tsx | recharts | Not yet used (will replace Tremor) | Chart wrapper with theming |
| context-menu.tsx | @radix-ui/react-context-menu | Legacy SingleTransaction | Right-click menus |
| date.tsx | Native input + Calendar | UI library (internal) | Date input component |
| dialog.tsx | @radix-ui/react-dialog | Legacy Edit/RecurringStatus dialogs | Modal dialogs |
| drawer.tsx | vaul (drawer primitive) | Legacy NewTransaction | Bottom sheet on mobile |
| form.tsx | react-hook-form | Legacy NewTransaction | Form validation wrapper |
| input-otp.tsx | input-otp library | Legacy PasscodePrompt | One-time password input |
| input.tsx | Native input | Multiple (auth, settings, legacy) | Text inputs |
| label.tsx | @radix-ui/react-label | Multiple (settings, legacy) | Form labels |
| popover.tsx | @radix-ui/react-popover | Not directly used | Popover container |
| scroll-area.tsx | @radix-ui/react-scroll-area | Legacy NewTransaction | Scrollable containers |
| select.tsx | @radix-ui/react-select | Legacy Edit/NewTransaction dialogs | Dropdown selects |
| sonner.tsx | sonner library | Legacy Sonner effect | Toast notifications |
| switch.tsx | @radix-ui/react-switch | Not directly used | Toggle switches |
| textarea.tsx | Native textarea | Legacy NewTransaction | Multi-line text input |
| tooltip.tsx | @radix-ui/react-tooltip | Legacy SortButton, Currency | Hover tooltips |

**Total:** 21 shadcn/ui components installed

### Tremor Components (In Use)

| Component | File | Route | Status |
|-----------|------|-------|--------|
| DonutChart | src/components/dashboard/SpendingByCategoryChart.tsx | `/` (dashboard) | TO BE REPLACED with shadcn/ui PieChart |

**Total:** 1 Tremor component

### Recharts Direct Usage (Legacy)

| Component | File | Route | Status |
|-----------|------|-------|--------|
| Multiple (BarChart, PieChart, LineChart, AreaChart) | src/components/legacy/common/Analytics.tsx | Legacy analytics page | FROZEN - no changes |

**Total:** 1 file with extensive Recharts usage (legacy only)

### Radix UI Direct Imports (Legacy Only)

All legacy components using Radix directly are FROZEN. No migration planned.

**Files with direct @radix-ui imports (legacy):** 0

All Radix usage goes through shadcn/ui wrappers.

### BetterBudgeter Components (Non-UI)

| Component | Library Dependencies | Status |
|-----------|---------------------|--------|
| SpendingByCategoryChart | Tremor DonutChart | TO MIGRATE to shadcn/ui chart |
| BudgetNotificationDialogs | shadcn/ui AlertDialog | ✓ Already using shadcn/ui |
| SyncTransactionsButton | shadcn/ui Button | ✓ Already using shadcn/ui |
| BudgetSettings | shadcn/ui Button, Input, Label | ✓ Already using shadcn/ui |
| LinkBankFlow | shadcn/ui Button, Card | ✓ Already using shadcn/ui |
| LoginForm | shadcn/ui Button, Input, Label | ✓ Already using shadcn/ui |
| SignOutButton | shadcn/ui Button | ✓ Already using shadcn/ui |

**Total BetterBudgeter components:** 7 (1 needs migration, 6 already use shadcn/ui)

## Open Questions

Things that couldn't be fully resolved:

1. **Base UI adoption timeline**
   - What we know: Base UI is stable (v1.1.0), shadcn/ui now supports both Radix and Base UI variants
   - What's unclear: When/if to switch shadcn/ui components from Radix to Base UI variants
   - Recommendation: Stick with Radix variants (default) unless specific Base UI feature needed. Re-evaluate after Phase 3 completion.

2. **Tremor globals.css cleanup depth**
   - What we know: Lines 5-53 in globals.css contain Tremor-specific config (@source directive, @utility fill-* definitions)
   - What's unclear: Are any other parts of globals.css Tremor-dependent?
   - Recommendation: Remove lines 5-53 completely after Tremor removal. Test build to verify no other dependencies.

3. **Legacy Analytics component chart library**
   - What we know: Legacy Analytics.tsx uses Recharts extensively (multiple chart types)
   - What's unclear: Should this be left frozen or migrated to shadcn/ui charts?
   - Recommendation: Leave frozen (legacy only). If needed in BetterBudgeter, rebuild charts with shadcn/ui, don't refactor legacy.

## Sources

### Primary (HIGH confidence)

- [shadcn/ui official docs](https://ui.shadcn.com/docs/components) - Component list and usage
- [shadcn/ui charts page](https://ui.shadcn.com/charts/pie) - Chart component documentation
- [Base UI official docs](https://base-ui.com/) - Base UI overview and components
- [Base UI npm package](https://www.npmjs.com/package/@base-ui/react) - Package information (v1.1.0)
- Existing codebase audit - grep verified all imports
- TREMOR_AUDIT.md (from Phase 02-01) - Complete Tremor usage documentation

### Secondary (MEDIUM confidence)

- [Starting a React Project? shadcn/ui, Radix, and Base UI Explained](https://certificates.dev/blog/starting-a-react-project-shadcnui-radix-and-base-ui-explained) - Library comparison
- [What is the difference between Radix and shadcn-ui?](https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui) - Relationship explanation
- [shadcn/ui Base UI migration discussion](https://github.com/shadcn-ui/ui/discussions/6248) - Base UI integration
- [Tremor GitHub repository](https://github.com/tremorlabs/tremor) - Main repository
- [Tremor npm repository](https://github.com/tremorlabs/tremor-npm) - NPM package repository (last release v3.18.7 Jan 2025)

### Tertiary (LOW confidence)

- WebSearch results on Radix/shadcn coexistence - community experiences, not official docs
- Tremor maintenance status - inferred from npm publish dates and GitHub activity

## Metadata

**Confidence breakdown:**
- shadcn/ui component list: HIGH - Verified in codebase with grep, matches official docs
- Base UI capabilities: HIGH - Official docs from base-ui.com, npm registry confirms v1.1.0
- Tremor removal justification: HIGH - TREMOR_AUDIT.md confirms 1 component only, Tremor-npm last release Jan 2025 (v3.18.7)
- Radix/shadcn coexistence: MEDIUM - Based on community reports and GitHub issues, not official compatibility matrix
- Chart migration approach: HIGH - shadcn/ui official chart docs, verified chart.tsx exists in codebase

**Research date:** 2026-01-28
**Valid until:** 90 days (shadcn/ui and Base UI are stable, not fast-moving)

**Next steps for planning:**
1. Create component inventory table (21 shadcn + 1 Tremor + legacy separation)
2. Define migration tasks (Tremor removal, DonutChart replacement)
3. Document CLAUDE.md library boundary rules
4. Create risk assessment (version conflicts, build breakage, visual regressions)
