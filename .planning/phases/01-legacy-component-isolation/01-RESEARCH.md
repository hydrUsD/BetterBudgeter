# Phase 1: Legacy Component Isolation - Research

**Researched:** 2026-01-27
**Domain:** Next.js App Router codebase refactoring (file moves and import rewiring)
**Confidence:** HIGH

## Summary

This phase is about **structurally isolating legacy OopsBudgeter components** from BetterBudgeter components through file moves and import rewiring. The codebase audit reveals a clean separation opportunity:

- **49 original OopsBudgeter components** exist in `src/components/` (imported at commit `5806c14`)
- **8 new BetterBudgeter components** were added in `auth/`, `dashboard/`, `finance/`, and `settings/` directories
- **1 modified component** (Logo.tsx - trivial branding change from "OopsBudgeter" to "BetterBudgeter")
- **Zero functional overlap** between legacy routes (`/legacy`, `/analytics`, `/achievements`) and new routes (`/`, `/dashboard`, `/link-bank`)

The standard approach is **file move with import rewrite**, following Next.js App Router conventions. Git history restoration for the one modified component is straightforward.

**Primary recommendation:** Move all original OopsBudgeter components into `components/legacy/` preserving directory structure, update legacy route imports to use `@/components/legacy/*`, leave BetterBudgeter components in place. Restore Logo.tsx original version to legacy, keep modified version in main structure.

## Standard Stack

This phase uses **existing Next.js tooling** — no additional libraries needed.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Next.js | 15.2.8 | App Router framework | Already in use, handles module resolution |
| TypeScript | 5.x | Type safety | Existing, will catch import errors at compile time |
| bun | (current) | Package manager & runtime | Project requirement per CLAUDE.md |

### Supporting
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| git | (system) | Version control | Restoring original OopsBudgeter component versions |
| grep/ripgrep | (system) | Import search | Finding all import statements to rewrite |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual file moves | Automated refactoring tools (jscodeshift) | Manual is safer for one-time operation, automation adds dependency risk |
| Import rewiring | Path alias changes only | Import rewiring is explicit, path aliases could mask intent |

**Installation:**
```bash
# No new packages needed - all tools already present
bun install  # Verify existing dependencies
```

## Architecture Patterns

### Current Component Structure
```
src/components/
├── ui/                    # Radix UI primitives (20 files) — SHARED
├── auth/                  # BetterBudgeter auth (3 files) — NEW
├── dashboard/             # BetterBudgeter dashboard (5 files) — NEW
├── finance/               # BetterBudgeter finance (2 files) — NEW
├── settings/              # BetterBudgeter settings (1 file) — NEW
├── cards/                 # OopsBudgeter cards (3 files) — LEGACY
├── categories/            # OopsBudgeter categories (2 files) — LEGACY
├── common/                # OopsBudgeter common (8 files, 1 modified) — LEGACY
├── effects/               # OopsBudgeter effects (2 files) — LEGACY
├── helpers/               # OopsBudgeter helpers (2 files) — LEGACY
├── providers/             # OopsBudgeter providers (1 file) — LEGACY
├── security/              # OopsBudgeter security (2 files) — LEGACY
├── sorting/               # OopsBudgeter sorting (2 files) — LEGACY
└── transactions/          # OopsBudgeter transactions (7 files) — LEGACY
```

### Target Component Structure (Post-Isolation)
```
src/components/
├── ui/                    # SHARED - Radix UI primitives (no move)
├── auth/                  # BetterBudgeter auth (stays)
├── dashboard/             # BetterBudgeter dashboard (stays)
├── finance/               # BetterBudgeter finance (stays)
├── settings/              # BetterBudgeter settings (stays)
├── common/                # REORGANIZED - BetterBudgeter common (Logo.tsx modified version only)
└── legacy/                # NEW - All original OopsBudgeter components
    ├── cards/             # BalanceCard, InExCard, TxCard
    ├── categories/        # Expense, Income
    ├── common/            # 8 original components including Logo.tsx (restored)
    ├── effects/           # HoverEffect, Sonner
    ├── helpers/           # GoToTop, PageLayout
    ├── providers/         # ThemeProvider
    ├── security/          # PasscodePrompt, PasscodeWrapper
    ├── sorting/           # SortButton, SortButtons
    └── transactions/      # 7 transaction components
```

### Pattern 1: Three-Bucket Classification
**What:** Every component falls into exactly one bucket based on git history and usage analysis.

**When to use:** During the audit phase before any file moves.

