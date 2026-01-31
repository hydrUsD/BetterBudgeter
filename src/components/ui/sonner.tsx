/**
 * Sonner Toaster Configuration
 *
 * This file configures the Sonner toast library for the application.
 * It's mounted in src/app/layout.tsx and provides the global toast context.
 *
 * USAGE:
 * Import `toast` from "sonner" anywhere to show notifications:
 *   toast.success("Message")
 *   toast.error("Message")
 *   toast.warning("Message")
 *   toast.info("Message")
 *
 * @see docs/UI_ARCHITECTURE.md#sonner-toast-patterns for full documentation
 */

"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
