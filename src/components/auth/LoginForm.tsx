/**
 * Login Form Component
 *
 * A client-side form for email/password authentication using Supabase Auth.
 * Uses shadcn/ui components for consistent styling.
 *
 * Features:
 * - Email/password login
 * - Sign up option (toggle between modes)
 * - Loading states
 * - Error handling with toast notifications
 * - Redirect after successful login
 *
 * @see docs/SUPABASE_STRATEGY.md for auth decisions
 */

"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserSupabaseClient } from "@/lib/db/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type AuthMode = "login" | "signup";

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginForm() {
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);

  // Navigation
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params (set by auth middleware)
  const redirectTo = searchParams.get("redirect") || "/dashboard";

  /**
   * Handle form submission for login or signup.
   *
   * Flow:
   * 1. Validate input
   * 2. Call Supabase auth method
   * 3. Show success/error toast
   * 4. Redirect on success
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();

      if (mode === "login") {
        // Sign in with email/password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Welcome back!");
        router.push(redirectTo);
        router.refresh(); // Refresh to update server-side auth state
      } else {
        // Sign up with email/password
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        // Check if email confirmation is required
        if (data.user && !data.session) {
          toast.success(
            "Account created! Please check your email to confirm your account."
          );
        } else {
          toast.success("Account created successfully!");
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Toggle between login and signup modes.
   */
  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
          autoComplete="email"
        />
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          minLength={6}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {mode === "signup" && (
          <p className="text-xs text-muted-foreground">
            Must be at least 6 characters
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <span className="flex items-center gap-2">
            <LoadingSpinner />
            {mode === "login" ? "Signing in..." : "Creating account..."}
          </span>
        ) : mode === "login" ? (
          "Sign In"
        ) : (
          "Create Account"
        )}
      </Button>

      {/* Toggle Mode */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
        </span>
        <button
          type="button"
          onClick={toggleMode}
          className="text-primary underline-offset-4 hover:underline"
          disabled={isLoading}
        >
          {mode === "login" ? "Sign up" : "Sign in"}
        </button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper Components
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Simple loading spinner for button states.
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
