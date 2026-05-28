/**
 * Budget Progress Section Component
 *
 * Displays budget progress cards for all tracked categories.
 * Uses BudgetProgressCard for individual category rendering.
 *
 * ADHD DESIGN:
 * - Clear visual status at a glance (color-coded progress bars)
 * - Shows only set budgets (no overwhelming list)
 * - Links to settings if no budgets set
 *
 * @see docs/BUDGET_STRATEGY.md for design rationale
 * @see ./BudgetProgressCard.tsx for individual card component
 */

import Link from "next/link";
import type { BudgetProgress } from "@/types/finance";
import { BudgetProgressCard } from "./BudgetProgressCard";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetProgressSectionProps {
  /** Array of budget progress data */
  budgetProgress: BudgetProgress[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BudgetProgressSection({ budgetProgress }: BudgetProgressSectionProps) {
  if (budgetProgress.length === 0) {
    return (
      <section aria-labelledby="budget-tracking-empty" className="border border-dashed border-bb-border rounded-bb-lg p-bb-6">
        <h2 id="budget-tracking-empty" className="text-bb-xl font-bold text-bb-text mb-bb-2">Budget Tracking</h2>
        <p className="text-bb-sm text-bb-text-secondary mb-bb-4">
          Set monthly budgets to track your spending by category.
        </p>
        <Link
          href="/settings"
          className="text-bb-sm text-bb-info underline-offset-4 hover:underline"
        >
          Set up budgets →
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="budget-progress-heading" className="border border-bb-border rounded-bb-lg p-bb-5 bg-bb-surface">
      <div className="flex justify-between items-center mb-bb-4">
        <h2 id="budget-progress-heading" className="text-bb-xl font-bold text-bb-text">Budget Progress</h2>
        <Link
          href="/settings"
          className="text-bb-sm text-bb-text-secondary hover:text-bb-text underline-offset-4 hover:underline"
        >
          Edit budgets
        </Link>
      </div>

      <div className="grid gap-bb-3">
        {budgetProgress.map((progress) => (
          <BudgetProgressCard key={progress.budget.id} progress={progress} />
        ))}
      </div>
    </section>
  );
}

