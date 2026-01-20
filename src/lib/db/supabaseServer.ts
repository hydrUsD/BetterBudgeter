/**
 * Server-Side Supabase Client
 *
 * This file provides Supabase clients for server-side usage in Next.js App Router.
 * It handles cookie-based session management for Server Components and API Routes.
 *
 * IMPORTANT: This file is server-only. Never import it in client components.
 *
 * When to use which client:
 * - createServerSupabaseClient(): For Server Components and Route Handlers
 *   - Respects RLS policies based on authenticated user
 *   - Session is read from cookies
 *
 * - createServiceRoleClient(): For admin operations (use sparingly!)
 *   - Bypasses RLS - use only when absolutely necessary
 *   - Requires SUPABASE_SERVICE_ROLE_KEY
 *
 * @see docs/SUPABASE_STRATEGY.md for architectural decisions
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────────────────────
// Server Client (RLS-aware)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a Supabase client for Server Components and Route Handlers.
 *
 * This client:
 * - Reads session from cookies (set by Supabase Auth)
 * - Respects Row Level Security (RLS) policies
 * - Returns data only for the authenticated user
 *
 * USE THIS FOR:
 * - All server-side data fetching
 * - API route handlers
 * - Server Actions
 *
 * @example
 * // In a Server Component
 * const supabase = await createServerSupabaseClient();
 * const { data: transactions } = await supabase
 *   .from('bb_transactions')
 *   .select('*');
 * // RLS ensures only this user's transactions are returned
 *
 * @example
 * // In a Route Handler
 * export async function GET() {
 *   const supabase = await createServerSupabaseClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 *   if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   // ... fetch data
 * }
 */
export async function createServerSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables.\n\n" +
        "Required:\n" +
        "- NEXT_PUBLIC_SUPABASE_URL\n" +
        "- NEXT_PUBLIC_SUPABASE_ANON_KEY\n\n" +
        "Add these to your .env.local file."
    );
  }

  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      // Get all cookies for Supabase to read session
      getAll() {
        return cookieStore.getAll();
      },
      // Set cookies when session changes (login, logout, refresh)
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // This can fail in Server Components (read-only context)
          // Session refresh will be handled by middleware instead
        }
      },
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Service Role Client (Bypasses RLS - Use Sparingly!)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Creates a Supabase client with service role privileges.
 *
 * WARNING: This client BYPASSES Row Level Security!
 * Only use for:
 * - Database migrations
 * - Admin operations
 * - System-level operations that need cross-user access
 *
 * NEVER use for:
 * - Regular user data fetching
 * - API routes serving user requests
 *
 * @throws Error if SUPABASE_SERVICE_ROLE_KEY is not set
 *
 * @example
 * // Admin operation - use with extreme caution
 * const supabase = createServiceRoleClient();
 * const { data } = await supabase
 *   .from('bb_transactions')
 *   .select('count')
 *   .single();
 */
export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable.");
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n\n" +
        "This key is required for admin operations.\n" +
        "Find it in Supabase Dashboard > Project Settings > API > service_role key\n\n" +
        "WARNING: Never expose this key to the client!"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
