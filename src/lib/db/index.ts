/**
 * Database Module
 *
 * Database access layer using Supabase for BetterBudget features.
 * All database operations for new features should go through this module.
 *
 * Structure:
 * - supabase.ts: Browser client setup (for auth UI)
 * - supabaseServer.ts: Server client setup (for data fetching)
 * - accounts.ts: bb_accounts table queries
 * - transactions.ts: bb_transactions table queries
 * - settings.ts: bb_user_settings and bb_notification_prefs queries
 * - types.ts: Database row types
 * - This file: Re-exports and convenience functions
 *
 * Note: Legacy OopsBudgeter uses Drizzle + PostgreSQL directly (src/lib/db.ts).
 * That remains unchanged for backward compatibility.
 *
 * @see docs/SUPABASE_STRATEGY.md for architectural decisions
 */

// ─────────────────────────────────────────────────────────────────────────────
// Client Exports
// ─────────────────────────────────────────────────────────────────────────────

// Browser client - for client components (auth UI)
export {
  createBrowserSupabaseClient,
  validateSupabaseEnv,
} from "./supabase";

// Server client - for server components and API routes
export {
  createServerSupabaseClient,
  createServiceRoleClient,
} from "./supabaseServer";

// ─────────────────────────────────────────────────────────────────────────────
// Query Exports
// ─────────────────────────────────────────────────────────────────────────────

// Account queries
export {
  getAccounts,
  getAccountById,
  getTotalBalance,
  createAccount,
  updateAccount,
  updateAccountBalance,
  deleteAccount,
} from "./accounts";

// Transaction queries
export {
  getTransactions,
  getTransactionsByAccount,
  getTransactionById,
  getRecentTransactions,
  getTransactionSummary,
  createTransaction,
  upsertTransactions,
  updateTransaction,
  deleteTransaction,
} from "./transactions";
export type { DateRangeOptions, TransactionSummary } from "./transactions";

// Settings queries
export {
  getUserSettings,
  getUserSettingsOrDefaults,
  updateUserSettings,
  getNotificationPrefs,
  getNotificationPrefsOrDefaults,
  updateNotificationPrefs,
} from "./settings";

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

// Supabase types
export type { User, Session } from "./supabase";

// Database row types
export type {
  DbAccount,
  DbAccountInsert,
  DbAccountUpdate,
  DbTransaction,
  DbTransactionInsert,
  DbTransactionUpdate,
  DbTransactionType,
  DbUserSettings,
  DbUserSettingsInsert,
  DbUserSettingsUpdate,
  DbTheme,
  DbNotificationPrefs,
  DbNotificationPrefsInsert,
  DbNotificationPrefsUpdate,
} from "./types";

// Finance types (application-level DTOs)
export type { Transaction, Account, DashboardSummary } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Convenience Functions (API Compatibility Layer)
// ─────────────────────────────────────────────────────────────────────────────

import { getTransactions, getTransactionSummary } from "./transactions";
import { getAccounts, getTotalBalance } from "./accounts";
import type { DbTransaction, DbAccount } from "./types";

/**
 * Fetch transactions for the current user within a date range.
 * Wrapper for getTransactions() with API compatibility.
 *
 * @param _userId - User ID (ignored, RLS handles filtering)
 * @param fromDate - Start date (ISO string)
 * @param toDate - End date (ISO string)
 * @returns Array of transactions
 */
export async function fetchTransactions(
  _userId: string,
  fromDate?: string,
  toDate?: string
): Promise<DbTransaction[]> {
  return getTransactions({ fromDate, toDate });
}

/**
 * Fetch linked bank accounts for the current user.
 * Wrapper for getAccounts() with API compatibility.
 *
 * @param _userId - User ID (ignored, RLS handles filtering)
 * @returns Array of linked accounts
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchAccounts(_userId: string): Promise<DbAccount[]> {
  return getAccounts();
}

/**
 * Fetch dashboard summary for the current user.
 *
 * @param _userId - User ID (ignored, RLS handles filtering)
 * @param fromDate - Start date (ISO string)
 * @param toDate - End date (ISO string)
 * @returns Dashboard summary object
 */
export async function fetchDashboardSummary(
  _userId: string,
  fromDate?: string,
  toDate?: string
): Promise<{
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  periodStart: string;
  periodEnd: string;
}> {
  const [summary, totalBalance] = await Promise.all([
    getTransactionSummary({ fromDate, toDate }),
    getTotalBalance(),
  ]);

  return {
    totalBalance,
    totalIncome: summary.totalIncome,
    totalExpenses: summary.totalExpenses,
    netChange: summary.netChange,
    periodStart: fromDate ?? "",
    periodEnd: toDate ?? "",
  };
}
