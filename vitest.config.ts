/**
 * Vitest Configuration
 *
 * Minimal test configuration for MVP smoke and render tests.
 * Uses jsdom for React component rendering in a simulated browser environment.
 *
 * @see docs/TESTING_STRATEGY.md for rationale
 */

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom to simulate browser APIs for React rendering
    environment: "jsdom",
    // Setup file for cleanup, ResizeObserver stub, and jest-dom matchers
    setupFiles: ["./tests/setup.ts"],
    // Test files live in the tests/ directory
    include: ["tests/**/*.test.{ts,tsx}"],
    // Path alias matching tsconfig
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
