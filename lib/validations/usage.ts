import { z } from "zod";

export const usageSchema = z.object({
  date: z
    .string()
    .min(1, "Date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  units: z
    .number({ message: "Units must be a number" })
    .min(0, "Units cannot be negative")
    .max(500, "Units seem too high — please verify"),
  notes: z.string().max(200, "Notes must be under 200 characters").optional(),
});

export const settingsSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  tariff_per_unit: z
    .number({ message: "Tariff must be a number" })
    .min(1, "Tariff must be at least ₹1")
    .max(50, "Tariff seems too high"),
  monthly_budget: z
    .number({ message: "Budget must be a number" })
    .min(100, "Budget must be at least ₹100")
    .max(100000, "Budget seems too high"),
  notification_limit: z
    .number({ message: "Limit must be a number" })
    .min(1, "Limit must be at least 1 unit")
    .max(200, "Limit seems too high"),
});

export type UsageFormData = z.infer<typeof usageSchema>;
export type SettingsFormData = z.infer<typeof settingsSchema>;
