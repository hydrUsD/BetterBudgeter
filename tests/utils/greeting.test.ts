/**
 * greeting Helper Unit Tests
 *
 * Tests pure helpers nameFromEmail and greetingForTime (PAGE-01 greeting; CONTEXT D-GR-01..04).
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
  it.todo("Wave 1 will populate the 7 nameFromEmail cases from 08-RESEARCH.md");
});

// ─────────────────────────────────────────────────────────────────────────────
// greetingForTime
// ─────────────────────────────────────────────────────────────────────────────

describe("greetingForTime", () => {
  it.todo(
    "Wave 1 will populate the 7 greetingForTime boundary cases (5:00, 11:59, 12:00, 17:59, 18:00, 23:59, 04:59 Europe/Berlin)"
  );
});
