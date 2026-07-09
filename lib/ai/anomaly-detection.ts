import { AnomalyResult } from "@/types";

export interface DetectedAnomaly {
  date: string;
  units: number;
  zScore: number;
  severity: "low" | "medium" | "high";
  reason: string;
}

/**
 * Rule-based + Z-Score anomaly detection for electricity usage
 */
export function detectAnomalies(
  data: any[],
  notificationLimit: number = 15
): DetectedAnomaly[] {
  if (!Array.isArray(data) || data.length < 3) {
    return [];
  }

  // Check if data items are objects with date/units or numbers
  const records = data.map((item, idx) => {
    if (typeof item === "object" && item !== null) {
      return {
        date: item.date || `Day ${idx + 1}`,
        units: Number(item.units) || 0,
      };
    }
    return {
      date: `Day ${idx + 1}`,
      units: Number(item) || 0,
    };
  });

  const unitsArray = records.map((r) => r.units);
  const n = unitsArray.length;
  const mean = unitsArray.reduce((a, b) => a + b, 0) / n;
  const variance =
    unitsArray.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const anomalies: DetectedAnomaly[] = [];

  records.forEach((record) => {
    const z = (record.units - mean) / stdDev;
    if (z > 1.6 || record.units > notificationLimit) {
      let severity: "low" | "medium" | "high" = "low";
      if (z > 2.5 || record.units > notificationLimit * 1.5) {
        severity = "high";
      } else if (z > 1.8 || record.units > notificationLimit) {
        severity = "medium";
      }

      anomalies.push({
        date: record.date,
        units: parseFloat(record.units.toFixed(2)),
        zScore: parseFloat(z.toFixed(2)),
        severity,
        reason: record.units > notificationLimit
          ? `Exceeded limit of ${notificationLimit} kWh`
          : `Z-Score spike (+${z.toFixed(1)}σ above average)`,
      });
    }
  });

  return anomalies.reverse();
}

/**
 * Calculate trend direction
 */
export function getTrend(
  data: number[]
): "increasing" | "decreasing" | "stable" {
  if (data.length < 4) return "stable";
  const recent = data.slice(-3);
  const older = data.slice(-6, -3);
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  const diff = ((recentAvg - olderAvg) / olderAvg) * 100;
  if (diff > 10) return "increasing";
  if (diff < -10) return "decreasing";
  return "stable";
}
