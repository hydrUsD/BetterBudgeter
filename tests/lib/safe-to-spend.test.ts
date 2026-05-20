/**
 * computeSafeToSpend Unit Tests
 *
 * Tests the pure Safe-to-Spend calculation function (PAGE-08).
 *
 * Does NOT test:
 * - DB orchestration (handled by the page component)
 * - UI rendering of the hero (handled by page-level smoke)
 * - The unused `getSafeToSpend` orchestrator wrapper if added later
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { computeSafeToSpend, ESSENTIAL_CATEGORIES } from "@/lib/safe-to-spend";
import type { DbAccount } from "@/lib/db/types";
import type { BudgetProgress } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// computeSafeToSpend
// ─────────────────────────────────────────────────────────────────────────────

describe("computeSafeToSpend", () => {
  it.todo(
    "Wave 1 will populate the 7 cases from 08-RESEARCH.md § Nyquist Sampling Rationale"
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// ESSENTIAL_CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

describe("ESSENTIAL_CATEGORIES", () => {
  it.todo("Wave 1 will assert exact contents and as-const-ness");
});
