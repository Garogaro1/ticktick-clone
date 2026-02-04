/**
 * Task Service
 *
 * Business logic layer for Task CRUD operations.
 * Handles data transformation, validation, and Prisma queries.
 */

import { db } from '@/lib/db';
import { Prisma, TaskStatus, Priority } from '@prisma/client';
import { parseDuration } from '@/lib/utils/date';
import type { TaskDto, TaskListOptions, TaskWithTags, TaskWithFullRelations } from './types';

/**
 * Normalize duration input to minutes (number).
 * Handles both number (minutes) and string (duration format) inputs.
 */
function normalizeDuration(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number') {
    return value;
  }
  // Parse duration string (e.g., "1h 30m", "90m")
  try {
    return parseDuration(value);
  } catch {
    return null;
  }
}

/**
 * Convert Prisma Task model with tags to Task DTO.
 */
function toTaskDtoFromTags(task: TaskWithTags): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    startDate: task.startDate,
    completedAt: task.completedAt,
    estimatedTime: task.estimatedTime,
    spentTime: task.spentTime,
    recurrenceRule: task.recurrenceRule,
    recurrenceId: task.recurrenceId,
    sortOrder: task.sortOrder,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    listId: task.listId,
    parentId: task.parentId,
    goalId: task.goalId ?? null, // Phase 24: Include goalId
    tags: task.tags.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })),
    _count: task._count ? { subtasks: task._count.subtasks } : undefined,
  };
}

/**
 * Convert Prisma Task model with full relations to Task DTO.
 */
export function toTaskDto(task: TaskWithFullRelations): TaskDto {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    startDate: task.startDate,
    completedAt: task.completedAt,
    estimatedTime: task.estimatedTime,
    spentTime: task.spentTime,
    recurrenceRule: task.recurrenceRule,
    recurrenceId: task.recurrenceId,
    sortOrder: task.sortOrder,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    listId: task.listId,
    parentId: task.parentId,
    goalId: task.goalId ?? null, // Phase 24: Include goalId
    tags: task.tags.map((t) => ({
      id: t.tag.id,
      name: t.tag.name,
      color: t.tag.color,
    })),
    subtasks: task.subtasks?.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      description: subtask.description,
      status: subtask.status,
      priority: subtask.priority,
      dueDate: subtask.dueDate,
      startDate: subtask.startDate,
      completedAt: subtask.completedAt,
      estimatedTime: subtask.estimatedTime,
      spentTime: subtask.spentTime,
      recurrenceRule: subtask.recurrenceRule,
      recurrenceId: subtask.recurrenceId,
      sortOrder: subtask.sortOrder,
      createdAt: subtask.createdAt,
      updatedAt: subtask.updatedAt,
      listId: subtask.listId,
      parentId: subtask.parentId,
      goalId: subtask.goalId ?? null, // Phase 24: Include goalId
      tags: subtask.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        color: t.tag.color,
      })),
    })),
    _count: task._count ? { subtasks: task._count.subtasks } : undefined,
  };
}

/**
 * Get list of tasks with filtering and sorting.
 *
 * @param userId - User ID to scope tasks to
 * @param options - Query options (where, orderBy, pagination)
 * @returns List of tasks and total count
 */
export async function getTasks(
  userId: string,
  options: TaskListOptions = {}
): Promise<{ tasks: TaskDto[]; total: number }> {
  const { where, orderBy, take, skip, includeSubtasks } = options;

  // Build where clause with user scoping
  const baseWhere: Prisma.TaskWhereInput = {
    userId,
    ...where,
  };

  // Count total matching tasks
  const total = await db.task.count({ where: baseWhere });

  // Fetch tasks with relations
  const tasks = await db.task.findMany({
    where: baseWhere,
    orderBy,
    take,
    skip,
    include: {
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      _count: {
        select: {
          subtasks: true,
        },
      },
      subtasks: includeSubtasks
        ? {
            include: {
              tags: {
                include: {
                  tag: {
                    select: {
                      id: true,
                      name: true,
                      color: true,
                    },
                  },
                },
              },
            },
          }
        : undefined,
    },
  });

  return {
    tasks: tasks.map(toTaskDtoFromTags),
    total,
  };
}

/**
 * Get a single task by ID.
 *
 * @param taskId - Task ID
 * @param userId - User ID for authorization
 * @returns Task or null if not found
 */
export async function getTaskById(taskId: string, userId: string): Promise<TaskDto | null> {
  const task = await db.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    include: {
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      list: {
        select: {
          id: true,
          title: true,
          color: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
      subtasks: {
        include: {
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                },
              },
            },
          },
        },
      },
      _count: {
        select: {
          subtasks: true,
        },
      },
    },
  });

  return task ? toTaskDto(task as TaskWithFullRelations) : null;
}

