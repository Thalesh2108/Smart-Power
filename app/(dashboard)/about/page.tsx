"use client";

import { motion } from "framer-motion";
import {
  Zap, Brain, Database, Code, Globe, Cpu, TrendingUp,
  Shield, Smartphone, BarChart3, GitBranch, Rocket, CheckCircle
} from "lucide-react";

const techStack = [
  { name: "Next.js 14 / 16", desc: "React framework with App Router", color: "#059669" },
  { name: "TypeScript", desc: "Type-safe robust development", color: "#0284C7" },
  { name: "Tailwind CSS", desc: "Utility-first clean styling", color: "#0D9488" },
  { name: "Supabase", desc: "PostgreSQL + Auth backend", color: "#10B981" },
  { name: "Recharts", desc: "Data visualization & graphs", color: "#4F46E5" },
  { name: "Framer Motion", desc: "Smooth micro-animations", color: "#7C3AED" },
  { name: "React Hook Form", desc: "Performant form handling", color: "#DC2626" },
  { name: "Zod", desc: "Type & form schema validation", color: "#D97706" },
];

const objectives = [
  "Enable Indian households to track daily electricity consumption manually",
  "Use AI/ML to predict end-of-month electricity bills using Linear Regression",
  "Detect anomalous electricity usage patterns with Z-score analysis",
  "Provide actionable energy-saving recommendations tailored for Indian homes",
  "Visualize usage trends through interactive charts",
  "Generate downloadable PDF monthly reports",
  "Support Indian electricity tariff structure and INR currency (₹)",
];

const futureScope = [
  "Multi-unit/flat support for society electricity management",
  "OCR-based bill scan to auto-enter readings from electricity bills",
  "Integration with Indian DISCOM APIs for real-time tariff updates",
  "SMS/WhatsApp alerts for high consumption notifications",
  "Gamification — energy-saving challenges and badges",
  "Community benchmarking — compare with nearby households",
  "Solar panel ROI calculator",
  "Machine learning upgrade to LSTM neural networks for advanced forecasting",
];

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-10">
      {/* Hero Banner */}
      <motion.div
        className="rounded-3xl p-8 text-center relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg"
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-md">
          <Zap size={32} className="text-white" fill="white" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "Outfit, sans-serif" }}>
          SmartPower
        </h1>
        <p className="text-emerald-100 text-sm max-w-lg mx-auto mb-4">
          AI-Powered Smart Electricity Bill Monitoring & Prediction for Indian Households
        </p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold text-emerald-100">
          <span>🇮🇳 Made for India</span>
          <span>•</span>
          <span>Version 1.0</span>
          <span>•</span>
          <span>₹ Indian Tariff Engine</span>
        </div>
      </motion.div>

      {/* Problem Statement */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Problem Statement
          </h2>
        </div>
        <p className="text-sm text-slate-600 leading-relaxed">
          Indian households spend thousands of rupees on electricity bills every month, yet most people have no visibility into their daily consumption patterns. Traditional electricity meters provide only end-of-month readings, making it impossible to proactively manage usage before the bill arrives.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          With rising electricity tariffs across India (averaging ₹6–₹14/unit across states and DISCOM slab rates), households need intelligent tools to predict bills, detect anomalies early, and optimize consumption in real-time.
        </p>
      </div>

      {/* Project Objectives */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <CheckCircle size={20} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Project Objectives
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <CheckCircle size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold text-slate-700">{obj}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Model Architecture */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-emerald-600" />
          <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            AI Model Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Linear Regression</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              OLS (Ordinary Least Squares) regression predicts month-end units from daily readings. Formula: <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">y = mx + b</code>.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Z-Score Anomaly Detection</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects abnormal daily consumption by computing <code className="bg-slate-200 px-1 py-0.5 rounded text-[11px]">Z = (x - μ) / σ</code>. Values &gt; 1.8 trigger alert warnings.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Rule-Based Engine</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Context-aware recommendation engine analyzes usage trends, budget status, and Indian tariff tiers.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Technology Stack
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {techStack.map((tech, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs font-bold text-slate-900 mb-0.5">{tech.name}</p>
              <p className="text-[11px] text-slate-500 leading-tight">{tech.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
