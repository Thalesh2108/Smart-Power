"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { BarChart3, TrendingUp, Calendar, Award, AlertTriangle } from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatUnits } from "@/lib/utils/currency";
import { formatShortDate, formatIndianDate, getLastNMonths, formatMonthLabel } from "@/lib/utils/date";
import { calculateBill } from "@/lib/utils/bill";

const TABS = ["Daily", "Weekly", "Monthly", "Bill Trend"] as const;
type Tab = (typeof TABS)[number];

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 12,
  color: "#0F172A",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  fontSize: 12,
};

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Daily");
  const { usageData } = useUsage();
  const { tariff, budget } = useSettings();

  const sortedData = useMemo(() =>
    [...usageData].sort((a, b) => a.date.localeCompare(b.date)),
    [usageData]
  );

  // Daily chart data
  const dailyData = useMemo(() =>
    sortedData.slice(-30).map((u) => ({
      date: formatShortDate(u.date),
      fullDate: formatIndianDate(u.date),
      units: parseFloat(Number(u.units).toFixed(2)),
      bill: parseFloat(calculateBill(Number(u.units), tariff).toFixed(2)),
    })),
    [sortedData, tariff]
  );

  // Weekly data
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { units: number; bill: number; count: number }> = {};
    sortedData.forEach((u) => {
      const d = new Date(u.date);
      const wk = `W${Math.ceil(d.getDate() / 7)} (${d.toLocaleString("default", { month: "short" })})`;
      if (!weeks[wk]) weeks[wk] = { units: 0, bill: 0, count: 0 };
      weeks[wk].units += Number(u.units);
      weeks[wk].bill += calculateBill(Number(u.units), tariff);
      weeks[wk].count += 1;
    });
    return Object.entries(weeks).map(([week, d]) => ({
      week,
      units: parseFloat(d.units.toFixed(2)),
      bill: parseFloat(d.bill.toFixed(2)),
    }));
  }, [sortedData, tariff]);

  // Monthly comparison
  const monthlyData = useMemo(() => {
    const months = getLastNMonths(6);
    return months.map((m) => {
      const label = formatMonthLabel(m);
      const mData = sortedData.filter((u) => u.date.startsWith(m));
      const units = mData.reduce((acc, c) => acc + Number(c.units), 0);
      const bill = calculateBill(units, tariff);
      return {
        month: label,
        units: parseFloat(units.toFixed(2)),
        bill: parseFloat(bill.toFixed(2)),
      };
    });
  }, [sortedData, tariff]);

  const stats = useMemo(() => {
    if (sortedData.length === 0) return { peak: 0, lowest: 0, avg: 0 };
    const units = sortedData.map((u) => Number(u.units));
    return {
      peak: Math.max(...units),
      lowest: Math.min(...units),
      avg: units.reduce((a, b) => a + b, 0) / units.length,
    };
  }, [sortedData]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Consumption Analytics & Graphs 📊
        </h1>
        <p className="text-sm text-slate-500">
          Interactive historical breakdowns across daily, weekly, and seasonal Indian cycles
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-xl bg-slate-200/80 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab
                ? "bg-white text-emerald-800 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Peak Single Day Usage</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.peak.toFixed(2)} kWh</p>
        </div>
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Lowest Single Day Usage</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{stats.lowest.toFixed(2)} kWh</p>
        </div>
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Daily Average</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.avg.toFixed(2)} kWh</p>
        </div>
      </div>

      {/* Chart Panel */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6">
          {activeTab} Breakdown ({activeTab === "Daily" ? "Last 30 Days" : activeTab === "Weekly" ? "Current Cycle" : "6-Month Trend"})
        </h3>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeTab === "Daily" ? (
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="areaColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="units" stroke="#059669" strokeWidth={2.5} fill="url(#areaColor)" />
              </AreaChart>
            ) : activeTab === "Weekly" ? (
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="week" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="units" fill="#059669" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="units" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
