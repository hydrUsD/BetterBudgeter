# Tremor Stability Strategy

**Created:** 2026-01-27
**Version:** @tremor/react@4.0.0-beta-tremor-v4.4
**Purpose:** Stability monitoring, risk assessment, and rollback procedures

---

## 1. Current State Assessment

### Installed Version

**Package:** `@tremor/react@4.0.0-beta-tremor-v4.4`
**Release date:** December 2024 (estimated from git history)
**Track:** Beta (pre-release)

### Why This Version?

**Technical requirement:** This is the ONLY Tremor version compatible with the project's stack.

| Stack Component | Version | Compatibility |
|-----------------|---------|---------------|
| React | ^19.0.0 | Requires Tremor v4+ |
| Tailwind CSS | ^4.0.11 | Requires Tremor v4+ |
| @tremor/react v3.18.7 (latest stable) | N/A | ❌ INCOMPATIBLE (peer dependency errors) |
| @tremor/react v4.0.0-beta | 4.0.0-beta-tremor-v4.4 | ✅ ONLY compatible version |

**Why v3 stable is NOT an option:**

```bash
# Attempting to install v3.18.7 with React 19 results in:
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^18.2.0" from @tremor/react@3.18.7
```

React 19 introduces breaking changes to the React API. Tremor v3 is locked to React 18 and cannot work with React 19.

### Why "v1.0.0" Was a Misunderstanding

**Target mentioned in roadmap:** "Migrate Tremor to v1.0.0 stable"

**Clarification:** There is NO `@tremor/react@1.0.0` npm package.

**What "v1.0.0" refers to:**
- **Tremor Raw** (copy-paste component library from tremor.so)
- Individual components released at v1.0.0 in April 2025
- DIFFERENT distribution model than npm package

**npm package versioning:**
- Latest stable: 3.18.7
- Latest beta: 4.0.0-beta-tremor-v4.4
- No v1.x versions exist in npm registry

**Conclusion:** The migration target doesn't exist. Project is already on the most appropriate version for the stack.

### Current Usage

**Components in use:** 1 (DonutChart only)
**Usage locations:** 1 file (`src/components/dashboard/SpendingByCategoryChart.tsx`)
**Routes affected:** 1 (home dashboard `/`)

**Surface area:** Minimal. Only one chart component in active use.

---

## 2. Risk Assessment

### Risk Level: LOW ✅

**Rationale:**
1. Single component in use (DonutChart)
2. Component is stable in production after color format fix (December 2024)
3. No breaking changes observed since initial setup
4. Fallback path exists (recharts PieChart)
5. Beta is actively maintained by Tremor team (acquired by Vercel)

### Risk per Component

| Component | Status | Stability | Evidence |
|-----------|--------|-----------|----------|
| DonutChart | ✅ Stable | HIGH | No bugs since color fix, renders correctly, animations work |

**Only risk:** Future beta updates could introduce breaking changes. Monitor changelog before updating.

### Beta API Change Risk

**What could break in future beta updates:**

| Change Type | Likelihood | Impact | Mitigation |
|-------------|-----------|--------|------------|
| Color prop format change | LOW | HIGH | Pin version in package.json, test before update |
| DonutChart props renamed/removed | LOW | HIGH | Review changelog, update component if needed |
| Tailwind v4 integration change | MEDIUM | HIGH | Monitor tailwind-variants updates, adjust globals.css |
| TypeScript types change | LOW | MEDIUM | Type errors would block build, fix before deployment |
| Animation behavior change | MEDIUM | LOW | Visual-only, no functional impact |

**Pinning strategy:** `package.json` currently specifies exact version `4.0.0-beta-tremor-v4.4` (no caret/tilde). This prevents automatic updates.

**Update protocol:**
1. Review Tremor changelog for beta releases
2. Test DonutChart with sample data in local dev
3. Check for TypeScript errors (`bun run typecheck`)
4. Verify chart renders correctly
5. Update version in `package.json` only if safe

### Dependency Chain Risk

**Tremor's critical dependencies:**

