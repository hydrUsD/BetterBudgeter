/**
 * Mock Accounts API - GET /api/mock/accounts
 *
 * PSD2 CONCEPT: Account Information (AIS)
 * In real PSD2, after consent is granted, TPPs can fetch the user's
 * account list from the bank's AIS endpoint.
 *
 * WHAT THIS SIMULATES:
 * - Account metadata (name, type, IBAN)
 * - Current balance
 * - Multiple accounts per bank
 *
 * WHAT THIS OMITS:
 * - Real account verification
 * - Multi-currency accounts
 * - Account ownership validation
 * - Balance history
 *
 * ACCESS: Requires authentication + bankId parameter
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 4.3
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import { generateMockAccounts, MOCK_BANKS } from "@/lib/mock";
import type { MockAccountsResponse } from "@/lib/mock/types";

/**
 * GET /api/mock/accounts?bankId=xxx
 *
 * Returns mock accounts for the specified bank.
 *
 * Query Parameters:
 * - bankId (required): The bank identifier
 *
 * Response shape matches PSD2 account information format:
 * {
 *   accounts: [{ accountId, iban, name, accountType, currency, balances }]
 * }
 *
 * Determinism: Same bankId always returns identical accounts.
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<MockAccountsResponse | { error: string }>> {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access account information." },
        { status: 401 }
      );
    }

    // Parse bankId from query params
    const { searchParams } = new URL(request.url);
    const bankId = searchParams.get("bankId");

    if (!bankId) {
      return NextResponse.json(
        { error: "Missing required parameter: bankId" },
        { status: 400 }
      );
    }

    // Verify bank exists in our mock registry
    const bankExists = MOCK_BANKS.some((bank) => bank.bankId === bankId);
    if (!bankExists) {
      return NextResponse.json(
        { error: `Unknown bank: ${bankId}` },
        { status: 404 }
      );
    }

    // Generate deterministic accounts for this bank
    // Note: Account generation is based solely on bankId (not userId)
    // This means all users see the same accounts for the same bank
    const accounts = generateMockAccounts(bankId);

    const response: MockAccountsResponse = {
      accounts,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/mock/accounts] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch account information" },
      { status: 500 }
    );
  }
}