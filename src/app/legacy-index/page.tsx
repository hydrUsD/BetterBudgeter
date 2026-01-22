/**
 * Legacy Routes Index
 *
 * This page provides navigation to the original OopsBudgeter functionality.
 * The legacy app remains fully functional and accessible.
 *
 * Migration strategy:
 * - New BetterBudget features are built alongside legacy
 * - Legacy routes stay at their original paths
 * - This page serves as documentation and fallback navigation
 *
 * Note: This page does NOT modify any legacy code.
 */

import { generateMetadata } from "@/lib/head";
import Link from "next/link";

export const metadata = generateMetadata({
  title: "Legacy App Index",
});

/**
 * Legacy routes configuration
 * Maps legacy pages to their descriptions
 */
const LEGACY_ROUTES = [
  {
    path: "/legacy",
    name: "Dashboard (Legacy)",
    description:
      "Original OopsBudgeter dashboard with balance, transactions, and quick entry",
  },
  {
    path: "/analytics",
    name: "Analytics",
    description: "Spending trends, category breakdown, and FakeAI insights",
  },
  {
    path: "/achievements",
    name: "Achievements",
    description: "Gamification badges and no-spend streaks",
  },
] as const;

export default function LegacyIndexPage() {
  return (
    <main className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Legacy App (OopsBudgeter)</h1>
        <p className="text-muted-foreground mt-2">
          Access the original OopsBudgeter functionality
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-muted/50 border rounded-lg p-4 text-sm">
        <p className="font-medium">About Legacy Mode</p>
        <p className="text-muted-foreground mt-1">
          The original OopsBudgeter app remains fully functional. New
          BetterBudget features are being built alongside the legacy app and
          will gradually replace functionality as they mature.
        </p>
      </div>

      {/* Legacy Routes List */}
      <section>
        <h2 className="font-semibold mb-4">Available Pages</h2>
        <div className="space-y-3">
          {LEGACY_ROUTES.map((route) => (
            <Link
              key={route.path}
              href={route.path}
              className="block p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="font-medium">{route.name}</div>
              <div className="text-sm text-muted-foreground mt-1">
                {route.description}
              </div>
              <div className="text-xs text-muted-foreground/70 mt-2">
                Path: {route.path}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Migration Status */}
      <section className="border-t pt-6">
        <h2 className="font-semibold mb-4">Migration Status</h2>
        <div className="text-sm text-muted-foreground space-y-2">
          <div className="flex justify-between">
            <span>Authentication</span>
            <span className="text-green-600">Complete (Supabase Auth)</span>
          </div>
          <div className="flex justify-between">
            <span>Dashboard</span>
            <span className="text-green-600">Complete (DB-backed)</span>
          </div>
          <div className="flex justify-between">
            <span>Bank Linking</span>
            <span className="text-green-600">Complete (Mock PSD2)</span>
          </div>
          <div className="flex justify-between">
            <span>Import Pipeline</span>
            <span className="text-green-600">Complete (Idempotent)</span>
          </div>
        </div>
      </section>

      {/* Back to New App */}
      <div className="text-center pt-4">
        <Link
          href="/"
          className="text-sm underline hover:text-foreground"
        >
          ← Go to new BetterBudget dashboard
        </Link>
      </div>
    </main>
  );
}