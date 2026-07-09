"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  User, IndianRupee, Target, Bell, Moon, Sun, Save, Loader2,
  RefreshCw, Shield
} from "lucide-react";
import { useSettings } from "@/hooks/useSettings";
import { settingsSchema, type SettingsFormData } from "@/lib/validations/usage";

export default function SettingsPage() {
  const { settings, isLoading, updateSettings, fetchSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const {
    register, handleSubmit, reset, watch,
    formState: { errors, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      full_name: "",
      tariff_per_unit: 7,
      monthly_budget: 2500,
      notification_limit: 15,
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        full_name: settings.full_name || "",
        tariff_per_unit: settings.tariff_per_unit,
        monthly_budget: settings.monthly_budget,
        notification_limit: settings.notification_limit,
      });
      setDarkMode(settings.dark_mode);
    }
  }, [settings, reset]);

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      await updateSettings({
        ...data,
        dark_mode: darkMode,
      });
      toast.success("Settings updated successfully! 🎉");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
          Household Tariff & Budget Settings ⚙️
        </h1>
        <p className="text-sm text-slate-500">
          Configure your Indian electricity rate (₹/kWh), monthly spending budget, and alert limits
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Profile Card */}
        <motion.div
          className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <User size={18} className="text-emerald-700" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Profile Details</p>
              <p className="text-xs text-slate-500">Your household display name</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              {...register("full_name")}
              type="text"
              placeholder="e.g. Rahul Sharma"
              className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {errors.full_name && <p className="text-xs mt-1 text-red-600">{errors.full_name.message}</p>}
          </div>
        </motion.div>

        {/* Electricity Tariff & Budget */}
        <motion.div
          className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <IndianRupee size={18} className="text-emerald-700" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Indian Electricity Tariff & Budget (₹)</p>
              <p className="text-xs text-slate-500">Used for cost calculation & anomaly warnings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Flat Tariff Rate (₹ per kWh)
              </label>
              <input
                {...register("tariff_per_unit", { valueAsNumber: true })}
                type="number"
                step="0.1"
                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
              {errors.tariff_per_unit && <p className="text-xs mt-1 text-red-600">{errors.tariff_per_unit.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Target Budget (₹)
              </label>
              <input
                {...register("monthly_budget", { valueAsNumber: true })}
                type="number"
                step="100"
                className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
              {errors.monthly_budget && <p className="text-xs mt-1 text-red-600">{errors.monthly_budget.message}</p>}
            </div>
          </div>
        </motion.div>

        {/* Alerts & Notifications */}
        <motion.div
          className="rounded-2xl p-6 bg-white border border-slate-200 shadow-sm"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-xl bg-emerald-50">
              <Bell size={18} className="text-emerald-700" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Spike Warning Limit</p>
              <p className="text-xs text-slate-500">Alert threshold for excessive daily consumption</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Daily Unit Alert Limit (kWh)
            </label>
            <input
              {...register("notification_limit", { valueAsNumber: true })}
              type="number"
              step="1"
              className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            />
            {errors.notification_limit && <p className="text-xs mt-1 text-red-600">{errors.notification_limit.message}</p>}
          </div>
        </motion.div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center gap-2 transition-all"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
