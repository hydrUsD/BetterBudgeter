# ROADMAP: v2.0 — ADHD-Optimized UI Redesign

**Milestone:** v2.0
**Previous milestone:** v1.0 UI Cleanup & Redesign Preparation (Phases 1–5, complete)
**Phases in this milestone:** 6–11
**Requirements:** 39 active (TOKEN, NAV, PAGE, COMP, COPY, A11Y, MOTION)
**Granularity:** Standard

---

## Phases

- [x] **Phase 6: Design Tokens** — Establish all `--bb-*` CSS custom properties in globals.css (colors, typography, spacing, radius, shadows). No visible UI change — foundation for all subsequent phases. *(Complete — 3 plans)*
- [ ] **Phase 7: Layout Shell & Navigation** — Create shared layout components (PageShell, PageHeader, TabBar) and wire up bottom tab bar across the four main pages. Legacy routes excluded.
- [ ] **Phase 8: Home Hub** — Restructure the Home page (`/`) into a hub: Safe-to-Spend hero metric, compact budget status indicators, recent transactions, quick-action sync button. Implement `lib/safe-to-spend.ts`.
- [ ] **Phase 9: Spoke Pages** — Build Budgets (`/budgets`), Transactions (`/transactions`), and expanded Settings (`/settings`) pages. Migrate Spending by Category chart to Budgets; migrate Linked Accounts to Settings.
- [ ] **Phase 10: Component System** — Build and integrate the full component library: KPI Card, Budget Progress Card, Transaction Item, Empty State, Alert Banner, button variants, loading states, confirmation dialogs, feedback patterns.
- [ ] **Phase 11: Copy, Accessibility & Motion** — Non-judgmental copy pass, WCAG 2.2 AA compliance audit, semantic HTML, motion system (functional animations + reduced-motion support).

---

## Phase Details

### Phase 6: Design Tokens
**Goal**: All `--bb-*` CSS custom properties are defined and available throughout the app, in both light and dark mode, ready for consumption by subsequent phases.
**Depends on**: Nothing (first phase of milestone)
**Requirements**: TOKEN-01, TOKEN-02, TOKEN-03, TOKEN-04, TOKEN-05, TOKEN-06, TOKEN-07
**Success Criteria** (what must be TRUE):
  1. All `--bb-*` tokens exist in `globals.css` and can be inspected in browser DevTools in both light and dark mode
  2. Body text renders at minimum 16px with 1.5× line height throughout the app
  3. No existing page breaks or visually regresses — all legacy routes still work
  4. `bun run build` passes with no errors
**Plans**: 3 plans, 3 sequential waves (all modify `src/app/globals.css`)

**Wave 1**
- [x] 06-01-PLAN.md — Color tokens: BB `:root` and `.dark` blocks (TOKEN-01/02/03)

**Wave 2** *(blocked on Wave 1 completion)*
- [x] 06-02-PLAN.md — Spacing, radius, shadow, typography tokens + base body style (TOKEN-04/05/06/07)

**Wave 3** *(blocked on Wave 2 completion)*
- [x] 06-03-PLAN.md — BB `@theme inline` Tailwind utility mappings (TOKEN-01 through TOKEN-07)

**Cross-cutting constraints:** All three plans modify `src/app/globals.css` additively — existing shadcn blocks must remain unchanged.
**UI hint**: yes

### Phase 7: Layout Shell & Navigation
**Goal**: Users can navigate between Home, Budgets, Transactions, and Settings via a persistent bottom tab bar. Shared layout components (PageShell, PageHeader) are available for all spoke pages to use. Auth and legacy routes render without the tab bar.
**Depends on**: Phase 6
**Requirements**: NAV-01, NAV-02, NAV-03, NAV-04, NAV-05, NAV-06
**Success Criteria** (what must be TRUE):
  1. Bottom tab bar is visible on all four main pages (Home, Budgets, Transactions, Settings) and absent on `/login`, `/link-bank`, and all legacy routes
  2. Active tab shows `--bb-info` color; inactive tabs show `--bb-text-secondary`; tapping a tab switches instantly with no transition animation
  3. All legacy routes (`/legacy`, `/analytics`, `/achievements`, `/legacy-index`, `/dashboard`) remain fully functional
  4. PageShell constrains content to max-width 768px with correct bottom padding clearing the tab bar
  5. `bun run build` passes with no errors
