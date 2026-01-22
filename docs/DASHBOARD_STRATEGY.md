# Dashboard & Visualization Strategy

**Version:** 1.1
**Status:** Implemented
**Task:** 5a — Dashboard & Visualization Strategy
**Scope:** MVP Dashboard (Implemented)

---

## 1. Purpose & Context

This document defines the MVP dashboard structure, KPIs, and visualization strategy for BetterBudget.

The dashboard is the primary interface for users to understand their financial status. For ADHD users, it must provide:
- Clear, at-a-glance understanding of financial health
- Predictable, deterministic display of data
- Low cognitive load with focused information
- No surprises or hidden complexity

### What This Document Covers

- MVP dashboard sections and layout
- KPI definitions and calculations
- Chart types and data sources
- Interaction model and refresh behavior
- UI states (empty, normal, error)
- Extension points for future features

### What This Document Does NOT Cover

- Implementation details or code
- Advanced analytics (Post-MVP)
- UI settings/personalization (Post-MVP)
- Budget calculation logic (see BUDGET_STRATEGY.md)
- Import pipeline (see IMPORT_PIPELINE_STRATEGY.md)

### Key Constraint: Dashboard Consumes, Does Not Calculate

The dashboard reads pre-calculated data from `lib/` modules:
- **Budget progress** → from `lib/budgets/`
- **Transaction aggregates** → from `lib/db/transactions.ts`
- **Account data** → from `lib/db/accounts.ts`

The dashboard **never** calculates business logic directly.

---

## 2. Dashboard MVP Sections

### 2.1 Section Overview

| Section | Purpose | User Question Answered | Priority |
|---------|---------|----------------------|----------|
| **Total Balance** | Show combined account balance | "How much money do I have?" | P0 |
| **Income/Expenses** | Show period totals | "How much did I earn/spend?" | P0 |
| **Budget Progress** | Show spending vs limits | "Am I staying within my budgets?" | P0 |
| **Linked Accounts** | Show account list | "What accounts are connected?" | P1 |
| **Recent Transactions** | Show last N transactions | "What were my recent transactions?" | P1 |
| **Spending by Category** | Pie/donut chart | "Where does my money go?" | P1 |
| **Spending Trend** | Bar chart over time | "Am I spending more or less lately?" | P2 |

**P0** = Core MVP, **P1** = MVP if time permits, **P2** = Nice-to-have in MVP

### 2.2 Section Details

#### Total Balance Card

| Attribute | Value |
|-----------|-------|
| **Purpose** | Show total balance across all linked accounts |
| **Data Source** | `bb_accounts.balance` (sum) |
| **Calculation** | `SUM(balance) WHERE user_id = auth.uid()` |
| **Empty State** | "€0.00" with "No accounts linked" label |
| **Refresh** | On page load + after manual import |

#### Income/Expenses Cards

| Attribute | Value |
|-----------|-------|
| **Purpose** | Show total income and expenses for current view |
| **Data Source** | `bb_transactions` (aggregated) |
| **Calculation** | `getTransactionSummary()` from `lib/db/transactions.ts` |
| **Time Window** | All transactions (MVP) — see Section 4 for time range decisions |
| **Empty State** | "€0.00" with "No transactions yet" label |
| **Visual** | Green for income, Red for expenses (consistent theming) |

#### Budget Progress Section

| Attribute | Value |
|-----------|-------|
| **Purpose** | Show budget status for each tracked category |
| **Data Source** | `calculateAllBudgetProgress()` from `lib/budgets/` |
| **Display** | One card per budget with progress bar |
| **Visual Feedback** | Traffic light colors (green/yellow/red) |
| **Empty State** | "Set up budgets →" link to /settings |
| **Design Rationale** | ADHD-friendly: glanceable status without reading numbers |

**Note:** Budget progress is consumed from `lib/budgets/`, not calculated in dashboard. See `docs/BUDGET_STRATEGY.md` for calculation logic.

