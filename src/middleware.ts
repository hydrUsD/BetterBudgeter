/**
 * Next.js Middleware for Auth Protection
 *
 * This middleware runs on every request to protected routes and enforces
 * authentication using Supabase Auth.
 *
 * How it works:
 * 1. Request comes in for a protected route
 * 2. Middleware checks for valid Supabase session in cookies
 * 3. If no session: redirect to /login (pages) or return 401 (API)
 * 4. If session exists: allow request to continue
 * 5. Also refreshes session if needed (keeps user logged in)
 *
 * Protected routes (defined in config.matcher):
 * - /dashboard, /settings, /link-bank (page routes)
 * - /api/import, /api/mock/*, /api/notifications (API routes)
 *
 * Public routes (not matched by middleware):
 * - /login, /auth/* (auth pages)
 * - / and other legacy routes (handled by PasscodeWrapper)
 *
 * @see docs/SUPABASE_STRATEGY.md for auth boundary decisions
 */

import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ─────────────────────────────────────────────────────────────────────────────
// Middleware Function
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase is not configured, allow request but log warning
    // This allows development without Supabase for testing other features
    console.warn(
      "[Middleware] Supabase not configured - auth checks disabled. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable."
    );
    return NextResponse.next();
  }

  // Create a response to modify
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Create Supabase client with cookie handling
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // Update request cookies (for the current request)
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );

        // Update response cookies (for the browser)
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do not run any code between createServerClient and getUser()
  // This ensures the session is properly refreshed
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Determine if this is an API route
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");

  // If no user and this is a protected route, handle accordingly
  if (!user) {
    if (isApiRoute) {
      // For API routes: return 401 JSON response
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required. Please log in.",
        },
        { status: 401 }
      );
    } else {
      // For page routes: redirect to login with return URL
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // User is authenticated, allow request to continue
  return supabaseResponse;
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Matching Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configure which routes the middleware should run on.
 *
 * Protected routes:
 * - /dashboard - Main dashboard (requires auth)
 * - /settings - User settings (requires auth)
 * - /link-bank - Bank linking flow (requires auth)
 * - /api/import - Transaction import endpoint
 * - /api/mock/* - Mock banking API endpoints
 * - /api/notifications - Notification endpoints
 *
 * Excluded from protection (public):
 * - / - Legacy home (uses PasscodeWrapper)
 * - /login - Login page
 * - /auth/* - Auth-related pages
 * - /analytics - Legacy analytics (uses PasscodeWrapper)
 * - /achievements - Legacy achievements (uses PasscodeWrapper)
 * - /legacy - Legacy navigation
 * - /api/auth/* - Legacy auth API
 * - /api/transactions - Legacy transactions API
 * - /api/achievements - Legacy achievements API
 * - Static files (_next/*, favicon, etc.)
 */
export const config = {
  matcher: [
    // Protected page routes
    "/dashboard/:path*",
    "/settings/:path*",
    "/link-bank/:path*",
    // Protected API routes
    "/api/import/:path*",
    "/api/mock/:path*",
    "/api/notifications/:path*",
  ],
};
