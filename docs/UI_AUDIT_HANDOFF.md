# UI Audit & Handoff Documentation

**Created:** 2026-02-03
**Last verified:** 2026-02-03
**Purpose:** Rapid context restoration and UI/UX redesign decision support

---

## Related Documentation

- [UI_ARCHITECTURE.md](./UI_ARCHITECTURE.md) - Library decisions, chart patterns, and Sonner usage
- [CLAUDE.md](../CLAUDE.md) - Project rules, UI library boundaries, and ADHD design principles

---

## Quick Start

**Read this section to get oriented in under 10 minutes.**

### Current State Summary

- **Milestone complete:** UI Cleanup & Redesign Preparation (Phases 1-4)
- **Library stack established:** shadcn/ui (primary), Base UI (available), Radix UI (legacy frozen)
- **Legacy isolation done:** All OopsBudgeter components moved to `components/legacy/`
- **Tremor removed:** Completely removed, migrated to shadcn/ui charts
- **Documentation centralized:** Single `docs/UI_ARCHITECTURE.md` for library reference
- **9 routes total:** 1 redesign-target, 3 active, 5 legacy (including redirect)

### Key Constraints (Cannot Change)

1. **Legacy zone is frozen** - Components in `components/legacy/` must not be modified or extended
2. **Library boundaries are strict** - See [UI_ARCHITECTURE.md](./UI_ARCHITECTURE.md) for rules
3. **Auth flow must remain** - Supabase Auth via `/login` is locked
4. **Radix UI only for legacy** - BetterBudgeter components must never import from `@radix-ui` directly

### Primary Redesign Target

**Dashboard (`/`)** - The main landing page is the primary candidate for UI/UX restructuring.

### What This Document Enables

Use this document to make an informed decision about:
- Single-page dashboard vs multi-page architecture
- Component redesign priorities based on complexity
- Understanding the boundary between legacy and active code

---

## Component Inventory

Sort order: REDESIGN-TARGET first, ACTIVE second, LEGACY last.

**Complexity criteria:**
- **simple:** < 100 LOC, single responsibility, no external state
- **moderate:** 100-300 LOC OR multiple concerns OR external state
- **complex:** > 300 LOC OR multiple concerns AND external state

### Active BetterBudgeter Components

| Component | Library | Location | Status | LOC | Complexity |
|-----------|---------|----------|--------|-----|------------|
| BudgetProgressSection | Tailwind | dashboard/ | REDESIGN-TARGET | 153 | moderate |
| SpendingByCategoryChart | shadcn/ui + Recharts | dashboard/ | REDESIGN-TARGET | 195 | moderate |
| SyncTransactionsButton | shadcn/ui + Sonner | dashboard/ | REDESIGN-TARGET | 219 | moderate |
| BudgetNotificationDialogs | shadcn/ui | dashboard/ | REDESIGN-TARGET | 311 | complex |
| BudgetSettings | shadcn/ui + Sonner | settings/ | ACTIVE | 210 | moderate |
| LoginForm | shadcn/ui + Sonner | auth/ | ACTIVE | 235 | moderate |
| SignOutButton | shadcn/ui + Sonner | auth/ | ACTIVE | 90 | simple |
| LinkBankFlow | shadcn/ui | finance/ | ACTIVE | 334 | complex |
| Logo | Tailwind | common/ | ACTIVE | 43 | simple |

### shadcn/ui Primitives (Active)

