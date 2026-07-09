/**
 * AI Insights Generator
 * Produces human-readable, context-aware energy insights.
 */

import type { ElectricityUsage } from "@/types";
import { calculateBill } from "@/lib/utils/bill";

export type InsightSeverity = "success" | "info" | "warning" | "danger";
export type InsightCategory = "trend" | "budget" | "behavior" | "environment" | "anomaly";

export interface AIInsight {
  id: string;
  category: InsightCategory;
  severity: InsightSeverity;
  title: string;
  body: string;
  icon: string; // lucide icon name
  actionLabel?: string;
  actionHref?: string;
}

function pct(a: number, b: number): number {
  if (b === 0) return 0;
  return parseFloat(((a / b - 1) * 100).toFixed(1));
}

/**
 * Generate AI insights from usage data
 */
export function generateAIInsights(
  usageData: ElectricityUsage[],
  tariff: number,
  budget: number
): AIInsight[] {
  const insights: AIInsight[] = [];
  const sorted = [...usageData].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length === 0) {
    insights.push({
      id: "no-data",
      category: "trend",
      severity: "info",
      title: "No Usage Data Yet",
      body: "Start adding your daily electricity readings to unlock personalised AI insights.",
      icon: "Zap",
      actionLabel: "Add Today's Reading",
      actionHref: "/usage",
    });
    return insights;
  }

  const totalUnits = sorted.reduce((s, u) => s + Number(u.units), 0);
  const avgDaily = totalUnits / sorted.length;
  const estimatedMonthlyBill = avgDaily * 30 * tariff;
  const budgetPct = budget > 0 ? (estimatedMonthlyBill / budget) * 100 : 0;

  // ── Trend: Compare recent 7 days vs. previous 7 days ──
  if (sorted.length >= 14) {
    const recent7 = sorted.slice(-7).reduce((s, u) => s + Number(u.units), 0) / 7;
    const prev7 = sorted.slice(-14, -7).reduce((s, u) => s + Number(u.units), 0) / 7;
    const change = pct(recent7, prev7);
    if (change > 10) {
      insights.push({
        id: "usage-up",
        category: "trend",
        severity: "warning",
        title: `Usage Up ${Math.abs(change).toFixed(0)}% vs Last Week`,
        body: `Your average daily consumption over the last 7 days is ${recent7.toFixed(1)} kWh, compared to ${prev7.toFixed(1)} kWh the week before. Consider reducing AC or geyser usage.`,
        icon: "TrendingUp",
        actionLabel: "See Simulator",
        actionHref: "/simulator",
      });
    } else if (change < -8) {
      insights.push({
        id: "usage-down",
        category: "trend",
        severity: "success",
        title: `Great! Usage Down ${Math.abs(change).toFixed(0)}% vs Last Week`,
        body: `Your average daily usage has dropped to ${recent7.toFixed(1)} kWh from ${prev7.toFixed(1)} kWh last week. Keep it up — you're saving money!`,
        icon: "TrendingDown",
      });
    }
  }

  // ── Trend: Compare month halves ──
  if (sorted.length >= 10) {
    const half = Math.floor(sorted.length / 2);
    const firstHalf = sorted.slice(0, half).reduce((s, u) => s + Number(u.units), 0) / half;
    const secondHalf = sorted.slice(half).reduce((s, u) => s + Number(u.units), 0) / (sorted.length - half);
    const changeHalf = pct(secondHalf, firstHalf);
    if (changeHalf > 15) {
      insights.push({
        id: "month-upward",
        category: "trend",
        severity: "warning",
        title: "Consumption Increasing This Month",
        body: `Usage in the second half of the month (${secondHalf.toFixed(1)} kWh/day) is ${Math.abs(changeHalf).toFixed(0)}% higher than the first half (${firstHalf.toFixed(1)} kWh/day). This pattern often indicates increased appliance use in warmer periods.`,
        icon: "BarChart3",
      });
    }
  }

  // ── Budget Insights ──
  if (budgetPct > 100) {
    const overBy = estimatedMonthlyBill - budget;
    insights.push({
      id: "budget-exceeded",
      category: "budget",
      severity: "danger",
      title: "Projected to Exceed Monthly Budget",
      body: `At your current rate you're on track to spend ₹${estimatedMonthlyBill.toFixed(0)}, which is ₹${overBy.toFixed(0)} over your ₹${budget.toLocaleString("en-IN")} budget. Reducing daily usage by ${((overBy / tariff) / 30).toFixed(1)} kWh/day can bring you back on track.`,
      icon: "AlertTriangle",
      actionLabel: "View Budget Coach",
      actionHref: "/predictions",
    });
  } else if (budgetPct > 80) {
    insights.push({
      id: "budget-warning",
      category: "budget",
      severity: "warning",
      title: "Approaching Monthly Budget Limit",
      body: `You've used ${budgetPct.toFixed(0)}% of your projected budget. Your estimated bill of ₹${estimatedMonthlyBill.toFixed(0)} is close to the ₹${budget.toLocaleString("en-IN")} limit. Keep an eye on daily usage.`,
      icon: "Wallet",
      actionLabel: "View Budget Coach",
      actionHref: "/predictions",
    });
  } else if (budgetPct < 60) {
    insights.push({
      id: "budget-safe",
      category: "budget",
      severity: "success",
      title: "Well Within Monthly Budget",
      body: `Your projected bill of ₹${estimatedMonthlyBill.toFixed(0)} is only ${budgetPct.toFixed(0)}% of your ₹${budget.toLocaleString("en-IN")} limit. You're saving ₹${(budget - estimatedMonthlyBill).toFixed(0)} this month!`,
      icon: "CheckCircle",
    });
  }

  // ── Behavioral: Peak vs Off-Peak ──
  if (sorted.length >= 5) {
    const weekdayUnits: number[] = [];
    const weekendUnits: number[] = [];
    sorted.forEach((u) => {
      const day = new Date(u.date).getDay();
      if (day === 0 || day === 6) weekendUnits.push(Number(u.units));
      else weekdayUnits.push(Number(u.units));
    });
    if (weekdayUnits.length >= 2 && weekendUnits.length >= 1) {
      const avgWeekday = weekdayUnits.reduce((a, b) => a + b, 0) / weekdayUnits.length;
      const avgWeekend = weekendUnits.reduce((a, b) => a + b, 0) / weekendUnits.length;
      if (avgWeekend > avgWeekday * 1.25) {
        insights.push({
          id: "weekend-spike",
          category: "behavior",
          severity: "info",
          title: "Weekend Usage is Significantly Higher",
          body: `Your weekend average is ${avgWeekend.toFixed(1)} kWh vs ${avgWeekday.toFixed(1)} kWh on weekdays — ${((avgWeekend / avgWeekday - 1) * 100).toFixed(0)}% more. This is common with AC, TV, and cooking appliances. Plan energy-intensive tasks during off-peak hours.`,
          icon: "Calendar",
        });
      }
    }
  }

  // ── Highest single-day spike ──
  if (sorted.length >= 5) {
    const max = sorted.reduce((m, u) => Number(u.units) > Number(m.units) ? u : m, sorted[0]);
    if (Number(max.units) > avgDaily * 1.5) {
      insights.push({
        id: "high-day",
        category: "anomaly",
        severity: "warning",
        title: `High Consumption on ${new Date(max.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
        body: `You consumed ${Number(max.units).toFixed(1)} kWh on this day — ${((Number(max.units) / avgDaily - 1) * 100).toFixed(0)}% above your daily average of ${avgDaily.toFixed(1)} kWh. Check if AC, geyser, or washing machine ran for extended hours.`,
        icon: "Flame",
      });
    }
  }

  // ── Environmental ──
  const monthlyCO2 = totalUnits > 0 ? parseFloat((avgDaily * 30 * 0.82).toFixed(1)) : 0;
  if (monthlyCO2 > 0) {
    insights.push({
      id: "carbon-info",
      category: "environment",
      severity: monthlyCO2 > 100 ? "warning" : "info",
      title: `Your Carbon Footprint: ~${monthlyCO2} kg CO₂/month`,
      body: `Based on India's grid emission factor of 0.82 kg CO₂/kWh, your electricity generates approximately ${monthlyCO2} kg of CO₂ per month. This equals ${Math.round(monthlyCO2 / 0.12)} km of car travel. ${monthlyCO2 > 100 ? "Consider adopting more energy-efficient habits to reduce your environmental impact." : "You're doing relatively well — keep monitoring!"}`,
      icon: "Leaf",
      actionLabel: "Sustainability Dashboard",
      actionHref: "/sustainability",
    });
  }

  // ── Consistency Check ──
  if (sorted.length >= 7) {
    const units = sorted.map((u) => Number(u.units));
    const mean = units.reduce((a, b) => a + b, 0) / units.length;
    const stdDev = Math.sqrt(units.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / units.length);
    if (stdDev < mean * 0.15 && mean > 0) {
      insights.push({
        id: "consistent",
        category: "behavior",
        severity: "success",
        title: "Very Consistent Energy Usage Pattern",
        body: `Your daily readings show low variation (std dev: ${stdDev.toFixed(1)} kWh). Consistent usage makes it easier to budget and plan. This is a great sign of disciplined energy habits.`,
        icon: "Activity",
      });
    }
  }

  return insights.slice(0, 8);
}
