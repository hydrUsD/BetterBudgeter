# Migration Risk Assessment

**Created:** 2026-01-28
**Phase:** 02-ui-library-strategy (Plan 03)
**Purpose:** Identify risks for Phase 3 UI library migration

---

## 1. Tremor Removal Risks

### 1.1 DonutChart Replacement

**Risk:** Data format incompatibility between Tremor DonutChart and shadcn/ui PieChart (Recharts).

**Analysis:**
- Tremor DonutChart expects: `{ name: string, value: number }[]`
- Recharts PieChart expects: same structure via `dataKey` prop
- Data format is compatible; no transformation needed

**Visual differences:**
- Tremor has built-in legend, label, and tooltip styling
- shadcn/ui requires explicit configuration for these features
- Visual appearance WILL change (acceptable per CONTEXT.md)

**Rollback procedure** (from 02-01-SUMMARY.md):
- Recharts rollback code documented in TREMOR_STABILITY_STRATEGY.md
- Can restore Tremor DonutChart by reverting commit if needed

**Mitigation:**
- Keep 02-01 rollback procedure accessible during migration
- Verify data renders correctly (values match, not visual match)

### 1.2 Tailwind Config Cleanup

**Risk:** Removing globals.css lines 5-53 may remove utilities still used elsewhere.

**Lines to remove:**
```css
@source "../node_modules/@tremor/react/dist/**/*.mjs"
@utility fill-* { ... }
@utility stroke-* { ... }
/* Tremor color mappings */
```

**Analysis:**
- `@source` directive: Only loads Tremor classes, safe to remove
- `fill-*` and `stroke-*` utilities: Tremor-specific, grep before removing
- Color mappings: Named for Tremor chart colors ("tremor-*")

**Mitigation:**
- Run `grep -r "fill-" src/` and `grep -r "stroke-" src/` before removing
- Run `grep -r "tremor-" src/` to verify no other usage
- Build verification will catch missing classes

### 1.3 Package Removal

**Risk:** @tremor/react may have transitive dependencies used by other packages.

**Analysis from 02-01 audit:**
- Tremor's main dependencies: Recharts (we keep), Tailwind utilities (we keep)
- No unique transitive deps identified that other packages rely on
- `bun remove` will warn about peer dependency issues

**Mitigation:**
- Run `bun remove @tremor/react` and check for warnings
- Build verification catches any broken imports

---

## 2. Base UI Adoption Risks

### 2.1 Package Maturity

**Risk:** Base UI v1.x is relatively new (v1.0 Dec 2025). API may change in minor versions.

**Analysis:**
- v1.0.0 stable released Dec 2025 (1 month old)
- Backed by MUI team (established maintainers)
- "Headless" primitives are simple by design (lower API churn risk)

**Current usage:** Not yet used in codebase (available for future gaps)

**Mitigation:**
- Pin exact version in package.json
- Only use for primitives shadcn/ui doesn't cover
- Document any Base UI component usage for future version audits

---

## 3. Legacy Isolation Risks

### 3.1 Radix Version Conflicts

**Risk:** Legacy OopsBudgeter uses Radix directly. shadcn/ui bundles its own Radix. Version mismatches could cause runtime issues.

**Analysis:**
- shadcn/ui model: Copies component code locally (not importing from npm)
- Radix imports in shadcn/ui components are bundled at copy time
- Legacy Radix imports use separate npm packages

**Why this is LOW risk:**
- shadcn/ui components are local files, not npm dependencies
- No shared Radix instances between legacy and BB code
- Separate import paths prevent version bleeding

**Mitigation:**
- Boundary rules prevent mixing: BB never imports @radix-ui directly
- Legacy stays frozen: no shadcn/ui adoption in legacy
- Build verification catches any import errors

---

## 4. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| DonutChart data incompatibility | LOW | HIGH | Data format is identical; verify render output |
| DonutChart visual regression | HIGH | LOW | Visual changes acceptable; will be redesigned later |
| Tailwind utility removal breaks other code | LOW | MEDIUM | grep for usage before removing; build verification |
| Tremor transitive dep breaks other package | LOW | MEDIUM | bun remove warns; build catches |
| Base UI API breaking change | LOW | LOW | Pin version; minimal/no current usage |
| Radix version conflict between legacy and BB | LOW | HIGH | shadcn/ui is local copy; import paths separate |

**Legend:**
- **Likelihood:** LOW = unlikely, MEDIUM = possible, HIGH = expected
- **Impact:** LOW = minor fix, MEDIUM = 1-2 hour fix, HIGH = significant rework

---

## 5. Verification Strategy

After Phase 3 completion, verify:

### Build Verification
```bash
bun run build
```
Must pass without errors. Catches missing imports, type errors.

### Type Check
```bash
bun run typecheck  # if script exists
```
Catches type mismatches in replaced component.

### Visual Spot-Check

1. Start dev server: `bun dev`
2. Navigate to dashboard with spending data
3. Verify DonutChart replacement renders:
   - Correct category names
   - Correct values
   - Interactive tooltip works
   - (Visual appearance may differ - OK)

### Import Verification
```bash
grep -r "@tremor/react" src/
```
Must return no results after migration.

### Tailwind Verification
```bash
grep -r "tremor-" src/
```
Must return no results (all Tremor-specific classes removed).

---

## Summary

**Overall Risk Level:** LOW

The migration has minimal blast radius (1 component, 1 CSS file section, 1 dependency). All risks have clear mitigations and verification steps. The highest-impact risks (DonutChart data, Radix conflicts) are also the lowest-likelihood due to compatible data formats and separate import paths.

---

*Document created: 2026-01-28*
*Phase: 02-ui-library-strategy*
