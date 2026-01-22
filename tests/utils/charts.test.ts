/**
 * Chart Utility Function Tests
 *
 * Tests pure, stateless helper functions from utils/charts.
 * These functions have no side effects and return deterministic results.
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import {
  CATEGORY_COLORS,
  getCategoryColor,
  toPieChartData,
} from "@/utils/charts";

// ─────────────────────────────────────────────────────────────────────────────
// getCategoryColor
// ─────────────────────────────────────────────────────────────────────────────

describe("getCategoryColor", () => {
  it("returns correct color for known expense categories", () => {
    expect(getCategoryColor("Food")).toBe("#ef4444");
    expect(getCategoryColor("Rent")).toBe("#f97316");
    expect(getCategoryColor("Transport")).toBe("#22c55e");
  });

  it("returns fallback color for unknown categories", () => {
    expect(getCategoryColor("NonExistent")).toBe(CATEGORY_COLORS.Other);
    expect(getCategoryColor("")).toBe(CATEGORY_COLORS.Other);
  });

  it("returns correct color for income categories", () => {
    expect(getCategoryColor("Salary")).toBe("#10b981");
    expect(getCategoryColor("Freelance")).toBe("#14b8a6");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// toPieChartData
// ─────────────────────────────────────────────────────────────────────────────

describe("toPieChartData", () => {
  it("transforms category breakdown to pie chart format", () => {
    const input = [
      { category: "Food", amount: 250 },
      { category: "Rent", amount: 800 },
    ];

    const result = toPieChartData(input);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      name: "Food",
      value: 250,
      fill: "#ef4444",
    });
    expect(result[1]).toEqual({
      name: "Rent",
      value: 800,
      fill: "#f97316",
    });
  });

  it("returns empty array for empty input", () => {
    expect(toPieChartData([])).toEqual([]);
  });

  it("uses fallback color for unknown categories", () => {
    const input = [{ category: "Unknown", amount: 100 }];
    const result = toPieChartData(input);
    expect(result[0].fill).toBe(CATEGORY_COLORS.Other);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY_COLORS
// ─────────────────────────────────────────────────────────────────────────────

describe("CATEGORY_COLORS", () => {
  it("contains all expense categories", () => {
    expect(CATEGORY_COLORS.Food).toBeDefined();
    expect(CATEGORY_COLORS.Rent).toBeDefined();
    expect(CATEGORY_COLORS.Utilities).toBeDefined();
    expect(CATEGORY_COLORS.Transport).toBeDefined();
    expect(CATEGORY_COLORS.Entertainment).toBeDefined();
    expect(CATEGORY_COLORS.Shopping).toBeDefined();
    expect(CATEGORY_COLORS.Other).toBeDefined();
  });

  it("all colors are valid hex codes", () => {
    const hexPattern = /^#[0-9a-f]{6}$/i;
    Object.values(CATEGORY_COLORS).forEach((color) => {
      expect(color).toMatch(hexPattern);
    });
  });
});