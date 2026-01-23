# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- Components: PascalCase (e.g., `BalanceCard.tsx`, `BudgetProgressSection.tsx`)
- Utilities: camelCase (e.g., `formateDate.ts`, `monthlyTrends.ts`)
- Hooks: camelCase starting with `use` (e.g., `useclient.ts`, `usemouse.ts`)
- API routes: kebab-case (e.g., `link-bank/`, `mock/transactions/`)
- Database/lib modules: camelCase (e.g., `supabase.ts`, `transactions.ts`)

**Functions:**
- Component: PascalCase (React conventions)
- Utility functions: camelCase (e.g., `getCategoryColor`, `toPieChartData`, `formatCurrency`)
- Async functions: camelCase prefix (e.g., `importTransactions`, `getTransactions`)
- Private functions: camelCase with underscore prefix for module-private (e.g., `_validateInput`)

**Variables:**
- Constants: UPPER_SNAKE_CASE (e.g., `CATEGORY_COLORS`, `CATEGORY_ICONS`)
- Regular variables: camelCase (e.g., `aggregated`, `mockTransactions`, `displayPercentage`)
- Type/Interface parameters: PascalCase (e.g., `BudgetProgress`, `DbTransaction`)

**Types:**
- Interfaces: PascalCase with descriptive names (e.g., `BudgetProgressSectionProps`, `ImportOptions`)
- DB row types: Prefix with `Db` (e.g., `DbTransaction`, `DbAccount`, `DbUserSettings`)
- Domain/app-level types: No prefix, descriptive (e.g., `BudgetProgress`, `ImportResult`)

## Code Style

**Formatting:**
- No explicit Prettier config found; uses Next.js/ESLint defaults
- Indentation: 2 spaces (Next.js standard)
- Line length: Not enforced but generally kept under 100 characters
- Trailing commas in objects: Used

**Linting:**
- Tool: ESLint 9 with Next.js core-web-vitals and TypeScript rules
- Config file: `eslint.config.mjs` (flat config format)
- Rules applied: Next.js defaults + TypeScript strict mode
- Disables specific rules where necessary (e.g., `@typescript-eslint/no-unused-vars` for intentionally unused params)

Example ESLint bypass pattern (when needed):
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function fetchAccounts(_userId: string): Promise<DbAccount[]> {
  return getAccounts();
}
```

## Import Organization

**Order:**
1. React and framework imports (e.g., `import React`, `import Link from "next/link"`)
2. Type imports from external packages (e.g., `import type { ReactNode }`)
3. Internal lib imports (e.g., `import { getTransactions } from "@/lib/db"`)
4. Internal component imports (e.g., `import HoverEffect from "../effects/HoverEffect"`)
5. Type imports from internal modules (e.g., `import type { BudgetProgress } from "@/types/finance"`)
6. Absolute imports with @/ alias come before relative imports

**Path Aliases:**
- `@/*` maps to `./src/*` (defined in `tsconfig.json`)
- Use `@/` for all internal imports (never use relative paths beyond parent directory)

Example:
```typescript
import { createServerSupabaseClient } from "@/lib/db/supabaseServer";
import type { DbTransaction } from "@/lib/db/types";
import { BudgetProgressSection } from "@/components/dashboard/BudgetProgressSection";
```

## Error Handling

**Pattern:**
- Async functions throw errors with descriptive messages
- Error messages include context (function name, operation, details)
- Console.error logs with function context prefix (e.g., `[transactions.getTransactions]`)
- API routes return JSON with `error` field and appropriate HTTP status codes

Example error pattern:
```typescript
if (error) {
  console.error("[transactions.getTransactions] Error:", error.message);
  throw new Error(`Failed to fetch transactions: ${error.message}`);
}
```

**API Error Responses:**
- 401: Authentication required
- 400: Bad request / invalid input
- 404: Resource not found
- 500: Internal server error

Example API error response:
```typescript
if (!user) {
  return NextResponse.json(
    { error: "Please log in to import transactions." },
    { status: 401 }
  );
}
```

## Logging

**Framework:** Console methods (`console.error`, `console.log`)

**Patterns:**
- Errors are logged with function context prefix: `console.error("[module.function] Error:", error.message)`
- Non-blocking errors are logged but don't prevent operation completion
- Log messages in console are prefixed with context for easy searching

Example logging:
```typescript
catch (notifError) {
  // Non-blocking: import succeeded even if notification generation fails
  console.error("[api/import] Notification generation error:", notifError);
}
```

## Comments

**When to Comment:**
- Section-level comments explaining major responsibilities (using `// ─────────────────────────────────────────`)
- Non-obvious logic or complex transformations
- Extension points (where features could be added later)
- Architectural decisions and constraints
- Data format explanations (e.g., PSD2 mock format)

**JSDoc/TSDoc:**
- Used for public functions in lib/ modules
- Includes purpose, parameters with types, return type, and examples
- Used for database query functions to document optional filters

Example JSDoc:
```typescript
/**
 * Get transactions with optional date range filter.
 *
 * @param options - Optional date range filter
 * @returns Array of transactions (RLS filtered)
 */
