"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Heart, Activity, Wallet, Zap, Star, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { calculateHealthScore } from "@/lib/ai/health-score";
import { detectAnomalies } from "@/lib/ai/anomaly-detection";
import { formatCurrency } from "@/lib/utils/currency";
import { getCurrentDayOfMonth, getDaysInCurrentMonth } from "@/lib/utils/date";

// ─── Gauge Component ──────────────────────────────────────────
function HealthGauge({ score, color }: { score: number; color: string }) {
  // Semi-circle arc gauge
  const r = 80;
  const cx = 110;
  const cy = 110;
  const startAngle = 180; // left
  const endAngle = 0;    // right
  const circumference = Math.PI * r; // half circle

  const pct = score / 100;
  const dashLen = pct * circumference;
  const gap = circumference - dashLen;

  // Convert polar to cartesian
  function polar(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  const startPt = polar(startAngle);
  const endPt = polar(endAngle);

  return (
    <div className="flex flex-col items-center">
      <svg width="220" height="130" viewBox="0 0 220 130">
        {/* Background arc */}
        <path
          d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 0 1 ${endPt.x} ${endPt.y}`}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="14"
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <motion.path
          d={`M ${startPt.x} ${startPt.y} A ${r} ${r} 0 0 1 ${endPt.x} ${endPt.y}`}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: gap }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
        {/* Score text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fontSize="36" fontWeight="800" fill="#0F172A" fontFamily="Outfit, sans-serif">
          {score}
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontSize="12" fontWeight="600" fill="#64748B">
          / 100
        </text>
        {/* Range labels */}
        <text x="22" y="120" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94A3B8">0</text>
        <text x="198" y="120" textAnchor="middle" fontSize="10" fontWeight="600" fill="#94A3B8">100</text>
      </svg>
    </div>
  );
}

// ─── Score Component Bar ──────────────────────────────────────
function ScoreBar({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: React.ElementType }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon size={14} style={{ color }} />
          <span className="text-xs font-semibold text-slate-700">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-900">{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function HealthScorePage() {
  const { usageData, totalUnits, avgDailyUnits, dailyUnitsArray } = useUsage();
  const { tariff, budget } = useSettings();

  const anomalies = useMemo(() => {
    const sorted = [...usageData].sort((a, b) => a.date.localeCompare(b.date));
    return detectAnomalies(sorted);
  }, [usageData]);

  const healthResult = useMemo(
    () => calculateHealthScore(avgDailyUnits, budget, tariff, dailyUnitsArray, anomalies.length),
    [avgDailyUnits, budget, tariff, dailyUnitsArray, anomalies.length]
  );

  const currentDay = getCurrentDayOfMonth();
  const totalDays = getDaysInCurrentMonth();

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          AI Energy Health Score 💚
        </h1>
        <p className="text-sm text-slate-500">
          Holistic assessment of your energy efficiency, budget adherence & consistency — Day {currentDay} of {totalDays}
        </p>
      </div>

      {/* Main Score Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-1 rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col items-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-4 self-start">
            <div className="p-2 rounded-xl" style={{ background: `${healthResult.color}18` }}>
              <Heart size={18} style={{ color: healthResult.color }} />
            </div>
            <span className="text-sm font-bold text-slate-800">Overall Health Score</span>
          </div>

          <HealthGauge score={healthResult.score} color={healthResult.color} />

          <div
            className="mt-2 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ background: `${healthResult.color}18`, color: healthResult.color }}
          >
            {healthResult.label}
          </div>

          <p className="text-xs text-slate-500 text-center mt-3 leading-relaxed">
            Based on usage efficiency, budget adherence, consistency & anomaly detection
          </p>

          {/* Star rating */}
          <div className="flex items-center gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className="text-amber-400"
                fill={i < Math.round(healthResult.score / 20) ? "currentColor" : "none"}
              />
            ))}
          </div>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          className="lg:col-span-2 rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h3 className="text-base font-bold text-slate-900 mb-6">Score Breakdown</h3>
          <div className="space-y-5">
            <ScoreBar
              label="Usage Efficiency (30%)"
              value={healthResult.components.usageScore}
              color="#059669"
              icon={Zap}
            />
            <ScoreBar
              label="Budget Adherence (35%)"
              value={healthResult.components.budgetScore}
              color="#4F46E5"
              icon={Wallet}
            />
            <ScoreBar
              label="Consistency (20%)"
              value={healthResult.components.consistencyScore}
              color="#0284C7"
              icon={Activity}
            />
            <ScoreBar
              label="Anomaly Penalty (15%)"
              value={healthResult.components.anomalyScore}
              color="#D97706"
              icon={AlertTriangle}
            />
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500">Avg Daily Usage</p>
              <p className="font-bold text-slate-900">{avgDailyUnits.toFixed(2)} kWh</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-500">Monthly Budget</p>
              <p className="font-bold text-slate-900">{formatCurrency(budget, 0)}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div
          className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-50">
              <CheckCircle size={16} className="text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">What You're Doing Well</h3>
          </div>
          {healthResult.strengths.length > 0 ? (
            <div className="space-y-2">
              {healthResult.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle size={14} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-800 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Add more usage data to see your strengths.</p>
          )}
        </motion.div>

        {/* Improvements */}
        <motion.div
          className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-50">
              <AlertTriangle size={16} className="text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Areas to Improve</h3>
          </div>
          {healthResult.improvements.length > 0 ? (
            <div className="space-y-2">
              {healthResult.improvements.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
                  <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 leading-relaxed">{s}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Great — no major issues detected.</p>
          )}
        </motion.div>
      </div>

      {/* Daily Tip */}
      <motion.div
        className="rounded-2xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white/20 flex-shrink-0">
            <Star size={16} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-bold opacity-80 mb-1 uppercase tracking-wide">AI Tip of the Day</p>
            <p className="text-sm font-medium leading-relaxed">{healthResult.tip}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Link
            href="/simulator"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-1"
          >
            Smart Simulator <ArrowRight size={12} />
          </Link>
          <Link
            href="/challenges"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition flex items-center gap-1"
          >
            View Challenges <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
