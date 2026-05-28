/**
 * EmptyState Render Tests
 *
 * Tests the presentational EmptyState component (DESIGN_SYSTEM §5.6).
 * Covers both "inline" and "page" variants, and the optional action slot.
 *
 * Does NOT test:
 * - CSS variable resolution (--bb-* tokens)
 * - Visual appearance or pixel measurements
 *
 * @see docs/DESIGN_SYSTEM.md §5.6 for empty state guidelines
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState, type EmptyStateProps } from "@/components/common/EmptyState";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function renderEmptyState(overrides: Partial<EmptyStateProps> = {}) {
  const defaults: EmptyStateProps = {
    heading: "No budgets yet",
    ...overrides,
  };
  return render(<EmptyState {...defaults} />);
}

// ─────────────────────────────────────────────────────────────────────────────
// Inline variant
// ─────────────────────────────────────────────────────────────────────────────

describe("EmptyState — inline variant", () => {
  it("renders heading", () => {
    renderEmptyState({ heading: "No transactions" });

    expect(screen.getByText("No transactions")).toBeInTheDocument();
  });

  it("renders optional description", () => {
    renderEmptyState({
      heading: "No budgets yet",
      description: "Create your first budget to start tracking.",
    });

    expect(screen.getByText("No budgets yet")).toBeInTheDocument();
    expect(
      screen.getByText("Create your first budget to start tracking.")
    ).toBeInTheDocument();
  });

  it("omits description element when not provided", () => {
    const { container } = renderEmptyState({ heading: "Empty" });

    // Inline variant: the outer div should only contain one <p> (the heading)
    const paragraphs = container.querySelectorAll("p");
    expect(paragraphs).toHaveLength(1);
  });

  it("renders action slot when provided", () => {
    renderEmptyState({
      heading: "No data",
      action: <button data-testid="cta">Get started</button>,
    });

    expect(screen.getByTestId("cta")).toBeInTheDocument();
    expect(screen.getByText("Get started")).toBeInTheDocument();
  });

  it("omits action wrapper when action is not provided", () => {
    const { container } = renderEmptyState({ heading: "Nothing here" });

    // No action means no extra wrapping div for the action slot
    // The outer div should only contain <p> tags, no nested divs
    const innerDivs = container.firstElementChild!.querySelectorAll("div");
    expect(innerDivs).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Page variant
// ─────────────────────────────────────────────────────────────────────────────

describe("EmptyState — page variant", () => {
  it("renders heading as h1", () => {
    renderEmptyState({ variant: "page", heading: "Link your bank" });

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Link your bank");
  });

  it("uses centered layout with dashed border", () => {
    const { container } = renderEmptyState({
      variant: "page",
      heading: "Nothing yet",
    });

    const card = container.firstElementChild!;
    expect(card).toHaveClass("border-dashed");
    expect(card).toHaveClass("items-center");
    expect(card).toHaveClass("text-center");
  });

  it("renders description when provided", () => {
    renderEmptyState({
      variant: "page",
      heading: "Get started",
      description: "Connect a bank account to see your finances.",
    });

    expect(
      screen.getByText("Connect a bank account to see your finances.")
    ).toBeInTheDocument();
  });

  it("renders action in page variant", () => {
    renderEmptyState({
      variant: "page",
      heading: "Welcome",
      action: <a href="/link-bank">Link Bank</a>,
    });

    expect(screen.getByText("Link Bank")).toBeInTheDocument();
  });
});
