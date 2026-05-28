/**
 * BetterBudget Settings Page
 *
 * WHAT:
 * User preferences, budget configuration, linked accounts, and sign out.
 * This is the primary "spoke" page for account management and budget configuration.
 *
 * SECTIONS (3 total — max 4 per DESIGN.md layout rules):
 *   1. Linked Accounts — real data from getAccounts(), showing bank name,
 *      account type, and masked IBAN snippet. Link to /link-bank for adding more.
 *   2. Monthly Budgets — BudgetSettings component (existing, functional)
 *   3. Account — user email display + sign out button
 *
 * WHY THIS ORDER:
 * Linked accounts come first because they are the data source — if no bank is
 * linked, budgets and transactions are empty. Budgets are second because they
 * are the most actively configured setting. Account/sign-out is last because
 * it is the least frequently used action.
 *
 * AUTH:
 * Protected by middleware (src/middleware.ts). Page also calls getUser() to
 * display the user's email address in the Account section.
 *
 * DATA FLOW:
 *   Promise.all([getUser(), getBudgets(), getAccounts()])
 *
 * DESIGN TOKENS:
 * Uses --bb-* tokens exclusively (bg-bb-surface, text-bb-text, border-bb-border,
 * rounded-bb-lg, p-bb-5, gap-bb-8, etc.). No raw Tailwind color classes.
 *
 * REMOVED (Phase 10+ concerns — not part of MVP):
 * - Display Preferences placeholder (view mode, currency selector)
 * - Notifications placeholder (budget alerts toggle, weekly summary)
 *
 * @see docs/BUDGET_STRATEGY.md for budget feature design
 * @see docs/DESIGN.md for token definitions and ADHD-focused design rationale
 */

import Link from "next/link";

import { generateMetadata } from "@/lib/head";
import { getUser } from "@/lib/auth";
import { getBudgets } from "@/lib/db/budgets";
import { getAccounts } from "@/lib/db/accounts";
import { maskIban } from "@/utils/format-iban";

import { PageHeader } from "@/components/layout/PageHeader";
import { BudgetSettings } from "@/components/settings/BudgetSettings";
import SignOutButton from "@/components/auth/SignOutButton";

import type { DbBudget } from "@/lib/db/types";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = generateMetadata({ title: "Settings" });

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

export default async function SettingsPage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // Data Fetching
  // Fetch user info, budgets, and linked accounts in parallel for performance.
  // All three are independent — none depends on the result of another.
  // ─────────────────────────────────────────────────────────────────────────────
  let user: Awaited<ReturnType<typeof getUser>> = null;
  let dbBudgets: DbBudget[] = [];
  let accounts: Awaited<ReturnType<typeof getAccounts>> = [];

  try {
    [user, dbBudgets, accounts] = await Promise.all([
      getUser(),
      getBudgets(),
      getAccounts(),
    ]);
  } catch (error) {
    console.error("[settings] Error fetching data:", error);
  }

  // Build currentBudgets map for BudgetSettings component.
  // Maps category name → monthly_limit number (e.g. { "Food": 200 }).
  const currentBudgets: Record<string, number> = {};
  for (const budget of dbBudgets) {
    currentBudgets[budget.category] = budget.monthly_limit;
  }

  return (
    <>
      <PageHeader title="Settings" subtitle="Customize your BetterBudget experience" />

      <div className="flex flex-col gap-bb-8">

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 1: Linked Accounts                                             */}
        {/* Shows bank accounts fetched from getAccounts() with bank name,         */}
        {/* account type, and a masked IBAN snippet for identification.            */}
        {/* First section because linked accounts are the data source for          */}
        {/* everything else — if nothing is linked, budgets are empty.             */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="settings-linked" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 id="settings-linked" className="text-bb-xl font-bold text-bb-text mb-bb-4">Linked Accounts</h2>

          {accounts.length === 0 ? (
            /* Empty state: guide the user toward linking their first account.
               Uses informational framing per DESIGN.md copy rules — "will appear"
               instead of "No accounts found". */
            <div>
              <p className="text-bb-sm text-bb-text-secondary mb-bb-4">
                Your bank accounts will appear here after linking.
              </p>
              <Link
                href="/link-bank"
                className="text-bb-sm text-bb-info underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-info focus-visible:ring-offset-2 rounded-sm"
              >
                Link a bank account →
              </Link>
            </div>
          ) : (
            /* Account list: each row shows bank name, account type, and IBAN snippet.
               IBAN is masked (first 4 + last 4 chars) for privacy — see utils/format-iban.ts. */
            <div className="flex flex-col gap-bb-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="flex items-center justify-between py-bb-3 border-b border-bb-border last:border-b-0"
                >
                  <div>
                    {/* Primary line: bank name — most recognizable identifier */}
                    <p className="text-bb-base text-bb-text">{acc.bank_name}</p>
                    {/* Secondary line: account type + masked IBAN for identification */}
                    <p className="text-bb-sm text-bb-text-secondary">
                      {acc.account_type} · {maskIban(acc.iban)}
                    </p>
                  </div>
                </div>
              ))}

              <Link
                href="/link-bank"
                className="text-bb-sm text-bb-info underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-info focus-visible:ring-offset-2 rounded-sm mt-bb-2"
              >
                Link another account →
              </Link>
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 2: Monthly Budgets                                             */}
        {/* BudgetSettings is a "use client" component for form interactivity.     */}
        {/* It receives the current budgets map and handles save/delete via API.   */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="settings-budgets" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 id="settings-budgets" className="text-bb-xl font-bold text-bb-text mb-bb-4">Monthly Budgets</h2>
          <BudgetSettings currentBudgets={currentBudgets} />
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 3: Account — email display + sign out                          */}
        {/* Last section because it's the least frequently used action.            */}
        {/* Shows the user's email from Supabase Auth and a sign-out button.       */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="settings-account" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 id="settings-account" className="text-bb-xl font-bold text-bb-text mb-bb-4">Account</h2>
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

      </div>
    </>
  );
}
