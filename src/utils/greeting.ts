/**
 * Greeting Helpers
 *
 * WHAT: Pure helpers that power the "time-aware greeting" on the Home hub (Phase 8).
 *   - nameFromEmail: extracts a display name from a Supabase auth email
 *   - greetingForTime: maps a Date to one of three English time bands
 *
 * WHY pure (parameter-only, no side effects):
 *   These functions are computed server-side per request (D-GR-04) so the server
 *   passes in `new Date()` as the `now` argument. Because the Date is a parameter,
 *   unit tests do NOT need fake timers — they simply pass a fixed UTC Date and assert
 *   the output. This also means the module is safe to import from both server and
 *   client contexts (though Phase 8 only uses it server-side).
 *
 * SCOPE (locked decisions D-GR-02, D-GR-03):
 *   - English-only — full i18n is a separate future milestone; partial German would
 *     be jarring alongside the fully-English rest of the app.
 *   - Timezone hardcoded to Europe/Berlin — school project, DE-resident users, and
 *     Vercel servers run UTC which would otherwise mis-band the greeting.
 *   - The call site in (bb)/page.tsx constructs `new Date()` and passes it here.
 *     That page is responsible for ensuring it runs server-side (no caching).
 *
 * No side effects. No DOM access. No external state.
 * No external dependencies — only the universal `Intl` built-in.
 */

// ─────────────────────────────────────────────────────────────────────────────
// nameFromEmail
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract a display name from an email address.
 *
 * Algorithm (D-GR-01):
 *   1. Reject non-string, null, undefined, or empty → return null
 *   2. Take the local part (before '@'); if empty → return null
 *   3. Split on any of [._-], take the first chunk; if empty → return null
 *   4. Reject if first character is NOT a letter (a–z, A–Z) → return null
 *      (guards against numeric-prefix emails like 123abc@example.com)
 *   5. Return: first character uppercased + remaining characters lowercased
 *
 * @example
 *   nameFromEmail('paul.heuwer@example.com') → 'Paul'
 *   nameFromEmail('PAUL@example.com')        → 'Paul'  (normalises to title case)
 *   nameFromEmail('a@example.com')           → 'A'
 *   nameFromEmail('123abc@example.com')      → null    (numeric prefix rejected)
 *   nameFromEmail(null)                      → null
 *
 * @returns Capitalised first name, or null if the email is unparseable.
 *   Callers should fall back to the no-name greeting ("Good morning.") when null.
 *
 * TODO (future): swap for AuthUser.display_name when bb_user_settings supports it.
 *   Same call site, replace this import.
 */
export function nameFromEmail(email: string | null | undefined): string | null {
  // Step 1: Reject anything that isn't a non-empty string.
  // Handles null, undefined, and empty string in one guard.
  if (!email || typeof email !== "string") return null;

  // Step 2: Take the portion before the '@'.
  // email.split('@')[0] is always defined (splits always return at least one element),
  // but it may be an empty string if the email starts with '@'.
  const localPart = email.split("@")[0];
  if (!localPart) return null;

  // Step 3: Split on dots, underscores, or dashes; take the first chunk.
  // Using a character class [._-] avoids backtracking unlike alternation patterns.
  const firstChunk = localPart.split(/[._-]/)[0];
  if (!firstChunk) return null;

  // Step 4: Reject if the first character is not a letter.
  // Numeric-prefix emails (123abc@...) are unparseable as a human name.
  if (!/^[a-zA-Z]/.test(firstChunk)) return null;

  // Step 5: Capitalise first character, lowercase the rest.
  // Examples: "paul" → "Paul", "PAUL" → "Paul", "p" → "P".
  return firstChunk.charAt(0).toUpperCase() + firstChunk.slice(1).toLowerCase();
}

// ─────────────────────────────────────────────────────────────────────────────
// greetingForTime
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determine the time-of-day band for the Home hub greeting (D-GR-02, D-GR-03).
 *
 * Bands (Europe/Berlin local time):
 *   - 'morning':   05:00 ≤ hour < 12:00
 *   - 'afternoon': 12:00 ≤ hour < 18:00
 *   - 'evening':   18:00–23:59 and 00:00–04:59 (wraps midnight)
 *
 * Timezone: hardcoded Europe/Berlin (D-GR-03).
 *   Vercel servers run UTC; without timezone conversion the greeting would mis-band
 *   (e.g. show "Good morning" at 22:00 local time when UTC happens to be 06:00).
 *
 * @param now - A Date object representing the current moment.
 *   The call site (bb)/page.tsx passes `new Date()` constructed server-side per request.
 *   Accepting it as a parameter makes this function pure and trivially unit-testable.
 *
 * TODO (future i18n milestone): accept a user-preferred timezone parameter and read
 *   locale from bb_user_settings. Same function signature otherwise.
 */
export function greetingForTime(now: Date): "morning" | "afternoon" | "evening" {
  // Extract the Berlin local hour using Intl.DateTimeFormat with formatToParts().
  //
  // WHY formatToParts() and NOT toLocaleString():
  // toLocaleString('en-US', { hour: 'numeric', hour12: false }) has an ICU/Node.js
  // version-dependent output format — some runtimes return "17", others return "17:00".
  // parseInt("17:00", 10) still returns 17, but the colon variant is fragile.
  // formatToParts() always returns the 'hour' part as a plain numeric string ("17"),
  // regardless of Node.js version or ICU data. See 08-RESEARCH.md §Pitfall 3.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Berlin",
    hour: "numeric",
    hour12: false,
  }).formatToParts(now);

  // The 'hour' part value is a numeric string (e.g. "5", "17", "0").
  // Fallback to "12" (afternoon) if the part is somehow absent — should never happen
  // with a valid Date, but keeps the function total and avoids NaN comparisons.
  const hourStr = parts.find((p) => p.type === "hour")?.value ?? "12";
  const hour = parseInt(hourStr, 10);

  // Band boundaries (D-GR-02):
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 18) return "afternoon";
  return "evening"; // 18–23 and 0–4 both map to evening (wraps midnight)
}
