/**
 * Auth Module
 *
 * Handles authentication via Supabase Auth for BetterBudget.
 * Provides both server-side and client-side auth utilities.
 *
 * Usage:
 * - Server Components: Use getUser() or requireUser()
 * - Client Components: Use the client from lib/db/supabase.ts
 * - API Routes: Use getUser() or requireUser()
 *
 * @see docs/SUPABASE_STRATEGY.md for architectural decisions
 */

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Authenticated user data from Supabase.
 * This is a simplified version of Supabase's User type.
 */
export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Auth state for the application.
 */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Result of a sign-in or sign-up operation.
 */
export interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
}

// ─────────────────────────────────────────────────────────────────────────────
// Server-Side Auth Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the currently authenticated user (server-side).
 *
 * This function:
 * 1. Creates a Supabase client with cookies
 * 2. Retrieves the user from the session
 * 3. Returns null if not authenticated
 *
 * USE THIS FOR:
 * - Checking if user is logged in
 * - Getting user data in Server Components
 * - Conditional rendering based on auth state
 *
 * @returns AuthUser if authenticated, null otherwise
 *
 * @example
 * // In a Server Component
 * const user = await getUser();
 * if (!user) {
 *   return <LoginPrompt />;
 * }
 * return <Dashboard user={user} />;
 */
export async function getUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Transform Supabase user to our simplified AuthUser type
    return {
      id: user.id,
      email: user.email ?? "",
      createdAt: user.created_at,
    };
  } catch {
    // If Supabase client creation fails (e.g., missing env vars), return null
    return null;
  }
}

/**
 * Require an authenticated user (server-side).
 *
 * If not authenticated, redirects to the login page with a redirect parameter.
 * Use this at the top of Server Components that require authentication.
 *
 * @param redirectTo - Path to redirect to after login (defaults to current page)
 * @returns AuthUser (never null - redirects if not authenticated)
 *
 * @example
 * // In a protected Server Component
 * export default async function DashboardPage() {
 *   const user = await requireUser();
 *   // user is guaranteed to exist here
 *   return <Dashboard userId={user.id} />;
 * }
 */
export async function requireUser(redirectTo?: string): Promise<AuthUser> {
  const user = await getUser();

  if (!user) {
    // Build redirect URL with return path
    const loginUrl = redirectTo
      ? `/login?redirect=${encodeURIComponent(redirectTo)}`
      : "/login";
    redirect(loginUrl);
  }

  return user;
}

/**
 * Get the current auth state (server-side).
 *
 * Returns a complete auth state object suitable for hydrating client components.
 *
 * @returns AuthState object
 */
export async function getAuthState(): Promise<AuthState> {
  const user = await getUser();

  return {
    user,
    isLoading: false,
    isAuthenticated: user !== null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Actions (Server Actions for form submissions)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Sign in with email and password.
 *
 * This is designed to be called from a Server Action or API route.
 * For client-side usage, use the browser Supabase client directly.
 *
 * @param email - User's email address
 * @param password - User's password
 * @returns AuthResult with success status and optional error message
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Login failed. Please try again.",
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        createdAt: data.user.created_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

/**
 * Sign up with email and password.
 *
 * Creates a new user account. Note: Email verification may be required
 * depending on Supabase project settings.
 *
 * @param email - User's email address
 * @param password - User's password (min 6 characters)
 * @returns AuthResult with success status and optional error message
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: "Sign up failed. Please try again.",
      };
    }

    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email ?? "",
        createdAt: data.user.created_at,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "An unexpected error occurred",
    };
  }
}

/**
 * Sign out the current user.
 *
 * Clears the session and redirects to the login page.
 * Call this from a Server Action.
 */
export async function signOut(): Promise<void> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore errors during sign out
  }
  redirect("/login");
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Check if a user is authenticated (server-side).
 *
 * Lightweight check without fetching full user data.
 *
 * @returns true if authenticated, false otherwise
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}
