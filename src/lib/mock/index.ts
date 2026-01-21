/**
 * Mock Data Generators
 *
 * Provides deterministic mock data for the PSD2-style Fake-Finance API.
 * All generators produce the same output for the same input (deterministic).
 *
 * KEY DESIGN DECISIONS:
 * 1. No randomness - all values derived from seeds via simple hash
 * 2. Hybrid seed for transactions:
 *    - Content (amounts, dates, merchants) seeded by: bankId + accountId
 *    - IDs seeded by: userId + bankId + accountId + date + index
 * 3. Realistic but fictional data (German-style IBANs, European merchants)
 *
 * @see docs/PSD2_MOCK_STRATEGY.md for full specification
 */

import type {
  MockBank,
  MockAccount,
  MockTransaction,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants: Static Mock Banks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hardcoded list of mock banks.
 *
 * In real PSD2: This would come from an ASPSP directory.
 * For MVP: Static list that never changes.
 *
 * Each bank has different "personalities" in terms of the accounts and
 * transaction patterns they generate.
 */
export const MOCK_BANKS: MockBank[] = [
  {
    bankId: "sparkasse-berlin-001",
    name: "Sparkasse Berlin",
    bic: "BELADEBEXXX",
    country: "DE",
    status: "available",
  },
  {
    bankId: "volksbank-mitte-002",
    name: "Volksbank Mitte",
    bic: "GENODEF1V04",
    country: "DE",
    status: "available",
  },
  {
    bankId: "demo-bank-003",
    name: "Demo Bank International",
    bic: "DEMOBANK1",
    country: "DE",
    status: "available",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Deterministic Hash Function
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple deterministic hash function.
 *
 * Takes a string and returns a number between 0 and max.
 * Same input always produces same output.
 *
 * Note: This is NOT cryptographically secure - it's just for generating
 * consistent mock data. Uses djb2 algorithm.
 */
function deterministicHash(str: string, max: number = 2147483647): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash % max);
}

/**
 * Generate a deterministic hex string from a seed.
 * Used for generating transaction IDs.
 */
function deterministicHexId(seed: string, length: number = 8): string {
  const hash = deterministicHash(seed, 0xffffffff);
  return hash.toString(16).padStart(length, "0").slice(0, length);
}

// ─────────────────────────────────────────────────────────────────────────────
// Account Generators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Account templates for each bank.
 *
 * Each bank has a fixed set of account types with predetermined names.
 * Balance values are seeded by bankId for consistency.
 */
const BANK_ACCOUNT_TEMPLATES: Record<
  string,
  Array<{ name: string; type: "checking" | "savings" | "credit" }>
> = {
  "sparkasse-berlin-001": [
    { name: "Girokonto", type: "checking" },
    { name: "Sparkonto Plus", type: "savings" },
  ],
  "volksbank-mitte-002": [
    { name: "Gehaltskonto", type: "checking" },
    { name: "Tagesgeldkonto", type: "savings" },
    { name: "Kreditkarte", type: "credit" },
  ],
  "demo-bank-003": [
    { name: "Main Account", type: "checking" },
    { name: "Savings Account", type: "savings" },
  ],
};

/**
 * Generate mock IBAN for an account.
 *
 * Format: DE + 2 check digits + 8 digit bank code + 10 digit account number
 * All values are derived deterministically from the seed.
 */
function generateMockIban(seed: string): string {
  const bankCode = deterministicHash(seed + "-bank", 99999999)
    .toString()
    .padStart(8, "0");
  const accountNum = deterministicHash(seed + "-account", 9999999999)
    .toString()
    .padStart(10, "0");
  const checkDigits = deterministicHash(seed + "-check", 99)
    .toString()
    .padStart(2, "0");
  return `DE${checkDigits}${bankCode}${accountNum}`;
}

/**
 * Generate mock accounts for a bank.
 *
 * @param bankId - The bank identifier
 * @returns Array of mock accounts with deterministic data
 */
export function generateMockAccounts(bankId: string): MockAccount[] {
  const templates = BANK_ACCOUNT_TEMPLATES[bankId];

  if (!templates) {
    // Unknown bank - return a default checking account
    return [
      {
        accountId: `${bankId}-checking-001`,
        iban: generateMockIban(`${bankId}-default`),
        name: "Checking Account",
        accountType: "checking",
        currency: "EUR",
        balances: {
          available: {
            amount: "1000.00",
            currency: "EUR",
          },
        },
      },
    ];
  }

  return templates.map((template, index) => {
    const accountId = `${bankId}-${template.type}-${String(index + 1).padStart(3, "0")}`;
    const seed = `${bankId}-${template.type}-${index}`;

    // Generate balance based on account type
    // Checking: 500-5000, Savings: 1000-15000, Credit: -2000 to 0
    let balanceBase: number;
    switch (template.type) {
      case "checking":
        balanceBase = 500 + deterministicHash(seed + "-bal", 4500);
        break;
      case "savings":
        balanceBase = 1000 + deterministicHash(seed + "-bal", 14000);
        break;
      case "credit":
        balanceBase = -(deterministicHash(seed + "-bal", 2000));
        break;
    }

    // Add some cents for realism
    const cents = deterministicHash(seed + "-cents", 100);
    const balance = balanceBase + cents / 100;

    return {
      accountId,
      iban: generateMockIban(seed),
      name: template.name,
      accountType: template.type,
      currency: "EUR",
      balances: {
        available: {
          amount: balance.toFixed(2),
          currency: "EUR",
        },
      },
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Transaction Generators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Merchant/counterparty templates for realistic transactions.
 *
 * Each entry has:
 * - name: Counterparty name
 * - description: Transaction description template
 * - category: Suggested category
 * - amountRange: [min, max] for transaction amount
 * - isExpense: true for expenses (negative), false for income (positive)
 */
const TRANSACTION_TEMPLATES = [
  // Expenses
  {
    name: "REWE",
    description: "REWE SAGT DANKE",
    category: "Food",
    amountRange: [15, 120],
    isExpense: true,
  },
  {
    name: "EDEKA",
    description: "EDEKA Markt",
    category: "Food",
    amountRange: [10, 80],
    isExpense: true,
  },
  {
    name: "Lidl",
    description: "LIDL DIENSTLEISTUNG",
    category: "Food",
    amountRange: [20, 100],
    isExpense: true,
  },
  {
    name: "Amazon",
    description: "AMAZON EU S.A R.L.",
    category: "Shopping",
    amountRange: [15, 200],
    isExpense: true,
  },
  {
    name: "DB Vertrieb",
    description: "DB Vertrieb GmbH",
    category: "Transport",
    amountRange: [20, 150],
    isExpense: true,
  },
  {
    name: "BVG",
    description: "BVG Abo Monatskarte",
    category: "Transport",
    amountRange: [86, 86],
    isExpense: true,
  },
  {
    name: "Netflix",
    description: "NETFLIX.COM",
    category: "Entertainment",
    amountRange: [13, 18],
    isExpense: true,
  },
  {
    name: "Spotify",
    description: "SPOTIFY AB",
    category: "Entertainment",
    amountRange: [10, 15],
    isExpense: true,
  },
  {
    name: "Stadtwerke Berlin",
    description: "Stadtwerke Berlin Strom/Gas",
    category: "Utilities",
    amountRange: [80, 150],
    isExpense: true,
  },
  {
    name: "Telekom",
    description: "Telekom Deutschland GmbH",
    category: "Utilities",
    amountRange: [40, 60],
    isExpense: true,
  },
  {
    name: "DM Drogerie",
    description: "DM-DROGERIE MARKT",
    category: "Shopping",
    amountRange: [10, 50],
    isExpense: true,
  },
  {
    name: "Cafe Milano",
    description: "Cafe Milano Berlin",
    category: "Food",
    amountRange: [5, 25],
    isExpense: true,
  },

  // Income
  {
    name: "Arbeitgeber GmbH",
    description: "GEHALT/LOHN",
    category: "Salary",
    amountRange: [2500, 4500],
    isExpense: false,
  },
  {
    name: "Freelance Client",
    description: "Honorar Beratung",
    category: "Freelance",
    amountRange: [500, 2000],
    isExpense: false,
  },
  {
    name: "Steueramt",
    description: "Steuererstattung",
    category: "Other",
    amountRange: [200, 800],
    isExpense: false,
  },
];

// Note: generateDateInRange was removed as it's not currently used.
// The date generation logic is inlined in generateMockTransactions for simplicity.

/**
 * Generate mock transactions for an account.
 *
 * HYBRID SEED STRATEGY:
 * - Transaction CONTENT (amount, date, merchant) is seeded by: bankId + accountId
 *   → All users see the same content for the same bank/account
 * - Transaction ID is seeded by: userId + bankId + accountId + date + index
 *   → Each user gets unique IDs (simulates real PSD2 behavior)
 *
 * @param accountId - The account identifier (contains bankId)
 * @param userId - The user's ID (for unique transaction IDs)
 * @param options - Optional date range filters
 * @returns Array of mock transactions
 */
export function generateMockTransactions(
  accountId: string,
  userId: string,
  options?: {
    dateFrom?: string;
    dateTo?: string;
  }
): MockTransaction[] {
  // Extract bankId from accountId (format: bankId-type-index)
  const bankIdParts = accountId.split("-");
  const bankId = bankIdParts.slice(0, -2).join("-");

  // Content seed: bankId + accountId (same for all users)
  const contentSeed = `${bankId}-${accountId}`;

  // Determine number of transactions (50-100 as per spec)
  const transactionCount = 50 + deterministicHash(contentSeed + "-count", 51);

  // Generate date range (default: last 90 days)
  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 90);

  const dateFrom = options?.dateFrom
    ? new Date(options.dateFrom)
    : defaultFrom;
  const dateTo = options?.dateTo ? new Date(options.dateTo) : today;

  const transactions: MockTransaction[] = [];

  for (let i = 0; i < transactionCount; i++) {
    // Select template based on content seed + index
    const templateIndex = deterministicHash(
      contentSeed + `-template-${i}`,
      TRANSACTION_TEMPLATES.length
    );
    const template = TRANSACTION_TEMPLATES[templateIndex];

    // Generate date (deterministic within range)
    const daysSinceFrom = Math.floor(
      (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)
    );
    const dateOffset = deterministicHash(
      contentSeed + `-date-${i}`,
      Math.max(1, daysSinceFrom)
    );
    const transactionDate = new Date(dateFrom);
    transactionDate.setDate(transactionDate.getDate() + dateOffset);
    const bookingDate = transactionDate.toISOString().split("T")[0];

    // Filter by date range
    if (transactionDate < dateFrom || transactionDate > dateTo) {
      continue;
    }

    // Generate amount (deterministic within template range)
    const [minAmount, maxAmount] = template.amountRange;
    const amountBase =
      minAmount + deterministicHash(contentSeed + `-amt-${i}`, maxAmount - minAmount + 1);
    const cents = deterministicHash(contentSeed + `-cents-${i}`, 100);
    const amount = amountBase + cents / 100;
    const signedAmount = template.isExpense ? -amount : amount;

    // Generate UNIQUE transaction ID (includes userId for per-user uniqueness)
    // This is the "hybrid" part of the seed strategy
    const idSeed = `${userId}-${accountId}-${bookingDate}-${i}`;
    const transactionId = `txn-${deterministicHexId(idSeed, 8)}-${deterministicHexId(idSeed + "-suffix", 4)}`;

    const transaction: MockTransaction = {
      transactionId,
      bookingDate,
      valueDate: bookingDate, // Same as booking date for simplicity
      transactionAmount: {
        amount: signedAmount.toFixed(2),
        currency: "EUR",
      },
      creditorName: template.isExpense ? template.name : null,
      debtorName: template.isExpense ? null : template.name,
      remittanceInformationUnstructured: template.description,
    };

    transactions.push(transaction);
  }

  // Sort by date descending (most recent first)
  transactions.sort(
    (a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
  );

  return transactions;
}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

// Re-export types for convenience
export type { MockBank, MockAccount, MockTransaction } from "./types";