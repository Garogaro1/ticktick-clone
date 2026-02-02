/**
 * List Type Definitions
 *
 * TypeScript types for List DTOs and API responses.
 * Matches the Prisma List model with selected fields for API responses.
 */

import { List } from '@prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * List response DTO with selected fields.
 */
export interface ListDto {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isDefault: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  // Counters for performance
  _count?: {
    tasks: number;
  };
}

/**
 * List with task count (from Prisma include).
 */
export type ListWithTaskCount = List & {
  _count?: {
    tasks: number;
  };
};

/**
 * List with full relations (from Prisma include).
 */
export type ListWithFullRelations = List & {
  _count?: {
    tasks: number;
  };
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
};

/**
 * List list response with pagination.
 */
export interface ListListResponse {
  lists: ListDto[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * List detail response.
 */
export interface ListDetailResponse extends ListDto {
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
}

/**
 * List create response.
 */
export interface ListCreateResponse {
  list: ListDto;
}

/**
 * List update response.
 */
export interface ListUpdateResponse {
  list: ListDto;
}

/**
 * List delete response.
 */
export interface ListDeleteResponse {
  success: boolean;
  listId: string;
}

/**
 * Error response type.
 */
export interface ListErrorResponse {
  error: string;
  details?: string;
}

/**
 * List list query options for Prisma.
 */
export interface ListListOptions {
  where?: Prisma.ListWhereInput;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
  take?: number;
  skip?: number;
  includeTasks?: boolean;
}
