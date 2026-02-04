/**
 * Habit Tracker Utilities
 *
 * Helper functions for streak calculation, completion tracking, and date operations.
 */

import type { HabitEntryDto, HabitStreakData, HabitCompletionData } from './types';
import {
  startOfDay,
  endOfDay,
  addDays,
  isSameDay,
  differenceInDays,
  subDays,
} from '@/lib/utils/date';

// ============================================================================
// Streak Calculation
// ============================================================================

/**
 * Calculate the current and longest streak for a habit.
 *
 * @param entries - Array of habit entries sorted by date (ascending)
 * @param frequency - Habit frequency (daily, weekly, monthly)
 * @returns Streak data with current and longest streaks
 */
export function calculateStreak(
  entries: HabitEntryDto[],
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily'
): HabitStreakData {
  if (entries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Get today's date (end of day for comparison)
  const today = endOfDay(new Date());

  // Filter out future entries
  const pastEntries = sortedEntries.filter((e) => startOfDay(e.date) <= today);

  if (pastEntries.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
    };
  }

  // Calculate current streak
  let currentStreak = 0;
  let checkDate = today;

  // Check if streak is still active (most recent entry is within allowed gap)
  const mostRecentEntry = pastEntries[pastEntries.length - 1];
  const daysSinceLastEntry = differenceInDays(today, startOfDay(mostRecentEntry.date));
  const allowedGapDays = getAllowedGapDays(frequency);

  if (daysSinceLastEntry <= allowedGapDays) {
    // Streak is active, count consecutive days
    for (let i = pastEntries.length - 1; i >= 0; i--) {
      const entry = pastEntries[i];
      const entryDate = startOfDay(entry.date);

      if (isWithinAllowedInterval(checkDate, entryDate, frequency)) {
        currentStreak++;
        checkDate = subDays(checkDate, getStepDays(frequency));
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const entry of pastEntries) {
    const entryDate = startOfDay(entry.date);

    if (lastDate === null) {
      tempStreak = 1;
      lastDate = entryDate;
    } else if (isWithinAllowedInterval(lastDate, entryDate, frequency)) {
      tempStreak++;
      lastDate = entryDate;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
      lastDate = entryDate;
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  return {
    currentStreak,
    longestStreak,
    streakStartDate: currentStreak > 0 ? getDateFromStreak(currentStreak, frequency) : undefined,
    lastCompletionDate: mostRecentEntry.date,
  };
}

/**
 * Get the allowed gap in days before a streak is considered broken.
 */
function getAllowedGapDays(frequency: 'daily' | 'weekly' | 'monthly'): number {
  switch (frequency) {
    case 'daily':
      return 1; // Allow missing 1 day
    case 'weekly':
      return 7; // Allow missing 1 week
    case 'monthly':
      return 31; // Allow missing 1 month
  }
}

/**
 * Get the step in days for each frequency.
 */
function getStepDays(frequency: 'daily' | 'weekly' | 'monthly'): number {
  switch (frequency) {
    case 'daily':
      return 1;
    case 'weekly':
      return 7;
    case 'monthly':
      return 30; // Approximate
  }
}

/**
 * Check if two dates are within the allowed interval for the frequency.
 */
function isWithinAllowedInterval(
  date1: Date,
  date2: Date,
  frequency: 'daily' | 'weekly' | 'monthly'
): boolean {
  const daysDiff = Math.abs(differenceInDays(date1, date2));
  const stepDays = getStepDays(frequency);

  return daysDiff <= stepDays;
}

/**
 * Get the start date from a streak count.
 */
function getDateFromStreak(streak: number, frequency: 'daily' | 'weekly' | 'monthly'): Date {
  const stepDays = getStepDays(frequency);
  return subDays(new Date(), (streak - 1) * stepDays);
}

// ============================================================================
// Completion Checking
// ============================================================================

/**
 * Check if a habit is completed on a specific date.
 *
 * @param entries - Array of habit entries
 * @param date - Date to check
 * @param targetCount - Target count for completion
 * @returns True if habit is completed on the given date
 */
export function isCompletedOnDate(
  entries: HabitEntryDto[],
  date: Date,
  targetCount: number = 1
): boolean {
  const checkDate = startOfDay(date);

  const dayEntries = entries.filter((e) => isSameDay(e.date, checkDate));
  const totalCount = dayEntries.reduce((sum, e) => sum + e.count, 0);

  return totalCount >= targetCount;
}

/**
 * Get the completion count for a habit on a specific date.
 *
 * @param entries - Array of habit entries
 * @param date - Date to check
 * @returns Total count for the date
 */
export function getCompletionCount(entries: HabitEntryDto[], date: Date): number {
  const checkDate = startOfDay(date);

  return entries.filter((e) => isSameDay(e.date, checkDate)).reduce((sum, e) => sum + e.count, 0);
}

/**
 * Check if a habit is completed today.
 *
 * @param entries - Array of habit entries
 * @param targetCount - Target count for completion
 * @returns True if habit is completed today
 */
export function isCompletedToday(entries: HabitEntryDto[], targetCount: number = 1): boolean {
  return isCompletedOnDate(entries, new Date(), targetCount);
}

// ============================================================================
// Completion Rate Calculation
// ============================================================================

/**
 * Calculate the completion rate for a habit over a date range.
 *
 * @param entries - Array of habit entries
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @param frequency - Habit frequency
 * @param targetCount - Target count per period
 * @returns Completion rate as a percentage (0-100)
 */
export function calculateCompletionRate(
  entries: HabitEntryDto[],
  startDate: Date,
  endDate: Date,
  frequency: 'daily' | 'weekly' | 'monthly' = 'daily',
  targetCount: number = 1
): number {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  // Calculate total periods
  const totalDays = differenceInDays(end, start) + 1;
  let totalPeriods: number;

  switch (frequency) {
    case 'daily':
      totalPeriods = totalDays;
      break;
    case 'weekly':
      totalPeriods = Math.ceil(totalDays / 7);
      break;
    case 'monthly':
      totalPeriods = Math.ceil(totalDays / 30); // Approximate
      break;
  }

  if (totalPeriods <= 0) return 0;

  // Count completed periods
  let completedPeriods = 0;
  let checkDate = start;

  while (checkDate <= end) {
    const count = getCompletionCount(entries, checkDate);
    if (count >= targetCount) {
      completedPeriods++;
    }

    // Move to next period
    checkDate = addDays(checkDate, getStepDays(frequency));
  }

  return Math.round((completedPeriods / totalPeriods) * 100);
}

// ============================================================================
// Calendar Data Generation
// ============================================================================

/**
 * Generate completion data for a calendar view.
 *
 * @param entries - Array of habit entries
 * @param startDate - Start date
 * @param endDate - End date
 * @param targetCount - Target count for completion
 * @returns Array of completion data for each day
 */
export function generateCalendarData(
  entries: HabitEntryDto[],
  startDate: Date,
  endDate: Date,
  targetCount: number = 1
): HabitCompletionData[] {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  const data: HabitCompletionData[] = [];

  let currentDate = start;
  while (currentDate <= end) {
    const count = getCompletionCount(entries, currentDate);
    data.push({
      date: new Date(currentDate),
      completed: count >= targetCount,
      count,
      targetCount,
    });

    currentDate = addDays(currentDate, 1);
  }

  return data;
}

/**
 * Get the best day for a habit (day with most completions).
 *
 * @param entries - Array of habit entries
 * @returns Day of week (0-6, where 0 is Sunday)
 */
export function getBestDay(entries: HabitEntryDto[]): number {
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];

  for (const entry of entries) {
    const day = entry.date.getDay();
    dayCounts[day] += entry.count;
  }

  return dayCounts.indexOf(Math.max(...dayCounts));
}

/**
 * Get the most productive month for a habit.
 *
 * @param entries - Array of habit entries
 * @returns Month index (0-11, where 0 is January)
 */
export function getBestMonth(entries: HabitEntryDto[]): number {
  const monthCounts = new Array(12).fill(0);

  for (const entry of entries) {
    const month = entry.date.getMonth();
    monthCounts[month] += entry.count;
  }

  return monthCounts.indexOf(Math.max(...monthCounts));
}

// ============================================================================
// Entry Helpers
// ============================================================================

/**
 * Get entries for a specific date range.
 *
 * @param entries - Array of habit entries
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Filtered entries
 */
export function getEntriesInRange(
  entries: HabitEntryDto[],
  startDate: Date,
  endDate: Date
): HabitEntryDto[] {
  const start = startOfDay(startDate);
  const end = endOfDay(endDate);

  return entries.filter((e) => {
    const entryDate = startOfDay(e.date);
    return entryDate >= start && entryDate <= end;
  });
}

/**
 * Get today's entry for a habit.
 *
 * @param entries - Array of habit entries
 * @returns Today's entry or null
 */
export function getTodayEntry(entries: HabitEntryDto[]): HabitEntryDto | null {
  const today = startOfDay(new Date());
  return entries.find((e) => isSameDay(e.date, today)) || null;
}

/**
 * Get entries for this week.
 *
 * @param entries - Array of habit entries
 * @returns This week's entries
 */
export function getThisWeekEntries(entries: HabitEntryDto[]): HabitEntryDto[] {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return getEntriesInRange(entries, startOfWeek, endOfWeek);
}

/**
 * Get entries for this month.
 *
 * @param entries - Array of habit entries
 * @returns This month's entries
 */
export function getThisMonthEntries(entries: HabitEntryDto[]): HabitEntryDto[] {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return getEntriesInRange(entries, startOfMonth, endOfMonth);
}

// ============================================================================
// Color Utilities
// ============================================================================

/**
 * Default habit colors for the color picker.
 */
export const DEFAULT_HABIT_COLORS = [
  '#D97757', // Terracotta (default)
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
];

/**
 * Get a random default color for a new habit.
 */
export function getRandomHabitColor(): string {
  return DEFAULT_HABIT_COLORS[Math.floor(Math.random() * DEFAULT_HABIT_COLORS.length)];
}

// ============================================================================
// Icon Utilities
// ============================================================================

/**
 * Default habit icons for the icon picker.
 */
export const DEFAULT_HABIT_ICONS = [
  { emoji: '✅', name: 'Check' },
  { emoji: '💪', name: 'Strength' },
  { emoji: '📚', name: 'Reading' },
  { emoji: '🏃', name: 'Running' },
  { emoji: '💧', name: 'Water' },
  { emoji: '🧘', name: 'Meditation' },
  { emoji: '😴', name: 'Sleep' },
  { emoji: '🎯', name: 'Goal' },
  { emoji: '✍️', name: 'Writing' },
  { emoji: '🎨', name: 'Creative' },
  { emoji: '🎵', name: 'Music' },
  { emoji: '🍎', name: 'Health' },
  { emoji: '💊', name: 'Medicine' },
  { emoji: '🧠', name: 'Learning' },
  { emoji: '❤️', name: 'Health' },
  { emoji: '🌱', name: 'Growth' },
];
