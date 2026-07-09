"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Plus, Search, Pencil, Trash2, X, Check, Loader2,
  Calendar, Zap, StickyNote, ChevronUp, ChevronDown
} from "lucide-react";
import { useUsage } from "@/hooks/useUsage";
import { useSettings } from "@/hooks/useSettings";
import { usageSchema, type UsageFormData } from "@/lib/validations/usage";
import { formatIndianDate, getTodayISO } from "@/lib/utils/date";
import { formatCurrency, formatUnits } from "@/lib/utils/currency";
import { calculateBill } from "@/lib/utils/bill";
import type { ElectricityUsage } from "@/types";

// ─── Add/Edit Dialog ─────────────────────────────────────────
function UsageDialog({
  isOpen, onClose, onSubmit, editRecord, isLoading
}: {
  isOpen: boolean; onClose: () => void;
  onSubmit: (data: UsageFormData) => Promise<void>;
  editRecord?: ElectricityUsage | null;
  isLoading: boolean;
}) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<UsageFormData>({
    resolver: zodResolver(usageSchema),
    defaultValues: editRecord
      ? { date: editRecord.date, units: Number(editRecord.units), notes: editRecord.notes || "" }
      : { date: getTodayISO(), units: undefined, notes: "" },
  });

  const handleClose = () => { reset(); onClose(); };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose} />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="w-full max-w-md rounded-2xl p-6 bg-white border border-slate-200 shadow-xl text-slate-900">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold" style={{ fontFamily: "Outfit, sans-serif" }}>
                  {editRecord ? "Edit Usage Record" : "Add Today's Usage"}
                </h3>
                <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    {...register("date")}
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Units Consumed (kWh)</label>
                  <input
                    {...register("units", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 10.5"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.units && <p className="text-xs text-red-600 mt-1">{errors.units.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
                  <input
                    {...register("notes")}
                    type="text"
                    placeholder="e.g. AC run all night"
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.notes && <p className="text-xs text-red-600 mt-1">{errors.notes.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                  >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                    {editRecord ? "Save Changes" : "Add Record"}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function UsagePage() {
  const { usageData, addUsage, updateUsage, deleteUsage, isLoading, totalUnits, avgDailyUnits } = useUsage();
  const { tariff } = useSettings();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<ElectricityUsage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const filteredData = useMemo(() => {
    return usageData.filter((item) => {
      const s = search.toLowerCase();
      return item.date.includes(s) || (item.notes && item.notes.toLowerCase().includes(s));
    });
  }, [usageData, search]);

  const handleCreateOrUpdate = async (data: UsageFormData) => {
    setIsSaving(true);
    try {
      if (editRecord) {
        await updateUsage(editRecord.id, data.units, data.notes);
      } else {
        await addUsage(data.date, data.units, data.notes);
      }
      setDialogOpen(false);
      setEditRecord(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "Outfit, sans-serif" }}>
            Daily Electricity Log
          </h1>
          <p className="text-sm text-slate-500">
            Record, view, and manage your household daily consumption (kWh)
          </p>
        </div>
        <button
          onClick={() => { setEditRecord(null); setDialogOpen(true); }}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-2 transition-all w-fit"
        >
          <Plus size={16} /> Add Today&apos;s Reading
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Entries</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{usageData.length} days</p>
        </div>
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Total Units This Month</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatUnits(totalUnits)}</p>
        </div>
        <div className="rounded-2xl p-5 bg-white border border-slate-200 shadow-sm">
          <p className="text-xs font-semibold text-slate-500">Daily Average</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">{avgDailyUnits.toFixed(2)} kWh</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by date or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-500">
                <th className="py-3.5 px-4">Date (DD/MM/YYYY)</th>
                <th className="py-3.5 px-4">Units (kWh)</th>
                <th className="py-3.5 px-4">Est. Cost (@₹{tariff}/u)</th>
                <th className="py-3.5 px-4">Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No records found. Click &quot;Add Today&apos;s Reading&quot; to get started!
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {formatIndianDate(row.date)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">
                      {formatUnits(Number(row.units))}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {formatCurrency(calculateBill(Number(row.units), tariff))}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {row.notes || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => { setEditRecord(row); setDialogOpen(true); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-emerald-600"
                        title="Edit"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteUsage(row.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <UsageDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleCreateOrUpdate}
        editRecord={editRecord}
        isLoading={isSaving}
      />
    </div>
  );
}
