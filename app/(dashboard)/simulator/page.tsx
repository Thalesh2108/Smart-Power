"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sliders, Zap, IndianRupee, Leaf, TrendingDown, RotateCcw } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { calculateCO2 } from "@/lib/ai/sustainability";
import { formatCurrency } from "@/lib/utils/currency";

// ─── Scenario Definitions ─────────────────────────────────────
interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  // Returns units saved per month given value and tariff
  calcMonthlySaving: (value: number, tariff: number) => number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "ac-reduce",
    title: "Reduce AC Usage",
    description: "AC averages 1.5 kW. Every hour less per day saves ~45 units/month.",
    icon: "❄️",
    defaultValue: 0,
    min: 0,
    max: 6,
    step: 0.5,
    unit: "hrs/day less",
    calcMonthlySaving: (hrs) => Math.round(hrs * 1.5 * 30 * 10) / 10, // 1.5 kW × hrs × 30 days
  },
  {
    id: "led-bulbs",
    title: "Replace Bulbs with LED",
    description: "Replacing 10W incandescent with 2W LED saves ~2.4 units/month per bulb.",
    icon: "💡",
    defaultValue: 0,
    min: 0,
    max: 20,
    step: 1,
    unit: "bulbs replaced",
    calcMonthlySaving: (bulbs) => Math.round(bulbs * (8 / 1000) * 8 * 30 * 10) / 10, // 8W saving × 8hrs × 30 days
  },
  {
    id: "standby-off",
    title: "Turn Off Standby Devices",
    description: "Standby devices (TV, set-top, chargers) consume ~50W combined. Switching off saves units.",
    icon: "🔌",
    defaultValue: 0,
    min: 0,
    max: 16,
    step: 1,
    unit: "hrs off/day",
    calcMonthlySaving: (hrs) => Math.round(hrs * 0.05 * 30 * 10) / 10, // 50W × hrs × 30 days
  },
  {
    id: "washing-full",
    title: "Full Loads Only (Washing Machine)",
    description: "Running half loads wastes ~1 kWh per extra cycle. Full loads cut cycles by half.",
    icon: "🫧",
    defaultValue: 0,
    min: 0,
    max: 20,
    step: 1,
    unit: "cycles saved/month",
    calcMonthlySaving: (cycles) => Math.round(cycles * 1.0 * 10) / 10, // 1 kWh per cycle
  },
  {
    id: "geyser-reduce",
    title: "Reduce Water Heater (Geyser) Usage",
    description: "A 2 kW geyser running 1 hour = 2 units. Reduce shower time to save significantly.",
    icon: "🚿",
    defaultValue: 0,
    min: 0,
    max: 4,
    step: 0.5,
    unit: "hrs/day less",
    calcMonthlySaving: (hrs) => Math.round(hrs * 2.0 * 30 * 10) / 10, // 2 kW × hrs × 30 days
  },
  {
    id: "fan-vs-ac",
    title: "Use Fan Instead of AC",
    description: "Fan uses 75W vs AC's 1500W. Switching for some hours saves massively.",
    icon: "🌀",
    defaultValue: 0,
    min: 0,
    max: 8,
    step: 0.5,
    unit: "hrs/day on fan",
    calcMonthlySaving: (hrs) => Math.round(hrs * (1500 - 75) / 1000 * 30 * 10) / 10,
  },
];

function ResultCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-xl font-bold mt-0.5" style={{ color, fontFamily: "Outfit, sans-serif" }}>{value}</p>
    </div>
  );
}

export default function SimulatorPage() {
  const { tariff } = useSettings();
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(SCENARIOS.map((s) => [s.id, s.defaultValue]))
  );

  const totalUnitsSaved = useMemo(
    () => SCENARIOS.reduce((sum, s) => sum + s.calcMonthlySaving(values[s.id], tariff), 0),
    [values, tariff]
  );

  const totalMoneySaved = useMemo(() => totalUnitsSaved * tariff, [totalUnitsSaved, tariff]);
  const totalCO2Saved = useMemo(() => calculateCO2(totalUnitsSaved), [totalUnitsSaved]);

  // Estimate baseline (typical Indian home: 150 kWh/month)
  const baselineUnits = 150;
  const pctReduction = baselineUnits > 0 ? Math.min(100, (totalUnitsSaved / baselineUnits) * 100) : 0;

  function resetAll() {
    setValues(Object.fromEntries(SCENARIOS.map((s) => [s.id, s.defaultValue])));
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Smart Savings Simulator ⚡
          </h1>
          <p className="text-sm text-slate-500">
            Adjust lifestyle changes to instantly see how much you could save this month
          </p>
        </div>
        <button
          onClick={resetAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition w-fit"
        >
          <RotateCcw size={14} /> Reset All
        </button>
      </div>

      {/* Results Banner */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        key={totalUnitsSaved}
        initial={{ opacity: 0.8, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
      >
        <ResultCard label="Units Saved" value={`${totalUnitsSaved.toFixed(1)} kWh`} icon="⚡" color="#059669" />
        <ResultCard label="Money Saved" value={formatCurrency(totalMoneySaved, 0)} icon="💰" color="#4F46E5" />
        <ResultCard label="CO₂ Reduced" value={`${totalCO2Saved.toFixed(1)} kg`} icon="🌿" color="#0284C7" />
        <ResultCard label="Usage Reduction" value={`${pctReduction.toFixed(1)}%`} icon="📉" color="#D97706" />
      </motion.div>

      {/* Scenarios */}
      <div className="space-y-4">
        {SCENARIOS.map((scenario, i) => {
          const val = values[scenario.id];
          const saving = scenario.calcMonthlySaving(val, tariff);
          const moneySaving = saving * tariff;
          const co2Saving = calculateCO2(saving);

          return (
            <motion.div
              key={scenario.id}
              className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{scenario.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{scenario.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{scenario.description}</p>
                  </div>
                </div>

                {/* Live saving badge */}
                {saving > 0 && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Save {saving.toFixed(1)} kWh
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                      {formatCurrency(moneySaving, 0)}
                    </span>
                  </div>
                )}
              </div>

              {/* Slider */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1">
                    <Sliders size={12} /> Adjust: {val} {scenario.unit}
                  </span>
                  <span className="text-emerald-600">
                    {saving > 0 ? `🌿 ${co2Saving.toFixed(1)} kg CO₂ saved` : "Move slider to simulate"}
                  </span>
                </div>
                <input
                  type="range"
                  min={scenario.min}
                  max={scenario.max}
                  step={scenario.step}
                  value={val}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [scenario.id]: parseFloat(e.target.value) }))
                  }
                  className="w-full h-2 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #059669 0%, #059669 ${((val - scenario.min) / (scenario.max - scenario.min)) * 100}%, #E2E8F0 ${((val - scenario.min) / (scenario.max - scenario.min)) * 100}%, #E2E8F0 100%)`,
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{scenario.min} {scenario.unit}</span>
                  <span>{scenario.max} {scenario.unit}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      {totalUnitsSaved > 5 && (
        <motion.div
          className="rounded-2xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="font-bold text-lg" style={{ fontFamily: "Outfit, sans-serif" }}>
            🎉 You could save {formatCurrency(totalMoneySaved, 0)} every month!
          </p>
          <p className="text-sm opacity-90 mt-1">
            That's {totalUnitsSaved.toFixed(1)} kWh less, reducing your carbon footprint by {totalCO2Saved.toFixed(1)} kg CO₂.
            These small changes add up to {formatCurrency(totalMoneySaved * 12, 0)} per year!
          </p>
        </motion.div>
      )}
    </div>
  );
}
