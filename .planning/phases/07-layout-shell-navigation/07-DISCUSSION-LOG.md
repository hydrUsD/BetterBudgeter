# Phase 7: Layout Shell & Navigation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 07-layout-shell-navigation
**Areas discussed:** Layout isolation strategy, Legacy chrome fate, Stub content for /budgets and /transactions, TabBar desktop behavior

---

## Layout Isolation Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| `(bb)/` route group (Recommended) | Move BB pages into `src/app/(bb)/` with its own layout. Legacy routes stay where they are with chrome moved to `(legacy)/` or per-page. Idiomatic Next.js, clean separation, URL-transparent. | ✓ |
| `(legacy)/` route group (inverse) | Move legacy routes into `src/app/(legacy)/` with chrome. BB pages stay at the top level. Riskier — would force chrome reshuffling across all legacy page files. | |
| Conditional in root layout | Single file: root layout reads pathname from `headers()` and renders BB chrome or legacy chrome. No file moves, but root layout becomes a long branch. | |

**User's choice:** Option 1 — `(bb)/` route group, with `(bb)` as the main/primary route and `(legacy)` as "unlisted".
**Notes:** User explicitly framed `(bb)` as the canonical home for the new app; legacy stays accessible (URLs unchanged) but is not part of the BB navigation. This naturally extends the existing `(auth)/` pattern in the codebase.

---

## Legacy Chrome Fate

| Option | Description | Selected |
|--------|-------------|----------|
| Split into `(legacy)/` layout (Recommended) | `git mv` the 5 legacy page dirs into `src/app/(legacy)/`. Create `(legacy)/layout.tsx` holding all legacy chrome + providers. Root layout shrinks to html/body + ThemeProvider + Toaster. URLs unchanged. | ✓ |
| Keep chrome in root, exclude from BB layout via CSS | Leave chrome in root layout. `(bb)/layout.tsx` hides Logo/Settings/Achievements/ThemeToggle via `display:none`. Hacky — chrome still renders and stays in providers. | |
| Chrome per-page in legacy | Strip chrome from root entirely. Each legacy page imports its own wrapper. Most flexible but touches every legacy page file. | |

**User's choice:** Option 1 — Split into `(legacy)/` layout.
**Notes:** Grep verified that `useApp` and `useBudget` are consumed only by `src/components/legacy/**` components, so providers belong with legacy. Root layout shrinks to truly-global concerns (html/body/ThemeProvider/Toaster).

---

## Stub Content for /budgets and /transactions

| Option | Description | Selected |
|--------|-------------|----------|
| PageShell + PageHeader + neutral placeholder | PageHeader + a centered `<p>` like "Your budgets will appear here." User-facing tone, no dev-language leakage, no Phase 8/9 references. | ✓ |
| PageShell + PageHeader + dashed dev placeholder | PageHeader + a dashed-border box saying "Coming in Phase 8". Clear it's a stub, but exposes internal phase numbers. | |
| PageShell + PageHeader only, blank body | Just the header, no body content. Page renders, tab bar works, but feels broken/empty when visited. | |

**User's choice:** Option 1 — Neutral placeholder.
**Notes:** Aligns with the shame-free / user-respectful copy guidelines. Final wording is the Phase 11 copy pass's call, but the page reads naturally to users today.

---

## TabBar Desktop Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Constrained to 768px, centered (Recommended) | TabBar matches PageShell max-width and sits centered at the bottom. Reinforces the "mobile app" feel even on desktop. | ✓ |
| Full viewport width | TabBar spans edge-to-edge. More traditional desktop nav, less "app-like". Inconsistent with the mobile-centric design language. | |
| Constrained to a wider max (e.g. 1024px) | Compromise width. No spec support; introduces a second magic number. | |

**User's choice:** Option 1 — 768px-constrained, centered.
**Notes:** Consistency with the PWA/ADHD design intent. ADHD UX research argues against layout shifts across breakpoints — predictability is a core value.

---

## Claude's Discretion

- Choice of `position: fixed` vs `position: sticky` for TabBar (planner picks)
- Exact lucide-react icon names (House vs HomeIcon, etc.)
- Internal styling approach within Tailwind utility constraints
- File-level header comments and inline explanation comments (mandatory per project rules, content is Claude's call)

## Deferred Ideas

- Tab scroll position memory (NAV-03 mention) — defer unless research flags it as Phase 7 critical
- TabBar micro-interactions, press states, focus ring tuning — Phase 11 (motion + a11y)
- Final placeholder copy review for `/budgets` and `/transactions` — Phase 11 (copy pass)
- PageHeader extensions (back arrow, kebab menu) — Phase 9/10 if needed
- TabBar icon swap animation — Phase 11 if desired
- PWA install prompts / status bar coloring — out of milestone scope
