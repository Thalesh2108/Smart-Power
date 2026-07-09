// ============================================================
// SmartPower – Global TypeScript Types
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  full_name: string;
  tariff_per_unit: number; // ₹ per unit (kWh)
  monthly_budget: number; // ₹
  notification_limit: number; // units/day threshold
  dark_mode: boolean;
  created_at: string;
  updated_at: string;
}

export interface ElectricityUsage {
  id: string;
  user_id: string;
  date: string; // ISO date string YYYY-MM-DD
  units: number; // kWh consumed
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  predicted_units: number;
  predicted_bill: number;
  confidence: number; // 0-100
  model_type: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  month: string; // YYYY-MM
  total_units: number;
  total_bill: number;
  avg_daily_units: number;
  highest_usage_day: string;
  lowest_usage_day: string;
  created_at: string;
}

// ─── AI Module Types ──────────────────────────────────────

export interface LinearRegressionResult {
  slope: number;
  intercept: number;
  r_squared: number;
}

export interface PredictionResult {
  predicted_units: number;
  predicted_bill: number;
  predictedUnits: number;
  predictedBill: number;
  slope: number;
  intercept: number;
  confidence: number;
  daily_forecast: DailyForecast[];
  regression: LinearRegressionResult;
}

export interface DailyForecast {
  date: string;
  predicted_units: number;
  is_actual: boolean;
}

export interface AnomalyResult {
  is_anomaly: boolean;
  severity: "low" | "medium" | "high";
  z_score: number;
  message: string;
  days_above_threshold: number;
}

export interface Recommendation {
  id: string;
  category: "appliance" | "habit" | "billing" | "seasonal";
  title: string;
  description: string;
  potential_saving: string;
  icon: string;
  priority: "high" | "medium" | "low";
}

// ─── Dashboard Types ──────────────────────────────────────

export interface DashboardStats {
  today_units: number;
  month_units: number;
  estimated_bill: number;
  predicted_bill: number;
  monthly_budget: number;
  budget_remaining: number;
  budget_used_percent: number;
  electricity_score: number;
  avg_daily_units: number;
}

export interface ChartDataPoint {
  date: string;
  units: number;
  bill?: number;
  label?: string;
}

export interface WeeklyData {
  week: string;
  units: number;
  bill: number;
}

export interface MonthlyData {
  month: string;
  units: number;
  bill: number;
  budget: number;
}
