# ADHD-Friendly UI/UX Research Report

**Created:** 2026-04-16
**Purpose:** Comprehensive research to inform BetterBudgeter's UI/UX redesign for ADHD users
**Status:** Complete — ready for design system planning
**Task Type:** Analysis Task (no code changes)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Historical Budgeting Methods](#2-historical-budgeting-methods)
3. [The Digital Transition: What Was Gained and Lost](#3-the-digital-transition)
4. [Modern Budgeting App UX Patterns](#4-modern-budgeting-app-ux-patterns)
5. [ADHD and Financial Management](#5-adhd-and-financial-management)
6. [What ADHD Users Need from Budgeting Tools](#6-what-adhd-users-need)
7. [UI/UX Design Principles for ADHD](#7-ui-ux-design-principles-for-adhd)
8. [Inclusive Design Systems](#8-inclusive-design-systems)
9. [The Curb Cut Effect: Designing for Everyone](#9-the-curb-cut-effect)
10. [Implications for BetterBudgeter](#10-implications-for-betterbudgeter)
11. [Sources](#11-sources)

---

## 1. Executive Summary

This research reveals a fundamental tension in personal finance tools: **methods that worked historically relied on friction and tactile engagement, while modern apps removed that friction in pursuit of convenience — losing awareness in the process.**

For ADHD users specifically, current digital budgeting tools fail on two fronts: they assume neurotypical executive function (plan, track, review, adjust) and they removed the psychological guardrails (tangible feedback, hard constraints, intentional allocation) that constrained spending without relying on willpower.

**Key findings that should drive BetterBudgeter's redesign:**

- Three broad budget categories (Essentials, Discretionary, Savings) outperform 20+ fine-grained categories for ADHD users
- Shame is the primary driver of app abandonment — every design decision must reduce it
- Automation should handle the tedious parts; intentionality should be preserved for allocation decisions
- Progressive disclosure (hub-and-spoke architecture) beats both "everything visible" dashboards and overly hidden navigation
- The "curb cut effect" means ADHD-optimized design improves the experience for all users
- AI predictions are actively harmful for users with irregular, ADHD-driven spending patterns
- Non-judgmental language throughout the app is non-negotiable

---

## 2. Historical Budgeting Methods

Understanding what came before digital tools reveals what made budgeting work psychologically.

### 2.1 Envelope Budgeting (Physical Cash)

Physical cash envelopes involved dividing income into labeled envelopes for each spending category. When an envelope was empty, spending in that category stopped.

**Why it worked:** The method combined multiple psychological elements — the "pain of paying" (physically handing over cash activates the brain's loss/pain center more strongly than digital payments), clear visual feedback, and hard constraints. Research shows people spend 10-15% less when paying with cash compared to cards. The physical act of watching an envelope empty created immediate spending awareness.

**Cognitive demands:** Very low. No math, no tracking, no apps. The system enforced discipline through design, not willpower.

**Key insight for BetterBudgeter:** The envelope method's effectiveness wasn't about cash being "special" — it was about sensory feedback, hard constraints, and intentional allocation that made spending consequential and visible.

### 2.2 Ledger/Journal Tracking

Manual logging of every transaction in a physical book with running balances.

**Why it worked for some:** The ritual of recording transactions created intentionality. You couldn't mindlessly spend if you knew you'd have to write it down. The act of recording is itself financial education.

**Why it failed for ADHD:** Extremely high cognitive demands — sustained attention, calculation, organization, and consistency. Exactly the executive functions ADHD impairs.

### 2.3 "Pay Yourself First" (1920s Origin)

Originating from George Samuel Clason's "The Richest Man in Babylon" (1926), this method allocates a fixed percentage of income to savings before spending on anything else.

**Why it worked:** It turned savings from a choice (requiring willpower each month) into a default (automatic transfer). This is behavioral design before the term existed. One decision, then automation handles the rest.

**Key insight for BetterBudgeter:** One-time decisions that become automatic are the gold standard for ADHD-friendly financial design.

### 2.4 Zero-Based Budgeting (1970s)

Developed by Peter Pyhrr at Texas Instruments — every dollar of income must be allocated to a specific purpose before the month begins (Income - Allocations = $0).

**Why it worked:** It removed ambiguity. Every purchase was pre-authorized against planned spending. For organized people, this eliminated spending anxiety.

**Why it's hard for ADHD:** Requires detailed upfront planning, forecasting, and holding multiple categories in working memory simultaneously.

### 2.5 The 50/30/20 Rule (2005)

Popularized by Elizabeth Warren and Amelia Warren Tyagi: 50% to needs, 30% to wants, 20% to savings/debt.

**Why it works:** Radically simple. Three buckets instead of dozens of categories. Memorable and teachable. Respects the cognitive limits of most people.

**Key insight for BetterBudgeter:** This is the ancestor of the "three-bucket system" that ADHD research consistently recommends.

### 2.6 Spreadsheet-Based Tracking (1990s-2000s)

Excel templates with manual data entry, formulas, and charts.

**Why it represented a middle ground:** More automated than ledgers, fully under user control. For people with time and spreadsheet skills, this provided unmatched flexibility.

**Why it failed for ADHD:** Still required manual data entry, formula maintenance, and technical skill. One formula error breaks trust in the entire system.

---

## 3. The Digital Transition: What Was Gained and Lost

### 3.1 What Early Digital Tools Changed (Quicken 1984, MS Money 1991, Mint 2006)

**Problems solved by digital budgeting:**

- Manual tracking burden eliminated
- Math errors removed through automated calculations
- Delayed visibility replaced with real-time balance updates
- Organization chaos replaced with searchable transaction history
- Reconciliation tedium automated
- Hours of monthly work reduced to minutes

### 3.2 What Was Lost

**Loss of tactile feedback:** Research shows that spending cash activates the anterior insula (the brain's loss/pain center) more strongly than digital payments. With tap-to-pay, every connection point between purchase and payment is eliminated — the brain receives the dopamine reward of acquisition instantly, but the corresponding loss signal arrives hours or days later. Studies show people spend 12-18% more with cards than cash.

**Loss of awareness through automation:** A 2024 study found that people who manually log expenses develop significantly more awareness of their spending than people who use automatic tracking. Automated tracking is convenient but linked to lower attention and less financial self-awareness.

**Cognitive overload from notifications:** Research shows frequent notifications increase cognitive load by 37% and reduce task completion efficiency by 28%. Users who receive more than 10 notifications per hour stop engaging, with response rates dropping by 52%.

**False precision from auto-categorization:** Generic categories like "Shopping" or "Miscellaneous" hide where money actually goes. Users trust defaults without verification, creating a "garbage in, garbage out" feedback loop.

**Friction-free spending:** One-click purchasing boosted conversion rates by 5-10%. The removal of friction encourages impulse purchases and makes spending unconscious.

### 3.3 The Core Paradox

Pre-digital methods worked best when they created friction and required engagement. They succeeded not despite their limitations, but because of them. Digital automation gained convenience but lost awareness.

**For BetterBudgeter:** The goal is to automate the tedious parts (calculations, bank connections) while restoring the intentional, visual, friction-based elements that create spending awareness without requiring willpower.

---

## 4. Modern Budgeting App UX Patterns

### 4.1 App-by-App Analysis

**YNAB (You Need A Budget):** Emphasizes intentional money allocation ("give every dollar a job"). Clean, functional design focused on clarity over decoration. Category-focused hierarchy that guides allocation decisions. Works well for ADHD users who can sustain the initial setup because of its strong community and empowering philosophy.

**Monarch Money:** "Density-first" approach with a highly customizable modular dashboard (draggable widgets). Users control what appears. Uses Sankey diagrams showing how income flows into categories — cited as a "delight factor" among data-focused users. Clean, modern design with whitespace.

**Copilot Money:** Premium, native iOS design. Every screen feels custom and polished. Cash Flow feature using Swift Charts. All data kept locally for responsive interactions. Design gap between Copilot and competitors is immediately noticeable. Described as "the most beautifully designed personal finance app available."

**Goodbudget:** Digital envelope system. Color-coded envelope balances with visual progress bars. Green for money remaining, red for over-budget. Simple yet distinctive. Closest to the historical envelope method.

**PocketGuard:** Hands-off approach with a single focus metric: "In My Pocket" (how much disposable income remains). Minimalist, data-focused without clutter. The simplest mainstream approach.

**Quicken Simplifi:** Comprehensive financial view with 12-month forecasting (only personal finance app offering this). Strong for savings goal visualization.

### 4.2 Common Patterns

**Overview vs. Detail tension:** Modern apps solve this through progressive disclosure — a headline layer shows essentials ("How much have I spent? What's left? What needs attention?"), with details available in 2-3 clicks. Widget-based dashboards (Monarch) let users choose which details matter.

**Navigation:** Most modern apps use a tab bar (3-5 items) on mobile combined with optional sidebar for secondary features. The emerging model is hub-and-spoke: one central dashboard with navigation to focused subpages.

**Empty states:** Best practices include positive framing ("Start by adding data" not "You have no data"), a short headline, clear explanation, and a call-to-action. Empty states are prime UX real estate for guidance. The anti-pattern is asking users to complete everything upfront (connect accounts, categorize expenses, set budgets, configure preferences) — this causes immediate decision fatigue and abandonment.

**Charts:** Pie/donut charts show spending distribution. Bar charts show spending over time. Sankey diagrams (emerging) show money flow. Heat maps show spending intensity. The trend is moving beyond pie charts alone toward multiple visualization options.

**Notifications:** Two failure modes identified — too late (after overspending, feels like guilt) and too early (feels like false alarm, leads to ignoring all alerts). The better approach: start with 1-2 critical alerts only, build gradually, time alerts to decision moments, tie to behavior change rather than data reporting.

### 4.3 Problems Modern Apps Created

**Dashboard fatigue:** Users see 20+ numbers on a home screen, unclear which matter. Root cause: designers show "everything relevant" rather than "only what matters right now."

**Over-categorization burden:** Apps forcing 30+ spending categories create "budget burnout." Every transaction becomes a micro-decision. The better approach: 4-6 broad buckets (Fixed Costs, Flexible Necessities, Discretionary Fun, Financial Goals, Irregular Expenses).

**Notification fatigue:** Constant alerts from multiple apps. Users mute everything, losing the feedback entirely.

**AI predictions that fail:** Traditional AI assumes constant income and predictable patterns. Fails catastrophically for freelancers, gig workers, commission-based income, and anyone with variable expenses. AI cannot create motivation at the moment of spending decision.

**App fatigue:** Instead of feeling more in control, users report drowning in notifications, jumping between platforms, and spending more time managing apps than managing finances.

---

## 5. ADHD and Financial Management

### 5.1 Core Challenges (The Root Causes)

**Executive function deficits:** ADHD impairs the planning, organization, working memory, and impulse control required for financial management. Working memory is "unreliable for numbers" — users forget bill due dates, lose track of balances, and cannot reliably remember spending across categories.

**Task initiation problems:** Financial tasks are "boring" or "unclear," and the ADHD brain runs on an interest-based nervous system where dopamine determines motivation, not willpower. Opening a budgeting app feels like confronting failure, which triggers shame and avoidance.

**Impulsive spending:** Adults with ADHD are 4x more likely to frequently buy things on impulse. Shopping provides a quick dopamine hit. By day's end, decision fatigue makes rational financial choices nearly impossible. Many impulsive purchases happen in the evening.

**Time blindness:** The ADHD brain lives in the "Right Now." Planning for future goals feels abstract and unreal. When the future feels unreal, "pay off debt later" always loses to "buy the thing now." Minimum payments feel fine because accumulating interest is a "later" problem.

**Emotional dysregulation and shame:** Financial shame is paralyzing. "Admitting you have money issues can be harder than admitting you have ADHD." When finances become disorganized, shame triggers avoidance. The more you avoid, the worse it becomes. Individuals with ADHD are 2x as likely to experience financial anxiety.

**The hyperfocus-burnout cycle:** ADHD doesn't mean constant lack of focus — it means inconsistent focus driven by interest. Budgeting apps work brilliantly for the first week (novelty spike), then interest drops off a cliff. Hyperfocus leads to overcommitment, then nervous system exhaustion, then complete abandonment.

### 5.2 The "ADHD Tax"

The extra costs incurred due to ADHD symptoms: late fees from forgotten bills, replacing lost items, unused subscriptions that were never cancelled, overdraft charges from miscounted balances, impulse purchases that can't be returned. Current digital tools don't address the root cause — executive dysfunction.

### 5.3 What Fails in Current Apps

**Shame-inducing design:** Apps that show what you did wrong after the fact. Notifications like "You've exceeded your shopping budget" don't build good habits — they build avoidance. Users report: "I opened the app, saw the damage, felt terrible, and closed it immediately."

**Too many categories:** 15-20+ budget categories means 15-20+ decisions. For ADHD brains, this creates paralyzing decision fatigue. Users don't complete setup, or abandon after a few days.

**Complex setup processes:** An app that requires 30 minutes of configuration before it's useful will be abandoned by ADHD users. The barrier to first value is too high.

**Notification fatigue:** Too many alerts lead to muting everything. Alerts about overspending feel like nagging, triggering avoidance rather than behavior change.

**AI predictions:** When an app predicts overspending based on past data, but you haven't overspent yet, it creates preemptive shame. For ADHD users with erratic spending patterns, these predictions are consistently wrong and harmful.

### 5.4 Academic Research Highlights

- A study of 1,292 participants found ADHD symptoms correlate with significantly more impulsive buying and an "avoidant or spontaneous decision style" (PLOS ONE, 2020)
- Adults with ADHD show lower performance on financial knowledge and judgment tests (PMC, 2021)
- The relationship between ADHD and impulsive buying is mediated by ability to defer gratification — a neurobiological trait, not a character flaw (PMC, 2024)
- Males with ADHD demonstrate higher impulsivity, lower risk aversion, and greater financial volatility (Nature, 2025)
- ADHD symptoms correlate directly with higher credit card balances, late payments, and use of pawn services

---

## 6. What ADHD Users Need from Budgeting Tools

### 6.1 Automation as Foundation

The single most impactful strategy. Automatic bill payments remove the need to remember, initiate, and follow through. Automatic savings transfers happen whether or not the future feels real. Every automated payment is one fewer task to initiate, one fewer decision to deplete executive function.

### 6.2 The Three-Bucket System

Research consistently shows ADHD users succeed with three broad categories rather than detailed line items:

- **Essentials (50%):** Rent, utilities, groceries, insurance, transport
- **Discretionary (30%):** Dining, entertainment, subscriptions, shopping
- **Savings/Debt (20%):** Savings transfers, loan payments

This drastically reduces decision points (3 instead of 20), respects working memory limits, and provides clear visual feedback without requiring calculations. When discretionary is empty, spending stops. This is self-enforcing without constant monitoring.

### 6.3 Prevention Over Tracking

The paradigm shift: prevent bad spending instead of tracking it and creating shame afterward.

- **Strategic friction:** Making impulse purchases slightly harder (without restricting freedom) can reduce impulsive spending by up to 50%
- **24-hour wishlists:** Adding items to a list and waiting 24 hours — most impulses fade
- **"Safe-to-Spend" view:** Show remaining discretionary amount rather than full account balance
- **Visual depletion:** Seeing a nearly-empty discretionary bucket provides a clear signal to slow down

### 6.4 Compassion-First Language

Every piece of text in the app must pass the shame test:

- "manage your money" instead of "budget"
- "see where it goes" instead of "track spending"
- "stay in control" instead of "control spending"
- "Your discretionary spending is higher this month" instead of "You overspent"
- Celebrate progress, not perfection

### 6.5 Minimal Setup, Maximum Value

The app should be useful immediately with minimal setup. Smart defaults (three-bucket system, reasonable category limits) should work out of the box. Complexity available but hidden until explicitly requested. A first-run experience that provides a quick win (link one account, see one insight) within 2 minutes.

### 6.6 Real-Time, Accurate Data

Uncertainty creates anxiety. A single, trustworthy balance figure reduces cognitive load. Automatic transaction import is essential — manual data entry is a multi-step task ADHD brains will abandon. The database must be the single source of truth (aligns with BetterBudgeter's existing principle).

---

## 7. UI/UX Design Principles for ADHD

### 7.1 Cognitive Load Reduction

**Progressive disclosure:** Reveal information gradually rather than presenting everything at once. Keep disclosure levels below three. Breaking complex flows into steps creates a "feeling of forward motion" — each "next" button produces a minor dopamine reward.

**Information hierarchy:** Primary information (safe-to-spend balance) should be largest and most prominent. Secondary information (monthly budget status) next. Tertiary information (recent transactions) below. Discoverable information (settings, analytics) behind navigation.

**Chunking:** Present discrete, manageable pieces rather than comprehensive overviews. Card-based layouts organize content into bounded containers that leverage how the brain processes information.

### 7.2 Visual Clarity

**Whitespace:** Not empty space — cognitive rest points. Prevents visual "noise" that overwhelms ADHD users who struggle with filtering irrelevant stimuli. Guides the eye naturally.

**Contrast:** High enough for readability (WCAG AA: 4.5:1 for body text) but avoid sharp, jarring contrasts that create visual stimulation. Gentle transitions between hues are preferable.

**Card-based layouts:** Each card presents one coherent idea or action. Clear visual boundaries prevent concepts from bleeding together.

### 7.3 Color Psychology

**Recommended:** Soft blues and greens (associated with tranquility and focus). Muted pastels that reduce overstimulation. Neutral base palettes (grays, soft whites) with calming accent colors.

**Avoid:** Bright, intense hues (vivid reds, oranges, yellows) that overstimulate. Large expanses of bold colors. Sudden color changes that distract and disorient.

**For BetterBudgeter:** Cool, calming tones as the foundation. Reserve warmer accent colors (muted amber, soft orange) for alerts that genuinely need attention. Green for positive states. Avoid red except for critical failures.

### 7.4 Typography

**Font choices:** Sans-serif fonts are more readable (a 2016 study found that the primary benefit of "dyslexia-optimized" fonts came from increased letter spacing, not unique shapes). Open Sans, system fonts, and Lexend perform well.

**Sizing:** Minimum 16px for body text (18-20px often better). Line spacing 1.4x to 1.6x font size. Generous letter spacing.

**Structure:** Short paragraphs with clear headings. Avoid italics and underlining (distort readability). Use bold or color for emphasis. Never justify text (creates uneven word spacing).

### 7.5 Navigation

**Hub-and-spoke model (recommended):** One clean dashboard (hub) with navigation to focused subpages (spokes). Reduces permanent visibility load while keeping details accessible.

**Tab bar:** Best when limited to 3-5 items. Creates predictable mental models. Users learn "transactions are always in the second tab" without re-orienting.

**Consistency is paramount:** Navigation in the same position on every page. Headers, footers, sidebars don't shift. Buttons in consistent locations. Layouts that shift during page load ("layout shift") force constant re-orientation — an "attention tax."

### 7.6 Motion and Animation

**When helpful:** Functional feedback (button presses, state changes), direction signaling (element moving off-screen), status indicators (loading spinners), consistent rhythmic patterns.

**When harmful:** Autoplay videos, scrolling-triggered animations, decorative motion with no purpose, flashy transitions that pull focus.

**Critical rule:** Always respect `@prefers-reduced-motion`. Motion should be "comfortable and clarifying" — it conveys information, not entertainment.

### 7.7 Microinteractions and Feedback

Every action should get immediate, non-intrusive feedback. Each system acknowledgment activates the brain's reward circuitry with dopamine. Predictability matters — when outcomes are clear and reliable, users develop confidence. Use progress indicators, subtle confirmation animations, and satisfying (not distracting) micro-animations.

### 7.8 Intentional Friction

Friction should feel protective and supportive, not punitive. Effective examples: confirmation step for large actions, requiring explicit category selection (prevents mindless entry), "Safe-to-Spend" view that hides full balance, 24-hour hold for risky actions. The language matters: "Let's confirm you want to do this" not "Are you sure? This is risky."

### 7.9 Empty States and Onboarding

Research shows 84% of users abandon on first encounter with blank states lacking contextual help. With guidance, confusion drops by 28%.

Never show a blank page without a clear next action. Use progressive onboarding (explain features one at a time as encountered). Limit initial choices to 3-4 options maximum. Create a first-run experience that delivers a quick win within 2 minutes.

### 7.10 Non-Judgmental UX Copy

Concise language with one meaning per phrase. Plain language with precise words over vague ones. Supportive tone framing setbacks as normal. Respect intelligence without condescension.

Example rewrites:

- "Oops! You've exceeded your budget." → "You've reached your groceries budget. Want to pause or adjust it?"
- "Stop wasting money on subscriptions." → "You have 3 active subscriptions. Review them here if you'd like."
- "Failed to import accounts." → "We couldn't connect to your bank. Check your credentials and try again."

---

## 8. Inclusive Design Systems

### 8.1 Microsoft Inclusive Design for Cognition

Microsoft's approach has shifted from "designing for specific diagnoses" to "designing for cognitive accessibility broadly." They recruit people who identify focus as a concern (including but not exclusively ADHD), not just medical diagnoses.

Three core principles: (1) Understand user motivation, goals, and tasks — not "How do we design for ADHD?" but "What is this person trying to do?"; (2) Discern cognitive load mismatch — identify where the interface creates unnecessary burden; (3) Co-create with diverse communities.

Key insight: When you create a focused experience that works for someone with ADHD, it works for everyone. The system doesn't need special "ADHD mode" — just thoughtful defaults.

### 8.2 GOV.UK Design System

Recognized for reducing cognitive load in complex government services. Key principles: cognitive disabilities (affecting memory and thinking) are as important as visual/hearing/motor; WCAG 2.2 AA as baseline; consistent, predictable component behavior; clear language and information hierarchy.

Relevant because government services (tax, benefits) have similar complexity to personal finance.

### 8.3 Material Design 3

Core principle: "Honor Individuals" — one universal default rarely meets everyone's needs. Key cognitive features: clear boundary delineation for controls and containers, emphasis on eliminating clutter, support for 200% text enlargement, algorithmically ensured contrast ratios.

Material 3 doesn't brand itself as ADHD-focused — it applies universal design principles that happen to benefit ADHD users.

### 8.4 Apple Human Interface Guidelines

Reduces cognitive load as a core design mandate. Standard navigation patterns (navigation bars, tab bars) so users don't re-learn navigation. "Accessibility is not just about making information available to people with disabilities — it's about making information available to everyone."

---

## 9. The Curb Cut Effect: Designing for Everyone

### 9.1 What It Is

Curb cuts (ramps for wheelchair accessibility) also benefit parents with strollers, people pulling luggage, cyclists, and anyone preferring a smoother path. In digital design: captions designed for deaf users help non-native speakers and ADHD users; simplified interfaces designed for cognitive disabilities are appreciated by everyone who wants less clutter; voice controls originally for motor disabilities are now standard.

### 9.2 When Simplification Helps vs. Feels Limiting

**Helps everyone:** Removing clutter improves focus. Clear hierarchy is faster to scan. Fewer options mean faster decisions (paradox of choice). Consistent patterns reduce learning curve.

**Feels limiting when:** Power users can't access advanced options. Customization is removed entirely. Over-simplification feels patronizing.

### 9.3 Progressive Complexity (The Solution)

Offer a simple default experience with power features available on demand:

- **Simple view (default):** Dashboard with 3 key metrics, one-click actions, budget overview
- **Advanced view (opt-in):** Custom metrics, batch import, scheduled transactions, custom rules

This serves both ADHD users (clean default experience) and power users (nothing is hidden permanently). The key: simple by default, powerful by choice.

---

## 10. Implications for BetterBudgeter

### 10.1 Architecture Decision: Multi-Page Hub-and-Spoke

Based on all research, the multi-page approach is strongly supported:

- **Hub (Dashboard/Home):** 3-5 key metrics — safe-to-spend/available balance (largest, most prominent), monthly budget status (traffic light progress), and a primary call-to-action
- **Spoke: Budgets:** Budget progress, spending by category, budget configuration
- **Spoke: Transactions:** Recent and full transaction list, search/filter
- **Spoke: Accounts:** Linked accounts, sync controls, account details
- **Spoke: Settings:** Preferences, notification settings, advanced options

Each spoke is a focused page with a single purpose. Users never face 7+ competing sections.

### 10.2 Design System Requirements

**Color palette:** Cool, calming foundation (soft blues, greens, neutral grays). Warm accents only for meaningful alerts (muted amber for warnings). Green for positive/on-track states. Avoid bright red except for critical errors.

**Typography:** System sans-serif stack or a readable web font. Minimum 16px body text, 1.5x line height. Generous spacing. Clear heading hierarchy.

**Spacing:** Generous whitespace between sections. Card-based layouts with clear boundaries. No visual clustering.

**Components:** Consistent card patterns. Traffic light budget indicators. Progress bars for visual feedback. Non-judgmental empty states with clear CTAs.

**Interaction patterns:** Progressive disclosure (collapsed by default, expandable). Hub-and-spoke navigation (3-5 tabs). Immediate feedback on every action. Intentional friction on risky actions. Respect `@prefers-reduced-motion`.

**Copy guidelines:** Non-judgmental, supportive, action-oriented. No shame language. Frame setbacks as normal. Celebrate progress.

### 10.3 What NOT to Build

Based on research, these features are actively harmful for BetterBudgeter's target users:

- **AI spending predictions:** Consistently wrong for ADHD users with erratic spending. Creates preemptive shame. Directly contradicts the "deterministic behavior" principle.
- **20+ budget categories:** Creates decision fatigue and abandonment. Three buckets (or 4-6 broad categories) is the maximum.
- **Frequent notifications:** More than 1-2 meaningful alerts creates fatigue. Default to minimal.
- **Complex onboarding:** No multi-step wizards requiring 30 minutes. First value within 2 minutes.
- **Competitive/social features:** Leaderboards or comparisons trigger shame in financial contexts.
- **Penalty-based gamification:** No "streak broken" or "budget failed" messaging.

### 10.4 What to Prioritize

- **Safe-to-Spend as primary metric:** Not full balance, but "how much can I safely spend?"
- **Visual budget depletion:** Virtual envelope/bucket that visually empties — mimics the tangible feedback of physical cash
- **Three-bucket budget view:** Essentials, Discretionary, Savings as the primary budget framework
- **Compassionate language throughout:** Every string passes the shame test
- **Quick check-in design:** Under 2 minutes to see financial status and leave
- **Smart defaults:** App is useful immediately without configuration

---

## 11. Sources

### Modern Budgeting Apps
- [How Great Budget App Design Increases User Retention — Onething Design](https://www.onething.design/post/budget-app-design)
- [How to Start With Budget App Design: 8 Tips — Eleken](https://www.eleken.co/blog-posts/budget-app-design)
- [Monarch Money Dashboard Customization](https://help.monarch.com/hc/en-us/articles/360058127551)
- [Copilot Money Review — Money With Katie](https://moneywithkatie.com/copilot-review-a-budgeting-app-that-finally-gets-it-right/)
- [The Best Budget Apps for 2026 — NerdWallet](https://www.nerdwallet.com/finance/learn/best-budget-apps)
- [Why Budgeting Apps Fail: Hidden Behavioral Aspects — EconBrew](https://www.econbrew.com/post/why-budgeting-apps-fail-the-hidden-behavioral-aspects)
- [Digital Detox for Your Wallet — The App Note](https://www.theappnote.com/blog/digital-detox-for-your-wallet-why-simple-apps-beat-complex-financial-software)

### Historical Methods
- [Envelope budgeting — Ramsey Solutions](https://www.ramseysolutions.com/budgeting/envelope-system-explained)
- [Pay Yourself First origin — QZ](https://qz.com/813644/the-worlds-most-popular-money-tip-came-from-a-map-maker-whose-business-got-crushed-by-the-great-depression)
- [Zero-Based Budgeting — Wikipedia](https://en.wikipedia.org/wiki/Zero-based-budgeting)
- [50/30/20 Rule — Britannica](https://www.britannica.com/money/what-is-the-50-30-20-rule)
- [Quicken history — Wikipedia](https://en.wikipedia.org/wiki/Quicken)
- [Mint closure analysis — Orbit Money](https://orbitmoney.io/blog/what-happened-to-mint)

### ADHD and Finance
- [How ADHD Affects Financial Management — Relational Psych](https://www.relationalpsych.group/articles/how-adhd-affects-financial-management-and-spending-habits)
- [ADHD-Friendly Financial Management — ADD.org](https://add.org/adhd-friendly-financial-management-yes-and-its-not-what-you-think/)
- [Neurotypical Budgeting Tips Don't Work for ADHD — ADDitude](https://www.additudemag.com/budgeting-tips-for-adhd-brains/)
- [ADHD Impulsive Spending — ADHD Specialist](https://adhdspecialist.com/post/adhd-overspending-and-impulsivity)
- [Breaking Free From Financial Shame — Shameless Money](https://shamelessmoney.com/shameless-money-blog/breaking-free-from-financial-shame-how-to-stop-the-avoidance-cycle-with-adhd)
- [ADHD and the Hyperfixation Hangover — Relational Psych](https://www.relationalpsych.group/articles/adhd-and-the-hyperfixation-hangover-why-you-lose-interest-suddenly)

### Academic Research
- [Financial decision-making with ADHD — PLOS ONE](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0239343)
- [Financial judgment in adults with ADHD — PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8295146/)
- [Impulsive Buying and Gratification Deferment — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11636743/)
- [ADHD traits and stock trading — Nature](https://www.nature.com/articles/s41598-025-17467-3)
- [Neural mechanisms of credit card spending — Nature](https://www.nature.com/articles/s41598-021-83488-3)
- [Psychology of digital payments — PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11939284)

### ADHD-Friendly Design
- [Software Accessibility for ADHD — Carlo Ciccarelli](https://www.carlociccarelli.com/post/software-accessibility-for-users-with-attention-deficit-disorder)
- [Neurodiversity and UX — Stéphanie Walter](https://stephaniewalter.design/blog/neurodiversity-and-ux-essential-resources-for-cognitive-accessibility/)
- [Designing for ADHD — UXPA International](https://uxpa.org/designing-for-adhd-in-ux/)
- [UI/UX for ADHD — Din Studio](https://din-studio.com/ui-ux-for-adhd-designing-interfaces-that-actually-help-students/)

### Inclusive Design Systems
- [Microsoft Inclusive Design for Cognition](https://inclusive.microsoft.design/tools-and-activities/InclusiveDesignForCognitionGuidebook.pdf)
- [Microsoft Design for Cognition — Medium](https://medium.com/microsoft-design/inclusive-designs-next-chapter-design-for-cognition-2de5a771660d)
- [GOV.UK Design System Accessibility](https://design-system.service.gov.uk/accessibility/)
- [Material Design 3 Accessible Design](https://m3.material.io/foundations/accessible-design/overview)
- [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)

### Color, Typography, and Patterns
- [Color Design for ADHD — Well Built Places](https://wellbuiltplaces.org/2024/08/03/best-practices-for-design-and-use-of-colour-focus-on-adhd/)
- [Best Fonts for ADHD — AudioEye](https://www.audioeye.com/post/best-fonts-for-adhd/)
- [Progressive Disclosure — LogRocket](https://blog.logrocket.com/ux-design/progressive-disclosure-ux-types-use-cases/)
- [Neurodiverse Animation Principles — Art Miker](https://www.artmiker.com/post/neurodiverse-animation-principles-for-adhd-autistic-audience)
- [The Curb Cut Effect — Level Access](https://www.levelaccess.com/uncategorized/the-curb-cut-effect-how-digital-accessibility-elevates-ux-for-everyone/)
- [Empty State UX — Eleken](https://www.eleken.co/blog-posts/empty-state-ux)
- [Mobile Navigation Patterns — Nielsen Norman Group](https://www.nngroup.com/articles/mobile-navigation-patterns/)
- [Notification Fatigue — MagicBell](https://www.magicbell.com/blog/alert-fatigue)

---

*This document serves as the research foundation for BetterBudgeter's design system. The next step is creating the design system specification document (DESIGN_SYSTEM.md) that translates these findings into concrete design tokens, component patterns, interaction guidelines, page layouts, and ADHD-specific rules.*
