/**
 * Calculate electricity bill based on units and tariff
 * Uses Indian slab-based calculation as an option, or flat tariff
 */
export function calculateBill(units: number, tariffPerUnit: number): number {
  return parseFloat((units * tariffPerUnit).toFixed(2));
}

/**
 * Calculate electricity score (0-100) based on usage patterns
 * Higher score = more energy efficient
 */
export function calculateElectricityScore(
  avgDailyUnits: number,
  budget: number,
  tariff: number
): number {
  // Ideal daily budget in units
  const dailyBudgetUnits = budget / tariff / 30;

  if (avgDailyUnits <= 0) return 100;

  const ratio = avgDailyUnits / dailyBudgetUnits;

  if (ratio <= 0.5) return 100;
  if (ratio <= 0.7) return 90;
  if (ratio <= 0.85) return 80;
  if (ratio <= 1.0) return 70;
  if (ratio <= 1.15) return 55;
  if (ratio <= 1.3) return 40;
  if (ratio <= 1.5) return 25;
  return 10;
}

/**
 * Calculate estimated monthly bill from current usage
 * Extrapolates from current day to full month
 */
export function calculateEstimatedMonthlyBill(
  currentUnits: number,
  currentDay: number,
  totalDays: number,
  tariff: number
): number {
  if (currentDay === 0) return 0;
  const projectedUnits = (currentUnits / currentDay) * totalDays;
  return calculateBill(projectedUnits, tariff);
}

/**
 * Get Indian slab tariff calculation (MSEDCL example)
 * Slab rates vary by state — this is a generic example
 */
export function calculateSlabBill(units: number): number {
  if (units <= 100) return units * 3.95;
  if (units <= 300) return 100 * 3.95 + (units - 100) * 7.1;
  if (units <= 500) return 100 * 3.95 + 200 * 7.1 + (units - 300) * 9.95;
  return 100 * 3.95 + 200 * 7.1 + 200 * 9.95 + (units - 500) * 11.2;
}

export function calculateSlabBillWithBreakdown(units: number): {
  total: number;
  breakdown: { slab: string; units: number; rate: number; cost: number }[];
} {
  const breakdown: { slab: string; units: number; rate: number; cost: number }[] = [];
  let remaining = units;
  let total = 0;

  const tiers = [
    { label: "0 - 100 units", max: 100, rate: 3.95 },
    { label: "101 - 300 units", max: 200, rate: 7.10 },
    { label: "301 - 500 units", max: 200, rate: 9.95 },
    { label: "Above 500 units", max: Infinity, rate: 11.20 },
  ];

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const tierUnits = Math.min(remaining, tier.max);
    const cost = tierUnits * tier.rate;
    breakdown.push({
      slab: tier.label,
      units: parseFloat(tierUnits.toFixed(2)),
      rate: tier.rate,
      cost: parseFloat(cost.toFixed(2)),
    });
    total += cost;
    remaining -= tierUnits;
  }

  return { total: parseFloat(total.toFixed(2)), breakdown };
}

/**
 * Get budget status
 */
export function getBudgetStatus(
  usedAmount: number,
  budget: number
): "safe" | "warning" | "danger" {
  const percent = (usedAmount / budget) * 100;
  if (percent < 60) return "safe";
  if (percent < 85) return "warning";
  return "danger";
}

/**
 * Calculate percentage used
 */
export function calcPercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(100, parseFloat(((used / total) * 100).toFixed(1)));
}
