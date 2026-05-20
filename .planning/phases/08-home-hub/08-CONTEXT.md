# Phase 8: Home Hub - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Restructure `/` (currently the busy stop-gap "OopsBudgeter → BetterBudgeter" dashboard) into the calm Home **hub** described in DESIGN_SYSTEM.md §7.2 — four sections, in order:

1. **Greeting + Safe-to-Spend hero** — time-aware greeting + the discretionary balance as the dominant on-screen metric
2. **Compact budget status indicators** — one single line per active budget (traffic-light dot + category name + remaining EUR). NOT the full Budget Progress Cards (those live on the Budgets spoke page, Phase 9).
3. **3–5 most recent transactions** — using the Transaction Item pattern (merchant + amount + category + date, no icons)
4. **"Sync Transactions" quick-action button** — reuses the existing `<SyncTransactionsButton/>` from Phase ≤7

This phase ALSO implements `src/lib/safe-to-spend.ts` — the pure calculation that powers the hero.

**Removed from Home in this phase** (Phase 9 re-hosts them on spoke pages):
- Spending-by-Category donut chart → `/budgets`
- Linked Accounts list → `/settings`
- Income / Expenses split KPI cards → `/transactions`
- Debug `<p>User ID:</p>` footer (removed permanently — no destination)

**Out of scope (other phases handle):**
- Building the spoke pages themselves (`/budgets`, `/transactions`, expanded `/settings`) → Phase 9
- Designing the generic KPI Card, Budget Progress Card, Empty State, Alert Banner primitives → Phase 10
- Final copy pass (shame-test, voice + tone, microcopy) → Phase 11
- Motion + reduced-motion support, WCAG 2.2 AA audit → Phase 11
- Any schema/auth/RLS change — UI-only milestone per CLAUDE.md
- Real PSD2/AISP consent + retention + Article 17 deletion flow — see Deferred Ideas

</domain>

<decisions>
## Implementation Decisions

### Safe-to-Spend formula (`lib/safe-to-spend.ts`)

- **D-S2S-01:** Define `ESSENTIAL_CATEGORIES = ['Rent', 'Utilities', 'Food', 'Transport'] as const` in `lib/safe-to-spend.ts`. These four are subtracted from the spendable pool; `Entertainment`, `Shopping`, `Other` remain discretionary (NOT subtracted) — they are the spend Safe-to-Spend is intended to protect. **Precedent:** `BUDGET_THRESHOLDS` in `src/lib/budgets/index.ts` and the `ExpenseCategory` enum in `src/types/finance.ts` are already hardcoded policy/code, not DB rows — this decision follows the same pattern. Add a `TODO (v3+ milestone)` comment near the const referencing the future per-budget `is_essential` flag (requires ADR + schema migration + settings UI; out of scope for v2.0).

- **D-S2S-02:** `remaining = Math.max(0, limit - spent)` — a budget that has gone over its limit contributes **0** to the subtraction, never a negative that would falsely INFLATE Safe-to-Spend. Matches the existing `calculateAllBudgetProgress()` clamp in `src/lib/budgets/index.ts:189`. Rationale: an overage on Rent must NOT raise the "safe" number; that would be a perverse ADHD-hostile signal.

- **D-S2S-03:** `totalBalance = Σ accounts where type ∈ {'checking', 'savings'}`. Excludes `credit` (debt, not money the user has) and `investment` (illiquid; selling shares to cover groceries is not "safe spending"). Concretely changes today's behavior: the current dashboard sums **all** account balances via `accounts.reduce((sum, acc) => sum + (acc.balance ?? 0), 0)` — Safe-to-Spend uses the stricter filter.

- **Final formula:**
  ```ts
  safeToSpend =
      Σ (balance of accounts where type === 'checking' || type === 'savings')
    − Σ Math.max(0, budget.monthlyLimit - spent)
        for budgets where budget.category ∈ ESSENTIAL_CATEGORIES, current calendar month
  ```
  "Current month" matches `getCurrentMonthStart()` in `src/lib/budgets/index.ts` — same time-window helper, no new month math.

