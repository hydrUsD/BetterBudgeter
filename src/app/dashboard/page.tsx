/**
 * Dashboard Redirect Route
 *
 * This route permanently redirects to `/` (the new primary landing page).
 * Uses HTTP 308 (Permanent Redirect) to preserve the HTTP method.
 *
 * Why HTTP 308?
 * - 301/302 can change POST → GET (browser behavior)
 * - 308 guarantees method preservation (future-proof)
 * - Signals to search engines this is a permanent move
 *
 * This route does NOT perform auth checks - that's handled by `/` itself.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/308
 */

import { permanentRedirect } from "next/navigation";

export default function DashboardRedirect() {
  // Redirect to the new home page using HTTP 308 (Permanent Redirect)
  // permanentRedirect() uses 308, preserving the HTTP method
  permanentRedirect("/");
}