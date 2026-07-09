-- ============================================================
-- SmartPower – Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── User Settings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL DEFAULT '',
  tariff_per_unit DECIMAL(10, 2) NOT NULL DEFAULT 7.00,
  monthly_budget DECIMAL(10, 2) NOT NULL DEFAULT 2500.00,
  notification_limit DECIMAL(10, 2) NOT NULL DEFAULT 15.00,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Electricity Usage ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.electricity_usage (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  units DECIMAL(10, 3) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- ─── Predictions ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM format
  predicted_units DECIMAL(10, 3) NOT NULL,
  predicted_bill DECIMAL(10, 2) NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 50,
  model_type TEXT NOT NULL DEFAULT 'linear_regression',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ─── Reports ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- YYYY-MM format
  total_units DECIMAL(10, 3) NOT NULL,
  total_bill DECIMAL(10, 2) NOT NULL,
  avg_daily_units DECIMAL(10, 3) NOT NULL,
  highest_usage_day DATE,
  lowest_usage_day DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- ─── Indexes ─────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_usage_user_date ON public.electricity_usage(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_usage_user_id ON public.electricity_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_month ON public.predictions(user_id, month);
CREATE INDEX IF NOT EXISTS idx_reports_user_month ON public.reports(user_id, month);

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.electricity_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- user_settings policies
CREATE POLICY "Users can view own settings"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- electricity_usage policies
CREATE POLICY "Users can view own usage"
  ON public.electricity_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON public.electricity_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON public.electricity_usage FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own usage"
  ON public.electricity_usage FOR DELETE
  USING (auth.uid() = user_id);

-- predictions policies
CREATE POLICY "Users can view own predictions"
  ON public.predictions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON public.predictions FOR UPDATE
  USING (auth.uid() = user_id);

-- reports policies
CREATE POLICY "Users can view own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

-- ─── Auto-create settings on user signup ──────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── Updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_usage_updated_at
  BEFORE UPDATE ON public.electricity_usage
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