| Component | Location | Status | Notes |
|-----------|----------|--------|-------|
| alert-dialog | ui/ | ACTIVE | Used by BudgetNotificationDialogs |
| button | ui/ | ACTIVE | Primary action component |
| calendar | ui/ | ACTIVE | Date selection |
| card | ui/ | ACTIVE | Content containers |
| chart | ui/ | ACTIVE | Recharts wrapper (ChartContainer) |
| context-menu | ui/ | ACTIVE | Right-click menus |
| date | ui/ | ACTIVE | Date display |
| dialog | ui/ | ACTIVE | Modal dialogs |
| drawer | ui/ | ACTIVE | Slide-out panels |
| form | ui/ | ACTIVE | Form handling |
| input-otp | ui/ | ACTIVE | OTP input |
| input | ui/ | ACTIVE | Text input |
| label | ui/ | ACTIVE | Form labels |
| popover | ui/ | ACTIVE | Floating content |
| scroll-area | ui/ | ACTIVE | Scrollable containers |
| select | ui/ | ACTIVE | Dropdown selection |
| sonner | ui/ | ACTIVE | Toast configuration |
| switch | ui/ | ACTIVE | Toggle switches |
| textarea | ui/ | ACTIVE | Multi-line text input |
| tooltip | ui/ | ACTIVE | Hover tooltips |

### Legacy OopsBudgeter Components

| Component | Location | Status | LOC | Complexity |
|-----------|----------|--------|-----|------------|
| Analytics | legacy/common/ | LEGACY | 592 | complex |
| Settings | legacy/common/ | LEGACY | 260 | complex |
| NewTransaction | legacy/transactions/ | LEGACY | 468 | complex |
| EditTransactionDialog | legacy/transactions/ | LEGACY | 203 | moderate |
| SingleTransaction | legacy/transactions/ | LEGACY | 183 | moderate |
| RecurringStatusDialog | legacy/transactions/ | LEGACY | 141 | moderate |
| Currency | legacy/common/ | LEGACY | 138 | moderate |
| DeleteTransactionDialog | legacy/transactions/ | LEGACY | 120 | moderate |
| PasscodePrompt | legacy/security/ | LEGACY | 118 | moderate |
| TransactionsList | legacy/transactions/ | LEGACY | 103 | moderate |
| AchievementsWrapper | legacy/common/ | LEGACY | 84 | simple |
| SortButtons | legacy/sorting/ | LEGACY | 83 | simple |
| HoverEffect | legacy/effects/ | LEGACY | 81 | simple |
| InExCard | legacy/cards/ | LEGACY | 81 | simple |
| InconsistencePrompt | legacy/transactions/ | LEGACY | 79 | simple |
| SortButton | legacy/sorting/ | LEGACY | 76 | simple |
| BalanceCard | legacy/cards/ | LEGACY | 73 | simple |
| GoToTop | legacy/helpers/ | LEGACY | 73 | simple |
| DatePicker | legacy/common/ | LEGACY | 61 | simple |
| PasscodeWrapper | legacy/security/ | LEGACY | 61 | simple |
| TxCard | legacy/cards/ | LEGACY | 53 | simple |
| Sonner | legacy/effects/ | LEGACY | 52 | simple |
| ThemeToggle | legacy/common/ | LEGACY | 49 | simple |
| Logo | legacy/common/ | LEGACY | 48 | simple |
| PageLayout | legacy/helpers/ | LEGACY | 42 | simple |
| Expense | legacy/categories/ | LEGACY | 38 | simple |
| Income | legacy/categories/ | LEGACY | 38 | simple |
| Achievements | legacy/common/ | LEGACY | 37 | simple |
| ThemeProvider | legacy/providers/ | LEGACY | 28 | simple |

**Total:** 9 active BB components + 20 shadcn/ui primitives + 29 legacy components = 58 components

---

## Boundary Maps

### Folder Structure

