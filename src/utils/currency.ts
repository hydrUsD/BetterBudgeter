/**
 * Currency Formatter (EUR, de-DE)
 *
 * Single source of truth for EUR currency formatting across BetterBudgeter.
 * Extracted from the inline helper formerly in src/app/(bb)/page.tsx (D-CUT-04).
 *
 * Pure function — no side effects, no DOM access, no external state.
 *
 * Why a new flat file (and not `format.ts` per CONTEXT D-CMP-01):
 *   The legacy `src/utils/format/index.ts` exists with a 3-param formatCurrency
 *   (USD-defaulting). To avoid TypeScript module-resolution ambiguity and to
 *   give this function a semantically accurate name, the planner renamed it
 *   to `currency.ts`. See 08-PATTERNS.md naming-conflict warning.
 *
 * EXTENSION POINT: When multi-currency support is added (v3+),
 *   add a currency parameter and migrate callers gradually. Until then,
 *   this function is locked to de-DE/EUR.
 */

// ─────────────────────────────────────────────────────────────────────────────
// EUR Currency Formatter
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a number as EUR currency using the German locale.
 *
 * Uses Intl.NumberFormat with de-DE locale — dots as thousand separators,
 * commas as decimal separators, and the € symbol with a NO-BREAK SPACE (U+00A0).
 *
 * This is an extraction of the inline helper that was in src/app/(bb)/page.tsx.
 * Behavior is byte-identical to the legacy inline.
 *
 * @param amount - The amount to format (positive or negative number)
 * @returns Formatted EUR string, e.g. "1.234,50 €" or "-50,50 €"
 *
 * @example
 * formatCurrency(0)       // "0,00 €"
 * formatCurrency(1234.5)  // "1.234,50 €"
 * formatCurrency(10000)   // "10.000,00 €"
 * formatCurrency(-50.5)   // "-50,50 €"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}
