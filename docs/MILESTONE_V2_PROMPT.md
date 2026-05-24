# Milestone v2.0 — ADHD-Optimized UI Redesign

**Task Type:** Implementation Task
**Scope:** Full design system implementation per `docs/DESIGN_SYSTEM.md`
**Branch:** `feat/adhd-ui-redesign`

---

## Context

BetterBudgeter is a personal finance tracker built on top of OopsBudgeter. The existing dashboard crams 7+ sections onto a single page, creating cognitive overload — the opposite of what ADHD users need. A comprehensive design system has been specified in `docs/DESIGN_SYSTEM.md` (backed by research in `docs/ADHD_UX_RESEARCH.md`). This milestone implements it end-to-end.

**Read these files before starting any work:**
- `docs/DESIGN_SYSTEM.md` — the full specification (this is your blueprint)
- `docs/ADHD_UX_RESEARCH.md` — the research rationale behind every decision
- `CLAUDE.md` — project rules (additive changes, bun, library boundaries, junior-dev comments)
- `.claude/rules/01-safety-and-workflow.md` — safety rules (one task at a time, never work on main)
- `.claude/rules/02-task-execution.md` — execution rules (decompose, verify, summarize)

**Implementation order:** Follow DESIGN_SYSTEM.md Section 12.2 — tokens first, then typography, then layout, then navigation, then pages, then components, then copy. At every phase the existing app must continue to work.

---

## Requirements (39 items across 9 categories)

### Design Tokens (TOKEN)

- **TOKEN-01:** Implement `--bb-*` CSS custom properties in `globals.css` for foundation colors (`--bb-bg`, `--bb-surface`, `--bb-surface-raised`, `--bb-text`, `--bb-text-secondary`, `--bb-border`) in both light and dark mode, per DESIGN_SYSTEM.md Section 2.1. These live ALONGSIDE existing `--background`, `--foreground` etc. shadcn/ui variables — do not replace them.

- **TOKEN-02:** Implement semantic financial colors (`--bb-positive`, `--bb-caution`, `--bb-negative`, `--bb-info`) plus their `-bg` background tint variants, in both light and dark mode. Critical: `--bb-negative` is soft coral (`oklch(0.58 0.16 25)` light / `oklch(0.68 0.18 25)` dark), NEVER bright red.

- **TOKEN-03:** Implement budget category colors (`Essentials`, `Discretionary`, `Savings`, `Food`, `Transport`, `Entertainment`, `Other`) as CSS custom properties using the muted oklch values from Section 2.1.

- **TOKEN-04:** Implement body text minimum 16px (`--bb-text-base`) with 1.5× line height across the app. Apply to base body styles.

- **TOKEN-05:** Implement the 4px-grid spacing scale as CSS custom properties (`--bb-space-1` through `--bb-space-12`) per Section 4.1.

- **TOKEN-06:** Implement border radius tokens (`--bb-radius-sm` 6px, `--bb-radius-md` 10px, `--bb-radius-lg` 14px, `--bb-radius-xl` 20px) and shadow tokens (`--bb-shadow-sm`, `--bb-shadow-md`, `--bb-shadow-lg`) per Sections 2.2 and 2.3.

- **TOKEN-07:** Implement the full typography system: font stack (`--bb-font-sans`, `--bb-font-mono` per Section 3.1), complete type scale (`--bb-text-xs` 12px through `--bb-text-3xl` 36px with specific line heights and weights per level, per Section 3.2), and typographic rules (no italics for emphasis, left-aligned only, never justified, max 65–75 characters per line, headings followed by 8px spacing, per Section 3.3).

### Navigation (NAV)

- **NAV-01:** Create a persistent bottom tab bar (`components/layout/TabBar.tsx`) with 4 tabs: Home (House icon, `/`), Budgets (Pie chart icon, `/budgets`), Transactions (List icon, `/transactions`), Settings (Gear icon, `/settings`). Use icons from lucide-react (already available via shadcn/ui). Per Section 8.1.

- **NAV-02:** Active tab uses `--bb-info` color with filled icon variant. Inactive tabs use `--bb-text-secondary`. Subtle top border on the tab bar for visual separation.

- **NAV-03:** Tab switches are instant (no page transition animations between tabs). Each tab remembers scroll position. No nested navigation — flat structure. Per Section 8.2.

- **NAV-04:** All legacy routes remain accessible and functional: `/legacy`, `/analytics`, `/achievements`, `/legacy-index`, `/dashboard` (308 redirect to `/`). Do NOT add the tab bar to legacy routes. Per Section 8.4.

- **NAV-05:** Create shared layout components: `PageShell.tsx` (shared page wrapper with consistent padding, max-width 768px, bottom clearance for tab bar) and `PageHeader.tsx` (consistent page title + subtitle pattern). Per Section 12.3.

- **NAV-06:** `/login` and `/link-bank` render as standalone pages WITHOUT the tab bar. They are NOT part of the hub-and-spoke navigation. Per Section 8.3.

