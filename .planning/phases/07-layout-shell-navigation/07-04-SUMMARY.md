---
phase: 07-layout-shell-navigation
plan: "04"
subsystem: app-router-layout/bb-chrome
tags: [layout, route-groups, bb-chrome, tabbar, page-stubs, D-06, D-07, D-08]
dependency_graph:
  requires:
    - "src/components/layout/PageShell.tsx (Plan 01 — D-11)"
    - "src/components/layout/TabBar.tsx (Plan 02 — D-09 + D-10)"
    - "src/app/(legacy)/layout.tsx (Plan 03 — D-04)"
  provides:
    - "src/app/(bb)/layout.tsx — BB chrome: PageShell + TabBar (D-06)"
    - "src/app/(bb)/page.tsx — Home relocated (D-07)"
    - "src/app/(bb)/settings/page.tsx — Settings relocated (D-07)"
    - "src/app/(bb)/budgets/page.tsx — /budgets stub (D-07 + D-08)"
    - "src/app/(bb)/transactions/page.tsx — /transactions stub (D-07 + D-08)"
  affects:
    - "D-01 two-route-group split now complete: (legacy)/ + (bb)/"
    - "All 4 BB URLs now render with TabBar via (bb)/layout.tsx (D-06)"
    - "NAV-01, NAV-02, NAV-03, NAV-05, NAV-06 now observable in browser"
tech_stack:
  added: []
  patterns:
    - "Next.js App Router (bb)/ route group for BB chrome isolation"
    - "git mv for file relocation (preserves blame — R098/R096 renames in git log)"
    - "<main> → <div> downgrade in relocated pages (Pitfall 5 — PageShell provides the single landmark)"
    - "Fragment return (<>) in stub pages — no outer element, PageShell provides <main>"
key_files:
  created:
    - "src/app/(bb)/layout.tsx"
    - "src/app/(bb)/budgets/page.tsx"
    - "src/app/(bb)/transactions/page.tsx"
  modified:
    - "src/app/(bb)/page.tsx (moved + <main> → <div>)"
    - "src/app/(bb)/settings/page.tsx (moved + <main> → <div>)"
  moved:
    - "src/app/page.tsx → src/app/(bb)/page.tsx (R098)"
    - "src/app/settings/page.tsx → src/app/(bb)/settings/page.tsx (R096)"
decisions:
  - "D-01: (bb)/ route group created — two-route-group split complete alongside (legacy)/ from Plan 03"
  - "D-06: (bb)/layout.tsx is a server component composing <PageShell>{children}<TabBar /></PageShell> exactly"
  - "D-07: Home and Settings relocated via git mv with outer <main> downgraded to <div> (Pitfall 5 mitigation)"
  - "D-08: Stub copy locked verbatim — titles, subtitles, body placeholders match CONTEXT.md D-08 exactly"
  - "D-13: src/middleware.ts byte-identical — git diff HEAD src/middleware.ts = 0 bytes"
metrics:
  duration: "~15 minutes"
  completed: "2026-05-19"
  tasks_completed: 2
  tasks_total: 3
  files_created: 3
  files_modified: 2
  files_moved: 2
---

# Phase 7 Plan 04: BB Chrome Wiring + Page Stubs Summary

**One-liner:** Wire BB chrome (D-06: PageShell + TabBar layout), relocate Home and Settings into `(bb)/` via git mv with `<main>` → `<div>` downgrade (D-07 Pitfall 5), and create stub pages for `/budgets` and `/transactions` with locked D-08 copy and SECURITY NOTE comments.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create (bb)/layout.tsx (D-06) + move Home & Settings (D-07) | `c1b24cc` | `src/app/(bb)/layout.tsx`, `src/app/(bb)/page.tsx`, `src/app/(bb)/settings/page.tsx` |
| 2 | Create stub pages /budgets and /transactions (D-07 + D-08) | `2cfaed3` | `src/app/(bb)/budgets/page.tsx`, `src/app/(bb)/transactions/page.tsx` |
| 3 | Human smoke-test checkpoint | — | Awaiting browser verification |

## Files Created / Modified / Moved

### Created
- `src/app/(bb)/layout.tsx` — Server component per D-06. Composes `<PageShell>{children}<TabBar /></PageShell>`. No `"use client"` directive. No legacy providers.
- `src/app/(bb)/budgets/page.tsx` — Stub per D-07 + D-08. Fragment return, `PageHeader` + locked placeholder body, SECURITY NOTE comment.
- `src/app/(bb)/transactions/page.tsx` — Stub per D-07 + D-08. Fragment return, `PageHeader` + locked placeholder body, SECURITY NOTE comment.

### Moved (via git mv — rename detected by git)
- `src/app/page.tsx` → `src/app/(bb)/page.tsx` (R098 — outer `<main>` downgraded to `<div>`)
- `src/app/settings/page.tsx` → `src/app/(bb)/settings/page.tsx` (R096 — outer `<main>` downgraded to `<div>`)

## D-07: Pitfall 5 — zero `<main>` JSX tags in moved pages

`<main>` → `<div>` downgrade applied to both relocated pages. PageShell (from `(bb)/layout.tsx` per D-06) now provides the single `<main>` landmark for the route, preventing a duplicate-landmark a11y violation.

**Home page (`src/app/(bb)/page.tsx`):**
```
grep -n '<main\b\|</main>' "src/app/(bb)/page.tsx" | grep -v '//'
(no output — zero JSX <main> tags; 1 comment-line reference only)
```

