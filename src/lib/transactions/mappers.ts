/**
 * Transaction Mappers — shared view-model transformation layer
 *
 * PURPOSE:
 * Converts raw DbTransaction rows (from Supabase) into the TransactionItemProps
 * view-model that presentational components consume. This decouples UI components
 * from the database schema (CONTEXT D-CMP-02).
 *
 * Previously, toTransactionItemProps was duplicated in both:
 *   - src/app/(bb)/page.tsx          (Home hub)
 *   - src/app/(bb)/transactions/page.tsx  (Transactions spoke)
 *
 * This shared module eliminates that duplication while keeping the mapper testable
 * and independent of any page-level concerns.
 *
 * DATA FLOW:
 *   DbTransaction (from lib/db/transactions) → toTransactionItemProps() → TransactionItemProps
 *   DbTransaction[] → groupByDate() → [dateString, TransactionItemProps[]][]
 *
 * WHY in lib/ (not utils/):
 * These functions reference DB types (DbTransaction) and application-level DTOs
 * (TransactionItemProps), bridging the data layer and UI layer. Per CLAUDE.md,
 * anything that connects data structures to business concepts belongs in lib/.
 *
 * EXTENSION POINTS:
 * - Add enrichment logic here (e.g. merchant name normalization, category overrides)
 * - Add new grouping strategies (groupByCategory, groupByWeek) as needed
 *
 * @see src/components/dashboard/TransactionItem.tsx for the consuming component
 * @see src/lib/db/types.ts for DbTransaction definition
 */

import type { DbTransaction } from "@/lib/db/types";
import type { TransactionCategory } from "@/types/finance";
import type { TransactionItemProps } from "@/components/dashboard/TransactionItem";

// ─────────────────────────────────────────────────────────────────────────────
// Single-row mapper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map a raw DbTransaction row to the TransactionItem view-model.
 *
 * Merchant derivation (RESEARCH Pattern 4):
 *   1. description — the human-readable label stored by the import pipeline
 *   2. creditor_name — PSD2-style creditor field
 *   3. debtor_name — PSD2-style debtor field
 *   4. "Transaction" — fallback so the UI never renders an empty merchant name
 *
 * Amount is always Math.abs() because TransactionItem derives the sign from `type`.
 * Category defaults to "Other" when the DB value is null.
 *
 * @param tx - Raw database row from getRecentTransactions() or getTransactions()
 */
export function toTransactionItemProps(tx: DbTransaction): TransactionItemProps {
  // Merchant: prefer description, then PSD2 creditor/debtor fields, then fallback.
  const merchant =
    tx.description ?? tx.creditor_name ?? tx.debtor_name ?? "Transaction";

  // Booking date fallback: DB schema says NOT NULL but guard against empty strings.
  const date = tx.booking_date || new Date().toISOString().split("T")[0];

  return {
    merchant,
    amount: Math.abs(tx.amount),
    type: tx.type,
    category: (tx.category ?? "Other") as TransactionCategory,
    date,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Date grouping
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Group transactions by booking date for section rendering.
 *
 * Returns an array of [dateString, transactionItems[]] pairs,
 * ordered by date descending (most recent first).
 *
 * Each transaction within a group is already mapped to TransactionItemProps.
 *
 * WHY sort explicitly:
 * Although transactions are usually sorted from the DB query, Map insertion
 * order is not guaranteed to preserve that across all runtimes. Explicit sort
 * ensures deterministic output regardless of DB ordering.
 *
 * @param transactions - Raw DB rows to group
 */
export function groupByDate(
  transactions: DbTransaction[]
): [string, TransactionItemProps[]][] {
  const groups = new Map<string, TransactionItemProps[]>();

  for (const tx of transactions) {
    const date = tx.booking_date || new Date().toISOString().split("T")[0];
    const existing = groups.get(date) ?? [];
    existing.push(toTransactionItemProps(tx));
    groups.set(date, existing);
  }

  // Sort by date descending (most recent first)
  return Array.from(groups.entries()).sort(
    (a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()
  );
}
