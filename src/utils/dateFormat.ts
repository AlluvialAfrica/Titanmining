/**
 * Date formatting utilities.
 * All dates are stored in ISO YYYY-MM-DD format internally.
 * This module handles display in DD/MM/YYYY format.
 */

/**
 * Converts an ISO date string (YYYY-MM-DD or full ISO datetime) to DD/MM/YYYY display.
 */
export function formatDateDDMMYYYY(isoDate: string | undefined | null): string {
  if (!isoDate) return '';
  // Handle full ISO datetime: take only the date part
  const datePart = isoDate.split('T')[0];
  const [year, month, day] = datePart.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}

/**
 * Converts a DD/MM/YYYY string to ISO YYYY-MM-DD for storage.
 */
export function parseDDMMYYYYToISO(display: string): string {
  if (!display) return '';
  const parts = display.replace(/[\/\-\.]/g, '/').split('/');
  if (parts.length !== 3) return display;
  const [day, month, year] = parts;
  if (!day || !month || !year) return display;
  return `${year.padStart(4, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

/**
 * Validates a DD/MM/YYYY string.
 */
export function isValidDDMMYYYY(value: string): boolean {
  if (!value) return false;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return false;
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
