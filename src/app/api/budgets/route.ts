/**
 * Budget API - POST /api/budgets
 *
 * Handles budget creation, update, and deletion.
 * Uses upsert for create/update operations.
 *
 * Request body:
 * {
 *   budgets: [{ category: string, limit: number }],
 *   deletions: string[] // categories to remove
 * }
 *
 * @see docs/BUDGET_STRATEGY.md for design
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import { getBudgets, upsertBudget, deleteBudgetByCategory } from "@/lib/db/budgets";
import { EXPENSE_CATEGORIES } from "@/utils/mapping";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetInput {
  category: string;
  limit: number;
}

interface BudgetRequest {
  budgets?: BudgetInput[];
  deletions?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/budgets - Save Budgets
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; message: string } | { error: string }>> {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to manage budgets." },
        { status: 401 }
      );
    }

    // Parse request body
    const body: BudgetRequest = await request.json();
    const { budgets = [], deletions = [] } = body;

    // Validate budgets
    for (const budget of budgets) {
      if (!EXPENSE_CATEGORIES.includes(budget.category as never)) {
        return NextResponse.json(
          { error: `Invalid category: ${budget.category}` },
          { status: 400 }
        );
      }
      if (typeof budget.limit !== "number" || budget.limit <= 0) {
        return NextResponse.json(
          { error: `Invalid limit for ${budget.category}: must be positive number` },
          { status: 400 }
        );
      }
    }

    // Validate deletions
    for (const category of deletions) {
      if (!EXPENSE_CATEGORIES.includes(category as never)) {
        return NextResponse.json(
          { error: `Invalid category for deletion: ${category}` },
          { status: 400 }
        );
      }
    }

    // Process deletions
    for (const category of deletions) {
      await deleteBudgetByCategory(category);
    }

    // Process upserts
    for (const budget of budgets) {
      await upsertBudget({
        user_id: user.id,
        category: budget.category,
        monthly_limit: budget.limit,
      });
    }

    const totalChanges = budgets.length + deletions.length;
    return NextResponse.json({
      success: true,
      message: `Updated ${totalChanges} budget${totalChanges !== 1 ? "s" : ""}`,
    });
  } catch (error) {
    console.error("[api/budgets] Error:", error);
    return NextResponse.json(
      { error: "Failed to save budgets. Please try again." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/budgets - Get User Budgets
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(): Promise<
  NextResponse<{ budgets: Record<string, number> } | { error: string }>
> {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to view budgets." },
        { status: 401 }
      );
    }

    // Get all budgets
    const dbBudgets = await getBudgets();

    // Convert to simple category -> limit map
    const budgets: Record<string, number> = {};
    for (const budget of dbBudgets) {
      budgets[budget.category] = budget.monthly_limit;
    }

    return NextResponse.json({ budgets });
  } catch (error) {
    console.error("[api/budgets] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets." },
      { status: 500 }
    );
  }
}