/**
 * Habit Tracker Validation Schemas
 *
 * Zod schemas for habit CRUD operations and validation.
 */

import { z } from 'zod';

// ============================================================================
// Habit Schemas
// ============================================================================

export const createHabitSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color')
    .optional(),
  icon: z.string().max(10, 'Icon must be less than 10 characters').optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional().default('daily'),
  targetCount: z
    .number()
    .int()
    .min(1, 'Target count must be at least 1')
    .max(100, 'Target count must be at most 100')
    .optional()
    .default(1),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateHabitSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
  icon: z.string().max(10).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  targetCount: z.number().int().min(1).max(100).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isArchived: z.boolean().optional(),
});

export const habitQuerySchema = z.object({
  isArchived: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'sortOrder', 'currentStreak']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(50),
});

// ============================================================================
// Habit Entry Schemas
// ============================================================================

export const createHabitEntrySchema = z.object({
  habitId: z.string().cuid('Invalid habit ID'),
  date: z.coerce.date().optional(),
  count: z.number().int().min(1).max(100).optional().default(1),
  note: z.string().max(500).optional(),
});

export const updateHabitEntrySchema = z.object({
  date: z.coerce.date().optional(),
  count: z.number().int().min(1).max(100).optional(),
  note: z.string().max(500).optional(),
});

export const toggleHabitEntrySchema = z.object({
  date: z.coerce.date().optional(),
  count: z.number().int().min(1).max(100).optional(),
  note: z.string().max(500).optional(),
});

// ============================================================================
// Batch Operations Schemas
// ============================================================================

export const batchToggleHabitsSchema = z.object({
  habitIds: z.array(z.string().cuid()).min(1, 'At least one habit ID is required'),
  date: z.coerce.date().optional(),
});

export const batchDeleteHabitsSchema = z.object({
  habitIds: z.array(z.string().cuid()).min(1, 'At least one habit ID is required'),
});

// ============================================================================
// Streak Calculation Schemas
// ============================================================================

export const habitStreakQuerySchema = z.object({
  habitId: z.string().cuid(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

export const habitStatisticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

// ============================================================================
// Calendar View Schemas
// ============================================================================

export const habitCalendarQuerySchema = z.object({
  habitId: z.string().cuid().optional(),
  year: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(2020).max(2100))
    .default(() => new Date().getFullYear()),
  month: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1).max(12))
    .default(() => new Date().getMonth() + 1),
});

// ============================================================================
// Type Inference
// ============================================================================

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type HabitQueryInput = z.infer<typeof habitQuerySchema>;
export type CreateHabitEntryInput = z.infer<typeof createHabitEntrySchema>;
export type UpdateHabitEntryInput = z.infer<typeof updateHabitEntrySchema>;
export type ToggleHabitEntryInput = z.infer<typeof toggleHabitEntrySchema>;
export type BatchToggleHabitsInput = z.infer<typeof batchToggleHabitsSchema>;
export type BatchDeleteHabitsInput = z.infer<typeof batchDeleteHabitsSchema>;
export type HabitStreakQueryInput = z.infer<typeof habitStreakQuerySchema>;
export type HabitCalendarQueryInput = z.infer<typeof habitCalendarQuerySchema>;
