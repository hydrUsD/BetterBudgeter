---
version: alpha
name: BetterBudgeter
description: An evidence-based, ADHD-optimized personal finance interface. Every design decision is grounded in empirical research on cognitive accessibility (W3C COGA, Neurodiversity Design System, British Dyslexia Association guidelines). The system anchors on a warm cream canvas with desaturated semantic colors — soft coral replaces red to avoid financial anxiety, soft green signals progress without overstimulation. Typography uses the system sans-serif stack for zero-cost platform-optimized readability. Layout is single-column hub-and-spoke with generous whitespace, optimized for reduced cognitive load and working memory constraints. The design philosophy is "calm over comprehensive" — fewer elements, higher signal, compassionate language throughout.

colors:
  primary: "#4878b0"
  primary-active: "#3a6898"
  primary-disabled: "#e2ecf5"
  ink: "#1e1e28"
  body: "#65657a"
  body-strong: "#1e1e28"
  muted: "#65657a"
  muted-soft: "#8a8a98"
  hairline: "#e3e3e8"
  hairline-soft: "#ededf0"
  canvas: "#faf8f2"
  surface-soft: "#f4f4f6"
  surface-card: "#ffffff"
  surface-raised: "#f4f4f6"
  surface-dark: "#141418"
  surface-dark-elevated: "#1e1e24"
  surface-dark-soft: "#28282f"
  on-primary: "#ffffff"
  on-dark: "#f2f2f5"
  on-dark-soft: "#8a8a98"
  positive: "#2d9b6b"
  positive-bg: "#ddf2e8"
  caution: "#b89038"
  caution-bg: "#f5edda"
  negative: "#c25848"
  negative-bg: "#f8e5e0"
  info: "#4878b0"
  info-bg: "#e2ecf5"
  category-essentials: "#5578a5"
  category-discretionary: "#3a9888"
  category-savings: "#2d9b6b"
  category-food: "#a88a50"
  category-transport: "#4a8b9e"
  category-entertainment: "#8868b0"
  category-other: "#88888e"

typography:
  hero:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 36px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.5px
  title-lg:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: -0.3px
  title-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 22px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  title-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  body-md:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0.01em
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.01em
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0.02em
  button:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1
    letterSpacing: 0.01em
  mono:
    fontFamily: "ui-monospace, 'SF Mono', 'Cascadia Code', Menlo, monospace"
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: 0

rounded:
  sm: 6px
  md: 10px
  lg: 14px
  xl: 20px
  pill: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  section: 48px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 44px
  button-primary-active:
    backgroundColor: "{colors.primary-active}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
  button-primary-disabled:
    backgroundColor: "{colors.primary-disabled}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
  button-secondary:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 44px
    borderColor: "{colors.hairline}"
    borderWidth: 1px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    padding: 12px 20px
    height: 44px
  button-destructive:
    backgroundColor: transparent
    textColor: "{colors.negative}"
    typography: "{typography.button}"
    rounded: "{rounded.md}"
    padding: 12px 20px
    height: 44px
    borderColor: "{colors.negative}"
    borderWidth: 1px
  kpi-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
    shadow: 0 1px 2px rgba(0,0,0,0.04)
  budget-progress-card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
  transaction-item:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.ink}"
    padding: 16px 20px
    borderBottom: 1px solid {colors.hairline}
  alert-banner:
    rounded: "{rounded.md}"
    padding: 16px
  tab-bar:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.muted}"
    activeColor: "{colors.primary}"
    height: 56px
    borderTop: 1px solid {colors.hairline}
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    height: 56px
---

# BetterBudgeter — Design Language

> Every design decision in BetterBudgeter is grounded in empirical research on cognitive accessibility. This is not a brand aesthetic — it is an evidence-based system optimized for neurodiverse users, particularly those with ADHD, while benefiting all users through the curb-cut effect.

## Overview

