"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ElectricityUsage } from "@/types";
import { getMonthStart, getMonthEnd, getTodayISO } from "@/lib/utils/date";
import { toast } from "sonner";
import { isDemoActive, getDemoUsageData } from "@/lib/demo/seed";

export function useUsage() {
  const [usageData, setUsageData] = useState<ElectricityUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async (monthStart?: string, monthEnd?: string) => {
    setIsLoading(true);
    setError(null);

    // 1. Check Demo Mode fallback first
    if (isDemoActive()) {
      try {
        const raw = localStorage.getItem("smartpower_demo_usage");
        let data: ElectricityUsage[] = raw ? JSON.parse(raw) : getDemoUsageData();
        if (!raw) {
          localStorage.setItem("smartpower_demo_usage", JSON.stringify(data));
        }
        if (monthStart && monthEnd) {
          data = data.filter((u) => u.date >= monthStart && u.date <= monthEnd);
        }
        setUsageData(data);
        setIsLoading(false);
        return;
      } catch {
        // Fallback silently
      }
    }

    // 2. Otherwise try Supabase
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // If not authenticated via Supabase, check local demo data
        const raw = localStorage.getItem("smartpower_demo_usage");
        const data = raw ? JSON.parse(raw) : getDemoUsageData();
        setUsageData(data);
        setIsLoading(false);
        return;
      }

      let query = supabase
        .from("electricity_usage")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (monthStart && monthEnd) {
        query = query.gte("date", monthStart).lte("date", monthEnd);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setUsageData(data || []);
    } catch {
      // Fallback to local demo data if fetch fails
      const raw = localStorage.getItem("smartpower_demo_usage");
      const data = raw ? JSON.parse(raw) : getDemoUsageData();
      setUsageData(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentMonthUsage = useCallback(() => {
    return fetchUsage(getMonthStart(), getMonthEnd());
  }, [fetchUsage]);

  const addUsage = useCallback(async (date: string, units: number, notes?: string) => {
    if (isDemoActive()) {
      const raw = localStorage.getItem("smartpower_demo_usage");
      const current: ElectricityUsage[] = raw ? JSON.parse(raw) : getDemoUsageData();
      const existingIdx = current.findIndex((u) => u.date === date);
      const newRecord: ElectricityUsage = {
        id: existingIdx >= 0 ? current[existingIdx].id : `demo-usage-${Date.now()}`,
        user_id: "demo-user-1",
        date,
        units,
        notes: notes || "",
        created_at: existingIdx >= 0 ? current[existingIdx].created_at : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (existingIdx >= 0) {
        current[existingIdx] = newRecord;
      } else {
        current.unshift(newRecord);
      }
      localStorage.setItem("smartpower_demo_usage", JSON.stringify(current));
      setUsageData(current);
      toast.success("Usage entry saved!");
      return;
    }

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("electricity_usage")
        .upsert({
          user_id: user.id,
          date,
          units,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,date" });

      if (error) throw error;
      toast.success("Usage entry saved!");
      await fetchCurrentMonthUsage();
    } catch {
      toast.error("Failed to save usage entry.");
    }
  }, [fetchCurrentMonthUsage]);

  const updateUsage = useCallback(async (id: string, units: number, notes?: string) => {
    if (isDemoActive()) {
      const raw = localStorage.getItem("smartpower_demo_usage");
      const current: ElectricityUsage[] = raw ? JSON.parse(raw) : getDemoUsageData();
      const updated = current.map((u) => u.id === id ? { ...u, units, notes: notes || "", updated_at: new Date().toISOString() } : u);
      localStorage.setItem("smartpower_demo_usage", JSON.stringify(updated));
      setUsageData(updated);
      toast.success("Usage updated!");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("electricity_usage")
        .update({ units, notes: notes || null, updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      toast.success("Usage updated!");
      await fetchCurrentMonthUsage();
    } catch {
      toast.error("Failed to update entry.");
    }
  }, [fetchCurrentMonthUsage]);

  const deleteUsage = useCallback(async (id: string) => {
    if (isDemoActive()) {
      const raw = localStorage.getItem("smartpower_demo_usage");
      const current: ElectricityUsage[] = raw ? JSON.parse(raw) : getDemoUsageData();
      const filtered = current.filter((u) => u.id !== id);
      localStorage.setItem("smartpower_demo_usage", JSON.stringify(filtered));
      setUsageData(filtered);
      toast.success("Usage entry deleted.");
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.from("electricity_usage").delete().eq("id", id);
      if (error) throw error;
      toast.success("Usage entry deleted.");
      await fetchCurrentMonthUsage();
    } catch {
      toast.error("Failed to delete entry.");
    }
  }, [fetchCurrentMonthUsage]);

  useEffect(() => {
    fetchCurrentMonthUsage();
  }, [fetchCurrentMonthUsage]);

  const totalUnits = usageData.reduce((sum, u) => sum + Number(u.units), 0);
  const avgDailyUnits = usageData.length > 0 ? totalUnits / usageData.length : 0;
  const dailyUnitsArray = usageData.map((u) => Number(u.units));
  const startDate = usageData.length > 0 ? usageData[usageData.length - 1].date : getTodayISO();

  return {
    usageData,
    isLoading,
    error,
    totalUnits,
    avgDailyUnits,
    dailyUnitsArray,
    startDate,
    fetchUsage,
    fetchCurrentMonthUsage,
    addUsage,
    updateUsage,
    deleteUsage,
  };
}
