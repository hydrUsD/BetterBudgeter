/**
 * PageHeader — Consistent Page Title + Subtitle
 *
 * Per DESIGN_SYSTEM §7.3, every BB page starts with a title (h1) and an
 * optional subtitle paragraph. This component extracts the duplicated inline
 * header pattern found across settings, legacy-index, and other pages.
 *
 * Implements D-12 (CONTEXT.md §PageShell & PageHeader Components).
 *
 * Server component — no interactivity, no client APIs needed.
 *
 * Spacing rationale:
 * - mb-bb-8 (32px): section gap below the header before first content block (DESIGN_SYSTEM §7.3)
 * - mt-bb-2 (8px): gap between title and subtitle (DESIGN_SYSTEM §3.3 "headings followed by 8px")
 *
 * Typography tokens (from Phase 6 globals.css --bb-* system):
 * - Title:    text-bb-3xl (36px, line-height 1.2) + font-bold + text-bb-text
 * - Subtitle: text-bb-base (16px, line-height 1.6) + text-bb-text-secondary
 *
 * Extension point: Pass a `subtitle` prop to render the supporting description.
 * Future variants (back-arrow, kebab menu) are deferred to Phase 9/10.
 */

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PageHeaderProps {
  /** Page title — rendered as <h1> (one per page, strict hierarchy per A11Y-03) */
  title: string;
  /** Optional supporting description — rendered as <p> only when provided (D-12) */
  subtitle?: string;
  /** Optional Tailwind classes merged via cn() for per-page layout overrides */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    // <header> provides a semantic landmark for assistive technologies (A11Y-03)
    // mb-bb-8 adds 32px gap between this header block and the first content section
    <header className={cn("mb-bb-8", className)}>
      {/* One <h1> per page — strict heading hierarchy (A11Y-03, DESIGN_SYSTEM §3.2) */}
      <h1 className="text-bb-3xl font-bold text-bb-text">{title}</h1>

      {/* Subtitle is conditional: only rendered when provided — never an empty <p> (D-12) */}
      {subtitle && (
        <p className="mt-bb-2 text-bb-base text-bb-text-secondary">{subtitle}</p>
      )}
    </header>
  );
}
