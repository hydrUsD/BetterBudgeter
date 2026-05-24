# Known Issues — Deferred to Next Milestone

Bugs and improvements discovered during v2.0 that are intentionally deferred to the next milestone (dependency upgrade + codebase cleanup).

---

## BUG-001: Donut chart tooltip shows only amount, no category name or color

**Page:** `/budgets` — Spending by Category donut chart
**Severity:** Low (cosmetic)
**Discovered:** Phase 10 review (2026-05-24)
**Screenshot:** `.screenshots/Post-Phase-10_:budgets_donut-chart-hover_problem.png`

**Problem:** When hovering over a donut chart segment, the tooltip shows only the formatted currency value (e.g., "790,31 €") without the category name, color indicator, or any other context.

**Root cause:** `SpendingByCategoryChart.tsx` passes a custom `formatter` to `ChartTooltipContent`. When a formatter is present, shadcn/ui's `chart.tsx` (line ~194) replaces the entire default tooltip content (color dot + label + value) with only the formatter's return value — which is just the currency string.

**Fix direction:** Remove the custom `formatter` prop and use `nameKey="name"` instead, so the tooltip uses the built-in rendering path (color indicator + category label + value). Currency formatting can be handled via the chart config.

**Existed since:** Milestone 1 (pre-v2.0).
