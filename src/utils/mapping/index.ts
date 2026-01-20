/**
 * Mapping Utilities
 *
 * Pure, stateless helpers for mapping between different data formats.
 * Includes category mappings, label mappings, and data transformations.
 *
 * These functions have NO side effects and do NOT access external state.
 */

import type {
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
  TransactionCategory,
} from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Category Mappings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All income categories
 */
export const INCOME_CATEGORIES: readonly IncomeCategory[] = [
  "Salary",
  "Freelance",
  "Investment",
  "Bonus",
  "Other",
] as const;

/**
 * All expense categories
 */
export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "Food",
  "Rent",
  "Utilities",
  "Transport",
  "Entertainment",
  "Shopping",
  "Other",
] as const;

/**
 * Get categories for a transaction type
 *
 * @param type - "income" or "expense"
 * @returns Array of category names
 *
 * @example
 * getCategoriesForType("income") // ["Salary", "Freelance", ...]
 */
export function getCategoriesForType(
  type: TransactionType
): readonly TransactionCategory[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

/**
 * Check if a category is valid for a transaction type
 *
 * @param category - Category to check
 * @param type - Transaction type
 * @returns true if valid
 */
export function isValidCategory(
  category: string,
  type: TransactionType
): boolean {
  const validCategories = getCategoriesForType(type);
  return validCategories.includes(category as TransactionCategory);
}

// ─────────────────────────────────────────────────────────────────────────────
// Label Mappings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Category icons (using emoji as placeholder)
 * TODO: Replace with Lucide icons in components
 */
export const CATEGORY_ICONS: Record<TransactionCategory, string> = {
  // Income
  Salary: "💼",
  Freelance: "💻",
  Investment: "📈",
  Bonus: "🎁",
  // Expense
  Food: "🍔",
  Rent: "🏠",
  Utilities: "💡",
  Transport: "🚗",
  Entertainment: "🎬",
  Shopping: "🛍️",
  // Shared
  Other: "📋",
};

/**
 * Category descriptions for tooltips/help text
 */
export const CATEGORY_DESCRIPTIONS: Record<TransactionCategory, string> = {
  // Income
  Salary: "Regular employment income",
  Freelance: "Self-employment and contract work",
  Investment: "Returns from investments",
  Bonus: "One-time bonuses and rewards",
  // Expense
  Food: "Groceries and dining out",
  Rent: "Housing and rent payments",
  Utilities: "Electricity, water, internet, etc.",
  Transport: "Gas, public transit, rideshare",
  Entertainment: "Movies, games, subscriptions",
  Shopping: "Clothing, electronics, general purchases",
  // Shared
  Other: "Miscellaneous transactions",
};

/**
 * Get icon for a category
 *
 * @param category - Category name
 * @returns Emoji icon (or component name in future)
 */
export function getCategoryIcon(category: TransactionCategory): string {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
}

/**
 * Get description for a category
 *
 * @param category - Category name
 * @returns Human-readable description
 */
export function getCategoryDescription(category: TransactionCategory): string {
  return CATEGORY_DESCRIPTIONS[category] || CATEGORY_DESCRIPTIONS.Other;
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Transformations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize a transaction amount based on type
 * Income is always positive, expense is always negative
 *
 * @param amount - Raw amount value
 * @param type - Transaction type
 * @returns Normalized amount
 */
export function normalizeAmount(
  amount: number,
  type: TransactionType
): number {
  const absAmount = Math.abs(amount);
  return type === "income" ? absAmount : -absAmount;
}

/**
 * Determine transaction type from amount sign
 *
 * @param amount - Amount (positive = income, negative = expense)
 * @returns Transaction type
 */
export function typeFromAmount(amount: number): TransactionType {
  return amount >= 0 ? "income" : "expense";
}

/**
 * Map external category names to internal categories
 * Useful for import transformations
 *
 * @param externalCategory - Category from external source
 * @param type - Transaction type for fallback
 * @returns Mapped internal category
 */
export function mapExternalCategory(
  externalCategory: string | undefined,
  type: TransactionType
): TransactionCategory {
  if (!externalCategory) {
    return "Other";
  }

  // Try direct match first (case-insensitive)
  const normalized = externalCategory.trim();
  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
  const match = allCategories.find(
    (c) => c.toLowerCase() === normalized.toLowerCase()
  );

  if (match && isValidCategory(match, type)) {
    return match;
  }

  // Fallback to "Other"
  return "Other";
}
