/**
 * Legacy Schema Migration
 *
 * Creates the "legacy" schema for OopsBudgeter tables.
 * This isolates legacy tables from BetterBudget tables (bb_*) in the public schema.
 *
 * Run this ONCE in Supabase SQL Editor before running `bun run db:push`
 *
 * After running this:
 * 1. Run `bun run db:push` to create legacy tables in the new schema
 * 2. The old tables in public schema can be dropped if they have no data
 */

-- Create the legacy schema for OopsBudgeter tables
CREATE SCHEMA IF NOT EXISTS legacy;

-- Grant usage to authenticated users (needed for RLS to work)
GRANT USAGE ON SCHEMA legacy TO authenticated;
GRANT USAGE ON SCHEMA legacy TO anon;

-- Grant default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA legacy
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA legacy
  GRANT SELECT ON TABLES TO anon;