```
src/components/
├── dashboard/                # REDESIGN-TARGET: Primary redesign focus
│   ├── BudgetNotificationDialogs.tsx   [complex]
│   ├── BudgetProgressSection.tsx       [moderate]
│   ├── SpendingByCategoryChart.tsx     [moderate]
│   ├── SyncTransactionsButton.tsx      [moderate]
│   └── index.ts
│
├── settings/                 # ACTIVE: Budget configuration
│   └── BudgetSettings.tsx              [moderate]
│
├── auth/                     # ACTIVE: Authentication UI
│   ├── LoginForm.tsx                   [moderate]
│   └── SignOutButton.tsx               [simple]
│
├── finance/                  # ACTIVE: Bank linking
│   └── LinkBankFlow.tsx                [complex]
│
├── common/                   # ACTIVE: Shared components
│   └── Logo.tsx                        [simple]
│
├── ui/                       # ACTIVE: shadcn/ui primitives
│   ├── alert-dialog.tsx
│   ├── button.tsx
│   ├── card.tsx
│   ├── chart.tsx
│   └── ... (20 components)
│
└── legacy/                   # LEGACY: DO NOT MODIFY
    ├── cards/                          [simple]
    │   ├── BalanceCard.tsx
    │   ├── InExCard.tsx
    │   └── TxCard.tsx
    ├── categories/                     [simple]
    │   ├── Expense.tsx
    │   └── Income.tsx
    ├── common/                         [simple-complex]
    │   ├── Achievements.tsx
    │   ├── AchievementsWrapper.tsx
    │   ├── Analytics.tsx               [complex]
    │   ├── Currency.tsx
    │   ├── DatePicker.tsx
    │   ├── Logo.tsx
    │   ├── Settings.tsx                [complex]
    │   └── ThemeToggle.tsx
    ├── effects/                        [simple]
    │   ├── HoverEffect.tsx
    │   └── Sonner.tsx
    ├── helpers/                        [simple]
    │   ├── GoToTop.tsx
    │   └── PageLayout.tsx
    ├── providers/                      [simple]
    │   └── ThemeProvider.tsx
    ├── security/                       [simple-moderate]
    │   ├── PasscodePrompt.tsx
    │   └── PasscodeWrapper.tsx
    ├── sorting/                        [simple]
    │   ├── SortButton.tsx
    │   └── SortButtons.tsx
    └── transactions/                   [moderate-complex]
        ├── DeleteTransactionDialog.tsx
        ├── EditTransactionDialog.tsx
        ├── InconsistencePrompt.tsx
        ├── NewTransaction.tsx          [complex]
        ├── RecurringStatusDialog.tsx
        ├── SingleTransaction.tsx
        └── TransactionsList.tsx
```

### Route Architecture

```mermaid
flowchart TB
    subgraph "REDESIGN-TARGET"
        DASH["/ (Dashboard)"]
    end

    subgraph "ACTIVE"
        SETTINGS["/settings"]
        LINKBANK["/link-bank"]
        LOGIN["/login"]
    end

    subgraph "LEGACY"
        LEGACY["/legacy"]
        ANALYTICS["/analytics"]
        ACHIEVEMENTS["/achievements"]
        LEGACYINDEX["/legacy-index"]
    end

    subgraph "REDIRECT"
        DASHOLD["/dashboard"]
    end

    DASHOLD -->|"308 redirect"| DASH

    style DASH fill:#10b981,color:#fff
    style SETTINGS fill:#3b82f6,color:#fff
    style LINKBANK fill:#3b82f6,color:#fff
    style LOGIN fill:#3b82f6,color:#fff
    style LEGACY fill:#f59e0b,color:#fff
    style ANALYTICS fill:#f59e0b,color:#fff
    style ACHIEVEMENTS fill:#f59e0b,color:#fff
    style LEGACYINDEX fill:#f59e0b,color:#fff
    style DASHOLD fill:#6b7280,color:#fff
```

### Route Details

| Route | Purpose | Zone | Components Used |
|-------|---------|------|-----------------|
| `/` | BetterBudget main dashboard | REDESIGN-TARGET | BudgetProgressSection, SpendingByCategoryChart, SyncTransactionsButton, BudgetNotificationDialogs |
| `/dashboard` | Redirect to `/` | REDIRECT | (none - HTTP 308) |
| `/settings` | User preferences, budget configuration | ACTIVE | BudgetSettings |
| `/link-bank` | PSD2-style bank linking flow | ACTIVE | LinkBankFlow |
| `/login` | Supabase authentication | ACTIVE | LoginForm |
| `/legacy` | OopsBudgeter dashboard | LEGACY | Legacy components |
| `/analytics` | Legacy charts and reports | LEGACY | Analytics |
| `/achievements` | Legacy gamification | LEGACY | Achievements, AchievementsWrapper |
| `/legacy-index` | Navigation to legacy routes | LEGACY | (links only) |

