/**
 * greeting Helper Unit Tests
 *
 * Tests pure helpers nameFromEmail and greetingForTime (PAGE-01 greeting; CONTEXT D-GR-01..04).
 *
 * HOW TIMEZONE TESTS WORK:
 * greetingForTime accepts a Date object. We pass UTC timestamps that correspond to known
 * Berlin local times. For example, to test 05:00 Berlin CET (UTC+1) in winter:
 *   new Date('2026-01-15T04:00:00Z') → 05:00 Berlin time
 *
 * Does NOT test:
 * - The page-level integration that combines them
 * - React rendering of the greeting line
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { nameFromEmail, greetingForTime } from "@/utils/greeting";

// ─────────────────────────────────────────────────────────────────────────────
// nameFromEmail
// ─────────────────────────────────────────────────────────────────────────────

describe("nameFromEmail", () => {
  // --- Happy path: common email formats ---

  it("extracts and capitalizes first name from dot-separated email", () => {
    // paul.heuwer@example.com → local part "paul.heuwer" → first chunk "paul" → "Paul"
    expect(nameFromEmail("paul.heuwer@example.com")).toBe("Paul");
  });

  it("extracts first name from underscore-separated email", () => {
    // paul_h@example.com → local part "paul_h" → first chunk "paul" → "Paul"
    expect(nameFromEmail("paul_h@example.com")).toBe("Paul");
  });

  it("extracts first name from dash-separated email", () => {
    // paul-heuwer@example.com → local part "paul-heuwer" → first chunk "paul" → "Paul"
    expect(nameFromEmail("paul-heuwer@example.com")).toBe("Paul");
  });

  it("normalizes already-uppercase email prefix to title case", () => {
    // PAUL@example.com → local part "PAUL" → first chunk "PAUL" → "Paul" (first upper + rest lower)
    expect(nameFromEmail("PAUL@example.com")).toBe("Paul");
  });

  it("handles single-character local part", () => {
    // a@example.com → local part "a" → first chunk "a" → "A"
    expect(nameFromEmail("a@example.com")).toBe("A");
  });

  // --- Edge cases: must return null ---

  it("returns null for email with numeric prefix (algorithm step 4: must start with letter)", () => {
    // 123abc@example.com → local part "123abc" → first chunk "123abc" → first char '1' is not a letter → null
    expect(nameFromEmail("123abc@example.com")).toBeNull();
  });

  it("returns null for null input", () => {
    expect(nameFromEmail(null)).toBeNull();
  });

  it("returns null for undefined input", () => {
    expect(nameFromEmail(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(nameFromEmail("")).toBeNull();
  });

  it("returns null for email with empty local part (starts with @)", () => {
    // @example.com → split('@')[0] = "" → localPart is empty → null
    expect(nameFromEmail("@example.com")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// greetingForTime
// ─────────────────────────────────────────────────────────────────────────────

describe("greetingForTime", () => {
  // All test cases use winter dates (January 2026) with CET = UTC+1 unless stated.
  // Summer dates (July 2026) use CEST = UTC+2.

  // --- Evening band: 18:00–04:59 Berlin ---

  it("returns 'evening' at 04:59 Berlin time (just before morning boundary)", () => {
    // Berlin 04:59 CET = UTC 03:59 → 2026-01-15T03:59:00Z
    const now = new Date("2026-01-15T03:59:00Z");
    expect(greetingForTime(now)).toBe("evening");
  });

  // --- Morning band: 05:00–11:59 Berlin ---

  it("returns 'morning' at exactly 05:00 Berlin time (morning boundary start)", () => {
    // Berlin 05:00 CET = UTC 04:00 → 2026-01-15T04:00:00Z
    const now = new Date("2026-01-15T04:00:00Z");
    expect(greetingForTime(now)).toBe("morning");
  });

  it("returns 'morning' at 11:59 Berlin time (just before afternoon boundary)", () => {
    // Berlin 11:59 CET = UTC 10:59 → 2026-01-15T10:59:00Z
    const now = new Date("2026-01-15T10:59:00Z");
    expect(greetingForTime(now)).toBe("morning");
  });

  // --- Afternoon band: 12:00–17:59 Berlin ---

  it("returns 'afternoon' at exactly 12:00 Berlin time (afternoon boundary start)", () => {
    // Berlin 12:00 CET = UTC 11:00 → 2026-01-15T11:00:00Z
    const now = new Date("2026-01-15T11:00:00Z");
    expect(greetingForTime(now)).toBe("afternoon");
  });

  it("returns 'afternoon' at 17:59 Berlin time (just before evening boundary)", () => {
    // Berlin 17:59 CET = UTC 16:59 → 2026-01-15T16:59:00Z
    const now = new Date("2026-01-15T16:59:00Z");
    expect(greetingForTime(now)).toBe("afternoon");
  });

  // --- Evening band: 18:00–04:59 Berlin (upper half) ---

  it("returns 'evening' at exactly 18:00 Berlin time (evening boundary start)", () => {
    // Berlin 18:00 CET = UTC 17:00 → 2026-01-15T17:00:00Z
    const now = new Date("2026-01-15T17:00:00Z");
    expect(greetingForTime(now)).toBe("evening");
  });

  it("returns 'evening' at 00:00 Berlin time (midnight — wraps to evening)", () => {
    // Berlin 00:00 CET = UTC 23:00 (previous day) → 2026-01-14T23:00:00Z
    const now = new Date("2026-01-14T23:00:00Z");
    expect(greetingForTime(now)).toBe("evening");
  });

  // --- DST verification: confirms the function uses the live Europe/Berlin TZ, not hardcoded +1 ---

  it("returns 'evening' at 18:00 Berlin CEST (summer DST offset UTC+2)", () => {
    // Berlin 18:00 CEST = UTC 16:00 → 2026-07-15T16:00:00Z
    // If the function hardcoded UTC+1, it would compute hour=17 → 'afternoon' (wrong).
    // Correct Europe/Berlin DST handling gives hour=18 → 'evening'.
    const now = new Date("2026-07-15T16:00:00Z");
    expect(greetingForTime(now)).toBe("evening");
  });
});
