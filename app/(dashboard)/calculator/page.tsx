"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Zap, IndianRupee, TrendingUp, Info } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatUnits } from "@/lib/utils/currency";
import { calculateBill, calculateEstimatedMonthlyBill, calculateSlabBill, calculateSlabBillWithBreakdown } from "@/lib/utils/bill";
import { getCurrentDayOfMonth, getDaysInCurrentMonth } from "@/lib/utils/date";
import { predictMonthEnd } from "@/lib/ai/linear-regression";
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip } from "recharts";

function InfoCard({ title, value, subtitle, color, icon: Icon }: {
  title: string; value: string; subtitle?: string;
  color: string; icon: React.ElementType;
}) {
  return (
    <motion.div
      className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 rounded-xl" style={{ background: `${color}15` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <p className="text-xs font-semibold text-slate-500">{title}</p>
      </div>
      <p className="text-3xl font-bold mb-1 text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </motion.div>
  );
}

export default function CalculatorPage() {
  const { totalUnits, dailyUnitsArray, startDate, usageData } = useUsage();
  const { settings, tariff: defaultTariff } = useSettings();
  const [customTariff, setCustomTariff] = useState<number | "">(defaultTariff);
  const [activeTab, setActiveTab] = useState<"flat" | "slab">("flat");

  const tariff = typeof customTariff === "number" ? customTariff : defaultTariff;
  const currentDay = getCurrentDayOfMonth();
  const totalDays = getDaysInCurrentMonth();

  // Sort chronological for AI
  const sortedUsage = useMemo(
    () => [...usageData].sort((a, b) => a.date.localeCompare(b.date)),
    [usageData]
  );

  const prediction = useMemo(
    () => predictMonthEnd(dailyUnitsArray, tariff, startDate),
    [dailyUnitsArray, tariff, startDate]
  );

  const currentBillFlat = useMemo(() => calculateBill(totalUnits, tariff), [totalUnits, tariff]);
  const estimatedMonthFlat = useMemo(
    () => calculateEstimatedMonthlyBill(totalUnits, currentDay, totalDays, tariff),
    [totalUnits, currentDay, totalDays, tariff]
  );

  const currentBillSlab = useMemo(() => calculateSlabBillWithBreakdown(totalUnits), [totalUnits]);
  const estimatedMonthSlab = useMemo(() => {
    const projectedUnits = currentDay > 0 ? (totalUnits / currentDay) * totalDays : 0;
    return calculateSlabBillWithBreakdown(projectedUnits);
  }, [totalUnits, currentDay, totalDays]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Indian Tariff Bill Calculator 🇮🇳
        </h1>
        <p className="text-sm text-slate-500">
          Compare flat rate vs. typical Indian DISCOM slab rates (₹)
        </p>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-slate-200/80 w-fit">
        <button
          onClick={() => setActiveTab("flat")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "flat"
              ? "bg-white text-emerald-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Flat Tariff Rate (₹{tariff}/unit)
        </button>
        <button
          onClick={() => setActiveTab("slab")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === "slab"
              ? "bg-white text-emerald-800 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Indian Residential Slab Rates
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <InfoCard
          title="Current Units Consumed"
          value={formatUnits(totalUnits)}
          subtitle={`Day ${currentDay} of ${totalDays}`}
          color="#059669"
          icon={Zap}
        />
        <InfoCard
          title="Bill Accrued So Far"
          value={formatCurrency(activeTab === "flat" ? currentBillFlat : currentBillSlab.total)}
          subtitle={activeTab === "flat" ? `At ₹${tariff}/unit` : "Slab calculation"}
          color="#0284C7"
          icon={IndianRupee}
        />
        <InfoCard
          title="Projected Month-End Bill"
          value={formatCurrency(activeTab === "flat" ? estimatedMonthFlat : estimatedMonthSlab.total)}
          subtitle="Based on daily average rate"
          color="#D97706"
          icon={TrendingUp}
        />
        <InfoCard
          title="AI Linear Forecast Bill"
          value={formatCurrency(prediction.predictedBill)}
          subtitle={`AI units: ${prediction.predictedUnits} kWh`}
          color="#4F46E5"
          icon={Calculator}
        />
      </div>

      {/* Details Box */}
      {activeTab === "slab" ? (
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">
            Indian DISCOM Residential Slab Breakdown (Current Usage: {totalUnits} kWh)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {currentBillSlab.breakdown.map((tier, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-800 mb-1">{tier.slab}</p>
                <p className="text-sm font-semibold text-emerald-700">{tier.units} units @ ₹{tier.rate}/u</p>
                <p className="text-base font-bold text-slate-900 mt-2">₹{tier.cost.toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
            <span className="text-sm font-bold text-emerald-900">Total Slab Bill Accrued</span>
            <span className="text-xl font-bold text-emerald-900">₹{currentBillSlab.total.toFixed(2)}</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Flat Rate Tariff Setting</h3>
            <p className="text-xs text-slate-500">
              Adjust your per-unit cost below to recalculate instantly.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-700">Tariff (₹/unit):</label>
            <input
              type="number"
              step="0.5"
              value={customTariff}
              onChange={(e) => setCustomTariff(e.target.value === "" ? "" : parseFloat(e.target.value))}
              className="w-28 px-3 py-2 rounded-xl text-sm font-bold bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
