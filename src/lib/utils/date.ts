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

// ========================
// Calendar-Specific Utilities
// ========================

/**
 * Parse a time string (HH:MM or HH:MM:SS) to a Date object.
 * The date portion is set to the current date.
 *
 * @param timeString - Time string in format "HH:MM" or "HH:MM:SS"
 * @returns Date object with the parsed time
 * @throws Error if the time string is invalid
 */
export function parseTime(timeString: string): Date {
  const parts = timeString.split(':');
  if (parts.length < 2 || parts.length > 3) {
    throw new Error(`Invalid time format: ${timeString}. Expected "HH:MM" or "HH:MM:SS"`);
  }

  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts.length === 3 ? parseInt(parts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
    throw new Error(`Invalid time values: ${timeString}`);
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59 || seconds < 0 || seconds > 59) {
    throw new Error(`Time out of range: ${timeString}`);
  }

  const result = new Date();
  result.setHours(hours, minutes, seconds, 0);
  return result;
}

/**
 * Format a duration in minutes to a human-readable string.
 * Examples: "30m", "1h 30m", "2h", "1d 2h"
 *
 * @param minutes - Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '0m';

  const days = Math.floor(minutes / (24 * 60));
  const hours = Math.floor((minutes % (24 * 60)) / 60);
  const mins = minutes % 60;

  const parts: string[] = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (mins > 0 || parts.length === 0) {
    parts.push(`${mins}m`);
  }

  return parts.join(' ');
}

/**
 * Parse a duration string to minutes.
 * Supports formats: "30m", "1h 30m", "2h", "1d 2h", "90" (interpreted as minutes)
 *
 * @param duration - Duration string to parse
 * @returns Duration in minutes
 * @throws Error if the duration string is invalid
 */
export function parseDuration(duration: string): number {
  // If it's just a number, treat as minutes
  if (/^\d+$/.test(duration.trim())) {
    return parseInt(duration.trim(), 10);
  }

  let totalMinutes = 0;

  // Match patterns like "1d", "2h", "30m"
  const regex = /(\d+)\s*([dhm])/gi;
  let match;

  while ((match = regex.exec(duration)) !== null) {
    const value = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();

    switch (unit) {
      case 'd':
        totalMinutes += value * 24 * 60;
        break;
      case 'h':
        totalMinutes += value * 60;
        break;
      case 'm':
        totalMinutes += value;
        break;
    }
  }

  if (totalMinutes === 0) {
    throw new Error(`Invalid duration format: ${duration}`);
  }

  return totalMinutes;
}

/**
 * Format seconds to a time string (HH:MM:SS).
 *
 * @param seconds - Seconds to format
 * @returns Formatted time string
 */
export function formatSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get the week number for a date (ISO week date).
 *
 * @param date - Date to get week number for
 * @returns Week number (1-53)
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get the start of the week for a given date.
 *
 * @param date - Date to get week start for
 * @param startOfWeek - Day of week to start (0 = Sunday, 1 = Monday)
 * @returns New Date set to start of the week
 */
