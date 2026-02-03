/**
 * Tag Validation Schemas
 *
 * Zod schemas for validating tag-related API requests.
 * Used for type-safe input validation and TypeScript type inference.
 */

import { z } from 'zod';

/**
 * Sort order enum for tag listing.
 */
export const SortOrderEnum = z.enum(['asc', 'desc']);

/**
 * Sort by enum for tag listing.
 */
export const SortByEnum = z.enum(['createdAt', 'updatedAt', 'name', 'sortOrder']);

/**
 * Schema for creating a new tag.
 */
export const CreateTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be at most 50 characters').trim(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code (e.g., #D97757)')
    .nullable()
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
});

/**
 * Schema for updating an existing tag.
 * All fields are optional for partial updates.
 */
export const UpdateTagSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code')
    .nullable()
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
});

/**
 * Schema for tag query parameters (filtering and sorting).
 */
export const TagQuerySchema = z.object({
  // Search query
  search: z.string().max(200).optional(),
  // Sorting
  sortBy: SortByEnum.optional(),
  sortOrder: SortOrderEnum.optional(),
  // Pagination
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  // Include tasks in response
  includeTasks: z.coerce.boolean().optional(),
});

/**
 * Schema for batch delete operations.
 */
export const BatchDeleteTagSchema = z.object({
  tagIds: z.array(z.string().cuid()).min(1, 'At least one tag ID is required'),
});

/**
 * Schema for updating sort order of multiple tags.
 */
export const UpdateTagOrderSchema = z.object({
  tagOrders: z
    .array(
      z.object({
        id: z.string().cuid(),
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1, 'At least one tag order is required'),
});

/**
 * Schema for assigning tags to a task.
 */
export const AssignTagsSchema = z.object({
  tagIds: z.array(z.string().cuid()).optional(),
});

/**
 * Infer TypeScript types from schemas.
 */
export type CreateTagInput = z.infer<typeof CreateTagSchema>;
export type UpdateTagInput = z.infer<typeof UpdateTagSchema>;
export type TagQueryInput = z.infer<typeof TagQuerySchema>;
export type BatchDeleteTagInput = z.infer<typeof BatchDeleteTagSchema>;
export type UpdateTagOrderInput = z.infer<typeof UpdateTagOrderSchema>;
export type AssignTagsInput = z.infer<typeof AssignTagsSchema>;