### Greeting + name + locale

- **D-GR-01:** Name source = pure helper `nameFromEmail(email: string): string | null` in `src/utils/greeting.ts`. Algorithm: `email.split('@')[0]` → split on `[._-]` → take first chunk → require it to start with a letter → return first letter uppercased + rest lowercased. Returns `null` for unparseable input (numeric-prefix emails, malformed strings) → caller falls back to the no-name greeting variant. Single-line swap when a real `display_name` source is added later.

- **D-GR-02:** Three English time bands — **morning 05:00–11:59**, **afternoon 12:00–17:59**, **evening 18:00–04:59**. Helper `greetingForTime(now: Date): 'morning' | 'afternoon' | 'evening'` in `src/utils/greeting.ts`. German UI / full i18n is deferred to a dedicated future milestone (mid-app language mixing is jarring; current app is fully English).

- **D-GR-03:** Timezone for "now" = **hardcoded `Europe/Berlin`** (school project, known DE-resident users, Vercel server default is UTC which would mis-band). Implementation: `new Date().toLocaleString('en-US', { timeZone: 'Europe/Berlin' })` or equivalent. TODO comment referencing the future i18n milestone for user-controlled timezone.

- **D-GR-04:** Greeting computed **server-side per request** in `(bb)/page.tsx` — no client component, no hydration flash, no fetched-once-and-cached staleness. Matches Phase 7 server-component-first pattern.

### Component extraction strategy (Phase 8 ↔ Phase 10 boundary)

- **D-CMP-01:** **Hybrid extraction.** Phase 8 creates exactly these new files:
  - `src/lib/safe-to-spend.ts` — pure calculation (no React, no DOM)
  - `src/utils/greeting.ts` — `nameFromEmail` + `greetingForTime` (pure helpers)
  - `src/utils/format.ts` — `formatCurrency(amount: number): string` extracted from inline helper in legacy `(bb)/page.tsx` (so home page and `TransactionItem` import the same one)
  - `src/components/dashboard/TransactionItem.tsx` — extracted component (clear cross-phase reuse: Home Phase 8 + Transactions page Phase 9)

  Inline in `src/app/(bb)/page.tsx`:
  - Safe-to-Spend hero JSX (greeting + EUR number + label) — Home-only, will be refactored to consume the generic `<KPICard>` primitive in Phase 10
  - Compact `BudgetStatusSummary` list — Home-only; the inline single-line row is a private `function BudgetStatusRow(...)` defined in the page file

  Phase 10 owns the generic primitives (KPI Card, Budget Progress Card, Empty State, Alert Banner) and **refactors** the Phase 8 hero/budget-list to consume them. Phase 8 prefers token-styled inline JSX over premature abstractions so Phase 10 has freedom to shape the KPICard API.

- **D-CMP-02:** `TransactionItem` accepts a **view-model object**, not a raw DB row:
  ```ts
  interface TransactionItemProps {
    merchant: string;          // primary identifier (DESIGN_SYSTEM §5.3)
    amount: number;            // positive number; sign comes from `type`
    type: 'income' | 'expense';
    category: TransactionCategory;
    date: string;              // ISO 8601; formatted inside component
  }
  ```
  Decoupled from `bb_transactions` schema. Matches the `BudgetProgress` DTO pattern in `src/lib/budgets/`. Easier to test, easier for Phase 9 to feed from a different query, easier for storybook-style review later.

- **D-CMP-03:** `BudgetStatusRow` (single-line traffic-light + category + remaining EUR) is a **private function** inside `(bb)/page.tsx`, NOT a separate file — used exactly once. Mirrors the inline-helper pattern already in the legacy `(bb)/page.tsx`.

### Legacy cutover + edge states

