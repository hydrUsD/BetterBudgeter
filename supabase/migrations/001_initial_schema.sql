/**
 * BetterBudget Initial Schema Migration
 *
 * This migration creates the core tables for BetterBudget with RLS policies.
 * Tables are prefixed with `bb_` to distinguish from legacy OopsBudgeter tables.
 *
 * Run this in Supabase SQL Editor or via CLI:
 *   supabase db push
 *
 * @see docs/SUPABASE_STRATEGY.md for schema decisions
 */

-- =============================================================================
-- TABLE: bb_accounts
-- Linked bank accounts from PSD2-style mock API
-- =============================================================================

CREATE TABLE bb_accounts (
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
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bb_accounts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own accounts
CREATE POLICY "Users can view own accounts"
  ON bb_accounts FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own accounts"
  ON bb_accounts FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own accounts"
  ON bb_accounts FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own accounts"
  ON bb_accounts FOR DELETE
  USING (user_id = auth.uid());

-- Index for user lookups
CREATE INDEX idx_bb_accounts_user_id ON bb_accounts(user_id);

-- =============================================================================
-- TABLE: bb_transactions
-- Imported transactions from PSD2-style mock API
-- =============================================================================

CREATE TABLE bb_transactions (
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
  created_at TIMESTAMPTZ DEFAULT now(),

  -- Idempotency constraint: prevent duplicate imports
  UNIQUE(user_id, external_id)
);

-- Enable RLS
ALTER TABLE bb_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own transactions
CREATE POLICY "Users can view own transactions"
  ON bb_transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON bb_transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON bb_transactions FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own transactions"
  ON bb_transactions FOR DELETE
  USING (user_id = auth.uid());

-- Indexes for common queries
CREATE INDEX idx_bb_transactions_user_id ON bb_transactions(user_id);
CREATE INDEX idx_bb_transactions_account_id ON bb_transactions(account_id);
CREATE INDEX idx_bb_transactions_booking_date ON bb_transactions(booking_date);
CREATE INDEX idx_bb_transactions_type ON bb_transactions(type);

-- =============================================================================
-- TABLE: bb_user_settings
-- User preferences for UI and display
-- =============================================================================

CREATE TABLE bb_user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_currency TEXT DEFAULT 'EUR',
  theme TEXT DEFAULT 'system',
  compact_view BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bb_user_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own settings
CREATE POLICY "Users can view own settings"
  ON bb_user_settings FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON bb_user_settings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON bb_user_settings FOR UPDATE
  USING (user_id = auth.uid());

-- Note: No delete policy - settings should persist with user

-- =============================================================================
-- TABLE: bb_notification_prefs
-- User notification preferences
-- =============================================================================

CREATE TABLE bb_notification_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  budget_alerts BOOLEAN DEFAULT true,
  weekly_summary BOOLEAN DEFAULT true,
  import_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE bb_notification_prefs ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own notification preferences
CREATE POLICY "Users can view own notification prefs"
  ON bb_notification_prefs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification prefs"
  ON bb_notification_prefs FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification prefs"
  ON bb_notification_prefs FOR UPDATE
  USING (user_id = auth.uid());

-- Note: No delete policy - preferences should persist with user

-- =============================================================================
-- FUNCTION: Auto-create user settings on signup
-- Creates default settings when a new user signs up
-- =============================================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default user settings
  INSERT INTO bb_user_settings (user_id)
  VALUES (NEW.id);

  -- Create default notification preferences
  INSERT INTO bb_notification_prefs (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Run on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
