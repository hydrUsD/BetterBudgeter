---
phase: 01-legacy-component-isolation
plan: 01
subsystem: component-architecture
tags: [refactor, legacy-isolation, git-mv, file-organization]
requires: []
provides:
  - "src/components/legacy/ directory with 28 moved + 1 restored component"
  - "Clear structural boundary between legacy and new code"
  - "Preserved git history for all moved components"
affects:
  - "01-02 (import path updates will reference this structure)"
  - "Future UI redesign work (legacy components isolated)"
tech-stack:
  added: []
  patterns:
    - "Structural isolation via directory organization"
    - "Git history preservation with git mv"
key-files:
  created:
    - "src/components/legacy/ (9 subdirectories)"
    - "src/components/legacy/common/Logo.tsx (restored original)"
  modified: []
decisions:
  - name: "Use git mv for all file moves"
    rationale: "Preserves git history and attribution"
    impact: "git log --follow works on moved files"
  - name: "Keep two Logo.tsx versions"
    rationale: "Legacy code needs original OopsBudgeter branding"
    impact: "components/common/Logo.tsx = BetterBudgeter, components/legacy/common/Logo.tsx = OopsBudgeter"
duration: "4 minutes"
completed: 2026-01-27
---

# Phase 1 Plan 01: Legacy Component Isolation Summary

**One-liner:** Moved 28 unmodified OopsBudgeter components to src/components/legacy/ and restored original Logo.tsx

---

## What Was Accomplished

Successfully created structural boundary between legacy OopsBudgeter code and new BetterBudgeter code by moving all unmodified components into a dedicated legacy directory.

### Task 1: Create legacy directory structure and move 28 components
- Created 9 subdirectories under `src/components/legacy/`
- Used `git mv` to move all 28 unmodified legacy components:
  - cards/ (3 files)
  - categories/ (2 files)
  - common/ (7 files, excluding Logo.tsx)
  - effects/ (2 files)
  - helpers/ (2 files)
  - providers/ (1 file)
  - security/ (2 files)
  - sorting/ (2 files)
  - transactions/ (7 files)
- Removed empty original directories
- Committed: `77650ae`

### Task 2: Restore original Logo.tsx
- Restored original OopsBudgeter Logo.tsx from commit `5806c14`
- Added header comment explaining dual Logo strategy
- Verified both versions coexist:
  - `components/common/Logo.tsx` = BetterBudgeter branding (modified)
  - `components/legacy/common/Logo.tsx` = OopsBudgeter branding (original)
- Committed: `50826cd`

---

## Key Files

### Created
- **src/components/legacy/** - Directory containing all 29 legacy components
  - cards/, categories/, common/, effects/, helpers/, providers/, security/, sorting/, transactions/
- **src/components/legacy/common/Logo.tsx** - Original OopsBudgeter Logo component

### Modified
- None (this was a pure file move + restoration operation)

---

## Technical Details

### Git History Preservation
All 28 component moves used `git mv` to preserve git history:
```bash
git log --follow src/components/legacy/cards/BalanceCard.tsx
```
Shows history including commits from before the move.

### Dual Logo Strategy
- **Legacy Logo** (`components/legacy/common/Logo.tsx`): Original OopsBudgeter branding
  - Contains "OopsBudgeter" text
  - Uses original logo assets
  - Restored from commit 5806c14
- **Current Logo** (`components/common/Logo.tsx`): BetterBudgeter branding
  - Contains "BetterBudgeter" text
  - Modified for new project identity

This allows legacy pages to continue using original branding while new pages use BetterBudgeter branding.

---

## Decisions Made

### 1. Use git mv for all file moves
**Rationale:** Preserves git history, attribution, and allows `git log --follow` to work correctly.

**Impact:** Future developers can trace component history through the move operation.

**Alternative considered:** Copy files and delete originals - rejected because it would lose git history.

### 2. Maintain two Logo.tsx versions
**Rationale:** Legacy components may import Logo expecting OopsBudgeter branding. Dual strategy prevents breaking existing behavior.

**Impact:**
- Clear separation of concerns
- No immediate need to update legacy imports
- Both brandings available for gradual migration

**Alternative considered:** Immediate global rename - rejected to minimize risk during structural refactor.

---

## Deviations from Plan

None - plan executed exactly as written.

---

## Verification Results

All verification checks passed:

✅ 29 legacy component files exist in `src/components/legacy/` (28 moved + 1 restored)
✅ Legacy directory has 9 subdirectories matching original structure
✅ `git log --follow` works on moved files (history preserved)
✅ Modified Logo.tsx still at `src/components/common/Logo.tsx`
✅ Original Logo.tsx restored at `src/components/legacy/common/Logo.tsx`
✅ Original Logo contains "OopsBudgeter" branding
✅ Modified Logo contains "BetterBudgeter" branding

---

## Issues Encountered

None. Execution was straightforward.

---

## Next Phase Readiness

### Blockers
None.

### Dependencies Met
All prerequisites for Plan 01-02 (Import Path Updates) are satisfied:
- ✅ Legacy directory structure exists
- ✅ All legacy components moved
- ✅ Git history preserved
- ✅ No files deleted or renamed

### Next Steps
Plan 01-02 can now:
1. Update all import paths to reference `components/legacy/`
2. Verify application still builds and runs
3. Complete the legacy component isolation

### Concerns
None at this time.

---

## Performance Metrics

- **Tasks completed:** 2/2
- **Files moved:** 28
- **Files restored:** 1
- **Total legacy components:** 29
- **Git commits:** 2 (atomic per task)
- **Execution time:** ~4 minutes
- **Build status:** Not tested (file moves only, no code changes)

---

## Context for Future Sessions

This plan established the foundational directory structure for legacy component isolation. All 28 unmodified OopsBudgeter components now live in `src/components/legacy/` with preserved git history.

**Important note:** Import paths throughout the codebase still reference the old locations. Plan 01-02 will update these imports to complete the isolation.

The dual Logo.tsx strategy allows legacy and new code to coexist without immediate breaking changes to legacy imports.
