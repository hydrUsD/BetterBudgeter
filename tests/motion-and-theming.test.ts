/**
 * Motion & Theming Test — Static analysis guard for DESIGN.md motion tokens,
 * prefers-reduced-motion support, and dark mode token completeness.
 *
 * Verifies:
 * 1. All DESIGN.md motion keyframes are defined in globals.css
 * 2. prefers-reduced-motion media query exists and covers all animations
 * 3. Functional spinner (animate-spin) is preserved under reduced-motion
 * 4. Dark mode (.dark block) defines all required --bb-* tokens
 *
 * @see docs/DESIGN.md §Motion & Animation
 * @see docs/DESIGN.md §Accessibility (prefers-reduced-motion, prefers-color-scheme)
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Setup
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ROOT = join(__dirname, "..");
const globalsCss = readFileSync(
  join(PROJECT_ROOT, "src/app/globals.css"),
  "utf-8"
);

// ─────────────────────────────────────────────────────────────────────────────
// Motion Token Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Motion Tokens (DESIGN.md §Motion & Animation)", () => {
  it("defines @keyframes fadeIn (page transition, 150ms)", () => {
    expect(globalsCss).toContain("@keyframes fadeIn");
    expect(globalsCss).toContain(".animate-fadeIn");
    expect(globalsCss).toMatch(/animation:\s*fadeIn\s+150ms/);
  });

  it("defines @keyframes cardAppear (card appear, 200ms fade+rise)", () => {
    expect(globalsCss).toContain("@keyframes cardAppear");
    expect(globalsCss).toContain(".animate-cardAppear");
    expect(globalsCss).toMatch(/animation:\s*cardAppear\s+200ms/);
  });

  it("defines @keyframes buttonPress (button press, 100ms scale)", () => {
    expect(globalsCss).toContain("@keyframes buttonPress");
    expect(globalsCss).toContain(".animate-buttonPress");
    expect(globalsCss).toMatch(/animation:\s*buttonPress\s+100ms/);
  });

  it("cardAppear keyframe includes translateY(4px) starting position", () => {
    expect(globalsCss).toMatch(/translateY\(4px\)/);
  });

  it("buttonPress keyframe includes scale(0.97) midpoint", () => {
    expect(globalsCss).toMatch(/scale\(0\.97\)/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Reduced-Motion Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Reduced-Motion Support (A11Y-04)", () => {
  it("includes prefers-reduced-motion media query", () => {
    expect(globalsCss).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("reduced-motion block uses wildcard selector to kill all animations", () => {
    // The block should target *, *::before, *::after
    const rmBlock = extractReducedMotionBlock(globalsCss);
    expect(rmBlock).toContain("*,");
    expect(rmBlock).toContain("*::before");
    expect(rmBlock).toContain("*::after");
    expect(rmBlock).toContain("animation-duration: 0.01ms !important");
    expect(rmBlock).toContain("transition-duration: 0.01ms !important");
  });

  it("preserves animate-spin under reduced-motion (functional loading indicator)", () => {
    // The reduced-motion block should have an exception for .animate-spin
    const rmBlock = extractReducedMotionBlock(globalsCss);
    expect(rmBlock).toContain(".animate-spin");
    // animate-spin should keep a non-zero animation-duration
    expect(rmBlock).toMatch(/\.animate-spin\s*\{[^}]*animation-duration:\s*[\d.]+s\s*!important/);
    // It should also restore infinite iteration
    expect(rmBlock).toMatch(/\.animate-spin\s*\{[^}]*animation-iteration-count:\s*infinite\s*!important/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Dark Mode Token Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Dark Mode Token Completeness", () => {
  /** All --bb-* tokens that DESIGN.md requires in dark mode.
   *  Foundation + semantic + category tokens must all be present. */
  const requiredDarkTokens = [
    // Foundation colors
    "--bb-bg",
    "--bb-surface",
    "--bb-surface-raised",
    "--bb-text",
    "--bb-text-secondary",
    "--bb-border",
    // Semantic financial colors
    "--bb-positive",
    "--bb-positive-bg",
    "--bb-caution",
    "--bb-caution-bg",
    "--bb-negative",
    "--bb-negative-bg",
    "--bb-info",
    "--bb-info-bg",
    // Budget category colors
    "--bb-cat-essentials",
    "--bb-cat-discretionary",
    "--bb-cat-savings",
    "--bb-cat-food",
    "--bb-cat-transport",
    "--bb-cat-entertainment",
    "--bb-cat-other",
  ];

  const darkBlocks = extractDarkBlocks(globalsCss);

  it(".dark block exists in globals.css", () => {
    expect(darkBlocks.length).toBeGreaterThan(0);
  });

  for (const token of requiredDarkTokens) {
    it(`dark mode defines ${token}`, () => {
      const found = darkBlocks.some((block) =>
        new RegExp(`${escapeRegex(token)}\\s*:`).test(block)
      );
      expect(
        found,
        `Missing dark mode token: ${token}`
      ).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Extract the full prefers-reduced-motion media query block. */
function extractReducedMotionBlock(css: string): string {
  const start = css.indexOf("@media (prefers-reduced-motion: reduce)");
  if (start === -1) return "";

  // Find matching closing brace by tracking brace depth
  let depth = 0;
  let blockStart = -1;
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") {
      if (depth === 0) blockStart = i;
      depth++;
    } else if (css[i] === "}") {
      depth--;
      if (depth === 0) {
        return css.slice(start, i + 1);
      }
    }
  }
  return css.slice(start);
}

/** Extract all .dark { ... } blocks from CSS. */
function extractDarkBlocks(css: string): string[] {
  const blocks: string[] = [];
  const regex = /\.dark\s*\{/g;
  let match;

  while ((match = regex.exec(css)) !== null) {
    const start = match.index;
    let depth = 0;
    let blockStart = -1;

    for (let i = start; i < css.length; i++) {
      if (css[i] === "{") {
        if (depth === 0) blockStart = i;
        depth++;
      } else if (css[i] === "}") {
        depth--;
        if (depth === 0) {
          blocks.push(css.slice(start, i + 1));
          break;
        }
      }
    }
  }

  return blocks;
}

/** Escape special regex characters in a string. */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
