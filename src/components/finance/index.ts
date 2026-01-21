/**
 * Finance Components
 *
 * Reusable components for financial data display and input.
 * Includes transaction forms, category selectors, amount inputs, etc.
 *
 * @see docs/ARCHITECTURE_SKELETON.md for component organization
 */

// ─────────────────────────────────────────────────────────────────────────────
// Implemented Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * LinkBankFlow: Interactive bank linking / consent flow component.
 * Used on the /link-bank page for connecting mock banks.
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 5 for consent flow details
 */
export { LinkBankFlow } from "./LinkBankFlow";

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder Exports (Future Implementation)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Finance component names for future implementation
 */
export const FINANCE_COMPONENTS = [
  "TransactionForm",
  "CategorySelector",
  "AmountInput",
  "TransactionRow",
  "AccountCard",
  "BankSelector",
  "LinkBankFlow", // Implemented
] as const;

/**
 * Check if a finance component is implemented
 * @param name - Component name
 * @returns true if component is implemented
 */
export function isComponentImplemented(name: string): boolean {
  const implementedComponents = ["LinkBankFlow"];
  return implementedComponents.includes(name);
}