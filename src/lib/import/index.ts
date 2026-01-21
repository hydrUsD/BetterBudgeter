/**
 * Import Module
 *
 * Handles importing transactions from the mock bank API.
 * Implements idempotent UPSERT logic to prevent duplicate imports.
 *
 * DATA FLOW:
 * 1. Fetch transactions from mock API (PSD2 format)
 * 2. Transform to internal format (DbTransactionInsert)
 * 3. UPSERT with external_id as conflict key (idempotent)
 * 4. Return import result summary
 *
 * IMPORTANT BOUNDARIES:
 * - This module is the ONLY code that calls the mock API
 * - UI components must NEVER call mock API directly
 * - The database is the single source of truth after import
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 6 for data flow
 */

import type { ImportResult } from "@/types/finance";
import type { DbTransactionInsert, DbTransactionType, DbAccount } from "@/lib/db/types";
import type { MockTransaction } from "@/lib/mock/types";
import { upsertTransactions } from "@/lib/db/transactions";
import { getAccountById, updateAccountBalance } from "@/lib/db/accounts";
import { generateMockTransactions } from "@/lib/mock";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for importing transactions
 */
export interface ImportOptions {
  /** Database account ID (UUID) to import into */
  accountId: string;
  /** User ID for transaction ownership */
  userId: string;
  /** Start date for transaction range (ISO YYYY-MM-DD) */
  dateFrom?: string;
  /** End date for transaction range (ISO YYYY-MM-DD) */
  dateTo?: string;
}

/**
 * Internal API options for fetching mock transactions.
 * This is separate from ImportOptions to make the boundary clear.
 */
