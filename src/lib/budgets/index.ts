/**
 * Budget Calculation Module
 *
 * Calculates budget progress from transaction data.
 * This module contains the core business logic for budget tracking.
 *
 * KEY DESIGN DECISIONS:
 * - Budget progress is CALCULATED, not stored (transactions are source of truth)
 * - Time window is always the current calendar month
 * - Thresholds: 80% = warning, 100% = over budget
 * - Only expense categories have budgets (income budgets are out of scope)
 *
 * DATA FLOW:
 * 1. Get user's budgets from bb_budgets table
 * 2. Get current month's transactions from bb_transactions table
 * 3. Calculate spent amount per category
 * 4. Derive status from percentage
 *
 * @see docs/BUDGET_STRATEGY.md for detailed design and ADHD rationale
 */

import { getBudgets } from "@/lib/db/budgets";
import { getTransactions } from "@/lib/db/transactions";
import type { DbBudget } from "@/lib/db/types";
import type {
  Budget,
  BudgetProgress,
  BudgetStatus,
  BudgetAlert,
  ExpenseCategory,
} from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Budget threshold percentages.
 * These are fixed for MVP to provide consistent, predictable feedback.
 *
 * ADHD DESIGN: Fixed thresholds reduce decision fatigue.
 * Users don't need to configure these — they "just work".
 */
export const BUDGET_THRESHOLDS = {
  /** Warning threshold (yellow) — spending is getting high */
  WARNING: 80,
  /** Over budget threshold (red) — limit exceeded */
  OVER_BUDGET: 100,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the first day of the current month (YYYY-MM-DD format).
 */
export function getCurrentMonthStart(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}-01`;
}

/**
 * Get the last day of the current month (YYYY-MM-DD format).
 */
export function getCurrentMonthEnd(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  // Get last day by going to next month day 0
  const lastDay = new Date(year, month + 1, 0).getDate();
  const monthStr = String(month + 1).padStart(2, "0");
  return `${year}-${monthStr}-${String(lastDay).padStart(2, "0")}`;
}

/**
 * Determine budget status from usage percentage.
 *
 * TRAFFIC LIGHT MODEL:
 * - Green (on_track): < 80%
 * - Yellow (warning): 80% - 99%
 * - Red (over_budget): >= 100%
 *
 * @param usagePercentage - Percentage of budget used (0-100+)
 * @returns Status enum value
 */
export function getBudgetStatus(usagePercentage: number): BudgetStatus {
  if (usagePercentage >= BUDGET_THRESHOLDS.OVER_BUDGET) {
    return "over_budget";
  }
  if (usagePercentage >= BUDGET_THRESHOLDS.WARNING) {
    return "warning";
  }
  return "on_track";
}

/**
 * Convert database budget row to application Budget type.
 */
function dbBudgetToBudget(dbBudget: DbBudget): Budget {
  return {
    id: dbBudget.id,
    userId: dbBudget.user_id,
    category: dbBudget.category as ExpenseCategory,
    monthlyLimit: dbBudget.monthly_limit,
    createdAt: dbBudget.created_at,
    updatedAt: dbBudget.updated_at,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Calculation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculate spending per category for the current month.
 *
 * @returns Map of category → { spent: number, count: number }
 */
export async function calculateMonthlySpending(): Promise<
  Map<string, { spent: number; count: number }>
> {
  const fromDate = getCurrentMonthStart();
  const toDate = getCurrentMonthEnd();

  const transactions = await getTransactions({ fromDate, toDate });

  // Aggregate expenses by category
  const spending = new Map<string, { spent: number; count: number }>();

  for (const tx of transactions) {
    // Only count expense transactions
    if (tx.type !== "expense") {
      continue;
    }

    const category = tx.category ?? "Other";
    const current = spending.get(category) ?? { spent: 0, count: 0 };

    spending.set(category, {
      spent: current.spent + Math.abs(tx.amount),
      count: current.count + 1,
    });
  }

  return spending;
}

/**
 * Calculate budget progress for all user budgets.
 *
 * This is the main function called by the dashboard to display budget cards.
 *
 * @returns Array of BudgetProgress for all configured budgets
 */
export async function calculateAllBudgetProgress(): Promise<BudgetProgress[]> {
  // Fetch budgets and spending in parallel
  const [dbBudgets, spending] = await Promise.all([
    getBudgets(),
    calculateMonthlySpending(),
  ]);

  // Calculate progress for each budget
  return dbBudgets.map((dbBudget) => {
    const budget = dbBudgetToBudget(dbBudget);
    const categorySpending = spending.get(budget.category) ?? {
      spent: 0,
      count: 0,
    };

    const spentAmount = categorySpending.spent;
    const remainingAmount = Math.max(0, budget.monthlyLimit - spentAmount);
    const usagePercentage =
      budget.monthlyLimit > 0
        ? (spentAmount / budget.monthlyLimit) * 100
        : spentAmount > 0
        ? 100
        : 0;
    const status = getBudgetStatus(usagePercentage);

    return {
      budget,
      spentAmount,
      remainingAmount,
      usagePercentage,
      status,
      transactionCount: categorySpending.count,
    };
  });
}

/**
 * Calculate budget progress for a specific category.
 *
 * @param category - The expense category
 * @returns BudgetProgress or null if no budget exists for this category
 */
export async function calculateBudgetProgressForCategory(
  category: string
): Promise<BudgetProgress | null> {
  const allProgress = await calculateAllBudgetProgress();
  return allProgress.find((p) => p.budget.category === category) ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check which budgets have crossed thresholds.
 *
 * This function is called after import to determine which notifications
 * should be shown. It compares current state to thresholds.
 *
 * DEDUPLICATION NOTE:
 * This function only determines WHAT thresholds are crossed.
 * The caller is responsible for tracking which notifications
 * have already been shown (to prevent spam on re-import).
 *
 * @returns Array of BudgetAlert for budgets at warning or over_budget status
 */
export async function checkBudgetThresholds(): Promise<BudgetAlert[]> {
  const allProgress = await calculateAllBudgetProgress();

  return allProgress
    .filter((p) => p.status === "warning" || p.status === "over_budget")
    .map((p) => ({
      category: p.budget.category,
      status: p.status,
      spentAmount: p.spentAmount,
      monthlyLimit: p.budget.monthlyLimit,
      usagePercentage: p.usagePercentage,
    }));
}

/**
 * Generate user-friendly message for a budget alert.
 *
 * ADHD DESIGN:
 * - Short, actionable messages
 * - Non-judgmental tone ("exceeded" not "failed")
 * - Concrete numbers (not just percentages)
 *
 * @param alert - The budget alert data
 * @returns Human-readable message
 */
export function formatBudgetAlertMessage(alert: BudgetAlert): string {
  const spent = alert.spentAmount.toFixed(2);
  const limit = alert.monthlyLimit.toFixed(2);
  const percentage = Math.round(alert.usagePercentage);

  if (alert.status === "over_budget") {
    return `${alert.category} budget exceeded: €${spent} of €${limit} (${percentage}%)`;
  }

  return `${alert.category} budget warning: €${spent} of €${limit} (${percentage}%)`;
}

/**
 * Generate notification title for a budget alert.
 *
 * @param alert - The budget alert data
 * @returns Short title for notification
 */
export function formatBudgetAlertTitle(alert: BudgetAlert): string {
  if (alert.status === "over_budget") {
    return `${alert.category} budget exceeded`;
  }
  return `${alert.category} budget warning`;
}