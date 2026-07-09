import { Recommendation } from "@/types";
import { getTrend } from "./anomaly-detection";

const ALL_RECOMMENDATIONS: Recommendation[] = [
  {
    id: "ac-usage",
    category: "appliance",
    title: "Reduce AC Usage",
    description:
      "Set your AC to 24°C instead of 18°C. Each degree lower increases energy consumption by 6%. Use fan mode at night.",
    potential_saving: "Save ₹150–₹400/month",
    icon: "AirVent",
    priority: "high",
  },
  {
    id: "led-bulbs",
    category: "appliance",
    title: "Switch to LED Bulbs",
    description:
      "Replace incandescent bulbs with LED bulbs. LEDs use 75% less energy and last 25x longer.",
    potential_saving: "Save ₹80–₹200/month",
    icon: "Lightbulb",
    priority: "high",
  },
  {
    id: "standby-power",
    category: "habit",
    title: "Avoid Standby Power",
    description:
      "Unplug TVs, chargers, and set-top boxes when not in use. Standby mode wastes 10% of your electricity.",
    potential_saving: "Save ₹50–₹120/month",
    icon: "Power",
    priority: "medium",
  },
  {
    id: "washing-machine",
    category: "habit",
    title: "Run Full Loads",
    description:
      "Always run your washing machine with a full load. Use cold water cycles to save heating energy.",
    potential_saving: "Save ₹40–₹100/month",
    icon: "Waves",
    priority: "medium",
  },
  {
    id: "energy-efficient",
    category: "appliance",
    title: "Use 5-Star Rated Appliances",
    description:
      "When replacing appliances, choose BEE 5-star rated ones. A 5-star AC uses 30% less electricity than a 1-star model.",
    potential_saving: "Save ₹200–₹600/month",
    icon: "Star",
    priority: "high",
  },
  {
    id: "natural-light",
    category: "habit",
    title: "Maximize Natural Light",
    description:
      "Open curtains during the day to reduce artificial lighting needs. Use light-colored walls to reflect light.",
    potential_saving: "Save ₹30–₹80/month",
    icon: "Sun",
    priority: "low",
  },
  {
    id: "solar-water",
    category: "appliance",
    title: "Install Solar Water Heater",
    description:
      "A solar water heater can save up to 1500 units/year and significantly reduce your electricity bill.",
    potential_saving: "Save ₹300–₹900/month",
    icon: "Zap",
    priority: "medium",
  },
  {
    id: "peak-hours",
    category: "billing",
    title: "Avoid Peak Hour Usage",
    description:
      "In many states, electricity costs more during 6–10 PM peak hours. Schedule heavy appliances like geysers outside peak hours.",
    potential_saving: "Save ₹60–₹150/month",
    icon: "Clock",
    priority: "medium",
  },
  {
    id: "refrigerator",
    category: "appliance",
    title: "Optimize Refrigerator Usage",
    description:
      "Keep your refrigerator at 35–38°F. Clean coils every 6 months. Don't place hot food directly in the fridge.",
    potential_saving: "Save ₹40–₹90/month",
    icon: "Thermometer",
    priority: "low",
  },
  {
    id: "ceiling-fan",
    category: "habit",
    title: "Use Ceiling Fans Over AC",
    description:
      "Ceiling fans use just 75W vs 1500W for an AC. In moderate weather, fans are more energy-efficient.",
    potential_saving: "Save ₹120–₹300/month",
    icon: "Wind",
    priority: "high",
  },
  {
    id: "power-strip",
    category: "habit",
    title: "Use Smart Power Strips",
    description:
      "Use power strips with switches to easily turn off multiple devices at once and eliminate phantom loads.",
    potential_saving: "Save ₹30–₹70/month",
    icon: "PlugZap",
    priority: "low",
  },
  {
    id: "night-budget",
    category: "billing",
    title: "Set a Daily Unit Budget",
    description:
      "Track your daily usage goal. Keeping to ₹83/day ensures you stay within a ₹2500/month budget at ₹7/unit.",
    potential_saving: "Stay within budget",
    icon: "Target",
    priority: "high",
  },
];

/**
 * Generate context-aware recommendations based on usage patterns
 */
export function generateRecommendations(
  dataOrUnits: any,
  arg2?: number,
  arg3?: number,
  arg4?: number,
  arg5?: number
): Recommendation[] {
  let dailyUnits: number[] = [];
  if (Array.isArray(dataOrUnits)) {
    dailyUnits = dataOrUnits.map((item) =>
      typeof item === "object" && item !== null ? Number(item.units) || 0 : Number(item) || 0
    );
  }

  const avgDailyUnits =
    dailyUnits.length > 0
      ? dailyUnits.reduce((a, b) => a + b, 0) / dailyUnits.length
      : 10;
  const budget = arg3 || arg2 || 2500;
  const tariff = arg4 || arg3 || 7;
  const estimatedBill = arg5 || arg4 || avgDailyUnits * 30 * tariff;

  const recommendations: Recommendation[] = [];
  const trend = getTrend(dailyUnits);
  const budgetUsed = (estimatedBill / budget) * 100;
  const dailyBudgetUnits = budget / tariff / 30;

  // Always include high-priority ones if over budget
  if (budgetUsed > 80) {
    const highPriority = ALL_RECOMMENDATIONS.filter(
      (r) => r.priority === "high"
    );
    recommendations.push(...highPriority.slice(0, 3));
  }

  // Trending up — push reduction tips
  if (trend === "increasing") {
    const r = ALL_RECOMMENDATIONS.find((r) => r.id === "ac-usage");
    if (r && !recommendations.find((x) => x.id === r.id))
      recommendations.push(r);
    const r2 = ALL_RECOMMENDATIONS.find((r) => r.id === "ceiling-fan");
    if (r2 && !recommendations.find((x) => x.id === r2.id))
      recommendations.push(r2);
  }

  // High daily usage
  if (avgDailyUnits > dailyBudgetUnits * 1.2) {
    const r = ALL_RECOMMENDATIONS.find((r) => r.id === "standby-power");
    if (r && !recommendations.find((x) => x.id === r.id))
      recommendations.push(r);
  }

  // Fill with medium + low priority to reach 6 recommendations
  for (const rec of ALL_RECOMMENDATIONS) {
    if (recommendations.length >= 6) break;
    if (!recommendations.find((x) => x.id === rec.id)) {
      recommendations.push(rec);
    }
  }

  return recommendations.slice(0, 6);
}
