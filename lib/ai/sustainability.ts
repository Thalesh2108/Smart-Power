/**
 * Sustainability Engine
 * Calculates CO₂ emissions, green score, tree equivalents,
 * and monthly environmental impact for Indian households.
 */

// India's average grid emission factor (CEA 2023): ~0.82 kg CO₂ per kWh
export const INDIA_GRID_EMISSION_FACTOR = 0.82;

// Average CO₂ absorbed per tree per year in India: ~21.7 kg
export const KG_CO2_PER_TREE_PER_YEAR = 21.7;

export interface SustainabilityReport {
  co2Kg: number;                // kg CO₂ this month
  co2Annual: number;            // projected annual kg CO₂
  greenScore: number;           // 0-100
  greenLabel: string;
  greenColor: string;
  treesRequired: number;        // trees needed to offset monthly CO₂
  treesAnnual: number;          // trees needed to offset annual CO₂
  carKmEquivalent: number;      // equivalent km driven by car
  smartphoneCharges: number;    // equivalent smartphone charges
  coalKg: number;               // equivalent kg of coal burned
  savingsOpportunity: {
    units: number;
    co2Saved: number;
    description: string;
  };
}

/**
 * Calculate CO₂ emissions from electricity units
 */
export function calculateCO2(units: number): number {
  return parseFloat((units * INDIA_GRID_EMISSION_FACTOR).toFixed(2));
}

/**
 * Calculate trees needed to offset given kg CO₂ for one month
 */
export function calculateTreeEquivalent(co2Kg: number): number {
  // Trees produce 21.7 kg/year → 1.81 kg/month
  const co2PerTreePerMonth = KG_CO2_PER_TREE_PER_YEAR / 12;
  return Math.ceil(co2Kg / co2PerTreePerMonth);
}

/**
 * Calculate Green Score (0-100)
 * Based on kWh/month vs Indian household average (150 kWh/month)
 */
export function calculateGreenScore(monthlyUnits: number): number {
  // Indian household average: ~100-150 kWh/month
  const reference = 150;
  if (monthlyUnits <= 50) return 100;
  if (monthlyUnits <= 80) return 92;
  if (monthlyUnits <= 100) return 82;
  if (monthlyUnits <= 130) return 70;
  if (monthlyUnits <= 160) return 58;
  if (monthlyUnits <= 200) return 42;
  if (monthlyUnits <= 250) return 28;
  return Math.max(5, Math.round(100 - (monthlyUnits / reference) * 40));
}

/**
 * Get Green Score label and color
 */
export function getGreenLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Eco Champion 🌿", color: "#059669" };
  if (score >= 65) return { label: "Green Household 🌱", color: "#0284C7" };
  if (score >= 50) return { label: "Average Impact 🌤", color: "#D97706" };
  if (score >= 35) return { label: "High Footprint ⚠️", color: "#EA580C" };
  return { label: "Critical Footprint 🔴", color: "#DC2626" };
}

/**
 * Full sustainability report for a month
 */
export function getMonthlyEnvironmentalImpact(
  monthlyUnits: number,
  tariff: number,
  budget: number
): SustainabilityReport {
  const co2Kg = calculateCO2(monthlyUnits);
  const co2Annual = parseFloat((co2Kg * 12).toFixed(2));
  const greenScore = calculateGreenScore(monthlyUnits);
  const { label: greenLabel, color: greenColor } = getGreenLabel(greenScore);

  // Trees needed (monthly)
  const treesRequired = calculateTreeEquivalent(co2Kg);
  const treesAnnual = calculateTreeEquivalent(co2Annual);

  // Car km: average Indian car emits ~0.12 kg CO₂/km
  const carKmEquivalent = Math.round(co2Kg / 0.12);

  // Smartphone charges: ~8.2 Wh per full charge → 0.0082 kWh
  const smartphoneCharges = Math.round(monthlyUnits / 0.0082);

  // Coal: 1 kg coal ≈ 2.86 kWh electrical energy equivalent
  const coalKg = parseFloat((monthlyUnits / 2.86).toFixed(1));

  // Savings opportunity: if user reduced 15% of units
  const potentialSavingUnits = parseFloat((monthlyUnits * 0.15).toFixed(2));
  const co2Saved = calculateCO2(potentialSavingUnits);

  return {
    co2Kg,
    co2Annual,
    greenScore,
    greenLabel,
    greenColor,
    treesRequired,
    treesAnnual,
    carKmEquivalent,
    smartphoneCharges,
    coalKg,
    savingsOpportunity: {
      units: potentialSavingUnits,
      co2Saved,
      description: `Reducing usage by 15% could save ${potentialSavingUnits.toFixed(1)} kWh and ${co2Saved.toFixed(1)} kg CO₂ this month`,
    },
  };
}
