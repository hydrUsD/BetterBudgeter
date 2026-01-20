/**
 * User Settings Database Queries
 *
 * Query functions for bb_user_settings and bb_notification_prefs tables.
 * All functions use the server Supabase client with RLS.
 *
 * Note: Settings are auto-created for new users via database trigger.
 * @see supabase/migrations/001_initial_schema.sql
 *
 * @see docs/SUPABASE_STRATEGY.md for data access patterns
 */

import { createServerSupabaseClient } from "./supabaseServer";
import type {
  DbUserSettings,
  DbUserSettingsUpdate,
  DbNotificationPrefs,
  DbNotificationPrefsUpdate,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// User Settings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default settings used when no record exists
 */
const DEFAULT_USER_SETTINGS: Omit<
  DbUserSettings,
  "user_id" | "created_at" | "updated_at"
> = {
  display_currency: "EUR",
  theme: "system",
  compact_view: false,
};

/**
 * Get user settings for the current user.
 * Returns defaults if no settings record exists.
 *
 * @returns User settings (RLS filtered)
 */
export async function getUserSettings(): Promise<DbUserSettings | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_user_settings")
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // No row found - this shouldn't happen due to trigger, but handle gracefully
      console.warn(
        "[settings.getUserSettings] No settings found, using defaults"
      );
      return null;
    }
    console.error("[settings.getUserSettings] Error:", error.message);
    throw new Error(`Failed to fetch user settings: ${error.message}`);
  }

  return data;
}

/**
 * Get user settings with defaults fallback.
 * Always returns a valid settings object.
 *
 * @returns User settings or defaults
 */
export async function getUserSettingsOrDefaults(): Promise<
  Omit<DbUserSettings, "user_id" | "created_at" | "updated_at">
> {
  const settings = await getUserSettings();
  if (!settings) {
    return DEFAULT_USER_SETTINGS;
  }
  return {
    display_currency: settings.display_currency,
    theme: settings.theme,
    compact_view: settings.compact_view,
  };
}

/**
 * Update user settings.
 *
 * @param updates - Fields to update
 * @returns The updated settings
 */
export async function updateUserSettings(
  updates: DbUserSettingsUpdate
): Promise<DbUserSettings> {
  const supabase = await createServerSupabaseClient();

  // Get current user to get their ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  // Add updated_at timestamp
  const updatesWithTimestamp = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("bb_user_settings")
    .update(updatesWithTimestamp)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[settings.updateUserSettings] Error:", error.message);
    throw new Error(`Failed to update user settings: ${error.message}`);
  }

  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Notification Preferences
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Default notification preferences
 */
const DEFAULT_NOTIFICATION_PREFS: Omit<
  DbNotificationPrefs,
  "user_id" | "created_at"
> = {
  budget_alerts: true,
  weekly_summary: true,
  import_notifications: true,
};

/**
 * Get notification preferences for the current user.
 *
 * @returns Notification preferences (RLS filtered)
 */
export async function getNotificationPrefs(): Promise<DbNotificationPrefs | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("bb_notification_prefs")
    .select("*")
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      console.warn(
        "[settings.getNotificationPrefs] No prefs found, using defaults"
      );
      return null;
    }
    console.error("[settings.getNotificationPrefs] Error:", error.message);
    throw new Error(`Failed to fetch notification prefs: ${error.message}`);
  }

  return data;
}

/**
 * Get notification preferences with defaults fallback.
 *
 * @returns Notification preferences or defaults
 */
export async function getNotificationPrefsOrDefaults(): Promise<
  Omit<DbNotificationPrefs, "user_id" | "created_at">
> {
  const prefs = await getNotificationPrefs();
  if (!prefs) {
    return DEFAULT_NOTIFICATION_PREFS;
  }
  return {
    budget_alerts: prefs.budget_alerts,
    weekly_summary: prefs.weekly_summary,
    import_notifications: prefs.import_notifications,
  };
}

/**
 * Update notification preferences.
 *
 * @param updates - Fields to update
 * @returns The updated preferences
 */
export async function updateNotificationPrefs(
  updates: DbNotificationPrefsUpdate
): Promise<DbNotificationPrefs> {
  const supabase = await createServerSupabaseClient();

  // Get current user to get their ID
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data, error } = await supabase
    .from("bb_notification_prefs")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    console.error("[settings.updateNotificationPrefs] Error:", error.message);
    throw new Error(`Failed to update notification prefs: ${error.message}`);
  }

  return data;
}
