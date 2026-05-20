---
phase: 7
slug: layout-shell-navigation
status: audited
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-19
audited: 2026-05-20
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest@4.0.18 + @testing-library/react@16.3.2 + jsdom@27.4.0 + @testing-library/jest-dom@6.9.1 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `bun run test` |
| **Full suite command** | `bun run test && bun run typecheck && bun run build` |
| **Estimated runtime** | ~30 seconds (test + typecheck + build) |

---

## Sampling Rate

- **After every task commit:** Run `bun run test` (+ `bun run typecheck` for type-touching tasks)
- **After every plan wave:** Run `bun run test && bun run typecheck && bun run build`
- **Before `/gsd:verify-work`:** Full suite must be green + manual smoke of all 11 URLs in browser (4 BB + 5 legacy + 2 standalone)
- **Max feedback latency:** ~30 seconds

---

## Per-Task Verification Map

> Filled in by gsd-planner during plan creation. Each plan task must map to a row here or declare Wave 0 dependency.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-02 T1–T3 | 07-02 | 1 | NAV-01,02,03 | — | TabBar renders 4 tabs, active state correct, hrefs match TABS | unit | `bun run test tests/components/TabBar.test.tsx` | ✅ | ✅ green (7/7) |
| 07-01 T1 | 07-01 | 1 | NAV-05 | — | PageShell wraps children with max-width + bottom-padding classes | unit | `bun run test tests/components/PageShell.test.tsx` | ✅ | ✅ green (4/4) |
| 07-01 T2 | 07-01 | 1 | NAV-05 | — | PageHeader renders title; subtitle conditional | unit | `bun run test tests/components/PageHeader.test.tsx` | ✅ | ✅ green (4/4) |
| 07-03 T1–T3 | 07-03 | 1 | NAV-04 | — | All legacy routes resolve (build-time) | build | `bun run build` | n/a | ✅ green |
| 07-04 T3 | 07-04 | 2 | NAV-06 | — | `/login` and `/link-bank` render without TabBar | integration/manual | `bun run build` + manual smoke | n/a | ✅ user-approved 2026-05-19 (manual) |
| 07-04 T3 | 07-04 | 2 | NAV-03 (scroll memory) | — | Each tab remembers scroll position | **manual-only** | post-deploy device test | n/a | ⬜ manual-only (deferred to post-deploy) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/components/TabBar.test.tsx` — covers NAV-01, NAV-02, NAV-03 (`<Link>` href correctness; mocked `usePathname`) — **7/7 green**
- [x] `tests/components/PageShell.test.tsx` — covers NAV-05 (render + class assertions) — **4/4 green**
- [x] `tests/components/PageHeader.test.tsx` — covers NAV-05 (title + optional subtitle) — **4/4 green**
- [ ] Optional: `tests/smoke/legacy-routes.test.ts` — skipped; NAV-04 build-time coverage provided by `bun run build` (full SSR test out-of-scope per original plan)

**No new framework install required** — vitest, Testing Library, jsdom are already configured.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Each tab remembers scroll position | NAV-03 | App Router doesn't expose a hook for scroll memory; integration test would require Playwright (out of scope for Phase 7) | Scroll down on `/`, switch to `/budgets`, switch back to `/` — scroll position retained |
| `/login` and `/link-bank` render without TabBar | NAV-06 | Visual verification more reliable than DOM assertion across edge cases | Open both URLs in browser, confirm no bottom tab bar present |
| `/dashboard` 308 redirect to `/` | NAV-04 | HTTP-level integration | `curl -I http://localhost:3031/dashboard` → 308 with `Location: /` |
| Active tab visual styling (`--bb-info`, filled icon) | NAV-02 | Class assertion covered by unit test; visual rendering of filled icon variant verified by eye | Open all 4 tabs, confirm active tab is highlighted with correct color + filled lucide icon |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (TabBar, PageShell, PageHeader test files)
- [x] No watch-mode flags
- [x] Feedback latency < 30s (measured: ~717ms for the 3 Wave-0 test files)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** audited 2026-05-20 — all automated coverage in place; declared manual-only items documented above.

---

## Validation Audit 2026-05-20

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 (none needed — Wave-0 tests already landed in 07-01 and 07-02) |
| Escalated | 0 |
| Manual-only (carried) | 3 (scroll memory, /dashboard 308 redirect curl, /login + /link-bank visual no-TabBar) |

**Coverage map at audit time:**

| Requirement | Automated | Manual |
|-------------|-----------|--------|
| NAV-01 | ✅ TabBar.test.tsx | — |
| NAV-02 | ✅ TabBar.test.tsx | partial (filled-icon visual) |
| NAV-03 (Link hrefs) | ✅ TabBar.test.tsx | — |
| NAV-03 (scroll memory) | ❌ (out-of-scope for vitest+jsdom) | ✅ deferred to post-deploy |
| NAV-04 (legacy routes) | ✅ `bun run build` | partial (308 curl smoke) |
| NAV-05 | ✅ PageShell.test.tsx + PageHeader.test.tsx | — |
| NAV-06 | ❌ (visual) | ✅ user-approved 2026-05-19 |

**Result:** Nyquist-compliant within declared manual-only scope. No new tests generated; no auditor spawn needed.
