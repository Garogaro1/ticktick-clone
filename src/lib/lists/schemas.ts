/**
 * List Validation Schemas
 *
 * Zod schemas for validating list-related API requests.
 * Used for type-safe input validation and TypeScript type inference.
 */

import { z } from 'zod';

/**
 * Sort order enum for list listing.
 */
export const SortOrderEnum = z.enum(['asc', 'desc']);

/**
 * Sort by enum for list listing.
 */
export const SortByEnum = z.enum(['createdAt', 'updatedAt', 'title', 'sortOrder']);

/**
 * Schema for creating a new list.
 */
export const CreateListSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  icon: z
    .string()
    .max(10, 'Icon must be at most 10 characters (emoji or short identifier)')
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code (e.g., #D97757)')
    .optional(),
  sortOrder: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

/**
 * Schema for updating an existing list.
 * All fields are optional for partial updates.
 */
export const UpdateListSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  icon: z.string().max(10).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color code')
    .optional()
    .nullable(),
  sortOrder: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
});

/**
 * Schema for list query parameters (filtering and sorting).
 */
export const ListQuerySchema = z.object({
  // Search query
  search: z.string().max(200).optional(),
  // Favorite filter
  isFavorite: z.coerce.boolean().optional(),
  // Default list filter
  isDefault: z.coerce.boolean().optional(),
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
export const BatchDeleteListSchema = z.object({
  listIds: z.array(z.string().cuid()).min(1, 'At least one list ID is required'),
});

/**
 * Schema for updating sort order of multiple lists.
 */
export const UpdateListOrderSchema = z.object({
  listOrders: z
    .array(
      z.object({
        id: z.string().cuid(),
        sortOrder: z.number().int().min(0),
      })
    )
    .min(1, 'At least one list order is required'),
});

/**
 * Infer TypeScript types from schemas.
 */
export type CreateListInput = z.infer<typeof CreateListSchema>;
export type UpdateListInput = z.infer<typeof UpdateListSchema>;
export type ListQueryInput = z.infer<typeof ListQuerySchema>;
export type BatchDeleteListInput = z.infer<typeof BatchDeleteListSchema>;
export type UpdateListOrderInput = z.infer<typeof UpdateListOrderSchema>;
