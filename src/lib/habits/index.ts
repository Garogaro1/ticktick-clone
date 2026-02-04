/**
 * Habit Tracker Module
 *
 * Exports all habit-related functionality.
 */

// Types
export type {
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
  HabitCalendarData,
  HabitStreakData,
  HabitDateRange,
  HabitCompletionData,
  HabitViewType,
  HabitViewOptions,
} from './types';

// Schemas
export {
  createHabitSchema,
  updateHabitSchema,
  habitQuerySchema,
  createHabitEntrySchema,
  updateHabitEntrySchema,
  toggleHabitEntrySchema,
  batchToggleHabitsSchema,
  batchDeleteHabitsSchema,
  habitStreakQuerySchema,
  habitStatisticsQuerySchema,
  habitCalendarQuerySchema,
} from './schemas';

// Utils
export {
  calculateStreak,
  isCompletedOnDate,
  isCompletedToday,
  getCompletionCount,
  calculateCompletionRate,
  generateCalendarData,
  getBestDay,
  getBestMonth,
  getEntriesInRange,
  getTodayEntry,
  getThisWeekEntries,
  getThisMonthEntries,
  getRandomHabitColor,
  DEFAULT_HABIT_COLORS,
  DEFAULT_HABIT_ICONS,
} from './utils';

// Service
export {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  batchDeleteHabits,
  updateHabitOrders,
  getHabitEntries,
  getHabitEntryById,
  createHabitEntry,
  updateHabitEntry,
  deleteHabitEntry,
  toggleHabitEntry,
  batchToggleHabits,
  getHabitStreak,
  getHabitStatistics,
  getHabitCalendarData,
  getAllHabitsCalendarData,
} from './service';
