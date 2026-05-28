/**
 * Copy Shame Test — Regression guard for DESIGN.md §Copy & Language rules.
 *
 * Scans all BetterBudgeter component and page source files for banned patterns
 * that violate the compassionate, neutral framing mandated by DESIGN.md.
 *
 * Banned patterns:
 * - "exceeded" in user-facing strings (use "reached" or "used your full")
 * - "failed" as a user-facing label (use "couldn't" / "try again")
 * - "you need to" (judgmental; lead with action instead)
 * - "watch your" (patronizing)
 * - "no .* found" in UI copy (use "will appear here" pattern)
 * - "budget failed" (never blame the user or the system)
 * - "you overspent" (blame-adjacent)
 *
 * SCOPE:
 * - Only scans src/ files (not legacy/ or test files)
 * - Ignores comments, console.error, and internal error messages thrown
 *   inside try/catch (those are developer-facing, not user-facing)
 * - Ignores TypeScript type annotations and enum values
 *
 * @see docs/DESIGN.md §Copy & Language
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "fs";
import { join, relative } from "path";

// ─────────────────────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────────────────────

const PROJECT_ROOT = join(__dirname, "..");

/**
 * Directories to scan recursively for .tsx/.ts files.
 * Excludes legacy/ to avoid false positives on frozen OopsBudgeter code.
 */
const SCAN_DIRS = [
  "src/components/dashboard",
  "src/components/common",
  "src/components/settings",
  "src/components/auth",
  "src/app/(bb)",
];

/** Individual files outside the scan dirs that also need checking. */
const EXTRA_FILES = [
  "src/lib/budgets/index.ts",
];

/**
 * Banned patterns that violate DESIGN.md copy rules.
 * Each entry: [regex, human-readable reason].
 *
 * Patterns are tested against string literals only (extracted from quotes),
 * not raw source — this avoids false positives from comments and variable names.
 */
const BANNED_PATTERNS: [RegExp, string][] = [
  [/\bexceeded\b/i, "Use 'reached' or 'used your full' instead of 'exceeded'"],
  [/\bbudget failed\b/i, "Never frame budget status as failure"],
  [/\byou overspent\b/i, "Blame-adjacent language — use neutral framing"],
  [/\byou need to\b/i, "Judgmental — lead with what the user can do"],
  [/\bwatch your\b/i, "Patronizing — use specific amounts instead"],
];

/**
 * Pattern for "no X found" in user-facing strings.
 * Checked separately because the regex is broader and needs careful exclusion.
 */
const NO_FOUND_PATTERN = /\bno\s+\w+\s+found\b/i;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract string literals from source code (double-quoted, single-quoted, template).
 * Filters out lines that are clearly developer-facing (console.*, throw, comments).
 * Tracks block comment state to skip multi-line block comments and JSX comments.
 */
function extractUserFacingStrings(source: string): { line: number; text: string }[] {
  const results: { line: number; text: string }[] = [];
  const lines = source.split("\n");
  let inBlockComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track block comment boundaries
    if (inBlockComment) {
      if (line.includes("*/")) {
        inBlockComment = false;
      }
      continue;
    }
    if (line.startsWith("/*") || line.startsWith("{/*")) {
      if (!line.includes("*/")) {
        inBlockComment = true;
      }
      continue;
    }

    // Skip single-line comments
    if (line.startsWith("//") || line.startsWith("*")) continue;

    // Skip console.* lines (developer-facing logging)
    if (/console\.\w+\(/.test(line)) continue;

    // Skip lines that are purely throw new Error inside catch blocks
    // (these are developer-facing error propagation, not user-facing toast messages)
    if (/throw new Error\(/.test(line) && /\bmessage\b/.test(line)) continue;

    // Skip TypeScript type/interface declarations
    if (/^(type|interface|export type|export interface)\b/.test(line)) continue;

    // Extract string literals from this line
    const stringMatches = line.matchAll(/(?:"([^"]*?)"|'([^']*?)'|`([^`]*?)`)/g);
    for (const match of stringMatches) {
      const text = match[1] ?? match[2] ?? match[3] ?? "";
      if (text.length > 2) {
        results.push({ line: i + 1, text });
      }
    }
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively collect .tsx/.ts files from a directory using Node.js native API.
 * No external glob dependency needed.
 */
function collectFiles(dir: string): string[] {
  const absDir = join(PROJECT_ROOT, dir);
  try {
    const entries = readdirSync(absDir, { recursive: true, withFileTypes: false }) as string[];
    return entries
      .filter((f) => /\.(tsx?|ts)$/.test(f))
      .map((f) => join(absDir, f));
  } catch {
    return [];
  }
}

describe("Copy Shame Test — DESIGN.md compliance", () => {
  // Collect all files to scan
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    files.push(...collectFiles(dir));
  }
  for (const f of EXTRA_FILES) {
    files.push(join(PROJECT_ROOT, f));
  }

  it("finds files to scan", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("contains no banned shame-test patterns in user-facing strings", () => {
    const violations: string[] = [];

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf-8");
      const strings = extractUserFacingStrings(source);
      const relativePath = filePath.replace(PROJECT_ROOT + "/", "");

      for (const { line, text } of strings) {
        for (const [pattern, reason] of BANNED_PATTERNS) {
          if (pattern.test(text)) {
            violations.push(
              `${relativePath}:${line} — "${text}" → ${reason}`
            );
          }
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} shame-test violation(s):\n\n${violations.join("\n")}`
      );
    }
  });

  it("contains no 'no X found' pattern in user-facing strings", () => {
    const violations: string[] = [];

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf-8");
      const strings = extractUserFacingStrings(source);
      const relativePath = filePath.replace(PROJECT_ROOT + "/", "");

      for (const { line, text } of strings) {
        if (NO_FOUND_PATTERN.test(text)) {
          violations.push(
            `${relativePath}:${line} — "${text}" → Use "will appear here" pattern instead of "no X found"`
          );
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} "no X found" violation(s):\n\n${violations.join("\n")}`
      );
    }
  });

  it("uses 'Import failed' nowhere in user-facing strings", () => {
    const violations: string[] = [];

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf-8");
      const strings = extractUserFacingStrings(source);
      const relativePath = filePath.replace(PROJECT_ROOT + "/", "");

      for (const { line, text } of strings) {
        if (/\bimport failed\b/i.test(text)) {
          violations.push(
            `${relativePath}:${line} — "${text}" → Use "Couldn't sync" pattern`
          );
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} "Import failed" violation(s):\n\n${violations.join("\n")}`
      );
    }
  });

  it("uses 'Failed to sign out' nowhere in user-facing strings", () => {
    const violations: string[] = [];

    for (const filePath of files) {
      const source = readFileSync(filePath, "utf-8");
      const strings = extractUserFacingStrings(source);
      const relativePath = filePath.replace(PROJECT_ROOT + "/", "");

      for (const { line, text } of strings) {
        if (/\bfailed to sign out\b/i.test(text)) {
          violations.push(
            `${relativePath}:${line} — "${text}" → Use "Couldn't sign out" pattern`
          );
        }
      }
    }

    if (violations.length > 0) {
      throw new Error(
        `Found ${violations.length} "Failed to sign out" violation(s):\n\n${violations.join("\n")}`
      );
    }
  });
});
