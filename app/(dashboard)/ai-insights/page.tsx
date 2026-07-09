"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp, TrendingDown, Wallet, AlertTriangle, CheckCircle,
  Leaf, Calendar, Flame, BarChart3, Activity, Zap, ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { generateAIInsights, type AIInsight, type InsightSeverity } from "@/lib/ai/insights";

const ICON_MAP: Record<string, React.ElementType> = {
  TrendingUp, TrendingDown, Wallet, AlertTriangle, CheckCircle,
  Leaf, Calendar, Flame, BarChart3, Activity, Zap,
};

const SEVERITY_CONFIG: Record<InsightSeverity, { bg: string; border: string; text: string; iconColor: string; badge: string }> = {
  success: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-900",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-900",
    iconColor: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  warning: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-900",
    iconColor: "text-amber-600",
    badge: "bg-amber-100 text-amber-700",
  },
  danger: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-900",
    iconColor: "text-red-600",
    badge: "bg-red-100 text-red-700",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  trend: "Usage Trend",
  budget: "Budget",
  behavior: "Behavior",
  environment: "Environment",
  anomaly: "Anomaly",
};

function InsightCard({ insight, delay }: { insight: AIInsight; delay: number }) {
  const cfg = SEVERITY_CONFIG[insight.severity];
  const Icon = ICON_MAP[insight.icon] ?? Zap;

  return (
    <motion.div
      className={`rounded-2xl p-5 border ${cfg.bg} ${cfg.border}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl bg-white/60 flex-shrink-0`}>
          <Icon size={18} className={cfg.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className={`text-sm font-bold ${cfg.text}`}>{insight.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge} uppercase tracking-wide`}>
              {CATEGORY_LABELS[insight.category]}
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${cfg.text} opacity-80`}>{insight.body}</p>
          {insight.actionLabel && insight.actionHref && (
            <Link
              href={insight.actionHref}
              className={`mt-2 inline-flex items-center gap-1 text-xs font-semibold ${cfg.iconColor} hover:underline`}
            >
              {insight.actionLabel} <ArrowRight size={11} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function AIInsightsPage() {
  const { usageData } = useUsage();
  const { tariff, budget } = useSettings();

  const insights = useMemo(
    () => generateAIInsights(usageData, tariff, budget),
    [usageData, tariff, budget]
  );

  const successCount = insights.filter((i) => i.severity === "success").length;
  const warningCount = insights.filter((i) => i.severity === "warning" || i.severity === "danger").length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            AI Energy Insights 🤖
          </h1>
          <p className="text-sm text-slate-500">
            Human-readable AI analysis of your electricity patterns — updated from your latest data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800">
            ✅ {successCount} positive
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-800">
            ⚠️ {warningCount} alerts
          </span>
        </div>
      </div>

      {/* Summary banner */}
      {insights.length > 0 && (
        <motion.div
          className="rounded-2xl p-4 bg-gradient-to-r from-indigo-600 to-violet-700 text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-sm font-semibold">
            🧠 SmartPower AI has analysed <strong>{usageData.length} usage records</strong> and generated{" "}
            <strong>{insights.length} personalised insights</strong> based on your electricity patterns.
          </p>
        </motion.div>
      )}

      {/* Insight Cards */}
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <InsightCard key={insight.id} insight={insight} delay={0.05 + i * 0.06} />
        ))}
      </div>

      {/* Footer */}
      <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Insights are generated from your actual usage data using statistical analysis.
        </p>
        <Link href="/analytics" className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
          View Full Analytics <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
