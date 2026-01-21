/**
 * Mock Banks API - GET /api/mock/banks
 *
 * PSD2 CONCEPT: ASPSP Directory
 * In real PSD2, banks are registered in a directory service that TPPs
 * (Third Party Providers) query to discover available banks.
 *
 * WHAT THIS SIMULATES:
 * - List of available banks for linking
 * - Bank metadata (name, BIC, country)
 *
 * WHAT THIS OMITS:
 * - Real bank registration/certification
 * - Dynamic bank status
 * - Bank capabilities/features
 *
 * ACCESS: Requires authentication (consistent with protected routes)
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 4.2
 */

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import { MOCK_BANKS } from "@/lib/mock";
import type { MockBanksResponse } from "@/lib/mock/types";

/**
 * GET /api/mock/banks
 *
 * Returns the list of available mock banks.
 *
 * Response shape matches PSD2 ASPSP directory format:
 * {
 *   banks: [{ bankId, name, bic, country, status }]
 * }
 *
 * Determinism: Always returns the same static list.
 */
export async function GET(): Promise<NextResponse<MockBanksResponse | { error: string }>> {
  try {
    // Verify authentication
    // This ensures the mock API is only accessible to authenticated users
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to access bank information." },
        { status: 401 }
      );
    }

    // Return the static list of mock banks
    // In real PSD2: This would be fetched from a central registry
    const response: MockBanksResponse = {
      banks: MOCK_BANKS,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[api/mock/banks] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank list" },
      { status: 500 }
    );
  }
}