# Phase 8: Home Hub - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-20
**Phase:** 08-home-hub
**Areas discussed:** Safe-to-Spend formula, Greeting + name + locale, Component extraction strategy, Legacy dashboard cutover + edge states

---

## Safe-to-Spend formula

### Q1 — What defines an 'essential' budget?

| Option | Description | Selected |
|--------|-------------|----------|
| Hardcoded category list | const in lib/safe-to-spend.ts; no DB change; deterministic; junior-readable | ✓ |
| ALL budgets count as essential | Simplest formula; but discretionary budgets (Entertainment, Shopping) would defeat the "discretionary" framing | |
| Per-budget 'essential' flag | Most flexible; would require DB schema change — blocked by v2.0 UI-only scope | |

**User's choice:** Hardcoded list — after raising concern about whether this violates CLAUDE.md "DB as single source of truth". Resolved by clarifying that the DB-as-SSoT rule applies to user-owned data (transactions, balances, budget limits), not policy/business rules (category enum, threshold percentages, essential classification). Precedent: `BUDGET_THRESHOLDS` and `ExpenseCategory` are already hardcoded.

**Notes:** User also asked whether PSD2/FinTS regulates *storing* user transaction data at all. Researched and confirmed: PSD2 Art. 67(2)(f) permits storage for the user's explicitly requested purpose (PFM is one); EDPB Guidelines 06/2020 require retention limits + data minimization. The MVP uses synthetic mock data so PSD2 doesn't apply yet; the storage architecture is forward-compatible. Captured the production readiness gap (AISP license, consent UI, retention policy, Art. 17 deletion) as a deferred idea, not a Phase 8 concern.

### Q2 — Which categories count as 'essential'?

| Option | Description | Selected |
|--------|-------------|----------|
| Rent + Utilities + Food + Transport | The four 'you have to pay these' categories; discretionary stays Entertainment, Shopping, Other | ✓ |
| Rent + Utilities only | Tightest definition; Safe-to-Spend higher but feels less honest about groceries | |
| Rent + Utilities + Food + Transport + Other | Conservative; treats 'Other' (the catch-all) as obligation | |

**User's choice:** Rent + Utilities + Food + Transport.

### Q3 — How to handle a budget that's already over its limit?

| Option | Description | Selected |
|--------|-------------|----------|
| Clamp remaining to 0 | Math.max(0, limit − spent); overage contributes 0 to subtraction, never inflates S2S | ✓ |
| Allow negative (raw limit − spent) | Mathematically "honest" but creates a perverse signal where overspending raises the safe number | |

**User's choice:** Clamp to 0 — matches the existing `calculateAllBudgetProgress()` clamp in `src/lib/budgets/index.ts:189`; ADHD-friendly.

### Q4 — Which account types contribute to total balance?

