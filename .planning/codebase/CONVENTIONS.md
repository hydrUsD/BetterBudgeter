# Coding Conventions

**Analysis Date:** 2026-01-23

## Naming Patterns

**Files:**
- Components: PascalCase, single responsibility. Example: `BudgetProgressSection.tsx`
- Functions/utilities: camelCase. Example: `getCategoryColor`, `transformMockTransaction`
- Constants/exports: UPPER_CASE for immutable objects. Example: `CATEGORY_COLORS`, `COMPARISON_COLORS`
- Type files: Match pattern of exports. Example: `types.ts` for type definitions
- Module indices: `index.ts` for barrel exports. Example: `src/utils/charts/index.ts` exports all chart helpers

**Functions:**
- Descriptive verb prefixes for clarity. Examples:
  - `get*` for queries: `getAccounts()`, `getTransactionsByAccount()`
  - `create*` for mutations: `createAccount()`, `createAccounts()`
  - `update*` for updates: `updateAccount()`, `updateAccountBalance()`
  - `delete*` for deletions: `deleteAccount()`, `deleteAccountsByBankId()`
  - `transform*` for data transformation: `transformMockTransaction()`
  - `map*` for mapping operations: `mapCategory()`
  - `is*` for boolean predicates: `isBankLinked()`
  - `to*` for format conversions: `toPieChartData()`, `toTrendChartData()`
  - `format*` for formatting: `formatAxisCurrency()`, `formatAxisDate()`

**Variables:**
- camelCase for all local variables and parameters
- Descriptive names that indicate type or purpose. Examples:
  - `accountId` (indicates UUID)
  - `budgetProgress` (indicates an array)
  - `isLoading` (boolean flag)
  - `mockTransactions` (from mock source)
  - `spentAmount` (numeric amount)

**Types:**
- PascalCase for type/interface names. Examples: `BudgetProgress`, `DbAccount`, `ImportResult`
- Prefix with `Db` for database types. Examples: `DbTransaction`, `DbAccountInsert`
- Prefix with `Api` for API response types
- Props interfaces named `{ComponentName}Props`. Example: `BudgetProgressSectionProps`
- Use `type` for unions and object shapes; `interface` for component props

## Code Style

**Formatting:**
- Formatter: Prettier (via Next.js default config)
- Line length: Configured by tsconfig/prettier defaults (typically 80-100 chars)
- Semicolons: Required (enforced by Prettier)
- Quotes: Double quotes (enforced by Prettier)
- Trailing commas: ES5 (enforced by Prettier)

**Linting:**
- Tool: ESLint with Next.js/TypeScript config
- Config file: `eslint.config.mjs`
- Rules: Uses `next/core-web-vitals` and `next/typescript` presets
- Run: `bun run lint`

**Key style rules observed:**
- No unused variables or imports
- Explicit return types on exported functions
- Const by default, `let` only when mutation is necessary
- No magic numbers (use named constants)
- Braces required for all conditionals, even single-line blocks

## Import Organization

**Order:**
1. React and framework imports (React, Next.js)
2. External packages (@supabase, @radix-ui, sonner, etc.)
3. Type imports (type { ... } from ...)
4. Relative imports from `src/` using path alias `@/`

**Path Aliases:**
- `@/*` maps to `src/*` (defined in tsconfig.json)
- Always use `@/` prefix, never relative paths like `../`
- Examples:
  - `import { BudgetProgressSection } from "@/components/dashboard"`
  - `import { CATEGORY_COLORS } from "@/utils/charts"`
  - `import type { BudgetProgress } from "@/types/finance"`

**Barrel Files:**
- Used in `lib/`, `components/`, and `utils/` for grouping related exports
- Example in `src/utils/charts/index.ts`:
  ```typescript
  export const CATEGORY_COLORS = { /* ... */ };
  export function getCategoryColor(category: string) { /* ... */ }
  export function toPieChartData(breakdown) { /* ... */ }
  ```

## Error Handling

**Patterns:**
- Try/catch blocks in async functions and API routes
- Explicit error logging with descriptive context. Example:
  ```typescript
  console.error("[module.function] Error:", error.message);
  ```
- Thrown errors include user-friendly messages:
  ```typescript
  throw new Error(`Failed to fetch accounts: ${error.message}`);
  ```
- In components: Errors caught and displayed via toast notifications (Sonner)
- In API routes: Errors returned with appropriate HTTP status codes and error details

**Error Logging Format:**
- `console.error("[file.function] Error:", error.message)` pattern used consistently
- Provides context for debugging without exposing internal details
- Example: `console.error("[accounts.getAccounts] Error:", error.message)`

**Validation:**
- Input validation before database operations. Example:
  ```typescript
  if (!transaction.external_id) {
    errors.push("Missing external_id");
  }
  ```
- Supabase-specific: Check for `PGRST116` error code (no rows) and handle as null, not error
- Return validation objects with `{ valid: boolean; errors: string[] }`

## Logging

**Framework:** console (no external logging library)

