---
gsd_state_version: 1.0
milestone: v2.0
milestone_name: ADHD-Optimized UI Redesign
status: ready_to_plan
stopped_at: "Phase 8 (Home Hub) COMPLETE — 6/6 plans, verifier PASSED, all 4 manual smoke checks user-confirmed (2026-05-20). User noted hub feels 'a bit boring' — confirmed-intentional per DESIGN_SYSTEM P1 calm-over-comprehensive; visual interest lands in Phase 11 (motion + copy pass). Tailwind v4 source-scan fix applied in globals.css to unblock dev server."
last_updated: "2026-05-20T15:48:57.689Z"
last_activity: 2026-05-20 -- Phase 08 execution started
progress:
  total_phases: 6
  completed_phases: 2
  total_plans: 13
  completed_plans: 7
  percent: 33
---

# PROJECT STATE

## Project Reference

**Building:** ADHD-Optimized UI Redesign for BetterBudgeter
**Core Value:** A budget app that ADHD users actually keep using — because it meets them where they are instead of demanding executive function they don't have.

---

## Current Position

Phase: 08 (Home Hub) — EXECUTING
Plan: 1 of 6
Status: Executing Phase 08
Last activity: 2026-05-20 -- Phase 08 execution started

## Phase Overview

```
Milestone: ADHD-Optimized UI Redesign
├── Phase 6: Design Tokens ✅ COMPLETE (3/3 plans done, build passes)
├── Phase 7: Layout Shell & Navigation ✅ COMPLETE (4/4 plans done, verifier passed 5/5)
├── Phase 8: Home Hub ✅ COMPLETE (6/6 plans, verifier 5/5 + 14/14 decisions, smoke 4/4 passed)
├── Phase 9: Spoke Pages ⬜ NOT STARTED
├── Phase 10: Component System ⬜ NOT STARTED
└── Phase 11: Copy, Accessibility & Motion ⬜ NOT STARTED
```

---

## Recent Decisions (v2.0)

| Decision | Choice | Date |
|----------|--------|------|
| Milestone scope | UI/UX only — no backend, DB, auth changes | 2026-05-19 |
| Phase numbering | Start at 6 (v1.0 ended at Phase 5) | 2026-05-19 |
| Charts constraint | shadcn/ui charts ONLY — no direct Recharts imports, no Tremor | 2026-05-19 |
| Token strategy | `--bb-*` alongside shadcn/ui variables, not replacing them | 2026-05-19 |
| Navigation pattern | 4-tab bottom bar — Home, Budgets, Transactions, Settings | 2026-05-19 |
| Home page model | Hub (4 sections only) — complex content lives on spoke pages | 2026-05-19 |
| Safe-to-Spend | Computed in `lib/safe-to-spend.ts`, NOT raw balance | 2026-05-19 |
| Spending by Category chart | Migrated from Home → Budgets page | 2026-05-19 |
| Linked Accounts | Migrated from Home → Settings page | 2026-05-19 |
| Legacy routes | Never touched — `/legacy`, `/analytics`, `/achievements` stay as-is | 2026-05-19 |

---

## Previous Milestone Decisions (v1.0 — archived)

| Decision | Choice | Date |
|----------|--------|------|
| Project scope | UI/UX only, no backend/routing | 2026-01-24 |
| Legacy isolation approach | Structural (components/legacy/) | 2026-01-24 |
| File move strategy | git mv to preserve history | 2026-01-27 |
| Dual Logo strategy | Maintain both OopsBudgeter and BetterBudgeter versions | 2026-01-27 |
| Import path pattern | Absolute paths (@/components/*) over relative | 2026-01-27 |
| Tremor decision | Remove entirely — unmaintained (no commits in 1+ year) | 2026-01-28 |
| Primary UI framework | shadcn/ui (copy/paste model, actively maintained) | 2026-01-28 |
| New BB primitives | Base UI (modern successor to Radix, v1.0 stable Dec 2025) | 2026-01-28 |
| Legacy primitives | Radix UI stays for legacy OopsBudgeter only | 2026-01-28 |
| Charts | shadcn/ui charts (Recharts under the hood) | 2026-01-28 |

---

## Pending Todos

- Run `/gsd:discuss-phase 9` (or `/gsd:plan-phase 9`) to start Phase 9: Spoke Pages (Budgets, Transactions, expanded Settings)
- Optional: document PSD2 storage-grounds analysis in `docs/PSD2_MOCK_STRATEGY.md` for Projektdokumentation

---

## Blockers / Concerns

- None currently

---

## Session Continuity

**Last session:** 2026-05-20
**Stopped at:** Phase 8 (Home Hub) COMPLETE — 6/6 plans, verifier PASSED, all 4 manual smoke checks user-confirmed. User comment: hub feels "a bit boring" — confirmed-intentional per DESIGN_SYSTEM P1 (calm over comprehensive) and deferred to Phase 11 (motion + copy pass) for any added visual interest. Phase 11 will revisit. One incidental fix during smoke: globals.css `@import "tailwindcss" source("../../src")` to stop Tailwind v4 from scanning `.planning/` (literal `pb-[env(...)]` placeholder in 07-02-PLAN.md was being turned into invalid CSS).
**Resume with:** `/gsd:discuss-phase 9` or `/gsd:plan-phase 9` for Spoke Pages (Budgets, Transactions, expanded Settings).
**Resume file:** `.planning/phases/08-home-hub/08-VERIFICATION.md`

---

## Quick Context

```
Milestone v1.0: UI Cleanup & Redesign Preparation ✅ COMPLETE (Phases 1–5)

Milestone v2.0: ADHD-Optimized UI Redesign — IN PROGRESS
├── Phase 6: Design Tokens (TOKEN-01 to TOKEN-07)
│   Goal: All --bb-* CSS custom properties defined in globals.css
├── Phase 7: Layout Shell & Navigation (NAV-01 to NAV-06)
│   Goal: Tab bar + PageShell + PageHeader available and wired up
├── Phase 8: Home Hub (PAGE-01, PAGE-02, PAGE-03, PAGE-07, PAGE-08)
│   Goal: Home page restructured as hub with Safe-to-Spend hero
├── Phase 9: Spoke Pages (PAGE-04, PAGE-05, PAGE-06, PAGE-09)
│   Goal: Budgets, Transactions, Settings pages built and functional
├── Phase 10: Component System (COMP-01 to COMP-09)
│   Goal: Full ADHD-optimized component library in use
└── Phase 11: Copy, Accessibility & Motion (COPY, A11Y, MOTION)
    Goal: Shame-free copy, WCAG 2.2 AA, functional motion only
```
