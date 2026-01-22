/**
 * SpendingByCategoryChart Render Tests
 *
 * Verifies that the SpendingByCategoryChart component renders
 * without crashing with mock data.
 *
 * Note: The Tremor DonutChart uses Recharts internally which renders SVG.
 * jsdom has limited SVG support, so we only test that the component
 * mounts and renders its non-chart elements (legend, totals).
 *
 * Does NOT test:
 * - Chart SVG rendering accuracy
 * - Color correctness (visual verification only)
 * - Tooltip behavior
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SpendingByCategoryChart } from "@/components/dashboard/SpendingByCategoryChart";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const mockCategoryData = [
  { category: "Food", amount: 250, transactionCount: 10 },
  { category: "Rent", amount: 800, transactionCount: 1 },
  { category: "Transport", amount: 120, transactionCount: 15 },
  { category: "Entertainment", amount: 80, transactionCount: 4 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("SpendingByCategoryChart", () => {
  it("renders without crashing with category data", () => {
    const { container } = render(
      <SpendingByCategoryChart data={mockCategoryData} />
    );
    expect(container).toBeTruthy();
  });

  it("renders empty state when no data exists", () => {
    render(<SpendingByCategoryChart data={[]} />);
    expect(screen.getByText(/No expense data/)).toBeTruthy();
  });

  it("displays total expenses", () => {
    render(<SpendingByCategoryChart data={mockCategoryData} />);
    expect(screen.getByText("Total Expenses")).toBeTruthy();
  });

  it("displays category names in legend", () => {
    render(<SpendingByCategoryChart data={mockCategoryData} />);
    expect(screen.getByText("Food")).toBeTruthy();
    expect(screen.getByText("Rent")).toBeTruthy();
    expect(screen.getByText("Transport")).toBeTruthy();
  });
});