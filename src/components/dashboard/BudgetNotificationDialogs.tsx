"use client";

/**
 * Budget Notification Dialogs Component
 *
 * Displays ADHD-friendly Alert Dialogs for budget warnings and over-budget states.
 * Uses shadcn/ui Alert Dialog for accessible, non-intrusive notifications.
 *
 * KEY DESIGN DECISIONS (from BUDGET_STRATEGY.md):
 * - Uses Alert Dialogs instead of toasts (less error-like, more calm)
 * - One dialog at a time to reduce cognitive load
 * - Session-level acknowledgment (no repeated popups after "OK")
 * - No auto-dismiss (user controls when to close)
 * - Non-judgmental, reassuring copy
 *
 * TRIGGER POINTS:
 * - On dashboard load (if budgets already over threshold)
 * - After manual import (via router refresh)
 *
 * ADHD CONSIDERATIONS:
 * - Clear, simple messaging
 * - No flashing or alarming colors
 * - Single action button ("Verstanden" / "OK")
 * - Dialog stays until user acknowledges
 *
 * EXTENSION POINT:
 * - Post-MVP could add notification preferences to control these dialogs
 * - Could persist acknowledgment to localStorage for cross-session memory
 *
 * @see docs/BUDGET_STRATEGY.md for notification design
 */

import { useState, useEffect, useCallback } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { BudgetProgress, BudgetStatus } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetNotificationDialogsProps {
  /**
   * Budget progress data from the dashboard.
   * The component will filter for warning/over_budget statuses.
   */
  budgetProgress: BudgetProgress[];
}

/**
 * Internal type for tracking alerts that need to be shown.
 */
interface BudgetAlertData {
  /** Unique key for tracking acknowledgment (category + status) */
  key: string;
  /** The expense category */
  category: string;
  /** Budget status (warning or over_budget) */
  status: BudgetStatus;
  /** Amount spent this month */
  spentAmount: number;
  /** Monthly budget limit */
  monthlyLimit: number;
  /** Usage percentage */
  usagePercentage: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique key for an alert (used for acknowledgment tracking).
 *
 * Format: "category:status:month"
 * Including month ensures alerts reset each month.
 */
function getAlertKey(category: string, status: BudgetStatus): string {
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `${category}:${status}:${monthKey}`;
}

/**
 * Format currency for display.
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

/**
 * Get dialog content based on budget status.
 *
 * ADHD-FRIENDLY COPY:
 * - Short sentences
 * - Reassuring tone (not alarming)
 * - Concrete numbers
 * - Clear call to action
 */
function getDialogContent(alert: BudgetAlertData): {
  title: string;
  description: string;
  variant: "warning" | "limit";
} {
  const spent = formatCurrency(alert.spentAmount);
  const limit = formatCurrency(alert.monthlyLimit);
  const percentage = Math.round(alert.usagePercentage);

  if (alert.status === "over_budget") {
    // Over budget - clear but non-judgmental
    return {
      variant: "limit",
      title: `${alert.category}: Budget erreicht`,
      description:
        `Du hast ${spent} von deinem ${limit}-Budget ausgegeben (${percentage}%). ` +
        `Das Budget ist erreicht. Keine Sorge, das passiert! ` +
        `Du kannst deine Ausgaben in den Einstellungen anpassen.`,
    };
  }

  // Warning - gentle heads-up
  return {
    variant: "warning",
    title: `${alert.category}: Fast am Limit`,
    description:
      `Du hast bereits ${spent} von deinem ${limit}-Budget ausgegeben (${percentage}%). ` +
      `Noch ${formatCurrency(alert.monthlyLimit - alert.spentAmount)} übrig für diesen Monat.`,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BudgetNotificationDialogs({
  budgetProgress,
}: BudgetNotificationDialogsProps) {
  // ─────────────────────────────────────────────────────────────────────────────
  // State
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Set of acknowledged alert keys for this session.
   * Once a user clicks "OK", the alert key is added here.
   * This prevents the same alert from re-appearing until page reload.
   *
   * POST-MVP: Could persist to localStorage for cross-session memory.
   */
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(
    new Set()
  );

  /**
   * Currently displayed alert (or null if none).
   * Only one alert is shown at a time to reduce cognitive load.
   */
  const [currentAlert, setCurrentAlert] = useState<BudgetAlertData | null>(
    null
  );

  /**
   * Controls whether the dialog is open.
   */
  const [isOpen, setIsOpen] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────────
  // Alert Processing
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Extract alerts from budget progress data.
   * Only includes warning and over_budget statuses.
   * Prioritizes over_budget alerts first.
   */
  const getAlertsFromProgress = useCallback((): BudgetAlertData[] => {
    const alerts: BudgetAlertData[] = [];

    for (const progress of budgetProgress) {
      if (progress.status === "warning" || progress.status === "over_budget") {
        alerts.push({
          key: getAlertKey(progress.budget.category, progress.status),
          category: progress.budget.category,
          status: progress.status,
          spentAmount: progress.spentAmount,
          monthlyLimit: progress.budget.monthlyLimit,
          usagePercentage: progress.usagePercentage,
        });
      }
    }

    // Sort: over_budget first (higher priority), then warning
    return alerts.sort((a, b) => {
      if (a.status === "over_budget" && b.status !== "over_budget") return -1;
      if (a.status !== "over_budget" && b.status === "over_budget") return 1;
      return 0;
    });
  }, [budgetProgress]);

  /**
   * Find the next unacknowledged alert to show.
   */
  const getNextUnacknowledgedAlert = useCallback((): BudgetAlertData | null => {
    const alerts = getAlertsFromProgress();

    for (const alert of alerts) {
      if (!acknowledgedAlerts.has(alert.key)) {
        return alert;
      }
    }

    return null;
  }, [getAlertsFromProgress, acknowledgedAlerts]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Effects
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Show next unacknowledged alert when budget data changes.
   *
   * This effect runs when:
   * - Component mounts (dashboard load)
   * - Budget progress changes (after import)
   * - User acknowledges current alert (shows next if any)
   */
  useEffect(() => {
    // Only check if no dialog is currently open
    if (isOpen) return;

    const nextAlert = getNextUnacknowledgedAlert();

    if (nextAlert) {
      setCurrentAlert(nextAlert);
      setIsOpen(true);
    }
  }, [budgetProgress, acknowledgedAlerts, isOpen, getNextUnacknowledgedAlert]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Handle user acknowledging the alert.
   * Adds alert key to acknowledged set and closes dialog.
   */
  const handleAcknowledge = () => {
    if (currentAlert) {
      setAcknowledgedAlerts((prev) => {
        const next = new Set(prev);
        next.add(currentAlert.key);
        return next;
      });
    }

    setIsOpen(false);
    setCurrentAlert(null);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  // No alert to show
  if (!currentAlert) {
    return null;
  }

  const content = getDialogContent(currentAlert);

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent
        className={
          content.variant === "limit"
            ? "border-red-200 dark:border-red-800"
            : "border-amber-200 dark:border-amber-800"
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            className={
              content.variant === "limit"
                ? "text-red-700 dark:text-red-300"
                : "text-amber-700 dark:text-amber-300"
            }
          >
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base leading-relaxed">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={handleAcknowledge}>
            Verstanden
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}