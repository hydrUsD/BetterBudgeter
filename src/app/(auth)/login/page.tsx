/**
 * BetterBudget Login Page
 *
 * This page handles user authentication via Supabase Auth.
 * It will replace the legacy passcode-based authentication.
 *
 * Current status: SKELETON — no auth logic implemented yet.
 *
 * TODO (Task 2+):
 * - Integrate Supabase Auth client
 * - Add email/password login form
 * - Add magic link option
 * - Handle auth state and redirects
 * - Add error handling and loading states
 */

import { generateMetadata } from "@/lib/head";

export const metadata = generateMetadata({
  title: "Login",
});

export default function LoginPage() {
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

        {/* Placeholder for Login Form */}
        <div className="border border-dashed border-muted-foreground/50 rounded-lg p-8 text-center">
          <p className="text-muted-foreground">
            Login form will be implemented here
          </p>
          <ul className="text-sm text-left mt-4 space-y-1 text-muted-foreground">
            <li>• Email/password authentication</li>
            <li>• Magic link option</li>
            <li>• Supabase Auth integration</li>
          </ul>
        </div>

        {/* Temporary: Link to legacy app */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Legacy passcode login is still available at{" "}
            <a href="/" className="underline hover:text-foreground">
              the home page
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
