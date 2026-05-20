---
phase: 8
phase_name: "Home Hub"
project: "BetterBudgeter — ADHD-Optimized Budget App"
generated: "2026-05-20"
counts:
  decisions: 8
  lessons: 5
  patterns: 5
  surprises: 5
missing_artifacts:
  - "08-UAT.md"
---

# Phase 8 Learnings: Home Hub

## Decisions

### Hardcode `ESSENTIAL_CATEGORIES` as a const (not a DB column)
The Safe-to-Spend formula needs to know which budget categories are "essential" obligations. We hardcoded `ESSENTIAL_CATEGORIES = ['Rent', 'Utilities', 'Food', 'Transport'] as const` in `src/lib/safe-to-spend.ts`.

**Rationale:** The CLAUDE.md "DB as single source of truth" rule applies to *user-owned data* (transactions, balances, budget limits) — not to *policy / business rules* (the category enum itself is already hardcoded in `src/types/finance.ts`; `BUDGET_THRESHOLDS` is already hardcoded in `src/lib/budgets/index.ts`). "Essential" is the same kind of classification, baked into code by precedent. A future migration to a per-budget `is_essential` boolean is captured as a v3+ TODO with explicit prerequisites (ADR + schema migration + settings UI).
**Source:** 08-CONTEXT.md (D-S2S-01), 08-DISCUSSION-LOG.md

---

### `TransactionItem` accepts a view-model object, not a DB row
The component's props are `{merchant, amount, type, category, date}` — a presentation DTO decoupled from the `bb_transactions` schema. The page maps DB rows to this shape before passing in.

**Rationale:** Decoupling enables (a) trivial unit tests with no DB dependency, (b) Phase 9's `/transactions` page can feed from a different query without changing the component, (c) matches the existing `BudgetProgress` DTO pattern from `src/lib/budgets/`.
**Source:** 08-CONTEXT.md (D-CMP-02), 08-04-PLAN.md, 08-04-SUMMARY.md

---

### Hybrid extraction: only `TransactionItem` extracted to a component file
Phase 8 created exactly one new dashboard component (`TransactionItem.tsx`). The Safe-to-Spend hero JSX and the compact `BudgetStatusRow` list are *inline* in `src/app/(bb)/page.tsx`. `BudgetStatusRow` is a private function in the same file (used exactly once).

**Rationale:** `TransactionItem` has clear cross-phase reuse (Home Phase 8 + Transactions page Phase 9). The hero and budget rows are Home-only, and Phase 10 owns the generic primitives (KPI Card, Budget Progress Card, etc.) — extracting the hero now would lock the KPI Card API before Phase 10 designs it. Inlining preserves Phase 10's freedom and avoids premature abstraction.
**Source:** 08-CONTEXT.md (D-CMP-01, D-CMP-03), 08-05-SUMMARY.md

---

### Replace `(bb)/page.tsx` outright in a single Phase 8 commit
No `?hub=true` feature flag, no parallel `/dashboard-classic` route. Spending-by-Category chart and Linked Accounts list were *removed* from Home; Phase 9 re-hosts them on spoke pages.

**Rationale:** The OopsBudgeter dashboard is preserved at `/legacy` (Phase 7 D-04), so no functionality is lost. A clean rewrite produces a small, reviewable diff. Migration content is Phase 9's responsibility.
**Source:** 08-CONTEXT.md (D-CUT-01), 08-05-SUMMARY.md, 08-VERIFICATION.md

---

### Edge-state policy: full-screen CTA for 0-accounts, inline for others, never a red banner for DB errors
- **0 accounts** → REPLACE the hub with a full-screen "Link your bank to get started" card.
- **0 budgets / 0 transactions / DB error** → keep the hub structure; show inline empty states.
- DB errors render a small `<p>` at the *bottom* of the page with "Couldn't load data. Try refreshing." — never a red banner at the top.

**Rationale:** DESIGN_SYSTEM §5.5 "max 1 banner" + principle P1 "calm over comprehensive". A red top banner contradicts both. The 0-accounts case is the only legitimate hub replacement because nothing in the hub is meaningful without an account.
**Source:** 08-CONTEXT.md (D-CUT-02), 08-VERIFICATION.md

---

### Server-side greeting compute with hardcoded `Europe/Berlin` timezone
`greetingForTime(now: Date)` accepts a Date; the page computes "now" in Europe/Berlin via `Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin' })`. Vercel's UTC server default would otherwise mis-band the greeting.

