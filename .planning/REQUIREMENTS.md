# REQUIREMENTS: v2.0 — ADHD-Optimized UI Redesign

**Milestone:** v2.0
**Source:** `docs/DESIGN_SYSTEM.md` (spec) + `docs/ADHD_UX_RESEARCH.md` (rationale)
**Locked:** 2026-05-19

---

## Active Requirements

### Design Tokens (TOKEN)

- [ ] **TOKEN-01**: User sees a calm, consistent color system via `--bb-*` CSS custom properties (foundation colors: `--bb-bg`, `--bb-surface`, `--bb-surface-raised`, `--bb-text`, `--bb-text-secondary`, `--bb-border`) in both light and dark mode — alongside existing shadcn/ui variables, not replacing them. Per DESIGN_SYSTEM.md §2.1.

- [ ] **TOKEN-02**: User sees semantic financial colors (`--bb-positive`, `--bb-caution`, `--bb-negative`, `--bb-info`) plus `-bg` background tint variants in both modes. `--bb-negative` is soft coral (`oklch(0.58 0.16 25)` light / `oklch(0.68 0.18 25)` dark) — NEVER bright red. Per §2.1.

- [ ] **TOKEN-03**: User sees budget categories visually differentiated by dedicated muted colors (`Essentials`, `Discretionary`, `Savings`, `Food`, `Transport`, `Entertainment`, `Other`) as CSS custom properties using oklch values from §2.1.

- [ ] **TOKEN-04**: User reads body text at minimum 16px (`--bb-text-base`) with 1.5× line height throughout the app. Applied to base body styles.

- [ ] **TOKEN-05**: User experiences consistent spacing via the 4px-grid scale (`--bb-space-1` through `--bb-space-12`) as CSS custom properties per §4.1.

- [ ] **TOKEN-06**: User sees soft border radius tokens (`--bb-radius-sm` 6px through `--bb-radius-xl` 20px) and minimal shadow tokens (`--bb-shadow-sm/md/lg`) per §2.2 and §2.3.

- [ ] **TOKEN-07**: Full typography system implemented: font stack (`--bb-font-sans`, `--bb-font-mono` per §3.1), complete type scale (`--bb-text-xs` 12px through `--bb-text-3xl` 36px with line heights and weights per level per §3.2), and typographic rules (no italics for emphasis, always left-aligned, never justified, max 65–75 chars/line, headings followed by 8px spacing per §3.3).

### Navigation (NAV)

- [ ] **NAV-01**: User can navigate between Home, Budgets, Transactions, and Settings via a persistent bottom tab bar (`components/layout/TabBar.tsx`) — 4 tabs: Home (House icon, `/`), Budgets (Pie chart icon, `/budgets`), Transactions (List icon, `/transactions`), Settings (Gear icon, `/settings`). lucide-react icons only. Per §8.1.

- [ ] **NAV-02**: Active tab shows `--bb-info` color + filled icon variant. Inactive tabs use `--bb-text-secondary`. Tab bar has a subtle top border for visual separation. Per §8.1.

- [ ] **NAV-03**: Tab switches are instant (no transition animations between tabs). Each tab remembers scroll position. Flat structure — no nested navigation. Per §8.2.

- [ ] **NAV-04**: All legacy routes remain accessible and functional: `/legacy`, `/analytics`, `/achievements`, `/legacy-index`, `/dashboard` (308 redirect to `/`). Tab bar is NOT added to legacy route pages. Per §8.4.

- [ ] **NAV-05**: Shared layout components created: `PageShell.tsx` (page wrapper: consistent padding, max-width 768px, bottom clearance for tab bar) and `PageHeader.tsx` (page title + subtitle). Per §12.3.

- [ ] **NAV-06**: `/login` and `/link-bank` render as standalone pages WITHOUT the tab bar. Per §8.3.

### Page Architecture (PAGE)

