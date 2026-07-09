"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap, TrendingUp, TrendingDown, Wallet, Target,
  AlertTriangle, Activity, Calendar, ArrowRight, Star, Heart, Leaf, Lightbulb
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { predictMonthEnd } from "@/lib/ai/linear-regression";
import { detectAnomalies } from "@/lib/ai/anomaly-detection";
import { generateRecommendations } from "@/lib/ai/recommendations";
import { formatCurrency, formatUnits } from "@/lib/utils/currency";
import { formatIndianDate, formatShortDate, getCurrentDayOfMonth, getDaysInCurrentMonth } from "@/lib/utils/date";
import { calculateBill, calculateElectricityScore, calcPercentage } from "@/lib/utils/bill";
import { calculateHealthScore } from "@/lib/ai/health-score";
import { calculateCO2 } from "@/lib/ai/sustainability";
import React from "react";

// ─── Stat Card ───────────────────────────────────────────────
function StatCard({
  title, value, subtitle, icon: Icon, color, trend, delay = 0
}: {
  title: string; value: string; subtitle?: string;
  icon: React.ElementType; color: string; trend?: "up" | "down" | "neutral"; delay?: number;
}) {
  return (
    <motion.div
      className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm relative overflow-hidden"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
            style={{
              background: trend === "up" ? "rgba(239, 68, 68, 0.1)" : trend === "down" ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.1)",
              color: trend === "up" ? "#DC2626" : trend === "down" ? "#059669" : "#64748B",
            }}>
            {trend === "up" ? <TrendingUp size={13} /> : trend === "down" ? <TrendingDown size={13} /> : null}
          </div>
        )}
      </div>
      <p className="text-xs font-semibold text-slate-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

// ─── Budget Ring ──────────────────────────────────────────────
function BudgetRing({ used, total }: { used: number; total: number }) {
  const pct = Math.min(100, calcPercentage(used, total));
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct < 60 ? "#059669" : pct < 85 ? "#D97706" : "#DC2626";

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle cx="72" cy="72" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <circle
            cx="72" cy="72" r={r} fill="none"
            stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - dash}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            {pct}%
          </span>
          <span className="text-[11px] font-semibold text-slate-500">Used</span>
        </div>
      </div>
    </div>
  );
}

