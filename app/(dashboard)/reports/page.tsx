"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Loader2, Calendar, Zap, IndianRupee, Award, Brain, Leaf, Heart, TrendingDown } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatUnits } from "@/lib/utils/currency";
import { formatIndianDate, formatMonthLabel, getCurrentMonth, getLastNMonths } from "@/lib/utils/date";
import { calculateBill } from "@/lib/utils/bill";
import { predictMonthEnd } from "@/lib/ai/linear-regression";
import { calculateHealthScore } from "@/lib/ai/health-score";
import { calculateCO2 } from "@/lib/ai/sustainability";
import { generateRecommendations } from "@/lib/ai/recommendations";

export default function ReportsPage() {
  const { usageData, dailyUnitsArray, startDate } = useUsage();
  const { tariff, budget } = useSettings();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());
  const [isExporting, setIsExporting] = useState(false);

  const months = getLastNMonths(6);

  const monthlyUsage = useMemo(() =>
    usageData.filter((u) => u.date.startsWith(selectedMonth))
      .sort((a, b) => a.date.localeCompare(b.date)),
    [usageData, selectedMonth]
  );

  const totalUnits = monthlyUsage.reduce((sum, u) => sum + Number(u.units), 0);
  const totalBill = calculateBill(totalUnits, tariff);
  const avgDaily = monthlyUsage.length > 0 ? totalUnits / monthlyUsage.length : 0;
  const highestDay = monthlyUsage.reduce((max, u) => Number(u.units) > Number(max?.units ?? 0) ? u : max, monthlyUsage[0]);
  const lowestDay = monthlyUsage.reduce((min, u) => Number(u.units) < Number(min?.units ?? Infinity) ? u : min, monthlyUsage[0]);
  const budgetDiff = budget - totalBill;

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Header
      doc.setFillColor(5, 150, 105);
      doc.rect(0, 0, 210, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("SmartPower Monthly Report", 14, 22);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Indian Electricity Summary • Month: ${formatMonthLabel(selectedMonth)}`, 14, 31);

      // Stats Section
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("1. Executive Summary", 14, 52);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Total Units Consumed: ${totalUnits.toFixed(2)} kWh`, 14, 62);
      doc.text(`Estimated Electricity Bill (@ Rs.${tariff}/unit): Rs. ${totalBill.toFixed(2)}`, 14, 70);
      doc.text(`Daily Average Consumption: ${avgDaily.toFixed(2)} kWh/day`, 14, 78);
      doc.text(`Monthly Budget Limit: Rs. ${budget.toFixed(2)}`, 14, 86);

      doc.save(`SmartPower_Report_${selectedMonth}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Monthly PDF Reports 📄
          </h1>
          <p className="text-sm text-slate-500">
            Preview & download Indian electricity bill summary statements
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-all w-fit"
        >
          {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Download PDF Statement
        </button>
      </div>

      {/* Month Selector */}
      <div className="flex gap-2 flex-wrap">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setSelectedMonth(month)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedMonth === month
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {formatMonthLabel(month)}
          </button>
        ))}
      </div>

      {/* ─── AI Monthly Report Section ─────────────────────────── */}
      {(() => {
        const sortedAll = [...usageData].sort((a, b) => a.date.localeCompare(b.date));
        const allUnits = sortedAll.map((u) => Number(u.units));
        const prediction = predictMonthEnd(allUnits, tariff, sortedAll[0]?.date ?? new Date().toISOString().split("T")[0]);
        const healthResult = calculateHealthScore(
          avgDaily > 0 ? avgDaily : 0, budget, tariff, monthlyUsage.map((u) => Number(u.units)), 0
        );
        const co2 = calculateCO2(totalUnits);
        const recs = generateRecommendations(monthlyUsage, budget, tariff, healthResult.score);
        const monthlySavings = Math.max(0, budget - totalBill);

        return (
          <motion.div
            className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 overflow-hidden shadow-sm"
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          >
            {/* AI Report Header */}
            <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20">
                <Brain size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">AI Monthly Report — {formatMonthLabel(selectedMonth)}</p>
                <p className="text-xs text-white/80">Generated by SmartPower AI from {monthlyUsage.length} daily readings</p>
              </div>
              <div className="ml-auto px-3 py-1 rounded-full text-xs font-bold text-white bg-white/20">
                {healthResult.label}
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* AI Summary Text */}
              <div className="p-4 rounded-xl bg-white border border-indigo-100">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">📊 AI Summary</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  In <strong>{formatMonthLabel(selectedMonth)}</strong>, you consumed{" "}
                  <strong>{totalUnits.toFixed(1)} kWh</strong> over {monthlyUsage.length} recorded days,
                  resulting in an estimated bill of <strong>{formatCurrency(totalBill, 0)}</strong>.{" "}
                  {totalBill <= budget
                    ? `You stayed within your ₹${budget.toLocaleString("en-IN")} budget, saving ${formatCurrency(monthlySavings, 0)}.`
                    : `This exceeds your ₹${budget.toLocaleString("en-IN")} budget by ${formatCurrency(totalBill - budget, 0)}.`
                  }{" "}
                  Your Energy Health Score is <strong>{healthResult.score}/100 ({healthResult.label})</strong> and
                  your electricity generated approximately <strong>{co2.toFixed(1)} kg CO₂</strong> this month.
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-white border border-indigo-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Heart size={12} style={{ color: healthResult.color }} />
                    <span className="text-[10px] font-bold text-slate-500">Health Score</span>
                  </div>
                  <p className="text-xl font-bold" style={{ color: healthResult.color, fontFamily: "Outfit, sans-serif" }}>
                    {healthResult.score}
                    <span className="text-xs font-normal text-slate-400">/100</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-indigo-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Leaf size={12} className="text-emerald-600" />
                    <span className="text-[10px] font-bold text-slate-500">Carbon</span>
                  </div>
                  <p className="text-xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {co2.toFixed(1)}<span className="text-xs font-normal text-slate-400"> kg</span>
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-indigo-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <TrendingDown size={12} className="text-violet-600" />
                    <span className="text-[10px] font-bold text-slate-500">Savings</span>
                  </div>
                  <p className={`text-xl font-bold ${monthlySavings > 0 ? "text-emerald-700" : "text-red-600"}`} style={{ fontFamily: "Outfit, sans-serif" }}>
                    {monthlySavings > 0 ? formatCurrency(monthlySavings, 0) : "Over budget"}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white border border-indigo-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Zap size={12} className="text-amber-600" />
                    <span className="text-[10px] font-bold text-slate-500">AI Forecast</span>
                  </div>
                  <p className="text-xl font-bold text-indigo-700" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {formatCurrency(prediction.predictedBill, 0)}
                  </p>
                </div>
              </div>

              {/* Highest / Lowest day */}
              {highestDay && lowestDay && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-red-50 border border-red-100">
                    <p className="text-[10px] font-bold text-red-600 mb-1">🔴 Highest Usage Day</p>
                    <p className="text-xs font-bold text-red-900">{formatIndianDate(highestDay.date)}</p>
                    <p className="text-sm font-bold text-red-700">{Number(highestDay.units).toFixed(1)} kWh</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 mb-1">🟢 Lowest Usage Day</p>
                    <p className="text-xs font-bold text-emerald-900">{formatIndianDate(lowestDay.date)}</p>
                    <p className="text-sm font-bold text-emerald-700">{Number(lowestDay.units).toFixed(1)} kWh</p>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {recs.slice(0, 2).length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">💡 AI Recommendations</p>
                  <div className="space-y-2">
                    {recs.slice(0, 2).map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white border border-indigo-100 flex items-start gap-2">
                        <span className="text-indigo-600 mt-0.5 font-bold text-xs">{i + 1}.</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{r.title}</p>
                          <p className="text-[11px] text-slate-600 mt-0.5">{r.description.slice(0, 100)}...</p>
                          <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">{r.potential_saving}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* Report Preview Card */}
      <motion.div
        className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-emerald-100">
            <FileText size={20} className="text-emerald-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{formatMonthLabel(selectedMonth)} Summary</h3>
            <p className="text-xs text-slate-500">Preview of printable PDF statement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500">Total Units Consumed</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{formatUnits(totalUnits)}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500">Total Accrued Bill</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency(totalBill)}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500">Daily Average</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{avgDaily.toFixed(2)} kWh</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <p className="text-xs font-semibold text-slate-500">Budget Comparison</p>
            <p className={`text-2xl font-bold mt-1 ${budgetDiff >= 0 ? "text-emerald-700" : "text-red-600"}`}>
              {budgetDiff >= 0 ? `+${formatCurrency(budgetDiff)}` : `-${formatCurrency(Math.abs(budgetDiff))}`}
            </p>
          </div>
        </div>

        {/* Daily Readings Table */}
        <h4 className="text-sm font-bold text-slate-900 mb-3">Daily Breakdown Table</h4>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase">
              <tr className="border-b border-slate-200">
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4">Units (kWh)</th>
                <th className="py-2.5 px-4">Cost (₹)</th>
                <th className="py-2.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {monthlyUsage.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    No readings recorded for {formatMonthLabel(selectedMonth)}.
                  </td>
                </tr>
              ) : (
                monthlyUsage.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{formatIndianDate(item.date)}</td>
                    <td className="py-2.5 px-4 font-bold text-emerald-700">{formatUnits(Number(item.units))}</td>
                    <td className="py-2.5 px-4 font-medium text-slate-700">{formatCurrency(calculateBill(Number(item.units), tariff))}</td>
                    <td className="py-2.5 px-4 text-xs text-slate-500">{item.notes || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