**Rationale:** School-project user base is known to be in DE. Future i18n milestone will swap the hardcode for user-controlled timezone. Server-side compute avoids hydration flash and matches Phase 7's server-component-first pattern.
**Source:** 08-CONTEXT.md (D-GR-03, D-GR-04), 08-02-SUMMARY.md

---

### Filename rename: `format.ts` → `currency.ts` (planning-time decision)
The new EUR formatter lives at `src/utils/currency.ts`, not the originally-specified `src/utils/format.ts`.

**Rationale:** The legacy `src/utils/format/index.ts` (USD-defaulting 3-param helper) already exists. Creating a flat `src/utils/format.ts` alongside would create TypeScript module-resolution ambiguity (`.ts` file vs directory `index.ts`). Renaming to `currency.ts` eliminates the conflict at the source and is also a more accurate name. The rename was documented in CONTEXT.md, PATTERNS.md, RESEARCH.md, VALIDATION.md, and 08-03-PLAN.md interfaces before execution started.
**Source:** 08-03-SUMMARY.md, 08-PATTERNS.md "Naming conflict note", 08-RESEARCH.md finding 6

---

### Upgrade to `Promise.all` for the 3 page-level DB fetches
`src/app/(bb)/page.tsx` parallelizes `getAccounts()`, `getRecentTransactions(5)`, and `calculateAllBudgetProgress()` via `Promise.all`. `getUser()` is called separately *before* the Promise.all because the greeting must render even on DB error.

**Rationale:** The legacy page's sequential `await` pattern stacked 3 round-trips. `Promise.all` reduces home-page time-to-render by the cumulative DB latency. Pattern mirrors `calculateAllBudgetProgress()`'s own use of `Promise.all([getBudgets(), calculateMonthlySpending()])`.
**Source:** 08-05-PLAN.md, 08-VERIFICATION.md (line 248–252 of page.tsx)

---

## Lessons

### `BudgetProgress.remainingAmount` is already clamped at zero — don't double-clamp
`calculateAllBudgetProgress()` in `src/lib/budgets/index.ts:174` applies `Math.max(0, ...)` before returning. Safe-to-Spend uses `p.remainingAmount` directly. Adding a second `Math.max(0, ...)` inside `computeSafeToSpend()` would be redundant noise; CONTEXT D-S2S-02's clamp guidance is about *not re-introducing negatives*, not about layering a second clamp on top of the first.

**Context:** Discovered during research (08-RESEARCH.md Pitfall 2). Documented in `safe-to-spend.ts` as an inline comment referencing the source line so future readers don't re-add the redundant clamp. Acceptance criteria included an explicit assertion that the duplicate clamp does NOT appear.
**Source:** 08-RESEARCH.md, 08-01-SUMMARY.md

---

### `DbAccount` uses `account_type` (snake_case), not `type`
Filtering accounts by liquidity uses `acc.account_type === 'checking' || acc.account_type === 'savings'`. Reading `acc.type` returns `undefined` — a silent bug that no compile-time check catches.

**Context:** Snake-case lives on because the field maps to a Postgres column name via Supabase's auto-generated types. Easy to miss when reading `getAccounts()` callsites since the DTO sometimes camel-cases similar fields. Caught by Phase 7's research and a unit test in 08-01 that asserts the literal `'checking'` / `'savings'` strings exist in the source.
**Source:** 08-RESEARCH.md Pitfall 1, 08-01-SUMMARY.md, 08-VERIFICATION.md

---

### `<SyncTransactionsButton accountCount={0}>` renders "Link a Bank" itself — don't reuse it for the 0-accounts CTA
The component is dual-purpose. When `accountCount={0}` it renders its own "Link a Bank" affordance. Reusing it for the 0-accounts full-screen CTA would have produced unexpected button labeling and bypassed the primary-button design intent. The 0-accounts CTA must instead use a direct `<Link href="/link-bank"><Button>Link your bank</Button></Link>`.

**Context:** Found during research (08-RESEARCH.md Pitfall 7). Caught early enough to bake into 08-05-PLAN.md's action and acceptance criteria. The verifier confirmed the implementation uses the direct Link+Button on page.tsx line 312.
**Source:** 08-RESEARCH.md, 08-05-PLAN.md, 08-VERIFICATION.md

---

### Naive substring assertions on source files match comment text
`expect(first200).not.toContain("use client")` triggered a false positive in the `TransactionItem.test.tsx` NO_CLIENT_DIRECTIVE test — the file's header comment mentions `"use client"` as guidance to readers. The substring check found the quoted text inside a comment, not a real directive.

