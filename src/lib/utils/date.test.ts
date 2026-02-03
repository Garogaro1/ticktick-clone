/**
 * Calendar Date Utilities Tests
 */

import {
  parseTime,
  formatDuration,
  parseDuration,
  formatSecondsToTime,
  getWeekNumber,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  getDaysInMonth,
  startOfYear,
  endOfYear,
  isTimeOverlap,
  calculateDuration,
  addMinutes,
  addHours,
  addMonths,
  addYears,
  isWithinRange,
  clampDate,
  getDaysDiff,
  isPast,
  isFuture,
  isSameDay,
  isSameMonth,
  isSameYear,
  getDateOnly,
  combineDateTime,
  setTime,
  getTimeString,
  getTimeStringWithSeconds,
} from './date';

describe('parseTime', () => {
  it('should parse HH:MM format', () => {
    const result = parseTime('14:30');
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });

  it('should parse HH:MM:SS format', () => {
    const result = parseTime('14:30:45');
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(45);
  });

  it('should parse midnight', () => {
    const result = parseTime('00:00');
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
  });

  it('should parse 23:59:59', () => {
    const result = parseTime('23:59:59');
    expect(result.getHours()).toBe(23);
    expect(result.getMinutes()).toBe(59);
    expect(result.getSeconds()).toBe(59);
  });

  it('should throw error for invalid format', () => {
    expect(() => parseTime('invalid')).toThrow();
  });

  it('should throw error for out of range hours', () => {
    expect(() => parseTime('24:00')).toThrow();
  });

  it('should throw error for out of range minutes', () => {
    expect(() => parseTime('12:60')).toThrow();
  });
});

describe('formatDuration', () => {
  it('should format 0 minutes', () => {
    expect(formatDuration(0)).toBe('0m');
  });

  it('should format minutes only', () => {
    expect(formatDuration(30)).toBe('30m');
    expect(formatDuration(59)).toBe('59m');
  });

  it('should format hours and minutes', () => {
    expect(formatDuration(90)).toBe('1h 30m');
    expect(formatDuration(120)).toBe('2h');
    expect(formatDuration(150)).toBe('2h 30m');
  });

  it('should format days, hours, and minutes', () => {
    expect(formatDuration(1500)).toBe('1d 1h');
    expect(formatDuration(1530)).toBe('1d 1h 30m');
    expect(formatDuration(2880)).toBe('2d');
  });
});

describe('parseDuration', () => {
  it('should parse minutes as number', () => {
    expect(parseDuration('30')).toBe(30);
    expect(parseDuration('120')).toBe(120);
  });

  it('should parse minutes format', () => {
    expect(parseDuration('30m')).toBe(30);
    expect(parseDuration('90m')).toBe(90);
  });

  it('should parse hours format', () => {
    expect(parseDuration('2h')).toBe(120);
    // Note: decimal hours like "1.5h" are not supported, use "1h 30m" instead
  });

  it('should parse days format', () => {
    expect(parseDuration('1d')).toBe(1440);
    expect(parseDuration('2d')).toBe(2880);
  });

  it('should parse combined format', () => {
    expect(parseDuration('1h 30m')).toBe(90);
    expect(parseDuration('1d 2h')).toBe(1560);
    expect(parseDuration('1d 2h 30m')).toBe(1590);
  });

  it('should be case insensitive', () => {
    expect(parseDuration('1H 30M')).toBe(90);
    expect(parseDuration('1D')).toBe(1440);
  });

  it('should throw error for invalid format', () => {
    expect(() => parseDuration('invalid')).toThrow();
  });
});

describe('formatSecondsToTime', () => {
  it('should format seconds only', () => {
    expect(formatSecondsToTime(45)).toBe('0:45');
    expect(formatSecondsToTime(59)).toBe('0:59');
  });

  it('should format minutes and seconds', () => {
    expect(formatSecondsToTime(90)).toBe('1:30');
    expect(formatSecondsToTime(3599)).toBe('59:59');
  });

  it('should format hours, minutes, and seconds', () => {
    expect(formatSecondsToTime(3600)).toBe('1:00:00');
    expect(formatSecondsToTime(3661)).toBe('1:01:01');
    expect(formatSecondsToTime(86400)).toBe('24:00:00');
  });
});

