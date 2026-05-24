# PROJECT: BetterBudgeter — ADHD-Optimized Budget App

## What This Is

A web-based personal finance tracker optimized for users with ADHD. Built on OopsBudgeter, extended and redesigned to reduce cognitive load, minimize shame, and support healthy financial habits through calm, intentional UX.

**Core Value:** A budget app that ADHD users actually keep using — because it meets them where they are instead of demanding executive function they don't have.

---

## Current Milestone: v2.0 — ADHD-Optimized UI Redesign

**Goal:** Implement the full ADHD-optimized UI from DESIGN_SYSTEM.md, replacing the single-page dashboard with a hub-and-spoke architecture, design tokens, and ADHD-first component patterns.

**Target features:**
- Design tokens (`--bb-*` CSS custom properties, calm color palette per DESIGN_SYSTEM.md §2)
- Hub-and-spoke navigation: bottom tab bar with Home / Budgets / Transactions / Settings
- New page structure: Home (hub) + three spoke pages alongside existing routes
- Safe-to-Spend as the primary hero metric
- ADHD-optimized components: KPI cards, budget progress bars, transaction items, empty states
- Existing component updates to consume new design tokens
- Non-judgmental copy pass across all user-facing strings

**Key constraints for this milestone:**
- shadcn/ui charts ONLY — no direct Recharts imports, no Tremor charts
- Legacy OopsBudgeter routes remain untouched and fully functional
- Additive-first: new routes live alongside existing dashboard
- No backend, DB, or auth changes

---

## Previous Milestone: v1.0 — UI Cleanup & Redesign Preparation ✅

Prepared the codebase for redesign work:
1. Structurally isolating legacy components (`components/legacy/`)
2. Removing Tremor (unmaintained), establishing shadcn/ui as primary framework
3. Consolidating UI library responsibilities (shadcn/ui new, Radix frozen, Base UI headless)
4. Creating comprehensive audit and handoff documentation

---

## Requirements

### Active — v2.0 ADHD-Optimized UI Redesign

- [x] Design tokens defined as CSS custom properties in `globals.css` *(Validated in Phase 6: Design Tokens)*
- [x] Hub-and-spoke navigation with persistent 4-tab bottom bar *(Validated in Phase 7: Layout Shell & Navigation)*
- [x] Home page (hub) shows Safe-to-Spend as primary metric *(Validated in Phase 8: Home Hub)*
- [x] Budgets spoke page with budget progress cards *(Validated in Phase 9: Spoke Pages)*
- [x] Transactions spoke page with transaction list *(Validated in Phase 9: Spoke Pages)*
- [x] Settings spoke page consolidating config and account management *(Validated in Phase 9: Spoke Pages)*
- [ ] New components: KPI card, budget progress card, transaction item, empty state, alert banner *(Phase 10)*
- [x] Existing components updated to use `--bb-*` design tokens *(Validated in Phase 9: token audit)*
- [ ] Non-judgmental copy pass across all user-facing strings *(Phase 11)*
- [x] Legacy OopsBudgeter routes remain untouched *(Verified continuously)*

### Validated — v1.0 UI Cleanup & Redesign Preparation ✅

- [x] Legacy components structurally isolated (`components/legacy/`)
- [x] Tremor removed; shadcn/ui established as primary framework
- [x] Library responsibilities documented and enforced in CLAUDE.md
- [x] Legacy OopsBudgeter fully functional
- [x] UI audit handoff documentation complete

### Out of Scope

- Backend logic changes
- Database schema changes
- Auth/session changes
- Real banking API integration (Fake-Finance-API stays)
- AI spending predictions (contraindicated by ADHD research)
- Achievements page redesign (deferred — separate research project)
- Push notifications or background jobs

---

## Constraints

### Hard Constraints (DO NOT VIOLATE)

1. **Do not break legacy OopsBudgeter** — All legacy routes and functionality must remain accessible and working.

2. **shadcn/ui charts ONLY** — No direct Recharts imports, no Tremor charts. shadcn/ui chart components are the only chart interface.

3. **Additive-first** — New routes/components live alongside existing code. No big-bang rewrites. Each phase leaves the app in a working state.

4. **No backend/DB/auth changes** — UI/UX scope only. If a routing or data change seems necessary, STOP and ASK.

5. **Commit discipline** — Small, focused commits after each meaningful change.

### Soft Constraints (Prefer but can discuss)

- Prefer shadcn/ui components over Base UI when shadcn/ui has coverage
- Prefer CSS custom properties (`--bb-*`) over hardcoded Tailwind values for design tokens
- Prefer composable patterns over monolithic components

---

## Key Decisions

| Decision | Choice | Rationale | Date |
|----------|--------|-----------|------|
| UI architecture | Hub-and-spoke, multi-page | ADHD research: 7+ sections = cognitive overload | 2026-04-16 |
| Primary metric | Safe-to-Spend | "How much can I spend?" is the #1 ADHD user question | 2026-04-16 |
| Color system | Desaturated, calm tones | Bright colors overstimulate; soft tones promote focus | 2026-04-16 |
| Budget model | Three buckets (Essentials/Discretionary/Savings) | ADHD research: 3 categories max for working memory | 2026-04-16 |
| Navigation | 4-tab bottom bar (always visible) | Consistent, predictable; reduces re-orientation load | 2026-04-16 |
| AI predictions | Excluded | Consistently wrong for ADHD users; creates preemptive shame | 2026-04-16 |
| Charts | shadcn/ui charts only | Actively developed; no direct Recharts or Tremor | 2026-05-19 |
| Tremor removal | Complete | Unmaintained (no commits 1+ year) | 2026-01-28 |
| Primary UI framework | shadcn/ui | Copy/paste model, actively maintained | 2026-01-28 |
| Legacy UI | Radix UI frozen | Legacy OopsBudgeter stays as-is | 2026-01-28 |

---

## Success Criteria

v2.0 is complete when:

- [x] Bottom tab bar renders on all four pages (Home, Budgets, Transactions, Settings) *(Phase 7)*
- [x] Home page shows Safe-to-Spend and budget status summary *(Phase 8)*
- [x] Budgets page shows all budget progress cards with ADHD-appropriate states *(Phase 9)*
- [x] Transactions page shows grouped transaction list *(Phase 9)*
- [x] Settings page consolidates budget config + account management *(Phase 9)*
- [x] All `--bb-*` design tokens defined and in use *(Phase 6 + Phase 9 token audit)*
- [ ] All user-facing strings pass the compassion/shame test *(Phase 11)*
- [x] Legacy routes (`/legacy`, `/analytics`, `/achievements`, `/dashboard`) still work *(Verified continuously)*
- [x] Build passes (`bun run build`) *(Verified 2026-05-22)*

---

## Team Context

- Junior developers — code must prioritize readability and explainability
- Clear section-level comments required in every new/modified file
- Non-trivial logic must explain what, why, and where to extend
- Design reference: `docs/DESIGN_SYSTEM.md` and `docs/ADHD_UX_RESEARCH.md`

---

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Evolution context with current state