### Page Architecture (PAGE)

- **PAGE-01:** Home page (`/`) shows: (1) Time-aware greeting ("Good morning, Paul") + Safe-to-Spend as the largest, most prominent hero metric, (2) compact budget status indicators (traffic-light style) for all active budgets, (3) last 3–5 recent transactions, (4) "Sync Transactions" quick action button. MAX 4 sections. Per Section 7.2 Home.

- **PAGE-02:** Home page budget status indicators are compact (one line each, traffic-light colored dot + category name + remaining amount). These are NOT the full budget progress cards — those live on the Budgets page.

- **PAGE-03:** Home page shows the 3–5 most recent transactions using the Transaction Item component pattern (merchant name + amount + category + date, consistent height, no icons). Per Section 5.3.

- **PAGE-04:** Budgets page (`/budgets`) shows: (1) monthly overview (total spent vs total budgeted, progress bar), (2) one Budget Progress Card per active budget with progress bar, remaining amount, and status, (3) Spending by Category donut chart (MIGRATED from current dashboard — remove from Home), (4) "Edit budgets →" link to settings. Per Section 7.2 Budgets.

- **PAGE-05:** Transactions page (`/transactions`) shows: (1) Income/Expense summary as two KPI cards (paired, two-column grid that stacks below 640px), (2) full transaction history grouped by date (scrollable list), (3) "Sync Transactions" button at bottom. Per Section 7.2 Transactions.

- **PAGE-06:** Settings page (`/settings`) — expanded to include: (1) Budget configuration (existing BudgetSettings component), (2) Linked Accounts list with sync status (MOVED from current dashboard), (3) Notification preferences, (4) Account info (email display, sign out). Per Section 7.2 Settings.

- **PAGE-07:** All pages use the PageShell layout: single-column, max-width 768px, `--bb-space-5` card padding, `--bb-space-4` card gaps, `--bb-space-8` section gaps, bottom padding to prevent tab bar overlap. Per Section 4.2 and 7.3.

- **PAGE-08:** Implement Safe-to-Spend calculation logic in `lib/` (e.g., `lib/safe-to-spend.ts`). This computes available discretionary balance: total account balance minus remaining essential budget commitments for the current month. This is NOT the raw account balance — it answers "How much can I safely spend right now?" Include clear comments explaining the formula and its limitations.

- **PAGE-09:** Implement the responsive two-column paired card layout for Income + Expenses KPI cards on the Transactions page. Two-column grid at ≥640px, stacks to single column below 640px. Per Section 4.3.

### Components (COMP)

- **COMP-01:** KPI Card component displaying a single financial metric: label (secondary text, top) → hero number (`--bb-text-3xl` for primary, `--bb-text-2xl` for secondary) → description (xs text, bottom). Variants: Default (neutral), Positive (green tint), Negative (coral tint), Caution (amber tint). One metric per card, never combine. Per Section 5.1.

- **COMP-02:** Budget Progress Card with three visual states: On Track (<80%) green progress bar + neutral text, Warning (80–99%) amber progress bar + "Getting close" text, Over Budget (≥100%) coral progress bar + "Over by €X" text (NOT "Budget failed"). Remaining amount as primary focus, no percentage shown in default view. Per Section 5.2.

- **COMP-03:** Transaction Item component: merchant name (primary text, left) + amount (right, colored green for income, coral for expense) + category + date (secondary line). Consistent height per item, no icons. Per Section 5.3.

- **COMP-04:** Empty State component: positive framing ("Start by..." not "You have no..."), exactly one CTA button, short explanation (2 sentences max), optional icon, dashed border. Per Section 5.4.

- **COMP-05:** Alert Banner: background color matches severity (amber for warning, coral for critical). One sentence of context + one sentence of meaning. Dismissible (user controls). Maximum 1 visible at a time. NO auto-dismiss. Per Section 5.5.

- **COMP-06:** Confirmation dialogs for destructive/impulsive actions (delete budget, unlink account, dismiss all notifications, reset budget period). Supportive friction language: "Remove this budget? You can recreate it anytime." — not "Are you sure?" Per Section 6.2.

- **COMP-07:** Every user action produces immediate visible feedback: press states (<50ms), loading spinners for button actions, success toasts via Sonner, inline errors near the cause. Per Section 6.1.

- **COMP-08:** Button variant system per Section 5.6: Primary (filled, `--bb-info`, max 1 per view), Secondary (outlined, neutral), Ghost (text only), Destructive (outlined, `--bb-negative`). All buttons: minimum 44×44px touch target, loading state (spinner replacing text, button stays same size), disabled state (opacity 0.5).

- **COMP-09:** Loading states per Section 6.3: skeleton screens (matching layout shape) for page loads, inline spinners for button actions only. Never block the entire page. Show progress message for loads >3 seconds ("Syncing your transactions..."). Distinct from COMP-07 feedback — this is page-level loading patterns.

### Copy & Language (COPY)

