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
  it.todo(
    "Wave 1 will populate the 4 cases from 08-RESEARCH.md (zero, positive, large, fractional)"
  );
});