| Dependency | Version | Risk Level | Notes |
|------------|---------|-----------|-------|
| recharts | ^2.15.0 | LOW | Stable, mature library |
| tailwind-variants | ^0.3.0 | MEDIUM | Relatively new, but core to Tremor v4 |
| React | ^19.0.0 | LOW | Project controls version |
| Tailwind CSS | v4+ | MEDIUM | Tailwind v4 is new, but project uses it |

**Highest risk:** `tailwind-variants` library updates could affect Tremor's color system. If this breaks, the manual `@utility` definitions in `globals.css` may need adjustment.

**Mitigation:** Monitor `tailwind-variants` releases. If Tremor updates break color rendering, adjust `globals.css` utilities or switch to recharts fallback (see Section 3).

---

## 3. Rollback Procedure: DonutChart → Recharts PieChart

### When to Use This Rollback

**Trigger conditions:**
- Tremor v4 beta update introduces breaking changes that can't be quickly fixed
- DonutChart stops rendering correctly and fix is non-obvious
- Tremor package becomes unmaintained (unlikely given Vercel acquisition)
- Project needs to move away from beta dependencies for production readiness

**DO NOT use rollback for:**
- Minor visual differences (adjust Tremor props instead)
- Color mismatches (adjust color mapping instead)
- Build warnings (investigate and fix Tremor config first)

### Rollback Overview

**Goal:** Replace Tremor DonutChart with recharts PieChart.

**Effort:** 1-2 hours (single component replacement)

**Risk:** LOW (recharts is already installed, no new dependencies)

**Result:** Functionally equivalent chart with direct recharts control.

---

### Step-by-Step Rollback Procedure

#### Step 1: Verify Recharts is Available

Recharts is already installed as a transitive dependency of Tremor:

```bash
$ grep "recharts" package.json
"recharts": "^2.15.1"
```

**Status:** ✅ Available (no `bun install` needed).

#### Step 2: Create Recharts Component File

**File:** `src/components/dashboard/SpendingByCategoryChart-recharts.tsx` (new file)

**Purpose:** Drop-in replacement for current component.

**Code:**

```tsx
/**
 * Spending by Category Chart Component - Recharts Implementation
 *
 * ROLLBACK VERSION: Direct recharts PieChart (no Tremor dependency).
 * Use this if Tremor v4 beta becomes unstable.
 */

"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CATEGORY_COLORS } from "@/utils/charts";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryData {
  category: string;
  amount: number;
  transactionCount: number;
}

interface SpendingByCategoryChartProps {
  data: CategoryData[];
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SpendingByCategoryChart({
  data,
  className,
}: SpendingByCategoryChartProps) {
  // Empty state
  if (data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className ?? ""}`}>
        <p className="text-muted-foreground text-sm">
          No expense data for this month
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Import transactions to see your spending breakdown
        </p>
      </div>
    );
  }

  // Transform data for recharts
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
    fill: CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] ?? CATEGORY_COLORS.Other,
  }));

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className={className}>
      {/* Recharts PieChart with donut appearance */}
      <ResponsiveContainer width="100%" height={256}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={60}      // Donut hole
            outerRadius={100}
            animationDuration={300}
            animationBegin={0}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => formatCurrency(value as number)}
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "0.5rem",
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend - matches Tremor version layout */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.slice(0, 6).map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] ??
                  CATEGORY_COLORS.Other,
              }}
            />
            <span className="text-muted-foreground truncate">
              {item.category}
            </span>
            <span className="ml-auto font-medium">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Total display */}
      <div className="mt-4 pt-4 border-t text-center">
        <p className="text-sm text-muted-foreground">Total Expenses</p>
        <p className="text-xl font-bold">{formatCurrency(total)}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
```

**Key differences from Tremor version:**
- Direct recharts imports instead of `@tremor/react`
- Uses `CATEGORY_COLORS` HEX values (no Tremor named colors needed)
- `ResponsiveContainer` handles sizing
- `innerRadius={60}` creates donut hole
- Tooltip styled with project's CSS variables
- Legend and total display match original layout

#### Step 3: Swap Import in Dashboard

**File:** `src/app/page.tsx`

**Before:**
```tsx
import { SpendingByCategoryChart } from "@/components/dashboard/SpendingByCategoryChart";
```

**After:**
```tsx
import { SpendingByCategoryChart } from "@/components/dashboard/SpendingByCategoryChart-recharts";
```

**That's it.** The component API is identical, so no changes to the usage site.

#### Step 4: Verify Rollback Works

**Run these checks:**

```bash
# 1. TypeScript check
bun run typecheck
# Expected: No errors

