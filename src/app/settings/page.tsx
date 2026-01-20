/**
 * BetterBudget Settings Page
 *
 * User preferences and app configuration.
 * Settings are persisted per-user in the database.
 *
 * Current status: SKELETON — no settings logic implemented yet.
 *
 * TODO (Task 5+):
 * - UI variant preferences (compact/comfortable view)
 * - Notification preferences
 * - Currency display settings
 * - Data export options
 * - Account management (linked banks)
 */

import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({
  title: "Settings",
});

export default function SettingsPage() {
  return (
    <main className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Customize your BetterBudget experience
        </p>
      </div>

      {/* Display Preferences */}
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
            <div className="text-muted-foreground text-sm">[Toggle]</div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Currency</p>
              <p className="text-sm text-muted-foreground">
                Display currency for amounts
              </p>
            </div>
            <div className="text-muted-foreground text-sm">[Selector]</div>
          </div>
        </div>
      </section>

      {/* Notification Preferences */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-4">Notifications</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Budget Alerts</p>
              <p className="text-sm text-muted-foreground">
                Notify when approaching budget limits
              </p>
            </div>
            <div className="text-muted-foreground text-sm">[Toggle]</div>
          </div>

          <div className="flex justify-between items-center">
            <div>
              <p className="font-medium">Weekly Summary</p>
              <p className="text-sm text-muted-foreground">
                Receive weekly spending summary
              </p>
            </div>
            <div className="text-muted-foreground text-sm">[Toggle]</div>
          </div>
        </div>
      </section>

      {/* Linked Accounts */}
      <section className="border border-dashed border-muted-foreground/50 rounded-lg p-6">
        <h2 className="font-semibold mb-4">Linked Accounts</h2>
        <p className="text-muted-foreground text-sm">
          No bank accounts linked yet.
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

      {/* Data Export */}
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
