/**
 * Vitest Test Setup
 *
 * Configures the test environment for React component rendering.
 *
 * - Adds jest-dom matchers for DOM assertions
 * - Cleans up DOM between tests (prevents state leakage)
 * - Provides ResizeObserver stub (required by Recharts)
 */

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Clean up DOM after each test to prevent state leakage
afterEach(() => {
  cleanup();
});

// Stub ResizeObserver (not available in jsdom, required by Recharts)
vi.stubGlobal(
  "ResizeObserver",
  class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);