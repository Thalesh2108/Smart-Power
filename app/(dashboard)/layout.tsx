"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { createClient } from "@/lib/supabase/client";
import { isDemoActive } from "@/lib/demo/seed";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/usage": "Daily Usage Entry",
  "/calculator": "Bill Calculator",
  "/predictions": "AI Predictions",
  "/analytics": "Analytics",
  "/reports": "Reports",
  "/settings": "Settings",
  "/about": "About SmartPower",
  "/health-score": "AI Energy Health Score",
  "/ai-insights": "AI Energy Insights",
  "/simulator": "Smart Savings Simulator",
  "/appliance-estimator": "Appliance Cost Estimator",
  "/sustainability": "Sustainability Dashboard",
  "/challenges": "Smart Challenges",
  "/ai-assistant": "SmartPower AI Assistant",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("Rahul Sharma");
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] || "SmartPower";

  useEffect(() => {
    const fetchUser = async () => {
      if (isDemoActive()) {
        try {
          const raw = localStorage.getItem("smartpower_demo_settings");
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.full_name) setUserName(parsed.full_name);
          }
        } catch {
          // fallback
        }
        return;
      }
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: settings } = await supabase
            .from("user_settings")
            .select("full_name")
            .eq("user_id", user.id)
            .single();
          if (settings?.full_name) {
            setUserName(settings.full_name);
          } else if (user.user_metadata?.full_name) {
            setUserName(user.user_metadata.full_name);
          } else if (user.email) {
            setUserName(user.email.split("@")[0]);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Sidebar */}
      <Sidebar
        isMobile
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav
          onMenuClick={() => setSidebarOpen(true)}
          userName={userName}
          pageTitle={pageTitle}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
