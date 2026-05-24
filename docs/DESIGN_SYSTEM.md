# BetterBudgeter Design System

**Created:** 2026-04-16
**Purpose:** Full design system specification for ADHD-optimized UI/UX redesign
**Status:** Specification — ready for implementation
**Based on:** [ADHD_UX_RESEARCH.md](./ADHD_UX_RESEARCH.md)

---

## Table of Contents

1. [Design Principles](#1-design-principles)
2. [Design Tokens](#2-design-tokens)
3. [Typography](#3-typography)
4. [Spacing & Layout](#4-spacing--layout)
5. [Component Patterns](#5-component-patterns)
6. [Interaction Guidelines](#6-interaction-guidelines)
7. [Page Architecture](#7-page-architecture)
8. [Navigation](#8-navigation)
9. [Copy & Language Guidelines](#9-copy--language-guidelines)
10. [Motion & Animation](#10-motion--animation)
11. [Accessibility Requirements](#11-accessibility-requirements)
12. [Implementation Notes](#12-implementation-notes)

---

## 1. Design Principles

These five principles guide every design decision in BetterBudgeter. When in conflict, higher-numbered principles yield to lower-numbered ones.

### P1: Calm Over Comprehensive

Show only what the user needs right now. Every element must earn its place on screen. When in doubt, hide it behind a tap. The goal is a financial tool that feels calm, not overwhelming.

**Test:** Can a user glance at this page and understand their financial state in under 5 seconds?

### P2: Compassion Over Correction

Never make the user feel bad about their financial decisions. Frame setbacks as normal, celebrate progress, and treat overspending as information — not failure.

**Test:** Would this message make someone with financial shame want to close the app?

### P3: Clarity Over Cleverness

Prefer explicit, readable patterns over compact, clever ones. A junior developer should understand the component. A stressed user should understand the interface.

**Test:** Can someone unfamiliar with the app understand what this element means without explanation?

### P4: Consistency Over Customization

The same pattern should look and behave the same everywhere. Predictability reduces cognitive load. Users shouldn't have to re-learn the interface page by page.

**Test:** If I moved this component to a different page, would it look and behave identically?

### P5: Progressive Over Prescriptive

Start simple, let users discover complexity. Smart defaults for the common case. Advanced options available but never required.

**Test:** Can a new user complete their first task without configuring anything?

---

## 2. Design Tokens

### 2.1 Color Palette

The palette is built on calm, cool tones with intentional warm accents. Colors have semantic meaning that stays consistent throughout the app.

#### Foundation Colors

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bb-bg` | `oklch(0.985 0.002 280)` | `oklch(0.155 0.005 280)` | Page background |
| `--bb-surface` | `oklch(1 0 0)` | `oklch(0.195 0.005 280)` | Card/container background |
| `--bb-surface-raised` | `oklch(0.975 0.002 280)` | `oklch(0.235 0.006 280)` | Elevated surface (hover, active cards) |
| `--bb-text` | `oklch(0.205 0.006 280)` | `oklch(0.965 0.002 280)` | Primary text |
| `--bb-text-secondary` | `oklch(0.48 0.012 280)` | `oklch(0.66 0.012 280)` | Secondary/muted text |
| `--bb-border` | `oklch(0.91 0.004 280)` | `oklch(0.28 0.006 280)` | Borders and dividers |

#### Semantic Colors (Financial)

These colors carry consistent meaning across the entire app.

| Token | Value (Light) | Value (Dark) | Meaning |
|-------|--------------|-------------|---------|
| `--bb-positive` | `oklch(0.62 0.14 155)` | `oklch(0.72 0.14 155)` | Income, on-track, success (soft green) |
| `--bb-positive-bg` | `oklch(0.95 0.04 155)` | `oklch(0.22 0.04 155)` | Positive background tint |
| `--bb-caution` | `oklch(0.72 0.14 75)` | `oklch(0.78 0.14 75)` | Warning, approaching limit (muted amber) |
| `--bb-caution-bg` | `oklch(0.95 0.04 75)` | `oklch(0.22 0.04 75)` | Caution background tint |
| `--bb-negative` | `oklch(0.58 0.16 25)` | `oklch(0.68 0.18 25)` | Expense, over-budget (soft coral, NOT bright red) |
| `--bb-negative-bg` | `oklch(0.95 0.04 25)` | `oklch(0.22 0.04 25)` | Negative background tint |
| `--bb-info` | `oklch(0.60 0.12 245)` | `oklch(0.70 0.12 245)` | Informational, neutral highlight (soft blue) |
| `--bb-info-bg` | `oklch(0.95 0.03 245)` | `oklch(0.22 0.03 245)` | Info background tint |

**Design rationale:** We avoid bright red because it triggers anxiety and shame in financial contexts. Soft coral (`--bb-negative`) communicates "attention needed" without triggering a stress response. Soft green and amber are calming alternatives to traffic-light primaries.

#### Budget Category Colors

For charts and category indicators. These are less saturated than typical Tailwind colors to maintain a calm visual tone.

| Category | Color | Hex Approximation |
|----------|-------|-------------------|
| Essentials | `oklch(0.62 0.10 245)` | Soft blue |
| Discretionary | `oklch(0.65 0.12 165)` | Soft teal |
| Savings | `oklch(0.62 0.14 155)` | Soft green |
| Food | `oklch(0.68 0.10 55)` | Warm sand |
| Transport | `oklch(0.62 0.10 200)` | Steel blue |
| Entertainment | `oklch(0.65 0.12 290)` | Soft violet |
| Other | `oklch(0.58 0.02 280)` | Neutral gray |

### 2.2 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--bb-radius-sm` | `6px` | Small elements (badges, chips) |
| `--bb-radius-md` | `10px` | Inputs, buttons |
| `--bb-radius-lg` | `14px` | Cards, containers |
| `--bb-radius-xl` | `20px` | Large panels, modals |

### 2.3 Shadows

Minimal shadows. Prefer border + background color for elevation rather than heavy drop shadows.

| Token | Value | Usage |
|-------|-------|-------|
| `--bb-shadow-sm` | `0 1px 2px oklch(0 0 0 / 0.04)` | Subtle card lift |
| `--bb-shadow-md` | `0 2px 8px oklch(0 0 0 / 0.06)` | Elevated card, dropdown |
| `--bb-shadow-lg` | `0 4px 16px oklch(0 0 0 / 0.08)` | Modal, dialog |

---

## 3. Typography

### 3.1 Font Stack

Use the system sans-serif stack for maximum readability and zero loading cost:

```css
--bb-font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--bb-font-mono: ui-monospace, "SF Mono", "Cascadia Code", Menlo, monospace;
```

**Rationale:** System fonts are optimized for their platform, load instantly, and are familiar to users. Research shows the primary readability benefit comes from spacing, not font shape.

### 3.2 Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `--bb-text-xs` | `12px` | `1.5` | `400` | Captions, timestamps |
| `--bb-text-sm` | `14px` | `1.5` | `400` | Secondary text, labels |
| `--bb-text-base` | `16px` | `1.6` | `400` | Body text (minimum) |
| `--bb-text-lg` | `18px` | `1.5` | `500` | Emphasized body, section labels |
| `--bb-text-xl` | `22px` | `1.4` | `600` | Section headings |
| `--bb-text-2xl` | `28px` | `1.3` | `700` | Page titles |
| `--bb-text-3xl` | `36px` | `1.2` | `700` | Hero numbers (balance display) |

### 3.3 Typography Rules

- **Minimum body text:** 16px. Never smaller for primary content.
- **Line height:** 1.5x minimum for body text (ADHD readability requirement)
- **Letter spacing:** Default or slightly positive (+0.01em for body). Never condensed.
- **Paragraph length:** Maximum 65-75 characters per line
- **Emphasis:** Use `font-weight: 600` (semibold) or color. Never italics for emphasis.
- **Alignment:** Always left-aligned. Never justified (creates uneven word spacing).
- **Headings:** Always followed by at least 8px of space before content.

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

Based on a 4px grid with a primary rhythm of 8px:

| Token | Value | Usage |
|-------|-------|-------|
| `--bb-space-1` | `4px` | Tight internal spacing (icon-to-text) |
| `--bb-space-2` | `8px` | Default internal padding |
| `--bb-space-3` | `12px` | Between related elements |
| `--bb-space-4` | `16px` | Standard gap between components |
| `--bb-space-5` | `20px` | Card internal padding |
| `--bb-space-6` | `24px` | Between sections within a page |
| `--bb-space-8` | `32px` | Between major page sections |
| `--bb-space-10` | `40px` | Page-level vertical rhythm |
| `--bb-space-12` | `48px` | Large section separation |

### 4.2 Layout Constraints

| Property | Value | Rationale |
|----------|-------|-----------|
| Max content width | `768px` | Prevents lines from becoming too long (readability) |
| Page padding | `16px` mobile, `24px` tablet+ | Breathing room at edges |
| Card padding | `20px` | Generous internal space |
| Card gap | `16px` | Clear separation between cards |
| Section gap | `32px` | Visual breathing room between sections |

### 4.3 Layout Patterns

**Single-column layout (default):** All pages use a single-column layout with stacked cards/sections. This is the most readable pattern and works identically on mobile and desktop.

**Two-column grid (limited use):** Only for paired summary cards (e.g., Income + Expenses side-by-side). Stacks to single column on mobile (< 640px).

**No complex grids.** Multi-column dashboard layouts create cognitive overload. Every page reads top-to-bottom, like a document.

---

## 5. Component Patterns

### 5.1 KPI Card (Metric Display)

Displays a single financial metric prominently.

```
┌────────────────────────────┐
│  Label (secondary text)    │
│  €1,234.56 (hero number)  │
│  Description (xs text)     │
└────────────────────────────┘
```

**Variants:** Default (neutral), Positive (green tint), Negative (coral tint), Caution (amber tint)

**Rules:**
- One metric per card. Never combine metrics.
- Hero number uses `--bb-text-3xl` for the primary metric (balance) or `--bb-text-2xl` for secondary metrics
- Label above number, description below
- Semantic background tint communicates status without reading text

### 5.2 Budget Progress Card

Shows spending progress for a single budget category.

```
┌────────────────────────────────────┐
│  🍔 Food                   €120   │
│  ━━━━━━━━━━━━━━━━░░░░░    of €200 │
│  €80 remaining                     │
└────────────────────────────────────┘
```

**Visual states:**
- **On Track (< 80%):** Green progress bar, neutral text
- **Warning (80-99%):** Amber progress bar, "Getting close" text
- **Over Budget (≥ 100%):** Coral progress bar, "Over by €X" text (NOT "Budget failed")

**Rules:**
- Progress bar fills left-to-right
- Remaining amount is the primary focus (not percentage)
- No percentage shown in default view (reduces number overload)
- Percentage available in expanded/detail view if user wants it
- Language is informational, never judgmental

### 5.3 Transaction Item

Displays a single transaction in a list.

```
┌────────────────────────────────────┐
│  REWE Supermarkt          -€34.50 │
│  Food · 14 Apr                     │
└────────────────────────────────────┘
```

**Rules:**
- Description (merchant name) is the primary identifier
- Amount on the right, colored by type (positive green, negative coral)
- Category and date as secondary line
- No icons in the default list view (reduces visual noise)
- Consistent height per item (no variable-height rows)

### 5.4 Empty State

Guides user toward first action. Never a blank screen.

```
┌────────────────────────────────────┐
│                                     │
│     [Illustration or icon]         │
│                                     │
│     No transactions yet            │
│     Link a bank account to start   │
│     seeing your spending here.     │
│                                     │
│     [ Link a Bank Account ]        │
│                                     │
└────────────────────────────────────┘
```

**Rules:**
- Positive framing: "Start by..." not "You have no..."
- Exactly one call-to-action button
- Short explanation (2 sentences max)
- Optional simple illustration (not decorative — functional)
- Dashed border on card to indicate "placeholder" state

### 5.5 Alert / Notification Banner

For budget warnings and important status messages.

```
┌────────────────────────────────────┐
│  ⚠ Your Food budget is at 85%.    │
│  You have €30 left for this month. │
│                         [Got it]   │
└────────────────────────────────────┘
```

**Rules:**
- Background color matches severity (amber for warning, coral for critical)
- One sentence of context, one sentence of what it means
- Dismissible (user controls when to clear it)
- Maximum 1 banner visible at a time (never stack)
- No auto-dismiss — respect the user's reading speed

### 5.6 Button Variants

| Variant | Usage | Style |
|---------|-------|-------|
| Primary | Main page action (1 per page max) | Filled, `--bb-info` color |
| Secondary | Supporting actions | Outlined, neutral border |
| Ghost | Tertiary/inline actions | Text only, no border/fill |
| Destructive | Delete/remove actions | Outlined, `--bb-negative` color |

**Rules:**
- Maximum 1 primary button per view
- Buttons have minimum touch target of 44x44px
- Loading state shows spinner replacing text (button stays same size)
- Disabled state reduces opacity to 0.5

---

## 6. Interaction Guidelines

### 6.1 Feedback Rules

Every user action must produce immediate, visible feedback:

| Action | Feedback | Timing |
|--------|----------|--------|
| Button tap | Visual press state | Instant (< 50ms) |
| Form submit | Loading spinner + success toast | Start instant, complete within 3s |
| Data import | Progress indicator + completion message | Duration-dependent |
| Navigation | Page transition | < 200ms |
| Error | Inline message near the cause | Instant |

### 6.2 Intentional Friction

Apply friction to protect users from impulsive or destructive actions:

| Action | Friction Level | Implementation |
|--------|---------------|----------------|
| Delete budget | Confirmation dialog | "Remove this budget? You can recreate it anytime." |
| Unlink bank account | Confirmation dialog | "This will stop syncing. Your existing data stays." |
| Dismiss all notifications | Confirmation | "Clear all? You won't see these again." |
| Reset budget period | Confirmation | "Start fresh for this month?" |

**Friction language is supportive:** "Let's confirm" not "Are you sure?" Explain what happens, not what could go wrong.

### 6.3 Loading States

- Show skeleton screens (matching layout shape) not spinners for page loads
- Show inline spinners for button actions
- Never block the entire page — allow navigation even while loading
- If loading takes > 3 seconds, show a progress message ("Syncing your transactions...")

### 6.4 Error Handling

- Errors appear inline, near the element that caused them
- Error messages explain what happened AND what to do next
- Never show technical error codes to users
- Provide a retry action when possible
- Tone: "We couldn't connect to your bank. Check your credentials and try again." (not "Connection failed. Error 403.")

---

## 7. Page Architecture

### 7.1 Hub-and-Spoke Structure

The app uses a hub-and-spoke navigation model with a persistent bottom tab bar.

```
                    ┌─────────────────┐
                    │   Home (Hub)    │
                    │  Quick overview │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                    │
  ┌──────┴──────┐    ┌──────┴──────┐    ┌───────┴──────┐
  │   Budgets   │    │ Transactions│    │   Settings   │
  │  (Spoke)    │    │  (Spoke)    │    │   (Spoke)    │
  └─────────────┘    └─────────────┘    └──────────────┘
```

### 7.2 Page Definitions

#### Home (Hub) — `/`

**Purpose:** Answer "How am I doing right now?" in 5 seconds.

**Content (top to bottom):**
1. **Greeting + Safe-to-Spend** — "Good morning, Paul" + primary metric showing available discretionary balance
2. **Budget Status Summary** — Traffic light indicators for each active budget (compact, one line each)
3. **Recent Transactions** — Last 3-5 transactions
4. **Quick Actions** — "Sync Transactions" button

**Content NOT on this page:**
- Full transaction list (→ Transactions page)
- Budget editing (→ Budgets page)
- Charts and analytics (→ Budgets page)
- Account management (→ Settings page)
- Linked accounts list (→ Settings page)
- Debug info (removed from production)

**Max sections:** 4. If something doesn't fit, it belongs on a spoke page.

#### Budgets (Spoke) — `/budgets`

**Purpose:** Detailed budget tracking and spending analysis.

**Content (top to bottom):**
1. **Monthly Overview** — Total spent vs. total budgeted this month (progress bar)
2. **Budget Cards** — One card per budget with progress bar, remaining amount, status
3. **Spending by Category Chart** — Donut chart (existing component, moved here)
4. **Budget Configuration Link** — "Edit budgets →" link to settings

**Empty state:** "Set up your first budget to start tracking spending. [ Set Up Budgets ]"

#### Transactions (Spoke) — `/transactions`

**Purpose:** Review and understand transaction history.

**Content (top to bottom):**
1. **Income/Expense Summary** — Two KPI cards: Total Income, Total Expenses (current month)
2. **Transaction List** — Full scrollable list with date grouping
3. **Sync Action** — "Sync Transactions" button at bottom

**Future extension:** Search/filter, category filter, date range picker (post-MVP).

#### Settings (Spoke) — `/settings`

**Purpose:** Configuration and account management.

**Content (top to bottom):**
1. **Budget Configuration** — Set/edit budget limits per category (existing BudgetSettings component)
2. **Linked Accounts** — List of linked bank accounts with sync status (moved from dashboard)
3. **Notification Preferences** — Budget alert toggles
4. **Account** — Email display, sign out

### 7.3 Page Template

Every page follows the same structure:

```
┌─────────────────────────────────────┐
│  Page Title                         │
│  Subtitle/description               │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Section 1 (card)           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Section 2 (card)           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  Section 3 (card)           │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Bottom spacing for tab bar]       │
│                                     │
├─────────────────────────────────────┤
│  🏠 Home │ 📊 Budgets │ 💳 Tx │ ⚙  │
└─────────────────────────────────────┘
```

**Rules:**
- Title in top-left, always visible
- Single-column, stacked cards
- Generous spacing between cards (`--bb-space-8`)
- Bottom padding to prevent tab bar overlap
- No sticky headers (they eat vertical space)

---

## 8. Navigation

### 8.1 Bottom Tab Bar

| Tab | Label | Icon | Route |
|-----|-------|------|-------|
| 1 | Home | House icon | `/` |
| 2 | Budgets | Pie chart icon | `/budgets` |
| 3 | Transactions | List icon | `/transactions` |
| 4 | Settings | Gear icon | `/settings` |

**Rules:**
- 4 tabs (within the 3-5 recommended range for ADHD)
- Always visible, never hidden
- Active tab indicated by color change (`--bb-info`) and filled icon
- Inactive tabs use `--bb-text-secondary` color
- Tab bar has a subtle top border for visual separation
- Touch targets: minimum 44x44px per tab

### 8.2 Navigation Behavior

- Tab switches are instant (no page transitions)
- Each tab remembers its scroll position
- Active tab is highlighted — user always knows where they are
- No nested navigation within tabs (flat structure)
- Back to Home from any page via Home tab (always one tap away)

### 8.3 Auth Flow (Unchanged)

- `/login` — Standalone auth page (no tab bar)
- `/link-bank` — Standalone flow page (no tab bar)
- After login → redirect to Home (`/`)
- After bank linking → redirect to Home (`/`)

### 8.4 Legacy Route Preservation

Per project rules, legacy routes remain accessible:
- `/legacy` — OopsBudgeter dashboard
- `/analytics` — Legacy analytics
- `/achievements` — Legacy gamification
- `/legacy-index` — Legacy navigation
- `/dashboard` — Redirect to `/` (HTTP 308, unchanged)

---

## 9. Copy & Language Guidelines

### 9.1 Tone

**Supportive.** Like a patient friend who's good with money — not a financial advisor, not a parent, not a teacher. Neutral, warm, informational.

### 9.2 Rules

- **Never blame:** No "you overspent," "budget failed," or "you need to."
- **Use neutral framing:** "Your Food spending reached €200" instead of "You exceeded your Food budget."
- **Lead with what the user can do:** "Adjust your budget or review recent spending" instead of just reporting the problem.
- **Avoid jargon:** "Spending limit" instead of "budget allocation." "Sync" instead of "import pipeline."
- **Be specific:** "€30 remaining in Food" instead of "Budget is getting low."
- **Celebrate quietly:** "Nice — all budgets on track this month" instead of elaborate achievement systems.

### 9.3 Specific Rewrites

| Context | Old (Avoid) | New (Use) |
|---------|-------------|-----------|
| Over budget | "Budget exceeded" | "You've used your full Food budget. €20 over." |
| Warning | "Watch your spending" | "Food is at 85%. €30 left for this month." |
| On track | "You're doing well" | "All budgets on track." |
| No data | "No transactions found" | "Transactions will appear here after your first sync." |
| Error | "Failed to sync" | "Couldn't connect to your bank. Try again?" |
| Empty budget | "No budgets set" | "Set up a budget to start tracking your spending." |

---

## 10. Motion & Animation

### 10.1 General Rules

- All non-essential motion respects `@media (prefers-reduced-motion: reduce)`
- Animations are functional (communicate state change), never decorative
- Maximum duration: 300ms for transitions, 500ms for complex sequences
- Easing: `ease-out` for entering elements, `ease-in` for exiting

### 10.2 Allowed Animations

| Context | Animation | Duration |
|---------|-----------|----------|
| Page transition | Fade (opacity 0→1) | 150ms |
| Card appear | Fade + subtle rise (0→4px translateY) | 200ms |
| Progress bar fill | Width transition | 300ms |
| Button press | Scale 1→0.97→1 | 100ms |
| Toast enter | Slide up from bottom | 200ms |
| Toast exit | Fade out | 150ms |

### 10.3 Prohibited Animations

- Autoplay animations on page load (except skeleton screens)
- Bouncing or pulsing elements
- Parallax scrolling
- Background animations
- Animated gradients
- Any animation that loops indefinitely

---

## 11. Accessibility Requirements

### 11.1 WCAG 2.2 AA Compliance (Minimum)

- **Color contrast:** 4.5:1 for body text, 3:1 for large text and UI components
- **Touch targets:** Minimum 44x44px
- **Focus indicators:** Visible focus ring on all interactive elements
- **Keyboard navigation:** All interactive elements reachable via Tab key
- **Screen reader:** Proper ARIA labels, semantic HTML, landmark regions
- **Text resizing:** App remains functional at 200% zoom

### 11.2 ADHD-Specific Accessibility

- **`prefers-reduced-motion`:** Disable all non-essential animations
- **`prefers-color-scheme`:** Support both light and dark mode
- **No time limits:** No auto-dismissing toasts or timed interactions
- **Consistent layout:** No layout shifts during loading
- **Single-column reading order:** Content flows naturally top-to-bottom
- **Maximum line length:** 65-75 characters for body text

### 11.3 Semantic HTML Requirements

- Use `<main>`, `<nav>`, `<header>`, `<section>` landmarks
- Headings follow strict hierarchy (h1 → h2 → h3, no skipping)
- Form inputs always have associated `<label>` elements
- Interactive elements use `<button>` or `<a>`, never `<div>` with onClick
- Error messages linked to inputs via `aria-describedby`

---

## 12. Implementation Notes

### 12.1 Technology Alignment

This design system builds on BetterBudgeter's existing stack:

| Technology | Role in Design System |
|------------|----------------------|
| Tailwind CSS v4 | Utility classes for spacing, color, typography |
| shadcn/ui | Base component library (buttons, cards, inputs, dialogs) |
| CSS Custom Properties | Design tokens (colors, radii, shadows, spacing) |
| Recharts (via shadcn/ui) | Chart components |
| Sonner | Toast notifications |

### 12.2 Implementation Strategy

Design system implementation should follow this order:

1. **Design tokens** — Add CSS custom properties to `globals.css` alongside existing theme variables
2. **Typography utilities** — Add Tailwind utility classes matching the type scale
3. **Layout component** — Create a shared page shell with consistent padding, max-width, and bottom tab bar
4. **Tab navigation** — Create the bottom tab bar component
5. **Page restructuring** — Split current dashboard into Home, Budgets, Transactions pages
6. **Component updates** — Update existing components (BudgetProgressSection, SpendingByCategoryChart) to use new tokens
7. **New components** — Build any new components needed (KPI card, transaction list)
8. **Copy pass** — Review all user-facing strings against language guidelines

### 12.3 File Structure (Proposed)

```
src/
├── app/
│   ├── page.tsx                    # Home (hub) — simplified dashboard
│   ├── budgets/
│   │   └── page.tsx                # Budgets (spoke)
│   ├── transactions/
│   │   └── page.tsx                # Transactions (spoke)
│   ├── settings/
│   │   └── page.tsx                # Settings (spoke) — expanded
│   └── ... (existing routes unchanged)
│
├── components/
│   ├── layout/
│   │   ├── PageShell.tsx           # Shared page wrapper (padding, max-width)
│   │   ├── TabBar.tsx              # Bottom navigation
│   │   └── PageHeader.tsx          # Consistent page title + subtitle
│   ├── dashboard/
│   │   ├── SafeToSpendCard.tsx     # Primary metric card (new)
│   │   ├── BudgetStatusSummary.tsx # Compact budget overview (new)
│   │   ├── BudgetProgressSection.tsx # Updated with new tokens
│   │   ├── SpendingByCategoryChart.tsx # Moved to budgets page
│   │   ├── SyncTransactionsButton.tsx  # Updated styling
│   │   └── BudgetNotificationDialogs.tsx # Updated copy
│   └── ...
```

### 12.4 Migration Path

This follows BetterBudgeter's additive-first principle:

- **Phase 1:** Add design tokens and layout components (no changes to existing pages)
- **Phase 2:** Create new routes (`/budgets`, `/transactions`) alongside existing dashboard
- **Phase 3:** Restructure Home page to use hub pattern (simplified dashboard)
- **Phase 4:** Update component styling to use new design tokens
- **Phase 5:** Add tab bar navigation
- **Phase 6:** Copy review pass

At every phase, the existing app continues to work. No big-bang rewrites.

### 12.5 Constraints (Cannot Change)

- **Auth flow** remains unchanged (Supabase Auth via `/login`)
- **Legacy routes** remain accessible and unmodified
- **Library boundaries** remain strict (shadcn/ui for new code, no Radix direct imports)
- **Data architecture** unchanged (all data from `lib/db/`, dashboard consumes calculated data)
- **Package manager** remains `bun`

---

## Appendix: Design Decision Log

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Multi-page vs single-page | Multi-page hub-and-spoke | Research shows 7+ sections create cognitive overload for ADHD users |
| Color palette tone | Calm, desaturated | Bright colors overstimulate; soft tones promote focus |
| No AI predictions | Excluded | Consistently wrong for ADHD spending patterns; creates preemptive shame |
| Three-bucket budget model | Essentials/Discretionary/Savings | ADHD research supports 3 categories max for working memory |
| Bottom tab bar | 4 tabs | Within 3-5 range; always visible; predictable |
| "Safe-to-Spend" as hero metric | Primary on Home | "How much can I spend?" is the #1 ADHD user question |
| No percentage in budget cards | Show remaining amount | Absolute numbers are more actionable than percentages |
| Compassionate language | Non-judgmental throughout | Shame is the #1 driver of app abandonment |
| System fonts | No custom web fonts | Zero loading cost, platform-optimized readability |
| Single-column layout | Default everywhere | Most readable; works identically mobile and desktop |

---

*This design system is the implementation blueprint for BetterBudgeter's ADHD-optimized UI/UX. It should be read alongside [ADHD_UX_RESEARCH.md](./ADHD_UX_RESEARCH.md) for the research justification behind each decision.*
