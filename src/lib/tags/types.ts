/**
 * Tag Type Definitions
 *
 * TypeScript types for Tag DTOs and API responses.
 * Matches the Prisma Tag model with selected fields for API responses.
 */

import { Tag } from '@prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * Tag response DTO with selected fields.
 */
export interface TagDto {
  id: string;
  name: string;
  color: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  // Counters for performance
  _count?: {
    tasks: number;
  };
}

/**
 * Tag with task count (from Prisma include).
 */
export type TagWithTaskCount = Tag & {
  _count?: {
    tasks: number;
  };
};

/**
 * Tag with full relations (from Prisma include).
 */
export type TagWithFullRelations = Tag & {
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
 * Tag list response with pagination.
 */
export interface TagListResponse {
  tags: TagDto[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Tag detail response.
 */
export interface TagDetailResponse extends TagDto {
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
  }>;
}

/**
 * Tag create response.
 */
export interface TagCreateResponse {
  tag: TagDto;
}

/**
 * Tag update response.
 */
export interface TagUpdateResponse {
  tag: TagDto;
}

/**
 * Tag delete response.
 */
export interface TagDeleteResponse {
  success: boolean;
  tagId: string;
}

/**
 * Error response type.
 */
export interface TagErrorResponse {
  error: string;
  details?: string;
}

/**
 * Tag list query options for Prisma.
 */
export interface TagListOptions {
  where?: Prisma.TagWhereInput;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
  take?: number;
  skip?: number;
  includeTasks?: boolean;
}
