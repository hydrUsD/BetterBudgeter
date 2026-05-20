/**
 * Safe-to-Spend Calculation Module
 *
 * WHAT:
 * Computes the discretionary EUR amount a user can spend this month
 * without risking their essential commitments. This is the Home hub's
 * hero metric — the single most important number for an ADHD user.
 *
 * FORMULA:
 *
 *   safeToSpend =
 *       Σ (balance of accounts where account_type ∈ {'checking', 'savings'})
 *     − Σ (remainingAmount for budgets where category ∈ ESSENTIAL_CATEGORIES)
 *     clamped to Math.max(0, ...)  ← never show a negative number
 *
 * WHY:
 * ADHD users need a calm, glanceable answer to "how much can I spend today?"
 * Raw account balance is misleading (it doesn't account for upcoming Rent).
 * Category-by-category breakdowns create cognitive overload.
 * Safe-to-Spend collapses both into one honest number.
 *
 * LIMITATIONS:
 * - ESSENTIAL_CATEGORIES is hardcoded, not user-configurable in v2.0.
 *   All four (Rent, Utilities, Food, Transport) are always essential.
 * - Calendar-month window only. Rolling 30-day window not implemented.
 * - Credit-card debt is NOT subtracted: the mock doesn't cleanly model
 *   outstanding credit debt vs. credit limit, so credit accounts are
 *   excluded entirely from the balance sum instead.
 * - In-flight / uncategorized transactions are not yet accounted for.
 *
 * TODO (v3+ milestone): Move ESSENTIAL_CATEGORIES to per-budget is_essential
 *   boolean on bb_budgets. Requires ADR + schema migration + RLS update +
 *   Settings UI. See .planning/phases/08-home-hub/08-CONTEXT.md "Deferred Ideas".
 *
 * @see docs/ADHD_UX_RESEARCH.md for Safe-to-Spend rationale (lines 239, 318, 430)
 * @see docs/DESIGN_SYSTEM.md §7.2 for placement context on the Home hub
 */

import type { DbAccount } from "@/lib/db/types";
import type { BudgetProgress } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The four essential expense categories whose remaining budget allowances
 * are subtracted from the spendable pool.
 *
 * ADHD DESIGN: Fixed list reduces decision fatigue.
 * Entertainment, Shopping, and Other are intentionally NOT in this list —
 * they ARE what Safe-to-Spend is meant to protect. Including them would
 * defeat the purpose of the metric.
 *
 * PRECEDENT: Follows the same hardcoded-policy pattern as BUDGET_THRESHOLDS
 * in src/lib/budgets/index.ts and the ExpenseCategory enum in src/types/finance.ts.
 * Policy lives in code, not in the database.
 *
 * TODO (v3+ milestone): Replace with a per-budget `is_essential` boolean on
 *   bb_budgets. This would let users mark categories as essential in Settings.
 */
export const ESSENTIAL_CATEGORIES = [
  "Rent",
  "Utilities",
  "Food",
  "Transport",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Pure Calculation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Compute the Safe-to-Spend amount from account balances and budget progress.
 *
 * This is a PURE function — it accepts pre-fetched data and has no side effects.
 * The page component owns DB orchestration: it calls getAccounts() and
 * calculateAllBudgetProgress() then passes the results here.
 *
 * WHY pure: unit-testable without any DB mock, deterministic for demo + testing,
 * and easy to reason about in isolation. See "Two-layer function design" in
 * .planning/phases/08-home-hub/08-PATTERNS.md for the architectural rationale.
 *
 * @param accounts        - All linked accounts for the current user (DbAccount[])
 * @param budgetProgress  - Current-month budget progress for all configured budgets
 * @returns               - Safe-to-Spend amount in EUR (always >= 0)
 */
export function computeSafeToSpend(
  accounts: DbAccount[],
  budgetProgress: BudgetProgress[]
): number {
  // Step 1: Sum liquid account balances only.
  //
  // D-S2S-03: credit is debt (not money the user owns), investment is illiquid
  // (we can't assume shares can be sold instantly). Only checking + savings
  // represent money actually available for day-to-day spending.
  //
  // `balance ?? 0` guards against DB rows where balance was not populated.
  const totalBalance = accounts
    .filter(
      (acc) =>
        acc.account_type === "checking" || acc.account_type === "savings"
    )
    .reduce((sum, acc) => sum + (acc.balance ?? 0), 0);

  // Step 2: Sum the remaining essential-category budget allowances.
  //
  // D-S2S-02: BudgetProgress.remainingAmount is ALREADY clamped to
  // Math.max(0, monthlyLimit - spentAmount) by src/lib/budgets/index.ts:174.
  // DO NOT re-clamp here. An over-budget category contributes 0 (not negative),
  // which is correct: an overage on Rent must NOT falsely raise Safe-to-Spend.
  const essentialCommitted = budgetProgress
    .filter((p) =>
      (ESSENTIAL_CATEGORIES as readonly string[]).includes(p.budget.category)
    )
    .reduce((sum, p) => sum + p.remainingAmount, 0);

  // Step 3: Return the difference, clamped to zero.
  //
  // Result-level clamp: a user with €100 balance and €500 Rent commitment
  // shouldn't see −€400 ("safe to overdraft" is not a meaningful signal).
  // 0 communicates the truth: no headroom this month.
  return Math.max(0, totalBalance - essentialCommitted);
}

// NOTE: This module exports ONLY the pure compute function.
// Page components fetch accounts + BudgetProgress via Promise.all and call
// computeSafeToSpend(...) directly. No DB code lives here.
// See src/app/(bb)/page.tsx for the orchestration pattern.
