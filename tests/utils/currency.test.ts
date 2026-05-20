/**
 * formatCurrency Unit Tests
 *
 * Tests the EUR currency formatter extracted from the legacy (bb)/page.tsx inline helper (D-CUT-04).
 *
 * Does NOT test:
 * - The legacy `@/utils/format/index.ts` formatter (USD-defaulting) — that file is unchanged
 * - Multi-currency variants (out of scope, v3+)
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { formatCurrency } from "@/utils/currency";

// ─────────────────────────────────────────────────────────────────────────────
// formatCurrency
// ─────────────────────────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  // NOTE: The space between number and "€" is U+00A0 (NO-BREAK SPACE) as emitted by ICU.
  // Use   in test strings or copy the raw output from the test command.
  // Confirmed via: node -e "console.log(JSON.stringify(new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(1234.5)))"

  it("formats zero as '0,00 €' with German decimal comma", () => {
    // Zero should render as "0,00 €" — U+00A0 between number and euro sign
    expect(formatCurrency(0)).toBe("0,00 €");
  });

  it("formats a positive decimal as '1.234,50 €' with German thousand separator and decimal comma", () => {
    // German locale uses dot for thousands, comma for decimals
    // U+00A0 (NO-BREAK SPACE) between number and euro sign
    expect(formatCurrency(1234.5)).toBe("1.234,50 €");
  });

  it("formats a large integer as '10.000,00 €' with thousand separator", () => {
    // Large numbers must have a dot as thousand separator in de-DE
    expect(formatCurrency(10000)).toBe("10.000,00 €");
  });

  it("formats a negative value as '-50,50 €' using hyphen-minus (not U+2212)", () => {
    // Intl.NumberFormat uses hyphen-minus (U+002D) for negatives, NOT the minus sign (U+2212).
    // The TransactionItem component is responsible for the U+2212 display — outside this function.
    expect(formatCurrency(-50.5)).toBe("-50,50 €");
  });

  it("formats a fractional value below 1 as '0,05 €'", () => {
    // Ensures sub-unit amounts (e.g. 5 Cent) are correctly represented
    expect(formatCurrency(0.05)).toBe("0,05 €");
  });
});
