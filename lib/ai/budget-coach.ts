/**
 * AI Budget Coach Engine
 * Predicts budget overrun probability and recommends daily limits.
 */

export interface BudgetCoachResult {
  remainingBudget: number;
  daysRemaining: number;
  projectedBill: number;
  probability: number;         // 0-100: probability of exceeding budget
  probabilityLabel: string;
  probabilityColor: string;
  dailyLimitUnits: number;     // units/day to stay within budget
  dailyLimitRupees: number;    // ₹/day to stay within budget
  currentDailyRupees: number;  // current ₹/day spend rate
  currentDailyUnits: number;   // current kWh/day
  status: "safe" | "caution" | "danger";
  message: string;
}

/**
 * Predict budget coach insights
 */
export function getBudgetCoachInsights(
  totalUnits: number,
  currentDay: number,
  totalDays: number,
  tariff: number,
  budget: number
): BudgetCoachResult {
  if (currentDay === 0 || budget === 0) {
    return {
      remainingBudget: budget,
      daysRemaining: totalDays,
      projectedBill: 0,
      probability: 5,
      probabilityLabel: "Very Low",
      probabilityColor: "#059669",
      dailyLimitUnits: budget / tariff / totalDays,
      dailyLimitRupees: budget / totalDays,
      currentDailyRupees: 0,
      currentDailyUnits: 0,
      status: "safe",
      message: "Add daily readings to unlock budget coach predictions.",
    };
  }

  const currentDailyUnits = totalUnits / currentDay;
  const currentDailyRupees = currentDailyUnits * tariff;
  const daysRemaining = Math.max(0, totalDays - currentDay);

  // Projected bill using linear extrapolation
  const projectedBill = parseFloat((currentDailyUnits * totalDays * tariff).toFixed(2));
  const remainingBudget = parseFloat((budget - projectedBill).toFixed(2));

  // Daily limit needed to stay within budget
  const billSoFar = totalUnits * tariff;
  const budgetLeft = budget - billSoFar;
  const dailyLimitRupees = daysRemaining > 0 ? budgetLeft / daysRemaining : 0;
  const dailyLimitUnits = tariff > 0 ? dailyLimitRupees / tariff : 0;

  // Probability calculation
  const overshootRatio = projectedBill / budget;
  let probability: number;
  if (overshootRatio <= 0.7) probability = 5;
  else if (overshootRatio <= 0.85) probability = 15;
  else if (overshootRatio <= 0.95) probability = 35;
  else if (overshootRatio <= 1.0) probability = 55;
  else if (overshootRatio <= 1.10) probability = 72;
  else if (overshootRatio <= 1.25) probability = 87;
  else probability = 97;

  // Adjust for data confidence (fewer days = less certain)
  const dataFactor = Math.min(1, currentDay / 15);
  probability = Math.round(probability * (0.4 + 0.6 * dataFactor));

  let probabilityLabel: string;
  let probabilityColor: string;
  let status: BudgetCoachResult["status"];

  if (probability < 25) {
    probabilityLabel = "Low Risk";
    probabilityColor = "#059669";
    status = "safe";
  } else if (probability < 55) {
    probabilityLabel = "Moderate Risk";
    probabilityColor = "#D97706";
    status = "caution";
  } else if (probability < 75) {
    probabilityLabel = "High Risk";
    probabilityColor = "#EA580C";
    status = "danger";
  } else {
    probabilityLabel = "Very High Risk";
    probabilityColor = "#DC2626";
    status = "danger";
  }

  let message: string;
  if (status === "safe") {
    message = `You're on track! Stick to ₹${dailyLimitRupees.toFixed(0)}/day for the remaining ${daysRemaining} days.`;
  } else if (status === "caution") {
    message = `Caution — reduce to ${dailyLimitUnits.toFixed(1)} kWh/day to stay within your ₹${budget.toLocaleString("en-IN")} budget.`;
  } else {
    const excess = Math.max(0, projectedBill - budget);
    message = `Budget overrun likely by ₹${excess.toFixed(0)}. Cut AC by 2 hrs/day to stay within budget.`;
  }

  return {
    remainingBudget,
    daysRemaining,
    projectedBill,
    probability,
    probabilityLabel,
    probabilityColor,
    dailyLimitUnits: parseFloat(dailyLimitUnits.toFixed(2)),
    dailyLimitRupees: parseFloat(dailyLimitRupees.toFixed(2)),
    currentDailyRupees: parseFloat(currentDailyRupees.toFixed(2)),
    currentDailyUnits: parseFloat(currentDailyUnits.toFixed(2)),
    status,
    message,
  };
}
