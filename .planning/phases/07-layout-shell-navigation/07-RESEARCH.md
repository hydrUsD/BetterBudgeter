# Phase 7: Layout Shell & Navigation — Research

**Researched:** 2026-05-19
**Domain:** Next.js 15 App Router — multi-group layout restructure, fixed bottom tab navigation, iOS-safe-area handling
**Confidence:** HIGH (all critical claims verified against Next.js official docs, lucide.dev, and the codebase itself)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Layout Isolation Strategy**
- **D-01:** Use two route groups: `src/app/(bb)/` (primary BB app) and `src/app/(legacy)/` (preserved OopsBudgeter). `(bb)` is canonical; `(legacy)` is "unlisted" — accessible by URL but not part of BB navigation. Route groups are URL-transparent, so all existing URLs (`/`, `/legacy`, `/analytics`, etc.) remain unchanged.
- **D-02:** Standalone pages (`/login`, `/link-bank`) stay outside both groups — they get NO tab bar and NO legacy chrome. They inherit only the truly-global root layout (html/body/ThemeProvider/Toaster).

**Legacy Chrome Relocation**
- **D-03:** Move all 5 legacy page directories into `src/app/(legacy)/` via `git mv` (preserves history). Paths to move: `legacy/`, `analytics/`, `achievements/`, `dashboard/`, `legacy-index/`. URLs unchanged because `(legacy)` is a route group.
- **D-04:** Create `src/app/(legacy)/layout.tsx` containing the full legacy chrome stack — exact nesting: `PasscodeWrapper → AppProvider → BudgetProvider → <main className="p-0 md:p-6"> → PageLayout → Logo, Settings, Achievements, ThemeToggle, {children}`, plus `GoToTop` as sibling. Relocated verbatim from the current root layout.
- **D-05:** Slim root `src/app/layout.tsx` to: `html / body (with font variables) → ThemeProvider → {children} → Toaster`. Root keeps: viewport meta, metadata generation, dev-only `import("@/lib/recurring")`, font setup (Geist/GeistMono).

**BB Layout Chrome**
- **D-06:** Create `src/app/(bb)/layout.tsx` containing: `<PageShell>{children}<TabBar /></PageShell>`. No legacy providers.
- **D-07:** Move the 4 BB pages into `(bb)/` via `git mv`: `src/app/page.tsx` → `src/app/(bb)/page.tsx`; `src/app/settings/page.tsx` → `src/app/(bb)/settings/page.tsx`; create new `src/app/(bb)/budgets/page.tsx` and `src/app/(bb)/transactions/page.tsx`.

**Stub Content**
- **D-08:** `/budgets` and `/transactions` ship with `<PageShell><PageHeader title="..." subtitle="..." /><p>{placeholder}</p></PageShell>`. Suggested copy: `/budgets` title "Budgets", subtitle "Track your monthly spending limits", body "Your budgets will appear here." `/transactions` title "Transactions", subtitle "Your spending history", body "Your transactions will appear here." Final wording is the copy pass's call (Phase 11), but it must read naturally to users today.

**TabBar Behavior**
- **D-09:** TabBar is constrained to PageShell's max-width (768px) and centered at the viewport bottom on all screen sizes.
- **D-10:** TabBar specifics locked by NAV-01..NAV-03: 4 tabs (House, PieChart, List, Settings/Gear); active = `--bb-info` color + filled icon; inactive = `--bb-text-secondary` + outlined; subtle top border (`--bb-border`); 44×44px minimum touch targets; instant route switching, no transition animation; active tab determined via `usePathname()` (client component).

**PageShell & PageHeader**
- **D-11:** `components/layout/PageShell.tsx` — single-column, max-width 768px, horizontally centered, card padding `--bb-space-5`, section gap `--bb-space-8`, bottom padding clearing the fixed TabBar (TabBar height + safe-area-inset-bottom).
- **D-12:** `components/layout/PageHeader.tsx` — title (h1) + optional subtitle, typography tokens from Phase 6, 8px spacing below heading.

**Middleware & Routing Safety**
- **D-13:** `src/middleware.ts` references legacy paths in comments only. No middleware changes needed in Phase 7.
- **D-14:** `/dashboard` 308 redirect stays functional after moving into `(legacy)/`. Redirect target `/` still resolves to `(bb)/page.tsx`.

### Claude's Discretion
- Choice of fixed vs. sticky positioning for TabBar (`position: fixed` is the typical pattern; planner picks)
- File-level header comments and inline comments (mandatory per project rules — junior-friendly)
- Exact lucide-react icon names (House vs HomeIcon, etc.)
- Internal CSS structure (Tailwind classes vs styled components — Tailwind utilities preferred per project)

### Deferred Ideas (OUT OF SCOPE)
- **Tab scroll position memory** (NAV-03 mentions it, but App Router does not preserve scroll-per-tab natively; defer to Phase 10 unless researcher flags as Phase 7 critical — see Open Questions §1)
- **TabBar visual polish / micro-interactions** — press/hover/focus tuning is Phase 11
- **Final placeholder copy for `/budgets` and `/transactions`** — Phase 11
- **PageHeader variants** — back arrow, kebab menu, optional actions; Phase 9–10
- **TabBar icon animations on tab change** — Phase 11 motion pass
- **PWA install prompts / status bar coloring** — out of milestone scope
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| NAV-01 | Persistent bottom tab bar with 4 tabs (Home, Budgets, Transactions, Settings) using lucide-react icons | §Standard Stack — `lucide-react@0.479.0` already installed with `House`, `ChartPie`, `List`, `Settings` icons verified [VERIFIED: codebase grep + lucide.dev] |
| NAV-02 | Active tab = `--bb-info` + filled icon; inactive = `--bb-text-secondary` + outlined; subtle top border | §Pitfalls 3 — lucide does not ship official filled variants; pattern is `fill="currentColor" strokeWidth={0}` on the same icon [CITED: lucide.dev/guide/lucide/advanced/filled-icons] |
| NAV-03 | Instant tab switches, no transition animation, each tab remembers scroll position | §Open Questions §1 — scroll memory requires custom state; instant switching is free with `<Link>` |
| NAV-04 | All legacy routes accessible: `/legacy`, `/analytics`, `/achievements`, `/legacy-index`, `/dashboard` (308 → `/`); tab bar NOT on legacy pages | §Architecture Pattern 1 + Pitfall 2 — route groups are URL-transparent; `(legacy)/layout.tsx` isolates legacy chrome [CITED: nextjs.org/docs/app/api-reference/file-conventions/route-groups] |
| NAV-05 | Shared `PageShell.tsx` (max-width 768px, bottom clearance) and `PageHeader.tsx` (title + subtitle) created | §Code Examples — server components, no client boundaries needed; consume `--bb-*` tokens via Tailwind utilities |
| NAV-06 | `/login` and `/link-bank` render as standalone pages (no tab bar) | §Architecture Pattern 1 — standalone pages outside both groups inherit only the slim root layout; `(auth)/login/page.tsx` already proves this works [VERIFIED: codebase] |
</phase_requirements>

---

## Summary

Phase 7 restructures the App Router root by introducing two route groups (`(bb)/`, `(legacy)/`) and a small set of layout primitives (`PageShell`, `PageHeader`, `TabBar`) in `src/components/layout/`. The restructure is largely a mechanical file move (`git mv`) plus three new files (`(bb)/layout.tsx`, `(legacy)/layout.tsx`, slimmed `app/layout.tsx`) and three new components. No business logic changes, no schema changes, no auth changes.

The work is HIGH-confidence because every architectural pattern is already proven in the codebase: the `(auth)/` route group exists and works; `lucide-react`, `next-themes`, and Sonner are wired up; the `--bb-*` tokens from Phase 6 are exposed as Tailwind utilities. The only genuinely novel piece is the TabBar component itself, and its behavioral surface is small (4 tabs, active-state via `usePathname()`, fixed-bottom positioning with safe-area handling).