/**
 * Create a new task.
 *
 * @param userId - User ID creating the task
 * @param data - Task creation data
 * @returns Created task
 */
export async function createTask(
  userId: string,
  data: {
    title: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueDate?: Date | null;
    startDate?: Date | null;
    estimatedTime?: number | string | null;
    listId?: string;
    parentId?: string;
    sortOrder?: number;
    tags?: Array<{ id: string }>;
  }
): Promise<TaskDto> {
  const { tags, ...taskData } = data;

  // If no listId provided, find or create user's default list
  let listId = data.listId;
  if (!listId) {
    const defaultList = await db.list.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });

    if (defaultList) {
      listId = defaultList.id;
    } else {
      // Create default Inbox list
      const newDefaultList = await db.list.create({
        data: {
          userId,
          title: 'Inbox',
          isDefault: true,
          sortOrder: 0,
        },
      });
      listId = newDefaultList.id;
    }
  }

  // Set completedAt if status is DONE
  const completedAt = data.status === 'DONE' ? new Date() : null;

  // Build create data with proper types
  const createData: Prisma.TaskCreateInput = {
    title: taskData.title,
    user: { connect: { id: userId } },
    list: { connect: { id: listId } },
    completedAt,
  };

  if (taskData.description !== undefined) {
    createData.description = taskData.description;
  }
  if (taskData.status) {
    createData.status = taskData.status as TaskStatus;
  }
  if (taskData.priority) {
    createData.priority = taskData.priority as Priority;
  }
  if (taskData.dueDate !== undefined) {
    createData.dueDate = taskData.dueDate;
  }
  if (taskData.startDate !== undefined) {
    createData.startDate = taskData.startDate;
  }
  if (taskData.estimatedTime !== undefined) {
    createData.estimatedTime = normalizeDuration(taskData.estimatedTime);
  }
  if (taskData.parentId) {
    createData.parent = { connect: { id: taskData.parentId } };
  }
  if (taskData.sortOrder !== undefined) {
    createData.sortOrder = taskData.sortOrder;
  }
  if (tags && tags.length > 0) {
    createData.tags = {
      create: tags.map((tag) => ({
        tag: { connect: { id: tag.id } },
      })),
    };
  }

  // Create task with tags
  const task = await db.task.create({
    data: createData,
    include: {
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      list: {
        select: {
          id: true,
          title: true,
          color: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
      _count: {
        select: {
          subtasks: true,
        },
      },
    },
  });

  return toTaskDto(task as TaskWithFullRelations);
}

/**
 * Update an existing task.
 *
 * @param taskId - Task ID to update
 * @param userId - User ID for authorization
 * @param data - Update data
 * @returns Updated task or null if not found
 */
export async function updateTask(
  taskId: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: string;
    priority?: string;
    dueDate?: Date | null;
    startDate?: Date | null;
    completedAt?: Date | null;
    estimatedTime?: number | string | null;
    spentTime?: number | string | null;
    recurrenceRule?: string | null;
    listId?: string | null;
    parentId?: string | null;
    sortOrder?: number;
    tags?: Array<{ id: string }>;
  }
): Promise<TaskDto | null> {
  const { tags, ...taskData } = data;

  // Auto-set completedAt when status changes to DONE
  let completedAt = data.completedAt;
  if (data.status === 'DONE' && !completedAt) {
    completedAt = new Date();
  } else if (data.status && data.status !== 'DONE') {
    completedAt = null;
  }

  // Build update data with proper types
  const updateData: Prisma.TaskUpdateInput = {};

  if (taskData.title !== undefined) {
    updateData.title = taskData.title;
  }
  if (taskData.description !== undefined) {
    updateData.description = taskData.description;
  }
  if (taskData.status) {
    updateData.status = taskData.status as TaskStatus;
  }
  if (taskData.priority) {
    updateData.priority = taskData.priority as Priority;
  }
  if (taskData.dueDate !== undefined) {
    updateData.dueDate = taskData.dueDate;
  }
  if (taskData.startDate !== undefined) {
    updateData.startDate = taskData.startDate;
  }
  if (completedAt !== undefined) {
    updateData.completedAt = completedAt;
  }
  if (taskData.estimatedTime !== undefined) {
    updateData.estimatedTime = normalizeDuration(taskData.estimatedTime);
  }
  if (taskData.spentTime !== undefined) {
    updateData.spentTime = normalizeDuration(taskData.spentTime);
  }
  if (taskData.recurrenceRule !== undefined) {
    updateData.recurrenceRule = taskData.recurrenceRule;
  }
  if (taskData.listId !== undefined) {
    updateData.list = taskData.listId ? { connect: { id: taskData.listId } } : undefined;
  }
  if (taskData.parentId !== undefined) {
    updateData.parent = taskData.parentId ? { connect: { id: taskData.parentId } } : undefined;
  }
  if (taskData.sortOrder !== undefined) {
    updateData.sortOrder = taskData.sortOrder;
  }

  // Handle tag updates by replacing all tags
  if (tags) {
    updateData.tags = {
      deleteMany: {},
      create: tags.map((tag) => ({
        tag: { connect: { id: tag.id } },
      })),
    };
  }

  // Update task
  const task = await db.task.updateMany({
    where: {
      id: taskId,
      userId,
    },
    data: updateData,
  });

  if (task.count === 0) {
    return null;
  }

  // Fetch and return updated task
  return getTaskById(taskId, userId);
}

