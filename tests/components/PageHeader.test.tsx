/**
 * PageHeader Render Tests
 *
 * Verifies that the PageHeader layout primitive renders the title as h1,
 * conditionally renders the subtitle paragraph, and wraps content in
 * a semantic header landmark (NAV-05, D-12).
 *
 * Does NOT test:
 * - Visual typography appearance or CSS variable resolution
 * - Font size, weight, or line-height measurements
 * - ADHD-friendliness or readability
 * - Color contrast (those are checker-domain / Phase 11)
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/layout/PageHeader";

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("PageHeader", () => {
  it("renders the title as h1", () => {
    render(<PageHeader title="Budgets" />);
    // D-12: title is an <h1> — one h1 per page (A11Y-03 strict heading hierarchy)
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.textContent).toBe("Budgets");
  });

  it("renders subtitle when provided", () => {
    render(
      <PageHeader title="Budgets" subtitle="Track your monthly spending limits" />
    );
    // D-12: optional subtitle rendered as <p> when prop is provided
    expect(
      screen.getByText("Track your monthly spending limits")
    ).toBeTruthy();
  });

  it("does not render subtitle when omitted", () => {
    const { container } = render(<PageHeader title="Budgets" />);
    // D-12: subtitle is conditional — no empty <p> tags rendered when prop is absent
    expect(container.querySelector("p")).toBeNull();
  });

  it("renders inside a header landmark (A11Y)", () => {
    const { container } = render(<PageHeader title="Budgets" />);
    // A11Y-03: <header> provides semantic landmark for assistive technologies
    expect(container.querySelector("header")).toBeTruthy();
  });
});