Three pitfalls demand attention in the plan: (1) the slim root must add `viewportFit: "cover"` to the Viewport export or `env(safe-area-inset-bottom)` will be 0 on iOS PWAs, (2) lucide-react has no official filled icon variants — use `fill="currentColor" strokeWidth={0}` on the same icon component, (3) `<main>` placement must be reconciled because some legacy pages (e.g. `/legacy/page.tsx`) already render their own `<main>` and PageShell will introduce another for BB pages.

**Primary recommendation:** Execute as a 3-wave structural migration — Wave A (additive, no breakage): create the 3 layout files and 3 new components; Wave B (cutover): `git mv` all 7 page directories into their groups; Wave C (validation): build + smoke-test all 11 URLs (4 BB + 5 legacy + 2 standalone). Defer scroll-position-per-tab to a later phase (NAV-03's "remembers scroll position" cannot be satisfied by App Router defaults alone — see Open Questions §1).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Tab active-state detection | Browser / Client | — | `usePathname()` is a client hook by design (cited: nextjs.org/docs/app/api-reference/functions/use-pathname). Cannot read URL from server components. |
| Tab bar rendering & layout | Browser / Client | Frontend Server (SSR) | `TabBar` is a client component (uses `usePathname`), but its initial markup is server-rendered for fast first paint. |
| PageShell / PageHeader composition | Frontend Server (SSR) | — | Pure presentational wrappers; no client state. Stay as server components to keep BB pages server-renderable. |
| Route → layout resolution | Frontend Server (SSR) | — | Next.js App Router resolves layouts statically per route group during build. |
| Legacy chrome (PasscodeWrapper, AppProvider, BudgetProvider) | Browser / Client | — | All three are existing `"use client"` components that use `localStorage`/`useState`. They move into `(legacy)/layout.tsx`. |
| Auth-gated routing | API / Backend | Frontend Server (SSR) | `src/middleware.ts` runs on the edge/server; URL-path matchers are unaffected by route groups (D-13). |
| Theme switching (light/dark) | Browser / Client | Frontend Server (SSR) | `next-themes` ThemeProvider stays in root layout — global for both groups. |

---

## Standard Stack

### Core (already installed — no new dependencies)

| Library | Installed Version | Purpose | Why Standard |
|---------|-------------------|---------|--------------|
| `next` | `15.2.8` | App Router framework | Already the project's framework; route groups are an App Router primitive [VERIFIED: package.json + nextjs.org docs] |
| `react` | `19.0.0` | UI runtime | Required for Next.js 15 [VERIFIED: package.json] |
| `lucide-react` | `0.479.0` | Tab bar icons (House, ChartPie, List, Settings) | Already in codebase; NAV-01 specifies it; icons confirmed to exist [VERIFIED: codebase grep + lucide.dev/icons] |
| `next-themes` | `0.4.6` | Light/dark theme switching | Already wired in `ThemeProvider`; stays in root layout [VERIFIED: package.json] |
| `tailwindcss` | `^4` | Styling, including `bg-bb-*`, `text-bb-*` utilities | Phase 6 wired up `@theme inline` mappings for `--bb-*` tokens [VERIFIED: src/app/globals.css] |
| `clsx` + `tailwind-merge` | `2.1.1` / `3.0.2` | Conditional class composition for active/inactive tab states | Already in codebase via `cn()` helper (`@/lib/utils`) [VERIFIED: codebase grep] |

### Supporting (already installed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` + `@testing-library/react` | `4.0.18` / `16.3.2` | Component tests for TabBar active-state, route maps | TDD for testable logic (active-tab calc); skip for pure visual surfaces [VERIFIED: package.json + tests/components/] |
| `sonner` | `2.0.1` | Global toaster (stays in slim root layout) | Already wired in `Sonner.tsx`; no Phase 7 changes [VERIFIED: package.json] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff / Why Rejected |
|------------|-----------|-------------------------|
| Route groups for layout split | Per-route `layout.tsx` files (no groups) | Rejected — would force `(bb)` chrome onto `(legacy)` via shared root, defeating the goal. Route groups are the idiomatic Next.js answer. |
| `lucide-react` filled variants | Heroicons (has `solid` + `outline` packages) | Rejected — NAV-01 specifies lucide; introducing Heroicons violates "additive over refactor" and adds a dep. Use `fill="currentColor" strokeWidth={0}` trick on lucide icons instead. |
| `position: sticky` for TabBar | `position: fixed` | Both work; `fixed` is more common for bottom nav (independent of scroll container); user marked this as Claude's discretion (CONTEXT D-09 commentary). **Recommendation: `fixed`.** |
| Custom scroll-restoration | Browser default + `<Link>` | Default behavior preserves scroll on back/forward but NOT on direct tab clicks. Implementing per-tab scroll memory is non-trivial; defer per CONTEXT.md "Deferred Ideas". |

**Installation:** None — all dependencies already present.

**Version verification:**
```bash
bun pm ls 2>&1 | grep -E "(lucide-react|next-themes|next@|react@)"
# Confirmed installed: lucide-react@0.479.0, next@15.2.8, next-themes@0.4.6, react@19.0.0
```
All confirmed against `package.json` and `bun pm ls` output. No upgrades needed.

---

## Package Legitimacy Audit

> Phase 7 installs **NO new packages**. All required libraries are already in the lockfile, having been vetted in earlier phases. Audit is therefore minimal.

| Package | Registry | Status | Disposition |
|---------|----------|--------|-------------|
| `lucide-react@0.479.0` | npm | Already installed; widely used (millions of weekly downloads); maintained by lucide-icons org with active GitHub | Approved — existing |
| `next-themes@0.4.6` | npm | Already installed; maintained by Paco Coursey (vercel-affiliated) | Approved — existing |
| `next@15.2.8`, `react@19.0.0` | npm | Already installed; core framework | Approved — existing |

**Packages removed due to slopcheck:** none (no new installs).
**Packages flagged as suspicious:** none.

*No new packages are introduced in Phase 7. slopcheck was not run because there is nothing new to verify. If a future addition is considered (e.g., a swipe-gesture library for the TabBar), the planner should re-trigger the legitimacy gate.*

---

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Browser request                                                 │
└───────────────────────────┬─────────────────────────────────────┘
                            ↓
                  ┌─────────────────────┐
                  │ src/middleware.ts   │  ← URL matchers unaffected
                  │ (auth gate, URL-    │     by route groups (D-13)
                  │  pattern-based)     │
                  └──────────┬──────────┘
                             ↓
                  ┌─────────────────────┐
                  │ src/app/layout.tsx  │  ← Slim root: html/body +
                  │ (truly-global only) │     ThemeProvider + Toaster
                  └──────────┬──────────┘
                             ↓
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
     ┌────────────────┐ ┌──────────┐ ┌────────────────┐
     │ (bb)/layout    │ │ standalone│ │ (legacy)/layout│
     │ ────────────── │ │ pages    │ │ ────────────── │
     │ PageShell      │ │ (no group)│ │ PasscodeWrapper│
     │  ├ {children}  │ │           │ │  AppProvider   │
     │  └ TabBar      │ │ /login    │ │   BudgetProvider│
     │    (client,    │ │ /link-bank│ │    <main>      │
     │     usePathname│ │           │ │     PageLayout │
     │     active     │ │ inherit   │ │      Logo/...  │
     │     state)     │ │ only root │ │      {children}│
     └────┬───────────┘ └─────┬─────┘ └────────┬───────┘
          ↓                   ↓                ↓
     /  /budgets         /login          /legacy
     /transactions       /link-bank      /analytics
     /settings                           /achievements
                                         /legacy-index
                                         /dashboard (308→/)
```

**Reading the diagram:** A request enters middleware (URL-based auth check) → hits the slim root layout (html shell + theme) → is routed by Next.js into one of three layout contexts: the BB group (with TabBar), the legacy group (with full chrome stack), or a standalone page (no group, just root). URLs are unchanged; only file organization and applied layouts differ.

### Recommended Project Structure (after Phase 7)

```
src/
├── app/
│   ├── layout.tsx                    # SLIM root: html/body, ThemeProvider, Toaster, viewport
│   ├── globals.css                   # Phase 6 tokens (unchanged)
│   ├── favicon.ico
│   │
│   ├── (auth)/                       # EXISTING route group (no changes)
│   │   └── login/page.tsx
│   │
│   ├── link-bank/                    # Standalone — outside all groups (no chrome)
│   │   └── page.tsx
│   │
│   ├── api/                          # API routes (unchanged)
│   │
│   ├── (bb)/                         # NEW: BB primary app
│   │   ├── layout.tsx                # NEW: PageShell + TabBar
│   │   ├── page.tsx                  # MOVED from src/app/page.tsx (Home)
│   │   ├── budgets/page.tsx          # NEW: stub
│   │   ├── transactions/page.tsx     # NEW: stub
│   │   └── settings/page.tsx         # MOVED from src/app/settings/page.tsx
│   │
│   └── (legacy)/                     # NEW: legacy preservation
│       ├── layout.tsx                # NEW: full legacy chrome
│       ├── legacy/page.tsx           # MOVED from src/app/legacy/page.tsx
│       ├── analytics/page.tsx        # MOVED from src/app/analytics/page.tsx
│       ├── achievements/page.tsx     # MOVED from src/app/achievements/page.tsx
│       ├── dashboard/page.tsx        # MOVED from src/app/dashboard/page.tsx (308 redirect)
│       └── legacy-index/page.tsx     # MOVED from src/app/legacy-index/page.tsx
│
├── components/
│   ├── layout/                       # NEW: BB chrome primitives
│   │   ├── PageShell.tsx             # NEW: max-width 768px wrapper + bottom clearance
│   │   ├── PageHeader.tsx            # NEW: title + optional subtitle
│   │   └── TabBar.tsx                # NEW: 4-tab bottom nav (client component)
│   │
│   ├── legacy/                       # UNCHANGED — strict isolation maintained
│   ├── dashboard/                    # UNCHANGED
│   ├── ui/                           # UNCHANGED (shadcn/ui)
│   └── auth/                         # UNCHANGED
│
├── contexts/
│   ├── AppContext.tsx                # UNCHANGED (consumed only via (legacy)/layout)
│   └── BudgetContext.tsx             # UNCHANGED (consumed only via (legacy)/layout)
│
└── middleware.ts                     # UNCHANGED (URL matchers, not file paths)
```

### Pattern 1: Route Groups for Layout Isolation

**What:** Wrap a folder name in parentheses (`(name)/`) to create a route group that organizes routes WITHOUT affecting the URL. Each group can have its own `layout.tsx` that wraps only its children.

**When to use:** When you need different chrome (different layouts) for different sections of an app, but want the URLs to remain clean (no `/bb/...` or `/legacy/...` prefixes).

**Example:**
```tsx
// Source: nextjs.org/docs/app/api-reference/file-conventions/route-groups
// app/(bb)/layout.tsx — applied to /, /budgets, /transactions, /settings
export default function BBLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      {children}
      <TabBar />
    </PageShell>
  );
}

