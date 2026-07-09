/**
 * AI Energy Health Score Engine
 * Computes a holistic 0-100 energy health score from multiple factors.
 */

export interface HealthScoreComponents {
  usageScore: number;      // 0-100: how well usage compares to ideal
  budgetScore: number;     // 0-100: budget adherence
  consistencyScore: number; // 0-100: stability of daily readings
  anomalyScore: number;    // 0-100: penalty for anomalies
}

export interface HealthScoreResult {
  score: number;
  label: "Excellent" | "Good" | "Fair" | "Poor" | "Critical";
  color: string;
  components: HealthScoreComponents;
  strengths: string[];
  improvements: string[];
  tip: string;
}

/**
 * Calculate consistency score from daily units array
 * Low coefficient of variation → high consistency
 */
function calcConsistency(dailyUnits: number[]): number {
  if (dailyUnits.length < 3) return 70; // not enough data
  const mean = dailyUnits.reduce((a, b) => a + b, 0) / dailyUnits.length;
  if (mean === 0) return 100;
  const variance = dailyUnits.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / dailyUnits.length;
  const cv = Math.sqrt(variance) / mean; // coefficient of variation
  // cv close to 0 = very consistent, cv > 1 = very inconsistent
  return Math.max(0, Math.min(100, Math.round((1 - Math.min(cv, 1)) * 100)));
}

/**
 * Calculate AI Energy Health Score (0-100)
 */
export function calculateHealthScore(
  avgDailyUnits: number,
  budget: number,
  tariff: number,
  dailyUnits: number[],
  anomalyCount: number
): HealthScoreResult {
  const dailyBudgetUnits = budget / tariff / 30;

  // ── Usage Score (30% weight) ──────────────────────────
  let usageScore = 100;
  if (dailyBudgetUnits > 0) {
    const ratio = avgDailyUnits / dailyBudgetUnits;
    if (ratio <= 0.5) usageScore = 100;
    else if (ratio <= 0.7) usageScore = 92;
    else if (ratio <= 0.85) usageScore = 82;
    else if (ratio <= 1.0) usageScore = 70;
    else if (ratio <= 1.15) usageScore = 52;
    else if (ratio <= 1.3) usageScore = 38;
    else if (ratio <= 1.5) usageScore = 22;
    else usageScore = 10;
  }

  // ── Budget Score (35% weight) ──────────────────────────
  const estimatedMonthlyBill = avgDailyUnits * 30 * tariff;
  const budgetPct = budget > 0 ? (estimatedMonthlyBill / budget) * 100 : 100;
  let budgetScore = 100;
  if (budgetPct <= 60) budgetScore = 100;
  else if (budgetPct <= 75) budgetScore = 88;
  else if (budgetPct <= 90) budgetScore = 72;
  else if (budgetPct <= 100) budgetScore = 60;
  else if (budgetPct <= 115) budgetScore = 40;
  else if (budgetPct <= 135) budgetScore = 22;
  else budgetScore = 10;

  // ── Consistency Score (20% weight) ────────────────────
  const consistencyScore = calcConsistency(dailyUnits);

  // ── Anomaly Score (15% weight) ────────────────────────
  const anomalyScore = Math.max(0, 100 - anomalyCount * 18);

  // ── Weighted Total ─────────────────────────────────────
  const score = Math.round(
    usageScore * 0.30 +
    budgetScore * 0.35 +
    consistencyScore * 0.20 +
    anomalyScore * 0.15
  );

  // ── Label & Color ──────────────────────────────────────
  let label: HealthScoreResult["label"];
  let color: string;
  if (score >= 85) { label = "Excellent"; color = "#059669"; }
  else if (score >= 70) { label = "Good"; color = "#0284C7"; }
  else if (score >= 55) { label = "Fair"; color = "#D97706"; }
  else if (score >= 35) { label = "Poor"; color = "#EA580C"; }
  else { label = "Critical"; color = "#DC2626"; }

  // ── Strengths & Improvements ───────────────────────────
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (usageScore >= 80) strengths.push("Your daily usage is well within the efficient range");
  else improvements.push("Reduce average daily consumption by running fewer heavy appliances simultaneously");

  if (budgetScore >= 80) strengths.push("Electricity spending is well within your monthly budget");
  else improvements.push("You're projected to exceed your monthly budget — reduce AC or geyser usage");

  if (consistencyScore >= 75) strengths.push("Consistent daily usage pattern — no sudden spikes");
  else improvements.push("Usage pattern is irregular — identify high-consumption days and reduce them");

  if (anomalyScore >= 80) strengths.push("No significant consumption anomalies detected");
  else improvements.push(`${anomalyCount} usage spike(s) detected — investigate abnormal days`);

  // ── Tip of the day ─────────────────────────────────────
  const tips = [
    "Set your AC to 24°C instead of 18°C — saves up to 6% per degree.",
    "Unplug chargers and set-top boxes when not in use to eliminate phantom load.",
    "Use washing machine only with full loads to save 30–40% per cycle.",
    "Switch to LED bulbs — they use 75% less power than incandescent.",
    "Run dishwashers and washing machines during off-peak hours (after 10 PM).",
    "Keep refrigerator coils clean — dirty coils increase power draw by 25%.",
    "Use ceiling fans instead of AC — fans use 75W vs 1500W for AC.",
  ];
  const tip = tips[new Date().getDay() % tips.length];

  return {
    score: Math.max(0, Math.min(100, score)),
    label,
    color,
    components: { usageScore, budgetScore, consistencyScore, anomalyScore },
    strengths,
    improvements,
    tip,
  };
}
