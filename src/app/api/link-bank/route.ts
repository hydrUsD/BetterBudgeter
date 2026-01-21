/**
 * Link Bank API - POST /api/link-bank
 *
 * PSD2 CONCEPT: Consent Management
 * In real PSD2, users grant explicit consent via OAuth redirect to the bank.
 * After consent, the TPP can access account information.
 *
 * WHAT THIS SIMULATES:
 * - User explicitly granting consent to access bank data
 * - Persisting consent by creating account records
 * - Consent is per-bank (all accounts from that bank)
 *
 * WHAT THIS OMITS:
 * - OAuth redirects
 * - eIDAS certificates
 * - Consent expiration
 * - Granular per-account consent
 *
 * MVP CONSENT MODEL:
 * Consent is represented by the existence of bb_accounts rows for a bank.
 * - POST creates accounts → grants consent
 * - DELETE removes accounts → revokes consent (future)
 *
 * @see docs/PSD2_MOCK_STRATEGY.md Section 5
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import {
  createAccounts,
  isBankLinked,
  getAccountsByBankId,
} from "@/lib/db/accounts";
import { generateMockAccounts, MOCK_BANKS } from "@/lib/mock";
import type { DbAccountInsert } from "@/lib/db/types";

// ─────────────────────────────────────────────────────────────────────────────
// Request/Response Types
// ─────────────────────────────────────────────────────────────────────────────

interface LinkBankRequest {
  /** The bank identifier to link */
  bankId: string;
}

interface LinkBankResponse {
  success: boolean;
  message: string;
  /** Number of accounts created */
  accountsLinked?: number;
  /** Bank name for display */
  bankName?: string;
}

interface LinkBankErrorResponse {
  error: string;
  code?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/link-bank - Grant Consent / Link Bank
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Link a bank account (grant consent).
 *
 * This endpoint:
 * 1. Validates the user is authenticated
 * 2. Validates the bank exists
 * 3. Checks if bank is already linked
 * 4. Fetches mock accounts from the bank
 * 5. Creates account records in database (= consent granted)
 *
 * Request body:
 * { bankId: string }
 *
 * Response:
 * { success: true, message: string, accountsLinked: number, bankName: string }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<LinkBankResponse | LinkBankErrorResponse>> {
  try {
    // 1. Verify authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to link a bank account." },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let body: LinkBankRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body. Expected JSON." },
        { status: 400 }
      );
    }

    const { bankId } = body;

    if (!bankId || typeof bankId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid bankId in request body." },
        { status: 400 }
      );
    }

    // 3. Verify bank exists in our mock registry
    const bank = MOCK_BANKS.find((b) => b.bankId === bankId);
    if (!bank) {
      return NextResponse.json(
        { error: `Unknown bank: ${bankId}`, code: "BANK_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 4. Check if bank is already linked (consent already granted)
    const alreadyLinked = await isBankLinked(bankId);
    if (alreadyLinked) {
      // Return success but indicate it was already linked
      const existingAccounts = await getAccountsByBankId(bankId);
      return NextResponse.json({
        success: true,
        message: `${bank.name} is already linked to your account.`,
        accountsLinked: existingAccounts.length,
        bankName: bank.name,
      });
    }

    // 5. Generate mock accounts for this bank
    // This simulates fetching accounts from the bank's API after consent
    const mockAccounts = generateMockAccounts(bankId);

    // 6. Transform mock accounts to database format
    // This is where we "persist the consent" by creating account records
    const accountsToCreate: DbAccountInsert[] = mockAccounts.map((mockAccount) => ({
      user_id: user.id,
      bank_id: bankId,
      bank_name: bank.name,
      account_name: mockAccount.name,
      account_type: mockAccount.accountType,
      currency: mockAccount.currency,
      balance: parseFloat(mockAccount.balances.available.amount),
      iban: mockAccount.iban,
      // Note: last_synced_at is null until first import
    }));

    // 7. Create accounts in database
    const createdAccounts = await createAccounts(accountsToCreate);

    // 8. Return success response
    return NextResponse.json({
      success: true,
      message: `Successfully linked ${bank.name}. ${createdAccounts.length} account(s) added.`,
      accountsLinked: createdAccounts.length,
      bankName: bank.name,
    });
  } catch (error) {
    console.error("[api/link-bank] Error:", error);
    return NextResponse.json(
      { error: "Failed to link bank account. Please try again." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/link-bank - Get Linked Banks Status
// ─────────────────────────────────────────────────────────────────────────────

interface LinkedBanksResponse {
  linkedBanks: Array<{
    bankId: string;
    bankName: string;
    accountCount: number;
    linkedAt: string;
  }>;
}

/**
 * Get list of linked banks for the current user.
 *
 * This is useful for showing which banks are already connected.
 */
export async function GET(): Promise<
  NextResponse<LinkedBanksResponse | LinkBankErrorResponse>
> {
  try {
    // Verify authentication
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    // Get all accounts and group by bank
    const { data: accounts, error } = await supabase
      .from("bb_accounts")
      .select("bank_id, bank_name, created_at")
      .order("created_at", { ascending: true });

    if (error) {
      throw error;
    }

    // Group accounts by bank
    const bankMap = new Map<
      string,
      { bankName: string; count: number; linkedAt: string }
    >();

    for (const account of accounts ?? []) {
      const existing = bankMap.get(account.bank_id);
      if (existing) {
        existing.count++;
      } else {
        bankMap.set(account.bank_id, {
          bankName: account.bank_name,
          count: 1,
          linkedAt: account.created_at,
        });
      }
    }

    // Transform to response format
    const linkedBanks = Array.from(bankMap.entries()).map(([bankId, data]) => ({
      bankId,
      bankName: data.bankName,
      accountCount: data.count,
      linkedAt: data.linkedAt,
    }));

    return NextResponse.json({ linkedBanks });
  } catch (error) {
    console.error("[api/link-bank] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch linked banks." },
      { status: 500 }
    );
  }
}