// app/(legacy)/layout.tsx — applied to /legacy, /analytics, /achievements, etc.
export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <PasscodeWrapper>
      <AppProvider>
        <BudgetProvider>
          <main className="p-0 md:p-6">
            <PageLayout>
              <Logo />
              <Settings />
              <Achievements />
              <ThemeToggle />
              {children}
            </PageLayout>
          </main>
          <GoToTop />
        </BudgetProvider>
      </AppProvider>
    </PasscodeWrapper>
  );
}
```

**Key fact:** Next.js docs confirm route groups "should not be included in the route's URL path" — so `/budgets` resolves to `(bb)/budgets/page.tsx` and `/legacy` resolves to `(legacy)/legacy/page.tsx`, transparently. [CITED: nextjs.org/docs/app/api-reference/file-conventions/route-groups]

### Pattern 2: Client Component Inside Server Layout (Composition)

**What:** Keep the layout itself a server component, and embed only the interactive piece (TabBar) as a `"use client"` component. This is critical: marking a layout `"use client"` would import-graph all its rendered descendants into the client bundle.

**When to use:** Always, when only a small interactive island is needed in an otherwise static layout.

**Example:**
```tsx
// Source: nextjs.org/docs/app/getting-started/server-and-client-components
// Layout stays a server component (no "use client")
// PageShell is also a server component
// Only TabBar is a client component (it uses usePathname())

// app/(bb)/layout.tsx — SERVER COMPONENT
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

// components/layout/TabBar.tsx — CLIENT COMPONENT
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { House, ChartPie, List, Settings } from "lucide-react";

export function TabBar() {
  const pathname = usePathname();
  // ... active-state logic
}
```

**Key fact (HIGH confidence):** Per Next.js docs, server components passed as **children** to client components remain server-rendered. Only the client component's own import graph (its imports + components it directly renders) becomes part of the client bundle. So even if we needed `(bb)/layout.tsx` to be a client component (we don't), `{children}` would still render server pages. [CITED: nextjs.org/docs/app/getting-started/server-and-client-components — "It does not apply to Server Components passed as children or other props."]

### Pattern 3: Active Tab Detection with `usePathname()`

**What:** A client component reads the current URL pathname and compares against each tab's `href` to compute `isActive`. Index route (`/`) requires exact match; others can use prefix match (but here all 4 tabs are flat single-segment paths, so exact match suffices).

**When to use:** Any in-app navigation that needs to highlight the current location.

**Example:**
```tsx
// Source: nextjs.org/docs/app/api-reference/functions/use-pathname
"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { House, ChartPie, List, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = {
  href: string;
  label: string;
  Icon: typeof House;
};

