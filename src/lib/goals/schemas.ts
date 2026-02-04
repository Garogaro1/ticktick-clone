/**
 * Goal Tracker Validation Schemas
 *
 * Zod schemas for goal CRUD operations and validation.
 */

import { z } from 'zod';

// ============================================================================
// Goal Schemas
// ============================================================================

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  targetValue: z
    .number()
    .int('Target value must be an integer')
    .min(1, 'Target value must be at least 1')
    .max(1000000, 'Target value is too large')
    .optional(),
  unit: z.string().min(1).max(50, 'Unit must be less than 50 characters').optional(),
  deadline: z.coerce.date().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  targetValue: z.number().int().min(1).max(1000000).optional(),
  currentValue: z.number().int().min(0).optional(),
  unit: z.string().min(1).max(50).optional(),
  deadline: z.coerce.date().nullable().optional(),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED']).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const goalQuerySchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'title', 'sortOrder', 'deadline', 'progress']).default('sortOrder'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  page: z.string().transform(Number).pipe(z.number().int().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).default(50),
});

// ============================================================================
// Progress Update Schemas
// ============================================================================

export const updateGoalProgressSchema = z
  .object({
    increment: z.number().int().min(-1000000).max(1000000).optional(),
    setValue: z.number().int().min(0).max(1000000).optional(),
    taskId: z.string().cuid('Invalid task ID').optional(),
  })
  .refine(
    (data) => {
      // At least one field must be provided
      return (
        data.increment !== undefined || data.setValue !== undefined || data.taskId !== undefined
      );
    },
    {
      message: 'At least one of increment, setValue, or taskId must be provided',
    }
  );

// ============================================================================
// Batch Operations Schemas
// ============================================================================

export const batchUpdateGoalsSchema = z.object({
  goalIds: z.array(z.string().cuid()).min(1, 'At least one goal ID is required'),
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED', 'ABANDONED']).optional(),
});

export const batchDeleteGoalsSchema = z.object({
  goalIds: z.array(z.string().cuid()).min(1, 'At least one goal ID is required'),
});

// ============================================================================
// Statistics Query Schema
// ============================================================================

export const goalStatisticsQuerySchema = z.object({
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
});

// ============================================================================
// Type Inference
// ============================================================================

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalQueryInput = z.infer<typeof goalQuerySchema>;
export type UpdateGoalProgressInput = z.infer<typeof updateGoalProgressSchema>;
export type BatchUpdateGoalsInput = z.infer<typeof batchUpdateGoalsSchema>;
export type BatchDeleteGoalsInput = z.infer<typeof batchDeleteGoalsSchema>;
export type GoalStatisticsQueryInput = z.infer<typeof goalStatisticsQuerySchema>;
