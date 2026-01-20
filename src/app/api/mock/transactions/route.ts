/**
 * Mock Transactions API
 *
 * Returns mock transactions for a bank account.
 * Simulates PSD2 transaction history endpoint.
 *
 * Current status: SKELETON — returns hardcoded placeholder data.
 *
 * TODO (Task 3+):
 * - Accept account_id parameter
 * - Return deterministic transactions based on seed
 * - Include proper date ranges
 * - Include realistic merchant names and categories
 * - Generate stable external_id values for idempotent imports
 */

import { NextResponse } from "next/server";

/**
 * GET /api/mock/transactions
 *
 * Returns mock transactions for an account.
 * Query params: account_id, from_date, to_date (required in future)
 */
export async function GET() {
  // Placeholder response — will be replaced with deterministic mock data
  const transactions = [
    {
      external_id: "txn-mock-001",
      date: new Date().toISOString(),
      amount: -25.0,
      currency: "USD",
      description: "Mock Transaction 1",
      category: "Shopping",
      type: "expense",
    },
    {
      external_id: "txn-mock-002",
      date: new Date().toISOString(),
      amount: 1500.0,
      currency: "USD",
      description: "Mock Salary",
      category: "Salary",
      type: "income",
    },
  ];

  return NextResponse.json({
    success: true,
    data: transactions,
    _meta: {
      skeleton: true,
      message: "This is placeholder data. Real mock implementation coming in Task 3.",
    },
  });
}
