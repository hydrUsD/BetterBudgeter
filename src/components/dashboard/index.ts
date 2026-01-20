/**
 * Dashboard Components
 *
 * Reusable components for the BetterBudget dashboard.
 * These components display aggregated financial data from the database.
 *
 * Current status: SKELETON — exports placeholder components.
 *
 * TODO (Task 4+):
 * - BalanceSummaryCard: Display total balance
 * - IncomeExpenseCards: Display income/expense totals
 * - SpendingChart: Category breakdown pie/bar chart
 * - TrendChart: Time series line chart
 * - RecentTransactions: Transaction list with virtualization
 */

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Dashboard component names for future implementation
 * These will be replaced with actual component exports
 */
export const DASHBOARD_COMPONENTS = [
  "BalanceSummaryCard",
  "IncomeExpenseCards",
  "SpendingChart",
  "TrendChart",
  "RecentTransactions",
  "BudgetProgress",
] as const;

/**
 * Check if a dashboard component is implemented
 * @param name - Component name
 * @returns Always false for now (skeleton)
 */
export function isComponentImplemented(name: string): boolean {
  // All components are placeholders for now
  return DASHBOARD_COMPONENTS.includes(name as (typeof DASHBOARD_COMPONENTS)[number])
    ? false
    : false;
}
