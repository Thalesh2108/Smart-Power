"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Zap, Calculator, Brain, BarChart3,
  FileText, Settings, Info, ChevronRight, X, Upload,
  Heart, Lightbulb, Sliders, PlugZap, Leaf, Trophy, Bot
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/usage", label: "Daily Usage", icon: Zap },
  { href: "/upload", label: "Bill Explainer", icon: Upload },
  { href: "/calculator", label: "Bill Calculator", icon: Calculator },
  { href: "/predictions", label: "AI Predictions", icon: Brain },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reports", label: "Reports", icon: FileText },
];

const aiNavItems = [
  { href: "/health-score", label: "Energy Health Score", icon: Heart },
  { href: "/ai-insights", label: "AI Insights", icon: Lightbulb },
  { href: "/simulator", label: "Savings Simulator", icon: Sliders },
  { href: "/appliance-estimator", label: "Appliance Estimator", icon: PlugZap },
  { href: "/sustainability", label: "Sustainability", icon: Leaf },
  { href: "/challenges", label: "Smart Challenges", icon: Trophy },
  { href: "/ai-assistant", label: "AI Assistant", icon: Bot },
];

const systemNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About", icon: Info },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ isOpen = true, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 text-slate-800">
      {/* Logo Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-200">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-bold text-base text-slate-900 leading-tight" style={{ fontFamily: "Outfit, sans-serif" }}>
              SmartPower
            </p>
            <p className="text-[11px] font-semibold text-emerald-600 leading-tight">
              AI Electricity Monitor
            </p>
          </div>
        </Link>
        {isMobile && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        )}
      </div>

      {/* Nav Menu */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Main Menu
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-emerald-600" />}
            </Link>
          );
        })}

        {/* AI Intelligence section */}
        <p className="px-3 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          ⚡ AI Intelligence
        </p>
        {aiNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                isActive
                  ? "bg-indigo-50 text-indigo-800 font-semibold border border-indigo-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-indigo-600" : "text-slate-400"} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-indigo-600" />}
            </Link>
          );
        })}

        <p className="px-3 pt-4 text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          System
        </p>
        {systemNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobile ? onClose : undefined}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-emerald-600" />}
            </Link>
          );
        })}
      </div>

      {/* Footer Made for India Badge */}
      <div className="p-4 m-3 rounded-2xl bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm">🇮🇳</span>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Made for India</span>
        </div>
        <p className="text-xs text-slate-500">
          SmartPower v1.0 • ₹ Indian Tariff AI System
        </p>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 w-64 z-50 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="hidden lg:block w-64 flex-shrink-0 h-screen sticky top-0">
      <SidebarContent />
    </aside>
  );
}
