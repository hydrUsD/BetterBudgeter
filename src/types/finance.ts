/**
 * Finance Types
 *
 * Shared TypeScript types for financial data structures.
 * These types are used across the application for type safety.
 *
 * Note: These are application-level DTOs (Data Transfer Objects).
 * Database-specific types (Supabase) will be defined separately later.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Transaction type: income or expense
 */
export type TransactionType = "income" | "expense";

/**
 * Income categories supported by the app
 */
export type IncomeCategory =
  | "Salary"
  | "Freelance"
  | "Investment"
  | "Bonus"
  | "Other";

/**
 * Expense categories supported by the app
 */
export type ExpenseCategory =
  | "Food"
  | "Rent"
  | "Utilities"
  | "Transport"
  | "Entertainment"
  | "Shopping"
  | "Other";

/**
 * Combined category type
 */
export type TransactionCategory = IncomeCategory | ExpenseCategory;

/**
 * A single transaction record
 */
export interface Transaction {
  id: string;
  externalId?: string; // For imported transactions (idempotency key)
  type: TransactionType;
  amount: number; // Always stored in base currency (USD)
  originalAmount?: number; // Original amount if converted
  originalCurrency?: string; // Original currency code
  description: string;
  category: TransactionCategory;
  date: string; // ISO 8601 date string
  isActual: boolean; // true = real, false = projected/recurring
  createdAt?: string;
  updatedAt?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Account type from linked bank
 */
export type AccountType = "checking" | "savings" | "credit" | "investment";

/**
 * A linked bank account
 */
export interface Account {
  id: string;
  userId: string;
  bankId: string;
  bankName: string;
  accountName: string;
  accountType: AccountType;
  currency: string;
  balance: number;
  lastSyncedAt?: string;
  createdAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard Summary Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Summary data for the dashboard
 */
export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netChange: number; // income - expenses
  periodStart: string;
  periodEnd: string;
}

/**
 * Category breakdown for charts
 */
export interface CategoryBreakdown {
  category: TransactionCategory;
  amount: number;
  percentage: number;
  transactionCount: number;
}

/**
 * Time series data point for trends chart
 */
export interface TrendDataPoint {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Import Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Result of a transaction import operation
 */
export interface ImportResult {
  success: boolean;
  imported: number; // New transactions created
  updated: number; // Existing transactions updated
  skipped: number; // Duplicates skipped
  errors: number; // Failed imports
  errorDetails?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notification severity/type
 */
export type NotificationType = "info" | "success" | "warning" | "error";

/**
 * An in-app notification
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