**Classification criteria:**
```typescript
// Bucket 1: Unmodified Legacy (48 components)
// - Present in initial commit 5806c14
// - No modifications in git history
// - Only imported by legacy routes (/legacy, /analytics, /achievements)
// ACTION: Move to components/legacy/ preserving directory structure

// Bucket 2: Modified Legacy (1 component: Logo.tsx)
// - Present in initial commit 5806c14
// - Modified for BetterBudgeter branding
// - Used by BOTH legacy routes (via layout.tsx) and new routes
// ACTION: Duplicate - restore original to legacy/, keep modified in main

// Bucket 3: Pure BetterBudgeter (8 components)
// - Added after initial commit
// - Only imported by new routes (/, /dashboard, /link-bank, /settings)
// ACTION: Leave in place, no move
```

**Example audit command:**
```bash
# Check if component existed in initial commit
git ls-tree -r --name-only 5806c14 -- src/components/cards/BalanceCard.tsx

# Check modification history
git log --oneline --follow -- src/components/cards/BalanceCard.tsx

# Find all imports
grep -r "from.*@/components/cards/BalanceCard" src/app/
```

### Pattern 2: Import Chain Mapping
**What:** Map all import dependencies before moving files to identify required rewires.

**When to use:** After classification, before any file moves.

**Import patterns identified:**

```typescript
// PATTERN A: Legacy route → Legacy component (6 direct imports)
// File: src/app/legacy/page.tsx
import BalanceCard from "@/components/cards/BalanceCard";
import Expense from "@/components/categories/Expense";
import Income from "@/components/categories/Income";
import DateRangePicker from "@/components/common/DatePicker";
import NewTransaction from "@/components/transactions/NewTransaction";
import TransactionsList from "@/components/transactions/TransactionsList";

// PATTERN B: Legacy route → Legacy component (via wrapper)
// File: src/app/analytics/page.tsx
import AnalyticsWrapper from "@/components/common/Analytics";

// PATTERN C: Root layout → Shared legacy components (8 imports)
// File: src/app/layout.tsx
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import PasscodeWrapper from "@/components/security/PasscodeWrapper";
import GoToTop from "@/components/helpers/GoToTop";
import Toaster from "@/components/effects/Sonner";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import Logo from "@/components/common/Logo";
import { Settings } from "@/components/common/Settings";
import PageLayout from "@/components/helpers/PageLayout";
import { Achievements } from "@/components/common/Achievements";

// PATTERN D: Component → UI primitive (no change needed)
// File: src/components/transactions/NewTransaction.tsx
import { Button } from "@/components/ui/button";

// PATTERN E: Component → Context (shared, no move)
// File: src/components/cards/BalanceCard.tsx
import { useBudget } from "@/contexts/BudgetContext";
```

**Rewiring strategy:**
- Pattern A & B: Change to `@/components/legacy/*` (legacy routes only)
- Pattern C: Duplicate Logo.tsx, change layout.tsx to import from legacy for shared components
- Pattern D & E: No changes (ui/ and contexts/ are not moving)

### Pattern 3: Barrel Export Preservation
**What:** BetterBudgeter components use barrel exports (`index.ts`), legacy components use direct imports.

**When to use:** When organizing post-isolation structure.

**Current barrel exports:**
```typescript
// src/components/auth/index.ts
export { default as LoginForm } from "./LoginForm";
export { default as SignOutButton } from "./SignOutButton";

// src/components/dashboard/index.ts
export { SyncTransactionsButton } from "./SyncTransactionsButton";
export { BudgetProgressSection } from "./BudgetProgressSection";
export { SpendingByCategoryChart } from "./SpendingByCategoryChart";
export { BudgetNotificationDialogs } from "./BudgetNotificationDialogs";

// src/components/finance/index.ts
export { LinkBankFlow } from "./LinkBankFlow";
```

**Legacy import pattern (no barrel exports):**
```typescript
// Direct imports - no index.ts files
import BalanceCard from "@/components/cards/BalanceCard";
```

**Decision:** Do NOT add barrel exports to legacy components. Preserve original import patterns for authenticity.

### Anti-Patterns to Avoid

