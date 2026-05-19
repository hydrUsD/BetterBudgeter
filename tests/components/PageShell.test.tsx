/**
 * PageShell Render Tests
 *
 * Verifies that the PageShell layout primitive renders with the correct
 * HTML landmark, max-width constraint, bottom padding formula, and
 * optional className merge (NAV-05, D-11).
 *
 * Does NOT test:
 * - Visual appearance or pixel measurements
 * - CSS variable resolution (--bb-space-* tokens)
 * - Responsive behavior across breakpoints
 * - ADHD-friendliness or readability
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageShell } from "@/components/layout/PageShell";

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("PageShell", () => {
  it("renders children inside a main landmark", () => {
    render(
      <PageShell>
        <p>hello</p>
      </PageShell>
    );
    // D-11: wraps content in a single <main> semantic landmark (A11Y-03)
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();
  });

  it("applies max-width and centering classes (NAV-05)", () => {
    const { container } = render(<PageShell>x</PageShell>);
    const main = container.querySelector("main");
    // D-11: single-column layout, max-width 768px, horizontally centered
    expect(main?.className).toContain("max-w-[768px]");
    expect(main?.className).toContain("mx-auto");
  });

  it("applies bottom padding clearing the TabBar (NAV-05)", () => {
    const { container } = render(<PageShell>x</PageShell>);
    const main = container.querySelector("main");
    // D-11: bottom padding = 56px (TabBar height) + env(safe-area-inset-bottom) + 1rem breathing room
    expect(main?.className).toContain(
      "pb-[calc(56px+env(safe-area-inset-bottom)+1rem)]"
    );
  });

  it("merges optional className prop", () => {
    const { container } = render(<PageShell className="custom">x</PageShell>);
    const main = container.querySelector("main");
    // className prop is merged via cn() — allows pages to extend the shell when needed
    expect(main?.className).toContain("custom");
  });
});