#### Linked Accounts List

| Attribute | Value |
|-----------|-------|
| **Purpose** | Show connected bank accounts |
| **Data Source** | `getAccounts()` from `lib/db/accounts.ts` |
| **Display** | Account name, bank name, balance, last sync time |
| **Empty State** | Handled by parent empty state (no banks linked) |
| **Interaction** | View only (no per-account actions in MVP) |

#### Recent Transactions List

| Attribute | Value |
|-----------|-------|
| **Purpose** | Show latest transactions for quick review |
| **Data Source** | `getRecentTransactions(5)` from `lib/db/transactions.ts` |
| **Display** | Description, category, date, amount (with sign) |
| **Limit** | 5 transactions (MVP) |
| **Empty State** | "No transactions yet. Click 'Sync Transactions' to import." |

#### Spending by Category Chart (MVP P1) — Implemented

| Attribute | Value |
|-----------|-------|
| **Purpose** | Visual breakdown of where money goes |
| **Chart Type** | Donut chart (Tremor DonutChart) |
| **Data Source** | Expense transactions grouped by category |
| **Time Window** | Current month (1st to today) |
| **Empty State** | "No expense data to display" message |
| **ADHD Rationale** | Visual overview without reading tables |

#### Spending Trend Chart (Post-MVP — Not Implemented)

| Attribute | Value |
|-----------|-------|
| **Purpose** | Show spending patterns over time |
| **Chart Type** | Bar chart (Tremor BarChart) |
| **Data Source** | Transactions grouped by week/month |
| **Time Window** | Last 4 weeks or last 3 months |
| **Empty State** | "Not enough data for trends" message |
| **ADHD Rationale** | Spot patterns without manual tracking |

---

## 3. KPIs (MVP Only)

### 3.1 KPI Definitions

| KPI | Definition | Calculation | Time Window |
|-----|------------|-------------|-------------|
| **Total Balance** | Sum of all account balances | `SUM(bb_accounts.balance)` | Point-in-time (current) |
| **Total Income** | Sum of income transactions | `SUM(amount) WHERE type = 'income'` | All time (MVP) |
| **Total Expenses** | Sum of expense transactions | `SUM(amount) WHERE type = 'expense'` | All time (MVP) |
| **Net Change** | Income minus Expenses | `Total Income - Total Expenses` | All time (MVP) |
| **Budget Status** | Per-category spending status | Consumed from `lib/budgets/` | Current calendar month |

### 3.2 KPI Fallback Behavior

| KPI | No Data State | Display |
|-----|---------------|---------|
| Total Balance | No accounts linked | "€0.00" + empty state message |
| Total Income | No income transactions | "€0.00" |
| Total Expenses | No expense transactions | "€0.00" |
| Net Change | No transactions | "€0.00" |
| Budget Status | No budgets configured | Link to /settings |

### 3.3 KPI Data Sources

All KPIs read from database tables via `lib/db/` functions. The dashboard never queries the database directly.

| KPI | Function | Location |
|-----|----------|----------|
| Total Balance | `getAccounts()` → sum | `lib/db/accounts.ts` |
| Income/Expenses | `getTransactionSummary()` | `lib/db/transactions.ts` |
| Budget Status | `calculateAllBudgetProgress()` | `lib/budgets/index.ts` |

---

## 4. Charts (Tremor v4)

### 4.1 Chart Library Decision

**Library:** Tremor v4 (`@tremor/react@4.0.0-beta-tremor-v4.4`)

**Note:** The project uses Tremor v4 for chart components (DonutChart). Tremor v4 uses Recharts internally and `tailwind-variants` for styling, making it compatible with both React 19 and Tailwind CSS v4.

**Rationale for Tremor v4:**
- Compatible with React 19 and Tailwind CSS v4
- Uses Recharts internally (already a project dependency)
- Simple declarative API for chart components
- Good TypeScript support
- `tailwind-variants` avoids Tailwind v4 color class issues

