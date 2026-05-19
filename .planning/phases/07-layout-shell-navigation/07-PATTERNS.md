# Phase 7: Layout Shell & Navigation — Pattern Map

**Mapped:** 2026-05-19
**Files analyzed:** 14 (3 new components, 3 new layouts, 3 modified pages, 1 new + 1 modified page, 3 new test files, 1 documentation update)
**Analogs found:** 12 / 14 (TabBar and `(bb)/layout.tsx` have no exact analog; PageShell/PageHeader use legacy `PageLayout` as a partial-match guide)

> Phase 7 is structural plumbing. Almost every line of new code has a strong existing analog in the codebase — either in the legacy chrome (root `layout.tsx`, `PageLayout.tsx`) or in the BB dashboard family (`page.tsx`, `BudgetProgressSection.tsx`, `SyncTransactionsButton.tsx`). The only genuinely novel components are `TabBar.tsx` (no existing bottom-nav primitive — closest pattern is the route-group convention already proven by `(auth)/login/page.tsx`) and the new `(bb)/layout.tsx` (route-group layouts have no prior instance in this repo, but the structure mirrors a slimmed root layout).

---

## File Classification

| New/Modified File | Action | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|--------|------|-----------|----------------|---------------|
| `src/app/layout.tsx` | MODIFY (slim down) | root layout / config | request-response (SSR shell) | (itself, pre-Phase-7) | exact (same file, surgical removal) |
| `src/app/(bb)/layout.tsx` | CREATE | route-group layout (server) | request-response (SSR shell) | `src/app/layout.tsx` (current) — wraps `{children}` with chrome | role-match |
| `src/app/(legacy)/layout.tsx` | CREATE | route-group layout (server) | request-response (SSR shell) | `src/app/layout.tsx` (current, lines 62-99) — extract legacy chrome verbatim | exact (extract-and-relocate) |
| `src/components/layout/PageShell.tsx` | CREATE | component (server) — page wrapper | request-response (presentational) | `src/components/legacy/helpers/PageLayout.tsx` | role-match (different styling/tokens, same wrapper pattern) |
| `src/components/layout/PageHeader.tsx` | CREATE | component (server) — heading block | request-response (presentational) | `src/app/legacy-index/page.tsx` lines 47-54 (inline header) + `src/app/settings/page.tsx` lines 62-68 | role-match (inline patterns to be extracted) |
| `src/components/layout/TabBar.tsx` | CREATE | component (client) — interactive navigation | event-driven (URL → active state) | `src/components/legacy/common/ThemeToggle.tsx` (client + lucide pattern, not read yet — see below) + `src/components/dashboard/SyncTransactionsButton.tsx` (`"use client"` pattern) | partial (no existing nav primitive; cobble from client-component + route-group conventions) |
| `src/app/(bb)/page.tsx` | MOVE + EDIT | page (server) | request-response (SSR, DB-backed) | `src/app/page.tsx` (current) | exact (same file, downgrade `<main>` → `<div>`) |
| `src/app/(bb)/settings/page.tsx` | MOVE + EDIT | page (server) | request-response (SSR, DB-backed) | `src/app/settings/page.tsx` (current) | exact (same file, downgrade `<main>` → `<div>` or `<>` fragment) |
| `src/app/(bb)/budgets/page.tsx` | CREATE (stub) | page (server) | request-response (static) | `src/app/legacy-index/page.tsx` (structure only — title + subtitle + body) | role-match |
| `src/app/(bb)/transactions/page.tsx` | CREATE (stub) | page (server) | request-response (static) | `src/app/legacy-index/page.tsx` (structure only — title + subtitle + body) | role-match |
| `src/app/(legacy)/{legacy,analytics,achievements,dashboard,legacy-index}/page.tsx` | MOVE via `git mv` | pages (server, mix) | n/a (file relocation) | (themselves) — content unchanged | exact (`git mv` only, no content edit) |
| `tests/components/TabBar.test.tsx` | CREATE | test | unit (render + class assertion) | `tests/components/budget-progress.test.tsx` | role-match |
| `tests/components/PageShell.test.tsx` | CREATE | test | unit (render + class assertion) | `tests/components/budget-progress.test.tsx` | role-match |
| `tests/components/PageHeader.test.tsx` | CREATE | test | unit (render + conditional subtitle) | `tests/components/budget-progress.test.tsx` | role-match |

**No analog files** (planner relies on RESEARCH.md Code Examples 2 & 6):
- `src/app/(bb)/layout.tsx` — first route-group layout for BB; pattern is identical to current root layout but with `<PageShell>` + `<TabBar />` instead of legacy chrome.
- `src/components/layout/TabBar.tsx` — no existing bottom-nav component in the codebase; built from `usePathname()` + `<Link>` + `lucide-react` per RESEARCH §Code Example 6.

