/**
 * Date formatting utilities using Intl.DateTimeFormat.
 * Uses the user's locale by default.
 */

const DATE_FORMATTERS = {
  full: new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  short: new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }),
  time: new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }),
  weekday: new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
  }),
};

/**
 * Format a date as a full date string (e.g., "January 1, 2024").
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateFull(date: Date): string {
  return DATE_FORMATTERS.full.format(date);
}

/**
 * Format a date as a short date string (e.g., "Jan 1").
 *
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateShort(date: Date): string {
  return DATE_FORMATTERS.short.format(date);
}

/**
 * Format a date as a time string (e.g., "2:30 PM").
 *
 * @param date - Date to format
 * @returns Formatted time string
 */
export function formatTime(date: Date): string {
  return DATE_FORMATTERS.time.format(date);
}

/**
 * Format a date as a weekday name (e.g., "Monday").
 *
 * @param date - Date to format
 * @returns Formatted weekday string
 */
export function formatWeekday(date: Date): string {
  return DATE_FORMATTERS.weekday.format(date);
}

/**
 * Format a date as a relative time string (e.g., "in 2 days", "3 hours ago").
 *
 * @param date - Date to format
 * @returns Relative time string
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (Math.abs(diffMinutes) < 60) {
    if (diffMinutes === 0) return 'now';
    if (diffMinutes > 0) return `in ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
    return `${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''} ago`;
  }

  if (Math.abs(diffHours) < 24) {
    if (diffHours > 0) return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    return `${Math.abs(diffHours)} hour${Math.abs(diffHours) > 1 ? 's' : ''} ago`;
  }

  if (diffDays > 0) return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
  return `${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''} ago`;
}

/**
 * Check if a date is today.
 *
 * @param date - Date to check
 * @returns True if the date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is tomorrow.
 *
 * @param date - Date to check
 * @returns True if the date is tomorrow
 */
export function isTomorrow(date: Date): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

/**
 * Check if a date is within the next N days.
 *
 * @param date - Date to check
 * @param days - Number of days to look ahead
 * @returns True if the date is within the next N days
 */
export function isWithinNextDays(date: Date, days: number): boolean {
  const now = new Date();
  const future = new Date();
  future.setDate(future.getDate() + days);
  return date >= now && date <= future;
}

/**
 * Get the start of the day (midnight) for a given date.
 *
 * @param date - Date to get start of day for
 * @returns New Date set to midnight of the given date
 */
export function startOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the day (11:59:59 PM) for a given date.
 *
 * @param date - Date to get end of day for
 * @returns New Date set to end of the given date
 */
export function endOfDay(date: Date): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Add days to a date.
 *
 * @param date - Date to add days to
 * @param days - Number of days to add (can be negative)
 * @returns New Date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add weeks to a date.
 *
 * @param date - Date to add weeks to
 * @param weeks - Number of weeks to add (can be negative)
 * @returns New Date with weeks added
 */
export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}
