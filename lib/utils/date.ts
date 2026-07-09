import { format, parseISO, isValid } from "date-fns";

/**
 * Format a date string to Indian format DD/MM/YYYY
 */
export function formatIndianDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, "dd/MM/yyyy");
  } catch {
    return dateStr;
  }
}

/**
 * Format a date to short display: e.g. "9 Jul"
 */
export function formatShortDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, "d MMM");
  } catch {
    return dateStr;
  }
}

/**
 * Get current month string YYYY-MM
 */
export function getCurrentMonth(): string {
  return format(new Date(), "yyyy-MM");
}

/**
 * Get today's date as ISO string YYYY-MM-DD
 */
export function getTodayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

/**
 * Get current day of month (1-based)
 */
export function getCurrentDayOfMonth(): number {
  return new Date().getDate();
}

/**
 * Get total days in current month
 */
export function getDaysInCurrentMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/**
 * Get remaining days in current month
 */
export function getRemainingDaysInMonth(): number {
  return getDaysInCurrentMonth() - getCurrentDayOfMonth();
}

/**
 * Get start of current month as ISO string
 */
export function getMonthStart(): string {
  const now = new Date();
  return format(new Date(now.getFullYear(), now.getMonth(), 1), "yyyy-MM-dd");
}

/**
 * Get end of current month as ISO string
 */
export function getMonthEnd(): string {
  const now = new Date();
  return format(
    new Date(now.getFullYear(), now.getMonth() + 1, 0),
    "yyyy-MM-dd"
  );
}

/**
 * Format month label: "July 2026"
 */
export function formatMonthLabel(monthStr: string): string {
  try {
    const date = parseISO(`${monthStr}-01`);
    return format(date, "MMMM yyyy");
  } catch {
    return monthStr;
  }
}

/**
 * Get array of month strings for last N months
 */
export function getLastNMonths(n: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(format(d, "yyyy-MM"));
  }
  return months;
}

/**
 * Parse Indian date format DD/MM/YYYY to ISO
 */
export function parseIndianDate(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr;
}