BetterBudgeter is a personal finance tracker that prioritizes calm, clarity, and compassion. The interface is designed for users whose executive function may be impaired by ADHD, anxiety, or cognitive fatigue — conditions that conventional budgeting apps actively worsen through information overload, judgmental language, and anxiety-inducing color choices.

### Design Principles

Five principles guide every design decision, in priority order:

**P1 — Calm Over Comprehensive.** Show only what the user needs right now. Every element must earn its place on screen. The goal is a financial tool that feels calm, not overwhelming. (W3C COGA §4.6.3: "Avoid Too Much Content")

**P2 — Compassion Over Correction.** Never make the user feel bad about their financial decisions. Frame setbacks as normal, celebrate progress quietly, and treat overspending as information — not failure. (Research shows shame is the primary driver of financial app abandonment.)

**P3 — Clarity Over Cleverness.** Prefer explicit, readable patterns over compact, clever ones. A stressed user should understand the interface without explanation. (W3C COGA §4.3: "Make It Easy to Find the Most Important Tasks and Features")

**P4 — Consistency Over Customization.** The same pattern should look and behave the same everywhere. Predictability reduces cognitive load. (W3C COGA §4.2: "Use a Consistent Visual Design")

**P5 — Progressive Over Prescriptive.** Start simple, let users discover complexity. Smart defaults for the common case. Advanced options available but never required.

### Visual Identity