**Settings page (`src/app/(bb)/settings/page.tsx`):**
```
grep -n '<main\b\|</main>' "src/app/(bb)/settings/page.tsx" | grep -v '//'
(no output — zero JSX <main> tags; 1 comment-line reference only)
```

## D-06: Confirmation — (bb)/layout.tsx composition

```tsx
// src/app/(bb)/layout.tsx (excerpt)
import { PageShell } from "@/components/layout/PageShell";
import { TabBar } from "@/components/layout/TabBar";

export default function BBLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      {children}
      <TabBar />
    </PageShell>
  );
}
```

- No `"use client"` directive: `head -1 layout.tsx | grep -c "use client"` → 0 (PASS)
- Imports PageShell: 1 (PASS)
- Imports TabBar: 1 (PASS)
- Renders `<PageShell>`: 2 hits (open + close) (PASS)
- Renders `<TabBar`: 2 hits (PASS)

## D-07: Git Rename Detection Confirmed

`git show --name-status c1b24cc` output:
```
R098    src/app/page.tsx        src/app/(bb)/page.tsx
R096    src/app/settings/page.tsx       src/app/(bb)/settings/page.tsx
```

Both moves recorded as renames (R-prefix) — blame history preserved per project rules (CLAUDE.md Rule 10).

## D-13: middleware.ts unchanged

`git diff HEAD src/middleware.ts` → empty (0 bytes output). Middleware byte-identical to pre-Plan-04 state. Route groups are URL-transparent; no middleware changes needed.

## Typecheck Status

`bun run typecheck` → exit 0 (no TypeScript errors) after clearing stale `.next/` cache from pre-move state.

## Decision Coverage

| Decision | Status |
|----------|--------|
| D-01 | Complete — `(bb)/` route group created; both groups (`(bb)/` + `(legacy)/`) now exist |
| D-06 | Implemented — `(bb)/layout.tsx` server component with PageShell + TabBar |
| D-07 | Implemented — Home and Settings relocated via git mv; stubs for budgets + transactions created |
| D-08 | Implemented — Locked D-08 copy verbatim in both stubs |
| D-13 | Confirmed — middleware.ts untouched; git diff = 0 bytes |
| D-14 | To be verified — `/dashboard` 308 redirect in Task 3 smoke test |

## Task 3: Human Smoke-Test Checkpoint

**Status: PENDING** — Awaiting browser verification of all 11 URLs.

The full verification checklist is in the plan's Task 3 `<how-to-verify>` section. Key checks:

| Category | URLs | Expected |
|----------|------|----------|
| BB routes (4) | `/`, `/budgets`, `/transactions`, `/settings` | TabBar visible, correct active tab per D-06 + D-10 |
| Legacy routes (5) | `/legacy`, `/analytics`, `/achievements`, `/legacy-index`, `/dashboard` | Legacy chrome (D-04), NO TabBar (NAV-04) |
| Standalone routes (2) | `/login`, `/link-bank` | NO TabBar, NO legacy chrome (D-02, NAV-06) |
| D-14 | `/dashboard` via curl | 308 redirect to `/` |

## Known Stubs

- `src/app/(bb)/budgets/page.tsx` — Intentional stub per D-08. Phase 9 (PAGE-04) will replace the placeholder with real budget data.
- `src/app/(bb)/transactions/page.tsx` — Intentional stub per D-08. Phase 9 (PAGE-05) will replace with real transaction history.

Both stubs contain SECURITY NOTE comments flagging that `/budgets` and `/transactions` must be added to `src/middleware.ts` matchers when real user data is added in Phase 9.

## RESEARCH Open Q2 — Lucide Filled-Icon Visual Quality

To be observed during Task 3 smoke test. The TabBar uses `fill="currentColor" strokeWidth={0}` for active icons. If any of the 4 icons (House, ChartPie, List, Settings) looks like a solid blob (interior cutouts disappear), that is a Phase 11 follow-up, not a Phase 7 blocker.

## Threat Flags

No new security surface beyond what is documented in the plan's `<threat_model>`.

- T-07-10: `/budgets` and `/transactions` are public stubs — accepted (static text only, no PII/auth-gated data)
- T-07-13: Auth gating for `/` and `/settings` preserved — middleware matches URLs, not file paths (D-13)
- T-07-14: Double-`<main>` prevented — Pitfall 5 mitigation applied and verified

## Self-Check

| Check | Result |
|-------|--------|
| `src/app/(bb)/layout.tsx` exists | PASS |
| `src/app/(bb)/page.tsx` exists | PASS |
| `src/app/(bb)/settings/page.tsx` exists | PASS |
| `src/app/(bb)/budgets/page.tsx` exists | PASS |
| `src/app/(bb)/transactions/page.tsx` exists | PASS |
| `src/app/page.tsx` (old path) gone | PASS |
| `src/app/settings/` (old dir) gone | PASS |
| layout.tsx has no `"use client"` | PASS (count=0) |
| layout.tsx imports PageShell + TabBar | PASS (count=1 each) |
| Home page: zero JSX `<main>` tags | PASS |
| Settings page: zero JSX `<main>` tags | PASS |
| D-08 copy verbatim in budgets stub | PASS |
| D-08 copy verbatim in transactions stub | PASS |
| SECURITY NOTE in both stubs | PASS (count=1 each) |
| git records Home move as rename | PASS (R098) |
| git records Settings move as rename | PASS (R096) |
| `bun run typecheck` exits 0 | PASS |
| `git diff HEAD src/middleware.ts` = 0 bytes | PASS (D-13) |
| Task 1 commit `c1b24cc` exists | PASS |
| Task 2 commit `2cfaed3` exists | PASS |

## Self-Check: PASSED