export async function getTransactions(
  options: DateRangeOptions = {}
): Promise<DbTransaction[]>
```

**Section Comments:**
Files are divided into semantic sections with divider comments:
```typescript
// ─────────────────────────────────────────────────────────────────────────────
// Query Functions
// ─────────────────────────────────────────────────────────────────────────────
```

## Function Design

**Size:** Functions are kept relatively short and focused
- Simple utility functions: 5-15 lines
- Query functions: 15-30 lines
- Component functions: 30-80 lines (longer acceptable for UI composition)

**Parameters:**
- Functions use options objects for multiple parameters (e.g., `DateRangeOptions`)
- Single required parameter + optional object is common pattern
- Use destructuring in function signatures

**Return Values:**
- Functions return their primary result
- Database queries explicitly return `null` when item not found
- Utilities return deterministic values
- Empty results return empty arrays `[]` or objects `{}`

Example return pattern:
```typescript
export async function getTransactionById(
  transactionId: string
): Promise<DbTransaction | null> {
  // ...
  if (error.code === "PGRST116") {
    return null;  // Not found
  }
  return data;
}
```

## Module Design

**Exports:**
- Use named exports for functions and types
- Default exports for components are common but named exports preferred for utilities
- Re-export pattern used in index files to create clear module boundaries

Example module re-export (`lib/db/index.ts`):
```typescript
// Client Exports
export {
  createBrowserSupabaseClient,
  validateSupabaseEnv,
} from "./supabase";

// Type Exports
export type { User, Session } from "./supabase";
```

**Barrel Files:**
- Used extensively (e.g., `components/dashboard/index.ts` re-exports all dashboard components)
- Allows clean imports: `import { BudgetProgressSection } from "@/components/dashboard"`
- Tested to ensure all exports are defined (smoke tests verify barrel imports work)

**Module Organization:**
- Related functions grouped by concern (queries, mutations, transformations)
- Section comments separate logical groups
- Private helper functions placed before public API
- Types defined at top of file or in separate `types.ts` files

## File Header Comments

All new files include a header comment explaining purpose and providing references to docs:

**Library file example:**
```typescript
/**
 * Supabase Client Configuration
 *
 * This file provides the core Supabase client setup for BetterBudget.
 * It exports utilities for creating properly configured Supabase clients.
 *
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL: Your Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anonymous key
 *
 * @see docs/SUPABASE_STRATEGY.md for architectural decisions
 */
```

**Component example:**
```typescript
/**
 * Budget Progress Section Component
 *
 * Displays budget progress for all tracked categories on the dashboard.
 * Uses traffic light colors (green/yellow/red) for ADHD-friendly feedback.
 *
 * @see docs/BUDGET_STRATEGY.md for design rationale
 */
```

## TypeScript Strictness

**Configuration:**
- `strict: true` in `tsconfig.json`
- `noEmit: true` for type checking without output
- All source files are `.ts` or `.tsx` (no `.js` in src/)

**Patterns:**
- Always use explicit types for function parameters
- Return types explicitly specified (especially for async functions)
- `type` keyword preferred over `interface` for simple object shapes
- Union types used for status enums (e.g., `type DbTransactionType = "income" | "expense"`)

## Styling

**Framework:** Tailwind CSS with shadcn/ui components

**Patterns:**
- Classes composed directly in className (no CSS modules)
- Conditional classes using template literals with ternaries
- Color scheme uses Tailwind semantic colors (text-foreground, bg-card, etc.)
- Dark mode support via `dark:` prefix

Example Tailwind styling:
```typescript
<div className={`p-3 rounded-lg ${colors.bg}`}>
  <div className="h-2 bg-muted rounded-full overflow-hidden mb-1">
    <div
      className={`h-full ${colors.bar} transition-all duration-300`}
      style={{ width: `${displayPercentage}%` }}
    />
  </div>
</div>
```

**Color constants:**
- Map category names to hex colors in `utils/charts/` (e.g., `CATEGORY_COLORS`)
- Icons stored in `CATEGORY_ICONS` map using Unicode emoji

## Special Conventions

**Directive Markers:**
- Files using browser-only features marked with `"use client"`
- Top of file for client components

**Server Components:**
- Default in Next.js App Router
- Async/await used freely for database access
- No state management beyond request scope

**Database:**
- All table names prefixed with `bb_` (e.g., `bb_transactions`, `bb_budgets`)
- Row-Level Security (RLS) enforced: queries auto-filter by authenticated user
- External IDs stored for idempotent imports: `external_id` from PSD2 mock API

---

*Convention analysis: 2026-01-23*