describe('getWeekNumber', () => {
  it('should return correct week number', () => {
    // Jan 1, 2024 is week 1
    expect(getWeekNumber(new Date('2024-01-01'))).toBe(1);
    // Jan 8, 2024 is week 2
    expect(getWeekNumber(new Date('2024-01-08'))).toBe(2);
  });
});

describe('startOfWeek', () => {
  it('should return Sunday as start of week (default)', () => {
    const wednesday = new Date('2024-01-10'); // Wednesday
    const start = startOfWeek(wednesday, 0);
    expect(start.getDay()).toBe(0); // Sunday
    expect(start.getDate()).toBe(7); // Jan 7
  });

  it('should return Monday as start of week', () => {
    const wednesday = new Date('2024-01-10'); // Wednesday
    const start = startOfWeek(wednesday, 1);
    expect(start.getDay()).toBe(1); // Monday
    expect(start.getDate()).toBe(8); // Jan 8
  });
});

describe('endOfWeek', () => {
  it('should return Saturday as end of week (Sunday start)', () => {
    const wednesday = new Date('2024-01-10'); // Wednesday
    const end = endOfWeek(wednesday, 0);
    expect(end.getDay()).toBe(6); // Saturday
    expect(end.getDate()).toBe(13); // Jan 13
  });

  it('should return Sunday as end of week (Monday start)', () => {
    const wednesday = new Date('2024-01-10'); // Wednesday
    const end = endOfWeek(wednesday, 1);
    expect(end.getDay()).toBe(0); // Sunday
    expect(end.getDate()).toBe(14); // Jan 14
  });
});

describe('startOfMonth', () => {
  it('should return start of month', () => {
    const date = new Date('2024-01-15');
    const start = startOfMonth(date);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(0);
    expect(start.getFullYear()).toBe(2024);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });
});

describe('endOfMonth', () => {
  it('should return end of January', () => {
    const date = new Date('2024-01-15');
    const end = endOfMonth(date);
    expect(end.getDate()).toBe(31);
    expect(end.getMonth()).toBe(0);
  });

  it('should return end of February in leap year', () => {
    const date = new Date('2024-02-15');
    const end = endOfMonth(date);
    expect(end.getDate()).toBe(29);
    expect(end.getMonth()).toBe(1);
  });

  it('should return end of February in non-leap year', () => {
    const date = new Date('2023-02-15');
    const end = endOfMonth(date);
    expect(end.getDate()).toBe(28);
    expect(end.getMonth()).toBe(1);
  });
});

describe('getDaysInMonth', () => {
  it('should return 31 for January', () => {
    expect(getDaysInMonth(new Date('2024-01-15'))).toBe(31);
  });

  it('should return 29 for February in leap year', () => {
    expect(getDaysInMonth(new Date('2024-02-15'))).toBe(29);
  });

  it('should return 28 for February in non-leap year', () => {
    expect(getDaysInMonth(new Date('2023-02-15'))).toBe(28);
  });

  it('should return 30 for April', () => {
    expect(getDaysInMonth(new Date('2024-04-15'))).toBe(30);
  });
});

describe('startOfYear', () => {
  it('should return Jan 1 00:00:00', () => {
    const date = new Date('2024-06-15');
    const start = startOfYear(date);
    expect(start.getDate()).toBe(1);
    expect(start.getMonth()).toBe(0);
    expect(start.getFullYear()).toBe(2024);
    expect(start.getHours()).toBe(0);
  });
});

describe('endOfYear', () => {
  it('should return Dec 31 23:59:59', () => {
    const date = new Date('2024-06-15');
    const end = endOfYear(date);
    expect(end.getDate()).toBe(31);
    expect(end.getMonth()).toBe(11);
    expect(end.getFullYear()).toBe(2024);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
  });
});

