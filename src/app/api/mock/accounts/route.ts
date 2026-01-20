/**
 * Mock Accounts API
 *
 * Returns mock bank accounts for a linked bank.
 * Simulates PSD2 account information endpoint.
 *
 * Current status: SKELETON — returns hardcoded placeholder data.
 *
 * TODO (Task 3+):
 * - Accept bank_id parameter
 * - Return deterministic account data based on seed
 * - Include account balances
 * - Include account metadata (IBAN, type, etc.)
 */

import { NextResponse } from "next/server";

/**
 * GET /api/mock/accounts
 *
 * Returns mock accounts for linked bank.
 * Query params: bank_id (required in future)
 */
export async function GET() {
  // Placeholder response — will be replaced with deterministic mock data
  const accounts = [
    {
      id: "acc-checking-001",
      name: "Main Checking",
      type: "checking",
      currency: "USD",
      balance: 0,
    },
    {
      id: "acc-savings-002",
      name: "Savings Account",
      type: "savings",
      currency: "USD",
      balance: 0,
    },
  ];

  return NextResponse.json({
    success: true,
    data: accounts,
    _meta: {
      skeleton: true,
      message: "This is placeholder data. Real mock implementation coming in Task 3.",
    },
  });
}
