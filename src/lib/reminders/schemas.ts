/**
 * Reminder Validation Schemas
 *
 * Zod schemas for reminder validation and type inference
 */

import { z } from 'zod';

// Re-export enum values for validation
export const ReminderTypeEnum = z.enum(['IN_APP', 'PUSH', 'EMAIL']);
export const ReminderStatusEnum = z.enum(['PENDING', 'SENT', 'DISMISSED', 'SNOOZED']);

/**
 * Create Reminder Schema
 */
export const CreateReminderSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  type: ReminderTypeEnum.default('IN_APP'),
  fireAt: z.coerce.date().optional(),
  relativeOffset: z
    .number()
    .int()
    .min(0, 'Offset must be non-negative')
    .max(525600, 'Offset cannot exceed 1 year (525600 minutes)')
    .nullable()
    .optional(),
});

/**
 * Update Reminder Schema
 */
export const UpdateReminderSchema = z
  .object({
    type: ReminderTypeEnum.optional(),
    fireAt: z.coerce.date().optional(),
    relativeOffset: z
      .number()
      .int()
      .min(0, 'Offset must be non-negative')
      .max(525600, 'Offset cannot exceed 1 year')
      .nullable()
      .optional(),
    status: ReminderStatusEnum.optional(),
  })
  .refine(
    (data) => {
      // Either fireAt or relativeOffset should be set (or both can be null)
      return data.fireAt !== undefined || data.relativeOffset !== undefined;
    },
    { message: 'At least one of fireAt or relativeOffset must be provided' }
  );

/**
 * Reminder Query Schema
 */
export const ReminderQuerySchema = z.object({
  status: ReminderStatusEnum.optional(),
  type: ReminderTypeEnum.optional(),
  taskId: z.string().optional(),
  fireBefore: z.coerce.date().optional(),
  fireAfter: z.coerce.date().optional(),
  includePending: z.coerce.boolean().optional(),
  sortBy: z.enum(['fireAt', 'createdAt', 'snoozedUntil']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Snooze Reminder Schema
 */
export const SnoozeReminderSchema = z
  .object({
    minutes: z
      .number()
      .int()
      .min(1, 'Snooze duration must be at least 1 minute')
      .max(10080, 'Snooze duration cannot exceed 1 week')
      .optional(),
    until: z.coerce.date().optional(),
  })
  .refine((data) => data.minutes !== undefined || data.until !== undefined, {
    message: 'Either minutes or until must be provided',
  })
  .refine(
    (data) => {
      if (data.until) {
        return data.until > new Date();
      }
      return true;
    },
    { message: 'Snooze time must be in the future' }
  );

/**
 * Dismiss Reminder Schema
 */
export const DismissReminderSchema = z.object({
  reminderId: z.string().min(1, 'Reminder ID is required'),
});

/**
 * Batch Reminder Operation Schema
 */
export const BatchReminderSchema = z.object({
  operation: z.enum(['delete', 'dismiss', 'markSent']),
  reminderIds: z
    .array(z.string().min(1))
    .min(1, 'At least one reminder ID is required')
    .max(50, 'Cannot operate on more than 50 reminders at once'),
});

/**
 * Create Multiple Reminders Schema
 */
export const CreateRemindersSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  reminders: z
    .array(
      z.object({
        type: ReminderTypeEnum.default('IN_APP'),
        fireAt: z.coerce.date().optional(),
        relativeOffset: z.number().int().min(0).max(525600).nullable().optional(),
      })
    )
    .min(1, 'At least one reminder is required')
    .max(5, 'Maximum 5 reminders per task'),
});

/**
 * Reminder Preset Schema
 */
export const ReminderPresetSchema = z.enum([
  'at_deadline',
  '5min_before',
  '15min_before',
  '30min_before',
  '1hour_before',
  '1day_before',
  'custom',
]);

// Type exports
export type CreateReminderInput = z.infer<typeof CreateReminderSchema>;
export type UpdateReminderInput = z.infer<typeof UpdateReminderSchema>;
export type ReminderQueryInput = z.infer<typeof ReminderQuerySchema>;
export type SnoozeReminderInput = z.infer<typeof SnoozeReminderSchema>;
export type BatchReminderInput = z.infer<typeof BatchReminderSchema>;
export type CreateRemindersInput = z.infer<typeof CreateRemindersSchema>;
export type ReminderPreset = z.infer<typeof ReminderPresetSchema>;
