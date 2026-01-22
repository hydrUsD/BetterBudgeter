"use client";

/**
 * Sync Transactions Button Component
 *
 * A client component that triggers manual transaction import from linked banks.
 * Shows loading, success, and error states with toast notifications.
 *
 * BEHAVIOR:
 * - Disabled when no banks are linked (shows "Link Bank" CTA instead)
 * - Shows loading spinner during import
 * - Displays success toast with transaction count
 * - Displays error toast with user-friendly message
 *
 * MVP SCOPE:
 * - Single button for all accounts (no per-account import)
 * - No progress bar (import is fast enough)
 * - No auto-refresh after import
 *
 * @see docs/IMPORT_PIPELINE_STRATEGY.md Section 2
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SyncTransactionsButtonProps {
  /** Number of linked accounts (0 = no banks linked) */
  accountCount: number;
  /** Optional: custom class name */
  className?: string;
}

/**
 * Notification from the API (matches ToastNotification type)
 */
interface ApiNotification {
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
}

/**
 * Import API response shape
 */
interface ImportResponse {
  success: boolean;
  totalImported: number;
  totalUpdated: number;
  totalSkipped: number;
  totalErrors: number;
  accountsProcessed: number;
  errorDetails?: string[];
  error?: string;
  /** Notifications from the API (import result + budget alerts) */
  notifications?: ApiNotification[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function SyncTransactionsButton({
  accountCount,
  className,
}: SyncTransactionsButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Precondition Check
  // ─────────────────────────────────────────────────────────────────────────────

  // If no accounts linked, show "Link Bank" button instead
  if (accountCount === 0) {
    return (
      <Button
        onClick={() => router.push("/link-bank")}
        className={className}
      >
        Link a Bank
      </Button>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Import Handler
  // ─────────────────────────────────────────────────────────────────────────────

  const handleSync = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data: ImportResponse = await response.json();

      if (!response.ok) {
        // API returned an error
        throw new Error(data.error || "Import failed");
      }

      // Display notifications from API response (includes budget alerts)
      if (data.notifications && data.notifications.length > 0) {
        // Show each notification with appropriate toast type
        for (const notification of data.notifications) {
          const toastFn =
            notification.type === "error"
              ? toast.error
              : notification.type === "warning"
              ? toast.warning
              : notification.type === "success"
              ? toast.success
              : toast.info;

          toastFn(notification.message, {
            description: notification.title !== notification.message ? notification.title : undefined,
          });
        }
      } else {
        // Fallback: show basic result if no notifications returned
        if (data.totalImported === 0 && data.totalErrors === 0) {
          toast.info("All transactions already up to date");
        } else if (data.totalErrors > 0 && data.totalImported > 0) {
          toast.warning(
            `Imported ${data.totalImported} transactions. ${data.totalErrors} failed.`
          );
        } else if (data.totalErrors > 0) {
          toast.error("Import failed. Please try again.");
        } else {
          toast.success(`Imported ${data.totalImported} transactions`);
        }
      }

      // Refresh the page to show new data
      router.refresh();
    } catch (error) {
      // Network or unexpected error
      const message =
        error instanceof Error ? error.message : "Import failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <>
          <LoadingSpinner className="mr-2 h-4 w-4" />
          Syncing...
        </>
      ) : (
        <>
          <SyncIcon className="mr-2 h-4 w-4" />
          Sync Transactions
        </>
      )}
    </Button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Icons (inline SVG to avoid dependencies)
// ─────────────────────────────────────────────────────────────────────────────

function SyncIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`animate-spin ${className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}