The visual language is warm, quiet, and structured. A subtle cream canvas (inspired by the humanist warmth of Anthropic's Claude design language) replaces the sterile white of typical fintech apps, reducing eye strain and creating a sense of comfort rather than clinical efficiency. Colors are intentionally desaturated — soft coral instead of alarm-red, muted amber instead of traffic-light yellow. The overall impression should be a patient friend who's good with money, not a stern financial advisor.

---

## Colors

**Authoritative color values are in oklch.** The hex values in the YAML frontmatter above are sRGB approximations for tooling compatibility. oklch (Oklab Lightness-Chroma-Hue) provides perceptually uniform lightness — equal numeric steps produce equal visual changes — making it ideal for systematic accessible palette design. All implementation should use the oklch values below.

### Canvas & Surface

The foundation layer uses a warm cream canvas in light mode and cool-tinted darks in dark mode. The asymmetry is intentional: warm light surfaces reduce cognitive fatigue during daytime use (NDS recommendation), while cool dark surfaces reduce eye strain at night (dark mode research).

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bb-bg` | `oklch(0.985 0.008 80)` | `oklch(0.155 0.005 280)` | Page background — warm cream canvas |
| `--bb-surface` | `oklch(1 0 0)` | `oklch(0.195 0.005 280)` | Card/container background |
| `--bb-surface-raised` | `oklch(0.975 0.002 280)` | `oklch(0.235 0.006 280)` | Elevated surface (hover, active) |
| `--bb-border` | `oklch(0.91 0.004 280)` | `oklch(0.28 0.006 280)` | Borders and dividers |

**Design rationale:** The light mode canvas shifts from near-white to warm cream (`oklch(0.985 0.008 80)` — hue 80° is in the yellow-orange range). This is a deliberate departure from the cool, clinical whites common in fintech. Research from the Neurodiversity Design System recommends warm, slightly off-white backgrounds to reduce cognitive fatigue. The British Dyslexia Association similarly advises against pure white backgrounds. The warm canvas also creates a natural resting contrast with the white cards sitting on top of it, establishing visual hierarchy without relying on shadows.

### Text

| Token | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| `--bb-text` | `oklch(0.205 0.006 280)` | `oklch(0.965 0.002 280)` | Primary text |
| `--bb-text-secondary` | `oklch(0.48 0.012 280)` | `oklch(0.66 0.012 280)` | Secondary/muted text |

Text colors maintain a cool tint (hue 280°) for high contrast against the warm canvas. The primary text achieves well above the WCAG 2.2 AA minimum of 4.5:1 contrast ratio on both the cream canvas and white card surfaces.

### Semantic Colors (Financial)

These colors carry consistent meaning across the entire app. They are the emotional backbone of the interface.

| Token | Light Mode | Dark Mode | Meaning |
|-------|-----------|-----------|---------|
| `--bb-positive` | `oklch(0.62 0.14 155)` | `oklch(0.72 0.14 155)` | Income, on-track, success |
| `--bb-positive-bg` | `oklch(0.95 0.04 155)` | `oklch(0.22 0.04 155)` | Positive background tint |
| `--bb-caution` | `oklch(0.72 0.14 75)` | `oklch(0.78 0.14 75)` | Warning, approaching limit |
| `--bb-caution-bg` | `oklch(0.95 0.04 75)` | `oklch(0.22 0.04 75)` | Caution background tint |
| `--bb-negative` | `oklch(0.58 0.16 25)` | `oklch(0.68 0.18 25)` | Expense, over-budget |
| `--bb-negative-bg` | `oklch(0.95 0.04 25)` | `oklch(0.22 0.04 25)` | Negative background tint |
| `--bb-info` | `oklch(0.60 0.12 245)` | `oklch(0.70 0.12 245)` | Primary action, info highlights |
| `--bb-info-bg` | `oklch(0.95 0.03 245)` | `oklch(0.22 0.03 245)` | Info background tint |

**Design rationale:** We avoid bright red (`hue ~25°, high chroma`) because research on color psychology in financial contexts shows that red triggers anxiety and shame responses (Elliot & Maier, 2014). Our "negative" color is a soft coral — same hue family (25°) but with reduced chroma (0.16 vs typical 0.25+) and shifted lightness. It communicates "attention needed" without triggering a stress response. The positive green and caution amber follow the same principle: familiar semantic associations, but desaturated to maintain a calm visual tone. The Neurodiversity Design System explicitly recommends low-saturation palettes to reduce cognitive overstimulation.

**Dark mode approach:** Semantic colors increase lightness by ~0.10 in dark mode to maintain consistent contrast ratios against dark surfaces. Background tints shift to low-lightness versions (0.22) of the same hue/chroma. This ensures the color relationships (and their emotional meaning) remain identical across modes.

### Budget Category Colors

For charts and category indicators. These are intentionally less saturated than typical Tailwind colors or standard charting palettes.

| Category | oklch Value | Visual |
|----------|------------|--------|
| Essentials | `oklch(0.62 0.10 245)` | Soft blue |
| Discretionary | `oklch(0.65 0.12 165)` | Soft teal |
| Savings | `oklch(0.62 0.14 155)` | Soft green |
| Food | `oklch(0.68 0.10 55)` | Warm sand |
| Transport | `oklch(0.62 0.10 200)` | Steel blue |
| Entertainment | `oklch(0.65 0.12 290)` | Soft violet |
| Other | `oklch(0.58 0.02 280)` | Neutral gray |

All category colors sit at similar lightness values (0.58–0.68) to ensure no single category dominates the chart visually. Chroma values range from 0.02 (neutral) to 0.14 (savings/positive), keeping the overall palette calm. Hues are distributed across the color wheel to ensure distinguishability while maintaining the desaturated aesthetic.

---

## Typography

### Font Strategy

BetterBudgeter uses the system sans-serif stack exclusively:

```
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif
```

**Why system fonts:** The British Dyslexia Association recommends sans-serif typefaces with clear character differentiation. System fonts meet this requirement while loading instantly (zero network cost) and feeling native to each platform. Research from the Neurodiversity Design System confirms that the primary readability benefit comes from spacing and sizing, not font shape — making the case for system fonts over custom typefaces even stronger for an accessibility-focused app.

### Type Scale

| Token | Size | Line Height | Weight | Letter Spacing | Usage |
|-------|------|-------------|--------|----------------|-------|
| `--bb-text-3xl` | 36px | 1.2 | 700 | -0.5px | Hero numbers (balance display) |
| `--bb-text-2xl` | 28px | 1.3 | 700 | -0.3px | Page titles |
| `--bb-text-xl` | 22px | 1.4 | 600 | 0 | Section headings |
| `--bb-text-lg` | 18px | 1.5 | 500 | 0 | Emphasized body, labels |
| `--bb-text-base` | 16px | 1.6 | 400 | +0.01em | Body text (minimum) |
| `--bb-text-sm` | 14px | 1.5 | 400 | +0.01em | Secondary text |
| `--bb-text-xs` | 12px | 1.5 | 400 | +0.02em | Captions, timestamps |

### Typography Rules

- **Minimum body text: 16px.** Never smaller for primary content. This is a hard constraint, not a guideline. (W3C COGA, NDS)
- **Line height: 1.5× minimum** for body text. Our body text uses 1.6× for additional breathing room. (ADHD readability research)
- **Letter spacing: slightly positive** for body (+0.01em) and captions (+0.02em). The NDS recommends positive tracking for improved readability, especially at smaller sizes. Headings use neutral or negative tracking for visual density.
- **Paragraph length: 65–75 characters** per line maximum. Enforced via `max-width: 768px` on the content container.
- **Emphasis: semibold (600) or color.** Never italics for emphasis — italics reduce readability for dyslexic users (BDA guideline).
- **Alignment: left-aligned only.** Never justified text — it creates uneven word spacing that disrupts reading flow. (BDA, NDS)

---

## Layout

### Spacing System

Built on a 4px grid with a primary rhythm of 8px:

| Token | Value | Usage |
|-------|-------|-------|
| `--bb-space-1` | 4px | Tight internal spacing (icon-to-text) |
| `--bb-space-2` | 8px | Default internal padding |
| `--bb-space-3` | 12px | Between related elements |
| `--bb-space-4` | 16px | Standard gap between components |
| `--bb-space-5` | 20px | Card internal padding |
| `--bb-space-6` | 24px | Between sections within a page |
| `--bb-space-8` | 32px | Between major page sections |
| `--bb-space-10` | 40px | Page-level vertical rhythm |
| `--bb-space-12` | 48px | Large section separation |

**Research basis:** W3C COGA §4.4.10 "Use White Spacing" explicitly recommends generous whitespace for users with cognitive disabilities. Whitespace is not wasted space — it is a cognitive accessibility tool that reduces visual crowding and helps users parse content structure.

### Layout Constraints

| Property | Value | Rationale |
|----------|-------|-----------|
| Max content width | 768px | Prevents lines exceeding 75 characters (readability) |
| Page padding | 16px mobile, 24px tablet+ | Breathing room at edges |
| Card padding | 20px | Generous internal space |
| Card gap | 16px | Clear separation between cards |
| Section gap | 32px | Visual breathing room between sections |

### Layout Patterns

**Single-column (default).** All pages use a single-column layout with stacked cards. This is the most readable pattern and works identically on mobile and desktop. No complex grids — multi-column dashboard layouts create cognitive overload. Every page reads top-to-bottom, like a document.

**Two-column grid (limited use).** Only for paired summary cards (e.g., Income + Expenses side-by-side). Stacks to single column on mobile (< 640px).

### Page Architecture

Hub-and-spoke navigation with a persistent bottom tab bar (4 tabs: Home, Budgets, Transactions, Settings). Research supports 3–5 navigation items for ADHD users — staying within working memory limits. Each page has a maximum of 4 content sections. If something doesn't fit, it belongs on a spoke page, not squeezed into the hub.

---

## Elevation & Depth

BetterBudgeter uses a deliberately flat elevation system. Depth is communicated primarily through background color shifts and subtle borders, not heavy drop shadows.

### Shadow Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--bb-shadow-sm` | `0 1px 2px oklch(0 0 0 / 0.04)` | Subtle card lift |
| `--bb-shadow-md` | `0 2px 8px oklch(0 0 0 / 0.06)` | Elevated card, dropdown |
| `--bb-shadow-lg` | `0 4px 16px oklch(0 0 0 / 0.08)` | Modal, dialog |

### Elevation Strategy

The primary elevation hierarchy is: `canvas` → `surface` (cards) → `surface-raised` (interactive states). This is communicated through background color, not shadow intensity. The warm cream canvas creates a natural "depth" effect — white cards appear to float above the cream background without needing visible shadows.

Shadows are used sparingly:
- `shadow-sm` on cards for a subtle lift effect
- `shadow-md` only on dropdowns and popovers (elements that genuinely float)
- `shadow-lg` only on modals and dialogs (full overlays)

**Why minimal shadows:** Heavy shadows add visual noise and increase cognitive load. The combination of background-color elevation + subtle borders provides clear hierarchy with less visual complexity. This approach aligns with the NDS recommendation to reduce decorative visual elements.

---

## Shapes

BetterBudgeter uses softer border radii than typical SaaS products:

| Token | Value | Usage |
|-------|-------|-------|
| `--bb-radius-sm` | 6px | Small elements (badges, chips) |
| `--bb-radius-md` | 10px | Inputs, buttons |
| `--bb-radius-lg` | 14px | Cards, containers |
| `--bb-radius-xl` | 20px | Large panels, modals |
| `--bb-radius-pill` | 9999px | Pill-shaped badges, tags |

**Research basis:** Rounded shapes are perceived as friendlier and less complex than sharp corners (Bar & Neta, 2006 — "Humans Prefer Curved Visual Objects"). In a financial context — where anxiety is inherent — softer radii help counteract the emotional weight of money management. Our radii are slightly larger than the industry standard (Cal.com uses 4–12px, most SaaS products use 4–8px) to maximize this calming effect without appearing childish.

---

## Components

### KPI Card

Displays a single financial metric prominently. One metric per card — never combine metrics.

- Hero number uses `{typography.hero}` for the primary metric (balance) or `{typography.title-lg}` for secondary
- Label above number in `{typography.body-sm}`, description below in `{typography.caption}`
- Semantic background tint communicates status: `{colors.positive-bg}`, `{colors.caution-bg}`, `{colors.negative-bg}`
- Card uses `{rounded.lg}` with `{spacing.lg}` internal padding

### Budget Progress Card

Shows spending progress for a single budget category.

**Visual states:**
- On Track (< 80%): `{colors.positive}` progress bar, neutral text
- Warning (80–99%): `{colors.caution}` progress bar, "Getting close" text
- Over Budget (≥ 100%): `{colors.negative}` progress bar, "Over by €X" text (NOT "Budget failed")

**Rules:** Remaining amount is the primary focus, not percentage. No percentage in default view — reduces number overload. Language is informational, never judgmental.

### Transaction Item

- Merchant name is primary identifier, amount right-aligned
- Amount colored by type: `{colors.positive}` for income, `{colors.negative}` for expense
- Category and date as secondary line in `{typography.caption}`
- No icons in default list view (reduces visual noise)
- Consistent height per item

### Empty State

Guides user toward first action. Never a blank screen.

- Positive framing: "Start by..." not "You have no..."
- Exactly one call-to-action button using `{components.button-primary}`
- Short explanation (2 sentences max)
- Dashed border on card to indicate placeholder state

### Alert Banner

For budget warnings and important status messages.

- Background color matches severity: `{colors.caution-bg}` for warning, `{colors.negative-bg}` for critical
- One sentence of context, one sentence of what it means
- Dismissible — user controls when to clear it
- Maximum 1 banner visible at a time
- No auto-dismiss — respect the user's reading speed (W3C COGA §4.6.1: "Limit Interruptions")

### Buttons

| Variant | Style | Usage |
|---------|-------|-------|
| Primary | `{components.button-primary}` | Main page action (1 per page max) |
| Secondary | `{components.button-secondary}` | Supporting actions |
| Ghost | `{components.button-ghost}` | Tertiary/inline actions |
| Destructive | `{components.button-destructive}` | Delete/remove actions |

All buttons have a minimum touch target of 44×44px (WCAG 2.2 AA). Loading state shows a spinner replacing text while button stays the same size. Disabled state reduces opacity to 0.5.

### Tab Bar

Persistent bottom navigation. 4 tabs (Home, Budgets, Transactions, Settings). Active tab uses `{colors.primary}` with filled icon. Inactive tabs use `{colors.muted}`. Touch targets: minimum 44×44px per tab. Always visible, never hidden — users should always know where they are.

---

## Do's and Don'ts

### Color

- **Do** use soft coral (`--bb-negative`) for overspending indicators.
  *Red triggers anxiety responses in financial contexts. (Elliot & Maier, 2014)*
- **Don't** use bright red, even for critical errors. The soft coral at hue 25° with chroma 0.16 communicates urgency without panic.

- **Do** use semantic background tints to communicate status at a glance.
- **Don't** rely on color alone — always pair color with text labels. (WCAG 2.2: Use of Color)

### Typography

- **Do** maintain 16px minimum for body text. Use `--bb-text-xs` (12px) only for timestamps and captions that are not essential reading.
- **Don't** use italics for emphasis. Use semibold (600) or semantic color instead. *(British Dyslexia Association guideline)*

- **Do** left-align all text.
- **Don't** use justified or center-aligned body text. Justified text creates uneven word spacing that disrupts reading flow. *(BDA, NDS)*

### Layout

- **Do** limit each page to 4 content sections maximum.
  *7+ visible sections create cognitive overload for ADHD users. (ADHD_UX_RESEARCH.md §7)*
- **Don't** create multi-column dashboard layouts. Single-column reads top-to-bottom like a document.

- **Do** use generous whitespace between sections (32px+).
  *Whitespace is a cognitive accessibility tool, not wasted space. (W3C COGA §4.4.10)*
- **Don't** pack elements tightly to "fit more on screen."

### Language

- **Do** frame overspending as information: "Your Food spending reached €200."
- **Don't** use judgmental language: "You exceeded your budget" or "Budget failed."

- **Do** lead with what the user can do: "Adjust your budget or review recent spending."
- **Don't** just report problems without offering a path forward.

- **Do** celebrate quietly: "All budgets on track this month."
- **Don't** use elaborate achievement systems, streaks, or gamification. *(Research shows these are counterproductive for ADHD users with inconsistent patterns.)*

### Motion

- **Do** respect `@media (prefers-reduced-motion: reduce)` for all non-essential animation.
- **Don't** use bouncing, pulsing, parallax, or looping animations. *(WCAG 2.2 + ADHD research)*

- **Do** keep transitions under 300ms. Use `ease-out` for entering elements, `ease-in` for exiting.
- **Don't** auto-dismiss toasts or notifications. Respect the user's reading speed. *(W3C COGA §4.6.1)*

### Interaction

- **Do** use confirmation dialogs for destructive actions with supportive language: "Remove this budget? You can recreate it anytime."
- **Don't** ask "Are you sure?" — explain what happens, not what could go wrong.

- **Do** show skeleton screens for page loads.
- **Don't** block the entire page with a loading spinner.

---

## Motion & Animation

### General Rules

All non-essential motion respects `@media (prefers-reduced-motion: reduce)`. Animations are functional (communicate state change), never decorative. Maximum duration: 300ms for transitions, 500ms for complex sequences. Easing: `ease-out` for entering elements, `ease-in` for exiting.

### Allowed Animations

| Context | Animation | Duration |
|---------|-----------|----------|
| Page transition | Fade (opacity 0→1) | 150ms |
| Card appear | Fade + subtle rise (0→4px translateY) | 200ms |
| Progress bar fill | Width transition | 300ms |
| Button press | Scale 1→0.97→1 | 100ms |
| Toast enter | Slide up from bottom | 200ms |
| Toast exit | Fade out | 150ms |

### Prohibited Animations

- Autoplay animations on page load (except skeleton screens)
- Bouncing or pulsing elements
- Parallax scrolling
- Background animations
- Animated gradients
- Any animation that loops indefinitely

---

## Copy & Language

### Tone

Supportive. Like a patient friend who's good with money — not a financial advisor, not a parent, not a teacher. Neutral, warm, informational.

### Rules

- **Never blame.** No "you overspent," "budget failed," or "you need to."
- **Neutral framing.** "Your Food spending reached €200" instead of "You exceeded your Food budget."
- **Lead with action.** "Adjust your budget or review recent spending" instead of just reporting the problem.
- **Avoid jargon.** "Spending limit" instead of "budget allocation." "Sync" instead of "import pipeline."
- **Be specific.** "€30 remaining in Food" instead of "Budget is getting low."
- **Celebrate quietly.** "All budgets on track this month" instead of elaborate achievement systems.

### Specific Rewrites

| Context | Avoid | Use Instead |
|---------|-------|-------------|
| Over budget | "Budget exceeded" | "You've used your full Food budget. €20 over." |
| Warning | "Watch your spending" | "Food is at 85%. €30 left for this month." |
| On track | "You're doing well" | "All budgets on track." |
| No data | "No transactions found" | "Transactions will appear here after your first sync." |
| Error | "Failed to sync" | "Couldn't connect to your bank. Try again?" |
| Empty budget | "No budgets set" | "Set up a budget to start tracking your spending." |

---

## Accessibility

### WCAG 2.2 AA Compliance

- **Color contrast:** 4.5:1 for body text, 3:1 for large text and UI components
- **Touch targets:** Minimum 44×44px
- **Focus indicators:** Visible focus ring on all interactive elements
- **Keyboard navigation:** All interactive elements reachable via Tab key
- **Screen reader:** Proper ARIA labels, semantic HTML, landmark regions
- **Text resizing:** App remains functional at 200% zoom

### ADHD-Specific Requirements

- **`prefers-reduced-motion`:** Disable all non-essential animations
- **`prefers-color-scheme`:** Support both light and dark mode
- **No time limits:** No auto-dismissing toasts or timed interactions
- **Consistent layout:** No layout shifts during loading
- **Single-column reading order:** Content flows naturally top-to-bottom
- **Maximum line length:** 65–75 characters for body text

### Semantic HTML

- Use `<main>`, `<nav>`, `<header>`, `<section>` landmarks
- Headings follow strict hierarchy (h1 → h2 → h3, no skipping)
- Form inputs always have associated `<label>` elements
- Interactive elements use `<button>` or `<a>`, never `<div>` with onClick
- Error messages linked to inputs via `aria-describedby`

---

## Research Citations

Every design decision in this document is traceable to empirical research. Key sources:

| Source | Relevance |
|--------|-----------|
| W3C COGA — "Making Content Usable" (2021) | 8 objectives, ~50 patterns for cognitive accessibility. Directly informs layout, whitespace, animation, and content rules. |
| Neurodiversity Design System (neurodiversity.design) | Principles for typography, color, and interface design optimized for neurodiverse users. Informs our warm canvas, letter-spacing, and low-saturation palette. |
| British Dyslexia Association — Style Guide | Sans-serif fonts, no italics for emphasis, left-alignment, generous line-height. All adopted. |
| Elliot & Maier (2014) — Color Psychology | Red triggers anxiety/avoidance responses. Basis for our soft coral over bright red. |
| Bar & Neta (2006) — Curved Visual Objects | Humans prefer rounded shapes, perceive them as friendlier. Basis for our softer border radii. |
| BetterBudgeter ADHD_UX_RESEARCH.md | Internal research document covering envelope budgeting, three-bucket model, hub-and-spoke architecture, shame-driven abandonment. |

---

*This DESIGN.md follows Google's DESIGN.md specification (Apache 2.0, 2026). YAML frontmatter provides machine-readable tokens with sRGB hex approximations for tooling compatibility. The prose sections above contain the authoritative oklch color values and evidence-based rationale for every design decision. Read alongside [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for full implementation tokens and [ADHD_UX_RESEARCH.md](./ADHD_UX_RESEARCH.md) for the underlying research.*
