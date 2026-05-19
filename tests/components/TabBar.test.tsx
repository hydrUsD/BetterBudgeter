/**
 * TabBar Render Tests
 *
 * Verifies that the TabBar component renders 4 tabs with correct hrefs/labels (NAV-01),
 * applies active/inactive styling based on pathname (NAV-02), and uses next/link
 * for instant client-side navigation (NAV-03).
 *
 * Coverage:
 * - NAV-01: 4 tabs — Home, Budgets, Transactions, Settings — correct labels and hrefs (D-10)
 * - NAV-02: Active tab gets aria-current="page" and text-bb-info; inactive gets text-bb-text-secondary (D-10)
 * - NAV-03: Each tab is a next/link <a> for instant routing (D-10)
 * - A11Y-03: <nav> has aria-label="Primary"
 * - Anti-Pattern #14: exact match for "/" — does NOT activate when pathname is "/budgets"
 *
 * Does NOT test:
 * - Real Next.js routing (usePathname is mocked)
 * - Click-through navigation (next/link is trusted, mocked to plain <a>)
 * - Visual quality of the filled-icon trick (manual visual check in Plan 04)
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { TabBar } from "@/components/layout/TabBar";

// ─────────────────────────────────────────────────────────────────────────────
// Module Mocks
// ─────────────────────────────────────────────────────────────────────────────

// Mock next/navigation so we can control which pathname is returned in each test.
// This is necessary because TabBar is a client component that calls usePathname()
// to determine which tab is active — in jsdom there is no real Next.js router.
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

// Mock next/link to render as a plain <a href> in jsdom.
// next/link in the real app requires the App Router context, which is not
// available in our test environment. The <a href> is equivalent for testing
// link targets and aria attributes — we trust Next.js link behavior separately.
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("TabBar", () => {
  // Reset usePathname mock to "/" before each test so tests are independent
  beforeEach(() => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/");
  });

  // NAV-01: The TabBar must render exactly 4 tabs with the correct visible labels (D-10)
  it("renders all 4 tabs with correct labels (NAV-01)", () => {
    render(<TabBar />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Budgets")).toBeTruthy();
    expect(screen.getByText("Transactions")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  // NAV-01: Each tab link must point to the correct href (D-10 TABS array contract)
  it("each tab link has correct href (NAV-01)", () => {
    render(<TabBar />);
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Budgets" }).getAttribute("href")).toBe("/budgets");
    expect(screen.getByRole("link", { name: "Transactions" }).getAttribute("href")).toBe("/transactions");
    expect(screen.getByRole("link", { name: "Settings" }).getAttribute("href")).toBe("/settings");
  });

  // NAV-02: The tab matching the current pathname must be marked with aria-current="page"
  // and all other tabs must NOT have aria-current (D-10 active-state detection via usePathname)
  it("marks the matching tab as active via aria-current (NAV-02)", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/budgets");
    render(<TabBar />);
    // Active tab: aria-current="page"
    expect(screen.getByRole("link", { name: "Budgets" }).getAttribute("aria-current")).toBe("page");
    // Inactive tabs: aria-current should be absent (null when using getAttribute)
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBeNull();
    expect(screen.getByRole("link", { name: "Transactions" }).getAttribute("aria-current")).toBeNull();
    expect(screen.getByRole("link", { name: "Settings" }).getAttribute("aria-current")).toBeNull();
  });

  // NAV-02: Active tab must use text-bb-info color class (D-10 'Active: --bb-info color')
  it("active tab uses text-bb-info color class (NAV-02)", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/settings");
    render(<TabBar />);
    const settingsLink = screen.getByRole("link", { name: "Settings" });
    expect(settingsLink.className).toContain("text-bb-info");
    expect(settingsLink.className).not.toContain("text-bb-text-secondary");
  });

  // NAV-02: Inactive tabs must use text-bb-text-secondary color class (D-10 'Inactive: --bb-text-secondary')
  it("inactive tabs use text-bb-text-secondary color class (NAV-02)", () => {
    // pathname is "/" so Home is active, Budgets is inactive
    render(<TabBar />);
    const budgetsLink = screen.getByRole("link", { name: "Budgets" });
    expect(budgetsLink.className).toContain("text-bb-text-secondary");
    expect(budgetsLink.className).not.toContain("text-bb-info");
  });

  // Anti-Pattern #14 (UI-SPEC §Anti-Patterns): "/" must use EXACT equality, not startsWith.
  // If startsWith were used, "/" would match ALL routes — this test catches that regression.
  it("exact match for index route — / does not activate /budgets (Anti-Pattern #14)", () => {
    // pathname is "/" — only Home should be active
    render(<TabBar />);
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Budgets" }).getAttribute("aria-current")).toBeNull();
  });

  // A11Y-03: The <nav> element must have aria-label="Primary" for screen reader landmark navigation
  it("navigation has aria-label=\"Primary\" (A11Y-03)", () => {
    render(<TabBar />);
    expect(screen.getByRole("navigation").getAttribute("aria-label")).toBe("Primary");
  });
});
