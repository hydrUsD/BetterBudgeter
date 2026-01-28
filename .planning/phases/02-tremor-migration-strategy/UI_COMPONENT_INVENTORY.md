# UI Component Inventory

**Created:** 2026-01-28
**Phase:** 02-ui-library-strategy
**Purpose:** Complete mapping of every UI component to its source library

---

## Summary

| Category | Count | Libraries Used |
|----------|-------|----------------|
| shadcn/ui components | 20 | Radix UI primitives, React Day Picker, Vaul, Sonner |
| BetterBudgeter custom | 9 | shadcn/ui, Tremor (1 to migrate) |
| Legacy OopsBudgeter | 29 | shadcn/ui wrappers, Recharts, iconify, next-themes |
| Charts | 2 files | Tremor (TO MIGRATE), Recharts (FROZEN) |

**Migration required:** 1 component (SpendingByCategoryChart.tsx uses Tremor DonutChart)

---

## 1. shadcn/ui Components

All installed shadcn/ui components in `src/components/ui/`:

| Component | File | Underlying Primitive | Used By |
|-----------|------|---------------------|---------|
| alert-dialog | alert-dialog.tsx | @radix-ui/react-alert-dialog | BudgetNotificationDialogs, legacy DeleteTransactionDialog |
| button | button.tsx | @radix-ui/react-slot | Multiple (auth, dashboard, settings, finance) |
| calendar | calendar.tsx | react-day-picker | Internal (date component) |
| card | card.tsx | Native div | LinkBankFlow |
| chart | chart.tsx | recharts | Not yet used (will replace Tremor) |
| context-menu | context-menu.tsx | @radix-ui/react-context-menu | Legacy SingleTransaction |
| date | date.tsx | Native input + Calendar | Internal |
| dialog | dialog.tsx | @radix-ui/react-dialog | Legacy Edit/RecurringStatus/InconsistencePrompt dialogs |
| drawer | drawer.tsx | vaul | Legacy NewTransaction |
| form | form.tsx | react-hook-form + @radix-ui/react-label + @radix-ui/react-slot | Legacy NewTransaction |
| input-otp | input-otp.tsx | input-otp library | Legacy PasscodePrompt |
| input | input.tsx | Native input | Multiple (auth, settings, legacy) |
| label | label.tsx | @radix-ui/react-label | Multiple (settings, legacy) |
| popover | popover.tsx | @radix-ui/react-popover | Not directly used |
| scroll-area | scroll-area.tsx | @radix-ui/react-scroll-area | Legacy NewTransaction |
| select | select.tsx | @radix-ui/react-select | Legacy Edit/NewTransaction dialogs |
| sonner | sonner.tsx | sonner library | Toast notifications (multiple) |
| switch | switch.tsx | @radix-ui/react-switch | Not directly used |
| textarea | textarea.tsx | Native textarea | Legacy NewTransaction |
| tooltip | tooltip.tsx | @radix-ui/react-tooltip | Legacy SortButton, Currency |

**Total:** 20 shadcn/ui components

---

## 2. BetterBudgeter Custom Components

Components built specifically for BetterBudgeter:

### Dashboard Components (`src/components/dashboard/`)

| Component | File | Libraries Used | Status |
|-----------|------|----------------|--------|
| SpendingByCategoryChart | SpendingByCategoryChart.tsx | **Tremor DonutChart** | TO MIGRATE |
| BudgetNotificationDialogs | BudgetNotificationDialogs.tsx | shadcn/ui AlertDialog | OK |
| BudgetProgressSection | BudgetProgressSection.tsx | Native (Tailwind only) | OK |
| SyncTransactionsButton | SyncTransactionsButton.tsx | shadcn/ui Button, sonner | OK |

### Auth Components (`src/components/auth/`)

| Component | File | Libraries Used | Status |
|-----------|------|----------------|--------|
| LoginForm | LoginForm.tsx | shadcn/ui Button, Input, Label, sonner | OK |
| SignOutButton | SignOutButton.tsx | shadcn/ui Button, sonner | OK |

### Finance Components (`src/components/finance/`)

| Component | File | Libraries Used | Status |
|-----------|------|----------------|--------|
| LinkBankFlow | LinkBankFlow.tsx | shadcn/ui Button, Card | OK |

### Settings Components (`src/components/settings/`)

| Component | File | Libraries Used | Status |
|-----------|------|----------------|--------|
| BudgetSettings | BudgetSettings.tsx | shadcn/ui Button, Input, Label, sonner | OK |

### Common Components (`src/components/common/`)

| Component | File | Libraries Used | Status |
|-----------|------|----------------|--------|
| Logo | Logo.tsx | next/image, next-themes | OK |

**Total:** 9 BetterBudgeter components (1 needs migration)

---

## 3. Legacy OopsBudgeter Components

All components in `src/components/legacy/` - FROZEN, no shadcn/ui adoption planned.

### Security (`src/components/legacy/security/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| PasscodePrompt | PasscodePrompt.tsx | shadcn/ui InputOtp |
| PasscodeWrapper | PasscodeWrapper.tsx | PasscodePrompt (internal) |

### Cards (`src/components/legacy/cards/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| BalanceCard | BalanceCard.tsx | iconify, HoverEffect (internal) |
| InExCard | InExCard.tsx | iconify, HoverEffect (internal) |
| TxCard | TxCard.tsx | Tailwind only |