const TABS: Tab[] = [
  { href: "/",             label: "Home",         Icon: House },
  { href: "/budgets",      label: "Budgets",      Icon: ChartPie },
  { href: "/transactions", label: "Transactions", Icon: List },
  { href: "/settings",     label: "Settings",     Icon: Settings },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[768px]
                 border-t border-bb-border bg-bb-surface
                 pb-[env(safe-area-inset-bottom)] z-50"
    >
      <ul className="flex justify-around items-stretch h-[56px]">
        {TABS.map(({ href, label, Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "min-w-[44px] min-h-[44px] h-full",
                  isActive ? "text-bb-info" : "text-bb-text-secondary"
                )}
              >
                {/* Lucide trick: fill="currentColor" + strokeWidth={0} for filled state */}
                <Icon
                  size={20}
                  aria-hidden="true"
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                <span className="text-bb-xs">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

### Anti-Patterns to Avoid

- **Mark `(bb)/layout.tsx` as `"use client"`** — would make all 4 BB pages part of the client bundle and lose RSC benefits. Keep the layout as a server component; only `TabBar` is `"use client"`.
- **Use `pathname.startsWith(href)` for index route** — `"/".startsWith("/")` is true for ALL pathnames; `/budgets` would highlight Home too. Use exact equality for `/`, or careful prefix matching.
- **Add a second `<main>` in PageShell** — the legacy layout already has `<main className="p-0 md:p-6">`. The BB PageShell should also use `<main>` (semantic correctness) BUT only one `<main>` per page tree. Since BB pages are in `(bb)/` and legacy in `(legacy)/`, each tree has exactly one `<main>` — confirmed safe. Important: the BB home page (`/`) currently has `<main>` inside its body (`src/app/page.tsx` line 99). After moving, if PageShell renders `<main>`, the moved page should drop its own `<main>` to avoid nesting (Plan must verify and edit accordingly).
- **Reach for Heroicons or another icon library** — NAV-01 specifies lucide; CLAUDE.md UI library boundaries forbid silent additions.
- **Forget `viewportFit: "cover"`** — without it, `env(safe-area-inset-bottom)` is 0 on iOS PWAs. Current root layout DOES NOT include it. Must be added in the slim-root rewrite. See Pitfall 1.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Multi-layout routing | Custom router or HOC pattern | Next.js route groups (`(name)/`) | Built-in; URL-transparent; zero runtime cost; idiomatic for App Router |
| Active-route detection | `window.location.pathname` + `useEffect` | `usePathname()` from `next/navigation` | Hydration-safe; works with App Router transitions; preserves scroll on subsequent navs |
| Theme switching | Custom dark-mode toggle | `next-themes` (already wired) | Handles SSR mismatch via `suppressHydrationWarning`; persists in localStorage |
| Active/inactive icon variants | Custom SVG fork of lucide | `fill="currentColor" strokeWidth={0}` on the same icon | Lucide officially says fills "work fine on certain icons" — the four tab icons (House, ChartPie, List, Settings) are all standard outline shapes that render acceptably filled. Worst case, swap to two-icon pattern for specific icons (e.g. import both `Settings` and `Settings2`); but trial first. |
| Safe-area handling on iOS | Manual viewport probing or media queries | CSS `env(safe-area-inset-bottom)` + viewport meta `viewport-fit=cover` | One CSS line; zero JS; supported in all modern iOS Safari |
| Persisted scroll position per tab | Custom React context or `sessionStorage` polyfill | Defer to a later phase (see Open Questions §1) | App Router does not natively support per-tab scroll memory; implementing it correctly is a sub-project on its own |

**Key insight:** Phase 7 is structural plumbing, not feature work. Almost everything is already in the toolchain. The single "build something" piece — the TabBar — is ~50 lines of presentational TypeScript.

---

## Runtime State Inventory

> This is a refactor/migration phase (file moves + layout rewrites). All categories explicitly answered.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| **Stored data** | None. Pages and layouts are stateless from a persistence perspective. `AppContext` and `BudgetContext` use `localStorage` for UI prefs, but those localStorage **keys are unchanged** (`"appWidth"`, `"colorfulCategories"`, etc.) — they continue to work after the providers move into `(legacy)/layout.tsx`. | None |
| **Live service config** | None. No external services (n8n, Cloudflare, Datadog, etc.) reference these file paths. Supabase doesn't care about route file structure. | None |
| **OS-registered state** | None. No Task Scheduler, launchd, pm2, etc. tied to file paths. | None |
| **Secrets / env vars** | None — `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are referenced in `middleware.ts` and `link-bank/page.tsx`. Neither file is being moved, and the middleware logic doesn't reference any moved file paths. | None |
| **Build artifacts / installed packages** | `.next/` build cache may have stale references after route restructure — but `next dev`/`next build` regenerate this fully on each run. PWA generator (`@ducanh2912/next-pwa`) regenerates the service worker on each build. | Run `bun run build` after moves to regenerate `.next/`; if dev server is running, restart it (Next.js dev server occasionally caches route maps and can show stale 404s after structural moves — `rm -rf .next` and restart if so). |

**The canonical question:** After every file in the repo is updated, what runtime systems still have the old string cached, stored, or registered?

**Answer:** Only the `.next/` build cache. No external services, OS state, databases, or secret stores reference these file paths. Route group moves are URL-transparent, so even cached browser sessions, search engine indexes, and external bookmarks remain valid.

---

## Common Pitfalls

### Pitfall 1: iOS `env(safe-area-inset-bottom)` is 0 without `viewportFit: "cover"`

**What goes wrong:** TabBar appears flush against the iOS home indicator (the white bar). Users can't easily tap the bottom row of tabs. `env(safe-area-inset-bottom)` returns `0px` because the page doesn't opt into the safe-area model.
**Why it happens:** The default Next.js Viewport config does not include `viewportFit: "cover"`. Without it, the browser treats the layout viewport as smaller than the device viewport and CSS env() vars stay at 0. Worse: even if it works on first paint, navigating via `<Link>` can reset env() to 0 (known Next.js issue).
**How to avoid:** In the slim root `src/app/layout.tsx`, ADD `viewportFit: "cover"` to the existing Viewport export:
```tsx
export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
  userScalable: false,
  themeColor: "#166d3b",
  viewportFit: "cover",  // ← REQUIRED for env(safe-area-inset-bottom) to work on iOS
};
```
**Warning signs:** Test in iOS Safari (or Chrome devtools "iPhone" preset with notch); if TabBar appears to overlap the home indicator, this is the cause.
**Source:** [github.com/vercel/next.js discussion #81264] (acknowledged Next.js behavior; `viewportFit: "cover"` is the documented workaround)

### Pitfall 2: Conflicting paths between route groups

**What goes wrong:** Two pages from different route groups resolve to the same URL. Next.js throws a build error: "You cannot have two parallel pages that resolve to the same path."
**Why it happens:** Both `(bb)/page.tsx` and `(legacy)/page.tsx` would resolve to `/`. Currently only the BB Home page is moved to `(bb)/` and the legacy dashboard is at `/legacy`, so this is safe — but the planner must NOT accidentally create a `(legacy)/page.tsx` (an index for legacy) thinking it'd live at `/legacy/`. It would live at `/`.
**How to avoid:** Only ONE `page.tsx` may exist at any URL across all route groups. Legacy's "index" is `legacy/page.tsx` inside the group, which resolves to `/legacy` — correct. Verify post-move with `bun run build`; the build will fail loudly if paths collide.
**Warning signs:** `Error: You cannot have two parallel pages that resolve to the same path.` during `next build`.
**Source:** [CITED: nextjs.org/docs/app/api-reference/file-conventions/route-groups — "Conflicting paths" section]

### Pitfall 3: Lucide-react has no official filled icon variants

**What goes wrong:** Developer searches lucide-react for `HouseFilled` or `ChartPieSolid`; doesn't find them; either picks a wrong icon or adds a second icon library.
**Why it happens:** Lucide's design philosophy is outline-only. The official docs state: "Fills are officially not supported. However, all SVG properties are available on all icons. Fill can still be used and will work fine on certain icons."
**How to avoid:** Use a single icon component per tab with conditional props. The pattern is `fill="currentColor" strokeWidth={0}` for active, `fill="none" strokeWidth={2}` for inactive. Test the 4 specific icons (House, ChartPie, List, Settings) — these are simple outline shapes that fill reliably. If one looks bad filled (e.g. interior cutouts disappear), fall back to selecting a structurally simpler lucide icon (e.g. `Home` if `House` looks odd) — both `House` and `Home` exist in lucide.
**Warning signs:** Filled icon looks like a black blob with no internal detail — that icon's SVG doesn't have a "fill rule" friendly geometry. Try a different lucide icon.
**Source:** [CITED: lucide.dev/guide/lucide/advanced/filled-icons + lucide-icons/lucide discussion #458]

### Pitfall 4: Marking a layout `"use client"` cascades client-side rendering

**What goes wrong:** Developer adds `"use client"` to `(bb)/layout.tsx` because "the TabBar is interactive". All BB pages now lose RSC benefits — they're rendered client-side, server-only data fetches don't work, bundle size balloons.
**Why it happens:** Misreading the React/Next.js boundary rule. The directive is contagious through the **import graph**, not the **render tree** of `children`.
**How to avoid:** Layout stays as a server component (no `"use client"`). Only `TabBar.tsx` has `"use client"`. Per Next.js docs: server components passed as `children` to client components remain server-rendered. So even if you HAD to mark the layout client (you don't), `{children}` would still render server pages.
**Warning signs:** Pages that previously did `async function Page()` with DB calls now error or run client-side. Build output shows much larger client bundles.
**Source:** [CITED: nextjs.org/docs/app/getting-started/server-and-client-components — "It does not apply to Server Components passed as children or other props."]

### Pitfall 5: Double `<main>` tag after migration

**What goes wrong:** PageShell renders `<main>` and the moved BB home page (`src/app/page.tsx`) also has its own `<main>` at line 99. After moving into `(bb)/`, the layout wraps the page → two nested `<main>` tags → invalid HTML, a11y regression, screen readers confused.
**Why it happens:** The current root layout (pre-Phase 7) does NOT wrap pages in `<main>` (the legacy `<main>` there is for legacy chrome only via `PageLayout`). The current BB home page brought its own `<main>`. After Phase 7, if PageShell adds another, they nest.
**How to avoid:** Decide upfront where `<main>` lives — recommendation: in PageShell. Then edit the moved `(bb)/page.tsx` to use a `<div>` or `<section>` instead of `<main>` for its content wrapper. The moved Settings page (`src/app/settings/page.tsx`) — verify it too. Stub pages (`/budgets`, `/transactions`) are new, so they won't have the issue.
**Warning signs:** HTML validator complains; a11y audit flags multiple landmark `<main>` elements.
**Source:** WHATWG HTML spec — "Authors must not include more than one main element in a document."

### Pitfall 6: `localStorage` access during SSR in moved providers

**What goes wrong:** `AppProvider` uses `useState(() => localStorage.getItem("appWidth") || "Normal")` — this runs during render. On the server (SSR), `localStorage` is undefined → reference error.
**Why it doesn't crash today:** `AppProvider` is marked `"use client"` and (currently) wraps the entire app from root layout — Next.js renders client components on the client for hydration. The `useState` initializer runs only client-side after hydration completes (React 19 + Next.js 15 specific behavior with `"use client"`).
**Why this is a Phase 7 risk:** When `AppProvider` moves into `(legacy)/layout.tsx`, the new layout file ITSELF must not be marked `"use client"` (it doesn't need to be; PasscodeWrapper, AppProvider, etc. are already client components that bring their own boundary). The current pattern works because the providers carry their own `"use client"` directives. Verify after the move that `bun run build` doesn't show new SSR errors for any legacy route.
**How to avoid:** Do NOT add `"use client"` to `(legacy)/layout.tsx`. Let the existing client-component providers handle their own boundaries (as they already do in the current root layout).
**Warning signs:** Build error `ReferenceError: localStorage is not defined` during `next build`.

### Pitfall 7: Middleware matcher includes a moved path

**What goes wrong:** Middleware matchers in `src/middleware.ts` reference URL paths. They are unaffected by route groups (URLs unchanged). But IF a future change accidentally changes a URL (e.g., creating `(bb)/dashboard/page.tsx` thinking it would supplement the redirect), the matcher might gate wrong content.
**Why it doesn't happen in Phase 7:** Phase 7 only moves files; URLs are identical. The matcher list — `/`, `/settings/:path*`, `/link-bank/:path*`, `/api/import/:path*`, `/api/mock/:path*`, `/api/notifications/:path*` — has zero overlap with legacy URLs.
**How to avoid:** D-13 locks: "No middleware changes needed in Phase 7." Plan tasks should NOT modify `middleware.ts`. Add a `checkpoint:human-verify` if any wave touches it.
**Warning signs:** Login redirects firing on `/legacy` or `/analytics` (would mean a matcher leaked); 401s on legacy routes (same).

---

## Code Examples

### Example 1: Slim Root Layout (`src/app/layout.tsx`)

```tsx
/**
 * Root Layout — Truly Global Only
 *
 * After Phase 7: this layout contains ONLY chrome shared by every route
 * regardless of group — html/body shell, theme, global toaster, fonts.
 * Group-specific chrome (TabBar for BB, PasscodeWrapper for legacy) lives
 * in (bb)/layout.tsx and (legacy)/layout.tsx respectively.
 *
 * Standalone pages (/login, /link-bank) get ONLY this layout — no group chrome.
 */
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/legacy/providers/ThemeProvider";
import Toaster from "@/components/legacy/effects/Sonner";
import { generateMetadata } from "@/lib/head";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = generateMetadata;

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
  userScalable: false,
  themeColor: "#166d3b",
  viewportFit: "cover",  // REQUIRED for iOS safe-area-inset-bottom to work (see Pitfall 1)
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (process.env.NODE_ENV !== "production") {
    import("@/lib/recurring");
  }
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth scroll-p-4 overflow-hidden overflow-y-scroll">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-full`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Diff from current:** Removed `PasscodeWrapper`, `AppProvider`, `BudgetProvider`, `<main>`, `PageLayout`, `Logo`, `Settings`, `Achievements`, `ThemeToggle`, `GoToTop`. Removed the `flex justify-center items-center` from `<body>` (groups handle their own centering). Added `viewportFit: "cover"`.

### Example 2: BB Layout (`src/app/(bb)/layout.tsx`)

```tsx
/**
 * BB App Layout
 *
 * Applied to all pages in the (bb) route group: /, /budgets, /transactions, /settings.
 * Wraps content in PageShell (max-width + bottom clearance) and adds the persistent TabBar.
 *
 * IMPORTANT: This is a SERVER component. Do not add "use client".
 * The interactive TabBar is itself a client component — that's where the boundary lives.
 * Keeping the layout server-side preserves RSC benefits for the BB pages (data fetching, etc.).
 */
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

### Example 3: Legacy Layout (`src/app/(legacy)/layout.tsx`)

```tsx
/**
 * Legacy Route Group Layout
 *
 * Applied to all preserved OopsBudgeter pages: /legacy, /analytics, /achievements,
 * /legacy-index, /dashboard (308 redirect).
 *
 * The full original chrome stack is reproduced verbatim from the pre-Phase-7 root layout.
 * BB routes do NOT receive this chrome — they live in (bb)/ and use TabBar/PageShell.
 *
 * IMPORTANT: Do NOT add "use client" to this layout. The provider components below already
 * carry their own client boundaries; adding it here would degrade SSR for legacy pages.
 */
import PasscodeWrapper from "@/components/legacy/security/PasscodeWrapper";
import { AppProvider } from "@/contexts/AppContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import GoToTop from "@/components/legacy/helpers/GoToTop";
import { ThemeToggle } from "@/components/legacy/common/ThemeToggle";
import Logo from "@/components/common/Logo";
import { Settings } from "@/components/legacy/common/Settings";
import PageLayout from "@/components/legacy/helpers/PageLayout";
import { Achievements } from "@/components/legacy/common/Achievements";

export default function LegacyLayout({ children }: { children: React.ReactNode }) {
  return (
    <PasscodeWrapper>
      <AppProvider>
        <BudgetProvider>
          <main className="p-0 md:p-6 flex justify-center items-center">
            <PageLayout>
              <Logo />
              <Settings />
              <Achievements />
              <ThemeToggle />
              {children}
            </PageLayout>
          </main>
          <GoToTop />
        </BudgetProvider>
      </AppProvider>
    </PasscodeWrapper>
  );
}
```

**Note on `flex justify-center items-center`:** This was previously on the root `<body>`. Since BB pages handle their own centering via PageShell, this layout-centering belongs at the legacy `<main>` level.

### Example 4: PageShell (`src/components/layout/PageShell.tsx`)

```tsx
/**
 * PageShell — BB Page Wrapper
 *
 * Single-column, max-width 768px, horizontally centered. Provides bottom clearance
 * so content doesn't sit under the fixed TabBar.
 *
 * Server component — no client APIs needed.
 *
 * Composition:
 *   <PageShell>
 *     <PageHeader title="..." subtitle="..." />
 *     <section>...</section>
 *     <TabBar />   ← positioned-fixed; will overflow PageShell but visually correct
 *   </PageShell>
 *
 * TabBar height target: 56px (matches the h-[56px] in TabBar.tsx)
 * Bottom padding = 56px (bar) + env(safe-area-inset-bottom) + a little breathing room.
 */
import { cn } from "@/lib/utils";

interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}

export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        "min-h-svh w-full max-w-[768px] mx-auto",
        "px-bb-4 md:px-bb-6",           // 16px mobile, 24px tablet+ (DESIGN_SYSTEM §4.2)
        "pt-bb-6",                       // 24px top padding
        "pb-[calc(56px+env(safe-area-inset-bottom)+1rem)]", // clearance for TabBar
        "bg-bb-bg text-bb-text",
        className
      )}
    >
      {children}
    </main>
  );
}
```

### Example 5: PageHeader (`src/components/layout/PageHeader.tsx`)

```tsx
/**
 * PageHeader — Consistent page title + subtitle
 *
 * Per DESIGN_SYSTEM §7.3 every BB page starts with title (h1) and optional subtitle.
 * Server component (no interactivity).
 *
 * Spacing: 8px gap between title and subtitle (DESIGN_SYSTEM §3.3 "headings followed by 8px").
 * Section gap below header is provided by the parent — PageShell uses --bb-space-8.
 */
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-bb-8", className)}>
      {/* Title uses --bb-text-3xl (36px) per DESIGN_SYSTEM §3.2 */}
      <h1 className="text-bb-3xl/[var(--text-bb-3xl-lh)] font-bold text-bb-text">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-bb-2 text-bb-base/[var(--text-bb-base-lh)] text-bb-text-secondary">
          {subtitle}
        </p>
      )}
    </header>
  );
}
```

**Note on Tailwind utility names:** Phase 6 wired `--text-bb-3xl` to Tailwind via `@theme inline`. Verify the exact utility name after `bun run build` — depending on Tailwind v4's auto-utility generation, the class might be `text-bb-3xl` or `text-[var(--bb-text-3xl)]`. Plan task should include a quick check.

### Example 6: TabBar (`src/components/layout/TabBar.tsx`)

```tsx
/**
 * TabBar — Persistent bottom navigation for BB routes
 *
 * 4 tabs: Home, Budgets, Transactions, Settings (NAV-01).
 * Active tab determined by usePathname() — must be a client component.
 * Active styling: --bb-info color + filled icon (NAV-02).
 * Inactive: --bb-text-secondary + outlined icon (NAV-02).
 * 44x44px minimum touch targets (NAV-02 + A11Y-01).
 * Instant route switching via next/link (NAV-03).
 *
 * Lucide icons do not ship "filled" variants. We use fill="currentColor"
 * + strokeWidth={0} for the active state — works well for these 4 outline shapes.
 * If a future icon swap breaks visually, fall back to two-icon pattern per tab.
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ChartPie, List, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; Icon: LucideIcon };

// Tab order is fixed per DESIGN_SYSTEM §8.1
const TABS: Tab[] = [
  { href: "/",             label: "Home",         Icon: House },
  { href: "/budgets",      label: "Budgets",      Icon: ChartPie },
  { href: "/transactions", label: "Transactions", Icon: List },
  { href: "/settings",     label: "Settings",     Icon: Settings },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2",
        "w-full max-w-[768px]",
        "border-t border-bb-border bg-bb-surface",
        "pb-[env(safe-area-inset-bottom)]",
        "z-50"
      )}
    >
      <ul className="flex justify-around items-stretch h-[56px]">
        {TABS.map(({ href, label, Icon }) => {
          // Exact match for index route; exact match also fine for the other three
          // because there are no nested routes (NAV-03: flat structure).
          const isActive = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={isActive ? "page" : undefined}
                aria-label={label}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5",
                  "min-w-[44px] min-h-[44px] h-full",
                  "transition-colors",
                  isActive ? "text-bb-info" : "text-bb-text-secondary"
                )}
              >
                <Icon
                  size={22}
                  aria-hidden="true"
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                <span className="text-bb-xs leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

### Example 7: Stub Page (`src/app/(bb)/budgets/page.tsx`)

```tsx
/**
 * Budgets Page — Stub for Phase 7
 *
 * This page exists in Phase 7 only so the /budgets tab has somewhere to navigate to.
 * Content is filled in by Phase 9 (PAGE-04). Stub copy is user-facing and neutral
 * per CONTEXT.md D-08.
 *
 * Extension point: This is where Phase 9 will add monthly overview, budget progress cards,
 * spending donut chart (migrated from Home), and "Edit budgets →" link.
 */
