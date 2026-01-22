/**
 * BetterBudget Settings Page
 *
 * User preferences and app configuration.
 * Settings are persisted per-user in the database.
 *
 * SECTIONS:
 * - Budget Settings: Monthly spending limits per category (MVP)
 * - Display Preferences: View mode, currency (placeholder)
 * - Notifications: Budget alerts, weekly summary (placeholder)
 * - Linked Accounts: Bank connections (placeholder)
 *
 * @see docs/BUDGET_STRATEGY.md for budget feature design
 */

import { redirect } from "next/navigation";
import { generateMetadata } from "@/lib/head";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import { getBudgets } from "@/lib/db/budgets";
import { BudgetSettings } from "@/components/settings/BudgetSettings";

export const metadata = generateMetadata({
  title: "Settings",
});

export default async function SettingsPage() {
  // ─────────────────────────────────────────────────────────────────────────────
  // Auth Check
  // ─────────────────────────────────────────────────────────────────────────────

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/settings");
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Fetch Current Budgets
  // ─────────────────────────────────────────────────────────────────────────────

  const currentBudgets: Record<string, number> = {};

  try {
    const dbBudgets = await getBudgets();
    for (const budget of dbBudgets) {
      currentBudgets[budget.category] = budget.monthly_limit;
    }
  } catch (error) {
    console.error("[settings] Error fetching budgets:", error);
    // Continue with empty budgets - user can still set new ones
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <main className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your BetterBudget experience
        </p>
      </div>

      {/* Budget Settings - MVP Feature */}
      <section className="border rounded-lg p-6">
        <h2 className="font-semibold mb-4">Monthly Budgets</h2>
        <BudgetSettings currentBudgets={currentBudgets} />
      </section>

      {/* Display Preferences (placeholder) */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-4">Display Preferences</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">View Mode</p>
              <p className="text-sm text-muted-foreground">
                Choose compact or comfortable layout
              </p>
            </div>
            <div className="text-muted-foreground text-sm">[Coming soon]</div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Currency</p>
              <p className="text-sm text-muted-foreground">
                Display currency for amounts
              </p>
            </div>
            <div className="text-muted-foreground text-sm">EUR</div>
          </div>
        </div>
      </section>

      {/* Notification Preferences (placeholder) */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">
                Notify at 80% and 100% of budget
              </p>
            </div>
            <div className="text-muted-foreground text-sm">On</div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Weekly Summary</p>
              <p className="text-sm text-muted-foreground">
                Receive weekly spending summary
              </p>
            </div>
            <div className="text-muted-foreground text-sm">[Coming soon]</div>
          </div>
        </div>
      </section>

      {/* Linked Accounts (placeholder) */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-4">Linked Accounts</h2>
        <p className="text-muted-foreground text-sm">
          Manage your connected bank accounts.
        </p>
        <div className="mt-4">
          <a
            href="/link-bank"
            className="text-sm underline hover:text-foreground"
          >
            Link a bank account →
          </a>
        </div>
      </section>

      {/* Data Export (placeholder) */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-4">Data Export</h2>
        <p className="text-muted-foreground text-sm">
          Export your transaction history
        </p>
        <div className="mt-4 flex gap-2">
          <button
            disabled
            className="px-3 py-1 text-sm border rounded opacity-50 cursor-not-allowed"
          >
            Export CSV
          </button>
          <button
            disabled
            className="px-3 py-1 text-sm border rounded opacity-50 cursor-not-allowed"
          >
            Export JSON
          </button>
        </div>
      </section>
    </main>
  );
}