---

## Pattern Assignments

### `src/app/layout.tsx` — MODIFY (slim down)

**Analog:** itself, pre-Phase-7 (`src/app/layout.tsx` lines 1-99).

**File header comment pattern** (current lines 1-16 — Apache 2.0 license block):
```tsx
/*
 *   Copyright (c) 2025 Laith Alkhaddam aka Iconical or Sleepyico.
 *   All rights reserved.
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   ...
 */
```
**Keep this license block in the slimmed file.** Add a new BB-specific header comment immediately below it explaining the new "truly-global only" scope (per RESEARCH §Code Example 1).

**Imports pattern to KEEP** (current lines 17-19, 24, 27):
```tsx
import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Toaster from "@/components/legacy/effects/Sonner";
import { generateMetadata } from "@/lib/head";
import { ThemeProvider } from "@/components/legacy/providers/ThemeProvider";
```

**Imports pattern to REMOVE** (current lines 20-23, 25-26, 28-31):
```tsx
import PasscodeWrapper from "@/components/legacy/security/PasscodeWrapper";
import GoToTop from "@/components/legacy/helpers/GoToTop";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { ThemeToggle } from "@/components/legacy/common/ThemeToggle";
import Logo from "@/components/common/Logo";
import { Settings } from "@/components/legacy/common/Settings";
import PageLayout from "@/components/legacy/helpers/PageLayout";
import { Achievements } from "@/components/legacy/common/Achievements";
import { AppProvider } from "@/contexts/AppContext";
```
These all move to `(legacy)/layout.tsx`.

**Font setup pattern to KEEP** (current lines 33-41):
```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

**Metadata export pattern to KEEP** (current line 43):
```tsx
export const metadata = generateMetadata;
```

**Viewport export pattern to MODIFY** (current lines 45-51 — add `viewportFit: "cover"` per RESEARCH Pitfall 1):
```tsx
export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
  userScalable: false,
  themeColor: "#166d3b",
  viewportFit: "cover",  // NEW — required for iOS safe-area-inset-bottom to work
};
```

**Dev-only `import("@/lib/recurring")` pattern to KEEP** (current lines 58-60):
```tsx
if (process.env.NODE_ENV !== "production") {
  import("@/lib/recurring");
}
```

**Body className change** (current line 69 — remove `flex justify-center items-center`, those move with the legacy chrome to `(legacy)/layout.tsx` line `<main>`):
- BEFORE: `className={\`${geistSans.variable} ${geistMono.variable} antialiased min-w-full flex justify-center items-center\`}`
- AFTER: `className={\`${geistSans.variable} ${geistMono.variable} antialiased min-w-full\`}`

**Render tree to KEEP** (slim shell — html/body/ThemeProvider/children/Toaster):
```tsx
<html lang="en" suppressHydrationWarning className="scroll-smooth scroll-p-4 overflow-hidden overflow-y-scroll">
  <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-full`} suppressHydrationWarning>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
      <Toaster />
    </ThemeProvider>
  </body>
</html>
```

**Render tree to REMOVE** (entire `PasscodeWrapper → AppProvider → BudgetProvider → <main> → PageLayout → Logo/Settings/Achievements/ThemeToggle/{children}` + `GoToTop` — current lines 78-94). This subtree moves verbatim into `(legacy)/layout.tsx`.

---

### `src/app/(bb)/layout.tsx` — CREATE

**Analog:** structurally similar to slimmed root `src/app/layout.tsx` (BB-specific chrome wraps `{children}`); no exact codebase precedent.

**Reference pattern:** RESEARCH §Code Example 2 (verbatim acceptable).

**Header comment pattern** (junior-friendly explanation per CLAUDE.md team context, mirroring the style of `src/app/page.tsx` lines 1-41 and `src/components/dashboard/BudgetProgressSection.tsx` lines 1-14):
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
```

**Imports pattern** (mirrors `src/app/page.tsx` line 53-59 style — barrel import via `@/`):
```tsx
import { PageShell } from "@/components/layout/PageShell";
import { TabBar } from "@/components/layout/TabBar";
```

**Core layout pattern** (RESEARCH §Code Example 2 verbatim):
```tsx
export default function BBLayout({ children }: { children: React.ReactNode }) {
  return (
    <PageShell>
      {children}
      <TabBar />
    </PageShell>
  );
}
```

**Anti-pattern check:** Do NOT add `"use client"` to this file (RESEARCH Pitfall 4). Server component must stay server-only.

---

### `src/app/(legacy)/layout.tsx` — CREATE

**Analog:** `src/app/layout.tsx` (current) lines 78-94 — extract the legacy chrome stack verbatim.

