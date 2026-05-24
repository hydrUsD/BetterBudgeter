/**
 * BB Loading Shell
 *
 * WHAT:
 * Next.js automatically renders this component while a BB page's server
 * component is streaming. It replaces {children} in the (bb)/layout.tsx
 * until the real page content arrives.
 *
 * ADHD DESIGN:
 * - No spinners, no shimmer animations — those create anxiety and draw focus
 *   to "waiting" instead of calm patience (ADHD UX Research §3.4).
 * - Static placeholder blocks in muted tones signal "content is coming"
 *   without demanding attention.
 * - Layout matches the typical page structure (header area + 2–3 card areas)
 *   to prevent layout shift when real content arrives.
 *
 * WHY minimal:
 * BB pages are server-rendered with parallel data fetching. Load times are
 * typically <500ms. A complex skeleton would flash briefly and feel jarring.
 * Simple muted rectangles are sufficient for this latency range.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function BBLoading() {
  return (
    <div className="flex flex-col gap-bb-8 animate-pulse">
      {/* Page header placeholder */}
      <div className="flex flex-col gap-bb-2">
        <div className="h-7 w-32 bg-bb-surface-raised rounded-bb-md" />
        <div className="h-4 w-48 bg-bb-surface-raised rounded-bb-md" />
      </div>

      {/* Card placeholder 1 — mimics a KPI section or hero card */}
      <div className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5">
        <div className="h-4 w-24 bg-bb-surface-raised rounded-bb-md mb-bb-3" />
        <div className="h-8 w-36 bg-bb-surface-raised rounded-bb-md" />
      </div>

      {/* Card placeholder 2 — mimics a list section */}
      <div className="bg-bb-surface border border-bb-border rounded-bb-lg p-bb-5 flex flex-col gap-bb-3">
        <div className="h-4 w-40 bg-bb-surface-raised rounded-bb-md" />
        <div className="h-4 w-full bg-bb-surface-raised rounded-bb-md" />
        <div className="h-4 w-full bg-bb-surface-raised rounded-bb-md" />
        <div className="h-4 w-3/4 bg-bb-surface-raised rounded-bb-md" />
      </div>
    </div>
  );
}
