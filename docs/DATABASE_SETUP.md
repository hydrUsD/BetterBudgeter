# Database Setup Guide

**Version:** 1.0
**Status:** Required for MVP
**Last Updated:** 2024

---

## Overview

This document contains all PostgreSQL queries needed to set up the BetterBudget database in Supabase. Run these queries in the Supabase SQL Editor in the order specified.

**Important:** These tables use the `bb_` prefix to distinguish them from legacy OopsBudgeter tables.

---

## Quick Setup (Copy & Paste)

For convenience, here's the complete setup script. Copy and paste into Supabase SQL Editor:

```sql
-- ============================================================================
-- BETTERBUDGET DATABASE SETUP
-- Run this entire script in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- bb_accounts: Linked bank accounts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bb_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  bank_id TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  currency TEXT DEFAULT 'EUR',
  balance DECIMAL(12,2) DEFAULT 0,
  iban TEXT,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- bb_transactions: Imported transactions
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bb_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES bb_accounts(id) ON DELETE CASCADE NOT NULL,
  external_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL,
  description TEXT,
  category TEXT,
  booking_date DATE NOT NULL,
  value_date DATE,
  creditor_name TEXT,
  debtor_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  -- Idempotency constraint: prevents duplicate imports
  UNIQUE(user_id, external_id)
);

-- ----------------------------------------------------------------------------
-- bb_user_settings: User preferences
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bb_user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_currency TEXT DEFAULT 'EUR',
  theme TEXT DEFAULT 'system',
  compact_view BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ----------------------------------------------------------------------------
-- bb_notification_prefs: Notification preferences
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bb_notification_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_alerts BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  import_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ============================================================================
-- 2. INDEXES
-- ============================================================================

-- Accounts: lookup by user and bank
CREATE INDEX IF NOT EXISTS idx_bb_accounts_user_id ON bb_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_bb_accounts_bank_id ON bb_accounts(bank_id);

-- Transactions: common query patterns
CREATE INDEX IF NOT EXISTS idx_bb_transactions_user_id ON bb_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bb_transactions_account_id ON bb_transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_bb_transactions_booking_date ON bb_transactions(booking_date);
CREATE INDEX IF NOT EXISTS idx_bb_transactions_external_id ON bb_transactions(external_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE bb_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bb_notification_prefs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- bb_accounts policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own accounts"
  ON bb_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON bb_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON bb_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON bb_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- bb_transactions policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own transactions"
  ON bb_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON bb_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON bb_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON bb_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- bb_user_settings policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own settings"
  ON bb_user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON bb_user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON bb_user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- bb_notification_prefs policies
-- ----------------------------------------------------------------------------
CREATE POLICY "Users can view own notification prefs"
  ON bb_notification_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification prefs"
  ON bb_notification_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification prefs"
  ON bb_notification_prefs FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## Detailed Explanation

### Table: bb_accounts

Stores linked bank accounts. Each account represents consent granted by the user.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | References auth.users (required) |
| `bank_id` | TEXT | Mock bank identifier (e.g., "sparkasse-berlin-001") |
| `bank_name` | TEXT | Display name (e.g., "Sparkasse Berlin") |
| `account_name` | TEXT | Account name (e.g., "Girokonto") |
| `account_type` | TEXT | Type: "checking", "savings", "credit" |
| `currency` | TEXT | ISO currency code (default: EUR) |
| `balance` | DECIMAL | Current balance |
| `iban` | TEXT | Mock IBAN (nullable) |
| `last_synced_at` | TIMESTAMPTZ | Last successful import timestamp |
| `created_at` | TIMESTAMPTZ | When account was linked |

### Table: bb_transactions

Stores imported transactions. Uses UPSERT for idempotent imports.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (auto-generated) |
| `user_id` | UUID | References auth.users (required) |
| `account_id` | UUID | References bb_accounts (required) |
| `external_id` | TEXT | Bank's transaction ID (for idempotency) |
| `type` | TEXT | "income" or "expense" |
| `amount` | DECIMAL | Transaction amount (always positive) |
| `currency` | TEXT | ISO currency code |
| `description` | TEXT | Transaction description |
| `category` | TEXT | Category (e.g., "Food", "Transport") |
| `booking_date` | DATE | When transaction was booked |
| `value_date` | DATE | Value date (nullable) |
| `creditor_name` | TEXT | Recipient for outgoing payments |
| `debtor_name` | TEXT | Sender for incoming payments |
| `created_at` | TIMESTAMPTZ | When imported |

**Key Constraint:** `UNIQUE(user_id, external_id)` ensures no duplicate imports.

### Table: bb_user_settings

User preferences for display and behavior.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Primary key, references auth.users |
| `display_currency` | TEXT | Preferred display currency (default: EUR) |
| `theme` | TEXT | "light", "dark", or "system" |
| `compact_view` | BOOLEAN | Enable compact transaction view |
| `created_at` | TIMESTAMPTZ | When created |
| `updated_at` | TIMESTAMPTZ | Last modified |

### Table: bb_notification_prefs

User notification preferences.

| Column | Type | Description |
|--------|------|-------------|
| `user_id` | UUID | Primary key, references auth.users |
| `budget_alerts` | BOOLEAN | Enable budget alerts (default: true) |
| `weekly_summary` | BOOLEAN | Enable weekly summary (default: true) |
| `import_notifications` | BOOLEAN | Enable import notifications (default: true) |
| `created_at` | TIMESTAMPTZ | When created |

---

## RLS (Row Level Security) Explanation

All tables have RLS enabled to ensure users can only access their own data.

**Policy Pattern:**
- SELECT: `auth.uid() = user_id`
- INSERT: `auth.uid() = user_id` (WITH CHECK)
- UPDATE: `auth.uid() = user_id`
- DELETE: `auth.uid() = user_id`

This mimics real PSD2 data isolation requirements where each user's financial data is strictly separated.

---

## Verification Queries

After running the setup, verify with these queries:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'bb_%';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename LIKE 'bb_%';

-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
AND tablename LIKE 'bb_%';

-- Check unique constraint on transactions
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'UNIQUE'
AND table_name = 'bb_transactions';
```

---

## Teardown (Development Only)

To remove all BetterBudget tables (WARNING: deletes all data):

```sql
-- Drop tables (cascades to policies and indexes)
DROP TABLE IF EXISTS bb_transactions CASCADE;
DROP TABLE IF EXISTS bb_accounts CASCADE;
DROP TABLE IF EXISTS bb_user_settings CASCADE;
DROP TABLE IF EXISTS bb_notification_prefs CASCADE;
```

---

## Migration History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Initial | Created bb_accounts, bb_transactions, bb_user_settings, bb_notification_prefs with RLS |

---

*Document created: Task 4b — Database Setup Guide*