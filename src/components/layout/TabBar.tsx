"use client";

/**
 * TabBar — Persistent bottom navigation for BB routes
 *
 * 4 tabs: Home, Budgets, Transactions, Settings (NAV-01).
 * Active tab determined by usePathname() — must be a client component.
 * Active styling: --bb-info color + filled icon (NAV-02).
 * Inactive: --bb-text-secondary + outlined icon (NAV-02).
 * 44×44px minimum touch targets (NAV-02 + A11Y-01).
 * Instant route switching via next/link (NAV-03).
 *
 * Implements D-09 (768px max-width constrained, centered at viewport bottom on all screen sizes).
 * Implements D-10 (4-tab spec, lucide icons, color tokens, touch targets, no transition animation).
 *
 * Lucide icons do not ship "filled" variants. We use fill="currentColor" + strokeWidth={0}
 * for the active state — works well for these 4 outline shapes. If a future icon swap
 * breaks visually (interior cutouts disappear when filled), fall back to two-icon pattern
 * per tab OR pick a simpler lucide icon without complex cutouts.
 * See RESEARCH.md §Pitfall 3 + lucide.dev/guide/lucide/advanced/filled-icons.
 *
 * EXTENSION POINTS:
 * - Scroll-position-per-tab memory: deferred (RESEARCH §Open Questions §1 — complex in App Router)
 * - Press/hover animations: deferred to Phase 11 motion pass
 * - Focus-visible ring override: if global ring is too faint on --bb-surface, add
 *   focus-visible:ring-2 focus-visible:ring-bb-info focus-visible:ring-offset-2
 *   per UI-SPEC §Interaction States (A11Y-01)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Imports
// Priority: Next.js → third-party → @/ aliased (per PATTERNS §Shared Patterns "Imports ordering")
// ─────────────────────────────────────────────────────────────────────────────

import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, ChartPie, List, Settings, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Tab Configuration
// ─────────────────────────────────────────────────────────────────────────────

type Tab = { href: string; label: string; Icon: LucideIcon };

/**
 * TABS is a locked constant — order and hrefs are specified by D-10 and NAV-01.
 * Do not reorder or add tabs without updating CONTEXT.md and REQUIREMENTS.md.
 *
 * Tab order: Home → Budgets → Transactions → Settings (per DESIGN_SYSTEM §8.1)
 * Icon mapping per D-10: House, ChartPie, List, Settings (lucide-react)
 */
const TABS: Tab[] = [
  { href: "/",             label: "Home",         Icon: House },
  { href: "/budgets",      label: "Budgets",      Icon: ChartPie },
  { href: "/transactions", label: "Transactions", Icon: List },
  { href: "/settings",     label: "Settings",     Icon: Settings },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TabBar renders the persistent 4-tab bottom navigation bar for BB pages.
 *
 * Positioning (D-09): fixed at viewport bottom, centered, max 768px wide.
 * On screens wider than 768px the bar is centered with empty --bb-bg on either side.
 *
 * Active detection: usePathname() returns the current pathname. We compare with
 * EXACT equality (pathname === href). NEVER use startsWith — it would match every
 * route for the index "/" (UI-SPEC §Anti-Patterns #14).
 */
export function TabBar() {
  // usePathname() is provided by next/navigation and returns the current URL pathname.
  // Because this is a client component, it re-renders whenever the route changes,
  // which is how the active tab updates after navigation.
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      // D-09 positioning: fixed bottom, centered with left-1/2 -translate-x-1/2,
      //   max-width 768px so it aligns with PageShell's content column.
      // bg-bb-surface: flat surface with no shadow (DESIGN_SYSTEM §2.3 "prefer border over shadow").
      // border-t border-bb-border: subtle 1px separator between content and tab bar (NAV-02).
      // pb-[env(safe-area-inset-bottom)]: clears iOS home indicator (requires viewportFit: "cover"
      //   in root layout Viewport export — see RESEARCH §Pitfall 1).
      // z-50: above page content; below modals (if added in future phases).
      className={cn(
        "fixed bottom-0 left-1/2 -translate-x-1/2",
        "w-full max-w-[768px]",
        "border-t border-bb-border bg-bb-surface",
        "pb-[env(safe-area-inset-bottom)]",
        "z-50"
      )}
    >
      {/* h-[56px]: 56px bar height per UI-SPEC §TabBar. flex + justify-around distributes
          4 tabs evenly. items-stretch ensures each <li> fills the full bar height. */}
      <ul className="flex justify-around items-stretch h-[56px]">
        {TABS.map(({ href, label, Icon }) => {
          // EXACT equality — never startsWith (UI-SPEC §Anti-Patterns #14).
          // "/" would match every route with startsWith, so we must use ===.
          const isActive = pathname === href;

          return (
            <li key={href} className="flex-1">
              {/*
               * Link (next/link): instant client-side navigation with no transition animation (NAV-03).
               * aria-current="page": marks the active tab for screen readers (A11Y-03).
               * aria-label: matches the visible label so the accessible name is unambiguous
               *   even though <Icon> is aria-hidden (A11Y-03).
               * min-w-[44px] min-h-[44px]: 44×44px minimum touch target (NAV-02 + A11Y-01 + D-10).
               * text-bb-info (active) / text-bb-text-secondary (inactive): D-10 color tokens.
               * transition-colors: smooth color shift on hover (inactive tab hover polish deferred to Phase 11).
               */}
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
                {/*
                 * Lucide filled-icon trick (D-10 + RESEARCH §Pitfall 3):
                 *   Active: fill="currentColor" strokeWidth={0} → solid/filled appearance
                 *   Inactive: fill="none" strokeWidth={2} → outlined appearance (lucide default)
                 * aria-hidden: icon is decorative; the aria-label on <Link> provides the name.
                 */}
                <Icon
                  size={22}
                  aria-hidden="true"
                  fill={isActive ? "currentColor" : "none"}
                  strokeWidth={isActive ? 0 : 2}
                />
                {/* text-bb-xs: smallest BB typography token; leading-none prevents extra line height */}
                <span className="text-bb-xs leading-none">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
