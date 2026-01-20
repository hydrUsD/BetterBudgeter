/**
 * Database Types
 *
 * TypeScript types that map to Supabase database tables.
 * These are the raw row types as stored in the database.
 *
 * For application-level DTOs, see @/types/finance.ts
 *
 * @see supabase/migrations/001_initial_schema.sql for table definitions
 */

// ─────────────────────────────────────────────────────────────────────────────
// bb_accounts Table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Row type for bb_accounts table
 */
export interface DbAccount {
  id: string;
  user_id: string;
  bank_id: string;
  bank_name: string;
  account_name: string;
  account_type: string;
  currency: string;
  balance: number;
  iban: string | null;
  last_synced_at: string | null;
  created_at: string;
}

/**
 * Insert type for bb_accounts (id and timestamps are auto-generated)
 */
export interface DbAccountInsert {
  user_id: string;
  bank_id: string;
  bank_name: string;
  account_name: string;
  account_type: string;
  currency?: string;
  balance?: number;
  iban?: string | null;
  last_synced_at?: string | null;
}

/**
 * Update type for bb_accounts
 */
export interface DbAccountUpdate {
  bank_name?: string;
  account_name?: string;
  account_type?: string;
  currency?: string;
  balance?: number;
  iban?: string | null;
  last_synced_at?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// bb_transactions Table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transaction type enum (matches DB CHECK constraint)
 */
export type DbTransactionType = "income" | "expense";

/**
 * Row type for bb_transactions table
 */
export interface DbTransaction {
  id: string;
  user_id: string;
  account_id: string;
  external_id: string;
  type: DbTransactionType;
  amount: number;
  currency: string;
  description: string | null;
  category: string | null;
  booking_date: string;
  value_date: string | null;
  creditor_name: string | null;
  debtor_name: string | null;
  created_at: string;
}

/**
 * Insert type for bb_transactions
 */
export interface DbTransactionInsert {
  user_id: string;
  account_id: string;
  external_id: string;
  type: DbTransactionType;
  amount: number;
  currency: string;
  description?: string | null;
  category?: string | null;
  booking_date: string;
  value_date?: string | null;
  creditor_name?: string | null;
  debtor_name?: string | null;
}

/**
 * Update type for bb_transactions
 */
export interface DbTransactionUpdate {
  type?: DbTransactionType;
  amount?: number;
  currency?: string;
  description?: string | null;
  category?: string | null;
  booking_date?: string;
  value_date?: string | null;
  creditor_name?: string | null;
  debtor_name?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// bb_user_settings Table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Theme options
 */
export type DbTheme = "light" | "dark" | "system";

/**
 * Row type for bb_user_settings table
 */
export interface DbUserSettings {
  user_id: string;
  display_currency: string;
  theme: string;
  compact_view: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Insert type for bb_user_settings
 */
export interface DbUserSettingsInsert {
  user_id: string;
  display_currency?: string;
  theme?: string;
  compact_view?: boolean;
}

/**
 * Update type for bb_user_settings
 */
export interface DbUserSettingsUpdate {
  display_currency?: string;
  theme?: string;
  compact_view?: boolean;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// bb_notification_prefs Table
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Row type for bb_notification_prefs table
 */
export interface DbNotificationPrefs {
  user_id: string;
  budget_alerts: boolean;
  weekly_summary: boolean;
  import_notifications: boolean;
  created_at: string;
}

/**
 * Insert type for bb_notification_prefs
 */
export interface DbNotificationPrefsInsert {
  user_id: string;
  budget_alerts?: boolean;
  weekly_summary?: boolean;
  import_notifications?: boolean;
}

/**
 * Update type for bb_notification_prefs
 */
export interface DbNotificationPrefsUpdate {
  budget_alerts?: boolean;
  weekly_summary?: boolean;
  import_notifications?: boolean;
}
