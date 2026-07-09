/**
 * Smart Challenges Engine
 * Gamified energy-saving challenges with progress tracking.
 * Progress is stored in localStorage for persistence.
 */

import type { ElectricityUsage } from "@/types";

export type ChallengeStatus = "locked" | "active" | "completed" | "failed";
export type ChallengeDifficulty = "easy" | "medium" | "hard";

export interface SmartChallenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: ChallengeDifficulty;
  reward: string;
  badgeColor: string;
  target: number;     // numeric target
  unit: string;       // display unit
  type: "reduce_units" | "stay_under_budget" | "streak" | "reduce_pct";
  durationDays: number;
}

export interface ChallengeProgress {
  challengeId: string;
  status: ChallengeStatus;
  currentValue: number;
  targetValue: number;
  progressPct: number;
  startedAt?: string;
  completedAt?: string;
  badgeEarned?: string;
}

export const ALL_CHALLENGES: SmartChallenge[] = [
  {
    id: "save-10-units",
    title: "Save 10 Units This Week",
    description: "Reduce your weekly consumption below 70 kWh by cutting back on AC and standby devices.",
    icon: "Zap",
    difficulty: "easy",
    reward: "⚡ Energy Saver Badge",
    badgeColor: "#059669",
    target: 10,
    unit: "kWh saved",
    type: "reduce_units",
    durationDays: 7,
  },
  {
    id: "budget-hero",
    title: "Stay Below ₹2,500 This Month",
    description: "Keep your monthly electricity spend under ₹2,500 for the entire month.",
    icon: "Wallet",
    difficulty: "medium",
    reward: "💰 Budget Hero Badge",
    badgeColor: "#D97706",
    target: 2500,
    unit: "₹ limit",
    type: "stay_under_budget",
    durationDays: 30,
  },
  {
    id: "reduce-15pct",
    title: "Reduce Usage by 15%",
    description: "Cut your average daily consumption by 15% compared to last month's baseline.",
    icon: "TrendingDown",
    difficulty: "hard",
    reward: "🏆 Green Champion Badge",
    badgeColor: "#4F46E5",
    target: 15,
    unit: "% reduction",
    type: "reduce_pct",
    durationDays: 30,
  },
  {
    id: "streak-7",
    title: "7-Day Energy Saving Streak",
    description: "Stay below your daily limit for 7 consecutive days without a single day over the limit.",
    icon: "Flame",
    difficulty: "medium",
    reward: "🔥 Streak Master Badge",
    badgeColor: "#EA580C",
    target: 7,
    unit: "days streak",
    type: "streak",
    durationDays: 7,
  },
  {
    id: "weekend-warrior",
    title: "Weekend Eco Mode",
    description: "Keep weekend usage below your weekday average for 4 consecutive weekends.",
    icon: "Sun",
    difficulty: "hard",
    reward: "🌞 Weekend Warrior Badge",
    badgeColor: "#0284C7",
    target: 4,
    unit: "weekends",
    type: "streak",
    durationDays: 28,
  },
  {
    id: "led-upgrade",
    title: "LED Upgrade Challenge",
    description: "Demonstrate a 10% reduction in nightly consumption by switching to LED bulbs.",
    icon: "Lightbulb",
    difficulty: "easy",
    reward: "💡 Bright Saver Badge",
    badgeColor: "#7C3AED",
    target: 10,
    unit: "% reduction",
    type: "reduce_pct",
    durationDays: 14,
  },
];

const STORAGE_KEY = "smartpower_challenges";

interface StoredChallengeData {
  accepted: string[];
  completed: string[];
  streaks: Record<string, number>;
  lastUpdated: string;
}

function getStoredData(): StoredChallengeData {
  if (typeof window === "undefined") {
    return { accepted: [], completed: [], streaks: {}, lastUpdated: new Date().toISOString() };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { accepted: [], completed: [], streaks: {}, lastUpdated: new Date().toISOString() };
  } catch {
    return { accepted: [], completed: [], streaks: {}, lastUpdated: new Date().toISOString() };
  }
}

function saveStoredData(data: StoredChallengeData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function acceptChallenge(challengeId: string): void {
  const data = getStoredData();
  if (!data.accepted.includes(challengeId)) {
    data.accepted.push(challengeId);
    saveStoredData(data);
  }
}

export function completeChallenge(challengeId: string): void {
  const data = getStoredData();
  if (!data.completed.includes(challengeId)) {
    data.completed.push(challengeId);
    saveStoredData(data);
  }
}

/**
 * Evaluate challenge progress from real usage data
 */
export function evaluateChallenges(
  usageData: ElectricityUsage[],
  tariff: number,
  budget: number,
  avgBaseline?: number // previous month avg
): ChallengeProgress[] {
  const stored = getStoredData();
  const sorted = [...usageData].sort((a, b) => a.date.localeCompare(b.date));
  const totalUnits = sorted.reduce((s, u) => s + Number(u.units), 0);
  const avgDaily = sorted.length > 0 ? totalUnits / sorted.length : 0;
  const projectedMonthly = avgDaily * 30;
  const projectedBill = projectedMonthly * tariff;

  // Streak: consecutive days below limit
  const dailyLimit = budget / tariff / 30;
  let streak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (Number(sorted[i].units) <= dailyLimit * 1.05) streak++;
    else break;
  }

  return ALL_CHALLENGES.map((ch): ChallengeProgress => {
    const isAccepted = stored.accepted.includes(ch.id);
    const isCompleted = stored.completed.includes(ch.id);

    let currentValue = 0;
    let progressPct = 0;

    switch (ch.type) {
      case "reduce_units": {
        // How many units below average × days
        const baseline = avgBaseline ?? avgDaily * 1.1;
        const saved = Math.max(0, (baseline - avgDaily) * 7);
        currentValue = parseFloat(saved.toFixed(1));
        progressPct = Math.min(100, (currentValue / ch.target) * 100);
        if (currentValue >= ch.target && isAccepted) completeChallenge(ch.id);
        break;
      }
      case "stay_under_budget": {
        currentValue = parseFloat(projectedBill.toFixed(0));
        progressPct = Math.max(0, Math.min(100, ((ch.target - currentValue) / ch.target) * 100 + 50));
        if (projectedBill <= ch.target && sorted.length >= 20 && isAccepted) completeChallenge(ch.id);
        break;
      }
      case "reduce_pct": {
        const baseline = avgBaseline ?? avgDaily * 1.15;
        const reductionPct = baseline > 0 ? ((baseline - avgDaily) / baseline) * 100 : 0;
        currentValue = parseFloat(Math.max(0, reductionPct).toFixed(1));
        progressPct = Math.min(100, (currentValue / ch.target) * 100);
        if (currentValue >= ch.target && isAccepted) completeChallenge(ch.id);
        break;
      }
      case "streak": {
        currentValue = streak;
        progressPct = Math.min(100, (streak / ch.target) * 100);
        if (streak >= ch.target && isAccepted) completeChallenge(ch.id);
        break;
      }
    }

    const nowCompleted = stored.completed.includes(ch.id);
    const status: ChallengeStatus = nowCompleted
      ? "completed"
      : isAccepted
      ? "active"
      : "locked";

    return {
      challengeId: ch.id,
      status,
      currentValue,
      targetValue: ch.target,
      progressPct: parseFloat(progressPct.toFixed(1)),
      badgeEarned: nowCompleted ? ch.reward : undefined,
    };
  });
}

export function getAcceptedChallengeIds(): string[] {
  return getStoredData().accepted;
}

export function getCompletedChallengeIds(): string[] {
  return getStoredData().completed;
}
