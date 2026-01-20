/**
 * Sign Out Button Component
 *
 * A client-side button that signs the user out of Supabase Auth.
 * Can be used in navigation bars, settings pages, etc.
 *
 * @see docs/SUPABASE_STRATEGY.md for auth decisions
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createBrowserSupabaseClient } from "@/lib/db/supabase";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface SignOutButtonProps {
  /** Button variant (from shadcn/ui Button) */
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional CSS classes */
  className?: string;
  /** Custom button text */
  children?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function SignOutButton({
  variant = "outline",
  size = "default",
  className,
  children = "Sign Out",
}: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  /**
   * Handle sign out.
   *
   * Flow:
   * 1. Call Supabase signOut
   * 2. Show success toast
   * 3. Redirect to login page
   * 4. Refresh to clear server-side session state
   */
  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Signed out successfully");
      router.push("/login");
      router.refresh(); // Refresh to update server-side auth state
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to sign out"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? "Signing out..." : children}
    </Button>
  );
}
