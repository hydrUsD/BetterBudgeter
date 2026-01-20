/**
 * Chart Utilities
 *
 * Pure, stateless helpers for chart configuration (Tremor/Recharts).
 * Provides consistent colors, formatting, and config across charts.
 *
 * These functions have NO side effects and do NOT access external state.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Color Palettes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default color palette for category charts
 * These colors are chosen for accessibility and visual distinction.
 */
export const CATEGORY_COLORS = {
  // Expense categories
  Food: "#ef4444", // red-500
  Rent: "#f97316", // orange-500
  Utilities: "#eab308", // yellow-500
  Transport: "#22c55e", // green-500
  Entertainment: "#3b82f6", // blue-500
  Shopping: "#8b5cf6", // violet-500
  Other: "#6b7280", // gray-500

  // Income categories
  Salary: "#10b981", // emerald-500
  Freelance: "#14b8a6", // teal-500
  Investment: "#06b6d4", // cyan-500
  Bonus: "#0ea5e9", // sky-500
} as const;

/**
 * Colors for income vs expense comparison
 */
export const COMPARISON_COLORS = {
  income: "#22c55e", // green-500
  expense: "#ef4444", // red-500
  balance: "#3b82f6", // blue-500
  neutral: "#6b7280", // gray-500
} as const;

/**
 * Get color for a category
 *
 * @param category - Category name
 * @returns Hex color code
 *
 * @example
 * getCategoryColor("Food") // "#ef4444"
 * getCategoryColor("Unknown") // "#6b7280" (fallback)
 */
export function getCategoryColor(category: string): string {
  return (
    CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
    CATEGORY_COLORS.Other
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chart Configuration Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default Recharts configuration
 * Use this as a base for consistent styling across charts.
 */
export const DEFAULT_CHART_CONFIG = {
  margin: { top: 10, right: 10, bottom: 10, left: 10 },
  animationDuration: 300,
  fontSize: 12,
  strokeWidth: 2,
} as const;

/**
 * Generate Recharts-compatible data from category breakdown
 *
 * @param breakdown - Array of CategoryBreakdown objects
 * @returns Data array with name, value, and fill properties
 *
 * @example
 * const data = toPieChartData(categoryBreakdown);
 * // [{ name: "Food", value: 500, fill: "#ef4444" }, ...]
 */
export function toPieChartData(
  breakdown: Array<{ category: string; amount: number }>
): Array<{ name: string; value: number; fill: string }> {
  return breakdown.map((item) => ({
    name: item.category,
    value: item.amount,
    fill: getCategoryColor(item.category),
  }));
}

/**
 * Generate Recharts-compatible data for bar/line charts
 *
 * @param trendData - Array of trend data points
 * @returns Formatted data array
 */
export function toTrendChartData(
  trendData: Array<{
    date: string;
    income: number;
    expenses: number;
    balance?: number;
  }>
): Array<{ date: string; Income: number; Expenses: number; Balance?: number }> {
  return trendData.map((point) => ({
    date: point.date,
    Income: point.income,
    Expenses: point.expenses,
    ...(point.balance !== undefined ? { Balance: point.balance } : {}),
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Axis Formatters
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format currency values for chart axes
 * Shortens large numbers (e.g., 1000 -> 1K)
 *
 * @param value - Numeric value
 * @returns Formatted string
 *
 * @example
 * formatAxisCurrency(1500) // "$1.5K"
 * formatAxisCurrency(1500000) // "$1.5M"
 */
export function formatAxisCurrency(value: number): string {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000) {
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  }
  if (absValue >= 1_000) {
    return `${sign}$${(absValue / 1_000).toFixed(1)}K`;
  }
  return `${sign}$${absValue.toFixed(0)}`;
}

/**
 * Format date values for chart axes
 *
 * @param date - Date string (ISO 8601)
 * @param granularity - Time granularity
 * @returns Formatted string
 */
export function formatAxisDate(
  date: string,
  granularity: "day" | "week" | "month" = "day"
): string {
  const d = new Date(date);

  switch (granularity) {
    case "day":
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    case "week":
      return `W${Math.ceil(d.getDate() / 7)}`;
    case "month":
      return d.toLocaleDateString("en-US", { month: "short" });
    default:
      return date;
  }
}
