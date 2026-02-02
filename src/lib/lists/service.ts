/**
 * List Service
 *
 * Business logic layer for List CRUD operations.
 * Handles data transformation, validation, and Prisma queries.
 */

import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import type { ListDto, ListListOptions, ListWithTaskCount, ListWithFullRelations } from './types';

/**
 * Convert Prisma List model to List DTO.
 */
function toListDto(list: ListWithTaskCount | ListWithFullRelations): ListDto {
  const baseDto: ListDto = {
    id: list.id,
    title: list.title,
    description: list.description,
    icon: list.icon,
    color: list.color,
    sortOrder: list.sortOrder,
    isDefault: list.isDefault,
    isFavorite: list.isFavorite,
    createdAt: list.createdAt,
    updatedAt: list.updatedAt,
  };

  // Add task count if available
  if (list._count) {
    baseDto._count = {
      tasks: list._count.tasks,
    };
  }

  return baseDto;
}

/**
 * Get list of lists with filtering and sorting.
 *
 * @param userId - User ID to scope lists to
 * @param options - Query options (where, orderBy, pagination)
 * @returns List of lists and total count
 */
export async function getLists(
  userId: string,
  options: ListListOptions = {}
): Promise<{ lists: ListDto[]; total: number }> {
  const { where, orderBy, take, skip, includeTasks } = options;

  // Build where clause with user scoping
  const baseWhere: Prisma.ListWhereInput = {
    userId,
    ...where,
  };

  // Count total matching lists
  const total = await db.list.count({ where: baseWhere });

  // Fetch lists with relations
  const lists = await db.list.findMany({
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
          select: {
            id: true,
            title: true,
            status: true,
            priority: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
      }),
    },
  });

  return {
    lists: lists.map(toListDto),
    total,
  };
}

/**
 * Get a single list by ID.
 *
 * @param listId - List ID
 * @param userId - User ID for authorization
 * @returns List or null if not found
 */
export async function getListById(
  listId: string,
  userId: string
): Promise<
  | (ListDto & { tasks?: Array<{ id: string; title: string; status: string; priority: string }> })
  | null
