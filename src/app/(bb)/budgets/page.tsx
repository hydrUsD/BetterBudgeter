/**
 * Budgets Page — Stub for Phase 7 (D-07 + D-08)
 *
 * This page exists in Phase 7 only so the /budgets tab has somewhere to navigate to.
 * Content is filled in by Phase 9 (PAGE-04). Stub copy is user-facing and neutral
 * per CONTEXT.md D-08 — exact strings locked there, do not improvise.
 *
 * EXTENSION POINT: Phase 9 will replace the placeholder paragraph with monthly overview,
 * budget progress cards, spending donut chart (migrated from Home), and "Edit budgets →" link.
 *
 * SECURITY NOTE: When Phase 9 adds real user data here, the /budgets URL MUST be added
 * to src/middleware.ts matchers (currently public — only static placeholder text).
 * See CONTEXT.md §Middleware & Routing Safety (D-13) and RESEARCH §Security Domain V4.
 */

import { PageHeader } from "@/components/layout/PageHeader";
import { generateMetadata } from "@/lib/head";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = generateMetadata({ title: "Budgets" });

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * BudgetsPage renders a minimal stub so /budgets is a reachable, user-friendly route.
 * No outer <main> — PageShell (in (bb)/layout.tsx per D-06) provides the single <main> landmark.
 * No icons, no dashed borders — those visual treatments belong to the formal Empty State
 * component introduced in Phase 10 (per UI-SPEC §Stub Pages + D-08 §Anti-Patterns #12).
 */
export default function BudgetsPage() {
  return (
    <>
      <PageHeader title="Budgets" subtitle="Track your monthly spending limits" />
      <p className="text-bb-base text-bb-text-secondary">
        Your budgets will appear here.
      </p>
    </>
  );
}
