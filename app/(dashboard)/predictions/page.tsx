"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Zap, AlertTriangle, CheckCircle, Wallet, Target, ArrowRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart, Legend,
} from "recharts";
import Link from "next/link";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { predictMonthEnd } from "@/lib/ai/linear-regression";
import { detectAnomalies, getTrend } from "@/lib/ai/anomaly-detection";
import { generateRecommendations } from "@/lib/ai/recommendations";
import { formatCurrency, formatUnits } from "@/lib/utils/currency";
import { formatShortDate, formatIndianDate, getCurrentDayOfMonth, getDaysInCurrentMonth } from "@/lib/utils/date";
import { getBudgetCoachInsights } from "@/lib/ai/budget-coach";

function ConfidenceBar({ confidence }: { confidence: number }) {
  const color = confidence >= 70 ? "#059669" : confidence >= 40 ? "#D97706" : "#DC2626";
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5 font-semibold text-slate-700">
        <span>Prediction Confidence (R² Fit)</span>
        <span style={{ color }}>{confidence}%</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden bg-slate-200">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs mt-1.5 text-slate-500">
        {confidence >= 70
          ? "High confidence — consistent daily readings available"
          : confidence >= 40
          ? "Moderate confidence — more daily data improves model accuracy"
          : "Low confidence — add more daily entries for better regression"}
      </p>
    </div>
  );
}

