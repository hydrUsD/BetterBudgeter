/**
 * Mock Banks API
 *
 * Returns a list of mock banks that users can "connect" to.
 * This simulates a PSD2-style bank discovery endpoint.
 *
 * Current status: SKELETON — returns hardcoded placeholder data.
 *
 * TODO (Task 3+):
 * - Return realistic bank metadata
 * - Add bank logos/icons
 * - Include supported features per bank
 */

import { NextResponse } from "next/server";

/**
 * GET /api/mock/banks
 *
 * Returns list of available mock banks.
 */
export async function GET() {
  // Placeholder response — will be replaced with deterministic mock data
  const banks = [
    {
      id: "demo-bank-001",
      name: "Demo Bank",
      country: "US",
      status: "available",
    },
    {
      id: "test-credit-union-002",
      name: "Test Credit Union",
      country: "US",
      status: "available",
    },
    {
      id: "fake-finance-003",
      name: "Fake Finance Co.",
      country: "US",
      status: "available",
    },
  ];

  return NextResponse.json({
    success: true,
    data: banks,
    _meta: {
      skeleton: true,
      message: "This is placeholder data. Real mock implementation coming in Task 3.",
    },
  });
}
