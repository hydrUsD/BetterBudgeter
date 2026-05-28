/**
 * Dashboard Components
 *
 * Reusable components for the BetterBudget dashboard.
 * These components display aggregated financial data from the database.
 *
 * @see docs/ARCHITECTURE_SKELETON.md for component organization
 */

// ─────────────────────────────────────────────────────────────────────────────
// Implemented Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * SyncTransactionsButton: Manual import trigger for dashboard.
 * Calls /api/import to fetch and persist transactions from linked banks.
 *
 * @see docs/IMPORT_PIPELINE_STRATEGY.md Section 2
 */
export { SyncTransactionsButton } from "./SyncTransactionsButton";

/**
 * BudgetProgressSection: Displays budget progress with traffic light colors.
 * Shows all tracked budgets with progress bars and status indicators.
 *
 * @see docs/BUDGET_STRATEGY.md
 */
export { BudgetProgressSection } from "./BudgetProgressSection";

/**
 * BudgetProgressCard: Standalone card for a single category's budget progress.
 * Uses 3-level traffic-light status (on_track/warning/over_budget).
 * Extracted from BudgetProgressSection for direct import and testing.
 *
 * @see docs/BUDGET_STRATEGY.md
 */
export { BudgetProgressCard, type BudgetProgressCardProps } from "./BudgetProgressCard";

/**
 * SpendingByCategoryChart: Donut chart showing expense breakdown by category.
 * Uses Recharts (via shadcn/ui charts) for visualization. ADHD-friendly visual overview.
 *
 * @see docs/DASHBOARD_STRATEGY.md Section 4.2
 */
export { SpendingByCategoryChart } from "./SpendingByCategoryChart";

/**
 * BudgetNotificationDialogs: ADHD-friendly Alert Dialogs for budget alerts.
 * Shows warning (80% threshold) and over-budget (100% threshold) notifications.
 * Uses session-level acknowledgment to prevent repeated popups.
 *
 * @see docs/BUDGET_STRATEGY.md Section 4 (Notification Triggers)
 */
export { BudgetNotificationDialogs } from "./BudgetNotificationDialogs";

/**
 * TransactionItem: Presentational single-row transaction display.
 * Used on Home hub (Phase 8) and Transactions page (Phase 9).
 *
 * Accepts a view-model (TransactionItemProps) — NOT a raw DbTransaction row.
 * Parent page is responsible for mapping DB rows → view-model props.
 *
 * @see docs/DESIGN_SYSTEM.md §5.3
 * @see .planning/phases/08-home-hub/08-CONTEXT.md D-CMP-02
 */
export { TransactionItem, type TransactionItemProps } from "./TransactionItem";

/**
 * KpiCard: Compact metric display card (label + value).
 * Reusable across pages that show numeric summaries (e.g. Income/Expenses,
 * Budgeted/Spent/Remaining).
 *
 * @see docs/DESIGN_SYSTEM.md §5.1
 */
export { KpiCard, type KpiCardProps } from "./KpiCard";

