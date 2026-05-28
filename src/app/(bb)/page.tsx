/**
 * BetterBudget Home Hub Page
 *
 * WHAT:
 * The calm Home hub — the first thing a signed-in user sees.
 * Composes all Phase 8 modules into a server-rendered, data-backed view.
 *
 * 4 SECTIONS (PAGE-01, in this exact order — do NOT reorder):
 *   1. Greeting + Safe-to-Spend hero card
 *   2. Compact budget status indicators (traffic-light dot + category + remaining)
 *   3. 3–5 most recent transactions (TransactionItem view-model pattern)
 *   4. "Sync Transactions" quick-action button (full-width, primary variant)
 *
 * AUTH:
 * Protected by middleware (src/middleware.ts) — unauthenticated users are
 * redirected to /login before this page component even runs. `user` may still
 * be null if middleware has an edge-case miss; all rendering is safe for null user.
 *
 * DATA FLOW:
 *   1. getUser()                    — separate, before Promise.all (needed for greeting even on DB error)
 *   2. Promise.all([                — parallel: all three DB calls fire simultaneously
 *        getAccounts(),
 *        getRecentTransactions(5),
 *        calculateAllBudgetProgress()
 *      ])
 *   3. computeSafeToSpend(accounts, budgetProgress)  — pure calculation, no extra DB call
 *   4. Render the hub (or edge-state variant)
 *
 * ADHD DESIGN:
 *   P1 "Calm over comprehensive" — 4 sections max; no charts, no raw data dumps.
 *   P2 "Compassion over correction" — errors show a neutral inline note, never a red banner.
 *   See docs/DESIGN_SYSTEM.md §1 for the full principle set.
 *
 * EDGE STATES (CONTEXT D-CUT-02):
 *   0 accounts linked  → REPLACES hub entirely with a full-screen CTA card linking to /link-bank
 *   0 budgets          → Hub renders; Section 2 shows "Set up your first budget" inline link
 *   0 transactions     → Hub renders; Section 3 shows inline note + SyncTransactionsButton
 *   DB error           → Hub renders; hero shows €— and an inline note at page bottom (NO red banner)
 *
 * ROUTING:
 *   Lives at `/`   — the new primary landing page for authenticated users.
 *   `/legacy`      — legacy OopsBudgeter dashboard (preserved, untouched by Phase 8).
 *   `/dashboard`   — HTTP 308 redirect → `/` (set up in Phase 7).
 *
 * REMOVED FROM HOME (vs legacy dashboard) — moved to spoke pages in Phase 9+:
 *   SpendingByCategoryChart     → /budgets (Phase 9)
 *   BudgetProgressSection       → /budgets (Phase 9)
 *   LinkedAccounts inline list  → /settings (Phase 9)
 *   IncomeExpense KPI cards     → /transactions (Phase 9)
 *   SignOutButton               → /settings (Phase 9)
 *   Debug "User ID" / "Transactions: N" paragraphs → removed permanently
 *
 * // TODO (Phase 9): Re-host BudgetNotificationDialogs on /settings (where budget
 * //   editing will live) or /budgets. It does not belong on the 4-section hub (PAGE-01).
 *
 * @see docs/DESIGN_SYSTEM.md §7.2 for the 4-section spec
 * @see docs/ADHD_UX_RESEARCH.md for Safe-to-Spend rationale
 * @see .planning/phases/08-home-hub/08-UI-SPEC.md for visual contracts
 */

import Link from "next/link";

import { generateMetadata } from "@/lib/head";
import { getUser } from "@/lib/auth";
import { getAccounts } from "@/lib/db/accounts";
import { getRecentTransactions } from "@/lib/db/transactions";
import { calculateAllBudgetProgress } from "@/lib/budgets";
import { computeSafeToSpend } from "@/lib/safe-to-spend";

import { nameFromEmail, greetingForTime } from "@/utils/greeting";
import { formatCurrency } from "@/utils/currency";
import { toTransactionItemProps } from "@/lib/transactions/mappers";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import {
  SyncTransactionsButton,
  TransactionItem,
} from "@/components/dashboard";

import type { DbAccount, DbTransaction } from "@/lib/db/types";
import type { BudgetProgress, BudgetStatus } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export const metadata = generateMetadata({ title: "Home" });

// ─────────────────────────────────────────────────────────────────────────────
// Private Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the greeting string shown at the top of the hub.
 *
 * Examples:
 *   "Good morning, Paul."   — when name is available, morning band
 *   "Good morning."         — when name is null (numeric email prefix, etc.)
 *
 * The period-instead-of-comma rule for the no-name variant is from CONTEXT D-GR-02:
 * "Calm, not awkward" — "Good morning." reads as a warm standalone greeting.
 *
 * @param name - Result of nameFromEmail(), which may be null for unparseable emails.
 * @param now  - The current Date in UTC; greetingForTime() converts it to Europe/Berlin.
 */