- **D-CUT-01:** **Replace `(bb)/page.tsx` outright** in a single Phase 8 commit. No `?hub=true` feature flag. No parallel `/dashboard-classic` route. The OopsBudgeter dashboard is already preserved at `/legacy` (Phase 7 `D-04`), so no functionality is lost; content moving off Home is re-hosted by Phase 9 spokes.

- **D-CUT-02:** Edge-state policy:
  - **0 accounts linked** → REPLACE the hub with a full-screen single-CTA card: "Link your bank to get started" → `/link-bank` (existing standalone page). Nothing else in the hub is meaningful without an account.
  - **0 budgets configured** → hub renders normally; the budget status section shows the empty-state line "Set up your first budget →" linking to `/settings`. Safe-to-Spend hero still renders (it's just `totalBalance − 0`).
  - **0 transactions** → hub renders normally; the transactions section shows "Your transactions will appear here." with the inline `<SyncTransactionsButton/>`.
  - **DB error** → hub still renders with `€—` for Safe-to-Spend and a small inline `"Couldn't load data"` note at the bottom of the page. **Never** a red top banner — that contradicts DESIGN_SYSTEM §5.5 "max 1 banner" and Principle P1 "calm over comprehensive".

- **D-CUT-03:** "Set up your first budget" link target = `/settings`. Phase 9 populates the destination with the `BudgetSettings` UI. Forward-looking link is fine; preserves Phase 7's "BB pages only point at BB pages" hygiene.

- **D-CUT-04:** `formatCurrency` is extracted from the inline helper in legacy `(bb)/page.tsx` into `src/utils/format.ts`. Behavior unchanged: `new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount)`. Both the home page and `TransactionItem` import from `utils/format.ts` (single source of truth, junior-readable).

### Claude's Discretion

- **TransactionItem visual layout** (CSS structure inside the component) — Tailwind utilities with `--bb-*` tokens, per project conventions. Specific class composition is the planner/implementer's call.
- **Sort order for budget status indicators** — alphabetical by category name (deterministic, matches `BUDGET_THRESHOLDS` predictability ethos). If "by urgency" ever becomes desired, that's a Phase 11 copy/UX pass decision.
- **"This month" boundary for Safe-to-Spend** — calendar month (1st → end of month), matching `getCurrentMonthStart()` in `src/lib/budgets/index.ts`. Rolling 30-day window not justified by any requirement.
- **Hero typography & spacing exact values** — use DESIGN_SYSTEM §3.2 type scale (`text-bb-3xl` for the EUR number per §5.1 Hero KPI rule) and §4.1 spacing scale. Specific class composition is the planner/implementer's call.
- **Greeting fallback string when name is null** — "Good morning." / "Good afternoon." / "Good evening." (period instead of comma + name). Calm, not awkward.
- **Empty-state copy wording** — drafted user-friendly today, copy-pass-final in Phase 11 (same Phase 7 `D-08` pattern).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design specification (primary source of truth)
- `docs/DESIGN_SYSTEM.md` §1 — Design principles (P1 calm-over-comprehensive, P2 compassion-over-correction, P3 clarity-over-cleverness)
- `docs/DESIGN_SYSTEM.md` §5.1 — KPI Card pattern (drives hero typography: `text-bb-3xl` for primary metric)
- `docs/DESIGN_SYSTEM.md` §5.3 — Transaction Item pattern (merchant + amount + category + date, no icons, consistent height)
- `docs/DESIGN_SYSTEM.md` §5.4 — Empty State pattern (when 0 budgets / 0 transactions)
- `docs/DESIGN_SYSTEM.md` §7.2 — Home page content spec (the 4 sections, what does NOT belong here)
- `docs/DESIGN_SYSTEM.md` §7.3 — Page template (single-column, stacked cards, `--bb-space-8` between sections)
- `docs/DESIGN_SYSTEM.md` §12.3 — Proposed file structure (informs but does not dictate per D-CMP-01)
- `docs/ADHD_UX_RESEARCH.md` — Safe-to-Spend rationale (lines 239, 318, 430); ADHD time-perception challenges; discretionary balance vs raw balance

### Requirements (locked acceptance criteria)
- `.planning/REQUIREMENTS.md` — **PAGE-01** (4 sections exact, in order), **PAGE-02** (compact, NOT full Budget Progress Cards), **PAGE-03** (TransactionItem pattern), **PAGE-07** (PageShell layout from Phase 7), **PAGE-08** (lib/safe-to-spend.ts with comments + limitations)
- `.planning/ROADMAP.md` §"Phase 8: Home Hub" — Goal + 5 success criteria (last is `bun run build` passes)

### Prior phase outputs (locked Phase 6 + Phase 7 decisions consumed here)
- `.planning/phases/07-layout-shell-navigation/07-CONTEXT.md` — Especially D-06 (BB chrome stack), D-11 (PageShell), D-12 (PageHeader). The home page renders **inside** `(bb)/layout.tsx`'s `<PageShell>` — the page does NOT wrap itself with `<PageShell>` again.
- `.planning/phases/06-design-tokens/06-CONTEXT.md` — Tailwind utility names (`bg-bb-surface`, `text-bb-text-secondary`, `text-bb-3xl`, `mb-bb-8`, `gap-bb-4`, etc.) and the `--bb-*` consumption pattern
- `src/app/globals.css` — `--bb-*` tokens + `@theme inline` mappings already wired

### Code modules that this phase TOUCHES
- `src/app/(bb)/page.tsx` — fully rewritten (D-CUT-01)
- `src/app/(bb)/layout.tsx` — UNCHANGED (already provides `<PageShell>` per Phase 7 D-06)
- `src/components/dashboard/SyncTransactionsButton.tsx` — UNCHANGED (reused as-is)
- `src/components/dashboard/BudgetProgressSection.tsx` — UNCHANGED (no longer used by home, may be removed in Phase 9 if /budgets uses a different shape; Phase 8 leaves it)
- `src/components/dashboard/SpendingByCategoryChart.tsx` — UNCHANGED (no longer imported by home; Phase 9 imports it on `/budgets`)
- `src/components/dashboard/BudgetNotificationDialogs.tsx` — DECISION DEFERRED to planner: keep on home or move? It's session-modal UI that fires on threshold crossings; not on the 4-section list per PAGE-01. Likely moves OFF home and lives on the page that owns budget editing (Phase 9 `/settings`). Planner / Phase 9 owner decides.

### Code modules that this phase CREATES
- `src/lib/safe-to-spend.ts` — pure calculation; reads from `getAccounts()` + `getBudgets()` + monthly spending
- `src/utils/greeting.ts` — `nameFromEmail`, `greetingForTime`
- `src/utils/format.ts` — `formatCurrency` (extracted from legacy inline helper)
- `src/components/dashboard/TransactionItem.tsx` — extracted view-model component

### Data sources (no changes — read-only consumption)
- `src/lib/db/accounts.ts` → `getAccounts()` returns `DbAccount[]` with `type` and `balance`
- `src/lib/db/transactions.ts` → `getRecentTransactions(limit)` returns most-recent N rows
- `src/lib/budgets/index.ts` → `calculateAllBudgetProgress()` returns `BudgetProgress[]` already including `remainingAmount` and `status`
- `src/lib/auth/index.ts` → `getUser()` returns `AuthUser { id, email, createdAt }`
- `src/types/finance.ts` → `ExpenseCategory`, `BudgetProgress`, `AccountType`

### Project-rule documents (consulted but not duplicated)
- `CLAUDE.md` (repo root) — UI-only milestone constraint, no DB/auth/RLS changes; junior-dev comment discipline; `bun` only; shadcn/ui primary
- `.claude/rules/01-safety-and-workflow.md` — additive-first; one task at a time; never commit to main
- `.claude/rules/02-task-execution.md` — declare task type; restate-then-decompose; verify after each task

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`<PageShell>` and `<PageHeader>`** (`src/components/layout/`) — Phase 7 already provides the single-column 768px-max layout, padding scale, and tab clearance. `<PageHeader title=... subtitle=... />` slots in cleanly above the hero, OR the hero subsumes the header role (the planner picks).
- **`<SyncTransactionsButton accountCount={n} />`** (`src/components/dashboard/`) — existing button + import-trigger logic. Drop-in for Section 4 of the hub.
- **`calculateAllBudgetProgress()`** (`src/lib/budgets/index.ts:158`) — Already returns `{budget, spentAmount, remainingAmount, usagePercentage, status, transactionCount}[]`. Both Safe-to-Spend AND the budget status indicators consume this — single call covers both needs.
- **`getCurrentMonthStart()`** (`src/lib/budgets/index.ts:60`) — current-calendar-month helper. Same time-window everywhere.
- **`getRecentTransactions(limit)`** (`src/lib/db/transactions.ts`) — returns DB rows; the home page passes `5` and the page is responsible for mapping rows → `TransactionItemProps`.
- **`getAccounts()`** (`src/lib/db/accounts.ts`) — returns linked accounts with `type`, `balance`, `account_name`, `bank_name`, `last_synced_at`. Phase 8 reads `type` and `balance` only.
- **`getUser()`** (`src/lib/auth/index.ts:77`) — returns `{id, email, createdAt}`. Email feeds `nameFromEmail`.
- **`--bb-*` tokens + Tailwind utilities** (`src/app/globals.css`) — all Phase 6 tokens are exposed (`bg-bb-surface`, `text-bb-text`, `text-bb-text-secondary`, `text-bb-3xl`, `text-bb-info`, `bg-bb-success`, `bg-bb-warning`, `bg-bb-error`, etc.). No inline hex / RGB values.

### Established Patterns
- **Server components by default; "use client" only when needed.** Home page is a server component (matches current `(bb)/page.tsx` and Phase 7 D-06). `SyncTransactionsButton` is the only client island on the page.
- **Try/catch DB calls; `dataError: string | null` pattern** — current `(bb)/page.tsx:84-93` shows the existing pattern. Phase 8 reuses it but routes errors to the **inline** edge-state per D-CUT-02, not a red top banner.
- **DTOs over raw DB rows for view components.** `BudgetProgress` is the precedent (`src/types/finance.ts:196`) — DB row in, DTO out, components consume the DTO.
- **`utils/` for pure helpers, `lib/` for orchestration / DB / business logic** — per CLAUDE.md project structure. `safe-to-spend.ts` lives in `lib/` (reads from DB modules); `greeting.ts` + `format.ts` live in `utils/` (pure, no side effects).
- **Section-level + file-header comments mandatory** (.claude/rules/01 §5) — every new file gets a header explaining purpose; non-trivial logic explained inline. The Safe-to-Spend formula MUST carry a top-of-file comment explaining the formula, the essential-categories policy, the limitations, and the v3+ migration TODO.
- **No direct `@radix-ui` imports in BB code** (CLAUDE.md) — Phase 8 uses no Radix; shadcn/ui or `--bb-*` styled primitives only.

### Integration Points
- **`(bb)/layout.tsx`** already wraps every BB route in `<PageShell>` and renders the `<TabBar/>` sibling. Home page renders **inside** that shell — no second `<PageShell>` on the page.
- **`/link-bank`** is an existing standalone page (top-level `src/app/link-bank/page.tsx`, OUTSIDE `(bb)/` per Phase 7 D-02). The 0-accounts CTA links here. No code change to `/link-bank`.
- **`/settings`** is a Phase 7 stub — exists but not yet expanded for Phase 9. The 0-budgets "Set up your first budget →" link points here in anticipation; Phase 9 fills the destination.
- **Middleware** (`src/middleware.ts`) already protects `/` (it's in the matcher for the `(bb)` group). No middleware changes needed in Phase 8.
- **Slim-root caveat from Phase 7 close-out:** any client component using `useSearchParams()` requires explicit `<Suspense>` wrapping. Phase 8 SHOULD NOT need `useSearchParams` (the home page is server-side and reads no query params), but flag this for the planner.

</code_context>

<specifics>
## Specific Ideas

- **"Safe-to-Spend" framing is the user's #1 ADHD-relevant question** — DESIGN_SYSTEM.md §12 conventions table: *'How much can I spend?' is the #1 ADHD user question*. The hero is the answer; everything else on the hub is secondary context.
- **Calm beats comprehensive on Home, every time** — when in doubt about an edge case, choose the option that keeps the hub at 4 sections with calm copy. Banners, multi-CTA stacks, and inline error noise are explicitly anti-pattern here.
- **Hardcoded policy IS NOT a "DB-as-SSoT" violation** — confirmed during discussion: the DB-as-single-source-of-truth rule (CLAUDE.md Core Principle 3) is about user-owned data (transactions, balances, budget limits). Policy/business rules (essential-categories list, threshold percentages, category enum) live in code by precedent.
- **The school-project context shapes scope decisions** — Europe/Berlin timezone is hardcoded because the user base is known; English-only is preserved because the rest of the app is English and partial i18n would be jarring. Future production work would re-open both.

</specifics>

<deferred>
## Deferred Ideas

- **PSD2 / FinTS production readiness** — researched during this discussion. Storage architecture (Supabase `bb_transactions` with RLS) is **already regulator-compatible**; what's missing for real PSD2 is: (a) AISP license or use of a licensed aggregator (finAPI / GoCardless / Tink), (b) explicit consent UI on first bank-link with 180-day SCA re-confirmation, (c) documented retention policy + automated cleanup job, (d) GDPR Art. 17 one-click deletion flow, (e) audit that Supabase region is EU. Sources: EDPB Guidelines 06/2020 on PSD2 × GDPR interplay; PSD2 Art. 67(2)(f) (purpose limitation, not a storage ban); Commission Delegated Regulation 2018/389 Art. 36 (background refresh cap 4×/24h — already compliant since we sync on user click only). **Not a Phase 8 concern.** Logged here so future work has the analysis.
- **v3+ migration of `ESSENTIAL_CATEGORIES`** — const → per-budget `is_essential` boolean on `bb_budgets`. Requires ADR + schema migration + RLS update + settings UI. TODO comment in `lib/safe-to-spend.ts` links here.
- **Credit-debt-aware Safe-to-Spend** — subtract outstanding credit-card debt from the spendable pool once the Fake-PSD2 mock distinguishes "credit limit" from "credit debt". Currently the mock doesn't model debt cleanly so credit accounts are excluded entirely.
- **Rolling 30-day Safe-to-Spend window** — calendar month is the v2.0 default; some users may want "last 30 days" instead. Not justified by any requirement; revisit if user feedback surfaces it.
- **Greeting customization** — explicit "preferred name" override in Settings; emoji greeting; quote of the day; etc. None are in scope for v2.0 — calm hub principle wins.
- **i18n / German UI** — full German translation (or `next-intl`-style infrastructure) is a separate dedicated milestone, not a Phase-8 carve-out.
- **`BudgetStatusSummary` extraction to a reusable component** — possibly justified once a Phase 10 design specifies it; deferred until then.
- **Safe-to-Spend trend / sparkline** — DESIGN_SYSTEM.md doesn't ask for it; ADHD-hostile cognitive load if added casually. Future enhancement only with explicit research support.
- **`<BudgetNotificationDialogs/>` placement post-Phase-8** — currently on home; Phase 9 likely moves it to `/settings` (where budgets are edited). Phase 8 leaves it; planner / Phase 9 owner decides.
- **Documenting the PSD2 storage-grounds analysis in `docs/PSD2_MOCK_STRATEGY.md`** — optional small task; useful for the school project Projektdokumentation / IHK Projektantrag.

</deferred>

---

*Phase: 08-home-hub*
*Context gathered: 2026-05-20*
