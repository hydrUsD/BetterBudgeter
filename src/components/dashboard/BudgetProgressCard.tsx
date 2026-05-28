/**
 * Budget Progress Card Component
 *
 * Standalone card displaying a single category's budget progress.
 * Uses a 3-level traffic-light system via --bb-* semantic tokens:
 *
 *   on_track   → positive (green)  — spending is within safe limits
 *   warning    → caution  (amber)  — approaching the monthly limit (80%+)
 *   over_budget → negative (coral)  — limit exceeded
 *
 * ADHD DESIGN RATIONALE:
 * - Instant status recognition via color + label (no mental math needed)
 * - Progress bar capped at 100% to avoid confusing overflow visuals
 * - Over-budget percentage shown as separate callout for transparency
 * - Minimal text: icon + category + status label + two amounts
 *
 * EXTENSION POINTS:
 * - Could be reused in a compact "mini" variant for the Home hub
 * - statusTokens() can be extended with a 4th level if needed
 *
 * @see docs/BUDGET_STRATEGY.md for budget calculation logic
 * @see docs/DESIGN_SYSTEM.md §5.2 for card spacing tokens
 */

import type { BudgetProgress, BudgetStatus } from "@/types/finance";
import { CATEGORY_ICONS } from "@/utils/mapping";
import { formatCurrency } from "@/utils/currency";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface BudgetProgressCardProps {
  progress: BudgetProgress;
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
    label: "Over Budget",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BudgetProgressCard({ progress }: BudgetProgressCardProps) {
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