**Context:** The test was caught by the GREEN-phase run (13/14 passed; one failure on what should have been a trivial assertion). Fix: switch to a line-anchored multiline regex `/^["']use client["']/m` that only matches the directive when it appears as a quoted string literal at line start.
**Source:** 08-04-SUMMARY.md (Auto-fixed Issues §1)

---

### Worktrees do NOT inherit gitignored files — `.env.local` must be copied manually
The Wave 3 executor's worktree (`agent-aa43f8c740a92e7c6`) couldn't run `bun run build` because `.env.local` is gitignored and isolated worktrees start from a clean checkout. Next.js static generation calls `createServerSupabaseClient()` at build time, which throws "Missing Supabase environment variables".

**Context:** Caught at build attempt #2 during 08-05 execution. Fix: `cp ../../.env.local .env.local` inside the worktree (not committed, since the file is gitignored for security). Worth bake-in for the orchestrator: any phase that builds inside a worktree needs the same setup step.
**Source:** 08-05-SUMMARY.md (Auto-fixed Issues §2)

---

## Patterns

### Two-layer module split: pure compute function + DB-orchestration wrapper
Modules that need DB data expose two layers: an *inner pure function* that takes already-fetched data as parameters (testable in isolation), and an *outer wrapper* that fetches and calls the inner. Phase 8's `computeSafeToSpend(accounts, budgetProgress)` mirrors `getBudgetStatus(usagePercentage)` from `src/lib/budgets/index.ts`. The page assembles the data via `Promise.all` and passes it to the pure function — keeps the I/O concern at the page boundary.

**When to use:** Any time a calculation needs >1 DB call to gather inputs. The two-layer split makes the formula unit-testable without mocks, and keeps the orchestration concern at the page layer where it naturally lives.
**Source:** 08-PATTERNS.md (lib/budgets/index.ts:158-192 analog), 08-01-SUMMARY.md

---

### Wave 0 test scaffolding via `it.todo()` stubs
Before any TDD plan starts its RED phase, Wave 0 creates the test FILE with `describe` blocks and `it.todo()` placeholders for every planned case. Vitest 4 defers module resolution for `it.todo`, so the suite collects cleanly even before the implementation files exist. Wave 1's TDD plans then *replace* the todos with failing `it` tests (RED), then make them pass (GREEN).

**When to use:** Any TDD phase with parallel plans. The pre-scaffolding eliminates the "module not found" failure that would otherwise block Wave 1's RED phase — without it, TDD plans can't run before their source files exist.
**Source:** 08-00-PLAN.md, 08-00-SUMMARY.md

---

### View-model DTOs for presentational components (decouple from DB)
Presentational components accept a view-model object shaped for the view's needs, NOT the raw DB row. The page maps DB rows to view-models before render. Phase 8's `TransactionItem` accepts `{merchant, amount, type, category, date}`; the page maps `tx.description → merchant`, `tx.booking_date → date`, etc.

**When to use:** Any component that could be reused with different data sources, or whose tests should be free of DB dependencies. Matches the existing `BudgetProgress` DTO pattern in `src/types/finance.ts`.
**Source:** 08-CONTEXT.md (D-CMP-02), 08-04-PLAN.md

---

### File-header comment convention: purpose → key decisions → data flow → `@see` refs
Every new file in this project opens with a multi-block JSDoc-style docblock: a one-line purpose statement, a "Key Decisions" block naming each design choice in the file, a "Data Flow" block, and `@see` pointers to relevant docs. Mirrors `src/lib/budgets/index.ts:1-20`. Junior-dev-friendly per CLAUDE.md.

**When to use:** Every new source file. Tedious to skip; pays off the first time anyone has to read the file cold. Code review reliably catches missing headers.
**Source:** 08-PATTERNS.md, CLAUDE.md §"Code Style & Comments"

---

### Server-component-first with surgical client islands
`src/app/(bb)/page.tsx` is a pure server component. The only client island on the page is `<SyncTransactionsButton>` (kept from the legacy dashboard as-is). Greeting computation, data fetches, edge-state branching, and rendering all happen on the server.

**When to use:** Next.js App Router pages that don't need browser-only APIs. Greatly reduces hydration cost and JS bundle size, and avoids the `<Suspense>` / `useSearchParams` foot-gun called out in Phase 7's close-out (any client component using `useSearchParams()` requires explicit `<Suspense>` wrapping under the slim root layout).
**Source:** 08-CONTEXT.md (D-GR-04, D-CMP-01), 08-05-PLAN.md

---

## Surprises

### Planner agent (Opus 4.7) hit API 529 mid-run AFTER writing all 6 plans
The plan-phase Opus run completed all 6 PLAN.md files to disk and then encountered an API 529 (overloaded) during the final return. The orchestrator received an error instead of `## PLANNING COMPLETE`.