import { PageHeader } from "@/components/layout/PageHeader";
import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({ title: "Budgets" });

export default function BudgetsPage() {
  return (
    <>
      <PageHeader title="Budgets" subtitle="Track your monthly spending limits" />
      <p className="text-bb-base text-bb-text-secondary">
        Your budgets will appear here.
      </p>
    </>
  );
}
```

*(Transactions page is identical structure with different title/subtitle/body.)*

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Pages Router (`pages/_app.js` for global layout, no nested layouts) | App Router with nested + grouped layouts | Next.js 13 (2022); stable in 13.4 | Enables route-group layout isolation without URL prefixes — the entire foundation of Phase 7 |
| Manual route protection in every component | `src/middleware.ts` (already used) | Next.js 12+ | Centralized auth gating; URL-pattern-based, unaffected by route groups |
| `useRouter().pathname` (Pages Router) | `usePathname()` (App Router) | Next.js 13 | Cleaner API; client-component-only by design |
| Custom dark mode toggle | `next-themes` v0.4+ (already wired) | Long-stable | Handles SSR hydration mismatch |
| Heroicons / Material Icons (filled vs outlined separately) | Lucide outline + `fill="currentColor"` trick | Lucide design philosophy | Single dependency; works for ~70% of icons — including all 4 we need |

**Deprecated/outdated:**
- The Pages Router (`pages/` directory) — project is already on App Router; no concern.
- `next/head` for `<title>` — replaced by `export const metadata` (already used by all pages).

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `fill="currentColor" strokeWidth={0}` trick on House/ChartPie/List/Settings produces visually acceptable "filled" states | Pitfall 3, Code Example 6 | Active state looks odd; fallback is per-icon visual review and possibly swap one icon for a structurally simpler lucide alternative. Verifiable visually in Wave 0 / smoke test. |
| A2 | The current `<main>` in `src/app/page.tsx` line 99 should be removed when the page moves into `(bb)/` (because PageShell will provide `<main>`) | Pitfall 5 | If left, double-nested `<main>` produces invalid HTML. Trivial fix during the file move. |
| A3 | `next-themes` ThemeProvider doesn't need to remain at the truly-global root — but moving it would risk breaking light/dark on legacy. KEEPING at root is the safe choice (matches D-05). | §Standard Stack, Code Example 1 | Already locked by D-05. |
| A4 | TabBar height of 56px is acceptable — meets 44px minimum touch target with room for label below icon | Code Examples 4 + 6 | If 56px feels too tall on small screens, easy adjustment; visual review only. |
| A5 | `viewportFit: "cover"` does not break the existing pages or layouts | Pitfall 1, Code Example 1 | None — this is a viewport-meta hint; if anything goes wrong it's edge content being placed under iOS notch (which existing pages don't currently care about). |

**Confirmation needed before/during execution:** A1 and A2 are visual checks performed during plan execution (not blockers for plan generation). A3–A5 are low-risk.

---

## Open Questions

1. **NAV-03 "each tab remembers scroll position" — Phase 7 scope?**
   - What we know: REQUIREMENTS.md NAV-03 mentions scroll memory. DESIGN_SYSTEM.md §8.2 confirms "Each tab remembers its scroll position." CONTEXT.md "Deferred Ideas" suggests deferring to Phase 10 unless researcher flags as Phase 7 critical.
   - What's unclear: Next.js App Router preserves scroll on back/forward navigation by default, but NOT on direct tab clicks (where a `<Link>` to a previously-visited tab will reset to top). Implementing per-tab scroll memory requires either (a) a custom React context that snapshots `window.scrollY` on tab unmount + restores on remount, or (b) keeping all tab content mounted via a layout-level layout pattern (memory-expensive). Neither is trivial.
   - Recommendation: **Defer to a follow-up phase (Phase 10 or 11).** Phase 7 ships NAV-03 instant-switch + flat-structure correctness; scroll memory is added later. Document this in the Phase 7 RESEARCH/PLAN as a known partial-implementation. The acceptance criterion can be relaxed to "tab switches feel instant" with a deferred ticket for scroll memory.

2. **Lucide icon visual review for filled state on all 4 tabs**
   - What we know: The `fill="currentColor" strokeWidth={0}` trick is the documented lucide workaround.
   - What's unclear: Without running the build and looking at the rendered output, can't be 100% certain all 4 icons look good filled. ChartPie and List might lose interior detail; House and Settings should be fine.
   - Recommendation: Plan should include a checkpoint after TabBar implementation to view the page in a browser and visually confirm. If any icon looks bad, swap to a lucide alternative (e.g. `Home` instead of `House`; `Cog` instead of `Settings`; `Menu` instead of `List`). Document the chosen alternatives in the PLAN.

3. **Single `<main>` enforcement across both groups**
   - What we know: Each group's tree has its own `<main>` (PageShell for BB, the explicit `<main>` in `(legacy)/layout.tsx` for legacy). A standalone page like `/login` has its own `<main>` (already in code).
   - What's unclear: After moving `src/app/page.tsx` into `(bb)/`, the page currently has `<main className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">` at line 99. If PageShell renders `<main>` AND the page renders another, that's invalid.
   - Recommendation: The plan's "move home page" task must include an inline edit to swap the page's outer `<main>` for a `<div>` or `<section>` fragment. This is a small but mandatory change. Settings page (`src/app/settings/page.tsx`) needs the same check.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| `bun` runtime + package manager | Build + dev workflow | ✓ | (per project setup) | None — project rule forbids npm/yarn |
