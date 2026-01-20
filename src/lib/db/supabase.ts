/**
 * Supabase Client Configuration
 *
 * This file provides the core Supabase client setup for BetterBudget.
 * It exports utilities for creating properly configured Supabase clients.
 *
 * IMPORTANT: This file only handles client creation.
 * For auth-specific helpers, see lib/auth/
 * For database queries, see lib/db/queries/
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * @see docs/SUPABASE_STRATEGY.md for architectural decisions
 */

import { createBrowserClient } from "@supabase/ssr";

// ─────────────────────────────────────────────────────────────────────────────
// Environment Variable Validation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates that required Supabase environment variables are set.
 * Throws a clear, developer-friendly error if any are missing.
 *
 * Call this at app startup to fail fast rather than silently.
 */
export function validateSupabaseEnv(): void {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const missing: string[] = [];

  if (!url) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!anonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  if (missing.length > 0) {
    throw new Error(
      `Missing required Supabase environment variables: ${missing.join(", ")}\n\n` +
        "To fix this:\n" +
        "1. Create a Supabase project at https://supabase.com\n" +
        "2. Copy your project URL and anon key from Project Settings > API\n" +
        "3. Add them to your .env.local file:\n\n" +
        "   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n" +
        "   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key\n"
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser Client
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a Supabase client for use in browser/client components.
 *
 * USE THIS FOR:
 * - Client-side auth operations (login, logout, signup)
 * - Real-time subscriptions (if needed later)
 * - Auth state listeners in React components
 *
 * DO NOT USE THIS FOR:
 * - Server-side data fetching (use createServerSupabaseClient instead)
 * - API routes (use createServerSupabaseClient instead)
 *
 * @example
 * // In a client component
 * const supabase = createBrowserSupabaseClient();
 * const { data, error } = await supabase.auth.signInWithPassword({
 *   email: 'user@example.com',
 *   password: 'password123'
 * });
 */
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase environment variables not configured. " +
        "See lib/db/supabase.ts for setup instructions."
    );
  }

  return createBrowserClient(url, anonKey);
}

// ─────────────────────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Re-export Supabase types for convenience.
 * This allows other files to import types without depending on @supabase/supabase-js directly.
 */
export type { User, Session } from "@supabase/supabase-js";
