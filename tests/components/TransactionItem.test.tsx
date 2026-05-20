/**
 * TransactionItem Render Tests
 *
 * Tests the presentational TransactionItem component (PAGE-03; CONTEXT D-CMP-02).
 *
 * Does NOT test:
 * - Visual appearance or pixel measurements (covered by manual browser smoke)
 * - The parent page's DB-row → view-model mapping (covered in (bb)/page.tsx rewrite plan)
 *
 * @see docs/TESTING_STRATEGY.md
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TransactionItem,
  type TransactionItemProps,
} from "@/components/dashboard/TransactionItem";

// ─────────────────────────────────────────────────────────────────────────────
// TransactionItem
// ─────────────────────────────────────────────────────────────────────────────

describe("TransactionItem", () => {
  it.todo(
    "Wave 2 will populate income/expense/category/date render cases per 08-RESEARCH.md"
  );
});
