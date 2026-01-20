/**
 * Finance Components
 *
 * Reusable components for financial data display and input.
 * Includes transaction forms, category selectors, amount inputs, etc.
 *
 * Current status: SKELETON — exports placeholder components.
 *
 * TODO (Task 4+):
 * - TransactionForm: Add/edit transaction
 * - CategorySelector: Category dropdown with icons
 * - AmountInput: Currency-aware amount input
 * - TransactionRow: Single transaction display
 * - AccountCard: Linked bank account display
 */

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finance component names for future implementation
 * These will be replaced with actual component exports
 */
export const FINANCE_COMPONENTS = [
  "TransactionForm",
  "CategorySelector",
  "AmountInput",
  "TransactionRow",
  "AccountCard",
  "BankSelector",
] as const;

/**
 * Check if a finance component is implemented
 * @param name - Component name
 * @returns Always false for now (skeleton)
 */
export function isComponentImplemented(name: string): boolean {
  // All components are placeholders for now
  return FINANCE_COMPONENTS.includes(name as (typeof FINANCE_COMPONENTS)[number])
    ? false
    : false;
}
