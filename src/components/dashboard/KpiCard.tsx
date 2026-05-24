/**
 * KpiCard — Compact metric display card (label + value).
 *
 * WHAT:
 * A small presentational card showing a single KPI: a text label above a
 * formatted value. Used wherever the app surfaces a numeric summary
 * (Income/Expenses on /transactions, Budgeted/Spent/Remaining on /budgets).
 *
 * WHY a shared component:
 * The label + value card pattern was duplicated inline on /transactions and
 * /budgets in Phase 9. Extracting it into a reusable component ensures visual
 * consistency across pages and reduces copy-paste maintenance.
 *
 * EXTENSION POINTS:
 * - Add an icon prop if a future design adds icons alongside labels.
 * - Add a subtitle or trend indicator below the value for sparkline-style cards.
 *
 * STYLING:
 * Uses --bb-* design tokens exclusively (K002). The value color is configurable
 * via the `valueColor` prop — defaults to text-bb-text (neutral).
 *
 * @see docs/DESIGN_SYSTEM.md §5.1 for KPI card visual spec
 */

import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  /** The metric label shown above the value (e.g. "Income", "Spent"). */
  label: string;

  /** The formatted value to display (e.g. "€1,200.00"). Accepts string or ReactNode
   *  so the caller can pass pre-formatted currency strings or richer content. */
  value: ReactNode;

  /** Tailwind color class for the value text.
   *  Common values: "text-bb-positive" (green), "text-bb-negative" (coral),
   *  "text-bb-text" (neutral). Defaults to "text-bb-text". */
  valueColor?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a bordered card with a label and a large formatted value.
 *
 * This is a pure presentational component — no data fetching, no side effects.
 * The parent page is responsible for computing the value and choosing the color.
 */
export function KpiCard({ label, value, valueColor = "text-bb-text" }: KpiCardProps) {
  return (
    <div className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
      <p className="text-bb-sm text-bb-text-secondary">{label}</p>
      <p className={`text-bb-xl font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
