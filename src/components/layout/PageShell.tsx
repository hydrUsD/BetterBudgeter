/**
 * PageShell — BB Page Wrapper
 *
 * Single-column, max-width 768px, horizontally centered. Provides bottom clearance
 * so content doesn't sit under the fixed TabBar.
 *
 * Implements D-11 (CONTEXT.md §PageShell & PageHeader Components).
 *
 * Server component — no client APIs needed. Simply composes Tailwind utility
 * classes using the --bb-* design tokens defined in globals.css (Phase 6).
 *
 * Composition example:
 *   <PageShell>
 *     <PageHeader title="Dashboard" subtitle="Your financial overview" />
 *     <section>...</section>
 *   </PageShell>
 *
 * TabBar height: 56px (matches the h-[56px] class used in TabBar.tsx).
 * Bottom padding formula = 56px (bar height) + env(safe-area-inset-bottom) (iOS home
 * indicator area, 0 on non-iOS) + 1rem breathing room so last content item isn't
 * flush against the tab bar edge.
 *
 * Extension point: Pass a `className` prop to override or extend individual
 * utility classes (e.g. className="pt-0" if a page needs no top padding).
 */

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface PageShellProps {
  /** Page content rendered inside the shell */
  children: React.ReactNode;
  /** Optional Tailwind classes merged via cn() — for per-page overrides */
  className?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        // Layout: single-column, max-width 768px, centered (D-11 §DESIGN_SYSTEM §4.2)
        "min-h-svh w-full max-w-[768px] mx-auto",
        // Horizontal padding: 16px mobile, 24px at ≥768px (DESIGN_SYSTEM §4.2)
        "px-bb-4 md:px-bb-6",
        // Top padding: 24px generous breathing room at page start (DESIGN_SYSTEM §7.3)
        "pt-bb-6",
        // Bottom padding: clears the 56px fixed TabBar + iOS safe-area + 1rem buffer (NAV-05)
        "pb-[calc(56px+env(safe-area-inset-bottom)+1rem)]",
        // Colors: explicit background + text so shell is self-contained (TOKEN-01)
        "bg-bb-bg text-bb-text",
        // Per-page overrides (e.g. remove top padding on a page with a hero image)
        className
      )}
    >
      {children}
    </main>
  );
}
