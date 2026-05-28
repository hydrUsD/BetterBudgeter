/**
 * Transaction Mapper Unit Tests
 *
 * Tests the shared transaction mapping functions extracted into
 * src/lib/transactions/mappers.ts.
 *
 * Test axes:
 *   1. Income vs expense type mapping
 *   2. Merchant fallback chain (description > creditor > debtor > "Transaction")
 *   3. Amount is always Math.abs()
 *   4. Category defaults to "Other" when null
 *   5. groupByDate groups correctly and sorts descending
 *   6. Empty booking_date fallback
 *
 * @see src/lib/transactions/mappers.ts for the implementation
 */

import { describe, it, expect } from "vitest";
import {
  toTransactionItemProps,
  groupByDate,
} from "@/lib/transactions/mappers";
import type { DbTransaction } from "@/lib/db/types";

// ─────────────────────────────────────────────────────────────────────────────
// Test Fixtures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory for creating DbTransaction test fixtures.
 * Provides sensible defaults; override any field via the partial parameter.
 */
function makeTx(overrides: Partial<DbTransaction> = {}): DbTransaction {
  return {
    id: "tx-001",
    user_id: "user-001",
    account_id: "acc-001",
    external_id: "ext-001",
    type: "expense",
    amount: -42.5,
    currency: "EUR",
    description: "REWE Supermarkt",
    category: "Food",
    booking_date: "2026-05-15",
    value_date: "2026-05-15",
    creditor_name: "REWE Group",
    debtor_name: null,
    created_at: "2026-05-15T10:00:00Z",
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// toTransactionItemProps
// ─────────────────────────────────────────────────────────────────────────────

describe("toTransactionItemProps", () => {
  it("maps an expense transaction correctly", () => {
    const tx = makeTx({ type: "expense", amount: -25.0, category: "Food" });
    const result = toTransactionItemProps(tx);

    expect(result.type).toBe("expense");
    expect(result.amount).toBe(25.0);
    expect(result.category).toBe("Food");
    expect(result.merchant).toBe("REWE Supermarkt");
    expect(result.date).toBe("2026-05-15");
  });

  it("maps an income transaction correctly", () => {
    const tx = makeTx({
      type: "income",
      amount: 3200.0,
      category: "Salary",
      description: "Gehalt Mai",
    });
    const result = toTransactionItemProps(tx);

    expect(result.type).toBe("income");
    expect(result.amount).toBe(3200.0);
    expect(result.category).toBe("Salary");
    expect(result.merchant).toBe("Gehalt Mai");
  });

  // ── Merchant fallback chain ──────────────────────────────────────────────

  it("uses description as merchant when available", () => {
    const tx = makeTx({ description: "My Description" });
    expect(toTransactionItemProps(tx).merchant).toBe("My Description");
  });

  it("falls back to creditor_name when description is null", () => {
    const tx = makeTx({
      description: null,
      creditor_name: "Telekom",
      debtor_name: "Paul Heuwer",
    });
    expect(toTransactionItemProps(tx).merchant).toBe("Telekom");
  });

  it("falls back to debtor_name when description and creditor are null", () => {
    const tx = makeTx({
      description: null,
      creditor_name: null,
      debtor_name: "Jane Doe",
    });
    expect(toTransactionItemProps(tx).merchant).toBe("Jane Doe");
  });

  it('falls back to "Transaction" when all name fields are null', () => {
    const tx = makeTx({
      description: null,
      creditor_name: null,
      debtor_name: null,
    });
    expect(toTransactionItemProps(tx).merchant).toBe("Transaction");
  });

  // ── Amount: always Math.abs() ────────────────────────────────────────────

  it("converts negative amounts to positive via Math.abs()", () => {
    const tx = makeTx({ amount: -99.99 });
    expect(toTransactionItemProps(tx).amount).toBe(99.99);
  });

  it("keeps positive amounts as-is", () => {
    const tx = makeTx({ amount: 50.0 });
    expect(toTransactionItemProps(tx).amount).toBe(50.0);
  });

  it("handles zero amount", () => {
    const tx = makeTx({ amount: 0 });
    expect(toTransactionItemProps(tx).amount).toBe(0);
  });

  // ── Category defaults ────────────────────────────────────────────────────

  it('defaults category to "Other" when null', () => {
    const tx = makeTx({ category: null });
    expect(toTransactionItemProps(tx).category).toBe("Other");
  });

  it("preserves non-null category", () => {
    const tx = makeTx({ category: "Transport" });
    expect(toTransactionItemProps(tx).category).toBe("Transport");
  });

  // ── Booking date fallback ────────────────────────────────────────────────

  it("uses booking_date when present", () => {
    const tx = makeTx({ booking_date: "2026-03-10" });
    expect(toTransactionItemProps(tx).date).toBe("2026-03-10");
  });

  it("falls back to today's date when booking_date is empty string", () => {
    const tx = makeTx({ booking_date: "" });
    const result = toTransactionItemProps(tx);
    // Should be a valid ISO date string (YYYY-MM-DD)
    expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// groupByDate
// ─────────────────────────────────────────────────────────────────────────────

describe("groupByDate", () => {
  it("groups transactions by booking_date", () => {
    const transactions = [
      makeTx({ id: "t1", booking_date: "2026-05-15", description: "A" }),
      makeTx({ id: "t2", booking_date: "2026-05-15", description: "B" }),
      makeTx({ id: "t3", booking_date: "2026-05-14", description: "C" }),
    ];

    const result = groupByDate(transactions);

    expect(result).toHaveLength(2);
    // First group = most recent date
    expect(result[0][0]).toBe("2026-05-15");
    expect(result[0][1]).toHaveLength(2);
    // Second group = older date
    expect(result[1][0]).toBe("2026-05-14");
    expect(result[1][1]).toHaveLength(1);
  });

  it("sorts groups descending (most recent first)", () => {
    const transactions = [
      makeTx({ id: "t1", booking_date: "2026-05-10" }),
      makeTx({ id: "t2", booking_date: "2026-05-20" }),
      makeTx({ id: "t3", booking_date: "2026-05-15" }),
    ];

    const result = groupByDate(transactions);

    expect(result.map(([date]) => date)).toEqual([
      "2026-05-20",
      "2026-05-15",
      "2026-05-10",
    ]);
  });

  it("returns empty array for empty input", () => {
    expect(groupByDate([])).toEqual([]);
  });

  it("maps transactions to TransactionItemProps within groups", () => {
    const transactions = [
      makeTx({
        id: "t1",
        booking_date: "2026-05-15",
        description: "Coffee",
        amount: -4.5,
        type: "expense",
      }),
    ];

    const result = groupByDate(transactions);
    const item = result[0][1][0];

    expect(item.merchant).toBe("Coffee");
    expect(item.amount).toBe(4.5);
    expect(item.type).toBe("expense");
  });
});