See `docs/TREMOR_MIGRATION_ANALYSIS.md` for migration details from Tremor v3.

### 4.2 MVP Charts (Maximum 2-3)

#### Chart 1: Spending by Category (Donut) — Implemented

| Attribute | Value |
|-----------|-------|
| **Type** | Tremor DonutChart (Recharts PieChart internally) |
| **Data Source** | Expense transactions, current month |
| **Grouping** | By `category` field |
| **Colors** | From `CATEGORY_COLORS` in `utils/charts/` |
| **Default Range** | Current calendar month |
| **ADHD Rationale** | Immediate visual answer to "where does my money go?" |

**Data Shape:**
```
[
  { name: "Food", value: 350, fill: "#ef4444" },
  { name: "Transport", value: 120, fill: "#22c55e" },
  ...
]
```

**Empty State:** Show placeholder with "No expense data for this month"

#### Chart 2: Income vs Expenses (Bar) — Not Implemented (Post-MVP)

| Attribute | Value |
|-----------|-------|
| **Type** | BarChart with grouped bars |
| **Data Source** | Transactions grouped by time period |
| **Grouping** | By week (last 4 weeks) or month (last 3 months) |
| **Colors** | Green for income, Red for expenses |
| **Default Range** | Last 4 weeks |
| **ADHD Rationale** | Spot trends without manual calculation |

**Data Shape:**
```
[
  { date: "Week 1", Income: 2000, Expenses: 1500 },
  { date: "Week 2", Income: 0, Expenses: 800 },
  ...
]
```

**Empty State:** Show placeholder with "Not enough data for trends"

### 4.3 Chart Design Principles (ADHD-Friendly)

| Principle | Implementation |
|-----------|----------------|
| **Simplicity** | Maximum 2 charts on MVP dashboard |
| **Glanceability** | Clear colors, minimal labels |
| **Consistency** | Same color = same meaning across app |
| **No Clutter** | No grid lines, minimal axis labels |
| **Tooltips** | On hover only, not persistent |
| **Animation** | Subtle, not distracting (300ms) |

### 4.4 Charts NOT in MVP

| Chart Type | Reason Excluded |
|------------|-----------------|
| Line charts | Too similar to bar, adds clutter |
| Stacked charts | Harder to read for ADHD users |
| Multi-axis charts | Cognitive overload |
| Real-time charts | No real-time data in MVP |
| Budget vs Actual bars | Traffic light is sufficient |

---

## 5. Interaction Model

### 5.1 Data Refresh Behavior

| Trigger | What Refreshes | How |
|---------|---------------|-----|
| Page load | All dashboard data | Server-side fetch |
| "Sync Transactions" click | Transactions + budget progress | API call → router.refresh() |
| Browser refresh | All dashboard data | Server-side fetch |

**Key Rule:** No automatic background refresh. Data updates only when user takes action.

### 5.2 Time Range Selection

**MVP Decision:** No time range selector in MVP.

| Reason | Explanation |
|--------|-------------|
| Reduced complexity | No date picker UI needed |
| Consistent behavior | Same view every time |
| ADHD-friendly | Fewer choices = less paralysis |
| Budget alignment | Budgets are always current month |

**Post-MVP:** Add simple preset buttons (This Month, Last 30 Days, This Year)

### 5.3 Interactions NOT Supported in MVP

| Interaction | Reason Excluded |
|-------------|-----------------|
| Time range selection | See 5.2 |
| Chart drilling (click to filter) | Adds complexity |
| Dashboard customization | Post-MVP feature |
| Export to PDF/CSV | Post-MVP feature |
| Per-account filtering | Single view sufficient |
| Chart type switching | Predefined charts only |

### 5.4 Navigation from Dashboard

| Element | Destination | Purpose |
|---------|-------------|---------|
| "Link a Bank" button | /link-bank | Bank linking flow |
| "Set up budgets" link | /settings | Budget configuration |
| "Sync Transactions" button | (stays on page) | Manual import |
| Sign Out button | /login | End session |

