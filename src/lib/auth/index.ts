/**
 * Auth Module
 *
 * Handles authentication via Supabase Auth.
 * This module will replace the legacy passcode-based auth.
 *
 * Current status: SKELETON — exports placeholder functions.
 *
 * TODO (Task 2+):
 * - Initialize Supabase Auth client
 * - Implement signIn, signOut, signUp functions
 * - Implement session management
 * - Add auth state hooks for React components
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * User session data
 */
export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
}

/**
 * Auth state for the application
 */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Placeholder Functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get current auth state
 *
 * TODO: Implement with Supabase Auth
 */
export async function getAuthState(): Promise<AuthState> {
  // Placeholder — will be replaced with Supabase session check
  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
  };
}

/**
 * Sign in with email and password
 *
 * TODO: Implement with Supabase Auth
 */
export async function signIn(
  _email: string,
  _password: string
): Promise<{ success: boolean; error?: string }> {
  // Placeholder — will be replaced with Supabase signIn
  return {
    success: false,
    error: "Auth not implemented yet",
  };
}

/**
 * Sign out the current user
 *
 * TODO: Implement with Supabase Auth
 */
export async function signOut(): Promise<void> {
  // Placeholder — will be replaced with Supabase signOut
  console.log("signOut called — not implemented yet");
}

/**
 * Check if user is authenticated
 *
 * TODO: Implement with Supabase Auth
 */
export function isAuthenticated(): boolean {
  // Placeholder — will be replaced with Supabase session check
  return false;
}