| `next` (App Router) | All routing | ✓ | 15.2.8 | — |
| `react` 19 | UI runtime | ✓ | 19.0.0 | — |
| `lucide-react` | Tab icons (NAV-01) | ✓ | 0.479.0 | — |
| `next-themes` | Theme provider in root layout | ✓ | 0.4.6 | — |
| `tailwindcss` v4 | All styling | ✓ | ^4 | — |
| `vitest` + `@testing-library/react` | TDD for testable logic (TabBar active-state) | ✓ | 4.0.18 / 16.3.2 | — |

**Missing dependencies with no fallback:** None.
**Missing dependencies with fallback:** None.

All required tools and libraries are already installed and previously exercised in this codebase. Phase 7 introduces zero new dependencies.

---

## Validation Architecture

> `workflow.nyquist_validation` is `true` in `.planning/config.json`. Section is included.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `vitest@4.0.18` + `@testing-library/react@16.3.2` + `jsdom@27.4.0` + `@testing-library/jest-dom@6.9.1` |
| Config file | `vitest.config.ts` (root) |
| Quick run command | `bun run test` (runs full suite — fast for current ~2 tests; can scope to `tests/components/TabBar.test.tsx` once added) |
| Full suite command | `bun run test` followed by `bun run typecheck` and `bun run build` |

