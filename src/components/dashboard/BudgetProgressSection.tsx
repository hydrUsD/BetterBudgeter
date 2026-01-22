/**
 * Budget Progress Section Component
 *
 * Displays budget progress for all tracked categories on the dashboard.
 * Uses traffic light colors (green/yellow/red) for ADHD-friendly feedback.
 *
 * ADHD DESIGN:
 * - Clear visual status at a glance (color-coded)
 * - Progress bars for quick visual feedback
 * - Shows only set budgets (no overwhelming list)
 * - Links to settings if no budgets set
 *
 * @see docs/BUDGET_STRATEGY.md for design rationale
 */

import Link from "next/link";
import type { BudgetProgress } from "@/types/finance";
import { CATEGORY_ICONS } from "@/utils/mapping";

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
  // Empty state: no budgets set
  if (budgetProgress.length === 0) {
    return (
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-2">Budget Tracking</h2>
        <p className="text-muted-foreground text-sm mb-4">
          Set monthly budgets to track your spending by category.
        </p>
        <Link
          href="/settings"
          className="text-sm underline hover:text-foreground"
        >
          Set up budgets →
        </Link>
      </section>
    );
  }

  return (
    <section className="border rounded-lg p-6 bg-card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Budget Progress</h2>
        <Link
          href="/settings"
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Edit budgets
        </Link>
      </div>

      <div className="grid gap-4">
        {budgetProgress.map((progress) => (
          <BudgetProgressCard key={progress.budget.id} progress={progress} />
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget Progress Card
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetProgressCardProps {
  progress: BudgetProgress;
}

function BudgetProgressCard({ progress }: BudgetProgressCardProps) {
  const { budget, spentAmount, remainingAmount, usagePercentage, status } = progress;
  const icon = CATEGORY_ICONS[budget.category] || "📦";

  // Traffic light colors based on status
  const statusColors = {
    on_track: {
      bg: "bg-green-100 dark:bg-green-950",
      bar: "bg-green-500",
      text: "text-green-700 dark:text-green-300",
      label: "On Track",
    },
    warning: {
      bg: "bg-amber-100 dark:bg-amber-950",
      bar: "bg-amber-500",
      text: "text-amber-700 dark:text-amber-300",
      label: "Getting Close",
    },
    over_budget: {
      bg: "bg-red-100 dark:bg-red-950",
      bar: "bg-red-500",
      text: "text-red-700 dark:text-red-300",
      label: "Over Budget",
    },
  };

  const colors = statusColors[status];

  // Cap the progress bar at 100% for visual display
  const displayPercentage = Math.min(usagePercentage, 100);

  return (
    <div className={`p-4 rounded-lg ${colors.bg}`}>
      {/* Header: Category + Status */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium">{budget.category}</span>
        </div>
        <span className={`text-xs font-medium ${colors.text}`}>
          {colors.label}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${colors.bar} transition-all duration-300`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>

      {/* Footer: Amounts */}
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          €{spentAmount.toFixed(2)} spent
        </span>
        <span className={remainingAmount >= 0 ? "text-muted-foreground" : colors.text}>
          {remainingAmount >= 0
            ? `€${remainingAmount.toFixed(2)} left`
            : `€${Math.abs(remainingAmount).toFixed(2)} over`}
        </span>
      </div>

      {/* Percentage indicator for over-budget */}
      {usagePercentage > 100 && (
        <div className={`text-xs ${colors.text} mt-1`}>
          {usagePercentage.toFixed(0)}% of budget used
        </div>
      )}
    </div>
  );
}