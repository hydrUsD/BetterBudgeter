/**
 * BB App Layout
 *
 * Applied to all pages in the (bb) route group: /, /budgets, /transactions, /settings.
 * Wraps content in PageShell (max-width + bottom clearance) and adds the persistent TabBar.
 *
 * Implements D-06 (CONTEXT.md §BB Layout Chrome):
 *   "No legacy providers (AppProvider / BudgetProvider) — BB pages don't use them."
 *
 * IMPORTANT: This is a SERVER component. Do not add "use client".
 * The interactive TabBar is itself a client component — that's where the boundary lives.
 * Keeping the layout server-side preserves RSC benefits for the BB pages (data fetching, etc.).
 *
 * COMPOSITION:
 *   <PageShell>      ← provides the single <main> landmark + max-width 768px + bottom clearance
 *     {children}     ← the individual BB page (Home / Budgets / Transactions / Settings)
 *     <TabBar />     ← client component, sticky bottom navigation (D-09 + D-10)
 *   </PageShell>
 *
 * EXTENSION POINT: If BB pages need their own context providers in the future
 * (e.g. notification prefs, user settings), add them inside this layout above {children}.
 * Do NOT add legacy providers — those live in (legacy)/layout.tsx.
 */

import { PageShell } from "@/components/layout/PageShell";
import { TabBar } from "@/components/layout/TabBar";

// ─────────────────────────────────────────────────────────────────────────────
// Layout Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BBLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      {children}
      <TabBar />
    </PageShell>
  );
}
