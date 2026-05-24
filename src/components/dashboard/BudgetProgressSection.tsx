/**
 * Budget Progress Section Component
 *
 * Displays budget progress cards for all tracked categories.
 * Uses --bb-* semantic tokens for traffic-light status colors (positive/caution/negative).
 *
 * ADHD DESIGN:
 * - Clear visual status at a glance (color-coded progress bars)
 * - Shows only set budgets (no overwhelming list)
 * - Links to settings if no budgets set
 *
 * TOKEN USAGE (Phase 9 migration):
 * - bg-bb-positive-bg / text-bb-positive → on_track
 * - bg-bb-caution-bg / text-bb-caution → warning
 * - bg-bb-negative-bg / text-bb-negative → over_budget
 * - bg-bb-surface, text-bb-text, text-bb-text-secondary for neutral elements
 *
 * @see docs/BUDGET_STRATEGY.md for design rationale
 */

import Link from "next/link";
import type { BudgetProgress, BudgetStatus } from "@/types/finance";
import { CATEGORY_ICONS } from "@/utils/mapping";
import { formatCurrency } from "@/utils/currency";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetProgressSectionProps {
  /** Array of budget progress data */
  budgetProgress: BudgetProgress[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map BudgetStatus to --bb-* semantic token classes.
 * Three-level traffic light: positive (green) → caution (amber) → negative (coral).
 */
function statusTokens(status: BudgetStatus) {
  if (status === "on_track") {
    return {
      bg: "bg-bb-positive-bg",
      bar: "bg-bb-positive",
      text: "text-bb-positive",
      label: "On Track",
    };
  }
  if (status === "warning") {
    return {
      bg: "bg-bb-caution-bg",
      bar: "bg-bb-caution",
      text: "text-bb-caution",
      label: "Getting Close",
    };
  }
  return {
    bg: "bg-bb-negative-bg",
    bar: "bg-bb-negative",
    text: "text-bb-negative",
    label: "Limit reached",
  };
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

// ─────────────────────────────────────────────────────────────────────────────
// Budget Progress Card
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetProgressCardProps {
  progress: BudgetProgress;
}

function BudgetProgressCard({ progress }: BudgetProgressCardProps) {
  const { budget, spentAmount, remainingAmount, usagePercentage, status } = progress;
  const icon = CATEGORY_ICONS[budget.category] || "📦";
  const colors = statusTokens(status);
  const displayPercentage = Math.min(usagePercentage, 100);

  return (
    <div className={`p-bb-3 rounded-bb-md ${colors.bg}`}>
      {/* Header: Category icon + name + status label */}
      <div className="flex justify-between items-center mb-bb-1">
        <div className="flex items-center gap-bb-2">
          <span>{icon}</span>
          <span className="text-bb-base font-bold text-bb-text">{budget.category}</span>
        </div>
        <span className={`text-bb-xs font-bold ${colors.text}`}>
          {colors.label}
        </span>
      </div>

      {/* Progress bar: track is surface-raised, fill is status-colored */}
      <div className="h-2 bg-bb-surface-raised rounded-full overflow-hidden mb-bb-1">
        <div
          className={`h-full ${colors.bar} transition-all duration-300`}
          style={{ width: `${displayPercentage}%` }}
        />
      </div>

      {/* Footer: spent + remaining amounts */}
      <div className="flex justify-between text-bb-sm">
        <span className="text-bb-text-secondary">
          {formatCurrency(spentAmount)} spent
        </span>
        <span className={remainingAmount > 0 ? "text-bb-text-secondary" : colors.text}>
          {remainingAmount > 0
            ? `${formatCurrency(remainingAmount)} left`
            : `${formatCurrency(Math.abs(remainingAmount))} over`}
        </span>
      </div>

      {/* Over-budget percentage callout */}
      {usagePercentage > 100 && (
        <div className={`text-bb-xs ${colors.text} mt-bb-1`}>
          {usagePercentage.toFixed(0)}% of budget used
        </div>
      )}
    </div>
  );
}