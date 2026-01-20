/**
 * Transaction Import API
 *
 * Imports transactions from mock bank API into the database.
 * Uses UPSERT logic to ensure idempotent imports.
 *
 * Current status: SKELETON — returns placeholder response.
 *
 * TODO (Task 4+):
 * - Accept account_id and date range parameters
 * - Fetch transactions from mock API
 * - Transform to internal format
 * - UPSERT into database (ON CONFLICT DO UPDATE)
 * - Return import summary (created, updated, skipped counts)
 */

import { NextResponse } from "next/server";

/**
 * POST /api/import
 *
 * Triggers transaction import for a linked account.
 * Body: { account_id: string, from_date?: string, to_date?: string }
 */
export async function POST() {
  // Placeholder response — will be replaced with real import logic
  return NextResponse.json({
    success: true,
    data: {
      imported: 0,
      updated: 0,
      skipped: 0,
      errors: 0,
    },
    _meta: {
      skeleton: true,
      message: "Import endpoint not implemented yet. Coming in Task 4.",
    },
  });
}

/**
 * GET /api/import
 *
 * Returns import status/history.
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      lastImport: null,
      status: "idle",
    },
    _meta: {
      skeleton: true,
      message: "Import status endpoint not implemented yet.",
    },
  });
}
