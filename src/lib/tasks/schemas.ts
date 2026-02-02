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
 * Tag connection schema for creating tasks with tags.
 */
export const TaskTagSchema = z.object({
  id: z.string().cuid(),
});

/**
 * Schema for creating a new task.
 */
export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title must be at most 500 characters'),
  description: z.string().max(10000, 'Description must be at most 10,000 characters').optional(),
  status: TaskStatusEnum.optional(),
  priority: PriorityEnum.optional(),
  dueDate: z.coerce.date().optional(),
  startDate: z.coerce.date().optional(),
  estimatedTime: z.number().int().min(0).optional(),
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
  startDate: z.coerce.date().optional().nullable(),
  completedAt: z.coerce.date().optional().nullable(),
  estimatedTime: z.number().int().min(0).optional().nullable(),
  spentTime: z.number().int().min(0).optional().nullable(),
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
  spentTime: z.number().int().min(0).optional(),
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
