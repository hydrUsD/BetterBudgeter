/**
 * Database Module
 *
 * Database access layer using Supabase.
 * All database operations should go through this module.
 *
 * Current status: SKELETON — exports placeholder functions.
 *
 * Note: The legacy OopsBudgeter uses Drizzle + PostgreSQL directly.
 * This module will use Supabase client for new BetterBudget features.
 * Legacy db.ts remains unchanged for backward compatibility.
 *
 * TODO (Task 2+):
 * - Initialize Supabase client
 * - Add typed query functions
 * - Add transaction helpers
 */

// Re-export types for convenience
export type { Transaction, Account, DashboardSummary } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Database Client Placeholder
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get Supabase client
 *
 * TODO: Initialize with environment variables
 */
export function getSupabaseClient() {
  // Placeholder — will be replaced with actual Supabase client
  console.warn("Supabase client not initialized yet");
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Query Placeholders
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch transactions for a user within a date range
 *
 * TODO: Implement with Supabase
 */
export async function fetchTransactions(
  _userId: string,
  _fromDate?: string,
  _toDate?: string
): Promise<[]> {
  // Placeholder — will be replaced with Supabase query
  return [];
}

/**
 * Fetch linked accounts for a user
 *
 * TODO: Implement with Supabase
 */
export async function fetchAccounts(_userId: string): Promise<[]> {
  // Placeholder — will be replaced with Supabase query
  return [];
}

/**
 * Fetch dashboard summary for a user
 *
 * TODO: Implement with Supabase
 */
export async function fetchDashboardSummary(
  _userId: string,
  _fromDate?: string,
  _toDate?: string
): Promise<null> {
  // Placeholder — will be replaced with Supabase query
  return null;
}