function buildGreeting(name: string | null, now: Date): string {
  const band = greetingForTime(now);

  // Map time band → English greeting prefix (D-GR-02; English-only per deferred i18n decision)
  const greetingByBand = {
    morning: "Good morning",
    afternoon: "Good afternoon",
    evening: "Good evening",
  } as const;

  // Name is appended only when parseable; period closes both variants identically.
  return name ? `${greetingByBand[band]}, ${name}.` : `${greetingByBand[band]}.`;
}

// toTransactionItemProps is imported from @/lib/transactions/mappers
// (shared module — eliminates duplication with transactions/page.tsx)

/**
 * Map a BudgetStatus enum value to the corresponding Tailwind color class.
 *
 * Traffic-light mapping (UI-SPEC § Section 2):
 *   on_track   → green dot  → bg-bb-positive
 *   warning    → amber dot  → bg-bb-caution
 *   over_budget → coral dot → bg-bb-negative
 *
 * Using semantic --bb-* tokens, NOT hardcoded colors (CLAUDE.md UI library rules).
 */
function dotColorForStatus(status: BudgetStatus): string {
  if (status === "on_track") return "bg-bb-positive";
  if (status === "warning") return "bg-bb-caution";
  return "bg-bb-negative"; // over_budget
}

// ─────────────────────────────────────────────────────────────────────────────
// Private Component: BudgetStatusRow
// Per CONTEXT D-CMP-03: defined here (inline in the page file), NOT in a
// separate component file. Used exactly once. Mirrors the inline-helper pattern.
// Phase 10 may extract to a named component if /budgets needs the same row shape.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Single-line budget status row: traffic-light dot + category name + remaining amount.
 *
 * Visual contract (08-UI-SPEC.md § Section 2):
 *   ● Food                              €80 remaining
 *
 * NOT clickable in Phase 8 — Phase 9 owns the /budgets spoke where clicking would go.
 * Rows are separated by vertical padding only (no horizontal lines, no tints).
 *
 * @param progress - BudgetProgress DTO from calculateAllBudgetProgress()
 */
