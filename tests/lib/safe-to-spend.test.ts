/**
 * computeSafeToSpend Unit Tests
 *
 * Tests the pure Safe-to-Spend calculation function (PAGE-08).
 *
 * 7 Nyquist test cases cover all essential variation axes:
 *   1. EMPTY            — no accounts, no budgets
 *   2. LIQUID-ONLY      — checking + savings counted; credit + investment excluded
 *   3. ACCOUNT-FILTER   — all 4 account types; only liquid ones sum
 *   4. ESSENTIAL-SUB    — essential-category remainders subtracted from balance
 *   5. DISCRETIONARY    — discretionary categories do NOT reduce Safe-to-Spend
 *   6. ALREADY-CLAMPED  — over-budget remainingAmount (already 0) contributes 0
 *   7. CLAMP-RESULT     — result is always >= 0 (not negative)
 *
 * Additional boundary cases:
 *   - undefined balance handled by acc.balance ?? 0
 *   - negative balance (overdraft) is summed as-is
 *   - ESSENTIAL_CATEGORIES export contains exactly the 4 locked values
 *
 * Does NOT test:
 * - DB orchestration (handled by the page component)
 * - UI rendering of the hero (handled by page-level smoke)
 * - The getSafeToSpend orchestrator wrapper (not in this plan)
 *
 * @see src/lib/safe-to-spend.ts for the implementation
 * @see .planning/phases/08-home-hub/08-CONTEXT.md D-S2S-01..03 for formula spec
 * @see docs/TESTING_STRATEGY.md for test conventions
 */

import { describe, it, expect } from "vitest";
import { computeSafeToSpend, ESSENTIAL_CATEGORIES } from "@/lib/safe-to-spend";
import type { DbAccount } from "@/lib/db/types";
import type { BudgetProgress } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a minimal DbAccount fixture with only the fields computeSafeToSpend reads.
 * Casting to DbAccount avoids having to fill in every required field.
 */
function makeAccount(account_type: string, balance: number): DbAccount {
  return { account_type, balance } as DbAccount;
}

/**
 * Build a minimal BudgetProgress fixture with only the fields computeSafeToSpend reads.
 * Mirrors the mockBudgetProgress pattern from tests/components/budget-progress.test.tsx.
 */