- [ ] **PAGE-01**: Home page (`/`) contains exactly 4 sections (no more): (1) time-aware greeting + Safe-to-Spend hero metric, (2) compact budget status indicators (traffic-light dot + name + remaining amount, one line each), (3) 3–5 most recent transactions, (4) "Sync Transactions" quick-action button. Per §7.2.

- [ ] **PAGE-02**: Home page budget status indicators are compact single-line elements — NOT the full Budget Progress Cards (those live on the Budgets page only).

- [ ] **PAGE-03**: Home page recent transactions use the Transaction Item component pattern (merchant name + amount + category + date, consistent height, no icons). Per §5.3.

- [ ] **PAGE-04**: Budgets page (`/budgets`) contains: (1) monthly overview (total spent vs budgeted, progress bar), (2) one Budget Progress Card per active budget, (3) Spending by Category donut chart (MIGRATED from current Home — remove from Home), (4) "Edit budgets →" link to Settings. Per §7.2.

- [ ] **PAGE-05**: Transactions page (`/transactions`) contains: (1) Income + Expense KPI cards (two-column grid ≥640px, single column below), (2) full transaction history grouped by date (scrollable), (3) "Sync Transactions" button at bottom. Per §7.2.

- [ ] **PAGE-06**: Settings page (`/settings`) expanded to include: (1) budget configuration (existing BudgetSettings component), (2) Linked Accounts list with sync status (MOVED from current Home — remove from Home), (3) notification preferences, (4) account info (email + sign out). Per §7.2.

- [ ] **PAGE-07**: All new pages use PageShell layout: single-column, max-width 768px, `--bb-space-5` card padding, `--bb-space-4` card gaps, `--bb-space-8` section gaps, bottom padding clearing the tab bar. Per §4.2 and §7.3.

- [ ] **PAGE-08**: Safe-to-Spend calculation implemented in `lib/safe-to-spend.ts` — computes available discretionary balance (total account balance minus remaining essential budget commitments for current month). This is NOT the raw balance. Clear comments explaining the formula and its limitations required. Per §7.2 Home.

- [ ] **PAGE-09**: Responsive two-column KPI card layout on Transactions page: grid at ≥640px, single-column below 640px. Per §4.3.

### Components (COMP)

- [ ] **COMP-01**: KPI Card component: label (secondary text) → hero number (`--bb-text-3xl` primary / `--bb-text-2xl` secondary) → description (xs text). Variants: Default, Positive (green tint), Negative (coral tint), Caution (amber tint). One metric per card only. Per §5.1.

- [ ] **COMP-02**: Budget Progress Card with three visual states: On Track (<80%) green bar + neutral text; Warning (80–99%) amber bar + "Getting close"; Over Budget (≥100%) coral bar + "Over by €X" (NOT "Budget failed"). Remaining amount is primary, no percentage in default view. Per §5.2.

- [ ] **COMP-03**: Transaction Item component: merchant name (primary, left) + amount (right, green for income / coral for expense) + category + date (secondary line). Consistent height per item, no icons. Per §5.3.

- [ ] **COMP-04**: Empty State component: positive framing ("Start by..." not "You have no..."), exactly one CTA button, ≤2 sentence explanation, optional icon, dashed border. Per §5.4.

- [ ] **COMP-05**: Alert Banner: background matches severity (amber for warning, coral for critical). One context sentence + one action sentence. Dismissible by user. Max 1 banner visible at a time. NO auto-dismiss. Per §5.5.

- [ ] **COMP-06**: Supportive confirmation dialogs on destructive/impulsive actions (delete budget, unlink account, dismiss all notifications, reset budget period). Language: "Remove this budget? You can recreate it anytime." — never "Are you sure?" Per §6.2.

- [ ] **COMP-07**: Immediate visible feedback on every user action: press states (<50ms), inline loading spinners for button actions, success toasts via Sonner, inline error messages near the cause. Per §6.1.

- [ ] **COMP-08**: Button variant system: Primary (filled, `--bb-info`, max 1 per view), Secondary (outlined, neutral), Ghost (text only), Destructive (outlined, `--bb-negative`). All buttons: min 44×44px touch target, loading state (spinner, button stays same size), disabled at 0.5 opacity. Per §5.6.