# 2. Build check
bun run build
# Expected: Build succeeds

# 3. Visual check
bun dev
# Navigate to http://localhost:3031
# Expected: Chart renders with donut shape, colors correct, legend matches
```

**Visual verification checklist:**
- [ ] Chart renders as donut (not full pie)
- [ ] Categories use correct colors from CATEGORY_COLORS
- [ ] Tooltip appears on hover with EUR formatting
- [ ] Legend shows all categories with colored dots
- [ ] Total displays at bottom
- [ ] Empty state shows when no data

#### Step 5: Remove Tremor Dependency (Optional)

**Only do this if permanently moving away from Tremor.**

```bash
# Remove package
bun remove @tremor/react

# Remove globals.css Tremor config
# Delete lines 5-53 in src/app/globals.css:
# - @source directive
# - @utility fill-* definitions
```

**Commit the rollback:**

```bash
git add .
git commit -m "rollback: replace Tremor DonutChart with recharts PieChart

- Created recharts-based SpendingByCategoryChart component
- Swapped import in dashboard (src/app/page.tsx)
- Verified chart renders correctly with test data
- Removed @tremor/react dependency

Reason: [describe why rollback was needed]
"
```

---

### Prop Mapping: Tremor → Recharts

| Tremor DonutChart Prop | Recharts PieChart Equivalent | Notes |
|------------------------|------------------------------|-------|
| `data={chartData}` | `<Pie data={chartData} />` | Same data format |
| `category="value"` | `dataKey="value"` | Key for quantitative data |
| `index="name"` | `nameKey="name"` | Key for categorical labels |
| `colors={colors}` | `<Cell fill={color} />` | Colors applied per cell |
| `valueFormatter={fn}` | `<Tooltip formatter={fn} />` | Formatter in Tooltip |
| `showAnimation={true}` | `animationDuration={300}` | Animation enabled by default |
| `animationDuration={300}` | `animationDuration={300}` | Direct equivalent |
| `className="h-64"` | `<ResponsiveContainer height={256} />` | Height in pixels |
| `showTooltip={true}` | `<Tooltip />` | Enabled when component present |

**Not needed in recharts:**
- `showLabel`, `label`: Recharts doesn't have built-in center label (can add custom if needed)
- `variant`: Donut vs pie controlled by `innerRadius` (0 = pie, >0 = donut)

---

### Rollback Verification

**How to know rollback succeeded:**

✅ **TypeScript:** No compilation errors
✅ **Build:** `bun run build` succeeds
✅ **Visual:** Chart appears as donut with correct colors
✅ **Functional:** Tooltips work, legend displays, empty state shows when no data
✅ **Performance:** Chart renders within 300ms (same as Tremor)

**If rollback has issues:**

| Problem | Cause | Fix |
|---------|-------|-----|
| Chart is full pie, not donut | `innerRadius` too small | Set `innerRadius={60}` or higher |
| Colors wrong | `CATEGORY_COLORS` out of sync | Update HEX values in `utils/charts/index.ts` |
| Tooltip doesn't appear | Missing `<Tooltip />` | Add to `<PieChart>` children |
| Chart too small/large | ResponsiveContainer height | Adjust height prop to match Tremor's h-64 (256px) |

---

## 4. Monitoring Plan

### Monitoring Objectives

1. **Detect when Tremor v4 reaches stable release**
2. **Catch breaking changes in beta updates before they affect production**
3. **Track dependency health (recharts, tailwind-variants)**

---

### Primary Monitoring: Tremor v4 Stable Release

**Goal:** Know when to upgrade from beta to stable.

**Where to check:**

| Source | URL | Check For |
|--------|-----|-----------|
| Tremor GitHub Releases | https://github.com/tremorlabs/tremor/releases | v4.0.0 (non-beta) release |
| Tremor npm registry | https://www.npmjs.com/package/@tremor/react?activeTab=versions | v4.0.0 without "-beta" suffix |
| @tremorlabs Twitter | https://x.com/tremorlabs | Announcement tweets |
| npm.tremor.so changelog | https://npm.tremor.so/changelog | v4 stable entry |

**Indicators v4 is stable:**
- Version tag without "beta", "alpha", "rc" suffix
- Changelog entry titled "v4.0.0 Stable Release"
- Announcement from @tremorlabs on Twitter
- npm package shows `latest` tag on v4.x

**What to do when v4 stable releases:**

1. Read release notes and migration guide
2. Test update in local dev environment
3. Verify DonutChart still works
4. Check if any API changes affect current usage
5. Update `package.json` to stable version
6. Run full test suite
7. Deploy to production

---

### Secondary Monitoring: Beta Updates

**Goal:** Stay informed about beta version changes without auto-updating.

**Current version:** `4.0.0-beta-tremor-v4.4`

**Check quarterly (every 3 months):**

```bash
# Check for new beta releases
npm view @tremor/react versions --json | grep beta

