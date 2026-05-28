/**
 * BudgetProgressCard Render Tests
 *
 * Tests the standalone BudgetProgressCard component (DESIGN_SYSTEM §5.2).
 * Verifies the 3-level traffic-light status system, progress bar rendering,
 * and over-budget percentage callout.
 *
 * Does NOT test:
 * - Budget calculation logic (covered in lib/budgets tests)
 * - CSS variable resolution (--bb-* tokens are class names)
 * - Visual appearance or pixel measurements
 *
 * @see docs/DESIGN_SYSTEM.md §5.2 for card visual spec
 * @see docs/BUDGET_STRATEGY.md for status thresholds
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BudgetProgressCard } from "@/components/dashboard/BudgetProgressCard";
import type { BudgetProgress } from "@/types/finance";
import { formatCurrency } from "@/utils/currency";

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory for creating BudgetProgress fixtures.
 * Callers override only the fields relevant to each test case.
 */
function makeBudgetProgress(
  overrides: Partial<BudgetProgress> = {}
): BudgetProgress {
  return {
    budget: {
      id: "budget-1",
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
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Status token tests (traffic light system)
// ─────────────────────────────────────────────────────────────────────────────

describe("BudgetProgressCard — status tokens", () => {
  it("on_track: renders green token classes and 'On Track' label", () => {
    const { container } = render(
      <BudgetProgressCard progress={makeBudgetProgress({ status: "on_track" })} />
    );

    expect(screen.getByText("On Track")).toBeInTheDocument();

    // Outer card should use positive-bg token
    const card = container.firstElementChild!;
    expect(card).toHaveClass("bg-bb-positive-bg");
  });

  it("warning: renders amber token classes and 'Getting Close' label", () => {
    const { container } = render(
      <BudgetProgressCard
        progress={makeBudgetProgress({
          status: "warning",
          spentAmount: 420,
          remainingAmount: 80,
          usagePercentage: 84,
        })}
      />
    );

    expect(screen.getByText("Getting Close")).toBeInTheDocument();

    const card = container.firstElementChild!;
    expect(card).toHaveClass("bg-bb-caution-bg");
  });

  it("over_budget: renders coral token classes and 'Over Budget' label", () => {
    const { container } = render(
      <BudgetProgressCard
        progress={makeBudgetProgress({
          status: "over_budget",
          spentAmount: 600,
          remainingAmount: -100,
          usagePercentage: 120,
        })}
      />
    );

    expect(screen.getByText("Over Budget")).toBeInTheDocument();

    const card = container.firstElementChild!;
    expect(card).toHaveClass("bg-bb-negative-bg");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Progress bar
// ─────────────────────────────────────────────────────────────────────────────

describe("BudgetProgressCard — progress bar", () => {
  it("bar width matches usagePercentage", () => {
    const { container } = render(
      <BudgetProgressCard
        progress={makeBudgetProgress({ usagePercentage: 65 })}
      />
    );

    // The progress bar fill is the inner div of the track container
    const track = container.querySelector(".h-2.bg-bb-surface-raised")!;
    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("65%");
  });

  it("caps bar width at 100% when over budget", () => {
    const { container } = render(
      <BudgetProgressCard
        progress={makeBudgetProgress({
          status: "over_budget",
          usagePercentage: 150,
          spentAmount: 750,
          remainingAmount: -250,
        })}
      />
    );

    const track = container.querySelector(".h-2.bg-bb-surface-raised")!;
    const fill = track.firstElementChild as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Over-budget callout
// ─────────────────────────────────────────────────────────────────────────────

describe("BudgetProgressCard — over-budget callout", () => {
  it("shows percentage callout when usage exceeds 100%", () => {
    render(
      <BudgetProgressCard
        progress={makeBudgetProgress({
          status: "over_budget",
          usagePercentage: 120,
          spentAmount: 600,
          remainingAmount: -100,
        })}
      />
    );

    expect(screen.getByText("120% of budget used")).toBeInTheDocument();
  });

  it("does not show callout when usage is at or below 100%", () => {
    render(
      <BudgetProgressCard
        progress={makeBudgetProgress({ usagePercentage: 100 })}
      />
    );

    expect(screen.queryByText(/of budget used/)).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Amounts display
// ─────────────────────────────────────────────────────────────────────────────

describe("BudgetProgressCard — amounts", () => {
  it("renders spent and remaining amounts with formatCurrency", () => {
    render(
      <BudgetProgressCard
        progress={makeBudgetProgress({
          spentAmount: 320,
          remainingAmount: 180,
        })}
      />
    );

    // Text nodes may be split by React interpolation, so use substring matching
    expect(screen.getByText(/320,00.*spent/)).toBeInTheDocument();
    expect(screen.getByText(/180,00.*left/)).toBeInTheDocument();
  });

  it("shows 'over' instead of 'left' when over budget", () => {
    render(
      <BudgetProgressCard
        progress={makeBudgetProgress({
          status: "over_budget",
          spentAmount: 600,
          remainingAmount: -100,
          usagePercentage: 120,
        })}
      />
    );

    expect(screen.getByText(/100,00.*over/)).toBeInTheDocument();
  });

  it("renders the category name", () => {
    render(
      <BudgetProgressCard progress={makeBudgetProgress()} />
    );

    expect(screen.getByText("Food")).toBeInTheDocument();
  });
});
