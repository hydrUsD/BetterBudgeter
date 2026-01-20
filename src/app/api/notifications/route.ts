/**
 * Notifications API
 *
 * Manages in-app notifications for the user.
 * Notifications are stored in the database and displayed via Sonner.
 *
 * Current status: SKELETON — returns placeholder response.
 *
 * TODO (Task 5+):
 * - Fetch unread notifications from database
 * - Mark notifications as read
 * - Create new notifications (budget alerts, etc.)
 * - Delete old notifications
 */

import { NextResponse } from "next/server";

/**
 * GET /api/notifications
 *
 * Returns list of notifications for the current user.
 */
export async function GET() {
  // Placeholder response — will be replaced with database query
  const notifications = [
    {
      id: "notif-placeholder-001",
      type: "info",
      title: "Welcome to BetterBudget",
      message: "This is a placeholder notification.",
      read: false,
      createdAt: new Date().toISOString(),
    },
  ];

  return NextResponse.json({
    success: true,
    data: notifications,
    _meta: {
      skeleton: true,
      message: "Notifications endpoint not fully implemented yet.",
    },
  });
}

/**
 * POST /api/notifications
 *
 * Creates a new notification.
 * Body: { type: string, title: string, message: string }
 */
export async function POST() {
  return NextResponse.json({
    success: true,
    data: {
      id: "notif-new-placeholder",
      created: false,
    },
    _meta: {
      skeleton: true,
      message: "Notification creation not implemented yet.",
    },
  });
}

/**
 * PATCH /api/notifications
 *
 * Marks notifications as read.
 * Body: { ids: string[] }
 */
export async function PATCH() {
  return NextResponse.json({
    success: true,
    data: {
      updated: 0,
    },
    _meta: {
      skeleton: true,
      message: "Mark as read not implemented yet.",
    },
  });
}
