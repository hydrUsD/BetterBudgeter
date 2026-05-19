/*
 *   Copyright (c) 2025 Laith Alkhaddam aka Iconical or Sleepyico.
 *   All rights reserved.

 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at

 *   http://www.apache.org/licenses/LICENSE-2.0

 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

/**
 * Root Layout — Truly Global Only (D-05)
 *
 * After Phase 7: this layout contains ONLY chrome shared by every route
 * regardless of group — html/body shell, theme, global toaster, fonts, and viewport.
 *
 * Group-specific chrome lives in dedicated group layouts:
 *   - (bb)/layout.tsx    → TabBar + PageShell for the new BetterBudget routes (D-06)
 *   - (legacy)/layout.tsx → PasscodeWrapper + AppProvider + ... for OopsBudgeter routes (D-04)
 *
 * Standalone pages (/login, /link-bank) are outside both groups — they inherit
 * ONLY this slim root layout: no tab bar, no legacy chrome (D-02).
 *
 * What was removed (moved into (legacy)/layout.tsx per D-04):
 *   PasscodeWrapper, AppProvider, BudgetProvider, PageLayout, Logo,
 *   Settings, Achievements, ThemeToggle, GoToTop
 */

import type { Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/legacy/providers/ThemeProvider";
import Toaster from "@/components/legacy/effects/Sonner";
import { generateMetadata } from "@/lib/head";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = generateMetadata;

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
  userScalable: false,
  themeColor: "#166d3b",
  viewportFit: "cover", // Required for iOS safe-area-inset-bottom to work (see RESEARCH §Pitfall 1, supports D-05 slim root)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (process.env.NODE_ENV !== "production") {
    import("@/lib/recurring");
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning={true}
      className="scroll-smooth scroll-p-4 overflow-hidden overflow-y-scroll"
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-w-full`}
        suppressHydrationWarning={true}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