describe('isTimeOverlap', () => {
  it('should detect overlapping ranges', () => {
    const start1 = new Date('2024-01-01T10:00:00');
    const end1 = new Date('2024-01-01T12:00:00');
    const start2 = new Date('2024-01-01T11:00:00');
    const end2 = new Date('2024-01-01T13:00:00');
    expect(isTimeOverlap(start1, end1, start2, end2)).toBe(true);
  });

  it('should return false for non-overlapping ranges', () => {
    const start1 = new Date('2024-01-01T10:00:00');
    const end1 = new Date('2024-01-01T12:00:00');
    const start2 = new Date('2024-01-01T12:00:00');
    const end2 = new Date('2024-01-01T14:00:00');
    expect(isTimeOverlap(start1, end1, start2, end2)).toBe(false);
  });

  it('should handle contained ranges', () => {
    const start1 = new Date('2024-01-01T10:00:00');
    const end1 = new Date('2024-01-01T14:00:00');
    const start2 = new Date('2024-01-01T11:00:00');
    const end2 = new Date('2024-01-01T12:00:00');
    expect(isTimeOverlap(start1, end1, start2, end2)).toBe(true);
  });
});

describe('calculateDuration', () => {
  it('should calculate duration in minutes', () => {
    const start = new Date('2024-01-01T10:00:00');
    const end = new Date('2024-01-01T12:30:00');
    expect(calculateDuration(start, end)).toBe(150);
  });

  it('should handle negative duration', () => {
    const start = new Date('2024-01-01T12:30:00');
    const end = new Date('2024-01-01T10:00:00');
    expect(calculateDuration(start, end)).toBe(-150);
  });
});

describe('addMinutes', () => {
  it('should add minutes to date', () => {
    const date = new Date('2024-01-01T10:00:00');
    const result = addMinutes(date, 30);
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
  });

  it('should handle rollover', () => {
    const date = new Date('2024-01-01T23:45:00');
    const result = addMinutes(date, 30);
    expect(result.getHours()).toBe(0);
    expect(result.getDate()).toBe(2);
  });
});

describe('addHours', () => {
  it('should add hours to date', () => {
    const date = new Date('2024-01-01T10:00:00');
    const result = addHours(date, 5);
    expect(result.getHours()).toBe(15);
  });

  it('should handle rollover', () => {
    const date = new Date('2024-01-01T22:00:00');
    const result = addHours(date, 5);
    expect(result.getHours()).toBe(3);
    expect(result.getDate()).toBe(2);
  });
});

describe('addMonths', () => {
  it('should add months to date', () => {
    const date = new Date('2024-01-15');
    const result = addMonths(date, 2);
    expect(result.getMonth()).toBe(2); // March
    expect(result.getFullYear()).toBe(2024);
  });

  it('should handle year rollover', () => {
    const date = new Date('2024-11-15');
    const result = addMonths(date, 3);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getFullYear()).toBe(2025);
  });

  it('should handle month overflow (Jan 31 + 1 month)', () => {
    const date = new Date('2024-01-31');
    const result = addMonths(date, 1);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(29); // Feb 29 (leap year)
  });
});

describe('addYears', () => {
  it('should add years to date', () => {
    const date = new Date('2024-01-15');
    const result = addYears(date, 2);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('should handle leap year', () => {
    const date = new Date('2024-02-29');
    const result = addYears(date, 1);
    expect(result.getFullYear()).toBe(2025);
    // JavaScript's standard Date behavior rolls Feb 29 to Mar 1 in non-leap years
    expect(result.getMonth()).toBe(2); // March
    expect(result.getDate()).toBe(1); // Mar 1 (since 2025 is not a leap year)
  });
});

describe('isWithinRange', () => {
  it('should return true for date within range', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const date = new Date('2024-01-15');
    expect(isWithinRange(date, start, end)).toBe(true);
  });

  it('should return true for date at start', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    expect(isWithinRange(start, start, end)).toBe(true);
  });

  it('should return true for date at end', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    expect(isWithinRange(end, start, end)).toBe(true);
  });

  it('should return false for date before range', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const date = new Date('2023-12-31');
    expect(isWithinRange(date, start, end)).toBe(false);
  });

  it('should return false for date after range', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const date = new Date('2024-02-01');
    expect(isWithinRange(date, start, end)).toBe(false);
  });
});