- **Moving ui/ components:** These are Radix UI primitives, shared by both apps. Moving them breaks BetterBudgeter imports.
- **Moving contexts/:** BudgetContext and AppContext are shared infrastructure. Legacy components depend on them.
- **Renaming files during move:** `BalanceCard.tsx` → `LegacyBalanceCard.tsx` breaks git history tracking and adds cognitive load.
- **Changing import styles:** Don't convert legacy direct imports to barrel exports "for consistency." Preserve original patterns.
- **Forgetting layout.tsx:** Root layout imports 8 legacy components. These need special handling (see Logo.tsx duplication pattern).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding all import statements | Manual grep with regex | `grep -r "from.*@/components" src/` | Misses edge cases (dynamic imports, multiline) |
| Checking file modification history | Comparing file contents | `git log --follow` | Git tracks renames and shows true history |
| Verifying no circular imports | Manual inspection | `bun run typecheck` | TypeScript compiler catches circular deps |
| Testing route functionality | Manual browser testing | Existing test suite + visual verification | Tests provide regression safety |

**Key insight:** File moves are low-risk when TypeScript compiler is used for verification. If `bun run typecheck` passes, imports are correct.

## Common Pitfalls

### Pitfall 1: Forgetting Root Layout Dependencies
**What goes wrong:** Moving legacy components breaks root layout (app/layout.tsx) which imports 8 legacy components globally.

**Why it happens:** Layout.tsx wraps ALL routes (both legacy and new). It's easy to focus on route-specific imports and miss the global wrapper.

**How to avoid:**
1. Audit layout.tsx imports FIRST before any moves
2. Identify which components are truly shared (used by both apps)
3. For shared components with modifications (Logo.tsx), use duplication strategy
4. Update layout.tsx imports to point to legacy/ for unmodified shared components

**Warning signs:**
- Error: `Module not found: Can't resolve '@/components/helpers/GoToTop'`
- Happening in root layout, not a specific route
- Affects both legacy and new routes simultaneously

### Pitfall 2: Breaking Git History with Renames
**What goes wrong:** Renaming files during move (e.g., `BalanceCard.tsx` → `LegacyBalanceCard.tsx`) breaks `git log --follow` tracking.

**Why it happens:** Desire for explicit naming ("LegacyBalanceCard" is clearer than "BalanceCard in legacy/ folder").

**How to avoid:**
- Use `git mv` for all file moves (preserves history)
- Keep original filenames unchanged
- Let directory structure (`legacy/cards/BalanceCard.tsx`) provide context
- Add comments to files if needed: `/** Original OopsBudgeter BalanceCard */`

**Warning signs:**
- `git log --follow src/components/legacy/cards/BalanceCard.tsx` shows only 1 commit (the move)
- Unable to restore original version from git history
- Blame annotations lost

### Pitfall 3: Moving Files Before Mapping Imports
**What goes wrong:** Moving components breaks imports you didn't know existed (e.g., component-to-component imports, not just route-to-component).

**Why it happens:** Focus on route imports, forgetting that components import other components.

**How to avoid:**
1. Run comprehensive import search BEFORE any moves:
   ```bash
   grep -r "from.*@/components" src/components/ src/app/
   ```
2. Map ALL import chains, not just top-level route imports
3. Identify internal component dependencies (e.g., `Expense.tsx` imports `InExCard.tsx`)
4. Create move order: files with zero internal imports first, dependent files later

**Warning signs:**
- Build breaks with "Module not found" from within components/ directory
- Error traces show component → component import, not route → component
- TypeScript errors in files you didn't think would be affected

### Pitfall 4: Forgetting the "Shared by Both Apps" Case
**What goes wrong:** Moving a component used by BOTH legacy and new apps breaks one of them.

**Why it happens:** Assuming clean separation when root layout creates implicit sharing.

**Components affected:**
- Logo.tsx (modified, used in layout by both apps)
- GoToTop, PageLayout, ThemeToggle, Settings, Achievements (unmodified, used in layout by both apps)
- ThemeProvider, PasscodeWrapper, Sonner (infrastructure, used in layout by both apps)

**How to avoid:**
1. Identify layout.tsx dependencies as "special case"
2. For unmodified shared components: move to legacy/, update layout.tsx import
3. For modified shared component (Logo.tsx): duplicate, restore original to legacy/, keep modified version
4. Document in code comments why duplication exists

**Warning signs:**
- Both `/legacy` and `/` break simultaneously
- Error in layout.tsx, not in specific route
- Component is imported by both old and new routes

### Pitfall 5: TypeScript Path Alias Caching
**What goes wrong:** After moving files and updating imports, TypeScript still shows old errors or doesn't recognize new paths.

**Why it happens:** TypeScript language server caches module resolution. File moves invalidate cache.

**How to avoid:**
1. After file moves: delete `tsconfig.tsbuildinfo`
2. Restart TypeScript language server (VS Code: Cmd+Shift+P → "TypeScript: Restart TS Server")
3. Run fresh build: `bun run typecheck`