**Header comment pattern** (junior-friendly):
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
 * carry their own client boundaries; adding it here would degrade SSR for legacy pages
 * (see RESEARCH Pitfall 6).
 */
```

**Imports pattern** (relocated from current `src/app/layout.tsx` lines 20-31):
```tsx
import PasscodeWrapper from "@/components/legacy/security/PasscodeWrapper";
import { AppProvider } from "@/contexts/AppContext";
import { BudgetProvider } from "@/contexts/BudgetContext";
import GoToTop from "@/components/legacy/helpers/GoToTop";
import { ThemeToggle } from "@/components/legacy/common/ThemeToggle";
import Logo from "@/components/common/Logo";
import { Settings } from "@/components/legacy/common/Settings";
import PageLayout from "@/components/legacy/helpers/PageLayout";
import { Achievements } from "@/components/legacy/common/Achievements";
```

**Render tree pattern** (relocated verbatim from current `src/app/layout.tsx` lines 78-91; **add** `flex justify-center items-center` to the `<main>` element because that styling moved from the root `<body>` — see RESEARCH §Code Example 3 footnote):
```tsx
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

**Important diff vs current root:** `<Toaster />` is NOT inside this stack — it stays at root (D-05). The current root layout has `<Toaster />` nested inside `<BudgetProvider>` (line 91 of pre-Phase-7 root) but since it has no dependency on those providers (`Toaster` is the Sonner global), it cleanly relocates to the slim root.

---

### `src/components/layout/PageShell.tsx` — CREATE (server component)

**Analog:** `src/components/legacy/helpers/PageLayout.tsx` (lines 1-43).

**Reference pattern:** RESEARCH §Code Example 4 (verbatim acceptable, with junior-friendly comments retained).

**Header comment pattern** (mirrors the verbose explanatory style of `src/components/dashboard/BudgetProgressSection.tsx` lines 1-14 — BB-friendly explanation, not legacy Apache header):
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
 *   </PageShell>
 *
 * TabBar height target: 56px (matches the h-[56px] in TabBar.tsx)
 * Bottom padding = 56px (bar) + env(safe-area-inset-bottom) + 1rem breathing room.
 */
```

**Imports pattern** (matches legacy `PageLayout.tsx` line 20):
```tsx
import { cn } from "@/lib/utils";
```

**Props interface pattern** (matches `BudgetProgressSection.tsx` lines 24-27 — single-purpose interface near component):
```tsx
interface PageShellProps {
  children: React.ReactNode;
  className?: string;
}
```

**Core pattern** (RESEARCH §Code Example 4 — `<main>` wrapper with token-based padding + safe-area calc; styling differs from legacy but the `cn(...)` composition mirrors `PageLayout.tsx` lines 30-38):
```tsx
export function PageShell({ children, className }: PageShellProps) {
  return (
    <main
      className={cn(
        "min-h-svh w-full max-w-[768px] mx-auto",
        "px-bb-4 md:px-bb-6",
        "pt-bb-6",
        "pb-[calc(56px+env(safe-area-inset-bottom)+1rem)]",
        "bg-bb-bg text-bb-text",
        className
      )}
    >
      {children}
    </main>
  );
}
```

**Contrast with analog:** Legacy `PageLayout.tsx` uses `useApp()` to read `appWidth` and toggles between Compact and Normal max-widths. PageShell is intentionally simpler — single max-width, no client hooks, no user preference. This is the BB simplification of the legacy pattern.

---

### `src/components/layout/PageHeader.tsx` — CREATE (server component)

**Analog (partial):** the inline page-header blocks repeated across BB pages — `src/app/legacy-index/page.tsx` lines 47-54 and `src/app/settings/page.tsx` lines 62-68. PageHeader extracts this duplicated pattern into a reusable primitive.

**Inline pattern currently duplicated in `src/app/settings/page.tsx` lines 62-68:**
```tsx
<div>
  <h1 className="text-2xl font-bold">Settings</h1>
  <p className="text-muted-foreground">
    Customize your BetterBudget experience
  </p>
</div>
```

**Inline pattern currently duplicated in `src/app/legacy-index/page.tsx` lines 47-54:**
```tsx
<div>
  <h1 className="text-2xl font-bold">Legacy App (OopsBudgeter)</h1>
  <p className="text-muted-foreground mt-2">
    Access the original OopsBudgeter functionality
  </p>
</div>
```

**Header comment pattern** (junior-friendly, mirrors `BudgetProgressSection.tsx` lines 1-14):
```tsx
/**
 * PageHeader — Consistent page title + subtitle
 *
 * Per DESIGN_SYSTEM §7.3 every BB page starts with title (h1) and optional subtitle.
 * Server component (no interactivity).
 *
 * Spacing: 8px gap between title and subtitle (DESIGN_SYSTEM §3.3 "headings followed by 8px").
 * Section gap below header is provided by mb-bb-8 — children control further spacing.
 */
