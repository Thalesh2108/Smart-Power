"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Trash2, Calculator } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency } from "@/lib/utils/currency";

// ─── Appliance Definitions ────────────────────────────────────
interface Appliance {
  id: string;
  name: string;
  icon: string;
  watts: number;    // typical wattage
  category: string;
}

const APPLIANCES: Appliance[] = [
  { id: "ac", name: "Air Conditioner", icon: "❄️", watts: 1500, category: "Cooling" },
  { id: "refrigerator", name: "Refrigerator", icon: "🧊", watts: 150, category: "Kitchen" },
  { id: "tv", name: "Television (LED)", icon: "📺", watts: 80, category: "Entertainment" },
  { id: "fan", name: "Ceiling Fan", icon: "🌀", watts: 75, category: "Cooling" },
  { id: "washing-machine", name: "Washing Machine", icon: "🫧", watts: 500, category: "Appliance" },
  { id: "microwave", name: "Microwave Oven", icon: "📡", watts: 1200, category: "Kitchen" },
  { id: "laptop", name: "Laptop / Computer", icon: "💻", watts: 60, category: "Electronics" },
  { id: "geyser", name: "Water Heater (Geyser)", icon: "🚿", watts: 2000, category: "Heating" },
  { id: "led-bulb", name: "LED Bulb", icon: "💡", watts: 9, category: "Lighting" },
  { id: "mixer", name: "Mixer / Grinder", icon: "🍴", watts: 750, category: "Kitchen" },
  { id: "iron", name: "Electric Iron", icon: "👕", watts: 1000, category: "Appliance" },
  { id: "water-pump", name: "Water Pump / Motor", icon: "💧", watts: 750, category: "Motor" },
  { id: "cooler", name: "Air Cooler", icon: "💨", watts: 180, category: "Cooling" },
  { id: "induction", name: "Induction Cooktop", icon: "🍳", watts: 1800, category: "Kitchen" },
];

interface SelectedAppliance {
  applianceId: string;
  hoursPerDay: number;
  count: number;
}

export default function ApplianceEstimatorPage() {
  const { tariff } = useSettings();
  const [selected, setSelected] = useState<SelectedAppliance[]>([]);
  const [filter, setFilter] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(APPLIANCES.map((a) => a.category)))];

  function addAppliance(id: string) {
    if (!selected.find((s) => s.applianceId === id)) {
      setSelected((prev) => [...prev, { applianceId: id, hoursPerDay: 4, count: 1 }]);
    }
  }

  function removeAppliance(id: string) {
    setSelected((prev) => prev.filter((s) => s.applianceId !== id));
  }

  function updateSelected(id: string, field: "hoursPerDay" | "count", value: number) {
    setSelected((prev) =>
      prev.map((s) => (s.applianceId === id ? { ...s, [field]: value } : s))
    );
  }

  const results = useMemo(() => {
    return selected.map((s) => {
      const appliance = APPLIANCES.find((a) => a.id === s.applianceId)!;
      if (!appliance) return null;
      const dailyUnits = (appliance.watts * s.count * s.hoursPerDay) / 1000;
      const monthlyUnits = dailyUnits * 30;
      const monthlyCost = monthlyUnits * tariff;
      return { ...s, appliance, dailyUnits, monthlyUnits, monthlyCost };
    }).filter(Boolean) as Array<{
      applianceId: string; hoursPerDay: number; count: number;
      appliance: Appliance; dailyUnits: number; monthlyUnits: number; monthlyCost: number;
    }>;
  }, [selected, tariff]);

  const totals = useMemo(() => ({
    daily: results.reduce((s, r) => s + r.dailyUnits, 0),
    monthly: results.reduce((s, r) => s + r.monthlyUnits, 0),
    cost: results.reduce((s, r) => s + r.monthlyCost, 0),
  }), [results]);

  const filtered = filter === "All" ? APPLIANCES : APPLIANCES.filter((a) => a.category === filter);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Appliance Cost Estimator 🔌
        </h1>
        <p className="text-sm text-slate-500">
          Select Indian household appliances, set usage hours, and see your exact electricity cost
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Appliance Picker */}
        <div className="lg:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter === cat
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Appliance Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map((appliance) => {
              const isSelected = !!selected.find((s) => s.applianceId === appliance.id);
              return (
                <motion.button
                  key={appliance.id}
                  onClick={() => isSelected ? removeAppliance(appliance.id) : addAppliance(appliance.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-400 shadow-sm"
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-2xl mb-2">{appliance.icon}</div>
                  <p className="text-xs font-bold text-slate-900 leading-tight">{appliance.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{appliance.watts}W</p>
                  {isSelected && (
                    <span className="mt-1.5 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-800">
                      ✓ Added
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Calculator Panel */}
        <div className="space-y-4">
          {/* Totals */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <p className="text-xs font-bold opacity-80 mb-3 uppercase tracking-wide flex items-center gap-1">
              <Calculator size={12} /> Running Total
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-90">Daily Units</span>
                <span className="font-bold">{totals.daily.toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-90">Monthly Units</span>
                <span className="font-bold">{totals.monthly.toFixed(1)} kWh</span>
              </div>
              <div className="pt-2 mt-2 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold opacity-90">Monthly Cost</span>
                  <span className="text-xl font-extrabold" style={{ fontFamily: "Outfit, sans-serif" }}>
                    {formatCurrency(totals.cost, 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selected Appliances */}
          {results.length === 0 ? (
            <div className="rounded-2xl p-6 bg-white border border-slate-200 text-center">
              <p className="text-3xl mb-2">🔌</p>
              <p className="text-sm font-semibold text-slate-600">Select appliances</p>
              <p className="text-xs text-slate-400 mt-1">Click appliances on the left to start estimating</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <div key={r.applianceId} className="rounded-2xl p-4 bg-white border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{r.appliance.icon}</span>
                      <span className="text-xs font-bold text-slate-900">{r.appliance.name}</span>
                    </div>
                    <button
                      onClick={() => removeAppliance(r.applianceId)}
                      className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {/* Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Count</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSelected(r.applianceId, "count", Math.max(1, r.count - 1))}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-bold text-slate-900 w-5 text-center">{r.count}</span>
                        <button
                          onClick={() => updateSelected(r.applianceId, "count", Math.min(20, r.count + 1))}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>

                    {/* Hours */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">Hours/day</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateSelected(r.applianceId, "hoursPerDay", Math.max(0.5, r.hoursPerDay - 0.5))}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="text-sm font-bold text-slate-900 w-8 text-center">{r.hoursPerDay}h</span>
                        <button
                          onClick={() => updateSelected(r.applianceId, "hoursPerDay", Math.min(24, r.hoursPerDay + 0.5))}
                          className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400">Daily</span>
                      <p className="font-bold text-emerald-700">{r.dailyUnits.toFixed(2)} kWh</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Monthly</span>
                      <p className="font-bold text-indigo-700">{formatCurrency(r.monthlyCost, 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
