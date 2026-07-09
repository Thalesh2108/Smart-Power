"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Leaf, TreePine, Car, Smartphone, Flame, TrendingDown } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { getMonthlyEnvironmentalImpact } from "@/lib/ai/sustainability";

// ─── Green Score Ring ─────────────────────────────────────────
function GreenRing({ score, color, label }: { score: number; color: string; label: string }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-36 h-36">
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle cx="72" cy="72" r={r} fill="none" stroke="#E2E8F0" strokeWidth="10" />
          <motion.circle
            cx="72" cy="72" r={r} fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>{score}</span>
          <span className="text-[10px] font-semibold text-slate-500">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-bold" style={{ color }}>{label}</p>
    </div>
  );
}

function ImpactCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string; sub: string; color: string;
}) {
  return (
    <motion.div
      className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm"
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="p-2.5 rounded-xl mb-3 w-fit" style={{ background: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "Outfit, sans-serif" }}>{value}</p>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </motion.div>
  );
}

export default function SustainabilityPage() {
  const { totalUnits, avgDailyUnits, usageData } = useUsage();
  const { tariff, budget } = useSettings();

  const impact = useMemo(
    () => getMonthlyEnvironmentalImpact(avgDailyUnits * 30, tariff, budget),
    [avgDailyUnits, tariff, budget]
  );

  const daysRecorded = usageData.length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Sustainability Dashboard 🌍
        </h1>
        <p className="text-sm text-slate-500">
          Your environmental impact based on India's electricity grid — CO₂ factor: 0.82 kg/kWh (CEA 2023)
        </p>
      </div>

      {/* Green Score + CO2 Hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm flex flex-col items-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-sm font-bold text-slate-800 mb-4 self-start">Green Score</p>
          <GreenRing
            score={impact.greenScore}
            color={impact.greenColor}
            label={impact.greenLabel}
          />
          <p className="text-xs text-slate-500 text-center mt-3">
            Based on your projected monthly usage of{" "}
            <strong>{(avgDailyUnits * 30).toFixed(1)} kWh</strong> vs. Indian average of 150 kWh/month
          </p>
        </motion.div>

        <motion.div
          className="rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md flex flex-col justify-between"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div>
            <p className="text-xs font-bold opacity-80 uppercase tracking-wide mb-1">Monthly CO₂ Emissions</p>
            <p className="text-4xl font-extrabold" style={{ fontFamily: "Outfit, sans-serif" }}>
              {impact.co2Kg} kg
            </p>
            <p className="text-sm opacity-90 mt-1">CO₂ equivalent this month</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Annual Projected</span>
              <span className="font-bold">{impact.co2Annual} kg CO₂/year</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="opacity-80">Trees to Offset (Monthly)</span>
              <span className="font-bold">{impact.treesRequired} trees</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <ImpactCard
          icon={TreePine}
          label="Trees Needed (Monthly)"
          value={`${impact.treesRequired}`}
          sub="trees to offset emissions"
          color="#059669"
        />
        <ImpactCard
          icon={Car}
          label="Car Distance Equivalent"
          value={`${impact.carKmEquivalent.toLocaleString("en-IN")} km`}
          sub="equivalent km driven"
          color="#D97706"
        />
        <ImpactCard
          icon={Smartphone}
          label="Smartphone Charges"
          value={`${impact.smartphoneCharges.toLocaleString("en-IN")}`}
          sub="equivalent phone charges"
          color="#4F46E5"
        />
        <ImpactCard
          icon={Flame}
          label="Coal Equivalent"
          value={`${impact.coalKg} kg`}
          sub="equivalent coal burned"
          color="#DC2626"
        />
      </div>

      {/* Savings Opportunity */}
      <motion.div
        className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-emerald-50">
            <TrendingDown size={16} className="text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-900">Savings Opportunity</h3>
        </div>
        <p className="text-sm text-slate-700 leading-relaxed">{impact.savingsOpportunity.description}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-xs text-emerald-700 font-semibold">Potential Units Saved</p>
            <p className="text-lg font-bold text-emerald-900">{impact.savingsOpportunity.units.toFixed(1)} kWh</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-xs text-blue-700 font-semibold">CO₂ Reduction</p>
            <p className="text-lg font-bold text-blue-900">{impact.savingsOpportunity.co2Saved.toFixed(1)} kg</p>
          </div>
        </div>
      </motion.div>

      {/* India Grid Context */}
      <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
        <p className="text-xs text-slate-600 leading-relaxed">
          <strong>📊 Methodology:</strong> CO₂ emissions calculated using India's CEA 2023 grid emission factor of 0.82 kg CO₂ per kWh.
          Tree offset assumes 21.7 kg CO₂ absorbed per tree per year (approx. 1.81 kg/month).
          Car equivalence based on 0.12 kg CO₂ per km for average Indian petrol car.
          Data based on {daysRecorded} days of recorded usage.
        </p>
      </div>
    </div>
  );
}