---

## ADHD UX Evaluation

Evaluation based on ADHD design principles from [CLAUDE.md](../CLAUDE.md) UX Philosophy section.

### Principle 1: Few Elements, High Signal

**Current:** NEEDS-WORK

**Evidence:**
- Dashboard (`/`) displays 7 sections simultaneously: header, balance card, income/expense cards, budget progress, spending chart, linked accounts, recent transactions
- Each section competes for attention on initial page load
- BudgetNotificationDialogs adds modal interruption on top of dense page

**Positive aspects:**
- SpendingByCategoryChart uses single donut (not multiple charts)
- Budget progress uses traffic light colors for quick visual scanning
- Only 1 chart displayed (spending by category) - not overwhelming

**Redesign opportunity:** Consider breaking dashboard into focused views or progressive disclosure

---

### Principle 2: Clear Defaults, Minimal Configuration

**Current:** GOOD

**Evidence:**
- Budget tracking requires explicit setup in `/settings` but provides clear empty state with CTA
- No overwhelming settings pages - single BudgetSettings component
- SyncTransactionsButton provides single action (sync all) not per-account configuration
- Import runs with sensible defaults (all accounts, all transactions)

**Positive aspects:**
- Empty states guide users with clear CTAs
- No complex multi-step wizards
- Settings page is focused (budget only, not cluttered)

---

### Principle 3: Avoid Visual Noise

**Current:** NEEDS-WORK

**Evidence:**
- Dashboard page is ~348 lines including all sections inline
- Multiple card styles mixed (bordered, dashed border for empty states, colored for budget status)
- Debug info at page bottom adds unnecessary cognitive load
- Linked Accounts and Recent Transactions lists could become long

**Positive aspects:**
- Consistent use of muted colors for secondary text
- Clear visual hierarchy (h1 > h2 > body text)
- Minimal use of icons (only in SyncTransactionsButton)

**Redesign opportunity:** Consider hiding debug info in production, paginating lists, or moving secondary data to separate views

---

### Principle 4: Prefer Summaries Over Raw Tables

**Current:** GOOD

**Evidence:**
- Balance shown as single aggregate number across accounts
- Income/Expenses shown as totals, not transaction-by-transaction
- Spending chart provides visual summary instead of category table
- Budget progress uses visual bars, not number-only display

**Positive aspects:**
- SpendingByCategoryChart limits legend to 6 items
- BudgetProgressSection shows only set budgets (not all possible categories)
- Recent Transactions limited to 5 most recent

---

### Principle 5: Empty States Must Guide Users

**Current:** GOOD

**Evidence:**
- "No Banks Linked" state provides clear CTA (SyncTransactionsButton shows "Link a Bank")
- "No transactions yet" state explains how to import
- BudgetProgressSection empty state links to `/settings` with "Set up budgets" CTA
- SpendingByCategoryChart empty state explains what to do ("Import transactions")

**Positive aspects:**
- All empty states tested and implemented
- Consistent pattern: explanation + action button/link
- No blank screens without guidance

---

### Redesign Opportunities Summary

Prioritized by impact on ADHD cognitive load reduction:

1. **Dashboard information density** (HIGH IMPACT)
   - 7 sections on one page creates cognitive overload
   - Consider: dedicated Budget view, Transactions view, Accounts view
   - Or: progressive disclosure (collapsed sections, expand on click)

2. **Remove debug info from production** (MEDIUM IMPACT)
   - User ID and transaction count shown at page bottom
   - Should be dev-only or moved to a hidden details panel

