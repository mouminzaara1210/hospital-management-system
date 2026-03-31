/**
 * Generic formatting utility for HMS Phase 5
 */

/**
 * Format currency to Indian Rupees (INR)
 * @param {number} amount - The numeric amount
 * @returns {string} - Formatted string (e.g. ₹1,250.00)
 */
export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to a readable format
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted string (e.g. 12 Oct 2024)
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format timestamp to a readable time
 * @param {string|Date} date - Date to format
 * @returns {string} - Formatted time (e.g. 10:30 AM)
 */
export const formatTime = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};
