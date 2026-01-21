/**
 * PSD2 Mock API Types
 *
 * These types mirror the PSD2 AISP (Account Information Services) data structures.
 * They represent the DTOs returned by the mock API endpoints.
 *
 * IMPORTANT: These are the "external" API shapes. The import pipeline transforms
 * these into internal database types (DbTransaction, DbAccount).
 *
 * @see docs/PSD2_MOCK_STRATEGY.md for specification details
 */

// ─────────────────────────────────────────────────────────────────────────────
// Bank Types (PSD2: ASPSP Directory)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mock bank entry returned by /api/mock/banks
 *
 * In real PSD2: This would come from an ASPSP directory service.
 * For MVP: We hardcode a list of mock banks.
 */
export interface MockBank {
  /** Stable bank identifier, e.g. "demo-bank-001" */
  bankId: string;

  /** Display name for the bank */
  name: string;

  /** BIC/SWIFT code (mock value) */
  bic: string;

  /** ISO country code, e.g. "DE" */
  country: string;

  /** Bank logo URL (optional, for future use) */
  logoUrl?: string;

  /** Always "available" for mock */
  status: "available";
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Types (PSD2: Account Information)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mock account balance structure
 *
 * In real PSD2: Multiple balance types exist (expected, interim, available).
 * For MVP: We only simulate the "available" balance.
 */
export interface MockBalance {
  /** Decimal string (e.g. "1234.56") */
  amount: string;

  /** ISO 4217 currency code */
  currency: string;
}

/**
 * Mock account entry returned by /api/mock/accounts
 *
 * In real PSD2: This comes from GET /accounts endpoint.
 * For MVP: Generated deterministically based on bankId.
 */
export interface MockAccount {
  /** Stable account identifier */
  accountId: string;

  /** Mock IBAN */
  iban: string;

  /** Account display name */
  name: string;

  /** Account type: checking, savings, or credit */
  accountType: "checking" | "savings" | "credit";

  /** ISO 4217 currency code */
  currency: string;

  /** Account balances */
  balances: {
    available: MockBalance;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Types (PSD2: Transaction Details)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mock transaction amount structure
 *
 * In PSD2: Amount is a signed decimal string with currency.
 * Negative = outgoing (expense), Positive = incoming (income)
 */
export interface MockTransactionAmount {
  /** Signed decimal string (e.g. "-25.00" or "1500.00") */
  amount: string;

  /** ISO 4217 currency code */
  currency: string;
}

/**
 * Mock transaction entry returned by /api/mock/transactions
 *
 * This structure mirrors the real PSD2 transaction format:
 * - transactionId: Unique per user (hybrid seed strategy)
 * - bookingDate/valueDate: ISO date strings
 * - creditorName/debtorName: Counterparty info
 * - remittanceInformationUnstructured: Description/memo
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 4.4 for hybrid seed strategy
 */
export interface MockTransaction {
  /**
   * Unique transaction identifier.
   *
   * HYBRID SEED STRATEGY:
   * - Content (amount, date, description) is seeded by: bankId + accountId
   * - ID is seeded by: userId + bankId + accountId + bookingDate + index
   *
   * This means:
   * - All users see the same transaction CONTENT for the same bank
   * - Each user gets UNIQUE transaction IDs
   */
  transactionId: string;

  /** Booking date (when transaction was recorded) - ISO date string */
  bookingDate: string;

  /** Value date (when funds moved) - ISO date string */
  valueDate: string;

  /** Transaction amount with currency */
  transactionAmount: MockTransactionAmount;

  /** Recipient name for outgoing payments (null for incoming) */
  creditorName: string | null;

  /** Sender name for incoming payments (null for outgoing) */
  debtorName: string | null;

  /** Transaction description/memo */
  remittanceInformationUnstructured: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Response from GET /api/mock/banks
 */
export interface MockBanksResponse {
  banks: MockBank[];
}

/**
 * Response from GET /api/mock/accounts
 */
export interface MockAccountsResponse {
  accounts: MockAccount[];
}

/**
 * Response from GET /api/mock/transactions
 *
 * Note: In real PSD2, there's also a "pending" array for unbooked transactions.
 * For MVP, we only return "booked" transactions.
 */
export interface MockTransactionsResponse {
  transactions: {
    booked: MockTransaction[];
  };
}