**Impact:** Recovered via the workflow's filesystem fallback (step 9a). All 6 plans on disk were structurally valid; the orchestrator accepted them and populated VALIDATION.md inline (the planner had not done that step before the 529). No replan needed — the 15-minute planner cost was preserved. Lesson for next phase: when the orchestrator dispatches a long-running planner, the post-write VALIDATION.md population should happen near the start of the planner's work, not as the final step — that way a late-stage API error doesn't strand the validation map.
**Source:** STATE.md, 08-VALIDATION.md (populated by orchestrator post-fallback)

---

### Worktree base-commit drift: 08-05 worktree spawned from an old commit
The Wave 3 executor's worktree forked at `5e787a3` (an old `ui-tests` head from before Phase 8 started), not at `dbe83887` (the Wave 2 tip the plan depends on). Without the explicit `<worktree_branch_check>` reset, the executor would have run on a checkout that was missing the Wave 1/2 modules entirely.

**Impact:** Caught at executor startup by the `git merge-base HEAD <EXPECTED_BASE>` assertion in the worktree_branch_check block, which performed `git reset --hard dbe83887` automatically. The base-pinning mechanism worked exactly as designed — confirming Phase 7's "anti-pattern advisory" about worktree base drift (recorded in 07-CONTEXT.md / HANDOFF.json) was worth carrying forward.
**Source:** 08-05-SUMMARY.md (Auto-fixed Issues §3)

---

### ESLint `@typescript-eslint/no-unused-vars` blocks Next.js build for "documentation-only" types
`type EssentialCategory = typeof ESSENTIAL_CATEGORIES[number]` was defined in `safe-to-spend.ts` purely as documentation (the filter uses an `as readonly string[]` inline cast). ESLint flagged it as unused → `bun run build` exited with code 1 even though `bun run test` and `bun run typecheck` both passed.

**Impact:** Caught by the Wave 3 executor on the first build attempt. Auto-fixed by removing the type declaration. Lesson: documentation-only types must be either *used* somewhere (even just `export type` to make them part of the module's public API) or `eslint-disable`d explicitly, otherwise the build pipeline rejects them.
**Source:** 08-05-SUMMARY.md (Auto-fixed Issues §1)

---

### Filename rename `format.ts` → `currency.ts` surfaced at *pattern-mapping* time, not planning
The collision between the planned `src/utils/format.ts` and the existing legacy `src/utils/format/index.ts` was not caught during /gsd:discuss-phase or /gsd:ui-phase. The pattern-mapper's File Classification scan flagged it, and the planner adopted the rename before writing PLAN.md files. Required documenting the deviation in 5 places (CONTEXT.md superseding text, PATTERNS.md note, RESEARCH.md finding 6, VALIDATION.md Wave 0 list, 08-03-PLAN.md interfaces).

**Impact:** Smooth — the rename was decided once and propagated cleanly. But the lesson is that *pattern-mapping is doing real planning work*, not just documentation. Future phases should not skip pattern-mapping for time savings; it's where filename / module-collision issues get caught before they reach an executor.
**Source:** 08-03-SUMMARY.md, 08-PATTERNS.md Naming Conflict Warning, 08-RESEARCH.md finding 6

---

### Tailwind v4 auto-scans `.planning/` and `docs/`, generates invalid CSS from class-shaped shorthand
The literal text `pb-[env(...)]` (with `...` as placeholder ellipsis, not a real Tailwind class) appears in Phase 7's `07-02-PLAN.md:212` as documentation shorthand. Tailwind v4's oxide scanner faithfully treated it as a class candidate and emitted `padding-bottom: env(...);` into the generated `globals.css` — invalid CSS. `bun run build` somehow tolerated it; `bun run dev` did not.

**Impact:** `next dev` crashed with `Unexpected token Delim('.')` at the start of Phase 8 manual smoke testing. Fix: `globals.css` switched from `@import "tailwindcss"` to `@import "tailwindcss" source("../../src")` to pin the auto-scan to runtime code only. (Tailwind v4.1+ supports the cleaner `@source not "..."` directive; we're on 4.0.11.) The fix is captured in code via a top-of-file comment + in user-level project memory at `~/.claude/projects/-Users-paulheuwer-dev-01-Projects-BetterBudgeter/memory/tailwind-source-restriction.md`. Other plan docs contain 42 class-shaped strings total — the same issue could have surfaced from any of them.
**Source:** STATE.md (session continuity), src/app/globals.css comment block

---
