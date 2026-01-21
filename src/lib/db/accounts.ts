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

/**
 * Get accounts for a specific bank.
 *
 * Used to check if a bank is already linked and to get account details.
 *
 * @param bankId - The bank identifier (e.g., "sparkasse-berlin-001")
 * @returns Array of accounts for that bank (RLS filtered)
 */
export async function getAccountsByBankId(bankId: string): Promise<DbAccount[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_accounts")
    .select("*")
    .eq("bank_id", bankId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[accounts.getAccountsByBankId] Error:", error.message);
    throw new Error(`Failed to fetch accounts for bank: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Check if a bank is already linked for the current user.
 *
 * This is the "consent check" for the PSD2 mock flow:
 * - If accounts exist for this bankId → consent was previously granted
 * - If no accounts exist → consent has not been granted
 *
 * @param bankId - The bank identifier
 * @returns true if bank is linked (has accounts), false otherwise
 */
export async function isBankLinked(bankId: string): Promise<boolean> {
  const accounts = await getAccountsByBankId(bankId);
  return accounts.length > 0;
}

/**
 * Get list of unique bank IDs that the user has linked.
 *
 * @returns Array of bank IDs
 */
export async function getLinkedBankIds(): Promise<string[]> {
  const accounts = await getAccounts();
  const bankIds = new Set(accounts.map((account) => account.bank_id));
  return Array.from(bankIds);
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

/**
 * Create multiple accounts at once.
 *
 * Used during the bank linking flow to create all accounts for a bank.
 * This is more efficient than creating accounts one by one.
 *
 * PSD2 CONTEXT:
 * When a user grants consent to a bank, we create database entries for
 * all accounts returned by the mock API. This represents the "consent"
 * being persisted — the user has agreed to let us access these accounts.
 *
 * @param accounts - Array of account data to insert
 * @returns Array of created accounts
 */
export async function createAccounts(
  accounts: DbAccountInsert[]
): Promise<DbAccount[]> {
  if (accounts.length === 0) {
    return [];
  }

  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_accounts")
    .insert(accounts)
    .select();

  if (error) {
    console.error("[accounts.createAccounts] Error:", error.message);
    throw new Error(`Failed to create accounts: ${error.message}`);
  }

  return data ?? [];
}

/**
 * Delete all accounts for a specific bank.
 *
 * Used to "unlink" a bank — revoke consent for all accounts.
 * Cascade delete removes associated transactions.
 *
 * @param bankId - The bank identifier
 * @returns Number of accounts deleted
 */
export async function deleteAccountsByBankId(bankId: string): Promise<number> {
  const supabase = await createServerSupabaseClient();

  // First count how many we're deleting (for return value)
  const accounts = await getAccountsByBankId(bankId);
  const count = accounts.length;

  if (count === 0) {
    return 0;
  }

  const { error } = await supabase
    .from("bb_accounts")
    .delete()
    .eq("bank_id", bankId);

  if (error) {
    console.error("[accounts.deleteAccountsByBankId] Error:", error.message);
    throw new Error(`Failed to delete accounts for bank: ${error.message}`);
  }

  return count;
}
