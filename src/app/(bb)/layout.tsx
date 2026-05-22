/**
 * BB App Layout
 *
 * Applied to all pages in the (bb) route group: /, /budgets, /transactions, /settings.
 * Wraps content in PageShell (max-width + bottom clearance) and adds the persistent TabBar.
 *
 * Implements D-06 (CONTEXT.md §BB Layout Chrome):
 *   "No legacy providers (AppProvider / BudgetProvider) — BB pages don't use them."
 *
 * IMPORTANT: This is an async SERVER component. Do not add "use client".
 * The interactive TabBar and BudgetNotificationDialogs are client component islands.
 * Keeping the layout server-side preserves RSC benefits for the BB pages (data fetching, etc.).
 *
 * COMPOSITION:
 *   <PageShell>                          ← provides the single <main> landmark + max-width 768px
 *     {children}                         ← the individual BB page (Home / Budgets / Transactions / Settings)
 *     <BudgetNotificationDialogs />      ← session-level budget threshold alerts (Phase 9)
 *     <TabBar />                         ← client component, sticky bottom navigation (D-09 + D-10)
 *   </PageShell>
 *
 * DATA FETCH:
 *   calculateAllBudgetProgress() runs once per navigation to supply BudgetNotificationDialogs.
 *   This duplicates the same call on / and /budgets pages — accepted for simplicity.
 *   Next.js does NOT deduplicate Supabase SDK calls, but it's a single lightweight query.
 *   If the fetch fails, notifications are silently skipped (no user-facing error).
 *
 * Do NOT add legacy providers — those live in (legacy)/layout.tsx.
 */

import { PageShell } from "@/components/layout/PageShell";
import { TabBar } from "@/components/layout/TabBar";
import { BudgetNotificationDialogs } from "@/components/dashboard/BudgetNotificationDialogs";
import { calculateAllBudgetProgress } from "@/lib/budgets";
import type { BudgetProgress } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Layout Component
// ─────────────────────────────────────────────────────────────────────────────

export default async function BBLayout({ children }: { children: React.ReactNode }) {
  // Fetch budget progress for notification dialogs.
  // Wrapped in try/catch: if the DB call fails, notifications are silently skipped.
  // The individual page components handle their own data + error states independently.
  let budgetProgress: BudgetProgress[] = [];
  try {
    budgetProgress = await calculateAllBudgetProgress();
  } catch (error) {
    console.error("[bb-layout] Failed to fetch budget progress for notifications:", error);
  }

  return (
    <PageShell>
      {children}
      <BudgetNotificationDialogs budgetProgress={budgetProgress} />
      <TabBar />
    </PageShell>
  );
}