**Patterns:**
- Error logs use `console.error()` with context prefix
- No debug/info/warn logs in production code (logs are error-only)
- Context format: `[file.function] Error: {message}`
- Example from `lib/db/accounts.ts`:
  ```typescript
  console.error("[accounts.getAccounts] Error:", error.message);
  throw new Error(`Failed to fetch accounts: ${error.message}`);
  ```

**When to Log:**
- Database query failures (before throwing)
- API errors (before throwing)
- NOT in happy path (successful operations)
- NOT in utility functions (they're pure)

## Comments

**When to Comment:**

- File-level: Every non-trivial file starts with a JSDoc comment explaining its purpose
- Section-level: Use ASCII dividers to separate logical sections:
  ```typescript
  // ─────────────────────────────────────────────────────────────────────────────
  // Query Functions
  // ─────────────────────────────────────────────────────────────────────────────
  ```
- Function-level: Public functions have JSDoc explaining params, return, and examples
- Complex logic: Inline comments explaining *why* not *what*

**JSDoc/TSDoc:**

- All exported functions document with JSDoc
- Include `@param`, `@returns`, and `@example` tags
- Example from `src/lib/import/index.ts`:
  ```typescript
  /**
   * Transform a mock API transaction to database format.
   *
   * PSD2 FORMAT (input):
   * - transactionId: unique ID
   * - bookingDate / valueDate: ISO dates
   *
   * @param mockTx - Transaction from mock API
   * @param userId - User ID for ownership
   * @param dbAccountId - Database account UUID
   * @returns Database transaction insert object
   */
  ```

**Tone:**
- Clear, technical, explain the *why*
- Document architectural decisions and constraints
- Explain PSD2 or domain-specific concepts inline
- Reference external docs where relevant (e.g., `@see docs/BUDGET_STRATEGY.md`)

## Function Design

**Size:**
- Functions are short and focused (typically < 30 lines)
- Complex operations broken into smaller, named helper functions
- Example: `importTransactions()` delegates to `transformMockTransaction()`, `upsertTransactions()`, etc.

**Parameters:**
- Prefer object parameters for related values. Example:
  ```typescript
  export interface ImportOptions {
    accountId: string;
    userId: string;
    dateFrom?: string;
    dateTo?: string;
  }
  export async function importTransactions(options: ImportOptions) { /* ... */ }
  ```
- Avoid parameter lists > 3 params
- Use optional chaining (`?.`) for null-safe access

**Return Values:**
- Explicit return types required on all exported functions
- Return early to flatten nesting. Example:
  ```typescript
  if (budgetProgress.length === 0) {
    return <EmptyState />;
  }
  // Main component logic continues...
  ```
- Async functions always return Promise<T>
- Return objects with clear structure. Example: `ImportResult` has `{ success, imported, updated, skipped, errors, errorDetails }`

## Module Design

**Exports:**
- Named exports (not default exports) for consistency
- Barrel files aggregate related exports
- Private functions start with `_` prefix (rarely used; prefer organizing into separate functions)

**Barrel Files:**
- Located at `index.ts` in feature directories
- Export all public API from module
- Example from `src/utils/charts/index.ts`:
  ```typescript
  export const CATEGORY_COLORS = { /* ... */ };
  export function getCategoryColor(category: string): string { /* ... */ }
  export function toPieChartData(breakdown) { /* ... */ }
  ```

**Grouping:**
- Organize code into logical sections with comments:
  - Types/Interfaces at top
  - Constants next
  - Public functions
  - Helper/private functions at bottom
- Example structure from `src/lib/db/accounts.ts`:
  ```typescript
  // ─────────────────────────────────────────────────────────────────────────────
  // Query Functions
  // ─────────────────────────────────────────────────────────────────────────────
  export async function getAccounts() { /* ... */ }

  // ─────────────────────────────────────────────────────────────────────────────
  // Mutation Functions
  // ─────────────────────────────────────────────────────────────────────────────
  export async function createAccount() { /* ... */ }
  ```

## Layering Rules

**Strictly Enforced:**
- `app/` (routes): No business logic, no direct DB access, only routing and page layout
- `components/` (UI): Reusable React components, prop-based, no direct DB calls
- `lib/` (logic): Business logic, database access, API calls, orchestration
- `utils/` (pure helpers): NO database access, NO API calls, NO side effects, only formatting and mapping

**Import Direction:**
- Components can import from `utils/` and `lib/` (not the reverse)
- `lib/` modules can import from `utils/` (not the reverse)
- `lib/db/*` (database) never imports from components

## Type Safety

**TypeScript Configuration:**
- `strict: true` (all strict checks enabled)
- Path alias: `@/*` → `src/*`
- Target: ES2017
- Module resolution: Bundler (Next.js compatible)

**Practices:**
- Avoid `any` type (use `unknown` with proper narrowing if needed)
- Use `type` for object shapes and unions
- Use `interface` for component props
- Export types from type files: `type { BudgetProgress } from "@/types/finance"`
- Database types prefixed with `Db`: `DbAccount`, `DbTransaction`, `DbTransactionInsert`

---

*Convention analysis: 2026-01-23*
