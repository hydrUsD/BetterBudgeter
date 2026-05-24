/**
 * BetterBudget Settings Page
 *
 * WHAT:
 * User preferences, budget configuration, linked accounts, and sign out.
 *
 * SECTIONS:
 *   1. Account — user email + sign out button
 *   2. Monthly Budgets — BudgetSettings component (existing, functional)
 *   3. Linked Accounts — real data from getAccounts(), link to /link-bank
 *   4. Display Preferences — placeholder ("Coming soon")
 *   5. Notifications — placeholder ("Coming soon")
 *
 * AUTH:
 * Protected by middleware. Page also does a getUser() call for the email display.
 *
 * DATA FLOW:
 *   Promise.all([getUser(), getBudgets(), getAccounts()])
 *
 * TOKEN MIGRATION (Phase 9):
 * All sections migrated from raw Tailwind (text-muted-foreground, border, etc.)
 * to --bb-* tokens (text-bb-text-secondary, border-bb-border, etc.).
 *
 * @see docs/BUDGET_STRATEGY.md for budget feature design
 */

import Link from "next/link";

import { generateMetadata } from "@/lib/head";
import { getUser } from "@/lib/auth";
import { getBudgets } from "@/lib/db/budgets";
import { getAccounts } from "@/lib/db/accounts";
import { formatCurrency } from "@/utils/currency";

import { PageHeader } from "@/components/layout/PageHeader";
import { BudgetSettings } from "@/components/settings/BudgetSettings";
import SignOutButton from "@/components/auth/SignOutButton";

import type { DbAccount, DbBudget } from "@/lib/db/types";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = generateMetadata({ title: "Settings" });

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  // Fetch user, budgets, and accounts in parallel
  let user: Awaited<ReturnType<typeof getUser>> = null;
  let dbBudgets: DbBudget[] = [];
  let accounts: DbAccount[] = [];

  try {
    [user, dbBudgets, accounts] = await Promise.all([
      getUser(),
      getBudgets(),
      getAccounts(),
    ]);
  } catch (error) {
    console.error("[settings] Error fetching data:", error);
  }

  // Build currentBudgets map for BudgetSettings component
  const currentBudgets: Record<string, number> = {};
  for (const budget of dbBudgets) {
    currentBudgets[budget.category] = budget.monthly_limit;
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Customize your BetterBudget experience" />

      <div className="flex flex-col gap-bb-8">

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 1: Account — email + sign out                                  */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 className="text-bb-xl font-bold text-bb-text mb-bb-4">Account</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-bb-base text-bb-text">
                {user?.email ?? "Not signed in"}
              </p>
              <p className="text-bb-sm text-bb-text-secondary">Email login</p>
            </div>
            <SignOutButton variant="outline" size="sm" />
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 2: Monthly Budgets — existing BudgetSettings component         */}
        {/* BudgetSettings is a "use client" component for form interactivity.     */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 className="text-bb-xl font-bold text-bb-text mb-bb-4">Monthly Budgets</h2>
          <BudgetSettings currentBudgets={currentBudgets} />
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 3: Linked Accounts — real data from getAccounts()              */}
        {/* Shows bank name, account name, account type, and balance for each.    */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 className="text-bb-xl font-bold text-bb-text mb-bb-4">Linked Accounts</h2>

          {accounts.length === 0 ? (
            <div>
              <p className="text-bb-sm text-bb-text-secondary mb-bb-4">
                No bank accounts linked yet.
              </p>
              <Link
                href="/link-bank"
                className="text-bb-sm text-bb-info underline-offset-4 hover:underline"
              >
                Link a bank account →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-bb-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between py-bb-3 border-b border-bb-border last:border-b-0"
                >
                  <div>
                    <p className="text-bb-base text-bb-text">{acc.account_name}</p>
                    <p className="text-bb-sm text-bb-text-secondary">
                      {acc.bank_name} · {acc.account_type}
                    </p>
                  </div>
                  <p className="text-bb-base font-bold text-bb-text">
                    {formatCurrency(acc.balance ?? 0)}
                  </p>
                </div>
              ))}

              <Link
                href="/link-bank"
                className="text-bb-sm text-bb-info underline-offset-4 hover:underline mt-bb-2"
              >
                Link another account →
              </Link>
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 4: Display Preferences — placeholder                           */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 className="text-bb-xl font-bold text-bb-text mb-bb-4">Display Preferences</h2>
          <div className="flex flex-col gap-bb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-bb-base text-bb-text">View Mode</p>
                <p className="text-bb-sm text-bb-text-secondary">
                  Choose compact or comfortable layout
                </p>
              </div>
              <span className="text-bb-sm text-bb-text-secondary">Coming soon</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-bb-base text-bb-text">Currency</p>
                <p className="text-bb-sm text-bb-text-secondary">
                  Display currency for amounts
                </p>
              </div>
              <span className="text-bb-sm text-bb-text">EUR</span>
            </div>
          </div>
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 5: Notifications — placeholder                                 */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 className="text-bb-xl font-bold text-bb-text mb-bb-4">Notifications</h2>
          <div className="flex flex-col gap-bb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-bb-base text-bb-text">Budget Alerts</p>
                <p className="text-bb-sm text-bb-text-secondary">
                  Notify at 80% and 100% of budget
                </p>
              </div>
              <span className="text-bb-sm text-bb-positive">On</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-bb-base text-bb-text">Weekly Summary</p>
                <p className="text-bb-sm text-bb-text-secondary">
                  Receive weekly spending summary
                </p>
              </div>
              <span className="text-bb-sm text-bb-text-secondary">Coming soon</span>
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