**Plans**: 4 plans, 3 waves

**Wave 1** (parallel — PageShell/PageHeader and TabBar have no inter-dependency):
- [ ] 07-01-PLAN.md — PageShell + PageHeader layout primitives (TDD, NAV-05)
- [ ] 07-02-PLAN.md — TabBar bottom navigation component (TDD, NAV-01/02/03)

**Wave 2**:
- [ ] 07-03-PLAN.md — Slim root layout + create (legacy)/layout.tsx + git mv 5 legacy page dirs (NAV-04, NAV-06)

**Wave 3** (depends on Plans 01, 02, 03 — wires BB chrome to consume primitives):
- [ ] 07-04-PLAN.md — Create (bb)/layout.tsx + move Home/Settings into (bb)/ + create stub /budgets and /transactions pages (NAV-01/02/03/05/06)

**Cross-cutting constraints:** `git mv` for all 7 file moves (preserves blame per CLAUDE.md rule 10); no @radix-ui imports in new BB code; --bb-* tokens only; TDD discipline (RED→GREEN commits) for the 3 layout components; `viewportFit: "cover"` added to root Viewport export (RESEARCH §Pitfall 1).
**UI hint**: yes

### Phase 8: Home Hub
**Goal**: The Home page (`/`) delivers the hub experience — a Safe-to-Spend hero metric computed from real account data, a compact one-line-per-budget status indicator, a short recent-transaction list, and a Sync button. Everything else that was on the old dashboard is moved to its spoke page.
**Depends on**: Phase 7
**Requirements**: PAGE-01, PAGE-02, PAGE-03, PAGE-07, PAGE-08
**Success Criteria** (what must be TRUE):
  1. Home page displays exactly 4 sections: greeting + Safe-to-Spend hero, compact budget status indicators, 3–5 most recent transactions, "Sync Transactions" button
  2. Safe-to-Spend value is computed by `lib/safe-to-spend.ts` (not raw balance) and shows a meaningful number when transactions exist
  3. Budget status indicators are compact single-line elements (NOT full Budget Progress Cards)
  4. Page uses PageShell layout (max-width 768px, correct spacing from token scale)
  5. `bun run build` passes with no errors
**Plans**: TBD
**UI hint**: yes

### Phase 9: Spoke Pages
**Goal**: Users can access complete, functional Budgets, Transactions, and Settings pages. The Spending by Category chart lives on the Budgets page (removed from Home). Linked Accounts management lives on Settings (removed from Home). Each page uses PageShell and design tokens.
**Depends on**: Phase 8
**Requirements**: PAGE-04, PAGE-05, PAGE-06, PAGE-09
**Success Criteria** (what must be TRUE):
  1. Budgets page (`/budgets`) shows monthly overview, one Budget Progress Card per active budget, Spending by Category donut chart (shadcn/ui chart — no direct Recharts imports), and "Edit budgets" link
  2. Transactions page (`/transactions`) shows Income + Expenses KPI cards in a two-column grid at ≥640px (single-column below), full transaction history grouped by date, and a Sync button
  3. Settings page (`/settings`) includes budget configuration, Linked Accounts list, notification preferences, and account info/sign-out
  4. All three pages use PageShell and consume `--bb-*` design tokens; no hardcoded color values
  5. `bun run build` passes with no errors
**Plans**: TBD
**UI hint**: yes

