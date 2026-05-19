/**
 * Transactions Page — Stub for Phase 7 (D-07 + D-08)
 *
 * This page exists in Phase 7 only so the /transactions tab has somewhere to navigate to.
 * Content is filled in by Phase 9 (PAGE-05). Stub copy is user-facing and neutral
 * per CONTEXT.md D-08 — exact strings locked there, do not improvise.
 *
 * EXTENSION POINT: Phase 9 will replace the placeholder paragraph with Income + Expenses
 * KPI cards, full transaction history grouped by date, and a Sync Transactions button.
 *
 * SECURITY NOTE: When Phase 9 adds real user data here, the /transactions URL MUST be added
 * to src/middleware.ts matchers (currently public — only static placeholder text).
 * See CONTEXT.md §Middleware & Routing Safety (D-13) and RESEARCH §Security Domain V4.
 */

import { PageHeader } from "@/components/layout/PageHeader";
import { generateMetadata } from "@/lib/head";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = generateMetadata({ title: "Transactions" });

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TransactionsPage renders a minimal stub so /transactions is a reachable, user-friendly route.
 * No outer <main> — PageShell (in (bb)/layout.tsx per D-06) provides the single <main> landmark.
 * No icons, no dashed borders — those visual treatments belong to the formal Empty State
 * component introduced in Phase 10 (per UI-SPEC §Stub Pages + D-08 §Anti-Patterns #12).
 */
export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" subtitle="Your spending history" />
      <p className="text-bb-base text-bb-text-secondary">
        Your transactions will appear here.
      </p>
    </>
  );
}