/**
 * Delete a task.
 *
 * @param taskId - Task ID to delete
 * @param userId - User ID for authorization
 * @returns True if deleted, false if not found
 */
export async function deleteTask(taskId: string, userId: string): Promise<boolean> {
  const task = await db.task.deleteMany({
    where: {
      id: taskId,
      userId,
    },
  });

  return task.count > 0;
}

/**
 * Batch update multiple tasks.
 *
 * @param userId - User ID for authorization
 * @param taskIds - Array of task IDs to update
 * @param updates - Update data to apply to all tasks
 * @returns Number of tasks updated
 */
export async function batchUpdateTasks(
  userId: string,
  taskIds: string[],
  updates: {
    status?: string;
    priority?: string;
    listId?: string | null;
  }
): Promise<{ count: number; tasks: TaskDto[] }> {
  // Auto-set completedAt when status changes to DONE
  let completedAt: Date | null | undefined = undefined;
  if (updates.status === 'DONE') {
    completedAt = new Date();
  } else if (updates.status && updates.status !== 'DONE') {
    completedAt = null;
  }

  // Build update data
  const updateData: Prisma.TaskUncheckedUpdateManyInput = {};

  if (updates.status) {
    updateData.status = updates.status as TaskStatus;
  }
  if (updates.priority) {
    updateData.priority = updates.priority as Priority;
  }
  if (updates.listId !== undefined && updates.listId !== null) {
    updateData.listId = updates.listId;
  }
  if (completedAt !== undefined) {
    updateData.completedAt = completedAt;
  }

  const result = await db.task.updateMany({
    where: {
      id: { in: taskIds },
      userId,
    },
    data: updateData,
  });

  // Fetch updated tasks
  const tasks = await db.task.findMany({
    where: {
      id: { in: taskIds },
      userId,
    },
    include: {
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      _count: {
        select: {
          subtasks: true,
        },
      },
    },
  });

  return {
    count: result.count,
    tasks: tasks.map(toTaskDtoFromTags),
  };
}

/**
 * Batch delete multiple tasks.
 *
 * @param userId - User ID for authorization
 * @param taskIds - Array of task IDs to delete
 * @returns Number of tasks deleted
 */
export async function batchDeleteTasks(userId: string, taskIds: string[]): Promise<number> {
  const result = await db.task.deleteMany({
    where: {
      id: { in: taskIds },
      userId,
    },
  });

  return result.count;
}

/**
 * Reorder multiple tasks.
 * Used for drag-and-drop reordering.
 *
 * @param userId - User ID for authorization
 * @param updates - Array of { id, sortOrder } updates
 * @returns Updated tasks
 */
export async function reorderTasks(
  userId: string,
  updates: Array<{ id: string; sortOrder: number }>
): Promise<TaskDto[]> {
  // Validate that all tasks belong to the user
  const taskIds = updates.map((u) => u.id);
  const tasks = await db.task.findMany({
    where: {
      id: { in: taskIds },
      userId,
    },
  });

  if (tasks.length !== taskIds.length) {
    throw new Error('One or more tasks not found or unauthorized');
  }

  // Update sort orders in a transaction
  await db.$transaction(
    updates.map((update) =>
      db.task.updateMany({
        where: {
          id: update.id,
          userId,
        },
        data: {
          sortOrder: update.sortOrder,
        },
      })
    )
  );

  // Fetch and return updated tasks
  const updatedTasks = await db.task.findMany({
    where: {
      id: { in: taskIds },
      userId,
    },
    include: {
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
      _count: {
        select: {
          subtasks: true,
        },
      },
    },
  });

  return updatedTasks.map(toTaskDtoFromTags);
}

/**
 * Get default list ID for a user.
 * Creates one if it doesn't exist.
 *
 * @param userId - User ID
 * @returns Default list ID
 */
export async function getDefaultListId(userId: string): Promise<string> {
  let defaultList = await db.list.findFirst({
    where: {
      userId,
      isDefault: true,
    },
  });

  if (!defaultList) {
    defaultList = await db.list.create({
      data: {
        userId,
        title: 'Inbox',
        isDefault: true,
        sortOrder: 0,
      },
    });
  }

  return defaultList.id;
}
