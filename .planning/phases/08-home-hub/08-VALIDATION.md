---
phase: 8
slug: home-hub
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
populated: 2026-05-20
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Populated from `08-RESEARCH.md` § Validation Architecture and `08-0*-PLAN.md` frontmatter after the planner Agent returned with all 6 plans on disk.
> `nyquist_compliant: true` will be flipped by gsd-plan-checker after approval.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `vitest@4.0.18` + `@testing-library/react@16.3.2` + `jsdom@27.4.0` + `@testing-library/jest-dom@6.9.1` |
| **Config file** | `vitest.config.ts` (root) — already configured (`include: ["tests/**/*.test.{ts,tsx}"]`, `environment: "jsdom"`) |
| **Quick run command** | `bun run test` (all vitest tests) — scoped: `bun run test tests/lib/ tests/utils/ tests/components/TransactionItem.test.tsx` |
| **Full suite command** | `bun run test && bun run typecheck && bun run build` |
| **Setup file** | `tests/setup.ts` — `ResizeObserver` stub + `jest-dom` matchers (loaded by `vitest.config.ts`) |
| **Estimated runtime** | ~5–8 seconds (quick) / ~25–35 seconds (full incl. typecheck + build) |

**No new framework install required** — vitest, Testing Library, and jsdom are configured and working (Phase 7 used them; `tests/components/` already has 5 existing test files as reference patterns).

---

## Sampling Rate

- **Per task commit:** `bun run test` (all vitest tests) + `bun run typecheck`
- **Per wave merge:** `bun run test && bun run typecheck && bun run build`
- **Phase gate (before `/gsd:verify-work`):** Full suite green + manual browser smoke of the home page in all 4 states (normal hub, 0-accounts, 0-budgets, 0-transactions)
- **Max feedback latency:** ~10 seconds (quick run) — well below the 30s Nyquist threshold

---

## Per-Task Verification Map

| Task / Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 08-00 (Wave 0 test scaffolding) | 0 | PAGE-01, PAGE-03, PAGE-08 | — | N/A — test stubs only | unit (stub) | `bun run test` — must complete without import errors | ❌ W0 | ⬜ pending |
| 08-01 (computeSafeToSpend) | 1 | PAGE-08 | T-08-01 (info disclosure via DB error) | DB error → caught, generic "Couldn't load data" rendered (no raw error) | unit (TDD: RED→GREEN) | `bun run test tests/lib/safe-to-spend.test.ts` | ❌ W0 → ✅ W1 | ⬜ pending |
| 08-02 (greeting helpers) | 1 | PAGE-01 | T-08-02 (XSS via name) | React default escaping; nameFromEmail returns string, no innerHTML | unit (TDD: RED→GREEN) | `bun run test tests/utils/greeting.test.ts` | ❌ W0 → ✅ W1 | ⬜ pending |
| 08-03 (currency formatter) | 1 | PAGE-03 | — | N/A — pure formatting | unit (TDD: RED→GREEN) | `bun run test tests/utils/currency.test.ts` | ❌ W0 → ✅ W1 | ⬜ pending |
| 08-04 (TransactionItem) | 2 | PAGE-03 | T-08-04 (server component, no user input handling) | Pure presentation; props are server-controlled DTO | render (TDD: RED→GREEN) | `bun run test tests/components/TransactionItem.test.tsx` | ❌ W0 → ✅ W2 | ⬜ pending |
| 08-05 (page.tsx rewrite) | 3 | PAGE-01, PAGE-02, PAGE-03, PAGE-07, PAGE-08 | T-08-05 (info disclosure inline error; open redirect /link-bank) | dataError → generic message; /link-bank is internal path; no user-controlled redirect | integration + build | `bun run test && bun run typecheck && bun run build` | ✅ (current page.tsx exists; being rewritten) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

**Per-plan dependency chain:** 08-00 → {08-01, 08-02, 08-03} → 08-04 → 08-05. Wave gates: Wave 0 must complete before Wave 1; Wave 1 must complete before Wave 2; Wave 2 must complete before Wave 3.

