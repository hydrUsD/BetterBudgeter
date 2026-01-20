/**
 * Account Database Queries
 *
 * Query functions for the bb_accounts table.
 * All functions use the server Supabase client with RLS.
 *
 * Note: RLS policies automatically filter by user_id = auth.uid()
 * so explicit user_id filtering is not required in queries.
 *
 * @see docs/SUPABASE_STRATEGY.md for data access patterns
 */

import { createServerSupabaseClient } from "./supabaseServer";
import type { DbAccount, DbAccountInsert, DbAccountUpdate } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Query Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get all accounts for the current user.
 *
 * @returns Array of accounts (RLS filtered)
 */
export async function getAccounts(): Promise<DbAccount[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[accounts.getAccounts] Error:", error.message);
    throw new Error(`Failed to fetch accounts: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Get a single account by ID.
 *
 * @param accountId - The account UUID
 * @returns Account or null if not found
 */
export async function getAccountById(
  accountId: string
): Promise<DbAccount | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No rows returned
      return null;
    }
    console.error("[accounts.getAccountById] Error:", error.message);
    throw new Error(`Failed to fetch account: ${error.message}`);
  }

  return data;
}

/**
 * Get total balance across all accounts.
 *
 * @returns Total balance (sum of all account balances)
 */
export async function getTotalBalance(): Promise<number> {
  const accounts = await getAccounts();
  return accounts.reduce((sum, account) => sum + (account.balance ?? 0), 0);
}

// ─────────────────────────────────────────────────────────────────────────────
// Mutation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new linked bank account.
 *
 * @param account - Account data to insert
 * @returns The created account
 */
export async function createAccount(
  account: DbAccountInsert
): Promise<DbAccount> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_accounts")
    .insert(account)
    .select()
    .single();

  if (error) {
    console.error("[accounts.createAccount] Error:", error.message);
    throw new Error(`Failed to create account: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing account.
 *
 * @param accountId - The account UUID
 * @param updates - Fields to update
 * @returns The updated account
 */
export async function updateAccount(
  accountId: string,
  updates: DbAccountUpdate
): Promise<DbAccount> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_accounts")
    .update(updates)
    .eq("id", accountId)
    .select()
    .single();

  if (error) {
    console.error("[accounts.updateAccount] Error:", error.message);
    throw new Error(`Failed to update account: ${error.message}`);
  }

  return data;
}

/**
 * Update account balance and last synced timestamp.
 * Used after importing transactions.
 *
 * @param accountId - The account UUID
 * @param balance - New balance
 */
export async function updateAccountBalance(
  accountId: string,
  balance: number
): Promise<void> {
  await updateAccount(accountId, {
    balance,
    last_synced_at: new Date().toISOString(),
  });
}

/**
 * Delete an account and all its transactions.
 * Uses cascade delete defined in schema.
 *
 * @param accountId - The account UUID
 */
export async function deleteAccount(accountId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("bb_accounts")
    .delete()
    .eq("id", accountId);

  if (error) {
    console.error("[accounts.deleteAccount] Error:", error.message);
    throw new Error(`Failed to delete account: ${error.message}`);
  }
}
