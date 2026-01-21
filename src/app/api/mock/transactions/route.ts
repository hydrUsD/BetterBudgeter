/**
 * Mock Transactions API - GET /api/mock/transactions
 *
 * PSD2 CONCEPT: Transaction History (AIS)
 * In real PSD2, TPPs can fetch transaction history for accounts
 * the user has granted access to.
 *
 * WHAT THIS SIMULATES:
 * - Transaction history for an account
 * - PSD2-format transaction data
 * - Date range filtering
 *
 * WHAT THIS OMITS:
 * - Pending transactions
 * - Transaction categorization by bank
 * - Pagination (dataset is small enough)
 * - Real-time updates
 *
 * HYBRID SEED STRATEGY (Important!):
 * - Transaction CONTENT (amounts, dates, merchants) → seeded by bankId + accountId
 *   → All users see the same content for the same bank/account
 * - Transaction IDs → seeded by userId + accountId + date + index
 *   → Each user gets unique IDs (simulates real bank behavior)
 *
 * ACCESS: Requires authentication + accountId parameter
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 4.4
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import { generateMockTransactions } from "@/lib/mock";
import type { MockTransactionsResponse } from "@/lib/mock/types";

/**
 * GET /api/mock/transactions?accountId=xxx&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
 *
 * Returns mock transactions for the specified account.
 *
 * Query Parameters:
 * - accountId (required): The account identifier
 * - dateFrom (optional): Start date, ISO format (default: 90 days ago)
 * - dateTo (optional): End date, ISO format (default: today)
 *
 * Response shape matches PSD2 transaction format:
 * {
 *   transactions: {
 *     booked: [{ transactionId, bookingDate, transactionAmount, ... }]
 *   }
 * }
 *
 * Determinism:
 * - Same accountId + userId always returns identical transaction IDs
 * - Same accountId (any user) returns identical transaction content
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<MockTransactionsResponse | { error: string }>> {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access transaction history." },
        { status: 401 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId");
    const dateFrom = searchParams.get("dateFrom") ?? undefined;
    const dateTo = searchParams.get("dateTo") ?? undefined;

    if (!accountId) {
      return NextResponse.json(
        { error: "Missing required parameter: accountId" },
        { status: 400 }
      );
    }

    // Validate date format if provided
    if (dateFrom && !/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
      return NextResponse.json(
        { error: "Invalid dateFrom format. Expected: YYYY-MM-DD" },
        { status: 400 }
      );
    }
    if (dateTo && !/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
      return NextResponse.json(
        { error: "Invalid dateTo format. Expected: YYYY-MM-DD" },
        { status: 400 }
      );
    }

    // Generate transactions using HYBRID SEED STRATEGY
    // - Content is deterministic per accountId
    // - IDs are deterministic per userId + accountId
    const transactions = generateMockTransactions(accountId, user.id, {
      dateFrom,
      dateTo,
    });

    // Format response in PSD2 style (only "booked" transactions for MVP)
    // In real PSD2, there's also a "pending" array for uncleared transactions
    const response: MockTransactionsResponse = {
      transactions: {
        booked: transactions,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/mock/transactions] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch transaction history" },
      { status: 500 }
    );
  }
}