---

## Wave 0 Requirements

Wave 0 (plan `08-00-PLAN.md`) creates the following test scaffolding before any implementation begins. Each file gets `describe(...) + it.todo(...)` stubs covering the cases listed in RESEARCH.md § Validation Architecture (the TDD RED phase will replace `it.todo` with failing `it` tests).

- [ ] `tests/lib/safe-to-spend.test.ts` — covers PAGE-08 (7 cases: empty accounts, all-discretionary, all-essential, mixed types, credit excluded, investment excluded, over-budget clamping)
- [ ] `tests/utils/greeting.test.ts` — covers PAGE-01 greeting (7 `nameFromEmail` cases + 7 `greetingForTime` boundary cases at 5:00, 11:59, 12:00, 17:59, 18:00, 23:59, 04:59 Europe/Berlin)
- [ ] `tests/utils/currency.test.ts` — covers D-CUT-04 (zero, positive, large value, negative-input guard; matches legacy de-DE Intl.NumberFormat output byte-for-byte)
- [ ] `tests/components/TransactionItem.test.tsx` — covers PAGE-03 (income rendering with `+` prefix + `text-bb-positive`; expense rendering with U+2212 MINUS SIGN + `text-bb-negative`; date format "14 Apr"; merchant + category presence)
- [ ] `src/utils/` directory creation — per researcher: directory may not exist yet; Wave 0 task explicitly creates it (or first `utils/*.ts` write does so via implicit mkdir-p semantics — confirmed in plan `08-00-PLAN.md`)
- [ ] **Naming-conflict note:** new file is `src/utils/currency.ts` (NOT `src/utils/format.ts`) — rename per CONTEXT.md D-CMP-01 was applied during planning to avoid TS module resolution conflict with legacy `src/utils/format/index.ts`. Plan `08-03-PLAN.md` documents this decision in its summary footer.

**`src/components/dashboard/index.ts` re-export:** Plan `08-04-PLAN.md` adds `TransactionItem` to the barrel export.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hub renders the calm 4-section layout at 768px max-width | PAGE-01, PAGE-07 | Visual rendering needs real browser pixels | After Wave 3: `bun dev`, sign in, open `/` in Chrome at 375px, 768px, and 1280px viewport widths. Verify the 4 sections, the centered PageShell at ≥768px, the TabBar at the bottom (Phase 7 chrome). |
| 0-accounts state → full-screen "Link your bank" CTA replaces the hub | D-CUT-02 | Requires a live DB with zero linked accounts | Sign in as a fresh user (no accounts via Supabase dashboard) and open `/`. Verify the hub is replaced by a single centered card with the CTA → `/link-bank` link. |
| DB error edge state → hero shows `€—` + inline-bottom note, no red banner | D-CUT-02 | Hard to fake DB error in a unit test | Temporarily break `getAccounts()` (e.g., revoke RLS), open `/`. Verify `€—` in hero, inline `"Couldn't load data"` paragraph at page bottom, NO red banner at top. Restore RLS. |
| Dark-mode parity for hero + traffic-light dots + inline note | PAGE-07 | Visual contrast assertion | Toggle dark mode via the existing theme toggle, verify hero number readable on `--bb-bg` dark, traffic-light dots on dark surfaces still pass WCAG contrast, inline error note still legible. |

---

## Validation Sign-Off

- [ ] All tasks have `<acceptance_criteria>` with automated commands or Wave 0 test stub dependencies
- [ ] Sampling continuity: no 3 consecutive tasks/plans without an automated verify command (all 6 plans have one)
- [ ] Wave 0 covers all MISSING test files referenced by Wave 1+ plans
- [ ] No watch-mode flags in any task's automated command (`bun run test` is non-watch by default; `--watch` is not used)
- [ ] Feedback latency < 30s (quick run is ~5–8s)
- [ ] `nyquist_compliant: true` set in frontmatter (gsd-plan-checker flips this after approval)

**Approval:** pending (awaiting gsd-plan-checker)
