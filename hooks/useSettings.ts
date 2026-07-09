"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { UserSettings } from "@/types";
import { isDemoActive, DEMO_SETTINGS } from "@/lib/demo/seed";

const DEFAULT_SETTINGS: Omit<UserSettings, "id" | "user_id" | "created_at" | "updated_at"> = {
  full_name: "SmartPower User",
  tariff_per_unit: 7,
  monthly_budget: 2500,
  notification_limit: 15,
  dark_mode: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);

    if (isDemoActive()) {
      const raw = localStorage.getItem("smartpower_demo_settings");
      const data: UserSettings = raw ? JSON.parse(raw) : DEMO_SETTINGS;
      setSettings(data);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const raw = localStorage.getItem("smartpower_demo_settings");
        setSettings(raw ? JSON.parse(raw) : DEMO_SETTINGS);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setSettings(data);
      } else {
        setSettings({
          id: "default",
          user_id: user.id,
          ...DEFAULT_SETTINGS,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch {
      const raw = localStorage.getItem("smartpower_demo_settings");
      setSettings(raw ? JSON.parse(raw) : DEMO_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (isDemoActive()) {
      const raw = localStorage.getItem("smartpower_demo_settings");
      const current: UserSettings = raw ? JSON.parse(raw) : DEMO_SETTINGS;
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem("smartpower_demo_settings", JSON.stringify(updated));
      setSettings(updated);
      return updated;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from("user_settings")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      return data;
    } catch {
      const raw = localStorage.getItem("smartpower_demo_settings");
      const current: UserSettings = raw ? JSON.parse(raw) : DEMO_SETTINGS;
      const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
      localStorage.setItem("smartpower_demo_settings", JSON.stringify(updated));
      setSettings(updated);
      return updated;
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const tariff = settings?.tariff_per_unit ?? DEFAULT_SETTINGS.tariff_per_unit;
  const budget = settings?.monthly_budget ?? DEFAULT_SETTINGS.monthly_budget;
  const notificationLimit = settings?.notification_limit ?? DEFAULT_SETTINGS.notification_limit;

  return {
    settings,
    isLoading,
    tariff,
    budget,
    notificationLimit,
    fetchSettings,
    updateSettings,
  };
}
