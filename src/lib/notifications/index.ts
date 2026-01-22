/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Notifications Module
 *
 * Manages in-app notifications for budget alerts, import results, etc.
 * Uses Sonner for toast display.
 *
 * MVP SCOPE:
 * - Budget threshold alerts (warning at 80%, over at 100%)
 * - Import result notifications
 * - Toast notifications only (no persistent storage in MVP)
 *
 * ADHD DESIGN:
 * - Notifications are triggered only by user actions (import)
 * - No background notifications or push alerts
 * - Clear, actionable messages
 * - Non-judgmental tone
 *
 * @see docs/BUDGET_STRATEGY.md for notification design
 */

import type { NotificationType } from "@/types/finance";
import type { BudgetAlert } from "@/types/finance";
import {
  checkBudgetThresholds,
  formatBudgetAlertMessage,
  formatBudgetAlertTitle,
} from "@/lib/budgets";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Notification data for display via Sonner toast.
 * This is what gets passed to the UI for rendering.
 */
export interface ToastNotification {
  type: NotificationType;
  title: string;
  message: string;
}

/**
 * Options for creating a notification
 */
export interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

/**
 * Import result for notification generation
 */
export interface ImportResultForNotification {
  imported: number;
  updated: number;
  errors: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget Alert Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a BudgetAlert to a ToastNotification.
 *
 * @param alert - Budget alert data
 * @returns Notification ready for Sonner toast
 */
function budgetAlertToNotification(alert: BudgetAlert): ToastNotification {
  return {
    type: alert.status === "over_budget" ? "error" : "warning",
    title: formatBudgetAlertTitle(alert),
    message: formatBudgetAlertMessage(alert),
  };
}

/**
 * Check budget thresholds and generate notifications.
 *
 * This function is called after a successful import to check
 * if any budget thresholds have been crossed.
 *
 * MVP NOTE: No deduplication in MVP. Notifications will be shown
 * every time thresholds are crossed (including re-imports).
 * Post-MVP could track "last notified" state per budget per month.
 *
 * @returns Array of ToastNotification for crossed thresholds
 */
export async function generateBudgetNotifications(): Promise<ToastNotification[]> {
  try {
    const alerts = await checkBudgetThresholds();
    return alerts.map(budgetAlertToNotification);
  } catch (error) {
    console.error("[notifications] Error checking budget thresholds:", error);
    // Non-blocking: return empty if budget check fails
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Import Notification Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate notification for import result.
 *
 * @param result - Import result with counts
 * @returns Notification for Sonner toast
 */
export function generateImportNotification(
  result: ImportResultForNotification
): ToastNotification {
  const { imported, updated, errors } = result;

  // Determine notification type based on results
  let type: NotificationType;
  if (errors > 0 && imported === 0 && updated === 0) {
    type = "error";
  } else if (errors > 0) {
    type = "warning";
  } else {
    type = "success";
  }

  // Build message
  const parts: string[] = [];

  if (imported > 0) {
    parts.push(`${imported} new transaction${imported !== 1 ? "s" : ""}`);
  }
  if (updated > 0) {
    parts.push(`${updated} updated`);
  }
  if (errors > 0) {
    parts.push(`${errors} error${errors !== 1 ? "s" : ""}`);
  }

  const message =
    parts.length > 0
      ? parts.join(", ")
      : "All transactions already up to date";

  return {
    type,
    title: "Import Complete",
    message,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Combined Notification Generation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate all notifications after an import.
 *
 * This is the main function called by the import pipeline.
 * It generates both:
 * 1. Import result notification
 * 2. Budget threshold notifications (if any thresholds crossed)
 *
 * @param importResult - The result of the import operation
 * @returns Array of all notifications to display
 */
export async function generatePostImportNotifications(
  importResult: ImportResultForNotification
): Promise<ToastNotification[]> {
  const notifications: ToastNotification[] = [];

  // Always add import result notification
  notifications.push(generateImportNotification(importResult));

  // Check budget thresholds and add any alerts
  // Only check if import was at least partially successful
  if (importResult.imported > 0 || importResult.updated > 0) {
    const budgetNotifications = await generateBudgetNotifications();
    notifications.push(...budgetNotifications);
  }

  return notifications;
}

// ─────────────────────────────────────────────────────────────────────────────
// Legacy/Placeholder Functions (kept for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a notification (placeholder for future DB persistence).
 *
 * @deprecated MVP uses toast-only notifications
 */
export async function createNotification(
  _options: CreateNotificationOptions
): Promise<null> {
  // MVP: No database storage for notifications
  return null;
}

/**
 * Fetch unread notifications (placeholder).
 *
 * @deprecated MVP uses toast-only notifications
 */
export async function fetchUnreadNotifications(_userId: string): Promise<[]> {
  // MVP: No persistent notifications
  return [];
}

/**
 * Mark notifications as read (placeholder).
 *
 * @deprecated MVP uses toast-only notifications
 */
export async function markAsRead(_notificationIds: string[]): Promise<number> {
  // MVP: No persistent notifications
  return 0;
}

/**
 * Delete old notifications (placeholder).
 *
 * @deprecated MVP uses toast-only notifications
 */
export async function deleteOldNotifications(
  _userId: string,
  _olderThanDays: number = 30
): Promise<number> {
  // MVP: No persistent notifications
  return 0;
}

/**
 * Generate a budget alert notification (legacy interface).
 *
 * @deprecated Use generateBudgetNotifications() instead
 */
export function generateBudgetAlert(
  _category: string,
  _percentage: number
): CreateNotificationOptions | null {
  // This function is kept for backward compatibility
  // New code should use generateBudgetNotifications()
  return null;
}