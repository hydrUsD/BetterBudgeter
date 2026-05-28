// Server component — do NOT add "use client". No interactivity, no hooks.
// This is a pure presentational component rendered on the server side.

/**
 * TransactionItem Component
 *
 * VIEW-MODEL DECOUPLING:
 *   This component accepts a view-model (TransactionItemProps) — NOT a raw
 *   DbTransaction row. The parent page (or any consumer) is responsible for
 *   mapping DB rows → TransactionItemProps before passing them here.
 *   This decoupling makes the component:
 *   - Unit-testable without any database mocking
 *   - Reusable across Home hub (Phase 8) and Transactions page (Phase 9)
 *   - Independent of future DB schema changes
 *
 * VISUAL CONTRACT (08-UI-SPEC.md § Section 3 + DESIGN_SYSTEM §5.3):
 *   Two-line layout per transaction:
 *   Line 1 (primary):  [merchant name]         [±amount]
 *   Line 2 (secondary): [category] · [date]
 *
 *   Income amounts → "+" prefix + text-bb-positive (green)
 *   Expense amounts → "−" U+2212 prefix + text-bb-negative (coral)
 *   Both amounts use font-bold (weight 700) — the key data point of each row.
 *   Merchant name uses default weight 400 — position + colored amount provide hierarchy.
 *   NO icons (DESIGN_SYSTEM §5.3, PAGE-03).
 *
 * TYPOGRAPHY (08-UI-SPEC.md — Revision 1):
 *   Exactly 2 weights: 400 (default) and 700 (font-bold). No font-medium.
 *   Exactly 4 sizes in Phase 8: text-bb-sm (14px) for secondary; text-bb-base (16px) for primary.
 *
 * CONTEXT D-CMP-02 — view-model shape source.
 * DESIGN_SYSTEM §5.3 + 08-UI-SPEC.md § Section 3 — visual contract source.
 *
 * EXTENSION POINTS:
 *   - Future click-to-detail: wrap the outer div in a Next.js <Link href={`/transactions/${id}`}>
 *     (add an optional `id` prop to TransactionItemProps first)
 *   - Future per-transaction icons: replace the empty left column with an icon slot
 *     (currently the layout has no reserved icon column — add one then if needed)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Imports
// ─────────────────────────────────────────────────────────────────────────────

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import type { TransactionCategory } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * View-model props for a single transaction row.
 *
 * Locked by CONTEXT D-CMP-02 — do not change this shape without updating
 * all callers and the matching test fixtures.
 */
export interface TransactionItemProps {
  /** Primary display name for the transaction (merchant, creditor, or debtor). */
  merchant: string;

  /**
   * The transaction amount as a positive number.
   * Sign is NOT stored here — it is derived from `type`.
   * The parent page should pass `Math.abs(tx.amount)`.
   */
  amount: number;

  /**
   * Whether this transaction is income or an expense.
   * Controls the sign prefix (+ / −) and the color class
   * (text-bb-positive / text-bb-negative).
   */
  type: "income" | "expense";

  /**
   * The category this transaction belongs to.
   * Rendered verbatim in the secondary line.
   */
  category: TransactionCategory;

  /**
   * ISO 8601 date string (e.g. "2026-04-14").
   * Formatted inside the component as "14. Apr." using de-DE locale.
   */
  date: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a single transaction row in the two-line layout specified by
 * 08-UI-SPEC.md § Section 3 and DESIGN_SYSTEM §5.3.
 *
 * Expected usage in a list:
 *   {transactions.map(tx => <TransactionItem key={tx.id} {...toTransactionItemProps(tx)} />)}
 *
 * The `last:border-b-0` class on the outer div removes the bottom border from
 * the last item in a list — standard "divider between items" pattern.
 */
export function TransactionItem({
  merchant,
  amount,
  type,
  category,
  date,
}: TransactionItemProps) {
  // Format the date as "14. Apr." (day + short month, no year) in German locale.
  // Intl.DateTimeFormat handles locale-specific punctuation (periods after numbers
  // in de-DE). The result looks like "14. Apr." on current Node.js/ICU.
  const formattedDate = new Date(date).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });

  // U+2212 MINUS SIGN (−) for expenses — NOT ASCII hyphen-minus (-).
  // Typography requirement from 08-UI-SPEC.md § Section 3: "use − U+2212 minus sign,
  // not hyphen-minus -". The difference is visual and semantic: minus sign is wider
  // and sits at the mathematical baseline, matching the currency symbol style.
  // IMPORTANT: The character below is U+2212, not a hyphen. Do NOT "normalize" it.
  const prefix = type === "income" ? "+" : "−"; // "−" is U+2212

  // Color class: income → green, expense → coral. Both use font-bold (UI-SPEC Revision 1).
  const amountClass =
    type === "income" ? "text-bb-positive" : "text-bb-negative";

  return (
    <div role="listitem" className="flex flex-col gap-bb-1 py-bb-3 border-b border-bb-border last:border-b-0">
      {/* Primary row: merchant name (left) + colored amount (right) */}
      <div className="flex items-baseline justify-between">
        {/* Merchant name: text-bb-base (16px), default weight 400.
            No font-medium — hierarchy is carried by position + colored amount. */}
        <span className="text-bb-base text-bb-text">{merchant}</span>

        {/* Amount: text-bb-base font-bold (700), colored by income/expense type.
            Prefix is "+" for income, "−" (U+2212) for expense — never hyphen-minus. */}
        <span className={cn("text-bb-base font-bold", amountClass)}>
          {prefix}
          {formatCurrency(amount)}
        </span>
      </div>

      {/* Secondary row: category + middle dot + formatted date.
          All text-bb-sm (14px), text-bb-text-secondary color.
          The · separator is U+00B7 (middle dot), per UI-SPEC. */}
      <div className="flex items-center gap-bb-1">
        <span className="text-bb-sm text-bb-text-secondary">{category}</span>
        <span className="text-bb-sm text-bb-text-secondary">·</span>
        <span className="text-bb-sm text-bb-text-secondary">{formattedDate}</span>
      </div>
    </div>
  );
}