### Phase 10: Component System
**Goal**: A complete, consistent set of purpose-built ADHD-optimized components is available and in use across all pages: KPI Card, Budget Progress Card, Transaction Item, Empty State, Alert Banner, button variants, loading/feedback patterns, and confirmation dialogs.
**Depends on**: Phase 9
**Requirements**: COMP-01, COMP-02, COMP-03, COMP-04, COMP-05, COMP-06, COMP-07, COMP-08, COMP-09
**Success Criteria** (what must be TRUE):
  1. KPI Card, Budget Progress Card, Transaction Item, Empty State, and Alert Banner are built as standalone reusable components and used on their respective pages
  2. Budget Progress Card shows three distinct visual states: On Track (green bar), Warning (amber bar + "Getting close"), Over Budget (coral bar + "Over by €X" — never "Budget failed")
  3. Every destructive or impulsive action (delete budget, unlink account, etc.) triggers a supportive confirmation dialog using compassionate language ("You can recreate it anytime")
  4. Every user action produces immediate visible feedback: press states, inline spinners, success toasts via Sonner, inline error messages
  5. All buttons meet the 44×44px minimum touch target and have loading states that keep button size stable
  6. `bun run build` passes with no errors
**Plans**: TBD
**UI hint**: yes

### Phase 11: Copy, Accessibility & Motion
**Goal**: Every user-facing string passes the shame test and explains errors actionably. All interactive elements meet WCAG 2.2 AA. Semantic HTML is correct throughout. Functional motion is implemented; decorative motion is absent. Light and dark mode both pass contrast checks.
**Depends on**: Phase 10
**Requirements**: COPY-01, COPY-02, A11Y-01, A11Y-02, A11Y-03, A11Y-04, MOTION-01, MOTION-02
**Success Criteria** (what must be TRUE):
  1. No user-facing string contains blame, penalty, or shame language — all strings match or follow the rewrite table in DESIGN_SYSTEM.md §9.3
  2. All error messages state what happened AND what the user can do next; no technical codes or stack traces are shown to users
  3. All interactive elements have visible focus rings, minimum 44×44px touch targets, and pass 4.5:1 contrast in both light and dark mode
  4. App uses semantic HTML landmarks (`<main>`, `<nav>`, `<header>`, `<section>`), strict heading hierarchy, and `<label>` on all form inputs
  5. All `--bb-*` tokens have both light and dark values; `prefers-reduced-motion` disables all non-essential animations; `prefers-color-scheme` switches modes correctly
  6. `bun run build` passes with no errors
**Plans**: TBD
**UI hint**: yes

---

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 6. Design Tokens | 0/3 | Planned | - |
| 7. Layout Shell & Navigation | 0/? | Not started | - |
| 8. Home Hub | 0/? | Not started | - |
| 9. Spoke Pages | 0/? | Not started | - |
| 10. Component System | 0/? | Not started | - |
| 11. Copy, Accessibility & Motion | 0/? | Not started | - |

---

## Requirement Coverage

All 39 active requirements mapped:

| Req ID | Phase |
|--------|-------|
| TOKEN-01 | 6 |
| TOKEN-02 | 6 |
| TOKEN-03 | 6 |
| TOKEN-04 | 6 |
| TOKEN-05 | 6 |
| TOKEN-06 | 6 |
| TOKEN-07 | 6 |
| NAV-01 | 7 |
| NAV-02 | 7 |
| NAV-03 | 7 |
| NAV-04 | 7 |
| NAV-05 | 7 |
| NAV-06 | 7 |
| PAGE-01 | 8 |
| PAGE-02 | 8 |
| PAGE-03 | 8 |
| PAGE-07 | 8 |
| PAGE-08 | 8 |
| PAGE-04 | 9 |
| PAGE-05 | 9 |
| PAGE-06 | 9 |
| PAGE-09 | 9 |
| COMP-01 | 10 |
| COMP-02 | 10 |
| COMP-03 | 10 |
| COMP-04 | 10 |
| COMP-05 | 10 |
| COMP-06 | 10 |
| COMP-07 | 10 |
| COMP-08 | 10 |
| COMP-09 | 10 |
| COPY-01 | 11 |
| COPY-02 | 11 |
| A11Y-01 | 11 |
| A11Y-02 | 11 |
| A11Y-03 | 11 |
| A11Y-04 | 11 |
| MOTION-01 | 11 |
| MOTION-02 | 11 |

Coverage: 39/39 ✓