| Option | Description | Selected |
|--------|-------------|----------|
| checking + savings only | The two liquid spendable types; credit is debt, investment is illiquid | ✓ |
| checking only | Strictest; savings excluded as "conscious decision to move money" | |
| All account types | What the current dashboard does; mixes liquid + illiquid | |
| checking + savings − credit debt | Most accurate net-spendable; deferred (mock doesn't model credit debt cleanly) | |

**User's choice:** checking + savings only.

---

## Greeting + name + locale

### Q1 — Where does the user's name come from?

| Option | Description | Selected |
|--------|-------------|----------|
| Email-prefix parse with utils/ helper | Pure helper, no DB change; 'paul.heuwer@gmail.com' → 'Paul'; null on unparseable | ✓ |
| Read user_metadata.full_name with fallback | Slightly more code for a feature nobody has yet (signup doesn't collect full_name today) | |
| Skip name, say 'Good morning.' | Most "calm" but contradicts DESIGN_SYSTEM.md example "Good morning, Paul" | |

**User's choice:** Email-prefix parse, with `utils/greeting.ts` helper.

### Q2 — Time bands and language?

| Option | Description | Selected |
|--------|-------------|----------|
| 3 bands, English (morning/afternoon/evening) | Matches DESIGN_SYSTEM.md example; consistent with rest of app (English) | ✓ |
| 4 bands with night, English | Adds 22–05 'Good night' band for shifted ADHD sleep schedules | |
| 3 bands, German ('Guten Morgen' etc.) | Matches user's stated language preference; but rest of app is English — partial i18n is jarring | |

**User's choice:** 3 bands, English. German UI deferred to a future i18n-dedicated milestone.

---

## Component extraction strategy

### Q1 — Phase 8 vs Phase 10 component split?

| Option | Description | Selected |
|--------|-------------|----------|
| Hybrid — extract TransactionItem only | Cross-phase reuse (Home Phase 8 + Transactions page Phase 9); SafeToSpendCard + BudgetStatusSummary inline (Home-only) so Phase 10 can refactor them to consume a generic KPICard primitive | ✓ |
| Extract all three Phase-8 components | Matches DESIGN_SYSTEM §12.3 file structure literally; risks locking SafeToSpendCard shape before Phase 10 designs KPICard | |
| Inline everything, Phase 10 extracts later | Zero premature abstraction; cons: long page file, Phase 9 still needs *some* tx item pattern — would duplicate or block on Phase 10 | |

**User's choice:** Hybrid extraction.

---

## Legacy dashboard cutover + edge states

### Q1 — How to cut over (bb)/page.tsx?

| Option | Description | Selected |
|--------|-------------|----------|
| Replace outright | Single commit, clean diff; nothing lost (OopsBudgeter at /legacy; displaced content goes to Phase 9 spokes) | ✓ |
| Keep behind ?hub=true toggle | Rollback-safe but doubles layout code, drags out cutover | |
| Keep both: hub at /, classic at /dashboard-classic | Invents a new URL nobody asked for; splits "home" attention | |

**User's choice:** Replace outright.

### Q2 — Edge states (no accounts / no budgets / no transactions / DB error)?

| Option | Description | Selected |
|--------|-------------|----------|
| Calm empty states inside the hub, with one full-screen exception (0 accounts → "Link your bank" CTA) | Hub stays at 4 sections for most empties; 0-accounts gets a full-screen CTA because nothing else is meaningful without an account; DB errors are inline at bottom, never a red banner | ✓ |
| Strict hub-always — no special-cases | Ultimate consistency but offers no guided path out of the 0-accounts dead-end | |
| Aggressive CTAs everywhere | Violates DESIGN_SYSTEM §5.5 "max 1 banner" and P1 calm-over-comprehensive | |

**User's choice:** Calm empty states with one full-screen exception.

---

## Claude's Discretion

- **Timezone for `now`** — hardcoded `Europe/Berlin` for v2.0 (Vercel UTC default would mis-band). TODO comment for future i18n.
- **Greeting computed server-side** — server component, per-request; no client hydration flash. Matches Phase 7 pattern.
- **TransactionItem props shape** — view-model `{merchant, amount, type, category, date}`, not raw DB row. Decoupled, testable, matches `BudgetProgress` DTO pattern.
- **Inline `BudgetStatusRow`** — private function inside `(bb)/page.tsx`, single-use; mirrors existing inline-helper pattern.
- **"Set up your first budget" → /settings** — Phase 9 fills the destination; forward-link is fine.
- **`formatCurrency` extraction** — move from inline helper in legacy `(bb)/page.tsx` to `src/utils/format.ts` so both home and TransactionItem use one source.
- **Sort order for budget status indicators** — alphabetical by category name (deterministic). Revisit only if a UX research finding contradicts.
- **"This month" boundary** — calendar month (matches `getCurrentMonthStart()`). No rolling 30-day window.
- **Greeting fallback when name is null** — "Good morning." / "Good afternoon." / "Good evening." (period, no name).
- **Hero typography & spacing** — DESIGN_SYSTEM §3.2 type scale + §4.1 spacing scale; specific class composition is planner's call.
- **Empty-state copy** — drafted user-friendly today, finalized in Phase 11 (same Phase 7 `D-08` pattern).
- **`<BudgetNotificationDialogs/>` post-Phase-8 home placement** — Phase 8 leaves it; Phase 9 likely moves it to `/settings` (where budgets are edited). Planner / Phase 9 owner decides.

---

## Deferred Ideas

- PSD2 / FinTS production readiness (consent UI, retention policy, GDPR Art. 17 deletion, AISP license / aggregator decision, EU-region audit) — researched during discussion; captured in CONTEXT.md `<deferred>`.
- v3+ migration of `ESSENTIAL_CATEGORIES` const → per-budget `is_essential` boolean (requires ADR + schema + RLS + settings UI).
- Credit-debt-aware Safe-to-Spend (subtract credit-card debt) — pending Fake-PSD2 mock modeling credit-debt cleanly.
- Rolling 30-day Safe-to-Spend window (vs calendar month) — not justified by current requirements.
- Greeting customization in Settings (preferred name override, etc.).
- Full German i18n / `next-intl` infrastructure — dedicated future milestone.
- `BudgetStatusSummary` component extraction — possibly justified once Phase 10 designs it.
- Safe-to-Spend trend / sparkline — not in scope, ADHD-hostile cognitive load if added casually.
- Optional: document the PSD2 storage-grounds analysis in `docs/PSD2_MOCK_STRATEGY.md` for the school project Projektdokumentation.
