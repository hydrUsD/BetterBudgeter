/**
 * BetterBudget Dashboard Page
 *
 * This is the main dashboard showing financial overview.
 * All data is fetched from the database (not mock APIs).
 *
 * Current status: SKELETON — no data fetching implemented yet.
 *
 * TODO (Task 4+):
 * - Fetch account summary from database
 * - Display balance card
 * - Display income/expense breakdown
 * - Display recent transactions
 * - Add spending trends chart
 * - Add category breakdown chart
 */

import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({
  title: "Dashboard",
});

export default function DashboardPage() {
  return (
    <main className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your financial overview at a glance
        </p>
      </div>

      {/* Balance Card Placeholder */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-2">Balance Overview</h2>
        <p className="text-muted-foreground text-sm">
          Balance card will be displayed here
        </p>
        <div className="mt-4 text-3xl font-bold text-muted-foreground/30">
          $0.00
        </div>
      </section>

      {/* Income/Expense Cards Placeholder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
          <h2 className="font-semibold text-green-600 dark:text-green-400">
            Income
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Income summary will appear here
          </p>
        </section>

        <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
          <h2 className="font-semibold text-red-600 dark:text-red-400">
            Expenses
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Expense summary will appear here
          </p>
        </section>
      </div>

      {/* Charts Placeholder */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-2">Spending Trends</h2>
        <p className="text-muted-foreground text-sm">
          Charts will be rendered here using Tremor/Recharts
        </p>
        <div className="h-48 flex items-center justify-center text-muted-foreground/30">
          [Chart Placeholder]
        </div>
      </section>

      {/* Recent Transactions Placeholder */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-2">Recent Transactions</h2>
        <p className="text-muted-foreground text-sm">
          Transaction list will be displayed here
        </p>
        <ul className="mt-4 space-y-2">
          {[1, 2, 3].map((i) => (
            <li
              key={i}
              className="h-12 bg-muted/30 rounded animate-pulse"
            />
          ))}
        </ul>
      </section>

      {/* Implementation Notes */}
      <div className="text-xs text-muted-foreground border-t pt-4">
        <p>
          <strong>Note:</strong> This dashboard will display data from the
          database only. No mock API data will be shown here.
        </p>
      </div>
    </main>
  );
}
