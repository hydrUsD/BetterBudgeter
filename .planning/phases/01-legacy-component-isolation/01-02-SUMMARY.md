---
phase: 01-legacy-component-isolation
plan: 02
subsystem: component-imports
status: complete
tags: [import-rewiring, legacy-isolation, build-verification]
requires:
  - 01-01
provides:
  - functional-legacy-isolation
  - verified-build
affects:
  - all-future-component-imports
tech-stack:
  added: []
  patterns:
    - absolute-import-paths
    - component-isolation
key-files:
  created: []
  modified:
    - src/app/legacy/page.tsx
    - src/app/analytics/page.tsx
    - src/app/achievements/page.tsx
    - src/app/layout.tsx
    - src/lib/my1DollarAI.ts
    - src/lib/download.ts
    - src/components/legacy/common/Settings.tsx
    - src/components/legacy/effects/Sonner.tsx
    - src/components/legacy/sorting/SortButton.tsx
    - src/components/legacy/security/PasscodePrompt.tsx
    - src/components/legacy/transactions/*.tsx
decisions:
  - decision: Use absolute @/components/ui/* paths instead of relative ../ui/* in all legacy components
    rationale: After moving components to legacy/ subdirectory, relative paths break. Absolute paths are more maintainable.
    impact: All legacy components now use consistent absolute imports for UI primitives
  - decision: Keep Logo import at @/components/common/Logo (not legacy)
    rationale: Logo.tsx at common/ is the BetterBudgeter version, should not be in legacy folder
    impact: Dual logo strategy maintained - OopsBudgeter version in legacy, BetterBudgeter version at common
metrics:
  duration: 5.4 minutes
  completed: 2026-01-27
  files-modified: 17
  commits: 2
---

# Phase 01 Plan 02: Import Path Rewiring Summary

**One-liner:** Rewired all imports to use components/legacy/* paths and verified build succeeds with zero TypeScript errors.

---

## What Was Done

### Task 1: Import Path Updates (Commit 9601e4d)

Systematically updated all imports throughout the codebase to point to the new `components/legacy/` structure:

**App Routes:**
- `src/app/legacy/page.tsx` - Updated 6 imports (cards, categories, transactions, DatePicker)
- `src/app/layout.tsx` - Updated 8 legacy imports, preserved Logo at common/
- `src/app/achievements/page.tsx` - Updated AchievementsWrapper import
- `src/app/analytics/page.tsx` - Updated Analytics import

**Lib Files:**
- `src/lib/my1DollarAI.ts` - Updated Currency import
- `src/lib/download.ts` - Updated Currency imports

All imports changed from `@/components/[module]/` to `@/components/legacy/[module]/`.

### Task 2: UI Import Fixes (Commit fe9b45b)

After initial import rewiring, discovered that legacy components had broken relative imports to UI primitives. Fixed all relative `../ui/*` paths to use absolute `@/components/ui/*` paths:

**Files Fixed:**
- Settings.tsx (input, package.json path)
- Sonner.tsx (sonner)
- SortButton.tsx (tooltip)
- PasscodePrompt.tsx (input-otp)
- DeleteTransactionDialog.tsx (alert-dialog)
- EditTransactionDialog.tsx (dialog, input, select)
- NewTransaction.tsx (drawer, input, textarea, form, select, scroll-area)
- RecurringStatusDialog.tsx (dialog, select, label)

### Verification

All verification criteria passed:
- ✅ `bun run typecheck` - Zero TypeScript errors
- ✅ `bun run build` - Successful production build
- ✅ No stale imports to old component paths
- ✅ All legacy imports use correct @/components/legacy/* paths
- ✅ Logo import preserved at @/components/common/Logo

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Fixed broken relative UI imports in legacy components**

- **Found during:** Task 2 (typecheck phase)
- **Issue:** After moving components to legacy/ subdirectory, relative imports `../ui/*` no longer resolved correctly (wrong directory depth)
- **Fix:** Batch-replaced all relative UI imports with absolute paths `@/components/ui/*` using sed + manual verification
- **Files modified:** 8 legacy component files
- **Commit:** fe9b45b

**2. [Rule 3 - Blocking] Fixed package.json import path**

- **Found during:** Task 2 (typecheck)
- **Issue:** Settings.tsx was using `@/package.json` which doesn't work (@ maps to src/ only)
- **Fix:** Changed to relative path `../../../../package.json` from legacy/common/Settings.tsx
- **Files modified:** Settings.tsx
- **Commit:** fe9b45b (same commit)

---

## Key Decisions Made

1. **Absolute vs Relative Imports for UI Primitives**
   - **Decision:** Use absolute `@/components/ui/*` paths throughout legacy components
   - **Context:** Relative paths (`../ui/*`) break when component directory structure changes
   - **Impact:** More resilient to future refactoring, consistent with rest of codebase

2. **Logo Import Strategy**
   - **Decision:** Keep Logo import pointing to `@/components/common/Logo` (not legacy)
   - **Context:** Logo.tsx at common/ is the BetterBudgeter version; legacy has Logo.tsx.original
   - **Impact:** Maintains dual logo strategy, supports both OopsBudgeter and BetterBudgeter branding

---

## Verification Results

### TypeCheck Results
```
$ bun run typecheck
$ tsc --noEmit
✓ No errors
```

### Build Results
```
$ bun run build
✓ Compiled successfully
✓ Generating static pages (24/24)
✓ Build completed
```

### Import Verification
- ✅ Zero imports to `@/components/cards/`
- ✅ Zero imports to `@/components/categories/`
- ✅ Zero imports to `@/components/transactions/`
- ✅ Zero imports to `@/components/providers/`
- ✅ Zero imports to `@/components/security/`
- ✅ Zero imports to `@/components/helpers/`
- ✅ Zero imports to `@/components/effects/`
- ✅ Zero imports to `@/components/sorting/`
- ✅ All legacy imports correctly use `@/components/legacy/*`

---

## Next Phase Readiness

### Readiness: ✅ READY

**Phase 01 Complete:** Legacy component isolation is now functionally complete. All components are:
- Physically moved to components/legacy/
- Correctly imported via @/components/legacy/* paths
- Building and typechecking without errors
- Functionally identical (structure-only changes)

**Handoff to Phase 02 (Tremor Migration Strategy):**
- Can now clearly identify which components use Tremor vs Radix UI
- Legacy components are isolated and won't be affected by Tremor migration
- Can audit legacy/common/Analytics.tsx to determine Tremor upgrade path
- Clear separation enables safe parallel development of new components

### Blockers
None.

### Concerns
None. The isolation is complete and verified.

---

## Files Modified (17 total)

**App Routes (4):**
- src/app/legacy/page.tsx
- src/app/analytics/page.tsx
- src/app/achievements/page.tsx
- src/app/layout.tsx

**Lib Files (2):**
- src/lib/my1DollarAI.ts
- src/lib/download.ts

**Legacy Components (11):**
- src/components/legacy/common/Settings.tsx
- src/components/legacy/effects/Sonner.tsx
- src/components/legacy/sorting/SortButton.tsx
- src/components/legacy/security/PasscodePrompt.tsx
- src/components/legacy/transactions/DeleteTransactionDialog.tsx
- src/components/legacy/transactions/EditTransactionDialog.tsx
- src/components/legacy/transactions/NewTransaction.tsx
- src/components/legacy/transactions/RecurringStatusDialog.tsx
- (Plus automated fixes in other legacy tsx files)

---

## Commits

| Commit | Type | Description |
|--------|------|-------------|
| 9601e4d | refactor | Rewired all app/lib imports to components/legacy/ paths |
| fe9b45b | fix | Updated relative UI imports in legacy components to absolute paths |

---

## Technical Notes

### Import Path Pattern

**Before (broken after 01-01):**
```typescript
import BalanceCard from "@/components/cards/BalanceCard";
import { Input } from "../ui/input";
```

**After (working):**
```typescript
import BalanceCard from "@/components/legacy/cards/BalanceCard";
import { Input } from "@/components/ui/input";
```

### Why Relative Imports Broke

When components were in `src/components/categories/`, relative path `../ui/` correctly pointed to `src/components/ui/`.

After moving to `src/components/legacy/categories/`, the same relative path pointed to `src/components/legacy/../ui/` = `src/components/ui/` - but TypeScript couldn't resolve this properly due to how module resolution works.

Solution: Use absolute paths via `@/components/ui/*` which always resolve correctly regardless of file location.

---

## Success Criteria Met

- ✅ All tasks executed
- ✅ Each task committed individually with proper format
- ✅ All deviations documented
- ✅ No authentication gates encountered
- ✅ SUMMARY.md created with substantive content
- ✅ STATE.md will be updated next
- ✅ Zero TypeScript errors
- ✅ Successful production build
- ✅ App functionally identical (structure-only changes)
