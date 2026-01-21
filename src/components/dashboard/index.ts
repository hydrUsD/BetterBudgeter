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
  const implementedComponents = ["SyncTransactionsButton"];
  return implementedComponents.includes(name);
}