function makeProgress(category: string, remainingAmount: number): BudgetProgress {
  return {
    budget: {
      id: "budget-1",
      userId: "user-1",
      category: category as BudgetProgress["budget"]["category"],
      monthlyLimit: 1000,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    spentAmount: 1000 - remainingAmount,
    remainingAmount,
    usagePercentage: ((1000 - remainingAmount) / 1000) * 100,
    status: "on_track",
    transactionCount: 1,
  } as BudgetProgress;
}

// ─────────────────────────────────────────────────────────────────────────────
// computeSafeToSpend
// ─────────────────────────────────────────────────────────────────────────────

describe("computeSafeToSpend", () => {
  // Case 1: EMPTY — no accounts, no budgets → 0
  it("returns 0 for empty accounts and budget progress", () => {
    expect(computeSafeToSpend([], [])).toBe(0);
  });

  // Case 2: LIQUID-ONLY — checking €1000 + savings €500, no budgets → 1500
  it("sums checking and savings account balances when there are no budgets", () => {
    const accounts = [
      makeAccount("checking", 1000),
      makeAccount("savings", 500),
    ];
    expect(computeSafeToSpend(accounts, [])).toBe(1500);
  });

  // Case 3: ACCOUNT-TYPE-FILTER — all 4 types; credit and investment excluded
  it("excludes credit and investment accounts from the balance sum", () => {
    const accounts = [
      makeAccount("checking", 1000),
      makeAccount("credit", -200), // debt — should be excluded
      makeAccount("investment", 5000), // illiquid — should be excluded
      makeAccount("savings", 500),
    ];
    // Only checking (1000) + savings (500) = 1500
    expect(computeSafeToSpend(accounts, [])).toBe(1500);
  });

  // Case 4: ESSENTIAL-SUBTRACTION — essential remaining amounts are subtracted
  it("subtracts essential-category remainingAmount from the balance", () => {
    const accounts = [makeAccount("checking", 2000)];
    const progress = [
      makeProgress("Rent", 800),     // essential — subtracted
      makeProgress("Food", 200),     // essential — subtracted
    ];
    // 2000 - 800 - 200 = 1000
    expect(computeSafeToSpend(accounts, progress)).toBe(1000);
  });

  // Case 5: DISCRETIONARY-NOT-SUBTRACTED — Entertainment, Shopping, Other do NOT reduce S2S
  it("does NOT subtract discretionary-category budget remainders", () => {
    const accounts = [makeAccount("checking", 1000)];
    const progress = [
      makeProgress("Entertainment", 500), // discretionary — NOT subtracted
      makeProgress("Shopping", 100),      // discretionary — NOT subtracted
    ];
    // 1000 - 0 = 1000 (discretionary categories are protected, not deducted)
    expect(computeSafeToSpend(accounts, progress)).toBe(1000);
  });

  // Case 6: ALREADY-CLAMPED-REMAINING — over-budget budget has remainingAmount: 0
  // (src/lib/budgets/index.ts:174 clamps it upstream). Contributes 0, does not inflate S2S.
  it("treats over-budget categories (remainingAmount = 0) as contributing 0 to subtraction", () => {
    const accounts = [makeAccount("checking", 1000)];
    const progress = [
      makeProgress("Rent", 0),   // over-budget (already clamped to 0 upstream)
      makeProgress("Food", 200), // essential — subtracted
    ];
    // 1000 - 0 - 200 = 800 (the over-budget Rent does NOT inflate Safe-to-Spend)
    expect(computeSafeToSpend(accounts, progress)).toBe(800);
  });

  // Case 7: CLAMP-RESULT-AT-ZERO — result is never negative
  it("clamps the result to 0 when essential commitments exceed liquid balance", () => {
    const accounts = [makeAccount("checking", 100)];
    const progress = [makeProgress("Rent", 500)];
    // Without clamp: 100 - 500 = -400. With clamp: 0.
    expect(computeSafeToSpend(accounts, progress)).toBe(0);
  });

  // Boundary: undefined balance handled with ?? 0 fallback (D-S2S-03 pattern)
  it("treats accounts with undefined balance as 0 (balance ?? 0 guard)", () => {
    // Simulates a DB row where balance was not populated
    const accounts = [{ account_type: "checking", balance: undefined as unknown as number } as DbAccount];
    expect(computeSafeToSpend(accounts, [])).toBe(0);
  });

  // Boundary: negative balance (overdraft) is summed as-is — no clamping at account level
  it("includes negative account balances as-is (overdraft is legitimate data)", () => {
    const accounts = [
      makeAccount("checking", -100),
      makeAccount("savings", 600),
    ];
    // -100 + 600 = 500; no essential commitments → 500
    expect(computeSafeToSpend(accounts, [])).toBe(500);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ESSENTIAL_CATEGORIES
// ─────────────────────────────────────────────────────────────────────────────

describe("ESSENTIAL_CATEGORIES", () => {
  it("contains exactly ['Rent', 'Utilities', 'Food', 'Transport'] in that order", () => {
    // D-S2S-01: these 4 categories are locked (not user-configurable in v2.0)
    expect(ESSENTIAL_CATEGORIES).toEqual(["Rent", "Utilities", "Food", "Transport"]);
  });

  it("is a readonly tuple (as const) — TypeScript infers literal types, not string[]", () => {
    // Verify the tuple has length 4 and each element is a literal string.
    // This also confirms the `as const` assertion was applied.
    expect(ESSENTIAL_CATEGORIES).toHaveLength(4);
    // Type-level check: if `as const` is missing the inferred type would be `string[]`
    // and TypeScript would not narrow `ESSENTIAL_CATEGORIES[0]` to `"Rent"`.
    // This runtime check confirms the values are the correct literals.
    const first: "Rent" = ESSENTIAL_CATEGORIES[0];
    expect(first).toBe("Rent");
  });
});
