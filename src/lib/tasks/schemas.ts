/**
 * Task Validation Schemas
 *
 * Zod schemas for validating task-related API requests.
 * Used for type-safe input validation and TypeScript type inference.
 */

import { z } from 'zod';

/**
 * Task status enum values from Prisma schema.
 */
export const TaskStatusEnum = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']);

/**
 * Priority enum values from Prisma schema.
 */
export const PriorityEnum = z.enum(['NONE', 'LOW', 'MEDIUM', 'HIGH']);

/**
 * Sort order enum for task listing.
 */
export const SortOrderEnum = z.enum(['asc', 'desc']);

/**
 * Sort by enum for task listing.
 */
export const SortByEnum = z.enum([
  'createdAt',
  'updatedAt',
  'dueDate',
  'priority',
  'title',
  'sortOrder',
]);

/**
 * Time string schema (HH:MM or HH:MM:SS format).
 */
export const TimeStringSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/, {
  message: 'Invalid time format. Expected HH:MM or HH:MM:SS',
});

/**
 * Duration string schema (e.g., "30m", "1h 30m", "2h", "1d 2h").
 */
export const DurationStringSchema = z.string().regex(/^(\d+\s*[dhm]\s*)+$/i, {
  message: 'Invalid duration format. Use patterns like "30m", "1h 30m", "2h", "1d 2h"',
});

/**
 * IANA timezone schema.
 */
export const TimezoneSchema = z.string().refine(
  (tz) => {
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: tz });
      return true;
    } catch {
      return false;
    }
  },
  {
    message: 'Invalid IANA timezone',
  }
);

/**
 * Tag connection schema for creating tasks with tags.
 */
export const TaskTagSchema = z.object({
  id: z.string().cuid(),
});

/**
 * Date with optional time schema.
 * Accepts either a date string or an object with date and time.
 */
export const DateWithTimeSchema = z.union([
  z.coerce.date(),
  z.object({
    date: z.coerce.date(),
    time: TimeStringSchema.optional(),
  }),
]);

/**
 * Schema for creating a new task.
 */
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters'),
  description: z.string().max(10000, 'Description must be at most 10,000 characters').optional(),
  status: TaskStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.coerce.date().optional(),
  dueTime: TimeStringSchema.optional(),
  startDate: z.coerce.date().optional(),
  startTime: TimeStringSchema.optional(),
  estimatedTime: z.union([z.number().int().min(0), DurationStringSchema]).optional(),
  timezone: TimezoneSchema.optional(),
  listId: z.string().cuid().optional(),
  parentId: z.string().cuid().optional(),
  sortOrder: z.number().int().optional(),
  tags: z.array(TaskTagSchema).optional(),
});

/**
 * Schema for updating an existing task.
 * All fields are optional for partial updates.
 */
export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(10000).optional().nullable(),
  status: TaskStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.coerce.date().optional().nullable(),
  dueTime: TimeStringSchema.optional(),
  startDate: z.coerce.date().optional().nullable(),
  startTime: TimeStringSchema.optional(),
  completedAt: z.coerce.date().optional().nullable(),
  estimatedTime: z
    .union([z.number().int().min(0), DurationStringSchema])
    .optional()
    .nullable(),
  spentTime: z
    .union([z.number().int().min(0), DurationStringSchema])
    .optional()
    .nullable(),
  timezone: TimezoneSchema.optional().nullable(),
  recurrenceRule: z.string().max(500).optional().nullable(),
  listId: z.string().cuid().optional().nullable(),
  parentId: z.string().cuid().optional().nullable(),
  sortOrder: z.number().int().optional(),
  tags: z.array(TaskTagSchema).optional(),
});

/**
 * Schema for task query parameters (filtering and sorting).
 */
export const TaskQuerySchema = z.object({
  // Status filter
  status: TaskStatusEnum.optional(),
  // Priority filter
  priority: PriorityEnum.optional(),
  // List filter
  listId: z.string().cuid().optional(),
  // Parent task filter (for subtasks)
  parentId: z.string().cuid().optional(),
  // Tag filter
  tagId: z.string().cuid().optional(),
  // Date range filters
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  // Calendar-specific filters
  date: z.coerce.date().optional(), // Get tasks for a specific date
  startDate: z.coerce.date().optional(), // Start of date range
  endDate: z.coerce.date().optional(), // End of date range
  // Timezone for date calculations
  timezone: TimezoneSchema.optional(),
  // Include all-day events only
  allDay: z.coerce.boolean().optional(),
  // Include timed events only
  timed: z.coerce.boolean().optional(),
  // Subtasks filter
  includeSubtasks: z.coerce.boolean().optional(),
  // Search query
  search: z.string().max(200).optional(),
  // Sorting
  sortBy: SortByEnum.optional(),
  sortOrder: SortOrderEnum.optional(),
  // Pagination
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

/**
 * Schema for batch update operations.
 */
export const BatchUpdateTaskSchema = z.object({
  taskIds: z.array(z.string().cuid()).min(1, 'At least one task ID is required'),
  updates: z.object({
    status: TaskStatusEnum.optional(),
    priority: PriorityEnum.optional(),
    listId: z.string().cuid().optional().nullable(),
    dueDate: z.coerce.date().optional().nullable(),
    dueTime: TimeStringSchema.optional(),
  }),
});

/**
 * Schema for batch delete operations.
 */
export const BatchDeleteTaskSchema = z.object({
  taskIds: z.array(z.string().cuid()).min(1, 'At least one task ID is required'),
});

/**
 * Schema for marking task as complete.
 */
export const CompleteTaskSchema = z.object({
  spentTime: z.union([z.number().int().min(0), DurationStringSchema]).optional(),
});

/**
 * Schema for rescheduling a task.
 */
export const RescheduleTaskSchema = z.object({
  dueDate: z.coerce.date().optional(),
  dueTime: TimeStringSchema.optional(),
  startDate: z.coerce.date().optional(),
  startTime: TimeStringSchema.optional(),
});

/**
 * Schema for calendar event query.
 */
export const CalendarEventQuerySchema = z.object({
  // Date range
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  // Filters
  listIds: z.array(z.string().cuid()).optional(),
  tagIds: z.array(z.string().cuid()).optional(),
  status: z.array(TaskStatusEnum).optional(),
  priority: z.array(PriorityEnum).optional(),
  search: z.string().max(200).optional(),
  includeCompleted: z.coerce.boolean().optional(),
  excludeAllDay: z.coerce.boolean().optional(),
  onlyAllDay: z.coerce.boolean().optional(),
  // Timezone
  timezone: TimezoneSchema.optional(),
});

/**
 * Infer TypeScript types from schemas.
 */
export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
export type TaskQueryInput = z.infer<typeof TaskQuerySchema>;
export type BatchUpdateTaskInput = z.infer<typeof BatchUpdateTaskSchema>;
export type BatchDeleteTaskInput = z.infer<typeof BatchDeleteTaskSchema>;
export type CompleteTaskInput = z.infer<typeof CompleteTaskSchema>;
export type RescheduleTaskInput = z.infer<typeof RescheduleTaskSchema>;
export type CalendarEventQueryInput = z.infer<typeof CalendarEventQuerySchema>;

// Re-export types for convenience
export type { TaskStatus, Priority } from '@prisma/client';
