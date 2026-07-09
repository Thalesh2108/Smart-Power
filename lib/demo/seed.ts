"use client";

import type { ElectricityUsage, UserSettings } from "@/types";
import { getTodayISO } from "@/lib/utils/date";

export const DEMO_SETTINGS: UserSettings = {
  id: "demo-user-1",
  user_id: "demo-user-1",
  full_name: "Aarav Sharma (Demo Account)",
  tariff_per_unit: 8.5, // INR per unit
  monthly_budget: 3000, // INR
  notification_limit: 15,
  dark_mode: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function getDemoUsageData(): ElectricityUsage[] {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const currentDay = Math.max(today.getDate(), 12); // ensure at least 12 days of realistic data

  const records: ElectricityUsage[] = [];

  // Base consumption around 9.5 kWh with slight trend and variation
  for (let d = 1; d <= currentDay; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    // Simulate typical Indian household usage (AC on weekends or hot days)
    let units = 8.2 + (d * 0.12) + ((d % 7 === 0 || d % 7 === 6) ? 3.5 : 0) + (Math.sin(d) * 1.2);
    // Add one anomaly day around day 8 to trigger Z-score detection alert
    if (d === 8) {
      units = 18.4;
    }
    records.push({
      id: `demo-usage-${d}`,
      user_id: "demo-user-1",
      date: dateStr,
      units: parseFloat(units.toFixed(3)),
      notes: d === 8 ? "AC run all night + Washing machine" : ((d % 7 === 0) ? "Weekend family gathering" : "Regular usage"),
      created_at: new Date(year, month, d).toISOString(),
      updated_at: new Date(year, month, d).toISOString(),
    });
  }

  return records.reverse(); // newest first
}

export function initializeDemoMode(): void {
  if (typeof window === "undefined") return;

  // Set cookie for Next.js proxy
  document.cookie = "smartpower_demo_session=true; path=/; max-age=604800";
  localStorage.setItem("smartpower_demo_active", "true");

  // Seed demo settings if not already present
  if (!localStorage.getItem("smartpower_demo_settings")) {
    localStorage.setItem("smartpower_demo_settings", JSON.stringify(DEMO_SETTINGS));
  }

  // Seed demo usage data if not already present
  if (!localStorage.getItem("smartpower_demo_usage")) {
    localStorage.setItem("smartpower_demo_usage", JSON.stringify(getDemoUsageData()));
  }
}

export function isDemoActive(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("smartpower_demo_active") === "true";
}

export function clearDemoMode(): void {
  if (typeof window === "undefined") return;
  document.cookie = "smartpower_demo_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  localStorage.removeItem("smartpower_demo_active");
}