### Providers (`src/components/legacy/providers/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| ThemeProvider | ThemeProvider.tsx | next-themes |

### Transactions (`src/components/legacy/transactions/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| RecurringStatusDialog | RecurringStatusDialog.tsx | shadcn/ui Dialog, Select, Label, sonner, iconify |
| SingleTransaction | SingleTransaction.tsx | ContextMenu (shadcn), iconify, TxCard, internal dialogs |
| InconsistencePrompt | InconsistencePrompt.tsx | shadcn/ui Dialog, Input, Button, iconify |
| NewTransaction | NewTransaction.tsx | shadcn/ui Dialog, Drawer, Form, Input, Textarea, Select, ScrollArea, sonner, iconify, react-hook-form |
| TransactionsList | TransactionsList.tsx | shadcn/ui Tooltip, iconify, HoverEffect (internal) |
| EditTransactionDialog | EditTransactionDialog.tsx | shadcn/ui Dialog, Input, Select, sonner, iconify |
| DeleteTransactionDialog | DeleteTransactionDialog.tsx | shadcn/ui AlertDialog, sonner, iconify |

### Common (`src/components/legacy/common/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| DatePicker | DatePicker.tsx | HoverEffect (internal), date-fns |
| Achievements | Achievements.tsx | iconify, HoverEffect (internal) |
| **Analytics** | Analytics.tsx | **Recharts (direct)**, iconify | FROZEN |
| Currency | Currency.tsx | shadcn/ui Tooltip |
| ThemeToggle | ThemeToggle.tsx | next-themes, iconify, HoverEffect (internal) |
| Logo | Logo.tsx | next/image, next-themes |
| AchievementsWrapper | AchievementsWrapper.tsx | next/image, iconify |
| Settings | Settings.tsx | shadcn/ui Dialog, Select, Input, Switch, Tooltip, iconify, HoverEffect (internal) |

### Sorting (`src/components/legacy/sorting/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| SortButton | SortButton.tsx | shadcn/ui Tooltip, iconify |
| SortButtons | SortButtons.tsx | SortButton (internal), iconify |

### Effects (`src/components/legacy/effects/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| Sonner | Sonner.tsx | shadcn/ui Sonner, iconify |
| HoverEffect | HoverEffect.tsx | useMouse hook (internal) |

### Categories (`src/components/legacy/categories/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| Expense | Expense.tsx | InExCard (internal) |
| Income | Income.tsx | InExCard (internal) |

### Helpers (`src/components/legacy/helpers/`)

| Component | File | Libraries Used |
|-----------|------|----------------|
| GoToTop | GoToTop.tsx | iconify, HoverEffect (internal) |
| PageLayout | PageLayout.tsx | Tailwind only |

**Total:** 29 legacy components (all FROZEN)

---

## 4. Chart Library Usage

### Tremor Usage

| File | Component | Usage | Status |
|------|-----------|-------|--------|
| src/components/dashboard/SpendingByCategoryChart.tsx | DonutChart | `import { DonutChart } from "@tremor/react"` | **TO MIGRATE** |

**Tremor removal scope:**
- Replace DonutChart with shadcn/ui PieChart (Recharts)
- Remove `@tremor/react` dependency
- Clean up globals.css lines 5-53 (Tremor Tailwind config)

### Recharts Usage

| File | Components Used | Status |
|------|-----------------|--------|
| src/components/ui/chart.tsx | RechartsPrimitive (wrapper) | OK - shadcn/ui chart wrapper |
| src/components/legacy/common/Analytics.tsx | BarChart, PieChart, LineChart, AreaChart, XAxis, YAxis, Tooltip, Legend, Cell, ResponsiveContainer | **FROZEN** |

**Note:** Legacy Analytics.tsx uses Recharts directly (not via shadcn/ui wrapper). This is intentional - legacy stays frozen.

---

## 5. Migration Candidates

Components that require changes in Phase 3:

| Component | Current Library | Target Library | Scope |
|-----------|-----------------|----------------|-------|
| SpendingByCategoryChart | Tremor DonutChart | shadcn/ui PieChart | Replace DonutChart import, update data format |

**Files affected by Tremor removal:**
1. `src/components/dashboard/SpendingByCategoryChart.tsx` - Replace DonutChart
2. `src/app/globals.css` (lines 5-53) - Remove Tremor Tailwind utilities
3. `package.json` - Remove @tremor/react dependency

---

## 6. Library Usage Summary by Domain

### Radix UI (via shadcn/ui only)

All Radix usage goes through shadcn/ui wrappers:
- AlertDialog, Button (Slot), ContextMenu, Dialog, Label, Popover, ScrollArea, Select, Switch, Tooltip

**No direct @radix-ui imports in BetterBudgeter components.**
**Legacy components use Radix through shadcn/ui wrappers, not directly.**

### Notifications

- **sonner** - Used in: LoginForm, SignOutButton, SyncTransactionsButton, BudgetSettings, legacy transaction dialogs

### Icons

- **@iconify/react** - Used only in legacy components
- **lucide-react** - Available (installed with shadcn/ui) but not directly used yet

### Dates

- **date-fns** - Used in legacy Analytics, DatePicker
- **react-day-picker** - Used by shadcn/ui Calendar

---

*Document created: 2026-01-28*
*Phase: 02-ui-library-strategy*
