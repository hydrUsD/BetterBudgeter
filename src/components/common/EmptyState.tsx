/**
 * EmptyState — Reusable zero-data placeholder with optional CTA.
 *
 * WHAT:
 * Displays a calm, ADHD-friendly message when a section or page has no data yet.
 * Guides the user toward the next action instead of showing a blank void.
 *
 * WHY:
 * Empty UI creates confusion and anxiety (ADHD UX Research §3.2). Every empty
 * state must tell the user: (1) what would normally be here, (2) what to do next.
 * Extracting this pattern avoids inconsistent copy and styling across pages.
 *
 * VARIANTS:
 * - Inline: small empty state inside a card section (e.g. "No budgets yet")
 * - Page-level: replaces the entire page content (e.g. "Link your bank to get started")
 *   Use the `variant="page"` prop for centered layout with larger spacing.
 *
 * EXTENSION POINTS:
 * - Add an `icon` prop if a future design adds illustrations to empty states.
 * - Add a `secondaryAction` for two-button layouts.
 *
 * @see docs/DESIGN_SYSTEM.md §5.6 for empty state guidelines
 * @see docs/ADHD_UX_RESEARCH.md §3.2 for empty state rationale
 */

import type { ReactNode } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface EmptyStateProps {
  /** Main heading describing what's missing (e.g. "No budgets yet"). */
  heading: string;

  /** Supporting text explaining what to do next. */
  description?: string;

  /** Optional CTA rendered below the description.
   *  Pass a <Link>/<Button> or any interactive element. */
  action?: ReactNode;

  /** Layout variant:
   *  - "inline" (default): compact, left-aligned, fits inside a card section.
   *  - "page": centered, larger spacing, dashed border — replaces entire page content. */
  variant?: "inline" | "page";
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders a calm empty-state placeholder.
 *
 * Pure presentational — no data fetching, no side effects.
 * The parent page/section decides when to show it (e.g. `items.length === 0`).
 */
export function EmptyState({
  heading,
  description,
  action,
  variant = "inline",
}: EmptyStateProps) {
  if (variant === "page") {
    return (
      <div className="bg-bb-surface-raised border border-dashed border-bb-border rounded-bb-xl p-bb-10 flex flex-col items-center text-center">
        <h1 className="text-bb-xl font-bold text-bb-text mb-bb-4">{heading}</h1>
        {description && (
          <p className="text-bb-base text-bb-text-secondary mb-bb-8">{description}</p>
        )}
        {action}
      </div>
    );
  }

  // Inline variant: compact, left-aligned
  return (
    <div>
      <p className="text-bb-sm text-bb-text-secondary">{heading}</p>
      {description && (
        <p className="text-bb-sm text-bb-text-secondary mt-bb-1">{description}</p>
      )}
      {action && <div className="mt-bb-4">{action}</div>}
    </div>
  );
}
