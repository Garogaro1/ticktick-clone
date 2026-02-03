/**
 * Timezone utilities for calendar functionality.
 *
 * Provides utilities for working with timezones in the browser and server.
 * Uses Intl API for timezone detection and conversion.
 */

/**
 * Get the user's timezone from the browser.
 * Falls back to UTC if timezone detection fails.
 *
 * @returns User's timezone string (e.g., "America/New_York", "Europe/London")
 */
export function getUserTimezone(): string {
  if (typeof Intl !== 'undefined' && Intl.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'UTC';
}

/**
 * Convert a date from one timezone to another.
 * Takes a date representing a time in fromTimezone and returns a date
 * representing the equivalent wall-clock time in toTimezone.
 *
 * @param date - Date to convert
 * @param fromTimezone - Source timezone
 * @param toTimezone - Target timezone
 * @returns New Date with converted time
 */
export function convertTimezone(date: Date, fromTimezone: string, toTimezone: string): Date {
  // Get the time components in the source timezone
  const fromFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: fromTimezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const fromParts = fromFormatter.formatToParts(date);
  const year = parseInt(fromParts.find((p) => p.type === 'year')?.value || '0', 10);
  const month = parseInt(fromParts.find((p) => p.type === 'month')?.value || '0', 10) - 1;
  const day = parseInt(fromParts.find((p) => p.type === 'day')?.value || '0', 10);
  const hour = parseInt(fromParts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(fromParts.find((p) => p.type === 'minute')?.value || '0', 10);
  const second = parseInt(fromParts.find((p) => p.type === 'second')?.value || '0', 10);

  // Create a date with the source timezone's wall-clock time
  const sourceWallTime = new Date(year, month, day, hour, minute, second);

  // Get the timezone offset difference between the two timezones
  const fromOffset = getTimezoneOffset(fromTimezone, date);
  const toOffset = getTimezoneOffset(toTimezone, date);
  const offsetDiff = fromOffset - toOffset;

  // Apply the offset difference to get the equivalent time in the target timezone
  return new Date(sourceWallTime.getTime() + offsetDiff);
}

/**
 * Set a date to a specific timezone without changing the displayed time.
 * This creates a new Date object that represents the same local time in a different timezone.
 *
 * @param date - Date to convert
 * @param timezone - Target timezone
 * @returns New Date adjusted to the target timezone
 */
export function setTimezone(date: Date, timezone: string): Date {
  // Create a formatter to get the local time components in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  // Get the formatted parts for the target timezone
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10) - 1;
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const second = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);

  // Create a new date that, when formatted in the target timezone, shows the same wall-clock time
  // We do this by creating a UTC date that will display as the target time in the target timezone
  const targetDate = new Date(Date.UTC(year, month, day, hour, minute, second));

  // Adjust for the target timezone offset from UTC
  const offset = getTimezoneOffset(timezone, date);
  return new Date(targetDate.getTime() - offset);
}

/**
 * Format a date in a specific timezone.
 *
 * @param date - Date to format
 * @param timezone - Timezone to format in
 * @param format - Format style ('full', 'long', 'medium', 'short', or custom options)
 * @returns Formatted date string
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  format: 'full' | 'long' | 'medium' | 'short' = 'short'
): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
  };

  switch (format) {
    case 'full':
      options.dateStyle = 'full';
      options.timeStyle = 'full';
      break;
    case 'long':
      options.dateStyle = 'long';
      options.timeStyle = 'long';
      break;
    case 'medium':
      options.dateStyle = 'medium';
      options.timeStyle = 'medium';
      break;
    case 'short':
      options.dateStyle = 'short';
      options.timeStyle = 'short';
      break;
  }

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Get the timezone offset for a given timezone at a specific date.
 *
 * @param timezone - Timezone to get offset for
 * @param date - Date to get offset at (defaults to now)
 * @returns Offset in milliseconds from UTC
 */
export function getTimezoneOffset(timezone: string, date: Date = new Date()): number {
  // Special case for UTC
  if (timezone === 'UTC') {
    return 0;
  }

  // Create a date string in the target timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  // Get the UTC date/time components
  const utcYear = date.getUTCFullYear();
  const utcMonth = date.getUTCMonth();
  const utcDay = date.getUTCDate();
  const utcHour = date.getUTCHours();
  const utcMinute = date.getUTCMinutes();
  const utcSecond = date.getUTCSeconds();

  // Format the date in the target timezone
  const formatted = formatter.format(date);
  const [monthStr, dayStr, yearStr, timeStr] = formatted.split(/[/, :]/);
  const [hourStr, minuteStr] = timeStr.split(':');

  // Parse the target timezone date/time
  const tzYear = parseInt(yearStr, 10);
  const tzMonth = parseInt(monthStr, 10) - 1;
  const tzDay = parseInt(dayStr, 10);
  const tzHour = parseInt(hourStr, 10);
  const tzMinute = parseInt(minuteStr, 10);

  // Create Date objects for both
  const utcDate = Date.UTC(utcYear, utcMonth, utcDay, utcHour, utcMinute, utcSecond);
  const tzDate = Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, 0);

  // Return the difference
  return tzDate - utcDate;
}

/**
 * Check if a timezone is valid.
 *
 * @param timezone - Timezone string to validate
 * @returns True if the timezone is valid
 */
