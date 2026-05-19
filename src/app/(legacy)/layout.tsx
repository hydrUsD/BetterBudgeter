/**
 * Legacy Route Group Layout (D-01 + D-04)
 *
 * Applied to all preserved OopsBudgeter pages: /legacy, /analytics, /achievements,
 * /legacy-index, /dashboard (308 redirect, D-14).
 *
 * The full original chrome stack is reproduced verbatim from the pre-Phase-7 root layout
 * per D-04. BB routes do NOT receive this chrome — they live in (bb)/ and use
 * TabBar/PageShell (D-06).
 *
 * Chrome stack nesting order (LOCKED per D-04 — do not reorder):
 *   PasscodeWrapper         → security gate (passcode prompt if enabled)
 *     → AppProvider         → legacy app state (appWidth, etc.)
 *       → BudgetProvider    → legacy budget data
 *         → <main>          → centering container (flex justify-center items-center)
 *           → PageLayout    → legacy card wrapper
 *             → Logo        → top-left logo
 *             → Settings    → top-right settings button
 *             → Achievements → achievements button
 *             → ThemeToggle → dark/light mode toggle
 *             → {children}  → the actual page content
 *         → GoToTop         → scroll-to-top button (sibling to <main>)
 *
 * IMPORTANT: Do NOT add "use client" to this layout. The provider components below already
 * carry their own client boundaries; adding it here would degrade SSR for legacy pages
 * (see RESEARCH §Pitfall 6 — localStorage access during SSR).
 *
 * Note: The <Toaster /> (Sonner) is intentionally NOT here — it stays at the slim root
 * layout (D-05) so it remains globally available to all route groups.
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

export default function LegacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PasscodeWrapper>
      <AppProvider>
        <BudgetProvider>
          {/*
           * The centering classes (flex justify-center items-center) were previously
           * on the root <body> element. They move here per D-04 so legacy pages continue
           * to display identically — centered content inside the PageLayout card.
           */}
          <main className="p-0 md:p-6 flex justify-center items-center">
            <PageLayout>
              <Logo />
              <Settings />
              <Achievements />
              <ThemeToggle />
              {children}
            </PageLayout>
          </main>
          {/* GoToTop is a sibling to <main>, not nested inside it */}
          <GoToTop />
        </BudgetProvider>
      </AppProvider>
    </PasscodeWrapper>
  );
}