> {
  const list = await db.list.findFirst({
    where: {
      id: listId,
      userId,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  });

  if (!list) {
    return null;
  }

  const dto = toListDto(list);
  return {
    ...dto,
    tasks: list.tasks,
  };
}

/**
 * Create a new list.
 *
 * @param userId - User ID creating the list
 * @param data - List creation data
 * @returns Created list
 */
export async function createList(
  userId: string,
  data: {
    title: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    sortOrder?: number;
    isDefault?: boolean;
    isFavorite?: boolean;
  }
): Promise<ListDto> {
  // If setting as default, unset other default lists for this user
  if (data.isDefault) {
    await db.list.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Get the next sort order if not provided
  let sortOrder = data.sortOrder;
  if (sortOrder === undefined) {
    const maxSortOrder = await db.list.findFirst({
      where: { userId },
      select: { sortOrder: true },
      orderBy: { sortOrder: 'desc' },
    });
    sortOrder = (maxSortOrder?.sortOrder ?? -1) + 1;
  }

  // Create list
  const list = await db.list.create({
    data: {
      title: data.title,
      user: { connect: { id: userId } },
      ...(data.description !== undefined && { description: data.description }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.color !== undefined && { color: data.color }),
      sortOrder,
      ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      ...(data.isFavorite !== undefined && { isFavorite: data.isFavorite }),
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  return toListDto(list);
}

/**
 * Update an existing list.
 *
 * @param listId - List ID to update
 * @param userId - User ID for authorization
 * @param data - Update data
 * @returns Updated list or null if not found
 */
export async function updateList(
  listId: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
    sortOrder?: number;
    isDefault?: boolean;
    isFavorite?: boolean;
  }
): Promise<ListDto | null> {
  // If setting as default, unset other default lists for this user
  if (data.isDefault === true) {
    await db.list.updateMany({
      where: {
        userId,
        id: { not: listId },
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  // Build update data
  const updateData: Prisma.ListUpdateInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }
  if (data.description !== undefined) {
    updateData.description = data.description;
  }
  if (data.icon !== undefined) {
    updateData.icon = data.icon;
  }
  if (data.color !== undefined) {
    updateData.color = data.color;
  }
  if (data.sortOrder !== undefined) {
    updateData.sortOrder = data.sortOrder;
  }
  if (data.isDefault !== undefined) {
    updateData.isDefault = data.isDefault;
  }
  if (data.isFavorite !== undefined) {
    updateData.isFavorite = data.isFavorite;
  }

  // Update list
  const list = await db.list.updateMany({
    where: {
      id: listId,
      userId,
    },
    data: updateData,
  });

  if (list.count === 0) {
    return null;
  }

  // Fetch and return updated list
  const updatedList = await db.list.findFirst({
    where: {
      id: listId,
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

  return updatedList ? toListDto(updatedList) : null;
}

/**
 * Delete a list.
 *
 * @param listId - List ID to delete
 * @param userId - User ID for authorization
 * @returns True if deleted, false if not found
 */
export async function deleteList(listId: string, userId: string): Promise<boolean> {
  // Prevent deletion of the default list
  const list = await db.list.findFirst({
    where: {
      id: listId,
      userId,
    },
    select: {
      isDefault: true,
    },
  });

  if (!list) {
    return false;
  }

  if (list.isDefault) {
    throw new Error('Cannot delete the default list');
  }

  const result = await db.list.deleteMany({
    where: {
      id: listId,
      userId,
    },
  });

  return result.count > 0;
}

/**
 * Batch delete multiple lists.
 *
 * @param userId - User ID for authorization
 * @param listIds - Array of list IDs to delete
 * @returns Number of lists deleted
 */
export async function batchDeleteLists(userId: string, listIds: string[]): Promise<number> {
  // Exclude default lists from deletion
  const defaultListIds = await db.list.findMany({
    where: {
      id: { in: listIds },
      userId,
      isDefault: true,
    },
    select: {
      id: true,
    },
  });

  const idsToDelete = listIds.filter((id) => !defaultListIds.some((dl) => dl.id === id));

  if (idsToDelete.length === 0) {
    return 0;
  }

  const result = await db.list.deleteMany({
    where: {
      id: { in: idsToDelete },
      userId,
    },
  });

  return result.count;
}

/**
 * Update sort order for multiple lists.
 *
 * @param userId - User ID for authorization
 * @param listOrders - Array of { id, sortOrder } pairs
 * @returns Number of lists updated
 */
export async function updateListOrders(
  userId: string,
  listOrders: Array<{ id: string; sortOrder: number }>
): Promise<number> {
  let count = 0;

  for (const item of listOrders) {
    const result = await db.list.updateMany({
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
 * Get default list for a user.
 * Creates one if it doesn't exist.
 *
 * @param userId - User ID
 * @returns Default list
 */
export async function getDefaultList(userId: string): Promise<ListDto> {
  let defaultList = await db.list.findFirst({
    where: {
      userId,
      isDefault: true,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
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
      include: {
        _count: {
          select: {
            tasks: true,
          },
        },
      },
    });
  }

  return toListDto(defaultList);
}

/**
 * Get default list ID for a user.
 *
 * @param userId - User ID
 * @returns Default list ID
 */
export async function getDefaultListId(userId: string): Promise<string> {
  const defaultList = await db.list.findFirst({
    where: {
      userId,
      isDefault: true,
    },
    select: {
      id: true,
    },
  });

  if (!defaultList) {
    const created = await db.list.create({
      data: {
        userId,
        title: 'Inbox',
        isDefault: true,
        sortOrder: 0,
      },
      select: {
        id: true,
      },
    });
    return created.id;
  }

  return defaultList.id;
}
