/**
 * Timezone Utilities Tests
 */

import {
  getUserTimezone,
  formatDateInTimezone,
  getCommonTimezones,
  isValidTimezone,
  utcToLocal,
  localToUtc,
  isSameDayInTimezone,
  startOfDayInTimezone,
  endOfDayInTimezone,
} from './timezone';

describe('getUserTimezone', () => {
  it('should return a timezone string', () => {
    const tz = getUserTimezone();
    expect(typeof tz).toBe('string');
    expect(tz.length).toBeGreaterThan(0);
  });

  it('should return a valid IANA timezone', () => {
    const tz = getUserTimezone();
    expect(isValidTimezone(tz)).toBe(true);
  });
});

describe('isValidTimezone', () => {
  it('should return true for valid timezones', () => {
    expect(isValidTimezone('America/New_York')).toBe(true);
    expect(isValidTimezone('Europe/London')).toBe(true);
    expect(isValidTimezone('Asia/Tokyo')).toBe(true);
    expect(isValidTimezone('UTC')).toBe(true);
  });

  it('should return false for invalid timezones', () => {
    expect(isValidTimezone('Invalid/Timezone')).toBe(false);
    expect(isValidTimezone('')).toBe(false);
    expect(isValidTimezone('Foo/Bar')).toBe(false);
  });
});

describe('getCommonTimezones', () => {
  it('should return an array of timezones', () => {
    const timezones = getCommonTimezones();
    expect(Array.isArray(timezones)).toBe(true);
    expect(timezones.length).toBeGreaterThan(0);
  });

  it('should have timezone objects with name and label', () => {
    const timezones = getCommonTimezones();
    timezones.forEach((tz) => {
      expect(tz).toHaveProperty('name');
      expect(tz).toHaveProperty('label');
      expect(typeof tz.name).toBe('string');
      expect(typeof tz.label).toBe('string');
    });
  });

  it('should include common timezones', () => {
    const timezones = getCommonTimezones();
    const names = timezones.map((tz) => tz.name);
    expect(names).toContain('UTC');
    expect(names).toContain('America/New_York');
    expect(names).toContain('Europe/London');
  });
});

describe('formatDateInTimezone', () => {
  it('should format date in different timezone', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const formatted = formatDateInTimezone(date, 'America/New_York', 'short');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('should format date in UTC', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const formatted = formatDateInTimezone(date, 'UTC', 'short');
    expect(typeof formatted).toBe('string');
    expect(formatted.length).toBeGreaterThan(0);
  });
});

describe('isSameDayInTimezone', () => {
  it('should return true for same day in timezone', () => {
    const date1 = new Date('2024-01-01T10:00:00Z');
    const date2 = new Date('2024-01-01T20:00:00Z');
    expect(isSameDayInTimezone(date1, date2, 'UTC')).toBe(true);
  });

  it('should return false for different days in timezone', () => {
    const date1 = new Date('2024-01-01T23:00:00Z');
    const date2 = new Date('2024-01-02T01:00:00Z');
    expect(isSameDayInTimezone(date1, date2, 'UTC')).toBe(false);
  });

  it('should handle timezone conversion correctly', () => {
    // 6PM EST on Jan 1 is 11PM UTC on Jan 1
    const date1 = new Date('2024-01-01T23:00:00Z');
    // 2AM EST on Jan 2 is 7AM UTC on Jan 2
    const date2 = new Date('2024-01-02T07:00:00Z');
    expect(isSameDayInTimezone(date1, date2, 'UTC')).toBe(false);
  });
});

describe('startOfDayInTimezone', () => {
  it('should return start of day in UTC', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const start = startOfDayInTimezone(date, 'UTC');
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
    expect(start.getSeconds()).toBe(0);
  });
});

describe('endOfDayInTimezone', () => {
  it('should return end of day in UTC', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    const end = endOfDayInTimezone(date, 'UTC');
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });
});

describe('utcToLocal and localToUtc roundtrip', () => {
  it('should maintain date time on roundtrip', () => {
    const originalDate = new Date('2024-01-01T12:00:00Z');
    const local = utcToLocal(originalDate);
    const backToUtc = localToUtc(local, 'UTC');

    expect(Math.abs(backToUtc.getTime() - originalDate.getTime())).toBeLessThan(1000);
  });
});
