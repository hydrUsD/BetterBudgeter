/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Notifications Module
 *
 * Manages in-app notifications for budget alerts, import results, etc.
 * Uses Sonner for toast display, database for persistence.
 *
 * Current status: SKELETON — exports placeholder functions.
 *
 * TODO (Task 5+):
 * - Store notifications in database
 * - Fetch unread notifications
 * - Mark as read
 * - Generate budget alert notifications
 * - Generate import result notifications
 */

import type { Notification, NotificationType } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Options for creating a notification
 */
export interface CreateNotificationOptions {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Create a new notification
 *
 * TODO: Store in database
 */
export async function createNotification(
  _options: CreateNotificationOptions
): Promise<Notification | null> {
  // Placeholder — will be replaced with database insert
  return null;
}

/**
 * Fetch unread notifications for a user
 *
 * TODO: Query from database
 */
export async function fetchUnreadNotifications(
  _userId: string
): Promise<Notification[]> {
  // Placeholder — will be replaced with database query
  return [];
}

/**
 * Mark notifications as read
 *
 * TODO: Update in database
 */
export async function markAsRead(_notificationIds: string[]): Promise<number> {
  // Placeholder — will be replaced with database update
  return 0;
}

/**
 * Delete old notifications
 *
 * TODO: Implement cleanup logic
 */
export async function deleteOldNotifications(
  _userId: string,
  _olderThanDays: number = 30
): Promise<number> {
  // Placeholder — will be replaced with database delete
  return 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Generators
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a budget alert notification
 *
 * TODO: Implement when budgets are added
 */
export function generateBudgetAlert(
  _category: string,
  _percentage: number
): CreateNotificationOptions | null {
  // Placeholder — will be replaced with real logic
  return null;
}

/**
 * Generate an import result notification
 *
 * TODO: Implement when imports are working
 */
export function generateImportNotification(
  _userId: string,
  _result: { imported: number; errors: number }
): CreateNotificationOptions {
  return {
    userId: _userId,
    type: _result.errors > 0 ? "warning" : "success",
    title: "Import Complete",
    message: `Imported ${_result.imported} transactions${_result.errors > 0 ? `, ${_result.errors} errors` : ""}.`,
  };
}