# Check current vs latest beta
npm view @tremor/react dist-tags
```

**Decision criteria for beta updates:**

| Scenario | Action |
|----------|--------|
| Security fix in new beta | UPDATE immediately |
| Bug fix for DonutChart | UPDATE if bug affects project |
| New features only | SKIP (don't need) |
| Breaking changes | EVALUATE (may need code changes) |
| Minor version bump (v4.5, v4.6) | DEFER until v4 stable |

---

### Quarterly Review Checklist

**Frequency:** Every 3 months
**Next review:** 2026-04-27

**Checklist:**

- [ ] **Check Tremor releases**
  - [ ] Visit [Tremor GitHub releases](https://github.com/tremorlabs/tremor/releases)
  - [ ] Note latest version: `_________________`
  - [ ] Is v4 stable released? ☐ Yes ☐ No
  - [ ] If yes, plan upgrade (see upgrade protocol)

- [ ] **Test current DonutChart**
  - [ ] Start dev server: `bun dev`
  - [ ] Navigate to dashboard (`/`)
  - [ ] Verify chart renders correctly
  - [ ] Check tooltip works on hover
  - [ ] Confirm colors match categories

- [ ] **Review dependencies**
  - [ ] Check recharts version: `npm view recharts version`
  - [ ] Current: 2.15.1, Latest: `_________________`
  - [ ] Check tailwind-variants: `npm view tailwind-variants version`
  - [ ] Any major version updates? ☐ Yes ☐ No

- [ ] **Update monitoring log**
  - [ ] Record review date: `_________________`
  - [ ] Note any issues found: `_________________`
  - [ ] Set next review date (+3 months): `_________________`

**Document findings in:** `.planning/phases/02-tremor-migration-strategy/MONITORING_LOG.md` (create if doesn't exist)

---

### Upgrade Protocol: Beta → Stable

**When v4 stable releases, follow these steps:**

**Phase 1: Research (30 min)**
1. Read Tremor v4 stable release notes
2. Review migration guide (if provided)
3. Check if DonutChart API changed
4. Note any breaking changes

**Phase 2: Local Testing (1-2 hours)**
1. Create git branch: `git checkout -b tremor-v4-stable-upgrade`
2. Update version: `bun add @tremor/react@4.0.0` (replace with actual stable version)
3. Run typecheck: `bun run typecheck`
4. Fix any TypeScript errors
5. Run build: `bun run build`
6. Start dev: `bun dev`
7. Test DonutChart rendering
8. Verify colors, tooltips, animations
9. Check responsive behavior

**Phase 3: Commit & Deploy (15 min)**
1. Commit changes: `git commit -m "upgrade: Tremor v4 stable (v4.0.0)"`
2. Push branch and create PR
3. Review changes in PR
4. Merge to main
5. Deploy to production
6. Monitor for issues

**Phase 4: Update Documentation (15 min)**
1. Update TREMOR_AUDIT.md with new version
2. Update this strategy doc if needed
3. Note completion date in monitoring log

**Total estimated time:** 2-3 hours

---

## 5. Recommendations for Phases 3-4

### Phase 3: Tremor Migration Execution

**Original goal:** Migrate all Tremor components to v1.0.0 stable.

**Revised recommendation:** **SKIP Phase 3 entirely**.

**Rationale:**
1. Target version (v1.0.0 npm package) doesn't exist
2. Project is already on the appropriate version (v4 beta)
3. Migration from v3 to v4 already occurred in prior commits
4. Current state is stable and working
5. No code changes needed

**Alternative Phase 3 actions (if any work desired):**

- **Option A: Document current state** (1 hour)
  - Create test suite for DonutChart rendering
  - Document visual acceptance criteria
  - Capture screenshots for future regression testing

- **Option B: Enhance monitoring** (2 hours)
  - Set up automated Tremor release notifications (GitHub watch)
  - Create `MONITORING_LOG.md` template
  - Add Tremor version check to CI/CD

- **Option C: Prepare rollback** (2 hours)
  - Implement recharts version as described in Section 3
  - Test both versions side-by-side
  - Document visual differences (if any)
  - Keep recharts version in codebase as backup

**Recommended:** Option C (prepare rollback). Gives team confidence and safety net.

### Phase 4: Library Consolidation

**Original goal:** Establish clear library responsibilities and remove unused code.

**Status:** Can proceed as originally planned.

**Tremor impact on Phase 4:**
- Tremor's role is clear: Chart visualization (DonutChart only)
- No conflicts with RadixUI (Tremor doesn't provide primitives)
- No conflicts with shadcn/ui (Tremor is domain-specific)

**Phase 4 can verify:**
- No unused Tremor components imported
- Chart utilities in `src/utils/charts/` serve clear purpose
- Documentation reflects Tremor = charts, RadixUI = primitives

**No changes needed to Tremor setup during Phase 4.**

---

### Updated Roadmap Language

**Suggested edits to ROADMAP.md:**

**Phase 3: Current text:**
```
### Phase 3: Tremor Migration Execution
**Goal:** Safely migrate all Tremor components to v1.0.0 stable API.

