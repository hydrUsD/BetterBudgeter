"use client";

/**
 * Budget Settings Component
 *
 * Allows users to set monthly spending limits for each expense category.
 * Uses upsert pattern so users can create or update budgets.
 *
 * ADHD DESIGN:
 * - Simple form with clear labels
 * - One field per category (no complex configuration)
 * - Immediate feedback via toast
 * - Empty fields mean "no budget" (not tracked)
 *
 * @see docs/BUDGET_STRATEGY.md for design rationale
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EXPENSE_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORY_DESCRIPTIONS,
} from "@/utils/mapping";
import type { ExpenseCategory } from "@/types/finance";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetSettingsProps {
  /** Current budgets from database (category -> limit) */
  currentBudgets: Record<string, number>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function BudgetSettings({ currentBudgets }: BudgetSettingsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Local state for form values (category -> string input)
  const [budgetValues, setBudgetValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const category of EXPENSE_CATEGORIES) {
      const existing = currentBudgets[category];
      initial[category] = existing ? String(existing) : "";
    }
    return initial;
  });

  // Track which fields have been modified
  const [modified, setModified] = useState<Set<string>>(new Set());

  // ─────────────────────────────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleValueChange = (category: string, value: string) => {
    // Only allow numbers and decimal point
    if (value !== "" && !/^\d*\.?\d*$/.test(value)) {
      return;
    }

    setBudgetValues((prev) => ({ ...prev, [category]: value }));
    setModified((prev) => new Set(prev).add(category));
  };

  const handleSave = async () => {
    // Collect budgets to save (only modified ones with valid values)
    const budgetsToSave: { category: string; limit: number }[] = [];
    const budgetsToDelete: string[] = [];

    for (const category of Array.from(modified)) {
      const value = budgetValues[category];
      const parsed = parseFloat(value);

      if (value === "" || isNaN(parsed) || parsed <= 0) {
        // Empty or invalid = delete budget if it existed
        if (currentBudgets[category]) {
          budgetsToDelete.push(category);
        }
      } else {
        budgetsToSave.push({ category, limit: parsed });
      }
    }

    if (budgetsToSave.length === 0 && budgetsToDelete.length === 0) {
      toast.info("No changes to save");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/budgets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            budgets: budgetsToSave,
            deletions: budgetsToDelete,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to save budgets");
        }

        toast.success("Budgets saved successfully");
        setModified(new Set());
        router.refresh();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to save";
        toast.error(message);
      }
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────────

  const hasChanges = modified.size > 0;

  return (
    <div className="space-y-6">
      {/* Header with explanation */}
      <div className="text-sm text-muted-foreground">
        Set monthly spending limits for each category. Leave empty to not track
        a category. You&apos;ll get notifications at 80% and 100% of your budget.
      </div>

      {/* Budget inputs grid */}
      <div className="grid gap-4">
        {EXPENSE_CATEGORIES.map((category) => (
          <BudgetInputRow
            key={category}
            category={category as ExpenseCategory}
            value={budgetValues[category]}
            onChange={(value) => handleValueChange(category, value)}
            isModified={modified.has(category)}
          />
        ))}
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!hasChanges || isPending}>
          {isPending ? "Saving..." : "Save Budgets"}
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Budget Input Row
// ─────────────────────────────────────────────────────────────────────────────

interface BudgetInputRowProps {
  category: ExpenseCategory;
  value: string;
  onChange: (value: string) => void;
  isModified: boolean;
}

function BudgetInputRow({
  category,
  value,
  onChange,
  isModified,
}: BudgetInputRowProps) {
  const icon = CATEGORY_ICONS[category];
  const description = CATEGORY_DESCRIPTIONS[category];

  return (
    <div className="flex items-center gap-4">
      {/* Category info */}
      <div className="flex-1 min-w-0">
        <Label htmlFor={`budget-${category}`} className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{category}</span>
          {isModified && (
            <span className="text-xs text-amber-500">•</span>
          )}
        </Label>
        <p className="text-xs text-muted-foreground truncate">{description}</p>
      </div>

      {/* Input field */}
      <div className="w-32 flex items-center gap-1">
        <span className="text-muted-foreground">€</span>
        <Input
          id={`budget-${category}`}
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="text-right"
        />
      </div>
    </div>
  );
}