**Warning signs:**
- Imports look correct but TypeScript shows "Cannot find module" errors
- Autocomplete suggests old paths
- Build succeeds but IDE shows errors

## Code Examples

### Example 1: Auditing Component Classification
```bash
# Check if component existed in initial OopsBudgeter import
git ls-tree -r --name-only 5806c14 -- src/components/cards/BalanceCard.tsx
# Output: src/components/cards/BalanceCard.tsx (exists = legacy candidate)

# Check modification history
git log --oneline --follow -- src/components/cards/BalanceCard.tsx
# Output:
# 5806c14 Initial commit (baseline: oopsbudgeter import)
# (only 1 commit = unmodified legacy)

# Find all imports to determine usage
grep -r "BalanceCard" src/app/
# Output:
# src/app/legacy/page.tsx:import BalanceCard from "@/components/cards/BalanceCard";
# (only legacy route imports it = Bucket 1: Unmodified Legacy)
```

### Example 2: Restoring Modified Component Original
```bash
# Logo.tsx was modified (commit c9e96b1) - restore original for legacy/
git show 5806c14:src/components/common/Logo.tsx > src/components/legacy/common/Logo.tsx

# Verify restoration
git diff 5806c14:src/components/common/Logo.tsx src/components/legacy/common/Logo.tsx
# (should show no diff)

# Keep modified version in main structure for BetterBudgeter
# (already exists at src/components/common/Logo.tsx - no action needed)
```

### Example 3: Safe File Move with Git History Preservation
```bash
# Create target directory structure
mkdir -p src/components/legacy/cards

# Move file using git mv (preserves history)
git mv src/components/cards/BalanceCard.tsx src/components/legacy/cards/BalanceCard.tsx

# Verify history preserved
git log --follow src/components/legacy/cards/BalanceCard.tsx
# Output should show full history including pre-move commits
```

### Example 4: Import Rewiring in Legacy Route
```typescript
// BEFORE (src/app/legacy/page.tsx)
import BalanceCard from "@/components/cards/BalanceCard";
import Expense from "@/components/categories/Expense";
import Income from "@/components/categories/Income";
import DateRangePicker from "@/components/common/DatePicker";
import NewTransaction from "@/components/transactions/NewTransaction";
import TransactionsList from "@/components/transactions/TransactionsList";

// AFTER (src/app/legacy/page.tsx)
import BalanceCard from "@/components/legacy/cards/BalanceCard";
import Expense from "@/components/legacy/categories/Expense";
import Income from "@/components/legacy/categories/Income";
import DateRangePicker from "@/components/legacy/common/DatePicker";
import NewTransaction from "@/components/legacy/transactions/NewTransaction";
import TransactionsList from "@/components/legacy/transactions/TransactionsList";

// Pattern: Add "/legacy" after "@/components", before specific directory
```

