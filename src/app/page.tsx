/**
 * BetterBudget Dashboard Page (Home)
 *
 * This is the main dashboard showing financial overview.
 * All data is fetched from the database (not mock APIs).
 *
 * Auth: Protected by middleware - only authenticated users can access.
 * Unauthenticated users are redirected to /login.
 *
 * KEY FEATURES:
 * - Total Balance, Income, Expenses KPIs
 * - Budget Progress with traffic light colors
 * - Spending by Category donut chart (Recharts)
 * - Recent Transactions list
 * - Linked Accounts list
 * - Sync Transactions button for manual import
 *
 * ADHD DESIGN:
 * - Clear visual hierarchy (balance first, then details)
 * - Traffic light budget feedback (glanceable)
 * - Max 1 chart to reduce visual noise
 * - Predictable behavior (manual refresh only)
 *
 * DATA FLOW:
 * - UI reads from database only (never from mock API)
 * - Manual sync triggers: UI → /api/import → mock → DB → UI refresh
 *
 * EXTENSION POINTS (marked with comments):
 * - Notification bell/badge (header area)
 * - Spending Trends chart (after category chart)
 * - UI layout settings (via bb_user_settings)
 *
 * ROUTING:
 * - This page lives at `/` (the new primary landing page)
 * - `/dashboard` redirects here (HTTP 308)
 * - Legacy OopsBudgeter dashboard is at `/legacy`
 *
 * @see docs/DASHBOARD_STRATEGY.md for design decisions
 * @see docs/SUPABASE_STRATEGY.md for data flow
 * @see docs/IMPORT_PIPELINE_STRATEGY.md for import behavior
 */

import { generateMetadata } from "@/lib/head";
import { getUser } from "@/lib/auth";
import { getAccounts } from "@/lib/db/accounts";
import {
  getRecentTransactions,
  getTransactionSummary,
  getExpensesByCategory,
  type CategoryBreakdown,
} from "@/lib/db/transactions";
import { calculateAllBudgetProgress } from "@/lib/budgets";
import { SignOutButton } from "@/components/auth";
import {
  SyncTransactionsButton,
  BudgetProgressSection,
  SpendingByCategoryChart,
  BudgetNotificationDialogs,
} from "@/components/dashboard";
import type { BudgetProgress } from "@/types/finance";

export const metadata = generateMetadata({
  title: "Dashboard",
});

