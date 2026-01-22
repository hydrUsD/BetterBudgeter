/**
 * Budget Database Queries
 *
 * Query functions for the bb_budgets table.
 * All functions use the server Supabase client with RLS.
 *
 * A budget represents a user-defined spending limit for a specific
 * expense category over a calendar month. Budget progress is CALCULATED
 * from transactions, not stored in this table.
 *
 * Note: RLS policies automatically filter by user_id = auth.uid()
 * so explicit user_id filtering is not required in queries.
 *
 * @see docs/BUDGET_STRATEGY.md for detailed design
 * @see docs/SUPABASE_STRATEGY.md for data access patterns
 */

import { createServerSupabaseClient } from "./supabaseServer";
import type { DbBudget, DbBudgetInsert, DbBudgetUpdate } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Query Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all budgets for the current user.
 *
 * @returns Array of budgets (RLS filtered)
 */
export async function getBudgets(): Promise<DbBudget[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_budgets")
    .select("*")
    .order("category", { ascending: true });

  if (error) {
    console.error("[budgets.getBudgets] Error:", error.message);
    throw new Error(`Failed to fetch budgets: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get a single budget by ID.
 *
 * @param budgetId - The budget UUID
 * @returns Budget or null if not found
 */
export async function getBudgetById(budgetId: string): Promise<DbBudget | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_budgets")
    .select("*")
    .eq("id", budgetId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("[budgets.getBudgetById] Error:", error.message);
    throw new Error(`Failed to fetch budget: ${error.message}`);
  }

  return data;
}

/**
 * Get a budget by category.
 *
 * Since UNIQUE(user_id, category) constraint exists, each user can
 * only have one budget per category.
 *
 * @param category - The expense category (e.g., "Food", "Transport")
 * @returns Budget or null if not set for this category
 */
export async function getBudgetByCategory(
  category: string
): Promise<DbBudget | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_budgets")
    .select("*")
    .eq("category", category)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned — no budget set for this category
      return null;
    }
    console.error("[budgets.getBudgetByCategory] Error:", error.message);
    throw new Error(`Failed to fetch budget: ${error.message}`);
  }

  return data;
}

/**
 * Check if a budget exists for a category.
 *
 * @param category - The expense category
 * @returns true if budget exists, false otherwise
 */
export async function hasBudgetForCategory(category: string): Promise<boolean> {
  const budget = await getBudgetByCategory(category);
  return budget !== null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new budget for a category.
 *
 * Due to UNIQUE(user_id, category) constraint, this will fail if a budget
 * already exists for this category. Use upsertBudget() for create-or-update.
 *
 * @param budget - Budget data to insert
 * @returns The created budget
 */
export async function createBudget(budget: DbBudgetInsert): Promise<DbBudget> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_budgets")
    .insert(budget)
    .select()
    .single();

  if (error) {
    // Check for unique constraint violation
    if (error.code === "23505") {
      throw new Error(`Budget already exists for category: ${budget.category}`);
    }
    console.error("[budgets.createBudget] Error:", error.message);
    throw new Error(`Failed to create budget: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing budget.
 *
 * @param budgetId - The budget UUID
 * @param updates - Fields to update (only monthly_limit allowed)
 * @returns The updated budget
 */
export async function updateBudget(
  budgetId: string,
  updates: DbBudgetUpdate
): Promise<DbBudget> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_budgets")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", budgetId)
    .select()
    .single();

  if (error) {
    console.error("[budgets.updateBudget] Error:", error.message);
    throw new Error(`Failed to update budget: ${error.message}`);
  }

  return data;
}

/**
 * Create or update a budget for a category.
 *
 * This is the preferred method for settings UI since it handles
 * both initial budget creation and subsequent updates.
 *
 * @param budget - Budget data (user_id, category, monthly_limit)
 * @returns The created or updated budget
 */
export async function upsertBudget(budget: DbBudgetInsert): Promise<DbBudget> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_budgets")
    .upsert(
      {
        ...budget,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,category",
      }
    )
    .select()
    .single();

  if (error) {
    console.error("[budgets.upsertBudget] Error:", error.message);
    throw new Error(`Failed to upsert budget: ${error.message}`);
  }

  return data;
}

/**
 * Delete a budget.
 *
 * @param budgetId - The budget UUID
 */
export async function deleteBudget(budgetId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("bb_budgets")
    .delete()
    .eq("id", budgetId);

  if (error) {
    console.error("[budgets.deleteBudget] Error:", error.message);
    throw new Error(`Failed to delete budget: ${error.message}`);
  }
}

/**
 * Delete a budget by category.
 *
 * Useful for removing a budget when user doesn't want to track
 * a category anymore.
 *
 * @param category - The expense category
 * @returns true if a budget was deleted, false if none existed
 */
export async function deleteBudgetByCategory(category: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();

  // First check if budget exists
  const existing = await getBudgetByCategory(category);
  if (!existing) {
    return false;
  }

  const { error } = await supabase
    .from("bb_budgets")
    .delete()
    .eq("category", category);

  if (error) {
    console.error("[budgets.deleteBudgetByCategory] Error:", error.message);
    throw new Error(`Failed to delete budget: ${error.message}`);
  }

  return true;
}

/**
 * Create multiple budgets at once.
 *
 * Useful for initial budget setup or bulk operations.
 * Will fail if any category already has a budget.
 *
 * @param budgets - Array of budget data to insert
 * @returns Array of created budgets
 */
export async function createBudgets(
  budgets: DbBudgetInsert[]
): Promise<DbBudget[]> {
  if (budgets.length === 0) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_budgets")
    .insert(budgets)
    .select();

  if (error) {
    console.error("[budgets.createBudgets] Error:", error.message);
    throw new Error(`Failed to create budgets: ${error.message}`);
  }

  return data ?? [];
}