- [ ] **COMP-09**: Page-level loading: skeleton screens (matching layout shape) for page loads, inline spinners for button actions. Never block entire page. Show progress message for loads >3s. Per §6.3.

### Copy & Language (COPY)

- [ ] **COPY-01**: All user-facing strings pass the shame test — no "you overspent," "budget failed," "watch your spending," blame framing, or penalty language. Follow rewrite table in §9.3 exactly. Confirmation dialogs use "Let's confirm" not "Are you sure?" Per §9.

- [ ] **COPY-02**: Error messages explain what happened AND what to do next. No technical codes or stack traces. Retry actions provided where possible. Per §6.4.

### Accessibility (A11Y)

- [ ] **A11Y-01**: All interactive elements meet WCAG 2.2 AA contrast (4.5:1 body, 3:1 large text + UI). Minimum 44×44px touch targets. Visible focus ring on all interactive elements. Per §11.1.

- [ ] **A11Y-02**: App respects `prefers-reduced-motion: reduce` — all non-essential animations disabled. App respects `prefers-color-scheme` for light/dark mode. Per §11.2 and §10.1.

- [ ] **A11Y-03**: Semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>`. Strict heading hierarchy (h1→h2→h3, no skipping). `<label>` on all form inputs. Interactive elements use `<button>` or `<a>`, never `<div onClick>`. Errors linked via `aria-describedby`. Functional at 200% text zoom. Per §11.3.

- [ ] **A11Y-04**: Every `--bb-*` token has both light and dark values. Contrast compliance verified across all pages in both modes. No hardcoded colors bypassing the token system.

### Motion & Animation (MOTION)

- [ ] **MOTION-01**: Functional animations only: page fade (150ms), card appear (fade + 4px translateY, 200ms), progress bar fill (300ms), button press (scale 1→0.97→1, 100ms), toast enter slide-up (200ms), toast exit fade (150ms). Easing: `ease-out` entering, `ease-in` exiting. Per §10.2.

- [ ] **MOTION-02**: Zero tolerance for decorative motion: no autoplay (except skeleton screens), no bounce/pulse, no parallax, no background animations, no animated gradients, no infinite loops. Per §10.3.

---

## Anti-Requirements

### What Must NOT Be Built (DONT)

- **DONT-01**: AI predictions or spending forecasts — wrong for ADHD patterns, creates preemptive shame. Contradicts ADHD_UX_RESEARCH.md §5.3 and BetterBudgeter's deterministic-behavior principle.
- **DONT-02**: More than ~10 budget categories visible — ADHD working memory limit is 3 main buckets.
- **DONT-03**: Frequent/aggressive notifications beyond 80% and 100% budget thresholds.
- **DONT-04**: Competitive or social features (leaderboards, comparisons, sharing).
- **DONT-05**: Penalty-based gamification ("streak lost," achievement revocation, "budget failed" messaging).
- **DONT-06**: Complex multi-column dashboard grids on the Home page.
- **DONT-07**: Auto-dismissing toasts or timed interactions.
- **DONT-08**: Decorative animations with no functional purpose.

---

## Out of Scope (v2.0)

- Backend/database/auth changes
- Real banking API integration (Fake-Finance-API stays)
- Achievements page redesign (deferred — separate research project)
- Push notifications or background jobs
- Multi-user permissions or sharing
- Currency conversion

---

## Future Requirements (v2.x and beyond)

- Transaction search, filter, and date range picker (PAGE-05 extension point)
- Advanced view opt-in with custom metrics and batch import
- 24-hour wishlist feature for impulse-purchase prevention
- Achievements page redesign (ADHD engagement — separate research first)

---

## Requirement Traceability

*Filled by roadmapper — maps each REQ-ID to its phase.*

---

*39 requirements across 8 active categories + 1 anti-requirements category.*
*Specification source: `docs/DESIGN_SYSTEM.md` | Research source: `docs/ADHD_UX_RESEARCH.md`*
