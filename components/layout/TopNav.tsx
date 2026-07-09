"use client";

import { useRouter } from "next/navigation";
import { Menu, Bell, LogOut, Zap, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { clearDemoMode, isDemoActive } from "@/lib/demo/seed";

interface TopNavProps {
  onMenuClick: () => void;
  userName?: string;
  pageTitle?: string;
}

export function TopNav({ onMenuClick, userName = "User", pageTitle = "Dashboard" }: TopNavProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      clearDemoMode();
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    } catch {
      clearDemoMode();
      router.push("/login");
    }
  };

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3.5 bg-white/80 backdrop-blur-md border-b border-slate-200">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-2">
          <Zap size={18} className="text-emerald-600" fill="currentColor" />
          <span className="font-bold text-base text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            SmartPower
          </span>
        </div>

        {/* Page Title (Desktop) */}
        <div className="hidden lg:flex items-center gap-3">
          <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            {pageTitle}
          </h1>
          {isDemoActive() && (
            <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Sparkles size={13} className="text-emerald-600" /> Instant Preview Mode
            </span>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={() => toast.info("No new alerts. Your electricity usage is on track for this month.")}
          className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell size={19} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {initials || "SP"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">{userName}</p>
            <p className="text-xs text-slate-500">
              {isDemoActive() ? "Demo Account" : "Indian Household"}
            </p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Log out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