**Existing test patterns:** `tests/components/*.test.tsx` uses jsdom + Testing Library. Setup at `tests/setup.ts` provides `ResizeObserver` stub and `jest-dom` matchers. Tests are smoke/render-level — not integration with Next.js routing. Mocking `usePathname()` is straightforward via `vi.mock("next/navigation", () => ({ usePathname: () => "/budgets" }))`.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| NAV-01 | TabBar renders 4 tabs with correct hrefs and labels | unit (component render) | `bun run test tests/components/TabBar.test.tsx` | ❌ Wave 0 |
| NAV-02 | Active tab has `text-bb-info` class + filled icon; inactive has `text-bb-text-secondary` + outlined | unit (parameterized by `usePathname` mock) | `bun run test tests/components/TabBar.test.tsx` | ❌ Wave 0 |
| NAV-03 | All tab `<a>` href values resolve via `<Link>` (instant client transition) | unit (assert `href` attributes; `<Link>` rendering is a Next.js concern, trust it) | `bun run test tests/components/TabBar.test.tsx` | ❌ Wave 0 |
| NAV-03 (scroll memory) | Each tab remembers scroll position | **manual-only** (App Router doesn't expose hook for this; integration test would require Playwright which is out of scope) | manual test post-deploy | n/a |
| NAV-04 | All 5 legacy routes return 200 and render legacy chrome (not BB chrome) | integration (HTTP-level) — best done as **smoke test** during `bun run build` + visual check, OR a `tests/smoke/routes.test.ts` that imports and renders each page (requires mocking Supabase) | `bun run build` (build success proves routes resolve) + manual GET in dev | ❌ Wave 0 (smoke test optional) |
| NAV-04 (dashboard 308) | `/dashboard` returns 308 → `/` | integration | `bun run build` (build success) + manual `curl -I http://localhost:3031/dashboard` returns 308 | ❌ existing redirect, post-move re-verify |
| NAV-05 | `PageShell` renders children inside max-width container with bottom padding | unit (assert classes / computed styles) | `bun run test tests/components/PageShell.test.tsx` | ❌ Wave 0 |
| NAV-05 | `PageHeader` renders title and optional subtitle | unit | `bun run test tests/components/PageHeader.test.tsx` | ❌ Wave 0 |
| NAV-06 | `/login` and `/link-bank` render WITHOUT TabBar | integration — visual check or assert TabBar absent in rendered HTML | manual + visual + `bun run build` | n/a (manual) |
| (build sanity) | `bun run build` passes (Success Criteria #5) | build | `bun run build` | n/a |

### Sampling Rate

- **Per task commit:** `bun run test` (fast — runs all vitest tests, currently ~2 files; with new tests added, still under 5s) + `bun run typecheck` (TypeScript safety)
- **Per wave merge:** `bun run test && bun run typecheck && bun run build`
- **Phase gate:** Full suite green + manual smoke of all 11 URLs in browser (4 BB + 5 legacy + 2 standalone) before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `tests/components/TabBar.test.tsx` — covers NAV-01, NAV-02, NAV-03 (`<Link>` href correctness; mocked `usePathname`)
- [ ] `tests/components/PageShell.test.tsx` — covers NAV-05 (render + class assertions)
- [ ] `tests/components/PageHeader.test.tsx` — covers NAV-05 (title + optional subtitle)
- [ ] Optional: `tests/smoke/legacy-routes.test.ts` — covers NAV-04 (build-time presence check; full SSR test is overkill for Phase 7)

**No new framework install required** — vitest, Testing Library, and jsdom are all configured.

### TDD Applicability (per `tdd_mode: true`)

| Task Candidate | TDD-Eligible? | Rationale |
|----------------|---------------|-----------|
| Active-tab detection logic in TabBar | ✓ YES | Pure function of `pathname` → which tab gets `text-bb-info`. Testable with mocked `usePathname`. Write the test asserting active class first; implement after. |
| `<Link>` href correctness (NAV-01) | ✓ YES | Assert each rendered link's `href` matches the TABS table. Test-first. |
| PageHeader subtitle conditional render | ✓ YES | "Renders subtitle if provided" / "Does not render subtitle if omitted". Simple, test-first. |
| PageShell max-width application | partial | Can assert class is present; the actual layout effect is visual. Test-first for the class, visual confirm for the effect. |
| Slim root layout (file move + delete imports) | ✗ NO | Pure structural; no logic to test. Verify via `bun run build` succeeding + smoke test. |
| `(legacy)/layout.tsx` creation | ✗ NO | Pure structural; verify via legacy routes still rendering correctly. |
| `(bb)/layout.tsx` creation | ✗ NO | Same — verify via BB pages rendering with TabBar visible. |
| `git mv` of page files | ✗ NO | File system operation. Verify via build success + URL still resolves. |
| Stub `/budgets` and `/transactions` pages | partial | "Renders the title and subtitle" is trivially test-first; visual is a smoke check. |

**Planner directive:** Apply `type: tdd` to TabBar test + PageHeader test + PageShell test tasks. Other tasks are `type: ui` or `type: code` per existing GSD conventions.

---

## Security Domain

> `security_enforcement` defaults to enabled (key absent in config).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes (existing) | Supabase Auth via `src/middleware.ts` — Phase 7 does NOT modify middleware (D-13). Route group moves do not affect URL-based auth matchers. |
| V3 Session Management | yes (existing) | Supabase session cookies via `@supabase/ssr` — Phase 7 does NOT modify. |
| V4 Access Control | yes (existing) | Middleware-based; matchers unchanged. The new `/budgets` and `/transactions` routes are stubs with NO user data and are NOT in the matcher list — they're accessible without auth in Phase 7. **Risk?** Tiny: the routes contain only static placeholder copy. When Phase 9 adds real user data, those URLs MUST be added to the middleware matcher. |
| V5 Input Validation | no | No user input handled in Phase 7 (TabBar, PageShell, PageHeader are presentational). |
| V6 Cryptography | no | Not applicable to Phase 7. |
| V14 Configuration | yes (modest) | `viewportFit: "cover"` is added to viewport config — no security implication; pure layout/iOS hint. |

### Known Threat Patterns for App Router + Bottom Nav

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Open redirect via TabBar | Tampering | TabBar `href` values are hard-coded constants in `TABS`. No user-controlled redirects. |
| XSS in placeholder copy | Tampering | All page text is hard-coded JSX text; React escapes by default. |
| Route enumeration | Information Disclosure | Legacy routes were already public (PasscodeWrapper guards `/legacy` only, not auth). Phase 7 doesn't change exposure. `/budgets` and `/transactions` stubs are public but contain no sensitive info. |
| Auth bypass via route group | EoP | Route groups are URL-transparent; middleware matchers continue to work. Verified explicitly by D-13. |

**Action items for the planner:**
- Add a TODO comment in `(bb)/budgets/page.tsx` and `(bb)/transactions/page.tsx` noting that when Phase 9 adds real data, the URLs `/budgets` and `/transactions` must be added to `middleware.ts` matcher list.
- No new middleware logic, no new RLS, no new auth flows — Phase 7 is security-neutral.

---

## Project Constraints (from CLAUDE.md)

Extracted directives the planner MUST honor:

- **Junior-friendly comments mandatory:** Every new file gets a header comment explaining purpose. Non-trivial logic gets inline explanation of "what + why + extension points". Already reflected in all Code Examples above.
- **Additive-first / never break legacy:** All legacy routes must continue to work. Verified by NAV-04 + the `(legacy)/` group preserving the existing chrome verbatim.
- **No direct `@radix-ui` imports in BB code:** TabBar uses `lucide-react` + native `<nav>/<ul>/<li>/<Link>`. No Radix involvement. ✓
- **Use shadcn/ui for new components when applicable:** TabBar is a custom presentational primitive — shadcn/ui has no equivalent. PageShell/PageHeader are also pure structural primitives. No shadcn/ui needed. ✓
- **Package manager: `bun` ONLY:** All commands in this research use `bun`. ✓
- **`git mv` for file moves:** D-03 + D-07 specify this. Planner must produce explicit `git mv` commands in tasks (not "move file" or "delete and create"). ✓
- **STOP & ASK rules:** If the planner discovers a need to modify `middleware.ts`, auth flow, or schema during Phase 7 — STOP. Phase 7 has none of these by design.
- **Never work directly in main branch (rule 12):** Planner must include a "create feature branch" task as Wave 0 step 1. Suggested branch name: `phase-07/layout-shell-navigation` or follow project convention.
- **No formatting-only commits (rule 11):** All commits in Phase 7 should be functional (move file, create layout, etc.). No standalone "prettier pass" commits.
- **Documentation is part of the task (rule 9):** Phase 7 introduces a new architectural concept (route groups for layout isolation). Plan should include a small docs note — e.g., a short paragraph in `docs/DESIGN_SYSTEM.md` §12 or a `docs/ROUTE_GROUPS.md` — explaining the `(bb)/` and `(legacy)/` separation for future contributors.

---

## Sources

### Primary (HIGH confidence)
- [nextjs.org/docs/app/api-reference/file-conventions/route-groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups) — Route Groups behavior, conflicting-path caveats, URL transparency
- [nextjs.org/docs/app/api-reference/functions/use-pathname](https://nextjs.org/docs/app/api-reference/functions/use-pathname) — `usePathname()` client-only, return values for `/`
- [nextjs.org/docs/app/getting-started/server-and-client-components](https://nextjs.org/docs/app/getting-started/server-and-client-components) — `"use client"` module-graph rule + children-as-prop pattern
- [nextjs.org/docs/app/getting-started/layouts-and-pages](https://nextjs.org/docs/app/getting-started/layouts-and-pages) — Nested layout composition, root layout requirements
- [lucide.dev/guide/lucide/advanced/filled-icons](https://lucide.dev/guide/lucide/advanced/filled-icons) — Official "fills not supported" stance + `fill` + `stroke-width={0}` pattern
- [lucide.dev/icons/house](https://lucide.dev/icons/house) — Confirms `House` import name exists in lucide-react
- [lucide.dev/icons/list](https://lucide.dev/icons/list) — Confirms `List` import name exists in lucide-react
- Codebase: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/middleware.ts`, `src/components/legacy/**`, `src/contexts/AppContext.tsx`, `src/contexts/BudgetContext.tsx`, `src/app/globals.css`, `package.json`, `vitest.config.ts`, `tests/setup.ts`, `tests/components/budget-progress.test.tsx`
- Project docs: `docs/DESIGN_SYSTEM.md` §4.2, §7.3, §8, §12.3; `.planning/REQUIREMENTS.md` NAV-01..NAV-06; `.planning/phases/07-layout-shell-navigation/07-CONTEXT.md`

### Secondary (MEDIUM confidence)
- [github.com/vercel/next.js discussion #81264](https://github.com/vercel/next.js/discussions/81264) — `<Link>` + `env(safe-area-inset-bottom)` interaction; `viewportFit: "cover"` workaround
- [github.com/lucide-icons/lucide discussion #458](https://github.com/lucide-icons/lucide/discussions/458) — Community thread on fill prop reliability across icons
- [github.com/lucide-icons/lucide issue #893](https://github.com/lucide-icons/lucide/issues/893) — Official confirmation lucide will not ship filled variants

### Tertiary (LOW confidence — flagged for validation if used)
- Various Medium and dev.to articles on iOS PWA safe-area handling (general technique is well-established; specific snippets unused)

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — all libraries already in `package.json` with versions confirmed
- Architecture (route groups, server-vs-client): **HIGH** — every claim traced to official Next.js docs
- Pitfalls: **HIGH** — Pitfalls 1, 2, 4, 5 cited to docs/spec; Pitfall 3 cited to lucide docs; Pitfalls 6, 7 verified against codebase
- Lucide icon filled-state visual quality: **MEDIUM** — pattern is documented but visual reliability requires a manual check (see A1, Open Question §2)
- Test architecture: **HIGH** — existing vitest setup verified; new test files are mechanical extensions of existing patterns

**Research date:** 2026-05-19
**Valid until:** ~2026-06-19 (30 days; longer for the structural patterns, shorter if Next.js issues a significant App Router update — check `next` version against 15.2.8 before re-using)