export default function PredictionsPage() {
  const { dailyUnitsArray, startDate, totalUnits, usageData } = useUsage();
  const { tariff, budget, notificationLimit } = useSettings();

  const currentDay = getCurrentDayOfMonth();
  const totalDays = getDaysInCurrentMonth();

  const sortedUsage = useMemo(
    () => [...usageData].sort((a, b) => a.date.localeCompare(b.date)),
    [usageData]
  );

  const prediction = useMemo(() => {
    return predictMonthEnd(dailyUnitsArray, tariff, startDate);
  }, [dailyUnitsArray, tariff, startDate]);

  const anomalies = useMemo(() => detectAnomalies(sortedUsage), [sortedUsage]);
  const trend = useMemo(() => getTrend(dailyUnitsArray), [dailyUnitsArray]);

  const chartData = useMemo(() => {
    const data: any[] = [];
    sortedUsage.forEach((item, idx) => {
      data.push({
        day: `Day ${idx + 1}`,
        date: formatShortDate(item.date),
        actual: Number(item.units),
        predicted: null,
      });
    });

    if (sortedUsage.length > 0 && prediction.slope !== undefined) {
      const lastIdx = sortedUsage.length;
      for (let d = 1; d <= totalDays; d++) {
        const estUnits = Math.max(0, prediction.slope * d + prediction.intercept);
        if (d <= lastIdx) {
          data[d - 1].forecast = parseFloat(estUnits.toFixed(2));
        } else {
          data.push({
            day: `Day ${d}`,
            date: `Day ${d}`,
            actual: null,
            forecast: parseFloat(estUnits.toFixed(2)),
          });
        }
      }
    }
    return data;
  }, [sortedUsage, prediction, totalDays]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          AI Linear Regression Predictions 🤖
        </h1>
        <p className="text-sm text-slate-500">
          Ordinary Least Squares (OLS) forecasting & Z-score anomaly detection
        </p>
      </div>

      {/* Hero Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Projected Month-End Units</span>
            <p className="text-3xl font-extrabold text-slate-900 mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              {prediction.predictedUnits} <span className="text-base font-normal text-slate-500">kWh</span>
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Based on {sortedUsage.length} recorded days in current cycle
          </p>
        </div>

        <div className="rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold opacity-80 uppercase tracking-wider">Projected Month-End Bill</span>
            <p className="text-3xl font-extrabold mt-2" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatCurrency(prediction.predictedBill)}
            </p>
          </div>
          <p className="text-xs opacity-90 mt-4">
            {prediction.predictedBill > budget
              ? `⚠️ Exceeds budget by ${formatCurrency(prediction.predictedBill - budget)}`
              : `✅ On track — within ₹${budget.toLocaleString("en-IN")} limit`}
          </p>
        </div>

        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Model Confidence</span>
          <ConfidenceBar confidence={Math.round(prediction.confidence * 100)} />
        </div>
      </div>

      {/* Regression Chart */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">Actual vs. Linear Forecast Curve</h3>
            <p className="text-xs text-slate-500">
              Formula: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-emerald-700 font-semibold">y = {prediction.slope.toFixed(2)}x + {prediction.intercept.toFixed(2)}</code>
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block" /> Actual Readings
            </span>
            <span className="flex items-center gap-1.5 text-indigo-600">
              <span className="w-3 h-3 rounded-full bg-indigo-600 inline-block" /> Linear Forecast
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: "12px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  fontSize: "12px",
                }}
              />
              <Line
                type="monotone"
                dataKey="actual"
                name="Actual Units (kWh)"
                stroke="#059669"
                strokeWidth={3}
                dot={{ r: 4, fill: "#059669" }}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Linear Forecast"
                stroke="#4F46E5"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Anomaly Alerts */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Z-Score Anomaly Alerts</h3>
            <p className="text-xs text-slate-500">
              Flags consumption spikes with Z-Score &gt; 1.8 above normal standard deviation
            </p>
          </div>
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            anomalies.length > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-800"
          }`}>
            {anomalies.length} spikes detected
          </span>
        </div>

        {anomalies.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-slate-500 text-sm">
            ✅ No abnormal spikes detected. Your usage pattern is steady!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {anomalies.map((anom, i) => (
              <div key={i} className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-red-900">{formatIndianDate(anom.date)}</p>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-200 text-red-800 uppercase">
                      Spike ({anom.severity})
                    </span>
                  </div>
                  <p className="text-sm font-bold text-red-700 mt-1">{anom.units} kWh</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    Z-Score: {anom.zScore.toFixed(2)} ({anom.reason})
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── AI Budget Coach Panel ──────────────────────────────── */}
      {(() => {
        const coach = getBudgetCoachInsights(totalUnits, currentDay, totalDays, tariff, budget);
        const statusBg = coach.status === "safe" ? "bg-emerald-600" : coach.status === "caution" ? "bg-amber-500" : "bg-red-600";
        return (
          <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">AI Budget Coach</h3>
                <p className="text-xs text-slate-500">Personalised budget prediction & daily spending limit</p>
              </div>
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-white ${statusBg}`}>
                {coach.probabilityLabel}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500">Remaining Budget</p>
                <p className={`text-xl font-bold mt-0.5 ${coach.remainingBudget >= 0 ? "text-emerald-700" : "text-red-600"}`}
                  style={{ fontFamily: "Outfit, sans-serif" }}>
                  {coach.remainingBudget >= 0 ? formatCurrency(coach.remainingBudget, 0) : `-${formatCurrency(Math.abs(coach.remainingBudget), 0)}`}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500">Days Remaining</p>
                <p className="text-xl font-bold mt-0.5 text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {coach.daysRemaining} days
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500">Daily Limit Needed</p>
                <p className="text-xl font-bold mt-0.5 text-indigo-700" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {coach.dailyLimitUnits.toFixed(1)} kWh
                </p>
                <p className="text-[10px] text-slate-400">{formatCurrency(coach.dailyLimitRupees, 0)}/day</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-xs font-semibold text-slate-500">Your Current Rate</p>
                <p className="text-xl font-bold mt-0.5 text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {coach.currentDailyUnits.toFixed(1)} kWh
                </p>
                <p className="text-[10px] text-slate-400">{formatCurrency(coach.currentDailyRupees, 0)}/day</p>
              </div>
            </div>

            {/* Probability bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Probability of exceeding budget</span>
                <span style={{ color: coach.probabilityColor }}>{coach.probability}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: coach.probabilityColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${coach.probability}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-slate-600 font-medium">{coach.message}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">Tip: Use the Savings Simulator to model specific reductions</p>
              <Link
                href="/simulator"
                className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
              >
                Open Simulator <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
