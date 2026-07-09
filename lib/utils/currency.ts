/**
 * Format a number as Indian Rupee currency
 * e.g. 1234.56 → "₹1,234.56"
 */
export function formatCurrency(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

/**
 * Format a number with Indian comma formatting
 * e.g. 1234567 → "12,34,567"
 */
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Format units display
 * e.g. 123.45 → "123.45 kWh"
 */
export function formatUnits(units: number, decimals = 2): string {
  return `${units.toFixed(decimals)} kWh`;
}

/**
 * Compact currency format for large numbers
 * e.g. 12500 → "₹12.5K"
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(1)}K`;
  }
  return `₹${amount.toFixed(0)}`;
}
