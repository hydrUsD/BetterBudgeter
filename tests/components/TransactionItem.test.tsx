/**
 * TransactionItem Render Tests
 *
 * Tests the presentational TransactionItem component (PAGE-03; CONTEXT D-CMP-02).
 *
 * Does NOT test:
 * - Visual appearance or pixel measurements (covered by manual browser smoke)
 * - The parent page's DB-row → view-model mapping (covered in (bb)/page.tsx rewrite plan)
 * - CSS variable resolution (--bb-* tokens)
 *
 * @see docs/TESTING_STRATEGY.md
 * @see .planning/phases/08-home-hub/08-UI-SPEC.md § Section 3
 * @see .planning/phases/08-home-hub/08-CONTEXT.md D-CMP-02
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  TransactionItem,
  type TransactionItemProps,
} from "@/components/dashboard/TransactionItem";

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

// Pre-compute the expected date string once so all tests use the exact same
// output that the component will produce (de-DE locale, day + short month).
// On current Node.js: "14. Apr." — but we derive it dynamically so the test
// is not brittle if ICU data ever changes the exact punctuation.
const EXPECTED_DATE_2026_04_14 = new Date("2026-04-14").toLocaleDateString(
  "de-DE",
  { day: "numeric", month: "short" }
);

const mockExpense: TransactionItemProps = {
  merchant: "REWE Supermarkt",
  amount: 34.5,
  type: "expense",
  category: "Food",
  date: "2026-04-14",
};

const mockIncome: TransactionItemProps = {
  merchant: "REWE Supermarkt",
  amount: 2500.0,
  type: "income",
  category: "Salary",
  date: "2026-04-14",
};

// ─────────────────────────────────────────────────────────────────────────────
// TransactionItem
// ─────────────────────────────────────────────────────────────────────────────

describe("TransactionItem", () => {
  // ─── Case 1: EXPENSE_BASIC ────────────────────────────────────────────────

  it("EXPENSE_BASIC: renders merchant name", () => {
    render(<TransactionItem {...mockExpense} />);
    expect(screen.getByText("REWE Supermarkt")).toBeTruthy();
  });

  it("EXPENSE_BASIC: amount starts with U+2212 MINUS SIGN (not hyphen-minus)", () => {
    const { container } = render(<TransactionItem {...mockExpense} />);
    // U+2212 is the MINUS SIGN character (−), NOT the ASCII hyphen-minus (-).
    // This distinction is a visual typography requirement from 08-UI-SPEC.md § Section 3.
    // charCodeAt(0) must return 8722 (= 0x2212), NOT 45 (= 0x002D hyphen-minus).
    const amountEl = container.querySelector(".text-bb-negative");
    expect(amountEl).toBeTruthy();
    const text = amountEl!.textContent ?? "";
    expect(text.charCodeAt(0)).toBe(8722); // U+2212 MINUS SIGN
    expect(text.charCodeAt(0)).not.toBe(45); // NOT hyphen-minus U+002D
  });

  it("EXPENSE_BASIC: amount element has class text-bb-negative", () => {
    const { container } = render(<TransactionItem {...mockExpense} />);
    const amountEl = container.querySelector(".text-bb-negative");
    expect(amountEl).toBeTruthy();
  });

  it("EXPENSE_BASIC: secondary line contains category and formatted date", () => {
    render(<TransactionItem {...mockExpense} />);
    expect(screen.getByText("Food")).toBeTruthy();
    expect(screen.getByText(EXPECTED_DATE_2026_04_14)).toBeTruthy();
  });

  // ─── Case 2: INCOME_BASIC ────────────────────────────────────────────────

  it("INCOME_BASIC: amount starts with + prefix", () => {
    const { container } = render(<TransactionItem {...mockIncome} />);
    const amountEl = container.querySelector(".text-bb-positive");
    expect(amountEl).toBeTruthy();
    expect(amountEl!.textContent?.startsWith("+")).toBe(true);
  });

  it("INCOME_BASIC: amount element has class text-bb-positive", () => {
    const { container } = render(<TransactionItem {...mockIncome} />);
    expect(container.querySelector(".text-bb-positive")).toBeTruthy();
  });

  it("INCOME_BASIC: secondary line contains category", () => {
    render(<TransactionItem {...mockIncome} />);
    expect(screen.getByText("Salary")).toBeTruthy();
  });

  // ─── Case 3: AMOUNT_FORMATTING ───────────────────────────────────────────

  it("AMOUNT_FORMATTING: large expense renders de-DE currency format with U+2212", () => {
    const { container } = render(
      <TransactionItem
        merchant="Amazon"
        amount={1234.5}
        type="expense"
        category="Shopping"
        date="2026-04-14"
      />
    );
    const amountEl = container.querySelector(".text-bb-negative");
    expect(amountEl).toBeTruthy();
    // de-DE EUR format: "1.234,50 €" (dot as thousand separator, comma as decimal)
    // prefixed with U+2212 MINUS SIGN
    const text = amountEl!.textContent ?? "";
    expect(text).toContain("1.234,50");
    expect(text.charCodeAt(0)).toBe(8722); // U+2212 MINUS SIGN
  });

  // ─── Case 4: ZERO_AMOUNT ─────────────────────────────────────────────────

  it("ZERO_AMOUNT: income renders +0,00 € (no special-case branch)", () => {
    const { container } = render(
      <TransactionItem
        merchant="Test"
        amount={0}
        type="income"
        category="Other"
        date="2026-04-14"
      />
    );
    const amountEl = container.querySelector(".text-bb-positive");
    expect(amountEl).toBeTruthy();
    expect(amountEl!.textContent?.startsWith("+")).toBe(true);
    expect(amountEl!.textContent).toContain("0,00");
  });

  it("ZERO_AMOUNT: expense renders −0,00 € with U+2212 (no special-case branch)", () => {
    const { container } = render(
      <TransactionItem
        merchant="Test"
        amount={0}
        type="expense"
        category="Other"
        date="2026-04-14"
      />
    );
    const amountEl = container.querySelector(".text-bb-negative");
    expect(amountEl).toBeTruthy();
    expect(amountEl!.textContent?.charCodeAt(0)).toBe(8722); // U+2212
    expect(amountEl!.textContent).toContain("0,00");
  });

  // ─── Case 5: CATEGORY_VARIETY ────────────────────────────────────────────

  it("CATEGORY_VARIETY: renders Other category in the secondary line", () => {
    render(
      <TransactionItem
        merchant="Misc Store"
        amount={10}
        type="expense"
        category="Other"
        date="2026-04-14"
      />
    );
    expect(screen.getByText("Other")).toBeTruthy();
  });

  // ─── Case 6: DATE_FORMATTING ─────────────────────────────────────────────

  it("DATE_FORMATTING: formats date as de-DE short month (14. Apr.)", () => {
    render(<TransactionItem {...mockExpense} />);
    // EXPECTED_DATE_2026_04_14 is computed with the same Intl call as the
    // component, so the assertion is exact regardless of Node.js ICU version.
    expect(screen.getByText(EXPECTED_DATE_2026_04_14)).toBeTruthy();
  });

  // ─── Case 7: NO_ICONS ────────────────────────────────────────────────────

  it("NO_ICONS: renders no SVG icons (DESIGN_SYSTEM §5.3 — no icons)", () => {
    const { container } = render(<TransactionItem {...mockExpense} />);
    // Per DESIGN_SYSTEM §5.3 and 08-CONTEXT.md PAGE-03: TransactionItem must
    // render merchant + amount + category + date only — no icon elements.
    expect(container.querySelector("svg")).toBeNull();
  });

  // ─── Case 8: NO_CLIENT_DIRECTIVE_REGRESSION_GUARD ────────────────────────

  it("NO_CLIENT_DIRECTIVE: source file does not start with 'use client'", async () => {
    // This guard prevents the future regression where someone adds "use client"
    // to TransactionItem.tsx and silently inflates the client bundle (Pitfall 5
    // in 08-RESEARCH.md). The first 200 characters of the file must NOT contain
    // the 'use client' directive string.
    //
    // NOTE: We read the source file via dynamic import of fs — this is intentional.
    // The test is a static analysis assertion, not a render assertion.
    const fs = await import("fs");
    const path = await import("path");
    const filePath = path.resolve(
      process.cwd(),
      "src/components/dashboard/TransactionItem.tsx"
    );
    const content = fs.readFileSync(filePath, "utf8");
    const first200 = content.slice(0, 200);
    // The directive would appear as 'use client' (with or without semicolon)
    expect(first200).not.toContain("use client");
  });
});
