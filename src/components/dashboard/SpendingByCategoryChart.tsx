/**
 * Spending by Category Chart Component
 *
 * Displays a donut chart showing expense breakdown by category.
 * Data is transformed from transaction objects to chart-compatible format.
 *
 * LIBRARY USAGE:
 * - shadcn/ui ChartContainer for wrapper and theming
 * - Recharts PieChart for the actual visualization
 * - @/utils/charts/CATEGORY_COLORS for consistent category colors
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
 * @see docs/UI_ARCHITECTURE.md for library decisions
 * @see docs/DASHBOARD_STRATEGY.md Section 4.2 for design rationale
 */

"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
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
// Chart Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build ChartConfig from CATEGORY_COLORS
 * Maps each category to its label and color for shadcn/ui ChartContainer
 */
const chartConfig = Object.entries(CATEGORY_COLORS).reduce(
  (acc, [key, color]) => ({
    ...acc,
    [key]: { label: key, color: color },
  }),
  {}
) satisfies ChartConfig;

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
      <div
        className={`flex flex-col items-center justify-center h-64 ${className ?? ""}`}
      >
        <p className="text-bb-sm text-bb-text-secondary">
          No expense data for this month
        </p>
        <p className="text-bb-xs text-bb-text-secondary mt-bb-1">
          Import transactions to see your spending breakdown
        </p>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Data Transformation
  // ─────────────────────────────────────────────────────────────────────────────

  // Transform data for Recharts PieChart
  // Recharts expects: { name: string, value: number }[]
  const chartData = data.map((item) => ({
    name: item.category,
    value: item.amount,
  }));

  // Calculate total for center display
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className={className}>
      {/* Donut chart using shadcn/ui ChartContainer + Recharts PieChart */}
      <ChartContainer config={chartConfig} className="min-h-[256px] w-full">
        <PieChart>
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => formatCurrency(value as number)}
              />
            }
          />
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={100}
            cx="50%"
            cy="50%"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  CATEGORY_COLORS[
                    entry.name as keyof typeof CATEGORY_COLORS
                  ] || CATEGORY_COLORS.Other
                }
              />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Legend — simple list below chart, capped at 6 categories */}
      <div className="mt-bb-4 grid grid-cols-2 gap-bb-2 text-bb-sm">
        {data.slice(0, 6).map((item) => (
          <div key={item.category} className="flex items-center gap-bb-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor:
                  CATEGORY_COLORS[
                    item.category as keyof typeof CATEGORY_COLORS
                  ] ?? CATEGORY_COLORS.Other,
              }}
            />
            <span className="text-bb-text-secondary truncate">
              {item.category}
            </span>
            <span className="ml-auto font-bold text-bb-text">
              {formatCurrency(item.amount)}
            </span>
          </div>
        ))}
      </div>

      {/* Total display */}
      <div className="mt-bb-4 pt-bb-4 border-t border-bb-border text-center">
        <p className="text-bb-sm text-bb-text-secondary">Total Expenses</p>
        <p className="text-bb-xl font-bold text-bb-text">{formatCurrency(total)}</p>
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