**Note:** The dashboard is now the primary landing page at `/`. The route `/dashboard` redirects to `/` via HTTP 308.

---

## 6. Extension Points (Conceptual Only)

These are future hook points. **No implementation in MVP.**

### 6.1 Notification Display Extension

**Current:** Budget alerts shown as toast after import.

**Future Extension Point:**
- Notification badge/bell icon in header
- Notification panel/dropdown
- Persistent notification list

**Where to Hook:**
- Header component (badge)
- Dashboard layout (panel)
- `/api/notifications` endpoint (already exists as skeleton)

### 6.2 UI Settings Extension

**Current:** Single fixed dashboard layout.

**Future Extension Point:**
- Compact vs comfortable mode
- Show/hide sections
- Reorder sections
- Theme preference

**Where to Hook:**
- `bb_user_settings` table (already exists)
- Dashboard page reads from settings
- Settings page for configuration

### 6.3 Chart Customization Extension

**Current:** Fixed charts with fixed time ranges.

**Future Extension Point:**
- Time range selector
- Chart type switching
- Hide/show charts

**Where to Hook:**
- Dashboard state or URL params
- Chart component props
- `bb_user_settings` for persistence

---

## 7. UI States

### 7.1 State Definitions

| State | Condition | Display |
|-------|-----------|---------|
| **First-time user** | No banks linked (`accounts.length === 0`) | Empty state with "Link a Bank" CTA |
| **Bank linked, no imports** | Accounts exist, no transactions | Empty transactions list, "Sync Transactions" prompt |
| **Normal data state** | Accounts and transactions exist | Full dashboard with all sections |
| **Error state** | Database error on fetch | Error banner with retry option |
| **Loading state** | Data being fetched | Skeleton loaders (handled by Next.js) |

### 7.2 First-Time User Experience

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│        ┌─────────────────────────────────────────┐          │
│        │     No Banks Linked                      │          │
│        │                                          │          │
│        │  Link a bank account to start tracking  │          │
│        │  your finances.                         │          │
│        │                                          │          │
│        │         [ Link a Bank ]                 │          │
│        │                                          │          │
│        └─────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.3 Bank Linked, No Imports

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                       [Sync Transactions]  [Out] │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Total Balance                                               │
│  €0.00                                                       │
│  Across 1 account                                           │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Income            │  Expenses                               │
│  €0.00             │  €0.00                                  │
├─────────────────────────────────────────────────────────────┤
│  Recent Transactions                                         │
│  No transactions yet. Click "Sync Transactions" to import.  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 7.4 Error State

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ⚠ Unable to Load Data                                   ││
│  │ [Error message]                                         ││
│  │ Please check your connection and try refreshing.        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. MVP vs Post-MVP

### 8.1 MVP Scope (Task 5)

| Feature | Included | Notes |
|---------|----------|-------|
| Total Balance KPI | Yes | Already implemented |
| Income/Expenses KPIs | Yes | Already implemented |
| Budget Progress section | Yes | Already implemented |
| Linked Accounts list | Yes | Already implemented |
| Recent Transactions list | Yes | Already implemented |
| Spending by Category chart | Yes | Donut chart, current month |
| Sync Transactions button | Yes | Already implemented |
| Empty states | Yes | Already implemented |
| Error states | Yes | Already implemented |

### 8.2 Post-MVP Enhancements

| Feature | Priority | Rationale for Exclusion |
|---------|----------|------------------------|
| Time range selector | Medium | Adds complexity, budgets are monthly anyway |
| Income vs Expenses trend chart | Medium | Nice-to-have, not essential |
| Dashboard settings | Low | Customization is not ADHD-friendly |
| Notification bell/panel | Medium | Toast notifications sufficient for MVP |
| Export to PDF/CSV | Low | Not core budgeting feature |
| Per-account view | Low | Single view is simpler |
| Comparative analytics | Low | "Last month vs this month" |
| Spending predictions | Low | Requires historical analysis |
| Mobile-optimized view | Medium | Responsive but not mobile-first |