interface MockApiOptions {
  /** Mock account ID (from mock API, e.g., "sparkasse-berlin-001-checking-001") */
  mockAccountId: string;
  dateFrom?: string;
  dateTo?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Transformation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map category from transaction description.
 *
 * This is a simple rule-based categorizer. In a real app, this could be
 * much more sophisticated (ML-based, user-defined rules, etc.).
 *
 * @param description - Transaction description from mock API
 * @param isExpense - Whether this is an expense (affects category options)
 * @returns Category string
 */
function mapCategory(description: string, isExpense: boolean): string {
  const descLower = description.toLowerCase();

  if (!isExpense) {
    // Income categories
    if (descLower.includes("gehalt") || descLower.includes("lohn")) {
      return "Salary";
    }
    if (descLower.includes("honorar") || descLower.includes("freelance")) {
      return "Freelance";
    }
    if (descLower.includes("steuer")) {
      return "Other";
    }
    return "Other";
  }

  // Expense categories
  if (
    descLower.includes("rewe") ||
    descLower.includes("edeka") ||
    descLower.includes("lidl") ||
    descLower.includes("cafe") ||
    descLower.includes("restaurant")
  ) {
    return "Food";
  }
  if (descLower.includes("amazon") || descLower.includes("dm-drogerie")) {
    return "Shopping";
  }
  if (descLower.includes("db ") || descLower.includes("bvg")) {
    return "Transport";
  }
  if (descLower.includes("netflix") || descLower.includes("spotify")) {
    return "Entertainment";
  }
  if (
    descLower.includes("stadtwerke") ||
    descLower.includes("strom") ||
    descLower.includes("gas") ||
    descLower.includes("telekom")
  ) {
    return "Utilities";
  }

  return "Other";
}

/**
 * Transform a mock API transaction to database format.
 *
 * PSD2 FORMAT (input):
 * - transactionId: unique ID
 * - bookingDate / valueDate: ISO dates
 * - transactionAmount: { amount: string, currency: string }
 * - creditorName / debtorName: counterparty
 * - remittanceInformationUnstructured: description
 *
 * DB FORMAT (output):
 * - external_id: from transactionId
 * - booking_date: from bookingDate
 * - amount: parsed and always positive
 * - type: "income" or "expense" based on sign
 * - description: from remittanceInformationUnstructured
 * - category: derived from description
 *
 * @param mockTx - Transaction from mock API
 * @param userId - User ID for ownership
 * @param dbAccountId - Database account UUID
 * @returns Database transaction insert object
 */
export function transformMockTransaction(
  mockTx: MockTransaction,
  userId: string,
  dbAccountId: string
): DbTransactionInsert {
  // Parse amount - mock API returns signed string
  const rawAmount = parseFloat(mockTx.transactionAmount.amount);
  const isExpense = rawAmount < 0;
  const type: DbTransactionType = isExpense ? "expense" : "income";

  // Amount is stored as absolute value in DB
  const amount = Math.abs(rawAmount);

  // Derive description from counterparty or remittance info
  const description =
    mockTx.remittanceInformationUnstructured ||
    (isExpense ? mockTx.creditorName : mockTx.debtorName) ||
    "Transaction";

  // Map category based on description
  const category = mapCategory(description, isExpense);

  return {
    user_id: userId,
    account_id: dbAccountId,
    external_id: mockTx.transactionId,
    type,
    amount,
    currency: mockTx.transactionAmount.currency,
    description,
    category,
    booking_date: mockTx.bookingDate,
    value_date: mockTx.valueDate || null,
    creditor_name: mockTx.creditorName,
    debtor_name: mockTx.debtorName,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get mock transactions for an account.
 *
 * IMPORTANT: This function uses the mock generators directly instead of
 * calling the HTTP API. This is because:
 * 1. Server-side code can't easily pass cookies to fetch()
 * 2. The generators are the actual source of deterministic data
 * 3. This is more efficient (no HTTP overhead)
 *
 * The HTTP API endpoints (/api/mock/*) exist for:
 * - Testing/debugging via browser or API tools
 * - Potential future use by client-side code (though UI should never call mock directly)
 *
 * @param options - Mock API options including userId for hybrid seed
 * @returns Array of mock transactions
 */
function getMockTransactions(
  options: MockApiOptions & { userId: string }
): MockTransaction[] {
  const { mockAccountId, userId, dateFrom, dateTo } = options;

  // Use the mock generator directly
  // This is the same function used by /api/mock/transactions
  return generateMockTransactions(mockAccountId, userId, {
    dateFrom,
    dateTo,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Import Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Import transactions from a linked bank account.
 *
 * This is the main entry point for the import pipeline:
 * 1. Validates the account exists and belongs to user
 * 2. Fetches transactions from mock API
 * 3. Transforms to internal format
 * 4. UPSERTs into database (idempotent)
 * 5. Updates account balance
 * 6. Returns import summary
 *
 * IDEMPOTENCY:
 * - Uses external_id (transactionId from mock API) as conflict key
 * - Re-importing the same transactions updates existing records
 * - No duplicates are created
 *
 * @param options - Import options
 * @returns Import result summary
 */
export async function importTransactions(
  options: ImportOptions
): Promise<ImportResult> {
  const { accountId, userId, dateFrom, dateTo } = options;
  const errors: string[] = [];

  try {
    // 1. Get the account to find the mock account ID
    const account = await getAccountById(accountId);

    if (!account) {
      return {
        success: false,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        errorDetails: ["Account not found"],
      };
    }

    // Verify ownership (RLS should handle this, but double-check)
    if (account.user_id !== userId) {
      return {
        success: false,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 1,
        errorDetails: ["Access denied to this account"],
      };
    }

    // 2. Construct mock account ID from bank_id and account details
    // The mock account ID format is: {bankId}-{type}-{index}
    // We need to reconstruct this from the stored account data
    const mockAccountId = constructMockAccountId(account);

    // 3. Get mock transactions (using generator directly)
    const mockTransactions = getMockTransactions({
      mockAccountId,
      userId,
      dateFrom,
      dateTo,
    });

    if (mockTransactions.length === 0) {
      return {
        success: true,
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        errorDetails: [],
      };
    }

    // 4. Transform to database format
    const transactionsToInsert: DbTransactionInsert[] = [];

    for (const mockTx of mockTransactions) {
      try {
        const dbTx = transformMockTransaction(mockTx, userId, accountId);
        transactionsToInsert.push(dbTx);
      } catch (err) {
        errors.push(
          `Failed to transform transaction ${mockTx.transactionId}: ${err}`
        );
      }
    }

    // 5. UPSERT transactions (idempotent)
    const upsertedTransactions = await upsertTransactions(transactionsToInsert);

    // 6. Calculate and update account balance
    // Sum all transactions: income adds, expense subtracts
    const balanceChange = upsertedTransactions.reduce((sum, tx) => {
      return tx.type === "income" ? sum + tx.amount : sum - tx.amount;
    }, 0);

    // Update account with new balance
    // For MVP, we just set balance based on transactions
    // In real app, we'd sync with the bank's reported balance
    await updateAccountBalance(accountId, balanceChange);

    // 7. Return result
    // Note: Supabase upsert doesn't distinguish between insert and update
    // For MVP, we report all as "imported"
    return {
      success: true,
      imported: upsertedTransactions.length,
      updated: 0, // We can't easily distinguish inserts from updates
      skipped: mockTransactions.length - transactionsToInsert.length,
      errors: errors.length,
      errorDetails: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: 1,
      errorDetails: [error instanceof Error ? error.message : String(error)],
    };
  }
}

/**
 * Construct the mock account ID from database account.
 *
 * The mock API uses account IDs in format: {bankId}-{type}-{index}
 * We stored bank_id and account_type, so we can reconstruct it.
 *
 * For MVP, we assume index 001 for simplicity. In a real app,
 * we'd store the full mock account ID in the database.
 */
function constructMockAccountId(account: DbAccount): string {
  // Format: bankId-accountType-index
  // We use "001" as the index since we create accounts in order
  return `${account.bank_id}-${account.account_type}-001`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Validation Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validate a transaction before import.
 *
 * @param transaction - Partial transaction to validate
 * @returns Validation result
 */
export function validateTransaction(
  transaction: Partial<DbTransactionInsert>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!transaction.external_id) {
    errors.push("Missing external_id");
  }
  if (!transaction.booking_date) {
    errors.push("Missing booking_date");
  }
  if (transaction.amount === undefined || transaction.amount < 0) {
    errors.push("Invalid amount");
  }
  if (!transaction.currency) {
    errors.push("Missing currency");
  }
  if (!transaction.type || !["income", "expense"].includes(transaction.type)) {
    errors.push("Invalid type");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}