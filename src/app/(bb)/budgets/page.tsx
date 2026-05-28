/**
 * BetterBudget Budgets Page
 *
 * WHAT:
 * The Budgets spoke page — detailed view of all budget categories with progress
 * cards, a spending-by-category donut chart, and a link to edit budgets in settings.
 *
 * SECTIONS:
 *   1. Monthly overview card — total budgeted vs total spent (summary KPI)
 *   2. BudgetProgressSection — per-category progress cards with traffic-light status
 *   3. SpendingByCategoryChart — donut chart showing expense breakdown
 *   4. "Edit budgets →" link to /settings
 *
 * AUTH:
 * Protected by middleware (src/middleware.ts) — unauthenticated users are
 * redirected to /login before this page even runs.
 *
 * DATA FLOW:
 *   Promise.all([
 *     calculateAllBudgetProgress(),
 *     getExpensesByCategory(),
 *     getTransactionSummary({ fromDate, toDate })
 *   ])
 *
 * EDGE STATES:
 *   0 budgets → BudgetProgressSection shows inline CTA to /settings
 *   0 transactions → SpendingByCategoryChart shows "No expense data" message
 *   DB error → neutral inline note at bottom, sections render with empty data
 *
 * @see docs/BUDGET_STRATEGY.md for budget tracking design
 * @see docs/DESIGN_SYSTEM.md §7.2 for page layout spec
 */

import Link from "next/link";

import { generateMetadata } from "@/lib/head";
import { calculateAllBudgetProgress } from "@/lib/budgets";
import {
  getExpensesByCategory,
  type CategoryBreakdown,
} from "@/lib/db/transactions";
import { getCurrentMonthStart, getCurrentMonthEnd } from "@/lib/budgets";
import { formatCurrency } from "@/utils/currency";

import { PageHeader } from "@/components/layout/PageHeader";
import { BudgetProgressSection, SpendingByCategoryChart, KpiCard } from "@/components/dashboard";
import type { BudgetProgress } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = generateMetadata({ title: "Budgets" });

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default async function BudgetsPage() {
  // Date range for current month (used by summary + chart queries)
  const fromDate = getCurrentMonthStart();
  const toDate = getCurrentMonthEnd();

  // Default empty state — used if DB fetch fails
  let budgetProgress: BudgetProgress[] = [];
  let categoryBreakdown: CategoryBreakdown[] = [];
  let dataError: string | null = null;

  try {
    [budgetProgress, categoryBreakdown] = await Promise.all([
      calculateAllBudgetProgress(),
      getExpensesByCategory({ fromDate, toDate }),
    ]);
  } catch (error) {
    console.error("[budgets] Error fetching data:", error);
    dataError = error instanceof Error ? error.message : "Failed to load data";
  }

  // Compute totals for the monthly overview card
  const totalBudgeted = budgetProgress.reduce(
    (sum, p) => sum + p.budget.monthlyLimit, 0
  );
  const totalSpent = budgetProgress.reduce(
    (sum, p) => sum + p.spentAmount, 0
  );
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);

  return (
    <>
      <PageHeader title="Budgets" subtitle="Track your monthly spending limits" />

      <div className="flex flex-col gap-bb-8">

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 1: Monthly Overview Card                                       */}
        {/* Shows total budgeted vs total spent across all categories.             */}
        {/* Only renders when the user has at least one budget configured.         */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        {budgetProgress.length > 0 && (
          <section aria-labelledby="budgets-this-month">
            <h2 id="budgets-this-month" className="text-bb-xl font-bold text-bb-text mb-bb-4">This month</h2>
            <div className="grid grid-cols-3 gap-bb-4 text-center">
              <KpiCard label="Budgeted" value={formatCurrency(totalBudgeted)} />
              <KpiCard label="Spent" value={formatCurrency(totalSpent)} />
              <KpiCard
                label="Remaining"
                value={formatCurrency(totalRemaining)}
                valueColor="text-bb-positive"
              />
            </div>
          </section>
        )}

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 2: Budget Progress Cards                                       */}
        {/* Reuses BudgetProgressSection (migrated to --bb-* tokens in Phase 9).  */}
        {/* Empty state: CTA linking to /settings is handled inside the component. */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <BudgetProgressSection budgetProgress={budgetProgress} />

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 3: Spending by Category Chart                                  */}
        {/* Donut chart wrapped in shadcn/ui ChartContainer.                       */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="budgets-spending-chart" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 id="budgets-spending-chart" className="text-bb-xl font-bold text-bb-text mb-bb-4">
            Spending by category
          </h2>
          <SpendingByCategoryChart data={categoryBreakdown} />
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 4: Edit Budgets Link                                           */}
        {/* Points to /settings where BudgetSettings component lives.              */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <div className="text-center">
          <Link
            href="/settings"
            className="text-bb-sm text-bb-info underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-info focus-visible:ring-offset-2 rounded-sm"
          >
            Edit budgets →
          </Link>
        </div>
      </div>

      {/* DB error inline note — calm, not alarming */}
      {dataError && (
        <p className="text-bb-sm text-bb-text-secondary text-center mt-bb-4">
          Couldn&apos;t load budget data. Try refreshing.
        </p>
      )}
    </>
  );
}
