---
phase: 08-home-hub
plan: "02"
subsystem: utils/greeting
tags: [phase-8, home-hub, greeting, tdd, pure-utility]
requirements: [PAGE-01]

dependency_graph:
  requires: []
  provides: [nameFromEmail, greetingForTime]
  affects: [src/app/(bb)/page.tsx]

tech_stack:
  added: []
  patterns:
    - "Intl.DateTimeFormat.formatToParts() for timezone-safe hour extraction"
    - "Pure function with Date parameter — no fake timers needed in tests"
    - "TDD RED→GREEN two-commit pattern"

key_files:
  created:
    - src/utils/greeting.ts
  modified:
    - tests/utils/greeting.test.ts

decisions:
  - "Used Intl.DateTimeFormat formatToParts() over toLocaleString() to avoid ICU/Node.js version-dependent string format (RESEARCH §Pitfall 3)"
  - "nameFromEmail accepts string | null | undefined — broader than string alone — to handle optional auth user email safely (RESEARCH §Pitfall 6)"
  - "18 tests written (10 nameFromEmail + 8 greetingForTime) — exceeds the 13-case minimum; added DST verification case and empty-local-part case"

metrics:
  duration: "~8 minutes"
  completed: "2026-05-20"
  tasks_completed: 2
  files_changed: 2
---

# Phase 8 Plan 02: Pure Greeting Helpers Summary

**One-liner:** TDD implementation of `nameFromEmail` (email-to-first-name extraction) and `greetingForTime` (Europe/Berlin timezone-aware morning/afternoon/evening band) as pure TypeScript helpers in `src/utils/greeting.ts`.

## What Was Built

`src/utils/greeting.ts` — a pure TypeScript module with two named exports:

- **`nameFromEmail(email: string | null | undefined): string | null`** — extracts and title-cases the first segment of an email's local part (before `@`), split on `[._-]`. Returns `null` for numeric-prefix emails, empty input, null, or undefined. The caller falls back to "Good morning." (no name) when null is returned.

- **`greetingForTime(now: Date): 'morning' | 'afternoon' | 'evening'`** — maps a Date to a time band using `Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Berlin' }).formatToParts(now)`. Europe/Berlin is hardcoded (D-GR-03 — school project, known DE users, Vercel servers run UTC). Bands: morning 05:00–11:59, afternoon 12:00–17:59, evening 18:00–04:59 (wraps midnight).

`tests/utils/greeting.test.ts` — 18 `it()` cases across two `describe` blocks, replacing the Wave 0 `it.todo` stubs.

## TDD Gate Compliance

| Gate | Commit | Status |
|------|--------|--------|
| RED (test) | `bfcbdd0` | Confirmed failing — import error (src/utils/greeting.ts did not exist) |
| GREEN (feat) | `7ba48ed` | 18/18 tests passing |

## Test Coverage

### nameFromEmail (10 cases)

| Input | Expected | Case |
|-------|----------|------|
| `'paul.heuwer@example.com'` | `'Paul'` | dot separator |
| `'paul_h@example.com'` | `'Paul'` | underscore separator |
| `'paul-heuwer@example.com'` | `'Paul'` | dash separator |
| `'PAUL@example.com'` | `'Paul'` | normalise uppercase to title case |
| `'a@example.com'` | `'A'` | single character |
| `'123abc@example.com'` | `null` | numeric prefix rejected (step 4) |
| `null` | `null` | null input |
| `undefined` | `null` | undefined input |
| `''` | `null` | empty string |
| `'@example.com'` | `null` | empty local part |

### greetingForTime (8 cases)

| UTC Input | Berlin Local | Expected |
|-----------|--------------|---------|
| `2026-01-15T03:59:00Z` | 04:59 CET | `'evening'` |
| `2026-01-15T04:00:00Z` | 05:00 CET | `'morning'` |
| `2026-01-15T10:59:00Z` | 11:59 CET | `'morning'` |
| `2026-01-15T11:00:00Z` | 12:00 CET | `'afternoon'` |
| `2026-01-15T16:59:00Z` | 17:59 CET | `'afternoon'` |
| `2026-01-15T17:00:00Z` | 18:00 CET | `'evening'` |
| `2026-01-14T23:00:00Z` | 00:00 CET | `'evening'` |
| `2026-07-15T16:00:00Z` | 18:00 CEST | `'evening'` (DST verification) |

The DST case (`2026-07-15T16:00:00Z`) is the key regression detector: a hardcoded UTC+1 offset would compute hour=17 → `'afternoon'` (wrong). The live `Intl` Europe/Berlin zone gives hour=18 → `'evening'` (correct).

## Commits

| Hash | Type | Description |
|------|------|-------------|
| `bfcbdd0` | RED | `test(08-02): add failing tests for nameFromEmail and greetingForTime` |
| `7ba48ed` | GREEN | `feat(08-02): implement nameFromEmail and greetingForTime pure helpers` |

## Deviations from Plan

None — plan executed exactly as written.

The test count (18) exceeds the plan's stated minimum (13) because:
- `nameFromEmail`: plan listed 10 cases; all 10 implemented (including `@example.com` empty-local-part case)
- `greetingForTime`: plan listed 8 cases (7 boundaries + 1 DST); all 8 implemented

## Known Stubs

None — both functions are fully implemented and wired. The `TODO` comments in the source are forward-looking extension notes (future i18n, future display_name source), not stubs that block this plan's goal.

## Threat Flags

None — no new network endpoints, auth paths, file access patterns, or schema changes introduced.

## Self-Check

- [x] `src/utils/greeting.ts` exists and exports `nameFromEmail` + `greetingForTime`
- [x] `tests/utils/greeting.test.ts` contains 18 real `it()` cases (no `it.todo`)
- [x] `bun run test tests/utils/greeting.test.ts` exits 0 (18/18 passing)
- [x] RED commit `bfcbdd0` exists
- [x] GREEN commit `7ba48ed` exists
- [x] No `"use client"` directive
- [x] No React, no DOM, no `Date.now()` — all inputs via parameters
- [x] `formatToParts()` used (not `toLocaleString()`)
- [x] `'Europe/Berlin'` appears in implementation
- [x] File header comment explains WHAT, WHY pure, SCOPE, and no-side-effects guarantee
- [x] Pre-existing typecheck errors (`TransactionItem`, `currency`) unchanged — not caused by this plan

## Self-Check Result: PASSED