export default async function DashboardPage() {
  // Get current user (middleware already verified auth, so user exists)
  const user = await getUser();

  // Fetch account and transaction data from database
  // Wrapped in try-catch to handle database errors gracefully
  let accounts: Awaited<ReturnType<typeof getAccounts>> = [];
  let recentTransactions: Awaited<ReturnType<typeof getRecentTransactions>> = [];
  let summary: Awaited<ReturnType<typeof getTransactionSummary>> = {
    totalIncome: 0,
    totalExpenses: 0,
    netChange: 0,
    transactionCount: 0,
  };
  let budgetProgress: BudgetProgress[] = [];
  let expensesByCategory: CategoryBreakdown[] = [];
  let dataError: string | null = null;

  try {
    accounts = await getAccounts();
    recentTransactions = await getRecentTransactions(5);
    summary = await getTransactionSummary();
    budgetProgress = await calculateAllBudgetProgress();
    expensesByCategory = await getExpensesByCategory();
  } catch (error) {
    console.error("[dashboard] Error fetching data:", error);
    dataError = error instanceof Error ? error.message : "Failed to load data";
  }

  // Calculate total balance across all accounts
  const totalBalance = accounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0);

  return (
    <main className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Budget Notification Dialogs
          ADHD-friendly Alert Dialogs for budget warnings and over-budget states.
          Shows one dialog at a time, requires user acknowledgment.
          Session-level memory prevents repeated popups after "OK".
          @see docs/BUDGET_STRATEGY.md Section 4 */}
      <BudgetNotificationDialogs budgetProgress={budgetProgress} />

      {/* Page Header with User Info and Actions */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* EXTENSION POINT: Notification Bell/Badge
              This is where a notification indicator could be added later.
              Would show unread count badge and link to notification panel.
              Data source: /api/notifications (already exists as skeleton)
              @see docs/DASHBOARD_STRATEGY.md Section 6.1 */}

          {/* Manual Import Trigger */}
          <SyncTransactionsButton accountCount={accounts.length} />
          <SignOutButton variant="outline" size="sm" />
        </div>
      </div>

      {/* User email display */}
      <div className="text-sm text-muted-foreground">
        Logged in as {user?.email}
      </div>

      {/* Error State: Database Connection Issue */}
      {dataError && (
        <section className="border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950 rounded-lg p-4">
          <h2 className="font-semibold text-red-800 dark:text-red-200 mb-1">
            Unable to Load Data
          </h2>
          <p className="text-sm text-red-700 dark:text-red-300">
            {dataError}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">
            Please check your database connection and try refreshing the page.
          </p>
        </section>
      )}

      {/* Empty State: No Banks Linked */}
      {accounts.length === 0 && (
        <section className="border border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
          <h2 className="font-semibold mb-2">No Banks Linked</h2>
          <p className="text-muted-foreground text-sm mb-4">
            Link a bank account to start tracking your finances.
          </p>
          <SyncTransactionsButton accountCount={0} />
        </section>
      )}

      {/* Dashboard Content: Only show if accounts exist */}
      {accounts.length > 0 && (
        <>
          {/* Balance Card */}
          <section className="border rounded-lg p-6 bg-card">
            <h2 className="font-semibold mb-2 text-muted-foreground">
              Total Balance
            </h2>
            <div className="text-3xl font-bold">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Across {accounts.length} account{accounts.length !== 1 ? "s" : ""}
            </p>
          </section>

          {/* Income/Expense Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="border rounded-lg p-6 bg-card">
              <h2 className="font-semibold text-green-600 dark:text-green-400">
                Income
              </h2>
              <div className="text-2xl font-bold mt-2">
                {formatCurrency(summary.totalIncome)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total income recorded
              </p>
            </section>

            <section className="border rounded-lg p-6 bg-card">
              <h2 className="font-semibold text-red-600 dark:text-red-400">
                Expenses
              </h2>
              <div className="text-2xl font-bold mt-2">
                {formatCurrency(summary.totalExpenses)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Total expenses recorded
              </p>
            </section>
          </div>

          {/* Budget Progress - Traffic Light Feedback */}
          <BudgetProgressSection budgetProgress={budgetProgress} />

          {/* Spending by Category Chart (Tremor Donut Chart)
              ADHD-friendly: Visual overview of where money goes
              Adjacent to Budget Progress for related financial context.
              @see docs/DASHBOARD_STRATEGY.md Section 4.2 */}
          <section className="border rounded-lg p-6 bg-card">
            <h2 className="font-semibold mb-4">Spending by Category</h2>
            <p className="text-sm text-muted-foreground mb-4">
              This month&apos;s expenses by category
            </p>
            <SpendingByCategoryChart data={expensesByCategory} />
          </section>

          {/* Linked Accounts */}
          <section className="border rounded-lg p-6 bg-card">
            <h2 className="font-semibold mb-4">Linked Accounts</h2>
            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{account.account_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {account.bank_name} · {account.account_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(account.balance ?? 0)}</p>
                    {account.last_synced_at && (
                      <p className="text-xs text-muted-foreground">
                        Synced {formatRelativeTime(account.last_synced_at)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recent Transactions */}
          <section className="border rounded-lg p-6 bg-card">
            <h2 className="font-semibold mb-4">Recent Transactions</h2>
            {recentTransactions.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No transactions yet. Click &quot;Sync Transactions&quot; to import.
              </p>
            ) : (
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex justify-between items-center p-3 bg-muted/30 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{tx.description || "Transaction"}</p>
                      <p className="text-sm text-muted-foreground">
                        {tx.category} · {formatDate(tx.booking_date)}
                      </p>
                    </div>
                    <div
                      className={`font-medium ${
                        tx.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* EXTENSION POINT: Spending Trends Chart (Post-MVP)
              This is where an Income vs Expenses bar chart could be added later.
              Would show spending patterns over time (weekly/monthly).
              Data source: getTransactionsByPeriod() (not yet implemented)
              @see docs/DASHBOARD_STRATEGY.md Section 4.2 Chart 2 */}
        </>
      )}

      {/* Debug Info (development only) */}
      <div className="text-xs text-muted-foreground border-t pt-4">
        <p>
          <strong>Note:</strong> This dashboard displays data from the database
          only. Use &quot;Sync Transactions&quot; to import from linked banks.
        </p>
        {user && (
          <p className="mt-1">
            <strong>User ID:</strong> {user.id}
          </p>
        )}
        <p className="mt-1">
          <strong>Transactions:</strong> {summary.transactionCount}
        </p>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions (could be moved to utils/ if reused)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a number as currency (EUR)
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Format a date string for display
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format a timestamp as relative time (e.g., "2 hours ago")
 */
function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
}