/**
 * IBAN Formatting Helpers
 *
 * Pure, stateless helper for masking IBANs in the UI. Used by the
 * Settings page linked-accounts list to show a recognizable but
 * privacy-safe IBAN snippet (e.g. "DE89 **** **** 6789").
 *
 * WHY mask IBANs:
 * Even though this is a single-user app, showing the full IBAN on screen
 * is a privacy concern (screen-sharing, screenshots). Masking the middle
 * digits while keeping country code + last 4 digits gives the user enough
 * context to identify the account without exposing the full number.
 *
 * Pure function — no side effects, no DOM access, no external state.
 */

// ─────────────────────────────────────────────────────────────────────────────
// IBAN Masking
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mask an IBAN to show only the country code (first 4 chars) and last 4 digits.
 * Middle characters are replaced with bullet characters for readability.
 *
 * Returns a user-friendly "snippet" suitable for display in account lists.
 * If the IBAN is null, undefined, or too short, returns a fallback string.
 *
 * @param iban - Full IBAN string (e.g. "DE89370400440532013000")
 * @returns Masked IBAN snippet, e.g. "DE89 **** **** 3000"
 *
 * @example
 * maskIban("DE89370400440532013000") // "DE89 **** **** 3000"
 * maskIban("DE12345")                // "DE12 *** 5"  (short IBAN edge case, still masks middle)
 * maskIban(null)                     // "No IBAN"
 * maskIban("")                       // "No IBAN"
 */
export function maskIban(iban: string | null | undefined): string {
  if (!iban || iban.length < 5) {
    return "No IBAN";
  }

  // Keep first 4 characters (country code + check digits) and last 4
  const prefix = iban.slice(0, 4);
  const suffix = iban.slice(-4);
  const middleLength = iban.length - 8; // chars between prefix and suffix

  // Build masked middle section in groups of 4 for readability
  // e.g. "****" " ****" " ****" for a standard-length IBAN
  if (middleLength <= 0) {
    // Very short IBAN (5-8 chars): just show prefix + suffix
    return `${prefix} ${suffix}`;
  }

  const fullGroups = Math.floor(middleLength / 4);
  const remainder = middleLength % 4;

  let masked = prefix;
  for (let i = 0; i < fullGroups; i++) {
    masked += " ****";
  }
  if (remainder > 0) {
    masked += " " + "*".repeat(remainder);
  }
  masked += " " + suffix;

  return masked;
}