describe('clampDate', () => {
  it('should return date if within range', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const date = new Date('2024-01-15');
    const result = clampDate(date, start, end);
    expect(result.getTime()).toBe(date.getTime());
  });

  it('should return start if date is before', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const date = new Date('2023-12-31');
    const result = clampDate(date, start, end);
    expect(result.getTime()).toBe(start.getTime());
  });

  it('should return end if date is after', () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-01-31');
    const date = new Date('2024-02-01');
    const result = clampDate(date, start, end);
    expect(result.getTime()).toBe(end.getTime());
  });
});

describe('getDaysDiff', () => {
  it('should return 0 for same day', () => {
    const date1 = new Date('2024-01-01T10:00:00');
    const date2 = new Date('2024-01-01T18:00:00');
    expect(getDaysDiff(date1, date2)).toBe(0);
  });

  it('should return positive difference', () => {
    const date1 = new Date('2024-01-05');
    const date2 = new Date('2024-01-01');
    expect(getDaysDiff(date1, date2)).toBe(4);
  });

  it('should return negative difference', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-05');
    expect(getDaysDiff(date1, date2)).toBe(-4);
  });
});

describe('isPast', () => {
  it('should return true for past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(isPast(past)).toBe(true);
  });

  it('should return false for future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    expect(isPast(future)).toBe(false);
  });
});

describe('isFuture', () => {
  it('should return true for future date', () => {
    const future = new Date();
    future.setDate(future.getDate() + 1);
    expect(isFuture(future)).toBe(true);
  });

  it('should return false for past date', () => {
    const past = new Date();
    past.setDate(past.getDate() - 1);
    expect(isFuture(past)).toBe(false);
  });
});

describe('isSameDay', () => {
  it('should return true for same day', () => {
    const date1 = new Date('2024-01-01T10:00:00');
    const date2 = new Date('2024-01-01T18:00:00');
    expect(isSameDay(date1, date2)).toBe(true);
  });

  it('should return false for different days', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-02');
    expect(isSameDay(date1, date2)).toBe(false);
  });
});

describe('isSameMonth', () => {
  it('should return true for same month', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-01-31');
    expect(isSameMonth(date1, date2)).toBe(true);
  });

  it('should return false for different months', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-02-01');
    expect(isSameMonth(date1, date2)).toBe(false);
  });

  it('should return false for different years', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2023-01-01');
    expect(isSameMonth(date1, date2)).toBe(false);
  });
});

describe('isSameYear', () => {
  it('should return true for same year', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2024-12-31');
    expect(isSameYear(date1, date2)).toBe(true);
  });

  it('should return false for different years', () => {
    const date1 = new Date('2024-01-01');
    const date2 = new Date('2023-01-01');
    expect(isSameYear(date1, date2)).toBe(false);
  });
});

describe('getDateOnly', () => {
  it('should return date with time set to midnight', () => {
    const date = new Date('2024-01-01T14:30:45');
    const result = getDateOnly(date);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('combineDateTime', () => {
  it('should combine date and time string', () => {
    const date = new Date('2024-01-01');
    const result = combineDateTime(date, '14:30');
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(1);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
  });

  it('should combine date and time string with seconds', () => {
    const date = new Date('2024-01-01');
    const result = combineDateTime(date, '14:30:45');
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(45);
  });
});

describe('setTime', () => {
  it('should set time on date', () => {
    const date = new Date('2024-01-01');
    const result = setTime(date, 14, 30, 45);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(45);
  });

  it('should default seconds to 0', () => {
    const date = new Date('2024-01-01');
    const result = setTime(date, 14, 30);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
  });
});

describe('getTimeString', () => {
  it('should return time string in HH:MM format', () => {
    const date = new Date('2024-01-01T14:30:45');
    expect(getTimeString(date)).toBe('14:30');
  });

  it('should pad single digit hours', () => {
    const date = new Date('2024-01-01T09:05:00');
    expect(getTimeString(date)).toBe('09:05');
  });
});

describe('getTimeStringWithSeconds', () => {
  it('should return time string in HH:MM:SS format', () => {
    const date = new Date('2024-01-01T14:30:45');
    expect(getTimeStringWithSeconds(date)).toBe('14:30:45');
  });

  it('should pad single digits', () => {
    const date = new Date('2024-01-01T09:05:03');
    expect(getTimeStringWithSeconds(date)).toBe('09:05:03');
  });
});