export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a list of common timezones.
 *
 * @returns Array of timezone objects with name and offset
 */
export function getCommonTimezones(): Array<{ name: string; label: string }> {
  const timezones = [
    { name: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { name: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { name: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { name: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { name: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { name: 'America/Anchorage', label: 'Alaska Time' },
    { name: 'Pacific/Honolulu', label: 'Hawaii-Aleutian Time' },
    { name: 'Europe/London', label: 'London (GMT/BST)' },
    { name: 'Europe/Paris', label: 'Central European Time' },
    { name: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
    { name: 'Europe/Moscow', label: 'Moscow Time' },
    { name: 'Asia/Dubai', label: 'Gulf Standard Time' },
    { name: 'Asia/Kolkata', label: 'India Standard Time' },
    { name: 'Asia/Bangkok', label: 'Indochina Time' },
    { name: 'Asia/Shanghai', label: 'China Standard Time' },
    { name: 'Asia/Tokyo', label: 'Japan Standard Time' },
    { name: 'Asia/Seoul', label: 'Korea Standard Time' },
    { name: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
    { name: 'Pacific/Auckland', label: 'New Zealand Time' },
  ];

  return timezones;
}

/**
 * Convert a UTC date to the user's local timezone.
 *
 * This function takes a Date object that represents a moment in UTC time
 * and returns a new Date object that represents the same moment but will
 * display local time when using standard Date methods.
 *
 * Note: JavaScript Date objects always store time internally as UTC.
 * The "timezone" is only relevant for display (getFullYear, getHours, etc.)
 * and formatting operations.
 *
 * @param utcDate - Date representing a moment in UTC
 * @param userTimezone - User's timezone (defaults to detected timezone)
 * @returns The same Date object (no conversion needed for internal UTC storage)
 */
export function utcToLocal(utcDate: Date): Date {
  // Since JavaScript Dates store time as UTC internally, we don't need to modify
  // the underlying timestamp. The returned date will represent the same instant.
  // For display purposes, use formatDateInTimezone() instead.
  //
  // Note: The userTimezone parameter was removed because JavaScript Dates
  // always store time as UTC internally. Timezone is only relevant for display.
  return new Date(utcDate.getTime());
}

/**
 * Convert a local date (in user's timezone) to UTC.
 *
 * This function interprets the input Date as representing a local time in the
 * specified timezone, and returns a Date object representing the equivalent UTC moment.
 *
 * @param localDate - Date interpreted as local time in userTimezone
 * @param userTimezone - User's timezone (defaults to detected timezone)
 * @returns Date object representing the equivalent UTC moment
 */
export function localToUtc(localDate: Date, userTimezone?: string): Date {
  const tz = userTimezone || getUserTimezone();

  // For UTC, the input is already UTC, so just return a copy
  if (tz === 'UTC') {
    return new Date(localDate.getTime());
  }

  // Create a formatter to get the timezone offset
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  // Format the local time in the user's timezone to get the equivalent UTC time
  const parts = formatter.formatToParts(localDate);
  const tzYear = parseInt(parts.find((p) => p.type === 'year')?.value || '0', 10);
  const tzMonth = parseInt(parts.find((p) => p.type === 'month')?.value || '1', 10) - 1;
  const tzDay = parseInt(parts.find((p) => p.type === 'day')?.value || '1', 10);
  const tzHour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const tzMinute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
  const tzSecond = parseInt(parts.find((p) => p.type === 'second')?.value || '0', 10);

  // Create the UTC date from the timezone-specific components
  return new Date(Date.UTC(tzYear, tzMonth, tzDay, tzHour, tzMinute, tzSecond));
}

/**
 * Get the IANA timezone name for a date.
 *
 * @param date - Date to get timezone for
 * @param timezone - Timezone to check
 * @returns IANA timezone name
 */
export function getTimezoneName(date: Date, timezone: string): string {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'long',
  });
  const parts = formatter.formatToParts(date);
  const timeZoneNamePart = parts.find((p) => p.type === 'timeZoneName');
  return timeZoneNamePart?.value || timezone;
}

/**
 * Check if two dates are in the same day in a specific timezone.
 *
 * @param date1 - First date
 * @param date2 - Second date
 * @param timezone - Timezone to check in
 * @returns True if dates are the same day in the specified timezone
 */
export function isSameDayInTimezone(date1: Date, date2: Date, timezone: string): boolean {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  return formatter.format(date1) === formatter.format(date2);
}

/**
 * Get the start of day in a specific timezone.
 *
 * @param date - Date to get start of day for
 * @param timezone - Timezone to use
 * @returns Date representing start of day in the specified timezone
 */
export function startOfDayInTimezone(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1');

  return new Date(year, month, day, 0, 0, 0);
}

/**
 * Get the end of day in a specific timezone.
 *
 * @param date - Date to get end of day for
 * @param timezone - Timezone to use
 * @returns Date representing end of day in the specified timezone
 */
export function endOfDayInTimezone(date: Date, timezone: string): Date {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find((p) => p.type === 'year')?.value || '0');
  const month = parseInt(parts.find((p) => p.type === 'month')?.value || '1') - 1;
  const day = parseInt(parts.find((p) => p.type === 'day')?.value || '1');

  return new Date(year, month, day, 23, 59, 59, 999);
}
