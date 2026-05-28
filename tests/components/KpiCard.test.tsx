/**
 * KpiCard Render Tests
 *
 * Tests the presentational KpiCard component (DESIGN_SYSTEM §5.1).
 *
 * Does NOT test:
 * - CSS variable resolution (--bb-* tokens are class names, not values)
 * - Visual appearance or pixel measurements
 *
 * @see docs/DESIGN_SYSTEM.md §5.1 for KPI card visual spec
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard, type KpiCardProps } from "@/components/dashboard/KpiCard";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function renderKpiCard(overrides: Partial<KpiCardProps> = {}) {
  const defaults: KpiCardProps = {
    label: "Income",
    value: "€1,200.00",
    ...overrides,
  };
  return render(<KpiCard {...defaults} />);
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("KpiCard", () => {
  it("renders label and value", () => {
    renderKpiCard({ label: "Expenses", value: "€450.00" });

    expect(screen.getByText("Expenses")).toBeInTheDocument();
    expect(screen.getByText("€450.00")).toBeInTheDocument();
  });

  it("uses text-bb-text as default valueColor", () => {
    const { container } = renderKpiCard({ value: "€100.00" });

    // The value is the second <p> inside the card — it should have the default color class
    const valueParagraph = container.querySelectorAll("p")[1];
    expect(valueParagraph).toHaveClass("text-bb-text");
  });

  it("applies custom valueColor class", () => {
    const { container } = renderKpiCard({
      value: "€800.00",
      valueColor: "text-bb-positive",
    });

    const valueParagraph = container.querySelectorAll("p")[1];
    expect(valueParagraph).toHaveClass("text-bb-positive");
    expect(valueParagraph).not.toHaveClass("text-bb-text");
  });

  it("accepts ReactNode as value (not just string)", () => {
    renderKpiCard({
      value: <span data-testid="custom-value">€2,500.00</span>,
    });

    expect(screen.getByTestId("custom-value")).toBeInTheDocument();
    expect(screen.getByText("€2,500.00")).toBeInTheDocument();
  });

  it("uses --bb-* token classes for surface and border", () => {
    const { container } = renderKpiCard();

    // The outer div should use design token classes (K002)
    const card = container.firstElementChild!;
    expect(card).toHaveClass("bg-bb-surface");
    expect(card).toHaveClass("border-bb-border");
  });
});
