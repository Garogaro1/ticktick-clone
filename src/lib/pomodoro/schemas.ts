/**
 * Pomodoro Validation Schemas
 *
 * Zod schemas for Pomodoro validation and type inference
 */

import { z } from 'zod';

// Re-export enum values for validation
export const PomodoroSessionTypeEnum = z.enum(['work', 'break']);
export const PomodoroSessionStatusEnum = z.enum(['running', 'paused', 'completed', 'abandoned']);

/**
 * Create Pomodoro Session Schema
 */
export const CreatePomodoroSchema = z.object({
  duration: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration cannot exceed 3 hours')
    .optional(),
  breakDuration: z
    .number()
    .int()
    .min(1, 'Break duration must be at least 1 minute')
    .max(60, 'Break duration cannot exceed 1 hour')
    .optional(),
  type: PomodoroSessionTypeEnum.default('work'),
  taskId: z.string().optional(),
});

/**
 * Update Pomodoro Session Schema
 */
export const UpdatePomodoroSchema = z.object({
  duration: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration cannot exceed 3 hours')
    .optional(),
  breakDuration: z
    .number()
    .int()
    .min(1, 'Break duration must be at least 1 minute')
    .max(60, 'Break duration cannot exceed 1 hour')
    .optional(),
  wasCompleted: z.boolean().optional(),
  completedAt: z.coerce.date().optional(),
});

/**
 * Pomodoro Query Schema
 */
export const PomodoroQuerySchema = z.object({
  type: PomodoroSessionTypeEnum.optional(),
  taskId: z.string().optional(),
  wasCompleted: z.coerce.boolean().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  sortBy: z.enum(['startedAt', 'completedAt', 'duration']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Complete Pomodoro Session Schema
 */
export const CompletePomodoroSchema = z.object({
  wasCompleted: z.boolean().default(true),
});

/**
 * Pomodoro Settings Schema
 */
export const PomodoroSettingsSchema = z.object({
  workDuration: z
    .number()
    .int()
    .min(1, 'Work duration must be at least 1 minute')
    .max(180, 'Work duration cannot exceed 3 hours'),
  shortBreakDuration: z
    .number()
    .int()
    .min(1, 'Short break duration must be at least 1 minute')
    .max(60, 'Short break duration cannot exceed 1 hour'),
  longBreakDuration: z
    .number()
    .int()
    .min(1, 'Long break duration must be at least 1 minute')
    .max(120, 'Long break duration cannot exceed 2 hours'),
  longBreakAfter: z
    .number()
    .int()
    .min(1, 'Long break after must be at least 1 session')
    .max(10, 'Long break after cannot exceed 10 sessions'),
  autoStartBreak: z.boolean(),
  autoStartWork: z.boolean(),
  soundEnabled: z.boolean(),
  notificationEnabled: z.boolean(),
  tickSoundEnabled: z.boolean(),
});

/**
 * Pomodoro Preset Schema
 */
export const PomodoroPresetSchema = z.enum(['pomodoro', 'short', 'long', 'custom']);

/**
 * Start Timer Schema
 */
export const StartTimerSchema = z.object({
  duration: z
    .number()
    .int()
    .min(1, 'Duration must be at least 1 minute')
    .max(180, 'Duration cannot exceed 3 hours')
    .optional(),
  type: PomodoroSessionTypeEnum.default('work'),
  taskId: z.string().optional(),
});

/**
 * Pause Timer Schema
 */
export const PauseTimerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

/**
 * Resume Timer Schema
 */
export const ResumeTimerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
});

/**
 * Stop Timer Schema
 */
export const StopTimerSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  wasCompleted: z.boolean().default(false),
});

/**
 * Batch Pomodoro Operation Schema
 */
export const BatchPomodoroSchema = z.object({
  operation: z.enum(['delete', 'markCompleted', 'markAbandoned']),
  sessionIds: z
    .array(z.string().min(1))
    .min(1, 'At least one session ID is required')
    .max(50, 'Cannot operate on more than 50 sessions at once'),
});

/**
 * Statistics Query Schema
 */
export const StatisticsQuerySchema = z.object({
  period: z.enum(['today', 'week', 'month', 'all']).default('all'),
  taskId: z.string().optional(),
});

// Type exports (prefixed with 'Schema' to avoid conflicts with types.ts)
export type CreatePomodoroSchemaInput = z.infer<typeof CreatePomodoroSchema>;
export type UpdatePomodoroSchemaInput = z.infer<typeof UpdatePomodoroSchema>;
export type PomodoroQuerySchemaInput = z.infer<typeof PomodoroQuerySchema>;
export type CompletePomodoroSchemaInput = z.infer<typeof CompletePomodoroSchema>;
export type PomodoroSettingsSchemaInput = z.infer<typeof PomodoroSettingsSchema>;
export type PomodoroPresetSchema = z.infer<typeof PomodoroPresetSchema>;
export type StartTimerSchemaInput = z.infer<typeof StartTimerSchema>;
export type PauseTimerSchemaInput = z.infer<typeof PauseTimerSchema>;
export type ResumeTimerSchemaInput = z.infer<typeof ResumeTimerSchema>;
export type StopTimerSchemaInput = z.infer<typeof StopTimerSchema>;
export type BatchPomodoroSchemaInput = z.infer<typeof BatchPomodoroSchema>;
export type StatisticsQuerySchemaInput = z.infer<typeof StatisticsQuerySchema>;