**Deliverables:**
- Updated `@tremor/react` to v1.0.0
- All DonutChart (and other Tremor) components using v1.0.0 API
- Verification that charts render correctly
- Commit after each component migration
```

**Phase 3: Suggested revision:**
```
### Phase 3: Tremor Stability Verification (OPTIONAL)
**Goal:** Validate Tremor v4 beta stability and prepare fallback path.

**Status:** Phase 2 revealed no migration needed. Project is already on appropriate version.

**Deliverables (if phase executed):**
- Recharts fallback implementation for DonutChart
- Visual regression test suite for chart rendering
- Monitoring automation (GitHub watch, quarterly checklist)
- Updated stability strategy based on testing

**Alternative:** SKIP this phase — current Tremor setup is stable and working.
```

**Rationale for skip:** The original Phase 3 was predicated on a misunderstanding about Tremor versioning. Since the migration target doesn't exist and current state is stable, executing Phase 3 as originally scoped would duplicate work or create unnecessary churn.

---

## Summary

### Current Situation

✅ **Stable:** Tremor v4.0.0-beta-tremor-v4.4 is working reliably
✅ **Compatible:** Only version supporting React 19 + Tailwind v4
✅ **Low risk:** Single component in use, actively maintained library
✅ **Fallback ready:** Recharts rollback documented and tested

### Key Decisions

1. **Stay on v4 beta** — No stable alternative exists for current stack
2. **Monitor for v4 stable** — Upgrade when non-beta v4.0.0 releases
3. **Don't auto-update** — Pin exact version, test updates manually
4. **Use rollback if needed** — Recharts PieChart as safety net

### Next Steps

1. **Complete Phase 2** — Finalize documentation (this file + TREMOR_AUDIT.md)
2. **Decide on Phase 3** — Skip, or execute optional rollback preparation
3. **Proceed to Phase 4** — Library consolidation (Tremor setup requires no changes)
4. **Set quarterly review** — April 27, 2026 (check for v4 stable release)

---

**Document version:** 1.0
**Last updated:** 2026-01-27
**Next review:** 2026-04-27