### 8.3 Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Chart library | Tremor v4 (Recharts internally) | React 19 + Tailwind v4 compatible |
| Number of charts | 1-2 max | ADHD: reduce visual noise |
| Time range | Fixed (all time / current month) | Simplicity |
| Budget display | Traffic light cards | Glanceable status |
| Refresh mechanism | Manual only | Predictable behavior |
| Notification display | Toast on import | Non-intrusive |

---

## 9. Data Dependencies

### 9.1 Database Tables Required

| Table | Fields Used | Section |
|-------|-------------|---------|
| `bb_accounts` | balance, bank_name, account_name, last_synced_at | Balance, Accounts list |
| `bb_transactions` | type, amount, category, booking_date, description | All KPIs, Charts, Recent list |
| `bb_budgets` | category, monthly_limit | Budget Progress |

### 9.2 Required Query Functions

| Function | Location | Used By |
|----------|----------|---------|
| `getAccounts()` | `lib/db/accounts.ts` | Balance, Accounts list |
| `getRecentTransactions()` | `lib/db/transactions.ts` | Recent Transactions |
| `getTransactionSummary()` | `lib/db/transactions.ts` | Income/Expenses KPIs |
| `calculateAllBudgetProgress()` | `lib/budgets/index.ts` | Budget Progress section |

### 9.3 New Query Functions Needed (for Charts)

| Function | Purpose | Location |
|----------|---------|----------|
| `getExpensesByCategory()` | Category breakdown for donut chart | `lib/db/transactions.ts` |
| `getTransactionsByPeriod()` | Time series for bar chart | `lib/db/transactions.ts` |

---

## 10. ADHD Design Rationale Summary

| Principle | How Dashboard Implements It |
|-----------|----------------------------|
| **Glanceability** | Traffic light budgets, large KPI numbers, clear colors |
| **Predictability** | Same data every visit, no auto-refresh, manual control |
| **Low Cognitive Load** | Max 2 charts, 5 recent transactions, no clutter |
| **Clear Hierarchy** | Balance first, then income/expenses, then details |
| **Actionable States** | Empty states have clear CTAs, not just messages |
| **Non-judgmental** | "Over budget" not "You failed", neutral language |
| **Visual Consistency** | Green=income/good, Red=expense/warning, everywhere |

---

## 11. Alignment with Other Strategy Documents

| Document | Alignment Point |
|----------|-----------------|
| BUDGET_STRATEGY.md | Dashboard consumes `BudgetProgress[]`, does not calculate |
| IMPORT_PIPELINE_STRATEGY.md | Sync button triggers `/api/import`, refresh on completion |
| SUPABASE_STRATEGY.md | All queries via `lib/db/`, RLS automatic |
| ARCHITECTURE_SKELETON.md | Dashboard components in `components/dashboard/` |
| DATABASE_SETUP.md | Uses `bb_accounts`, `bb_transactions`, `bb_budgets` tables |

---

## 12. Implementation Checklist (Reference Only)

For the implementation task (Task 5b), the following work items are implied:

### Already Implemented
- [x] Total Balance KPI card
- [x] Income/Expenses KPI cards
- [x] Budget Progress section (traffic light)
- [x] Linked Accounts list
- [x] Recent Transactions list
- [x] Sync Transactions button
- [x] Empty state (no banks)
- [x] Error state handling

### Implemented Since Strategy Was Written
- [x] Spending by Category donut chart (Tremor DonutChart)
- [x] `getExpensesByCategory()` query function
- [x] Chart empty states
- [x] Tremor v4 migration (from v3.18.7)

### Deferred to Post-MVP
- [ ] Income vs Expenses bar chart (P2 priority)

---

*Document created: Task 5a — Dashboard & Visualization Strategy*
*Last updated: Documentation sync (reflects current implemented state)*