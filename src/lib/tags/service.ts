/**
 * Tag Service
 *
 * Business logic layer for Tag CRUD operations.
 * Handles data transformation, validation, and Prisma queries.
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { TagDto, TagListOptions } from './types';
import type { Tag as PrismaTag, TaskTag as PrismaTaskTag } from '@prisma/client';

type TagWithTasks = PrismaTag & {
  _count?: {
    tasks: number;
  };
  tasks?: PrismaTaskTag[];
};

/**
 * Convert Prisma Tag model to Tag DTO.
 */
function toTagDto(tag: TagWithTasks): TagDto {
  const baseDto: TagDto = {
    id: tag.id,
    name: tag.name,
    color: tag.color,
    sortOrder: tag.sortOrder,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
  };

  // Add task count if available
  if (tag._count) {
    baseDto._count = {
      tasks: tag._count.tasks,
    };
  }

  return baseDto;
}

/**
 * Get list of tags with filtering and sorting.
 *
 * @param userId - User ID to scope tags to
 * @param options - Query options (where, orderBy, pagination)
 * @returns List of tags and total count
 */
export async function getTags(
  userId: string,
  options: TagListOptions = {}
): Promise<{ tags: TagDto[]; total: number }> {
  const { where, orderBy, take, skip, includeTasks } = options;

  // Build where clause with user scoping
  const baseWhere: Prisma.TagWhereInput = {
    userId,
    ...where,
  };

  // Count total matching tags
  const total = await db.tag.count({ where: baseWhere });

  // Fetch tags with relations
  const tags = await db.tag.findMany({
    where: baseWhere,
    orderBy,
    take,
    skip,
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
      ...(includeTasks && {
        tasks: {
          include: {
            task: {
              select: {
                id: true,
                title: true,
                status: true,
                priority: true,
              },
            },
          },
          orderBy: {
            task: {
              sortOrder: 'asc',
            },
          },
        },
      }),
    },
  });

  return {
    tags: tags.map(toTagDto),
    total,
  };
}

/**
 * Get a single tag by ID.
 *
 * @param tagId - Tag ID
 * @param userId - User ID for authorization
 * @returns Tag or null if not found
 */
export async function getTagById(
  tagId: string,
  userId: string
): Promise<
  | (TagDto & { tasks?: Array<{ id: string; title: string; status: string; priority: string }> })
  | null
> {
  const tag = await db.tag.findFirst({
    where: {
      id: tagId,
      userId,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
      tasks: {
        include: {
          task: {
            select: {
              id: true,
              title: true,
              status: true,
              priority: true,
            },
          },
        },
        orderBy: {
          task: {
            sortOrder: 'asc',
          },
        },
      },
    },
  });

  if (!tag) {
    return null;
  }

  const dto = toTagDto(tag);
  return {
    ...dto,
    tasks: tag.tasks.map((tt) => tt.task),
  };
}

/**
 * Create a new tag.
 *
 * @param userId - User ID creating the tag
 * @param data - Tag creation data
 * @returns Created tag
 * @throws Error if tag with same name already exists
 */