- **COPY-01:** All user-facing strings pass the shame test — no "you overspent," "budget failed," "watch your spending," or blame framing. Follow the rewrite table in Section 9.3 exactly. Supportive friction language for confirmations ("Let's confirm" not "Are you sure?"). Per Section 9.

- **COPY-02:** Error messages explain what happened AND what to do next. No technical codes or stack traces shown to users. Provide retry actions when possible. Tone: "We couldn't connect to your bank. Check your credentials and try again." Per Section 6.4.

### Accessibility (A11Y)

- **A11Y-01:** All interactive elements meet WCAG 2.2 AA contrast ratios (4.5:1 body text, 3:1 large text and UI components). All interactive elements have minimum 44×44px touch targets. Visible focus ring on all interactive elements. Per Section 11.1.

- **A11Y-02:** App respects `prefers-reduced-motion: reduce` — all non-essential animations disabled. Also respect `prefers-color-scheme` for light/dark mode. Per Sections 11.2 and 10.1.

- **A11Y-03:** Semantic HTML: `<main>`, `<nav>`, `<header>`, `<section>` landmarks. Strict heading hierarchy (h1→h2→h3, no skipping). Form inputs with `<label>`. Interactive elements use `<button>`/`<a>`, never `<div>` with onClick. Error messages linked via `aria-describedby`. App functional at 200% text zoom. Per Section 11.3.

- **A11Y-04:** Verify dark mode token coverage: every `--bb-*` token has both light and dark mode values. Test contrast compliance across all pages in both modes. No hardcoded colors that bypass the token system.

### Motion & Animation (MOTION)

- **MOTION-01:** Implement functional animations only: page fade (150ms), card appear (fade + 4px translateY, 200ms), progress bar fill (300ms), button press (scale 1→0.97→1, 100ms), toast enter (slide up, 200ms), toast exit (fade out, 150ms). Easing: `ease-out` for entering, `ease-in` for exiting. Max duration 300ms for transitions, 500ms for complex sequences. Per Section 10.2.

- **MOTION-02:** Zero tolerance: no autoplay animations (except skeleton screens), no bouncing/pulsing elements, no parallax scrolling, no background animations, no animated gradients, no infinite loops. Per Section 10.3.

### Anti-Requirements (DONT)

- **DONT-01:** Do NOT build any of the following — they are explicitly excluded by the design system and research:
  - AI predictions or spending forecasts (consistently wrong for ADHD patterns; creates preemptive shame)
  - More than ~10 budget categories (ADHD working memory limit is 3 main buckets)
  - Frequent/aggressive notifications beyond budget thresholds at 80% and 100%
  - Competitive or social features (leaderboards, comparisons, sharing)
  - Penalty-based gamification ("streaks lost," achievement revocation)
  - Complex multi-column dashboard grids
  - Auto-dismissing toasts or timed interactions
  - Decorative animations

---

## Implementation Constraints

1. **Additive only:** Existing app must work at every phase. No big-bang rewrites.
2. **Feature branch:** All work on `feat/adhd-ui-redesign` or sub-branches — never on main.
3. **bun only:** Use `bun install`, `bun dev`, `bun run build` — never npm or yarn.
4. **shadcn/ui for new components:** Never import from `@radix-ui` directly in new BetterBudgeter code.
5. **Library boundaries:** Use lucide-react for icons (via shadcn/ui), Recharts for charts (via shadcn/ui), Sonner for toasts.
6. **Junior-dev comments:** Every new file needs a header comment. Non-trivial logic needs inline explanation of what + why + extension points.
7. **Verification:** After each task, run `bun run build` and confirm the app starts with `bun dev`.
8. **Legacy untouched:** Legacy routes (`/legacy`, `/analytics`, `/achievements`) and their components remain completely unchanged.
9. **Auth unchanged:** Supabase Auth flow, middleware, login page — all unchanged.
10. **Database unchanged:** No schema changes. Safe-to-Spend is a calculated value from existing `bb_transactions` and `bb_budgets` tables.

---

## Verification Checklist

After all items are implemented:

- [ ] `bun run build` succeeds with zero errors
- [ ] `bun dev` starts and all 4 tab pages render
- [ ] Legacy routes (`/legacy`, `/analytics`, `/achievements`) still work
- [ ] `/login` and `/link-bank` render WITHOUT tab bar
- [ ] All `--bb-*` tokens defined in both `:root` and `.dark` blocks
- [ ] Dark mode renders correctly across all pages
- [ ] All animations disabled when `prefers-reduced-motion: reduce` is set
- [ ] No bright red anywhere — over-budget uses soft coral
- [ ] No blame language in any user-facing string
- [ ] SpendingByCategoryChart appears on `/budgets`, NOT on Home
- [ ] Linked Accounts section appears on `/settings`, NOT on Home
- [ ] Home page has exactly 4 sections (greeting+safe-to-spend, budget status, recent transactions, sync button)
- [ ] All buttons meet 44×44px minimum touch target

---

*39 requirements across 9 categories. Specification source: `docs/DESIGN_SYSTEM.md`*