export function startOfWeek(date: Date, startOfWeek: number = 0): Date {
  const result = new Date(date);
  const day = result.getDay();
  const diff = (day - startOfWeek + 7) % 7;
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the week for a given date.
 *
 * @param date - Date to get week end for
 * @param startDayOfWeek - Day of week to start (0 = Sunday, 1 = Monday)
 * @returns New Date set to end of the week
 */
export function endOfWeek(date: Date, startDayOfWeek: number = 0): Date {
  const start = startOfWeek(date, startDayOfWeek);
  return addDays(start, 6);
}

/**
 * Get the start of the month for a given date.
 *
 * @param date - Date to get month start for
 * @returns New Date set to start of the month
 */
export function startOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setDate(1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the month for a given date.
 *
 * @param date - Date to get month end for
 * @returns New Date set to end of the month
 */
export function endOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Get the number of days in a month.
 *
 * @param date - Date within the month
 * @returns Number of days in the month
 */
export function getDaysInMonth(date: Date): number {
  return endOfMonth(date).getDate();
}

/**
 * Get the start of the year for a given date.
 *
 * @param date - Date to get year start for
 * @returns New Date set to start of the year
 */
export function startOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(0, 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get the end of the year for a given date.
 *
 * @param date - Date to get year end for
 * @returns New Date set to end of the year
 */
export function endOfYear(date: Date): Date {
  const result = new Date(date);
  result.setMonth(11, 31);
  result.setHours(23, 59, 59, 999);
  return result;
}

/**
 * Check if two time ranges overlap.
 *
 * @param start1 - Start of first range
 * @param end1 - End of first range
 * @param start2 - Start of second range
 * @param end2 - End of second range
 * @returns True if ranges overlap
 */
export function isTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Calculate the duration between two dates in minutes.
 *
 * @param start - Start date/time
 * @param end - End date/time
 * @returns Duration in minutes
 */
export function calculateDuration(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / 60000);
}

/**
 * Add minutes to a date.
 *
 * @param date - Date to add minutes to
 * @param minutes - Number of minutes to add
 * @returns New Date with minutes added
 */
export function addMinutes(date: Date, minutes: number): Date {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
}

/**
 * Add hours to a date.
 *
 * @param date - Date to add hours to
 * @param hours - Number of hours to add
 * @returns New Date with hours added
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * Add months to a date.
 * Handles month overflow (e.g., Jan 31 + 1 month = Feb 28/29).
 *
 * @param date - Date to add months to
 * @param months - Number of months to add
 * @returns New Date with months added
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const targetMonth = result.getMonth() + months;
  const targetYear = result.getFullYear() + Math.floor(targetMonth / 12);
  const newMonth = targetMonth % 12;

  // Set to first of target month to handle overflow
  result.setFullYear(targetYear, newMonth, 1);

  // Get the max day of target month
  const maxDay = getDaysInMonth(result);
  const originalDay = Math.min(date.getDate(), maxDay);

  result.setDate(originalDay);
  return result;
}

/**
 * Add years to a date.
 *
 * @param date - Date to add years to
 * @param years - Number of years to add
 * @returns New Date with years added
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Check if a date is within a date range (inclusive).
 *
 * @param date - Date to check
 * @param start - Start of range
 * @param end - End of range
 * @returns True if date is within range
 */
export function isWithinRange(date: Date, start: Date, end: Date): boolean {
  return date >= start && date <= end;
}

/**
 * Clamp a date to a range.
 *
 * @param date - Date to clamp
 * @param start - Start of range
 * @param end - End of range
 * @returns Clamped date
 */
export function clampDate(date: Date, start: Date, end: Date): Date {
  if (date < start) return new Date(start);
  if (date > end) return new Date(end);
  return new Date(date);
}

/**
 * Get the difference in days between two dates (ignoring time).
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in days
 */
export function getDaysDiff(date1: Date, date2: Date): number {
  const d1 = startOfDay(date1);
  const d2 = startOfDay(date2);
  return Math.round((d1.getTime() - d2.getTime()) / 86400000);
}

/**
 * Check if a date is in the past.
 *
 * @param date - Date to check
 * @returns True if date is in the past
 */
export function isPast(date: Date): boolean {
  return date < new Date();
}

/**
 * Check if a date is in the future.
 *
 * @param date - Date to check
 * @returns True if date is in the future
 */
export function isFuture(date: Date): boolean {
  return date > new Date();
}

/**
 * Check if two dates are the same day (ignoring time).
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Check if two dates are in the same month.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are in the same month
 */
export function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

/**
 * Check if two dates are in the same year.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @returns True if dates are in the same year
 */
export function isSameYear(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear();
}

/**
 * Get the date portion of a Date (set time to midnight).
 *
 * @param date - Date to get date portion for
 * @returns New Date with time set to midnight
 */
export function getDateOnly(date: Date): Date {
  return startOfDay(date);
}

/**
 * Combine a date and a time string into a single Date.
 *
 * @param date - Date portion
 * @param timeString - Time string in "HH:MM" or "HH:MM:SS" format
 * @returns Combined Date object
 */
export function combineDateTime(date: Date, timeString: string): Date {
  const time = parseTime(timeString);
  const result = new Date(date);
  result.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), 0);
  return result;
}

/**
 * Set the time component of a date.
 *
 * @param date - Date to modify
 * @param hours - Hours (0-23)
 * @param minutes - Minutes (0-59)
 * @param seconds - Seconds (0-59, default 0)
 * @returns New Date with specified time
 */
export function setTime(date: Date, hours: number, minutes: number, seconds: number = 0): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, seconds, 0);
  return result;
}

/**
 * Get the time component of a date as a string (HH:MM).
 *
 * @param date - Date to extract time from
 * @returns Time string in "HH:MM" format
 */
export function getTimeString(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

/**
 * Get the time component of a date as a string with seconds (HH:MM:SS).
 *
 * @param date - Date to extract time from
 * @returns Time string in "HH:MM:SS" format
 */
export function getTimeStringWithSeconds(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}
