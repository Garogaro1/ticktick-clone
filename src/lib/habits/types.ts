/**
 * Habit Tracker Types
 *
 * TypeScript types for habit CRUD operations and tracking.
 */

import type { Habit as PrismaHabit, HabitEntry as PrismaHabitEntry } from '@prisma/client';

// ============================================================================
// DTO Types (Data Transfer Objects)
// ============================================================================

export interface HabitDto extends PrismaHabit {
  entries?: HabitEntryDto[];
  _count?: {
    entries: number;
  };
  currentStreak?: number;
  longestStreak?: number;
  completionRate?: number;
  completedToday?: boolean;
}

export interface HabitEntryDto extends PrismaHabitEntry {
  habit?: HabitDto;
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateHabitInput {
  title: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  targetCount?: number;
  sortOrder?: number;
}

export interface UpdateHabitInput {
  title?: string;
  description?: string;
  color?: string;
  icon?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  targetCount?: number;
  sortOrder?: number;
  isArchived?: boolean;
}

export interface HabitListFilters {
  isArchived?: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly';
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'sortOrder' | 'currentStreak';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface HabitListResponse {
  habits: HabitDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateHabitEntryInput {
  habitId: string;
  date: Date;
  count?: number;
  note?: string;
}

export interface UpdateHabitEntryInput {
  date?: Date;
  count?: number;
  note?: string;
}

export interface ToggleHabitEntryInput {
  date: Date;
  count?: number;
  note?: string;
}

export interface HabitStatistics {
  totalHabits: number;
  activeHabits: number;
  completedToday: number;
  currentStreaks: {
    habitId: string;
    habitTitle: string;
    streak: number;
  }[];
  longestStreaks: {
    habitId: string;
    habitTitle: string;
    streak: number;
  }[];
  completionRate: number;
  totalEntries: number;
  thisWeekEntries: number;
  thisMonthEntries: number;
}

export interface HabitCalendarData {
  date: Date;
  entries: HabitEntryDto[];
  completed: boolean;
  targetCount: number;
  actualCount: number;
}

export interface HabitStreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: Date;
  lastCompletionDate?: Date;
}

// ============================================================================
// View Types
// ============================================================================

export type HabitViewType = 'list' | 'calendar' | 'grid';

export interface HabitViewOptions {
  viewType: HabitViewType;
  showArchived: boolean;
  selectedDate: Date;
  frequencyFilter?: 'daily' | 'weekly' | 'monthly' | 'all';
}

// ============================================================================
// Filter Types
// ============================================================================

export interface HabitDateRange {
  startDate: Date;
  endDate: Date;
}

export interface HabitCompletionData {
  date: Date;
  completed: boolean;
  count: number;
  targetCount: number;
}
