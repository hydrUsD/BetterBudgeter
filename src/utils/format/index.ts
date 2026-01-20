/**
 * Format Utilities
 *
 * Pure, stateless formatting helpers for dates, currency, and numbers.
 * These functions have NO side effects and do NOT access external state.
 *
 * Usage: Import individual functions as needed.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Currency Formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a number as currency
 *
 * @param amount - The amount to format
 * @param currency - ISO 4217 currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string (e.g., "$1,234.56")
 *
 * @example
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, "EUR", "de-DE") // "1.234,56 €"
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with sign prefix for income/expense display
 *
 * @param amount - The amount (positive or negative)
 * @param currency - ISO 4217 currency code
 * @returns Formatted string with + or - prefix
 *
 * @example
 * formatSignedCurrency(100) // "+$100.00"
 * formatSignedCurrency(-50) // "-$50.00"
 */
export function formatSignedCurrency(
  amount: number,
  currency: string = "USD"
): string {
  const sign = amount >= 0 ? "+" : "";
  return sign + formatCurrency(amount, currency);
}

// ─────────────────────────────────────────────────────────────────────────────
// Date Formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a date for display
 *
 * @param date - Date string (ISO 8601) or Date object
 * @param format - Format style: "short", "medium", "long"
 * @param locale - Locale for formatting
 * @returns Formatted date string
 *
 * @example
 * formatDate("2024-01-15") // "Jan 15, 2024"
 * formatDate("2024-01-15", "short") // "1/15/24"
 */
export function formatDate(
  date: string | Date,
  format: "short" | "medium" | "long" = "medium",
  locale: string = "en-US"
): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const optionsMap: Record<"short" | "medium" | "long", Intl.DateTimeFormatOptions> = {
    short: { month: "numeric", day: "numeric", year: "2-digit" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric", weekday: "long" },
  };

  return new Intl.DateTimeFormat(locale, optionsMap[format]).format(d);
}

/**
 * Format a date relative to now (e.g., "2 days ago")
 *
 * @param date - Date string (ISO 8601) or Date object
 * @param locale - Locale for formatting
 * @returns Relative time string
 *
 * @example
 * formatRelativeDate(yesterday) // "yesterday"
 * formatRelativeDate(lastWeek) // "7 days ago"
 */
export function formatRelativeDate(
  date: string | Date,
  locale: string = "en-US"
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return rtf.format(-diffDays, "day");
  if (diffDays < 30) return rtf.format(-Math.floor(diffDays / 7), "week");
  if (diffDays < 365) return rtf.format(-Math.floor(diffDays / 30), "month");
  return rtf.format(-Math.floor(diffDays / 365), "year");
}

// ─────────────────────────────────────────────────────────────────────────────
// Number Formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a number with thousand separators
 *
 * @param value - Number to format
 * @param decimals - Number of decimal places
 * @param locale - Locale for formatting
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234567.89, 0) // "1,234,568"
 */
export function formatNumber(
  value: number,
  decimals: number = 2,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format a percentage
 *
 * @param value - Decimal value (0.5 = 50%)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 *
 * @example
 * formatPercentage(0.1234) // "12.34%"
 * formatPercentage(0.1234, 0) // "12%"
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}
