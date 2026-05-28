/**
 * BetterBudget Transactions Page
 *
 * WHAT:
 * The Transactions spoke page — full transaction history for the current month,
 * Income + Expenses KPI cards, and a Sync button.
 *
 * SECTIONS:
 *   1. Income / Expenses KPI cards (2-col grid at sm:, 1-col below)
 *   2. Full transaction list grouped by date (most recent first)
 *   3. SyncTransactionsButton (full-width at bottom)
 *
 * AUTH:
 * Protected by middleware (src/middleware.ts) — unauthenticated users are
 * redirected to /login before this page runs.
 *
 * DATA FLOW:
 *   Promise.all([
 *     getTransactions({ fromDate, toDate }),
 *     getTransactionSummary({ fromDate, toDate }),
 *     getAccounts()
 *   ])
 *
 * FILTERING (DESIGN_SYSTEM §7.2):
 * "Search/filter, category filter, date range picker" are explicitly deferred to post-MVP.
 * Phase 9 ships the full scrollable list with no filtering.
 *
 * EDGE STATES:
 *   0 transactions → inline note + SyncTransactionsButton
 *   DB error → calm inline note at bottom
 *
 * @see docs/DESIGN_SYSTEM.md §7.2 for transactions page spec
 */

import { generateMetadata } from "@/lib/head";
import { getTransactions, getTransactionSummary } from "@/lib/db/transactions";
import { getAccounts } from "@/lib/db/accounts";
import { getCurrentMonthStart, getCurrentMonthEnd } from "@/lib/budgets";
import { formatCurrency } from "@/utils/currency";
import { groupByDate } from "@/lib/transactions/mappers";

import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import {
  SyncTransactionsButton,
  TransactionItem,
  KpiCard,
} from "@/components/dashboard";

import type { DbTransaction, DbAccount } from "@/lib/db/types";
import type { TransactionSummary } from "@/lib/db/transactions";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = generateMetadata({ title: "Transactions" });

// ─────────────────────────────────────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────────────────────────────────────

// toTransactionItemProps and groupByDate are imported from @/lib/transactions/mappers
// (shared module — eliminates duplication with the Home page)

/**
 * Format a date string as a section heading.
 * Example: "2026-05-14" → "14. Mai 2026"
 */
function formatDateHeading(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default async function TransactionsPage() {
  const fromDate = getCurrentMonthStart();
  const toDate = getCurrentMonthEnd();

  let transactions: DbTransaction[] = [];
  let summary: TransactionSummary = {
    totalIncome: 0,
    totalExpenses: 0,
    netChange: 0,
    transactionCount: 0,
  };
  let accounts: DbAccount[] = [];
  let dataError: string | null = null;

  try {
    [transactions, summary, accounts] = await Promise.all([
      getTransactions({ fromDate, toDate }),
      getTransactionSummary({ fromDate, toDate }),
      getAccounts(),
    ]);
  } catch (error) {
    console.error("[transactions] Error fetching data:", error);
    dataError = error instanceof Error ? error.message : "Failed to load data";
  }

  const grouped = groupByDate(transactions);

  return (
    <>
      <PageHeader title="Transactions" subtitle="This month's activity" />

      <div className="flex flex-col gap-bb-8">

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 1: Income + Expenses KPI Cards                                */}
        {/* 2-col grid at sm:, 1-col below. Shows current month totals.           */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-label="Income and expenses summary" className="grid grid-cols-1 sm:grid-cols-2 gap-bb-4">
          <KpiCard
            label="Income"
            value={formatCurrency(summary.totalIncome)}
            valueColor="text-bb-positive"
          />
          <KpiCard
            label="Expenses"
            value={formatCurrency(summary.totalExpenses)}
            valueColor="text-bb-negative"
          />
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 2: Transaction List — grouped by date                          */}
        {/* Each date group has a heading + list of TransactionItem rows.          */}
        {/* No filtering in Phase 9 — post-MVP per DESIGN_SYSTEM §7.2.            */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        {transactions.length === 0 ? (
          <section aria-label="Transactions" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
            <EmptyState
              heading="Your transactions will appear here after syncing."
              action={<SyncTransactionsButton accountCount={accounts.length} />}
            />
          </section>
        ) : (
          <section aria-label="Transactions" className="flex flex-col gap-bb-6">
            {grouped.map(([date, items]) => (
              <div key={date}>
                {/* Date group heading */}
                <h2 className="text-bb-sm font-bold text-bb-text-secondary mb-bb-2">
                  {formatDateHeading(date)}
                </h2>

                {/* Transaction rows within the date group */}
                <div className="bg-bb-surface border border-bb-border rounded-bb-lg px-bb-5">
                  {items.map((tx, idx) => (
                    <TransactionItem
                      key={`${tx.merchant}-${tx.date}-${idx}`}
                      {...tx}
                    />
                  ))}
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 3: Sync Transactions button                                    */}
        {/* Full-width, only shown when transactions exist (otherwise shown in     */}
        {/* the empty state above).                                                */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        {transactions.length > 0 && (
          <SyncTransactionsButton accountCount={accounts.length} className="w-full" />
        )}
      </div>

      {dataError && (
        <p className="text-bb-sm text-bb-text-secondary text-center mt-bb-4">
          Couldn&apos;t load transaction data. Try refreshing.
        </p>
      )}
    </>
  );
}
