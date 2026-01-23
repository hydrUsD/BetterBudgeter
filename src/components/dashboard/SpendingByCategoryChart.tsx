/**
 * Spending by Category Chart Component
 *
 * Displays a donut chart showing expense breakdown by category.
 * Uses Tremor for visualization.
 *
 * ADHD DESIGN:
 * - Visual overview without reading numbers
 * - Clear category colors (consistent with rest of app)
 * - Minimal clutter, no complex legends
 * - Answers "Where does my money go?" at a glance
 *
 * DATA SOURCE:
 * - Receives pre-aggregated data from parent (server component)
 * - Does NOT fetch data directly
 *
 * @see docs/DASHBOARD_STRATEGY.md Section 4.2
 */

"use client";

import { DonutChart } from "@tremor/react";
import { CATEGORY_COLORS } from "@/utils/charts";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface CategoryData {
  category: string;
  amount: number;
  transactionCount: number;
}

interface SpendingByCategoryChartProps {
  /** Category breakdown data from getExpensesByCategory() */
  data: CategoryData[];
  /** Optional: custom class name */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SpendingByCategoryChart({
  data,
  className,
}: SpendingByCategoryChartProps) {
  // ─────────────────────────────────────────────────────────────────────────────
  // Empty State
  // ─────────────────────────────────────────────────────────────────────────────

  if (data.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center h-64 ${className ?? ""}`}>
        <p className="text-muted-foreground text-sm">
          No expense data for this month
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          Import transactions to see your spending breakdown
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Transformation
  // ─────────────────────────────────────────────────────────────────────────────

  // Transform data for Tremor DonutChart
  // Tremor expects: { name: string, value: number }[]
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
  }));

  // Calculate total for center display
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  // Get colors for each category
  // Use Tremor's predefined color names (not HEX) for Tailwind v4 compatibility
  const colors = data.map((item) => getTremorColor(item.category));

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className={className}>
      <DonutChart
        data={chartData}
        category="value"
        index="name"
        colors={colors}
        valueFormatter={formatCurrency}
        showAnimation={true}
        animationDuration={300}
        className="h-64"
        showTooltip={true}
      />

      {/* Legend - Simple list below chart */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
        {data.slice(0, 6).map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[item.category as keyof typeof CATEGORY_COLORS] ??
                  CATEGORY_COLORS.Other,
              }}
            />
            <span className="text-muted-foreground truncate">
              {item.category}
            </span>
            <span className="ml-auto font-medium">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Total display */}
      <div className="mt-4 pt-4 border-t text-center">
        <p className="text-sm text-muted-foreground">Total Expenses</p>
        <p className="text-xl font-bold">{formatCurrency(total)}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format number as EUR currency
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

/**
 * Map category to Tremor's predefined color names.
 *
 * Tremor supports these colors: blue, cyan, sky, teal, emerald, green, lime,
 * yellow, amber, orange, red, rose, pink, fuchsia, purple, violet, indigo,
 * gray, slate, zinc, neutral, stone.
 *
 * Note: HEX colors don't work with Tailwind v4 because the classes aren't generated.
 */
function getTremorColor(category: string): string {
  const colorMap: Record<string, string> = {
    // Expense categories
    Food: "red",
    Rent: "orange",
    Utilities: "amber",
    Transport: "emerald",
    Entertainment: "blue",
    Shopping: "violet",
    Other: "gray",
    // Income categories
    Salary: "green",
    Freelance: "teal",
    Investment: "cyan",
    Bonus: "sky",
  };

  return colorMap[category] ?? "gray";
}