```

**Imports pattern:**
```tsx
import { cn } from "@/lib/utils";
```

**Props interface pattern:**
```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}
```

**Core pattern** (RESEARCH §Code Example 5 — replaces the inline `<div><h1><p>` pattern with a semantic `<header>` + BB tokens):
```tsx
export function PageHeader({ title, subtitle, className }: PageHeaderProps) {
  return (
    <header className={cn("mb-bb-8", className)}>
      <h1 className="text-bb-3xl font-bold text-bb-text">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-bb-2 text-bb-base text-bb-text-secondary">
          {subtitle}
        </p>
      )}
    </header>
  );
}
```

**Note on Tailwind utility names:** UI-SPEC §Typography uses `text-bb-3xl`, `text-bb-base`, `mt-bb-2`, etc. — these are wired via `@theme inline` in Phase 6. If a class doesn't resolve at build time, fall back to `text-[var(--bb-text-3xl)]` per RESEARCH §Code Example 5 footnote. **Planner must include a quick build-time check in Wave 0.**

---

### `src/components/layout/TabBar.tsx` — CREATE (client component)

**Analog (partial):** `src/components/dashboard/SyncTransactionsButton.tsx` (lines 1-32) provides the `"use client"` + lucide-style icon + Tailwind utility pattern. The bottom-nav behavior itself is novel — RESEARCH §Code Example 6 is the canonical reference.

**`"use client"` directive pattern** (mirrors `SyncTransactionsButton.tsx` line 1):
```tsx
"use client";
```

**Header comment pattern** (junior-friendly, longer because Phase 7 introduces the lucide filled-icon trick that future maintainers need to understand):
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
 * See RESEARCH §Pitfall 3 + lucide.dev/guide/lucide/advanced/filled-icons.
 *
 * EXTENSION POINTS:
 * - Scroll-position-per-tab memory: deferred (RESEARCH §Open Questions §1)
 * - Press/hover animations: deferred to Phase 11 motion pass
 * - Focus-visible ring override: see UI-SPEC §Interaction States if global ring is too faint
 */
```

**Imports pattern** (combines `SyncTransactionsButton.tsx` style with RESEARCH §Code Example 6):
```tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ChartPie, List, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
```

**Tab config pattern** (mirrors `legacy-index/page.tsx` lines 26-43 `LEGACY_ROUTES` config — typed const array of route definitions):
```tsx
type Tab = { href: string; label: string; Icon: LucideIcon };

// Tab order is fixed per DESIGN_SYSTEM §8.1
const TABS: Tab[] = [
  { href: "/",             label: "Home",         Icon: House },
  { href: "/budgets",      label: "Budgets",      Icon: ChartPie },
  { href: "/transactions", label: "Transactions", Icon: List },
  { href: "/settings",     label: "Settings",     Icon: Settings },
];
```

**Active-state detection pattern** (RESEARCH §Code Example 6 — `usePathname()` exact match):
```tsx
export function TabBar() {
  const pathname = usePathname();
  // ...TABS.map(({ href, label, Icon }) => { const isActive = pathname === href; ... })
}
```

**Render pattern** (RESEARCH §Code Example 6, verbatim — fixed-bottom `<nav>` + `<ul>/<li>` + `<Link>` per tab + filled-icon trick):
```tsx
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
        const isActive = pathname === href;
        return (
          <li key={href} className="flex-1">
            <Link
              href={href}
              aria-current={isActive ? "page" : undefined}
              aria-label={label}
              className={cn(
                "flex flex-col items-center justify-center gap-1",
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
```

