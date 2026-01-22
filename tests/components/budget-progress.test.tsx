/**
 * BudgetProgressSection Render Tests
 *
 * Verifies that the BudgetProgressSection component renders
 * without crashing with various mock data scenarios.
 *
 * Does NOT test:
 * - Database calls
 * - Real budget calculations
 * - User interactions
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BudgetProgressSection } from "@/components/dashboard/BudgetProgressSection";
import type { BudgetProgress } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────────────────────────────────────

const mockBudgetProgress: BudgetProgress[] = [
  {
    budget: {
      id: "1",
      userId: "user-1",
      category: "Food",
      monthlyLimit: 500,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    spentAmount: 250,
    remainingAmount: 250,
    usagePercentage: 50,
    status: "on_track",
    transactionCount: 10,
  },
  {
    budget: {
      id: "2",
      userId: "user-1",
      category: "Entertainment",
      monthlyLimit: 200,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    spentAmount: 170,
    remainingAmount: 30,
    usagePercentage: 85,
    status: "warning",
    transactionCount: 5,
  },
  {
    budget: {
      id: "3",
      userId: "user-1",
      category: "Shopping",
      monthlyLimit: 300,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    spentAmount: 350,
    remainingAmount: -50,
    usagePercentage: 117,
    status: "over_budget",
    transactionCount: 8,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("BudgetProgressSection", () => {
  it("renders without crashing with budget data", () => {
    const { container } = render(
      <BudgetProgressSection budgetProgress={mockBudgetProgress} />
    );
    expect(container).toBeTruthy();
  });

  it("renders empty state when no budgets exist", () => {
    render(<BudgetProgressSection budgetProgress={[]} />);
    expect(screen.getByText("Budget Tracking")).toBeTruthy();
    expect(screen.getByText(/Set monthly budgets/)).toBeTruthy();
  });

  it("renders all three budget status types", () => {
    render(<BudgetProgressSection budgetProgress={mockBudgetProgress} />);
    expect(screen.getByText("On Track")).toBeTruthy();
    expect(screen.getByText("Getting Close")).toBeTruthy();
    expect(screen.getByText("Over Budget")).toBeTruthy();
  });

  it("displays category names", () => {
    render(<BudgetProgressSection budgetProgress={mockBudgetProgress} />);
    expect(screen.getByText("Food")).toBeTruthy();
    expect(screen.getByText("Entertainment")).toBeTruthy();
    expect(screen.getByText("Shopping")).toBeTruthy();
  });

  it("shows spent and remaining amounts", () => {
    const { container } = render(
      <BudgetProgressSection budgetProgress={mockBudgetProgress} />
    );
    // Verify amounts are rendered somewhere in the component
    expect(container.textContent).toContain("250.00");
    expect(container.textContent).toContain("170.00");
    expect(container.textContent).toContain("350.00");
  });
});