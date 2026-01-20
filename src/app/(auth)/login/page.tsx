/**
 * BetterBudget Login Page
 *
 * This page handles user authentication via Supabase Auth.
 * It provides email/password login and signup functionality.
 *
 * Auth Flow:
 * 1. User enters credentials in LoginForm (client component)
 * 2. Form calls Supabase Auth directly (browser client)
 * 3. On success, redirects to /dashboard (or redirect param)
 * 4. Session is stored in cookies by Supabase
 *
 * @see docs/SUPABASE_STRATEGY.md for auth decisions
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { generateMetadata } from "@/lib/head";
import { getUser } from "@/lib/auth";
import LoginForm from "@/components/auth/LoginForm";

export const metadata = generateMetadata({
  title: "Login",
});

export default async function LoginPage() {
  // If user is already logged in, redirect to dashboard
  const user = await getUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="max-w-md w-full space-y-6">
        {/* Page Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome to BetterBudget</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access your financial dashboard
          </p>
        </div>

        {/* Login Form */}
        <div className="border rounded-lg p-6 bg-card">
          <LoginForm />
        </div>

        {/* Legacy Link */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Legacy passcode login is still available at{" "}
            <Link href="/" className="underline hover:text-foreground">
              the home page
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
