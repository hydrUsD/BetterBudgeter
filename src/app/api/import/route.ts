/**
 * Transaction Import API - POST /api/import
 *
 * Orchestrates the manual transaction import pipeline.
 * This is the ONLY entry point for importing transactions from mock API → DB.
 *
 * PSD2 CONCEPT: AIS (Account Information Services)
 * In real PSD2, this would call the bank's API to fetch transactions.
 * For MVP, we use the mock generators to simulate this behavior.
 *
 * FLOW:
 * 1. Verify user is authenticated
 * 2. Verify user has linked accounts (consent exists)
 * 3. For each account: fetch mock transactions → normalize → UPSERT
 * 4. Return aggregated result summary
 *
 * IDEMPOTENCY:
 * - Re-running import produces identical results
 * - UPSERT uses UNIQUE(user_id, external_id) constraint
 * - No duplicates created on repeated imports
 *
 * @see docs/IMPORT_PIPELINE_STRATEGY.md for full specification
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import { getAccounts } from "@/lib/db/accounts";
import { importTransactions } from "@/lib/import";
import type { ImportResult } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Request body for import endpoint.
 * All fields are optional - defaults import all accounts with 90-day range.
 */
interface ImportRequest {
  /** Optional: specific account ID to import (imports all if not provided) */
  accountId?: string;
  /** Optional: start date for transaction range (ISO YYYY-MM-DD) */
  dateFrom?: string;
  /** Optional: end date for transaction range (ISO YYYY-MM-DD) */
  dateTo?: string;
}

/**
 * Aggregated import result across all accounts.
 */
interface AggregatedImportResult {
  success: boolean;
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  accountsProcessed: number;
  errorDetails?: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/import - Trigger Manual Import
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Trigger a manual transaction import.
 *
 * This endpoint:
 * 1. Verifies authentication
 * 2. Checks that user has linked accounts (consent)
 * 3. Imports transactions for all (or specified) accounts
 * 4. Returns aggregated result
 *
 * Request body (all optional):
 * {
 *   accountId?: string,  // Import specific account only
 *   dateFrom?: string,   // Start date (default: 90 days ago)
 *   dateTo?: string      // End date (default: today)
 * }
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<AggregatedImportResult | { error: string }>> {
  try {
    // ─────────────────────────────────────────────────────────────────────────
    // Step 1: Verify authentication
    // ─────────────────────────────────────────────────────────────────────────
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in to import transactions." },
        { status: 401 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2: Parse request body (optional parameters)
    // ─────────────────────────────────────────────────────────────────────────
    let body: ImportRequest = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Empty body is OK - use defaults
    }

    const { accountId, dateFrom, dateTo } = body;

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3: Get accounts to import (consent check)
    // ─────────────────────────────────────────────────────────────────────────
    const allAccounts = await getAccounts();

    if (allAccounts.length === 0) {
      return NextResponse.json(
        { error: "No linked banks. Please link a bank first." },
        { status: 400 }
      );
    }

    // Filter to specific account if requested
    const accountsToImport = accountId
      ? allAccounts.filter((a) => a.id === accountId)
      : allAccounts;

    if (accountsToImport.length === 0) {
      return NextResponse.json(
        { error: "Account not found." },
        { status: 404 }
      );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4: Import transactions for each account
    // ─────────────────────────────────────────────────────────────────────────
    const results: ImportResult[] = [];
    const allErrors: string[] = [];

    for (const account of accountsToImport) {
      try {
        const result = await importTransactions({
          accountId: account.id,
          userId: user.id,
          dateFrom,
          dateTo,
        });

        results.push(result);

        // Collect any errors from this import
        if (result.errorDetails && result.errorDetails.length > 0) {
          allErrors.push(...result.errorDetails);
        }
      } catch (error) {
        // Record account-level failure but continue with other accounts
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        allErrors.push(`Account ${account.account_name}: ${errorMessage}`);
        results.push({
          success: false,
          imported: 0,
          updated: 0,
          skipped: 0,
          errors: 1,
          errorDetails: [errorMessage],
        });
      }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 5: Aggregate results
    // ─────────────────────────────────────────────────────────────────────────
    const aggregated: AggregatedImportResult = {
      success: results.every((r) => r.success),
      totalImported: results.reduce((sum, r) => sum + r.imported, 0),
      totalUpdated: results.reduce((sum, r) => sum + r.updated, 0),
      totalSkipped: results.reduce((sum, r) => sum + r.skipped, 0),
      totalErrors: results.reduce((sum, r) => sum + r.errors, 0),
      accountsProcessed: accountsToImport.length,
    };

    // Only include error details if there were errors
    if (allErrors.length > 0) {
      aggregated.errorDetails = allErrors;
    }

    return NextResponse.json(aggregated);
  } catch (error) {
    console.error("[api/import] Error:", error);
    return NextResponse.json(
      { error: "Import failed. Please try again later." },
      { status: 500 }
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/import - Get Import Status
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get import status for the current user.
 *
 * Returns information about linked accounts and their sync status.
 * Useful for the UI to determine if import button should be enabled.
 */
export async function GET(): Promise<
  NextResponse<
    | {
        canImport: boolean;
        accountCount: number;
        message: string;
      }
    | { error: string }
  >
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
        { error: "Please log in." },
        { status: 401 }
      );
    }

    // Get linked accounts
    const accounts = await getAccounts();

    if (accounts.length === 0) {
      return NextResponse.json({
        canImport: false,
        accountCount: 0,
        message: "No linked banks. Link a bank to start importing.",
      });
    }

    return NextResponse.json({
      canImport: true,
      accountCount: accounts.length,
      message: `${accounts.length} account(s) ready for import.`,
    });
  } catch (error) {
    console.error("[api/import] GET Error:", error);
    return NextResponse.json(
      { error: "Failed to check import status." },
      { status: 500 }
    );
  }
}