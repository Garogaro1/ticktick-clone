/**
 * Habit Tracker Service Layer
 *
 * Business logic for habit CRUD operations, streak calculation, and statistics.
 */

import { db } from '@/lib/db';
import type {
  HabitDto,
  HabitEntryDto,
  CreateHabitInput,
  UpdateHabitInput,
  HabitListFilters,
  HabitListResponse,
  CreateHabitEntryInput,
  UpdateHabitEntryInput,
  ToggleHabitEntryInput,
  HabitStatistics,
  HabitStreakData,
  HabitCalendarData,
  HabitDateRange,
} from './types';
import {
  calculateStreak,
  isCompletedToday,
  calculateCompletionRate,
  generateCalendarData,
  getRandomHabitColor,
} from './utils';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
} from '@/lib/utils/date';

// ============================================================================
// Habit CRUD Operations
// ============================================================================

/**
 * Get all habits for a user with optional filtering.
 */
export async function getHabits(
  userId: string,
  filters: HabitListFilters = {}
): Promise<HabitListResponse> {
  const {
    isArchived = false,
    frequency,
    search,
    sortBy = 'sortOrder',
    sortOrder = 'asc',
    page = 1,
    limit = 50,
  } = filters;

  // Build where clause
  const where: {
    userId: string;
    isArchived?: boolean;
    frequency?: 'daily' | 'weekly' | 'monthly';
    title?: { contains: string; mode: 'insensitive' };
  } = { userId };

  if (isArchived !== undefined) {
    where.isArchived = isArchived;
  }

  if (frequency) {
    where.frequency = frequency;
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  // Build order by
  let orderBy: { sortOrder?: 'asc' | 'desc'; [key: string]: 'asc' | 'desc' | undefined } = {};
  if (sortBy === 'currentStreak') {
    // Special handling for streak-based sorting
    orderBy = { sortOrder: sortOrder === 'asc' ? 'asc' : 'desc' };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  // Count total
  const total = await db.habit.count({ where });

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  // Fetch habits
  const habits = await db.habit.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      entries: {
        orderBy: { date: 'desc' },
      },
      _count: {
        select: { entries: true },
      },
    },
  });

  // Enrich with streak data and sort by streak if needed
  let enrichedHabits = habits.map((habit) => enrichHabitWithStreakData(habit));

  if (sortBy === 'currentStreak') {
    enrichedHabits = enrichedHabits.sort((a, b) => {
      const aStreak = a.currentStreak ?? 0;
      const bStreak = b.currentStreak ?? 0;
      return sortOrder === 'asc' ? aStreak - bStreak : bStreak - aStreak;
    });
  }

  return {
    habits: enrichedHabits,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get a single habit by ID.
 */
export async function getHabitById(userId: string, habitId: string): Promise<HabitDto | null> {
  const habit = await db.habit.findFirst({
    where: { id: habitId, userId },
    include: {
      entries: {
        orderBy: { date: 'desc' },
      },
      _count: {
        select: { entries: true },
      },
    },
  });

  if (!habit) return null;

  return enrichHabitWithStreakData(habit);
}

/**
 * Create a new habit.
 */
export async function createHabit(userId: string, input: CreateHabitInput): Promise<HabitDto> {
  const data: {
    userId: string;
    title: string;
    description: string | null | undefined;
    frequency: 'daily' | 'weekly' | 'monthly';
    targetCount: number;
    color: string;
    icon: string | null | undefined;
    sortOrder: number;
  } = {
    userId,
    title: input.title,
    description: input.description ?? null,
    frequency: input.frequency || 'daily',
    targetCount: input.targetCount || 1,
    color: input.color || getRandomHabitColor(),
    icon: input.icon ?? null,
    sortOrder: input.sortOrder ?? 0,
  };

  const habit = await db.habit.create({
    data,
    include: {
      entries: true,
      _count: {
        select: { entries: true },
      },
    },
  });

  return enrichHabitWithStreakData(habit);
}

/**
 * Update an existing habit.
 */
export async function updateHabit(
  userId: string,
  habitId: string,
  input: UpdateHabitInput
): Promise<HabitDto | null> {
  // Verify ownership
  const existing = await db.habit.findFirst({
    where: { id: habitId, userId },
  });

  if (!existing) return null;

  const habit = await db.habit.update({
    where: { id: habitId },
    data: input,
    include: {
      entries: true,
      _count: {
        select: { entries: true },
      },
    },
  });

  return enrichHabitWithStreakData(habit);
}

/**
 * Delete a habit.
 */
export async function deleteHabit(userId: string, habitId: string): Promise<boolean> {
  // Verify ownership
  const existing = await db.habit.findFirst({
    where: { id: habitId, userId },
  });

  if (!existing) return false;

  // Delete habit (entries will be cascade deleted)
  await db.habit.delete({
    where: { id: habitId },
  });

  return true;
}

/**
 * Batch delete habits.
 */
export async function batchDeleteHabits(userId: string, habitIds: string[]): Promise<number> {
  // Delete only habits owned by user
  const result = await db.habit.deleteMany({
    where: {
      id: { in: habitIds },
      userId,
    },
  });

  return result.count;
}

/**
 * Update habit sort orders.
 */
export async function updateHabitOrders(
  userId: string,
  orders: { id: string; sortOrder: number }[]
): Promise<void> {
  await db.$transaction(
    orders.map(({ id, sortOrder }) =>
      db.habit.updateMany({
        where: { id, userId },
        data: { sortOrder },
      })
    )
  );
}

// ============================================================================
// Habit Entry Operations
// ============================================================================

/**
 * Get entries for a habit.
 */
export async function getHabitEntries(
  userId: string,
  habitId: string,
  dateRange?: HabitDateRange
): Promise<HabitEntryDto[]> {
  // Verify ownership
  const habit = await db.habit.findFirst({
    where: { id: habitId, userId },
  });

  if (!habit) return [];

  const where: { habitId: string; date?: { gte: Date; lte: Date } } = { habitId };

  if (dateRange) {
    where.date = {
      gte: startOfDay(dateRange.startDate),
      lte: endOfDay(dateRange.endDate),
    };
  }

  const entries = await db.habitEntry.findMany({
    where,
    orderBy: { date: 'desc' },
  });

  return entries;
}

/**
 * Get a single entry by ID.
 */
export async function getHabitEntryById(
  userId: string,
  entryId: string
): Promise<HabitEntryDto | null> {
  const entry = await db.habitEntry.findUnique({
    where: { id: entryId },
    include: { habit: true },
  });

  if (!entry) return null;

  // Verify ownership via habit
  if (entry.habit.userId !== userId) return null;

  return entry;
}

/**
 * Create a new habit entry (log completion).
 */
export async function createHabitEntry(
  userId: string,
  input: CreateHabitEntryInput
): Promise<HabitEntryDto | null> {
  // Verify habit ownership
  const habit = await db.habit.findFirst({
    where: { id: input.habitId, userId },
  });

  if (!habit) return null;

  const entry = await db.habitEntry.create({
    data: {
      habitId: input.habitId,
      date: startOfDay(input.date),
      count: input.count ?? 1,
      note: input.note,
    },
  });

  return entry;
}

/**
 * Update an existing habit entry.
 */
export async function updateHabitEntry(
  userId: string,
  entryId: string,
  input: UpdateHabitEntryInput
): Promise<HabitEntryDto | null> {
  // Verify ownership
  const existing = await db.habitEntry.findFirst({
    where: { id: entryId },
    include: { habit: true },
  });

  if (!existing || existing.habit.userId !== userId) return null;

  const data: { date?: Date; count?: number; note?: string | null } = {};
  if (input.date !== undefined) {
    data.date = startOfDay(input.date);
  }
  if (input.count !== undefined) {
    data.count = input.count;
  }
  if (input.note !== undefined) {
    data.note = input.note;
  }

  const entry = await db.habitEntry.update({
    where: { id: entryId },
    data,
  });

  return entry;
}

/**
 * Delete a habit entry.
 */
export async function deleteHabitEntry(userId: string, entryId: string): Promise<boolean> {
  // Verify ownership
  const existing = await db.habitEntry.findFirst({
    where: { id: entryId },
    include: { habit: true },
  });

  if (!existing || existing.habit.userId !== userId) return false;

  await db.habitEntry.delete({
    where: { id: entryId },
  });

  return true;
}

/**
 * Toggle habit entry for today (create if not exists, delete if exists).
 * If target count > 1, increments/decrements count.
 */
export async function toggleHabitEntry(
  userId: string,
  habitId: string,
  input: ToggleHabitEntryInput
): Promise<{ created: boolean; entry: HabitEntryDto | null; habit: HabitDto | null }> {
  // Verify habit ownership
  const habit = await db.habit.findFirst({
    where: { id: habitId, userId },
    include: {
      entries: {
        where: { date: startOfDay(input.date) },
      },
    },
  });

  if (!habit) {
    return { created: false, entry: null, habit: null };
  }

  const existingEntry = habit.entries[0];
  const targetCount = habit.targetCount || 1;

  if (existingEntry) {
    // Check if removing would go below target
    if (existingEntry.count > 1 && targetCount > 1) {
      // Decrement count
      const updated = await db.habitEntry.update({
        where: { id: existingEntry.id },
        data: { count: existingEntry.count - 1 },
      });

      const updatedHabit = await getHabitById(userId, habitId);
      return { created: false, entry: updated, habit: updatedHabit };
    } else {
      // Delete entry
      await db.habitEntry.delete({
        where: { id: existingEntry.id },
      });

      const updatedHabit = await getHabitById(userId, habitId);
      return { created: false, entry: null, habit: updatedHabit };
    }
  } else {
    // Create new entry
    const entry = await db.habitEntry.create({
      data: {
        habitId,
        date: startOfDay(input.date),
        count: input.count ?? 1,
        note: input.note,
      },
    });

    const updatedHabit = await getHabitById(userId, habitId);
    return { created: true, entry, habit: updatedHabit };
  }
}

/**
 * Batch toggle habits for a specific date.
 */
export async function batchToggleHabits(
  userId: string,
  habitIds: string[],
  date: Date
): Promise<HabitDto[]> {
  const results = await Promise.all(
    habitIds.map((habitId) => toggleHabitEntry(userId, habitId, { date }))
  );

  return results.map((r) => r.habit).filter((h): h is HabitDto => h !== null);
}

// ============================================================================
// Streak and Statistics
// ============================================================================

/**
 * Get streak data for a habit.
 */
export async function getHabitStreak(
  userId: string,
  habitId: string
): Promise<HabitStreakData | null> {
  const habit = await db.habit.findFirst({
    where: { id: habitId, userId },
    include: {
      entries: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!habit) return null;

  return calculateStreak(habit.entries, habit.frequency as 'daily' | 'weekly' | 'monthly');
}

/**
 * Get statistics for all user habits.
 */
export async function getHabitStatistics(userId: string): Promise<HabitStatistics> {
  const habits = await db.habit.findMany({
    where: { userId, isArchived: false },
    include: {
      entries: true,
    },
  });

  const activeHabits = habits.filter((h) => !h.isArchived);
  const today = startOfDay(new Date());
  const thisWeekStart = startOfWeek(today);
  const thisWeekEnd = endOfWeek(today);
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);

  let completedToday = 0;
  const currentStreaks: { habitId: string; habitTitle: string; streak: number }[] = [];
  const longestStreaks: { habitId: string; habitTitle: string; streak: number }[] = [];
  let totalEntries = 0;
  let thisWeekEntries = 0;
  let thisMonthEntries = 0;
  let totalCompletionRate = 0;

  for (const habit of activeHabits) {
    const streakData = calculateStreak(
      habit.entries,
      habit.frequency as 'daily' | 'weekly' | 'monthly'
    );

    if (isCompletedToday(habit.entries, habit.targetCount)) {
      completedToday++;
    }

    if (streakData.currentStreak > 0) {
      currentStreaks.push({
        habitId: habit.id,
        habitTitle: habit.title,
        streak: streakData.currentStreak,
      });
    }

    longestStreaks.push({
      habitId: habit.id,
      habitTitle: habit.title,
      streak: streakData.longestStreak,
    });

    totalEntries += habit.entries.length;

    // Count entries for this week/month
    thisWeekEntries += habit.entries.filter((e) => {
      const d = startOfDay(e.date);
      return d >= thisWeekStart && d <= thisWeekEnd;
    }).length;

    thisMonthEntries += habit.entries.filter((e) => {
      const d = startOfDay(e.date);
      return d >= thisMonthStart && d <= thisMonthEnd;
    }).length;

    // Calculate completion rate for the last 30 days
    const thirtyDaysAgo = subDays(today, 30);
    const rate = calculateCompletionRate(
      habit.entries,
      thirtyDaysAgo,
      today,
      habit.frequency as 'daily' | 'weekly' | 'monthly',
      habit.targetCount
    );
    totalCompletionRate += rate;
  }

  // Sort streaks
  currentStreaks.sort((a, b) => b.streak - a.streak);
  longestStreaks.sort((a, b) => b.streak - a.streak);

  // Calculate overall completion rate
  const completionRate =
    activeHabits.length > 0 ? Math.round(totalCompletionRate / activeHabits.length) : 0;

  return {
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    completedToday,
    currentStreaks: currentStreaks.slice(0, 5), // Top 5
    longestStreaks: longestStreaks.slice(0, 5), // Top 5
    completionRate,
    totalEntries,
    thisWeekEntries,
    thisMonthEntries,
  };
}

// ============================================================================
// Calendar Data
// ============================================================================

/**
 * Get calendar data for a habit (month view).
 */
export async function getHabitCalendarData(
  userId: string,
  habitId: string,
  year: number,
  month: number
): Promise<HabitCalendarData[]> {
  const habit = await db.habit.findFirst({
    where: { id: habitId, userId },
  });

  if (!habit) return [];

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Last day of month

  const entries = await getHabitEntries(userId, habitId, { startDate, endDate });

  return generateCalendarData(entries, startDate, endDate, habit.targetCount || 1).map(
    (data, index) => {
      const date = new Date(year, month - 1, index + 1);
      return {
        date,
        entries: [],
        completed: data.completed,
        targetCount: data.targetCount,
        actualCount: data.count,
      };
    }
  );
}

/**
 * Get calendar data for all habits (month view).
 */
export async function getAllHabitsCalendarData(
  userId: string,
  year: number,
  month: number
): Promise<Map<string, HabitCalendarData[]>> {
  const habits = await db.habit.findMany({
    where: { userId, isArchived: false },
  });

  const result = new Map<string, HabitCalendarData[]>();

  for (const habit of habits) {
    const calendarData = await getHabitCalendarData(userId, habit.id, year, month);
    result.set(habit.id, calendarData);
  }

  return result;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Enrich a habit with streak data and completion status.
 */
function enrichHabitWithStreakData(habit: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  frequency: string;
  targetCount: number;
  sortOrder: number;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
  entries?: HabitEntryDto[];
  _count?: { entries: number };
}): HabitDto {
  const streakData = calculateStreak(
    habit.entries || [],
    habit.frequency as 'daily' | 'weekly' | 'monthly'
  );

  // Calculate completion rate for last 30 days
  const thirtyDaysAgo = subDays(new Date(), 30);
  const completionRate = calculateCompletionRate(
    habit.entries || [],
    thirtyDaysAgo,
    new Date(),
    habit.frequency as 'daily' | 'weekly' | 'monthly',
    habit.targetCount || 1
  );

  return {
    ...habit,
    currentStreak: streakData.currentStreak,
    longestStreak: streakData.longestStreak,
    completionRate,
    completedToday: isCompletedToday(habit.entries || [], habit.targetCount || 1),
  };
}
