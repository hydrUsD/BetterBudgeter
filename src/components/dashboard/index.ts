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
 * SpendingByCategoryChart: Donut chart showing expense breakdown by category.
 * Uses Tremor for visualization. ADHD-friendly visual overview.
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

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder Exports (Future Implementation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dashboard component names for future implementation
 */
export const DASHBOARD_COMPONENTS = [
  "BalanceSummaryCard",
  "IncomeExpenseCards",
  "SpendingChart",
  "TrendChart",
  "RecentTransactions",
  "BudgetProgress",
  "SyncTransactionsButton", // Implemented
] as const;

/**
 * Check if a dashboard component is implemented
 * @param name - Component name
 * @returns true if component is implemented
 */
export function isComponentImplemented(name: string): boolean {
  const implementedComponents = [
    "SyncTransactionsButton",
    "BudgetProgress",
    "SpendingChart",
  ];
  return implementedComponents.includes(name);
}