**Anti-pattern to avoid:** Do NOT use `pathname.startsWith(href)` for index `/` — it matches everything (UI-SPEC §Anti-Patterns #14). Use exact equality (`pathname === href`).

---

### `src/app/(bb)/page.tsx` — MOVE (`git mv src/app/page.tsx src/app/(bb)/page.tsx`) + EDIT

**Analog:** itself, current `src/app/page.tsx` lines 1-348.

**`git mv` first** (preserves blame per CLAUDE.md rule 10):
```bash
git mv src/app/page.tsx src/app/(bb)/page.tsx
```

**Edit pattern — swap outer `<main>` for `<div>`** (current line 99 — Pitfall 5 mitigation: PageShell now provides the `<main>`):
- BEFORE (current line 99):
  ```tsx
  <main className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
  ```
- AFTER (Phase 7):
  ```tsx
  <div className="flex flex-col gap-6">
  ```
  (drop `p-6 max-w-5xl mx-auto` — PageShell provides padding and max-width; keep `flex flex-col gap-6` for inner content rhythm)

- Closing tag: change `</main>` (current line 304) → `</div>`.

**Keep unchanged:** header comment (lines 1-41), imports (43-60), metadata (62-64), data-fetching logic (66-96), all internal `<section>` blocks (105-303), helper functions (308-348).

---

### `src/app/(bb)/settings/page.tsx` — MOVE (`git mv src/app/settings/page.tsx src/app/(bb)/settings/page.tsx`) + EDIT

**Analog:** itself, current `src/app/settings/page.tsx` lines 1-167.

**`git mv` first:**
```bash
git mv src/app/settings/page.tsx src/app/(bb)/settings/page.tsx
```

**Edit pattern — swap outer `<main>` for `<div>`** (current line 61 — Pitfall 5 mitigation):
- BEFORE (current line 61):
  ```tsx
  <main className="flex flex-col gap-6 p-6 max-w-2xl mx-auto">
  ```
- AFTER (Phase 7):
  ```tsx
  <div className="flex flex-col gap-6">
  ```

- Closing tag: change `</main>` (current line 165) → `</div>`.

**Keep unchanged:** header comment, imports, auth check (lines 27-38), budget fetch (44-54), all body sections (62-164), metadata (22-24). **Phase 9 will reorganize the body to use `PageHeader` — out of Phase 7 scope.**

---

### `src/app/(bb)/budgets/page.tsx` — CREATE (stub)

**Analog:** `src/app/legacy-index/page.tsx` (structural — title + subtitle + body pattern; lines 1-21 for header comment + metadata, lines 45-54 for page shape).

**Reference pattern:** RESEARCH §Code Example 7 (verbatim acceptable).

**Header comment pattern** (junior-friendly, explicit extension point per CLAUDE.md team context):
```tsx
/**
 * Budgets Page — Stub for Phase 7
 *
 * This page exists in Phase 7 only so the /budgets tab has somewhere to navigate to.
 * Content is filled in by Phase 9 (PAGE-04). Stub copy is user-facing and neutral
 * per CONTEXT.md D-08.
 *
 * EXTENSION POINT: Phase 9 will replace the placeholder paragraph with monthly overview,
 * budget progress cards, spending donut chart (migrated from Home), and "Edit budgets →" link.
 *
 * SECURITY NOTE: When Phase 9 adds real user data here, the /budgets URL MUST be added
 * to src/middleware.ts matchers (currently public — only static placeholder text).
 */
```

**Imports pattern** (mirrors `legacy-index/page.tsx` lines 15-16 + Phase 7's new `@/components/layout`):
```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { generateMetadata } from "@/lib/head";
```

**Metadata export pattern** (verbatim from `legacy-index/page.tsx` lines 18-20 / `settings/page.tsx` lines 22-24):
```tsx
export const metadata = generateMetadata({ title: "Budgets" });
```

**Core page pattern** (RESEARCH §Code Example 7 — fragment return, no outer `<main>` since PageShell provides it):
```tsx
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

---

### `src/app/(bb)/transactions/page.tsx` — CREATE (stub)

**Analog:** identical structure to `(bb)/budgets/page.tsx` above — same template, different copy.

**Header comment:** same pattern, swap "Budgets" → "Transactions", "/budgets" → "/transactions", "PAGE-04" → "PAGE-05".

**Imports & metadata:**
```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({ title: "Transactions" });
```

**Core page pattern:**
```tsx
export default function TransactionsPage() {
  return (
    <>
      <PageHeader title="Transactions" subtitle="Your spending history" />
      <p className="text-bb-base text-bb-text-secondary">
        Your transactions will appear here.
      </p>
    </>
  );
}
```

---

### Legacy page moves — `git mv` only (no content edits)

| Current path | New path |
|--------------|----------|
| `src/app/legacy/page.tsx` | `src/app/(legacy)/legacy/page.tsx` |
| `src/app/analytics/page.tsx` | `src/app/(legacy)/analytics/page.tsx` |
| `src/app/achievements/page.tsx` | `src/app/(legacy)/achievements/page.tsx` |
| `src/app/dashboard/page.tsx` | `src/app/(legacy)/dashboard/page.tsx` |
| `src/app/legacy-index/page.tsx` | `src/app/(legacy)/legacy-index/page.tsx` |

**Pattern:** pure `git mv` invocations per CLAUDE.md rule 10. **No content edits.** URLs are unchanged because `(legacy)` is a route group.

```bash
git mv src/app/legacy src/app/(legacy)/legacy
git mv src/app/analytics src/app/(legacy)/analytics
git mv src/app/achievements src/app/(legacy)/achievements
git mv src/app/dashboard src/app/(legacy)/dashboard
git mv src/app/legacy-index src/app/(legacy)/legacy-index
```

(Note: `src/app/legacy/page.tsx` line 26 currently has its own `<main>` — that's INSIDE the legacy `<main>` from `(legacy)/layout.tsx`, producing a double-`<main>`. **This pre-existed in the current codebase** — `legacy/page.tsx` already nests inside the root layout's `<main className="p-0 md:p-6">`. Phase 7 does NOT fix this; it's a pre-existing legacy issue out of scope per "do not break OopsBudgeter". Document as a known-acceptable limitation in PLAN if checker flags.)

---

### `tests/components/TabBar.test.tsx` — CREATE

**Analog:** `tests/components/budget-progress.test.tsx` (lines 1-113).

**Header comment pattern** (mirrors `budget-progress.test.tsx` lines 1-13):
```tsx
/**
 * TabBar Render Tests
 *
 * Verifies that the TabBar component renders 4 tabs with correct hrefs/labels (NAV-01)
 * and applies active/inactive styling based on pathname (NAV-02).
 *
 * Does NOT test:
 * - Real Next.js routing (mocked usePathname)
 * - Click behavior (next/link is trusted)
 * - Visual filled-icon quality (manual visual check)
 *
 * @see docs/TESTING_STRATEGY.md
 */
```

**Imports pattern** (verbatim from `budget-progress.test.tsx` lines 15-18 + a `vi.mock` for `next/navigation`):
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabBar } from "@/components/layout/TabBar";
```

**`usePathname` mock pattern** (RESEARCH §Validation Architecture — mock pattern documented at line 931):
```tsx
// Mock usePathname per test by re-mocking the module before each render
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/"),
}));

// In each test: re-import & override
import { usePathname } from "next/navigation";
// (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/budgets");
```

**Test block pattern** (mirrors `budget-progress.test.tsx` lines 76-112 — `describe` + multiple `it` blocks; one assertion per render):
```tsx
describe("TabBar", () => {
  it("renders all 4 tabs with correct labels (NAV-01)", () => {
    render(<TabBar />);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Budgets")).toBeTruthy();
    expect(screen.getByText("Transactions")).toBeTruthy();
    expect(screen.getByText("Settings")).toBeTruthy();
  });

  it("marks the matching tab as active via aria-current (NAV-02)", () => {
    (usePathname as ReturnType<typeof vi.fn>).mockReturnValue("/budgets");
    render(<TabBar />);
    const active = screen.getByRole("link", { name: "Budgets" });
    expect(active.getAttribute("aria-current")).toBe("page");
  });

  it("each tab link has correct href (NAV-03)", () => {
    render(<TabBar />);
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
    expect(screen.getByRole("link", { name: "Budgets" }).getAttribute("href")).toBe("/budgets");
    expect(screen.getByRole("link", { name: "Transactions" }).getAttribute("href")).toBe("/transactions");
    expect(screen.getByRole("link", { name: "Settings" }).getAttribute("href")).toBe("/settings");
  });
});
```

---

### `tests/components/PageShell.test.tsx` — CREATE

**Analog:** `tests/components/budget-progress.test.tsx` (lines 1-113) — same structure, simpler assertions (no mock data needed).

**Test pattern:**
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageShell } from "@/components/layout/PageShell";

describe("PageShell", () => {
  it("renders children inside a main landmark", () => {
    render(<PageShell><p>hello</p></PageShell>);
    expect(screen.getByRole("main")).toBeTruthy();
    expect(screen.getByText("hello")).toBeTruthy();
  });

  it("applies max-width and centering classes (NAV-05)", () => {
    const { container } = render(<PageShell>x</PageShell>);
    const main = container.querySelector("main")!;
    expect(main.className).toContain("max-w-[768px]");
    expect(main.className).toContain("mx-auto");
  });

  it("merges optional className prop", () => {
    const { container } = render(<PageShell className="custom">x</PageShell>);
    const main = container.querySelector("main")!;
    expect(main.className).toContain("custom");
  });
});
```

---

### `tests/components/PageHeader.test.tsx` — CREATE

**Analog:** `tests/components/budget-progress.test.tsx` (lines 1-113).

**Test pattern (covers conditional subtitle render — TDD-eligible per RESEARCH line 968):**
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/layout/PageHeader";

describe("PageHeader", () => {
  it("renders the title as h1", () => {
    render(<PageHeader title="Budgets" />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.textContent).toBe("Budgets");
  });

  it("renders subtitle when provided", () => {
    render(<PageHeader title="Budgets" subtitle="Track your monthly spending limits" />);
    expect(screen.getByText("Track your monthly spending limits")).toBeTruthy();
  });

  it("does not render subtitle when omitted", () => {
    const { container } = render(<PageHeader title="Budgets" />);
    expect(container.querySelector("p")).toBeNull();
  });

  it("renders inside a header landmark (A11Y)", () => {
    const { container } = render(<PageHeader title="Budgets" />);
    expect(container.querySelector("header")).toBeTruthy();
  });
});
```

---

## Shared Patterns

### Section-level header comments (mandatory)

**Source:** `.claude/rules/01-safety-and-workflow.md` §5 + CLAUDE.md "Team Context"

**Apply to:** EVERY new or modified file in Phase 7.

**Two patterns observed in codebase:**

1. **BB style (preferred for new BB files)** — JSDoc block explaining purpose, ADHD/BB design considerations, extension points. Example from `src/components/dashboard/BudgetProgressSection.tsx` lines 1-14:
   ```tsx
   /**
    * Budget Progress Section Component
    *
    * Displays budget progress for all tracked categories on the dashboard.
    * Uses traffic light colors (green/yellow/red) for ADHD-friendly feedback.
    *
    * ADHD DESIGN:
    * - Clear visual status at a glance (color-coded)
    * - ...
    *
    * @see docs/BUDGET_STRATEGY.md for design rationale
    */
   ```

2. **Legacy style (KEEP existing files unchanged)** — Apache 2.0 license block (e.g. `src/app/layout.tsx` lines 1-16). When editing the root layout, **keep this license block**; layer the BB JSDoc beneath it.

### Imports ordering / path alias convention

**Source:** consistent across all BB files (`src/app/page.tsx` lines 43-60, `src/components/dashboard/*.tsx`)

**Pattern:**
1. React / Next.js imports first (`import Link from "next/link"`, `import { redirect } from "next/navigation"`)
2. Third-party imports next (`import { House } from "lucide-react"`)
3. `@/` aliased imports last (`import { cn } from "@/lib/utils"`, `import { Button } from "@/components/ui/button"`)

**Path alias:** Always `@/` for `src/` (per `vitest.config.ts` lines 24-26 and tsconfig — already wired).

### `cn(...)` for conditional class composition

**Source:** `src/lib/utils.ts` (lines 1-7) — single-line `tailwind-merge` + `clsx` wrapper, used throughout.

**Apply to:** PageShell, PageHeader, TabBar (every component that accepts a `className` prop or has conditional styling).

```tsx
import { cn } from "@/lib/utils";

className={cn(
  "base classes",
  conditional ? "active-classes" : "inactive-classes",
  optionalProp
)}
```

**Reference uses:** `src/components/legacy/helpers/PageLayout.tsx` lines 30-38, `src/components/ui/card.tsx` lines 6-15.

### Metadata generation

**Source:** `src/lib/head.ts` (lines 1-72) — `generateMetadata({ title })` helper used by every BB page.

**Apply to:** `(bb)/budgets/page.tsx`, `(bb)/transactions/page.tsx`. Both stub pages must export `metadata` per the standard pattern from `src/app/settings/page.tsx` line 22-24:
```tsx
import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({ title: "Budgets" });
```

### `"use client"` directive at file top

**Source:** `src/components/dashboard/SyncTransactionsButton.tsx` line 1, `src/components/legacy/helpers/PageLayout.tsx` line 17.

**Apply to:** ONLY `TabBar.tsx`. Never apply to `(bb)/layout.tsx` or `(legacy)/layout.tsx` (RESEARCH Pitfall 4 + Pitfall 6).

**Pattern:**
```tsx
"use client";

import ...
```
(Directive must be the very first statement, before any imports or comments other than a leading `/* license */` block. In our case, the JSDoc header goes BELOW `"use client"`.)

### Vitest test file structure

**Source:** `tests/components/budget-progress.test.tsx` (entire file, 113 lines) and `tests/components/spending-chart.test.tsx` (entire file, 62 lines).

**Apply to:** all 3 new test files (`TabBar.test.tsx`, `PageShell.test.tsx`, `PageHeader.test.tsx`).

**Skeleton:**
```tsx
/**
 * <Component> Render Tests
 * <one-line purpose>
 *
 * Does NOT test:
 * - <intentional omissions>
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Component } from "@/components/...";

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (if needed)
// ─────────────────────────────────────────────────────────────────────────────

const mockData = [ ... ];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("Component", () => {
  it("...", () => { ... });
});
```

**Setup file (`tests/setup.ts`, already exists, lines 1-28):** provides `ResizeObserver` stub + `jest-dom` matchers + DOM cleanup. **No changes needed** in Phase 7.

### `git mv` for all file relocations

**Source:** CLAUDE.md rule 10 + CONTEXT.md D-03 + D-07.

**Apply to:** 7 page moves total:
- `src/app/page.tsx` → `src/app/(bb)/page.tsx`
- `src/app/settings/` → `src/app/(bb)/settings/`
- `src/app/legacy/` → `src/app/(legacy)/legacy/`
- `src/app/analytics/` → `src/app/(legacy)/analytics/`
- `src/app/achievements/` → `src/app/(legacy)/achievements/`
- `src/app/dashboard/` → `src/app/(legacy)/dashboard/`
- `src/app/legacy-index/` → `src/app/(legacy)/legacy-index/`

**Never** use delete-and-recreate. Always `git mv` to preserve blame.

### BB token-only styling (no Tailwind defaults)

**Source:** UI-SPEC §Anti-Patterns #1-#3 + CLAUDE.md UI Library Boundaries.

**Apply to:** all 3 new layout components.

- ✅ `bg-bb-surface`, `text-bb-info`, `border-bb-border`, `px-bb-4`, `pt-bb-6`
- ❌ `bg-zinc-100`, `text-blue-600`, `text-red-500`, hex/rgb/oklch in JSX

**Existing BB pages (`page.tsx`, `settings/page.tsx`, dashboard components) still use generic Tailwind utilities** (`text-muted-foreground`, `bg-card`) — those are Phase 9 cleanup targets. New Phase 7 files must use `--bb-*` tokens.

---

## No Analog Found

| File | Role | Data Flow | Reason | Substitute |
|------|------|-----------|--------|------------|
| `src/components/layout/TabBar.tsx` | client component — bottom navigation | event-driven (pathname → active state) | No bottom-nav, no persistent app navigation primitive exists in this codebase. The closest "interactive client component" is `SyncTransactionsButton.tsx` (client + lucide-style icon) but its data flow is request/response, not URL/event. | Use RESEARCH §Code Example 6 verbatim. Borrow the `"use client"` header pattern from `SyncTransactionsButton.tsx` and the typed config array pattern from `legacy-index/page.tsx` `LEGACY_ROUTES`. |
| `src/app/(bb)/layout.tsx` | route-group layout (server) | request-response (shell) | First-of-kind in this repo. The `(auth)/login/page.tsx` proves route groups work but `(auth)/` has no `layout.tsx`. | Use RESEARCH §Code Example 2 verbatim. Pattern is a 1:1 simplification of the current root layout's chrome subtree. |

Planner should reference **RESEARCH.md §Code Examples 2 and 6** for these two files, and mirror commenting / import / `cn()` conventions from the analogs listed in §Pattern Assignments.

---

## Metadata

**Analog search scope:**
- `src/app/` (all current pages, all 3 route groups)
- `src/components/` (legacy, dashboard, ui, common, auth)
- `tests/components/` (both existing test files)
- `src/lib/` (utils.ts, head.ts)
- `src/contexts/` (AppContext, BudgetContext — read indirectly via legacy layout)

**Files scanned (full reads):**
- `src/app/layout.tsx` (99 lines)
- `src/app/page.tsx` (348 lines)
- `src/app/(auth)/login/page.tsx` (62 lines)
- `src/app/settings/page.tsx` (167 lines)
- `src/app/legacy/page.tsx` (39 lines)
- `src/app/dashboard/page.tsx` (23 lines)
- `src/app/legacy-index/page.tsx` (122 lines)
- `src/components/legacy/helpers/PageLayout.tsx` (43 lines)
- `src/components/dashboard/SyncTransactionsButton.tsx` (219 lines)
- `src/components/dashboard/BudgetProgressSection.tsx` (153 lines)
- `src/components/dashboard/index.ts` (76 lines)
- `src/components/ui/card.tsx` (69 lines)
- `src/lib/utils.ts` (7 lines)
- `src/lib/head.ts` (73 lines)
- `tests/components/budget-progress.test.tsx` (113 lines)
- `tests/components/spending-chart.test.tsx` (62 lines)
- `tests/setup.ts` (28 lines)
- `vitest.config.ts` (29 lines)

**Files NOT read (intentionally skipped — content does not affect Phase 7 patterns):**
- `src/components/legacy/security/PasscodeWrapper.tsx` (its API surface — default-exported wrapper accepting children — is already understood from the current root layout usage)
- `src/contexts/AppContext.tsx`, `src/contexts/BudgetContext.tsx` (provider components; only their import paths matter for the `(legacy)/layout.tsx` relocation)
- `src/components/legacy/common/{ThemeToggle,Settings,Achievements}.tsx`, `src/components/common/Logo.tsx`, `src/components/legacy/helpers/GoToTop.tsx`, `src/components/legacy/effects/Sonner.tsx` (relocated verbatim; their internals are not modified in Phase 7)
- `src/middleware.ts` (D-13 locks: no edits in Phase 7)
- `src/app/globals.css` (Phase 6 deliverable; tokens already wired)
- `src/app/(auth)/login/page.tsx` was read once to verify the standalone-page pattern; `src/app/link-bank/page.tsx` was confirmed to exist (sibling to route groups) but its content is not modified in Phase 7

**Pattern extraction date:** 2026-05-19
