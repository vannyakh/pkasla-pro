/**
 * Analytics helper functions for formatting and calculating trends
 */

/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format a number with thousand separators (no currency symbol)
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Calculate trend percentage between current and previous values
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Percentage change (positive or negative)
 */
export function calculateTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

/**
 * Format trend value with sign and appropriate formatting
 * @param value - The trend value (difference between periods)
 * @param formatAsCurrency - Whether to format as currency or number
 * @returns Formatted string with sign (e.g., "+$1,234.56" or "+1,234")
 */
export function formatTrendValue(value: number, formatAsCurrency: boolean = false): string {
  const sign = value >= 0 ? '+' : ''
  if (formatAsCurrency) {
    return `${sign}${formatCurrency(Math.abs(value))}`
  }
  return `${sign}${formatNumber(Math.abs(value))}`
}

