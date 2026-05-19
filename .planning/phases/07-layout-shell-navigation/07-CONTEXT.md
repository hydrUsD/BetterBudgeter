# Phase 7: Layout Shell & Navigation - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Create the BetterBudgeter navigation shell — `TabBar`, `PageShell`, `PageHeader` — and wire it up so that the 4 BB pages (`/`, `/budgets`, `/transactions`, `/settings`) render with the bottom tab bar, while legacy routes (`/legacy`, `/analytics`, `/achievements`, `/dashboard`, `/legacy-index`), the auth page (`/login`), and the bank-linking flow (`/link-bank`) render WITHOUT it.

This phase also restructures the App Router root by introducing two route groups: `(bb)/` (the new primary app) and `(legacy)/` (preserved OopsBudgeter routes). Route groups are URL-transparent — paths are unchanged externally, but layouts are cleanly separated internally.

This is the first phase to actually consume the `--bb-*` design tokens defined in Phase 6 (for tab bar colors, spacing, typography).

**Out of scope (other phases handle):**
- Filling out the Home page body (PAGE-01..03 → Phase 8)
- Filling out Budgets / Transactions / expanded Settings content (PAGE-04..06 → Phase 9)
- Building the component library (KPI cards, etc. → Phase 10)
- Copy review, a11y audit, motion (Phase 11)

</domain>

<decisions>
## Implementation Decisions

### Layout Isolation Strategy

- **D-01:** Use **two route groups**: `src/app/(bb)/` (primary BB app) and `src/app/(legacy)/` (preserved OopsBudgeter). `(bb)` is the canonical home for the new app; `(legacy)` is "unlisted" — accessible by URL but not part of BB navigation. Route groups are URL-transparent, so all existing URLs (`/`, `/legacy`, `/analytics`, etc.) remain unchanged.

- **D-02:** Standalone pages (`/login`, `/link-bank`) stay outside both groups — they get NO tab bar and NO legacy chrome. They inherit only the truly-global root layout (html/body/ThemeProvider/Toaster).

### Legacy Chrome Relocation

- **D-03:** Move all 5 legacy page directories into `src/app/(legacy)/` via `git mv` (preserves history). Paths to move: `legacy/`, `analytics/`, `achievements/`, `dashboard/`, `legacy-index/`. URLs unchanged because `(legacy)` is a route group.

- **D-04:** Create `src/app/(legacy)/layout.tsx` containing the full legacy chrome stack, in this exact nesting order:
  ```
  PasscodeWrapper
    → AppProvider (AppContext)
      → BudgetProvider (BudgetContext)
        → <main className="p-0 md:p-6">
          → PageLayout (legacy card wrapper)
            → Logo, Settings, Achievements, ThemeToggle, {children}
  → GoToTop (sibling)
  ```
  This is the exact stack currently in root `layout.tsx` — relocated verbatim. `useApp` and `useBudget` consumers are all in `src/components/legacy/**` (verified by grep), so providers belong with legacy.

- **D-05:** Slim down root `src/app/layout.tsx` to truly-global only:
  ```
  html / body (with font variables)
    → ThemeProvider (next-themes wrapper from components/legacy/providers)
      → {children}
      → Toaster (Sonner)
  ```
  Root keeps: viewport meta, metadata generation, dev-only `import("@/lib/recurring")`, font setup (Geist/GeistMono).

### BB Layout Chrome

- **D-06:** Create `src/app/(bb)/layout.tsx` containing the BB chrome:
  ```
  <PageShell>
    {children}
    <TabBar />
  </PageShell>
  ```
  No legacy providers (AppProvider / BudgetProvider) — BB pages don't use them. BB-specific providers (if any emerge) are added here later.

- **D-07:** Move the 4 BB pages into `(bb)/` via `git mv`:
  - `src/app/page.tsx` → `src/app/(bb)/page.tsx` (Home)
  - `src/app/settings/page.tsx` → `src/app/(bb)/settings/page.tsx` (existing settings stays untouched — Phase 9 expands)
  - Create new: `src/app/(bb)/budgets/page.tsx`
  - Create new: `src/app/(bb)/transactions/page.tsx`

### Stub Content for New Routes

- **D-08:** `/budgets` and `/transactions` ship in Phase 7 with `<PageShell><PageHeader title="..." subtitle="..." /><p>{placeholder}</p></PageShell>`. Placeholder copy is **user-facing and neutral** — no Phase 8/9 references, no dev jargon. Suggested copy:
  - `/budgets`: title "Budgets", subtitle "Track your monthly spending limits", body "Your budgets will appear here."
  - `/transactions`: title "Transactions", subtitle "Your spending history", body "Your transactions will appear here."
  - Final wording is the copy pass's call (Phase 11), but it must read naturally to users today.

### TabBar Component Behavior