export async function createTag(
  userId: string,
  data: {
    name: string;
    color?: string | null;
    sortOrder?: number;
  }
): Promise<TagDto> {
  // Check if tag with same name already exists
  const existingTag = await db.tag.findFirst({
    where: {
      userId,
      name: data.name,
    },
  });

  if (existingTag) {
    throw new Error(`Tag with name "${data.name}" already exists`);
  }

  // Get the next sort order if not provided
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const maxSortOrder = await db.tag.findFirst({
      where: { userId },
      select: { sortOrder: true },
      orderBy: { sortOrder: 'desc' },
    });
    sortOrder = (maxSortOrder?.sortOrder ?? -1) + 1;
  }

  // Create tag
  const tag = await db.tag.create({
    data: {
      name: data.name,
      user: { connect: { id: userId } },
      ...(data.color !== undefined && { color: data.color }),
      sortOrder,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return toTagDto(tag);
}

/**
 * Update an existing tag.
 *
 * @param tagId - Tag ID to update
 * @param userId - User ID for authorization
 * @param data - Update data
 * @returns Updated tag or null if not found
 * @throws Error if tag with same name already exists
 */
export async function updateTag(
  tagId: string,
  userId: string,
  data: {
    name?: string;
    color?: string | null;
    sortOrder?: number;
  }
): Promise<TagDto | null> {
  // Check if tag exists and belongs to user
  const existingTag = await db.tag.findFirst({
    where: {
      id: tagId,
      userId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!existingTag) {
    return null;
  }

  // If updating name, check for uniqueness
  if (data.name && data.name !== existingTag.name) {
    const duplicateTag = await db.tag.findFirst({
      where: {
        userId,
        name: data.name,
        id: { not: tagId },
      },
    });

    if (duplicateTag) {
      throw new Error(`Tag with name "${data.name}" already exists`);
    }
  }

  // Build update data
  const updateData: Prisma.TagUpdateInput = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }
  if (data.color !== undefined) {
    updateData.color = data.color;
  }
  if (data.sortOrder !== undefined) {
    updateData.sortOrder = data.sortOrder;
  }

  // Update tag
  const result = await db.tag.updateMany({
    where: {
      id: tagId,
      userId,
    },
    data: updateData,
  });

  if (result.count === 0) {
    return null;
  }

  // Fetch and return updated tag
  const updatedTag = await db.tag.findFirst({
    where: {
      id: tagId,
      userId,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return updatedTag ? toTagDto(updatedTag) : null;
}

/**
 * Delete a tag.
 *
 * @param tagId - Tag ID to delete
 * @param userId - User ID for authorization
 * @returns True if deleted, false if not found
 */
export async function deleteTag(tagId: string, userId: string): Promise<boolean> {
  const result = await db.tag.deleteMany({
    where: {
      id: tagId,
      userId,
    },
  });

  return result.count > 0;
}

/**
 * Batch delete multiple tags.
 *
 * @param userId - User ID for authorization
 * @param tagIds - Array of tag IDs to delete
 * @returns Number of tags deleted
 */
export async function batchDeleteTags(userId: string, tagIds: string[]): Promise<number> {
  const result = await db.tag.deleteMany({
    where: {
      id: { in: tagIds },
      userId,
    },
  });

  return result.count;
}

/**
 * Update sort order for multiple tags.
 *
 * @param userId - User ID for authorization
 * @param tagOrders - Array of { id, sortOrder } pairs
 * @returns Number of tags updated
 */
export async function updateTagOrders(
  userId: string,
  tagOrders: Array<{ id: string; sortOrder: number }>
): Promise<number> {
  let count = 0;

  for (const item of tagOrders) {
    const result = await db.tag.updateMany({
      where: {
        id: item.id,
        userId,
      },
      data: {
        sortOrder: item.sortOrder,
      },
    });
    count += result.count;
  }

  return count;
}

/**
 * Get tags by task ID.
 *
 * @param taskId - Task ID
 * @param userId - User ID for authorization
 * @returns Array of tags associated with the task
 */
export async function getTagsByTaskId(taskId: string, userId: string): Promise<TagDto[]> {
  const taskTags = await db.taskTag.findMany({
    where: {
      taskId,
      tag: {
        userId,
      },
    },
    include: {
      tag: {
        include: {
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      },
    },
    orderBy: {
      tag: {
        sortOrder: 'asc',
      },
    },
  });

  return taskTags.map((tt) => toTagDto(tt.tag));
}

/**
 * Assign tags to a task.
 *
 * @param taskId - Task ID
 * @param userId - User ID for authorization
 * @param tagIds - Array of tag IDs to assign
 * @returns Number of tags assigned
 */
export async function assignTagsToTask(
  taskId: string,
  userId: string,
  tagIds: string[]
): Promise<number> {
  // Verify task belongs to user
  const task = await db.task.findFirst({
    where: {
      id: taskId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!task) {
    throw new Error('Task not found');
  }

  // Verify all tags belong to user
  const tags = await db.tag.findMany({
    where: {
      id: { in: tagIds },
      userId,
    },
    select: {
      id: true,
    },
  });

  if (tags.length !== tagIds.length) {
    throw new Error('One or more tags not found');
  }

  // Delete existing task-tag relationships
  await db.taskTag.deleteMany({
    where: {
      taskId,
    },
  });

  // Create new task-tag relationships
  if (tagIds.length > 0) {
    await db.taskTag.createMany({
      data: tagIds.map((tagId) => ({
        taskId,
        tagId,
      })),
    });
  }

  return tagIds.length;
}