// ─── Electricity Score Ring ───────────────────────────────────
function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 80 ? "#059669" : score >= 60 ? "#0284C7" : score >= 40 ? "#D97706" : "#DC2626";

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle cx="72" cy="72" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <circle
            cx="72" cy="72" r={r} fill="none"
            stroke={color}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ - dash}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            {score}
          </span>
          <span className="text-[11px] font-semibold text-slate-500">Score</span>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { usageData, isLoading, totalUnits, avgDailyUnits, dailyUnitsArray, startDate } = useUsage();
  const { tariff, budget } = useSettings();

  const currentDay = getCurrentDayOfMonth();
  const totalDays = getDaysInCurrentMonth();

  // Sort chronological for charts
  const sortedUsage = useMemo(
    () => [...usageData].sort((a, b) => a.date.localeCompare(b.date)),
    [usageData]
  );

  // Today's usage
  const todayUnits = useMemo(() => {
    if (usageData.length === 0) return 0;
    return Number(usageData[0].units);
  }, [usageData]);

  // AI Prediction
  const prediction = useMemo(
    () => predictMonthEnd(dailyUnitsArray, tariff, startDate),
    [dailyUnitsArray, tariff, startDate]
  );

  // Estimated Bill so far
  const estimatedBillSoFar = useMemo(
    () => calculateBill(totalUnits, tariff),
    [totalUnits, tariff]
  );

  // Anomalies
  const anomalies = useMemo(
    () => detectAnomalies(sortedUsage),
    [sortedUsage]
  );

  // Score
  const score = useMemo(
    () => calculateElectricityScore(avgDailyUnits, calcPercentage(prediction.predictedBill, budget), anomalies.length),
    [avgDailyUnits, prediction.predictedBill, budget, anomalies.length]
  );

  // Recommendations
  const recommendations = useMemo(
    () => generateRecommendations(usageData, budget, tariff, score),
    [usageData, budget, tariff, score]
  );

  // Chart data
  const chartData = useMemo(() => {
    return sortedUsage.map((item) => ({
      date: formatShortDate(item.date),
      units: Number(item.units),
    }));
  }, [sortedUsage]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading SmartPower Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Electricity Overview 👋
          </h1>
          <p className="text-sm text-slate-500">
            Day {currentDay} of {totalDays} • Indian Household Consumption Monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/usage"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-all"
          >
            <Zap size={15} fill="currentColor" /> Add Today&apos;s Reading
          </Link>
          <Link
            href="/calculator"
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all"
          >
            Bill Calculator
          </Link>
        </div>
      </div>

      {/* 4 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Usage"
          value={formatUnits(todayUnits)}
          subtitle="Latest recorded day"
          icon={Zap}
          color="#059669"
          delay={0.05}
        />
        <StatCard
          title="Month Total Units"
          value={formatUnits(totalUnits)}
          subtitle={`${usageData.length} days recorded`}
          icon={Activity}
          color="#0284C7"
          delay={0.1}
        />
        <StatCard
          title="Current Bill Accrued"
          value={formatCurrency(estimatedBillSoFar)}
          subtitle={`At ₹${tariff}/unit tariff`}
          icon={Wallet}
          color="#D97706"
          delay={0.15}
        />
        <StatCard
          title="AI Predicted Bill"
          value={formatCurrency(prediction.predictedBill)}
          subtitle={`Forecast: ${prediction.predictedUnits} kWh`}
          icon={Target}
          color="#4F46E5"
          trend={prediction.predictedBill > budget ? "up" : "down"}
          delay={0.2}
        />
      </div>

      {/* ─── NEW: 5 AI Enhancement Cards ─────────────────────────────── */}
      {(() => {
        const co2Monthly = calculateCO2(avgDailyUnits * 30);
        const healthResult = calculateHealthScore(avgDailyUnits, budget, tariff, dailyUnitsArray, anomalies.length);
        const monthlySavingsPotential = avgDailyUnits * 30 * tariff * 0.15; // 15% potential saving
        const todayRec = recommendations[0];
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Health Score mini */}
            <Link href="/health-score">
              <motion.div
                className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm cursor-pointer"
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl" style={{ background: `${healthResult.color}18` }}>
                    <Heart size={16} style={{ color: healthResult.color }} />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${healthResult.color}18`, color: healthResult.color }}>
                    {healthResult.label}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">Energy Health Score</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {healthResult.score}<span className="text-sm font-normal text-slate-400">/100</span>
                </p>
              </motion.div>
            </Link>

            {/* Monthly Savings */}
            <Link href="/simulator">
              <motion.div
                className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm cursor-pointer"
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-violet-50">
                    <TrendingDown size={16} className="text-violet-600" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Potential</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">Monthly Savings</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {formatCurrency(monthlySavingsPotential, 0)}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">if 15% reduction achieved</p>
              </motion.div>
            </Link>

            {/* Carbon Footprint */}
            <Link href="/sustainability">
              <motion.div
                className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm cursor-pointer"
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-emerald-50">
                    <Leaf size={16} className="text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">CO₂</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500">Carbon Footprint</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {co2Monthly.toFixed(1)}<span className="text-sm font-normal text-slate-400"> kg</span>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">CO₂ this month</p>
              </motion.div>
            </Link>

            {/* AI Tip of the Day */}
            <Link href="/health-score">
              <motion.div
                className="rounded-2xl p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 shadow-sm cursor-pointer lg:col-span-2"
                whileHover={{ y: -2, transition: { duration: 0.15 } }}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-xl bg-amber-100">
                    <Lightbulb size={16} className="text-amber-600" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide">AI Tip of the Day</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">{healthResult.tip}</p>
                {todayRec && (
                  <p className="text-[10px] text-amber-700 mt-1.5 font-semibold">💡 {todayRec.title}: {todayRec.potential_saving}</p>
                )}
              </motion.div>
            </Link>
          </div>
        );
      })()}

      {/* 3 Overview Cards: Budget Ring, Score Ring, AI Month-End Forecast */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Monthly Budget</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              ₹{budget.toLocaleString("en-IN")} Limit
            </span>
          </div>
          <BudgetRing used={estimatedBillSoFar} total={budget} />
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Remaining:</span>
            <span className="font-bold text-emerald-700">
              {formatCurrency(Math.max(0, budget - estimatedBillSoFar))}
            </span>
          </div>
        </div>

        {/* Electricity Score Card */}
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-800">Efficiency Score</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Improvement"}
            </span>
          </div>
          <ScoreRing score={score} />
          <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-100">
            <span className="text-slate-500">Rating:</span>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  fill={i < Math.round(score / 20) ? "currentColor" : "none"}
                />
              ))}
            </div>
          </div>
        </div>

        {/* AI Forecast Card */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold opacity-90">AI Month-End Forecast</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 font-semibold">
              Linear Regression
            </span>
          </div>
          <div className="py-2">
            <p className="text-xs opacity-80 mb-1">Projected Units & Bill</p>
            <p className="text-3xl font-extrabold" style={{ fontFamily: "Outfit, sans-serif" }}>
              {formatCurrency(prediction.predictedBill)}
            </p>
            <p className="text-xs opacity-90 mt-1">
              Estimated total: {prediction.predictedUnits} units
            </p>
          </div>
          <div className="pt-3 border-t border-white/20 flex items-center justify-between">
            <span className="text-xs opacity-80">R² fit confidence</span>
            <span className="text-xs font-bold">{Math.round(prediction.confidence)}%</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Usage Area Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Daily Consumption Trend</h3>
              <p className="text-xs text-slate-500">Electricity usage in kWh over recorded days</p>
            </div>
            <Link
              href="/analytics"
              className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
            >
              Full Analytics <ArrowRight size={13} />
            </Link>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: "12px",
                    border: "1px solid #E2E8F0",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val} kWh`, "Units"]}
                />
                <Area
                  type="monotone"
                  dataKey="units"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorUnits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900">AI Energy Tips</h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                {recommendations.length} tips
              </span>
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 3).map((tip, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800 mb-1">{tip.title}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/predictions"
            className="mt-4 text-xs font-semibold text-emerald-600 hover:underline flex items-center justify-center gap-1 pt-3 border-t border-slate-100"
          >
            View AI Anomaly Analysis <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}