- **D-09:** TabBar is constrained to PageShell's max-width (768px) and centered at the viewport bottom on all screen sizes. Reinforces the PWA/mobile-app feel even on desktop and keeps the design language consistent. Outside the bar on wide screens is empty `--bb-bg`, not chrome.

- **D-10:** TabBar implementation specifics locked by `NAV-01`..`NAV-03`:
  - 4 tabs, `lucide-react` icons (House, PieChart, List, Settings/Gear)
  - Active: `--bb-info` color + filled icon variant
  - Inactive: `--bb-text-secondary` + outlined icon
  - Subtle top border for separation (`--bb-border`)
  - Minimum 44×44px touch targets
  - Instant route switching, no transition animation between tabs
  - Determines active tab from `usePathname()` (client component)

### PageShell & PageHeader Components

- **D-11:** `components/layout/PageShell.tsx`:
  - Single-column layout, max-width 768px, horizontally centered
  - Card padding `--bb-space-5`, section gap `--bb-space-8` (per DESIGN_SYSTEM.md §4.2 / §7.3)
  - Bottom padding that clears the fixed TabBar (TabBar height + safe-area-inset-bottom)
  - Renders children in the content area; TabBar is a sibling/positioned-fixed element

- **D-12:** `components/layout/PageHeader.tsx`:
  - Title (h1) + optional subtitle
  - Uses typography tokens from Phase 6 (`--bb-text-2xl` or `--bb-text-3xl` for title, `--bb-text-secondary` for subtitle)
  - 8px spacing below heading (per DESIGN_SYSTEM.md §3.3 — though that's deferred globally, applied locally here)

### Middleware & Routing Safety

- **D-13:** `src/middleware.ts` references legacy paths in **comments only**, not in routing logic. Route groups don't change URLs, so middleware is unaffected by the moves. No middleware changes needed in Phase 7.

- **D-14:** `/dashboard` 308 redirect (`src/app/dashboard/page.tsx` → `permanentRedirect("/")`) stays functional after moving into `(legacy)/`. The redirect target `/` still resolves to `(bb)/page.tsx`.

### Claude's Discretion

- Choice of fixed vs. sticky positioning for TabBar (`position: fixed` is the typical pattern; planner picks)
- File-level header comments and inline comments (mandatory per project rules — junior-friendly)
- Exact lucide-react icon names (House vs HomeIcon, etc.)
- Internal CSS structure (Tailwind classes vs styled components — Tailwind utilities preferred per project)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design Specification (primary source of truth)
- `docs/DESIGN_SYSTEM.md` §8 — Navigation spec (TabBar rules, tab list, active/inactive states, behavior, auth flow, legacy preservation)
- `docs/DESIGN_SYSTEM.md` §12.3 — Proposed file structure (`components/layout/` with PageShell, TabBar, PageHeader)
- `docs/DESIGN_SYSTEM.md` §7.3 — Page template structure
- `docs/DESIGN_SYSTEM.md` §4.2 — Layout constraints (max-width 768px, padding scale)

### Requirements (locked acceptance criteria)
- `.planning/REQUIREMENTS.md` — NAV-01 through NAV-06 (exact tab list, colors, behavior, legacy preservation, standalone auth pages)

### Phase 6 outputs (token consumers)
- `.planning/phases/06-design-tokens/06-CONTEXT.md` — Token system decisions; tab bar consumes `--bb-info`, `--bb-text-secondary`, `--bb-border`, `--bb-surface`, `--bb-bg`, plus spacing tokens
- `src/app/globals.css` — `--bb-*` tokens defined; Tailwind utilities (`bg-bb-surface`, `text-bb-info`, `border-bb-border`) available via `@theme inline` block

### Files modified or moved in this phase
- `src/app/layout.tsx` — Root layout, to be slimmed down (truly-global only)
- `src/app/page.tsx` — Home, to be moved into `(bb)/`
- `src/app/settings/page.tsx` — Settings, to be moved into `(bb)/` (content unchanged)
- `src/app/legacy/`, `src/app/analytics/`, `src/app/achievements/`, `src/app/dashboard/`, `src/app/legacy-index/` — to be moved into `(legacy)/`
- `src/components/legacy/helpers/PageLayout.tsx` — Legacy card wrapper (consumed by new `(legacy)/layout.tsx`)
- `src/components/legacy/providers/ThemeProvider.tsx` — next-themes wrapper (stays in root layout)
- `src/components/legacy/security/PasscodeWrapper.tsx` — Security gate (moves into `(legacy)/layout.tsx`)
- `src/contexts/AppContext.tsx` — AppProvider (moves into `(legacy)/layout.tsx`)
- `src/contexts/BudgetContext.tsx` — BudgetProvider (moves into `(legacy)/layout.tsx`)
- `src/middleware.ts` — No edits expected; comments reference URL paths only

### ADHD rationale
- `docs/ADHD_UX_RESEARCH.md` — Why a persistent, predictable bottom tab bar matters; 4-tab limit; consistency across breakpoints

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`--bb-*` design tokens** (`src/app/globals.css`): consumed via Tailwind utilities like `bg-bb-surface`, `text-bb-info`, `text-bb-text-secondary`, `border-bb-border`, `p-bb-5`, `gap-bb-8`. Phase 6 wired the `@theme inline` mappings so these "just work".
- **`lucide-react`**: already installed and used throughout the codebase. House / PieChart / List / Settings icons all available.
- **`next-themes` ThemeProvider** (`src/components/legacy/providers/ThemeProvider.tsx`): wraps the whole app with light/dark switching. Stays in root layout — both BB and legacy need it.
- **Sonner Toaster** (`src/components/legacy/effects/Sonner.tsx`): in-app toasts. Stays in root layout — global.
- **`(auth)/` route group** (`src/app/(auth)/login/page.tsx`): proves the route-group pattern works in this codebase. `(bb)/` and `(legacy)/` follow the same convention.

### Established Patterns
- **Route groups for layout separation**: Next.js convention — `(name)/` creates a logical grouping without affecting URL. Already used (`(auth)/`); extending to `(bb)/` and `(legacy)/` is idiomatic.
- **`git mv` for file moves**: Project preference (per Phase 1 history) — preserves blame/history. All file moves in Phase 7 use `git mv`, not delete-and-recreate.
- **Legacy components live in `src/components/legacy/`**: Strict structural isolation. BB chrome (new TabBar/PageShell/PageHeader) lives in `src/components/layout/` per DESIGN_SYSTEM.md §12.3.
- **Section-level comments mandatory**: Every new/modified file gets a header comment explaining purpose; non-trivial logic explained inline (per `.claude/rules/01-safety-and-workflow.md` §5 and CLAUDE.md team context).

### Integration Points
- **`(legacy)/layout.tsx` providers**: `useApp` (AppContext) and `useBudget` (BudgetContext) are consumed only by `src/components/legacy/**` (verified by grep). Providers move with the legacy chrome and continue working without changes for legacy consumers.
- **Standalone pages (`/login`, `/link-bank`)**: render against the slim root layout only — no tab bar, no legacy chrome. `/link-bank` currently sits at `src/app/link-bank/page.tsx` (top-level, not in any group) — verify it doesn't accidentally inherit `(bb)/` chrome. Top-level pages siblings to a route group are NOT inside it, so this is safe.
- **TabBar active state**: client component using `usePathname()` from `next/navigation` to determine which tab is active. Cannot be a server component.
- **Fixed positioning + content padding**: TabBar uses `position: fixed; bottom: 0`. PageShell adds bottom padding equal to TabBar height + safe-area-inset-bottom so content isn't hidden under the bar.
- **Middleware safety**: `src/middleware.ts` matches on URL paths, not file paths. Route group moves don't change URLs, so middleware passes through unchanged.

</code_context>

<specifics>
## Specific Ideas

- **`(bb)` is the "main" route, `(legacy)` is "unlisted"** (user's words). BB is what users see/navigate; legacy is preserved for demos and link-backs but never linked from the BB tab bar.
- **TabBar feels like a mobile app on desktop too** — user explicitly chose the 768px-constrained centered TabBar over a full-width desktop nav, prioritizing consistency with the PWA/ADHD design language.
- **Placeholder copy is user-friendly today, copy-pass-final in Phase 11** — same pattern as Phase 6's "prototype font stack" decision. Ship something readable; finalize wording later.

</specifics>

<deferred>
## Deferred Ideas

- **Tab scroll position memory** — NAV-03 mentions "each tab remembers scroll position". For instant client-side navigation in Next.js App Router, scroll position is preserved by default for back/forward but not for direct tab clicks. If we want explicit scroll-position memory per tab (Spotify-style), it needs custom state. Defer to Phase 10 or a follow-up unless researcher flags it as Phase 7 critical.
- **TabBar visual polish / micro-interactions** — Press states, hover, focus ring tuning. Functional in Phase 7; refined in Phase 11 (motion + a11y pass).
- **Final placeholder copy for `/budgets` and `/transactions`** — Phase 11 (copy pass) reviews against the shame test.
- **PageHeader variants** — Subtitle could grow optional actions (back arrow, kebab menu). Phase 9 or 10 if any spoke page needs them; Phase 7 ships title + optional subtitle only.
- **TabBar icon animations on tab change** — Filled icon variant should swap instantly per NAV-03 ("no transition animations between tabs"). If a subtle scale-in is desired later, that's Phase 11 (motion).
- **PWA install prompts / status bar coloring** — Out of milestone scope.

</deferred>

---

*Phase: 07-layout-shell-navigation*
*Context gathered: 2026-05-19*
