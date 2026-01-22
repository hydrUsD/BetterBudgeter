/**
 * Legacy OopsBudgeter Dashboard
 *
 * This is the original OopsBudgeter dashboard, preserved for demo purposes.
 * The new BetterBudget dashboard is now available at `/`.
 *
 * This route is PUBLIC (no auth required) to support demo presentations.
 *
 * @see /legacy-index for navigation to all legacy routes
 */

import BalanceCard from "@/components/cards/BalanceCard";
import Expense from "@/components/categories/Expense";
import Income from "@/components/categories/Income";
import DateRangePicker from "@/components/common/DatePicker";
import NewTransaction from "@/components/transactions/NewTransaction";
import TransactionsList from "@/components/transactions/TransactionsList";
import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({
  title: "Dashboard (Legacy)",
});

export default function Home() {
  return (
    <main className="flex flex-col gap-2 min-w-full items-center">
      <div className="flex flex-col gap-2 w-full relative">
        <BalanceCard />
        <div className="flex flex-col md:flex-row gap-2">
          <Income />
          <Expense />
        </div>
      </div>
      <NewTransaction />
      <DateRangePicker />
      <TransactionsList />
    </main>
  );
}