### Example 5: Verification After Move
```bash
# 1. TypeScript compilation check
bun run typecheck
# Expected: No errors

# 2. Build check
bun run build
# Expected: Build succeeds

# 3. Find any remaining old imports (should return nothing)
grep -r "from.*@/components/cards" src/app/
# Expected: No matches (or only ui/ directory matches)

# 4. Visual verification
bun dev
# Navigate to /legacy, /analytics, /achievements
# Expected: All legacy routes render correctly with no console errors
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Monolithic `components/` mixing legacy and new | Structural separation via `components/legacy/` | This phase (2026-01) | Mental clarity, prevents accidental legacy modification |
| Implicit "don't touch" understanding | Explicit directory boundary | This phase (2026-01) | Junior devs can navigate safely, clear ownership |
| Mixed import patterns | Consistent `@/components/legacy/*` for old code | This phase (2026-01) | Import path reveals component provenance |

**Deprecated/outdated:**
- None - This is the initial isolation, no prior separation strategy existed

## Open Questions

1. **Should `components/ui/` be renamed to `components/shared/ui/` for explicitness?**
   - What we know: ui/ components are used by both apps
   - What's unclear: Whether explicit "shared" namespace adds clarity or just verbosity
   - Recommendation: Leave as-is for now. ui/ is already understood as shared (Radix primitives). Can rename later if confusion arises.

2. **How should shared context dependencies be documented?**
   - What we know: Legacy components depend on BudgetContext and AppContext
   - What's unclear: Whether contexts should move, be duplicated, or stay shared
   - Recommendation: Keep contexts shared (they're in `src/contexts/`, not `src/components/`). Add code comment in legacy components: `// Shared context - used by both legacy and new apps`

3. **Should barrel exports be added to legacy/ for consistency?**
   - What we know: BetterBudgeter uses barrel exports, legacy uses direct imports
   - What's unclear: Whether preserving original patterns or standardizing is better
   - Recommendation: Preserve original patterns (no barrel exports in legacy/). Consistency isn't always better than authenticity for legacy code.

## Sources

### Primary (HIGH confidence)
- Codebase direct analysis (component file count, git history, import tracing)
- Git history (`git log`, `git show`, `git ls-tree` commands on commit 5806c14)
- Project documentation (CLAUDE.md, .claude/rules/*.md, docs/*.md)
- TypeScript configuration (tsconfig.json path alias `@/*`)
- Package.json scripts (bun as package manager, typecheck script)

### Secondary (MEDIUM confidence)
- Next.js App Router conventions (module resolution, import patterns)
- Common refactoring patterns (file moves, import rewiring)

### Tertiary (LOW confidence)
- None - all findings based on direct codebase analysis

## Metadata

**Confidence breakdown:**
- Component classification: HIGH - Direct git history analysis shows exact lineage
- Import chain mapping: HIGH - Grep analysis found all import statements
- File move safety: HIGH - Git mv + TypeScript compiler provide verification
- Shared component handling: MEDIUM - Layout.tsx dependencies require careful testing

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - stable codebase, no fast-moving external dependencies)

## Verification Checklist

Before starting implementation, verify:

- [ ] All 60 component files accounted for (49 legacy + 8 new + 20 ui/ + 1 modified + 2 contexts)
- [ ] Import chain map covers app/ AND components/ directories (not just routes)
- [ ] Git history restoration tested for Logo.tsx (can retrieve original)
- [ ] Layout.tsx dependencies identified (8 legacy component imports)
- [ ] TypeScript path alias understood (`@/*` maps to `src/*`)
- [ ] Barrel export pattern confirmed (auth/, dashboard/, finance/ have index.ts)
- [ ] Build/typecheck commands verified (`bun run typecheck`, `bun run build`)

## Component Inventory (Reference)

**Bucket 1: Unmodified Legacy (48 components)** → Move to `components/legacy/`

Cards (3):
- BalanceCard.tsx, InExCard.tsx, TxCard.tsx

Categories (2):
- Expense.tsx, Income.tsx

Common (7 of 8):
- Achievements.tsx, AchievementsWrapper.tsx, Analytics.tsx, Currency.tsx, DatePicker.tsx, Settings.tsx, ThemeToggle.tsx

Effects (2):
- HoverEffect.tsx, Sonner.tsx

Helpers (2):
- GoToTop.tsx, PageLayout.tsx

Providers (1):
- ThemeProvider.tsx

Security (2):
- PasscodePrompt.tsx, PasscodeWrapper.tsx

Sorting (2):
- SortButton.tsx, SortButtons.tsx

Transactions (7):
- DeleteTransactionDialog.tsx, EditTransactionDialog.tsx, InconsistencePrompt.tsx, NewTransaction.tsx, RecurringStatusDialog.tsx, SingleTransaction.tsx, TransactionsList.tsx

UI (20):
- alert-dialog.tsx, button.tsx, calendar.tsx, card.tsx, chart.tsx, context-menu.tsx, date.tsx, dialog.tsx, drawer.tsx, form.tsx, input-otp.tsx, input.tsx, label.tsx, popover.tsx, scroll-area.tsx, select.tsx, sonner.tsx, switch.tsx, textarea.tsx, tooltip.tsx

**Bucket 2: Modified Legacy (1 component)** → Duplicate (restore to `legacy/`, keep modified)

Common (1 of 8):
- Logo.tsx (commit c9e96b1: "OopsBudgeter" → "BetterBudgeter" text change)

**Bucket 3: Pure BetterBudgeter (8 components)** → Stay in place

Auth (3):
- index.ts, LoginForm.tsx, SignOutButton.tsx

Dashboard (5):
- index.ts, BudgetNotificationDialogs.tsx, BudgetProgressSection.tsx, SpendingByCategoryChart.tsx, SyncTransactionsButton.tsx

Finance (2):
- index.ts, LinkBankFlow.tsx

Settings (1):
- BudgetSettings.tsx

**Shared Infrastructure (Not Moving):**
- src/contexts/BudgetContext.tsx
- src/contexts/AppContext.tsx
- src/components/ui/* (20 Radix UI primitives)
