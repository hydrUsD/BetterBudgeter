/**
 * Transaction Database Queries
 *
 * Query functions for the bb_transactions table.
 * All functions use the server Supabase client with RLS.
 *
 * Note: RLS policies automatically filter by user_id = auth.uid()
 * so explicit user_id filtering is not required in queries.
 *
 * @see docs/SUPABASE_STRATEGY.md for data access patterns
 */

import { createServerSupabaseClient } from "./supabaseServer";
import type {
  DbTransaction,
  DbTransactionInsert,
  DbTransactionUpdate,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Query Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Date range filter options
 */
export interface DateRangeOptions {
  fromDate?: string; // ISO date string (YYYY-MM-DD)
  toDate?: string; // ISO date string (YYYY-MM-DD)
}

/**
 * Get transactions with optional date range filter.
 *
 * @param options - Optional date range filter
 * @returns Array of transactions (RLS filtered)
 */
export async function getTransactions(
  options: DateRangeOptions = {}
): Promise<DbTransaction[]> {
  const supabase = await createServerSupabaseClient();
  const { fromDate, toDate } = options;

  let query = supabase
    .from("bb_transactions")
    .select("*")
    .order("booking_date", { ascending: false });

  if (fromDate) {
    query = query.gte("booking_date", fromDate);
  }
  if (toDate) {
    query = query.lte("booking_date", toDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[transactions.getTransactions] Error:", error.message);
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get transactions for a specific account.
 *
 * @param accountId - The account UUID
 * @param options - Optional date range filter
 * @returns Array of transactions for the account
 */
export async function getTransactionsByAccount(
  accountId: string,
  options: DateRangeOptions = {}
): Promise<DbTransaction[]> {
  const supabase = await createServerSupabaseClient();
  const { fromDate, toDate } = options;

  let query = supabase
    .from("bb_transactions")
    .select("*")
    .eq("account_id", accountId)
    .order("booking_date", { ascending: false });

  if (fromDate) {
    query = query.gte("booking_date", fromDate);
  }
  if (toDate) {
    query = query.lte("booking_date", toDate);
  }

  const { data, error } = await query;

  if (error) {
    console.error(
      "[transactions.getTransactionsByAccount] Error:",
      error.message
    );
    throw new Error(`Failed to fetch transactions: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get a single transaction by ID.
 *
 * @param transactionId - The transaction UUID
 * @returns Transaction or null if not found
 */
export async function getTransactionById(
  transactionId: string
): Promise<DbTransaction | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_transactions")
    .select("*")
    .eq("id", transactionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null;
    }
    console.error("[transactions.getTransactionById] Error:", error.message);
    throw new Error(`Failed to fetch transaction: ${error.message}`);
  }

  return data;
}

/**
 * Get recent transactions (limited).
 *
 * @param limit - Number of transactions to return (default: 10)
 * @returns Array of recent transactions
 */
export async function getRecentTransactions(
  limit: number = 10
): Promise<DbTransaction[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_transactions")
    .select("*")
    .order("booking_date", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[transactions.getRecentTransactions] Error:", error.message);
    throw new Error(`Failed to fetch recent transactions: ${error.message}`);
  }

  return data ?? [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Aggregation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transaction summary for a period
 */
export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  transactionCount: number;
}

/**
 * Get transaction summary (income/expense totals).
 *
 * @param options - Optional date range filter
 * @returns Summary with totals
 */
export async function getTransactionSummary(
  options: DateRangeOptions = {}
): Promise<TransactionSummary> {
  const transactions = await getTransactions(options);

  const summary = transactions.reduce(
    (acc, tx) => {
      const amount = Math.abs(tx.amount);
      if (tx.type === "income") {
        acc.totalIncome += amount;
      } else {
        acc.totalExpenses += amount;
      }
      acc.transactionCount++;
      return acc;
    },
    { totalIncome: 0, totalExpenses: 0, transactionCount: 0 }
  );

  return {
    ...summary,
    netChange: summary.totalIncome - summary.totalExpenses,
  };
}

/**
 * Category breakdown for charts
 */
export interface CategoryBreakdown {
  category: string;
  amount: number;
  transactionCount: number;
}

/**
 * Get expense breakdown by category.
 *
 * Used for the Spending by Category donut chart on the dashboard.
 * Returns only expense transactions grouped by category.
 *
 * @param options - Optional date range filter (defaults to current month)
 * @returns Array of category breakdowns sorted by amount (descending)
 *
 * @see docs/DASHBOARD_STRATEGY.md Section 4.2
 */
export async function getExpensesByCategory(
  options: DateRangeOptions = {}
): Promise<CategoryBreakdown[]> {
  // Default to current month if no date range specified
  const now = new Date();
  const fromDate =
    options.fromDate ??
    new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const toDate =
    options.toDate ??
    new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

  // Fetch expense transactions for the period
  const transactions = await getTransactions({ fromDate, toDate });
  const expenses = transactions.filter((tx) => tx.type === "expense");

  // Group by category
  const categoryMap = new Map<
    string,
    { amount: number; transactionCount: number }
  >();

  for (const tx of expenses) {
    const category = tx.category ?? "Other";
    const existing = categoryMap.get(category) ?? {
      amount: 0,
      transactionCount: 0,
    };
    categoryMap.set(category, {
      amount: existing.amount + Math.abs(tx.amount),
      transactionCount: existing.transactionCount + 1,
    });
  }

  // Convert to array and sort by amount (descending)
  const breakdown: CategoryBreakdown[] = Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      transactionCount: data.transactionCount,
    }))
    .sort((a, b) => b.amount - a.amount);

  return breakdown;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new transaction.
 *
 * @param transaction - Transaction data to insert
 * @returns The created transaction
 */
export async function createTransaction(
  transaction: DbTransactionInsert
): Promise<DbTransaction> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_transactions")
    .insert(transaction)
    .select()
    .single();

  if (error) {
    console.error("[transactions.createTransaction] Error:", error.message);
    throw new Error(`Failed to create transaction: ${error.message}`);
  }

  return data;
}

/**
 * Upsert transactions (for idempotent imports).
 * Uses the UNIQUE(user_id, external_id) constraint.
 *
 * @param transactions - Array of transactions to upsert
 * @returns Array of upserted transactions
 */
export async function upsertTransactions(
  transactions: DbTransactionInsert[]
): Promise<DbTransaction[]> {
  if (transactions.length === 0) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_transactions")
    .upsert(transactions, {
      onConflict: "user_id,external_id",
      ignoreDuplicates: false, // Update existing records
    })
    .select();

  if (error) {
    console.error("[transactions.upsertTransactions] Error:", error.message);
    throw new Error(`Failed to upsert transactions: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Update an existing transaction.
 *
 * @param transactionId - The transaction UUID
 * @param updates - Fields to update
 * @returns The updated transaction
 */
export async function updateTransaction(
  transactionId: string,
  updates: DbTransactionUpdate
): Promise<DbTransaction> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_transactions")
    .update(updates)
    .eq("id", transactionId)
    .select()
    .single();

  if (error) {
    console.error("[transactions.updateTransaction] Error:", error.message);
    throw new Error(`Failed to update transaction: ${error.message}`);
  }

  return data;
}

/**
 * Delete a transaction.
 *
 * @param transactionId - The transaction UUID
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("bb_transactions")
    .delete()
    .eq("id", transactionId);

  if (error) {
    console.error("[transactions.deleteTransaction] Error:", error.message);
    throw new Error(`Failed to delete transaction: ${error.message}`);
  }
}