function BudgetStatusRow({ progress }: { progress: BudgetProgress }) {
  return (
    // Flex row: dot (fixed 8px) + category name + spacer + remaining amount
    <div className="flex items-center gap-bb-2 py-bb-2">
      {/* Traffic-light dot: 8px × 8px (w-2 h-2 in Tailwind = 0.5rem = 8px)
          Color class is determined by BudgetStatus. aria-hidden: decorative only.
          The text content already conveys the status semantically. */}
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColorForStatus(progress.status)}`}
        aria-hidden="true"
      />

      {/* Category name: left-aligned, text-bb-sm (14px), default weight 400 */}
      <span className="text-bb-sm text-bb-text">{progress.budget.category}</span>

      {/* Flex spacer pushes the remaining amount to the right edge */}
      <span className="flex-1" />

      {/* Remaining amount: right-aligned, text-bb-sm (14px), secondary text color.
          remainingAmount is already Math.max(0, ...) from calculateAllBudgetProgress()
          — see src/lib/budgets/index.ts:174. The display is "€0 remaining" when over-budget,
          never a negative number (CONTEXT D-S2S-02 + UI-SPEC copywriting contract). */}
      <span className="text-bb-sm text-bb-text-secondary">
        {formatCurrency(progress.remainingAmount)} remaining
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Home Hub Page — the primary landing view for authenticated users.
 *
 * Server component: all data fetching and computation happen server-side.
 * First paint = final paint for data (no loading skeletons needed — RESEARCH §Loading Policy).
 * The only interactive element is SyncTransactionsButton (its own "use client" island).
 */
export default async function HomePage() {
  // ─────────── Step 1: Fetch user (separate from Promise.all) ─────────────────
  //
  // getUser() is called before the DB try/catch because we need the greeting even
  // when the DB fails. The hero can render "Good morning, Paul." with €— for the
  // Safe-to-Spend value in the error state — user identity is not affected by DB errors.
  const user = await getUser();

  // ─────────── Step 2: Parallel DB fetch (accounts + transactions + budgets) ──

  // Default empty arrays: if the try/catch catches an error, the hub renders with
  // 0-item states rather than crashing. This is the D-CUT-02 "DB error" edge state.
  let accounts: DbAccount[] = [];
  let recentTransactions: DbTransaction[] = [];
  let budgetProgress: BudgetProgress[] = [];
  let dataError: string | null = null;

  try {
    // Promise.all fires all three DB calls simultaneously (not sequentially).
    // WHY: Reduces the total wait time from sum(t1+t2+t3) to max(t1,t2,t3).
    // RESEARCH Pattern 1: parallel-fetch + try/catch is the established BB page pattern.
    [accounts, recentTransactions, budgetProgress] = await Promise.all([
      getAccounts(),
      getRecentTransactions(5),
      calculateAllBudgetProgress(),
    ]);
  } catch (error) {
    // Log the raw error to server logs only (STRIDE T-08-05-01: never expose internals to UI).
    console.error("[home] Error fetching data:", error);
    // Store a truthy signal; the raw message is NOT rendered (we show a hardcoded note instead).
    dataError = error instanceof Error ? error.message : "Failed to load data";
  }

  // ─────────── Step 3: Compute view-model values ──────────────────────────────

  // Derive the display name from the user's email address (D-GR-01).
  // nameFromEmail returns null for numeric-prefix or malformed emails → greeting falls back.
  const name = nameFromEmail(user?.email);

  // Timezone note (D-GR-03): `new Date()` returns UTC on Vercel servers. We pass it
  // to greetingForTime(), which internally projects to Europe/Berlin using Intl.DateTimeFormat
  // formatToParts(). The page does NOT need to construct a Berlin Date object — the pure
  // helper handles the timezone conversion. See src/utils/greeting.ts for the implementation.
  const greeting = buildGreeting(name, new Date());

  // Safe-to-Spend is null on DB error (hero renders €—).
  // On success, computeSafeToSpend() filters liquid accounts and subtracts essential budgets.
  // Result is always >= 0 (clamped inside the function).
  const safeToSpend = dataError ? null : computeSafeToSpend(accounts, budgetProgress);

  // Sort budgets alphabetically by category name (Claude's Discretion — deterministic,
  // consistent with the BUDGET_THRESHOLDS predictability ethos in lib/budgets/index.ts).
  const sortedBudgets = [...budgetProgress].sort((a, b) =>
    a.budget.category.localeCompare(b.budget.category)
  );

  // Map raw DB rows → TransactionItemProps view-model (CONTEXT D-CMP-02).
  const transactionItems = recentTransactions.map(toTransactionItemProps);

  // ─────────── Edge State: 0 accounts linked (CONTEXT D-CUT-02) ───────────────
  //
  // When no accounts are linked AND there is no DB error, REPLACE the entire hub
  // with a full-screen CTA card. Nothing else on the hub is meaningful without an account.
  //
  // IMPORTANT: Use a direct <Link>/<Button>, NOT <SyncTransactionsButton accountCount={0}>.
  // SyncTransactionsButton renders its own "Link a Bank" button when accountCount=0 (see
  // SyncTransactionsButton.tsx:80), which would create a competing UI element inside a
  // card that already has a clear CTA. Direct Link is more intentional and primary-feeling.
  // See 08-RESEARCH.md §Pitfall 7.
  //
  // No <PageHeader> on this state — the card heading ("Link your bank to get started")
  // serves the h1 role. Rendering both would create two competing page titles.
  if (accounts.length === 0 && !dataError) {
    return (
      <EmptyState
        variant="page"
        heading="Link your bank to get started"
        description="Connect a bank account to see your spending and start budgeting."
        action={
          <Link href="/link-bank">
            <Button>Link your bank</Button>
          </Link>
        }
      />
    );
  }

  // ─────────── Normal Hub: 4 sections in locked order ─────────────────────────
  //
  // Outer element is a fragment (<>) wrapping PageHeader + sections div.
  // WHY not <main>: (bb)/layout.tsx already wraps all BB pages in <PageShell>,
  // which renders the single <main> landmark. A second <main> would be invalid HTML.
  // See RESEARCH Pattern 6 for the full explanation.
  return (
    <>
      {/* PageHeader renders <header><h1>Home</h1></header> — the semantic page title. */}
      <PageHeader title="Home" />

      {/* Outer wrapper: flex column with section gap (gap-bb-8 = 32px per DESIGN_SYSTEM §4.2) */}
      <div className="flex flex-col gap-bb-8">

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 1: Greeting + Safe-to-Spend Hero                               */}
        {/* 08-UI-SPEC.md § Section 1 — card with greeting + label + EUR number    */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-label="Safe to spend" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          {/* Greeting line: text-bb-base (16px), secondary text color.
              Examples: "Good morning, Paul." or "Good morning."
              The greeting is body text, NOT a heading (PageHeader owns the h1). */}
          <p className="text-bb-base text-bb-text-secondary">{greeting}</p>

          {/* Label: text-bb-sm (14px), positioned above the number (DESIGN_SYSTEM §5.1:
              label names the metric before the number is read — helps ADHD top-to-bottom scan). */}
          <p className="text-bb-sm text-bb-text-secondary mt-bb-8">
            Safe to spend this month
          </p>

          {/* EUR number: text-bb-3xl (36px, D-CMP-01), font-bold (700).
              Always text-bb-text (neutral dark) regardless of value — NEVER colored red/green.
              Rationale: the formula clamps at 0 so negatives are impossible; coloring would
              add anxiety-inducing meaning that doesn't exist in the math (UI-SPEC Hero color rule).
              €— (em-dash) renders in text-bb-text-secondary when safeToSpend is null (DB error).
              aria-label provides screen-reader context for the €— state. */}
          <p
            className={`text-bb-3xl font-bold mt-bb-2 ${
              safeToSpend === null ? "text-bb-text-secondary" : "text-bb-text"
            }`}
            aria-label={
              safeToSpend === null
                ? "Safe to spend value unavailable"
                : `Safe to spend ${formatCurrency(safeToSpend)}`
            }
          >
            {safeToSpend === null ? "€—" : formatCurrency(safeToSpend)}
          </p>
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 2: Budget Status Indicators (compact, NOT full progress cards) */}
        {/* PAGE-02 — 08-UI-SPEC.md § Section 2. Each budget: one single line.    */}
        {/* BudgetProgressSection (full cards) is NOT used here — it moves to      */}
        {/* /budgets in Phase 9.                                                   */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="home-budget-status" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 id="home-budget-status" className="text-bb-xl font-bold text-bb-text mb-bb-4">Budget status</h2>

          {sortedBudgets.length === 0 ? (
            <EmptyState
              heading="Set up your first budget"
              action={
                <Link
                  href="/settings"
                  className="text-bb-sm text-bb-info underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bb-info focus-visible:ring-offset-2 rounded-sm"
                >
                  Go to settings
                </Link>
              }
            />
          ) : (
            // Budget rows: one BudgetStatusRow per active budget, alphabetically sorted.
            <div>
              {sortedBudgets.map((progress) => (
                <BudgetStatusRow key={progress.budget.id} progress={progress} />
              ))}
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 3: Recent Transactions (TransactionItem view-model pattern)    */}
        {/* PAGE-03 — 08-UI-SPEC.md § Section 3.                                  */}
        {/* getRecentTransactions(5) fetches the 5 most recent transactions.       */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <section aria-labelledby="home-recent-tx" className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
          <h2 id="home-recent-tx" className="text-bb-xl font-bold text-bb-text mb-bb-4">Recent transactions</h2>

          {transactionItems.length === 0 ? (
            <EmptyState
              heading="Your transactions will appear here."
              action={<SyncTransactionsButton accountCount={accounts.length} />}
            />
          ) : (
            // Transaction list: each row is a TransactionItem.
            // Key synthesized from merchant + date + index because the view-model does not
            // carry the DB `id`. Phase 9 may extend TransactionItemProps with `id` if
            // the /transactions page needs stable keys for animations.
            // role="list" restores list semantics for screen readers (div-based list pattern).
            <div role="list">
              {transactionItems.map((tx, idx) => (
                <TransactionItem
                  key={`${tx.merchant}-${tx.date}-${idx}`}
                  {...tx}
                />
              ))}
            </div>
          )}
        </section>

        {/* ────────────────────────────────────────────────────────────────────── */}
        {/* Section 4: Sync Transactions quick-action                              */}
        {/* PAGE-01 — 08-UI-SPEC.md § Section 4.                                  */}
        {/* Full-width (w-full) = generous touch target + single primary action    */}
        {/* per view (DESIGN_SYSTEM §5.6).                                         */}
        {/* No card wrapper — the button sits directly in the page flow.           */}
        {/* ────────────────────────────────────────────────────────────────────── */}
        <SyncTransactionsButton accountCount={accounts.length} className="w-full" />

      </div>

      {/* DB error inline note (CONTEXT D-CUT-02, STRIDE T-08-05-01):
          Rendered below the Sync button when the DB fetch failed.
          Shows a hardcoded user-friendly message — NEVER the raw error string.
          text-bb-text-secondary on a neutral background = calm, not alarming.
          NO bg-bb-negative, NO border-bb-negative, NO text-bb-negative (P1: calm first). */}
      {dataError && (
        <p className="text-bb-sm text-bb-text-secondary text-center mt-bb-4">
          Couldn&apos;t load data. Try refreshing.
        </p>
      )}
    </>
  );
}
