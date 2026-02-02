/**
 * Task Type Definitions
 *
 * TypeScript types for Task DTOs and API responses.
 * Matches the Prisma Task model with selected fields for API responses.
 */

import { Task, TaskStatus, Priority } from '@prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * Tag DTO for task responses.
 */
export interface TaskTagDto {
  id: string;
  name: string;
  color: string | null;
}

/**
 * Task response DTO with selected fields.
 */
export interface TaskDto {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  startDate: Date | null;
  completedAt: Date | null;
  estimatedTime: number | null;
  spentTime: number | null;
  recurrenceRule: string | null;
  recurrenceId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  listId: string;
  parentId: string | null;
  tags: TaskTagDto[];
  subtasks?: TaskDto[];
  // Counters for performance
  _count?: {
    subtasks: number;
  };
}

/**
 * Task list response with pagination.
 */
export interface TaskListResponse {
  tasks: TaskDto[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Task detail response.
 */
export interface TaskDetailResponse extends TaskDto {
  list: {
    id: string;
    title: string;
    color: string | null;
  };
  parent?: {
    id: string;
    title: string;
  } | null;
}

/**
 * Task create response.
 */
export interface TaskCreateResponse {
  task: TaskDto;
}

/**
 * Task update response.
 */
export interface TaskUpdateResponse {
  task: TaskDto;
}

/**
 * Task delete response.
 */
export interface TaskDeleteResponse {
  success: boolean;
  taskId: string;
}

/**
 * Batch update response.
 */
export interface BatchUpdateResponse {
  updated: number;
  tasks: TaskDto[];
}

/**
 * Batch delete response.
 */
export interface BatchDeleteResponse {
  deleted: number;
  taskIds: string[];
}

/**
 * Error response type.
 */
export interface TaskErrorResponse {
  error: string;
  details?: string;
}

/**
 * Task with tags relation (from Prisma include).
 */
export type TaskWithTags = Task & {
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
  _count?: {
    subtasks: number;
  };
};

/**
 * Task with full relations (from Prisma include).
 */
export type TaskWithFullRelations = Task & {
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
  list: {
    id: string;
    title: string;
    color: string | null;
  };
  parent?: {
    id: string;
    title: string;
  } | null;
  subtasks?: Array<
    {
      tags: Array<{
        tag: {
          id: string;
          name: string;
          color: string | null;
        };
      }>;
    } & Task
  >;
  _count?: {
    subtasks: number;
  };
};

/**
 * Task list query options for Prisma.
 */
export interface TaskListOptions {
  where?: Prisma.TaskWhereInput;
  orderBy?: {
    [key: string]: 'asc' | 'desc';
  };
  take?: number;
  skip?: number;
  includeSubtasks?: boolean;
}