3. **List pagination/limits** (MEDIUM IMPACT)
   - Linked Accounts and Recent Transactions could grow unbounded
   - Consider: hard limits with "See all" links

4. **Modal timing for BudgetNotificationDialogs** (LOW IMPACT)
   - Dialogs appear immediately on dashboard load
   - Consider: delay or user-initiated notifications view

5. **Visual consistency** (LOW IMPACT)
   - Mix of card styles (bordered, dashed, colored)
   - Consider: unified card component with variants

---

## Figma Handoff Notes

### Design Constraints

**Technical:**
- **UI library:** shadcn/ui components (Tailwind CSS-based)
- **Charts:** Recharts via shadcn/ui ChartContainer
- **Notifications:** Sonner toasts (already configured)
- **Auth:** Supabase Auth flow (login page structure fixed)

**Boundaries:**
- **Legacy zone frozen:** Cannot redesign `/legacy`, `/analytics`, `/achievements`
- **Library rules:** No Radix UI direct imports in new components
- **Component reuse:** 20 shadcn/ui primitives available (see Component Inventory)

### Visual Baseline Reference

**Colors:**
- CSS custom properties defined in `src/app/globals.css`
- Theme supports light/dark mode via CSS variables
- Primary semantic colors: green (income/success), red (expense/error), amber (warning)

**Chart colors:**
- Defined in `src/utils/charts/index.ts` as `CATEGORY_COLORS`
- Expense categories: red, orange, yellow, green, blue, violet, gray
- Income categories: emerald, teal, cyan, sky
- See [UI_ARCHITECTURE.md](./UI_ARCHITECTURE.md) Chart Color System section for details

**Typography:**
- Tailwind defaults (system fonts)
- Heading sizes: text-2xl (h1), font-semibold (h2), text-sm (secondary)
- Muted text: text-muted-foreground class

### Dashboard Focus Areas

**Primary redesign target:** `/` (main dashboard)

**Current dashboard sections:**
1. Page Header (title, description, user actions)
2. User email display
3. Balance Card (total across accounts)
4. Income/Expense Cards (totals)
5. Budget Progress (traffic light feedback)
6. Spending by Category Chart (donut)
7. Linked Accounts list
8. Recent Transactions list
9. Debug Info (dev only, should be hidden)

**Key question:** Single-page dashboard vs multi-page architecture?

**Candidate pages if splitting:**
- **Home/Overview:** Balance, quick stats, budget alerts only
- **Budget:** Budget Progress, Spending by Category (category focus)
- **Transactions:** Recent Transactions, full transaction list (transaction focus)
- **Accounts:** Linked Accounts, sync controls (account focus)

### Decision Support Matrix

| Aspect | Single-Page | Multi-Page |
|--------|-------------|------------|
| **ADHD Impact** | Higher cognitive load (7 sections visible) | Lower load per page (focused views) |
| **Navigation Complexity** | None (scroll-based) | Requires navigation UI (tabs/sidebar) |
| **Development Effort** | Lower (current state) | Higher (new routes, nav component) |
| **User Context Switching** | Low (all data visible) | Higher (switch between pages) |
| **Mobile UX** | Poor (long scroll) | Better (focused screens) |
| **Information Access** | Immediate (everything visible) | Requires navigation clicks |
| **Maintenance** | Single page.tsx file | Multiple page files, shared components |

**Recommendation approach:** This matrix provides factors for decision-making. The choice depends on:
- How often users need to see all data at once vs focused views
- Team capacity for additional development
- Whether mobile support is a priority

---

## Document Maintenance

**When to update this document:**
- After adding/removing components in `src/components/`
- After route changes in `src/app/`
- After significant UI/UX changes to dashboard
- At least quarterly to verify accuracy

**Verification steps:**
1. Run `find src/components -name "*.tsx" | wc -l` and compare to Total count
2. Verify route list against `src/app/` directories
3. Spot-check 3-5 LOC counts against actual files
