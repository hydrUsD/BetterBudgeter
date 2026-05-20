---
phase: 8
slug: home-hub
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-20
---

# Phase 8 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Populated by gsd-planner from `08-RESEARCH.md` § Validation Architecture during plan-phase. Approved by gsd-plan-checker before execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | {pending — planner fills from RESEARCH.md (likely vitest based on Phase 7)} |
| **Config file** | {pending} |
| **Quick run command** | `{pending}` |
| **Full suite command** | `{pending}` |
| **Estimated runtime** | ~{N} seconds |

---

## Sampling Rate

- **After every task commit:** Run `{quick run command}`
- **After every plan wave:** Run `{full suite command}`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** {N} seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| {pending — planner populates from per-plan tasks} | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

{Planner fills from RESEARCH.md § Validation Architecture. Expected gaps per researcher findings:}
- [ ] `tests/lib/safe-to-spend.test.ts` — unit coverage for PAGE-08 (formula, essential clamping, account type filter, empty/missing inputs)
- [ ] `tests/utils/greeting.test.ts` — unit coverage for nameFromEmail edge cases + greetingForTime 3 time-band boundaries (Europe/Berlin)
- [ ] `tests/utils/format.test.ts` — unit coverage for formatCurrency (zero, large values, locale de-DE)
- [ ] `tests/components/TransactionItem.test.tsx` — render coverage for income/expense types, all categories, view-model props
- [ ] `src/utils/` directory creation (per researcher: may not exist yet)
- [ ] {pending — planner adds remaining gaps from RESEARCH.md}

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| {pending — planner identifies any manual-only checks (e.g., visual hub rendering at 768px max-width)} | | | |

*Candidates from CONTEXT.md D-CUT-02 edge states:*
- 0-accounts full-screen CTA replaces hub (E2E candidate, but possibly manual smoke if Playwright not yet wired)
- DB error inline-bottom rendering (E2E candidate)

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < {N}s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
