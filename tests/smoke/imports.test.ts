/**
 * Smoke Test: Module Imports
 *
 * Verifies that critical modules can be imported without runtime errors.
 * This catches broken imports, circular dependencies, and configuration issues.
 *
 * Note: The Dashboard page is a server component with async DB calls,
 * so it cannot be rendered in tests without mocking Supabase.
 * Instead, we verify its child components import correctly.
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";

describe("Smoke: Critical Module Imports", () => {
  it("imports BudgetProgressSection without errors", async () => {
    const module = await import(
      "@/components/dashboard/BudgetProgressSection"
    );
    expect(module.BudgetProgressSection).toBeDefined();
  });

  it("imports SpendingByCategoryChart without errors", async () => {
    const module = await import(
      "@/components/dashboard/SpendingByCategoryChart"
    );
    expect(module.SpendingByCategoryChart).toBeDefined();
  });

  it("imports dashboard barrel export without errors", async () => {
    const module = await import("@/components/dashboard");
    expect(module.BudgetProgressSection).toBeDefined();
    expect(module.SpendingByCategoryChart).toBeDefined();
    expect(module.SyncTransactionsButton).toBeDefined();
    expect(module.BudgetNotificationDialogs).toBeDefined();
  });

  it("imports chart utilities without errors", async () => {
    const module = await import("@/utils/charts");
    expect(module.CATEGORY_COLORS).toBeDefined();
    expect(module.getCategoryColor).toBeDefined();
    expect(module.toPieChartData).toBeDefined();
  });

  it("imports category mapping utilities without errors", async () => {
    const module = await import("@/utils/mapping");
    expect(module.CATEGORY_ICONS).toBeDefined();
  });
});