/**
 * List Service Tests
 *
 * Tests for list business logic layer including CRUD operations,
 * batch operations, and data transformation.
 */

import {
  getLists,
  getListById,
  createList,
  updateList,
  deleteList,
  batchDeleteLists,
  updateListOrders,
  getDefaultList,
  getDefaultListId,
} from './service';
import { db } from '@/lib/db';

// Mock the database
type MockModel = {
  findMany: jest.Mock;
  findFirst: jest.Mock;
  count: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  updateMany: jest.Mock;
  deleteMany: jest.Mock;
};

jest.mock('@/lib/db', () => {
  const createMockModel = (): MockModel => ({
    findMany: jest.fn(),
    findFirst: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  });

  return {
    db: {
      list: createMockModel(),
    },
  };
});

describe('List Service', () => {
  const mockUserId = 'user-123';

  const mockList = {
    id: 'list-123',
    title: 'Test List',
    description: 'Test description',
    icon: '📋',
    color: '#D97757',
    sortOrder: 0,
    isDefault: false,
    isFavorite: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    userId: mockUserId,
    _count: { tasks: 5 },
    tasks: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getLists', () => {
    it('should fetch lists with filters', async () => {
      const mockLists = [mockList];
      (db.list.count as jest.Mock).mockResolvedValue(1);
      (db.list.findMany as jest.Mock).mockResolvedValue(mockLists);

      const result = await getLists(mockUserId, {
        where: { isFavorite: true },
        orderBy: { sortOrder: 'asc' },
        take: 10,
        skip: 0,
      });

      expect(result.lists).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(db.list.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isFavorite: true,
        },
      });
      expect(db.list.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no lists found', async () => {
      (db.list.count as jest.Mock).mockResolvedValue(0);
      (db.list.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getLists(mockUserId);

      expect(result.lists).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should include tasks when requested', async () => {
      (db.list.count as jest.Mock).mockResolvedValue(1);
      (db.list.findMany as jest.Mock).mockResolvedValue([mockList]);

      await getLists(mockUserId, {
        includeTasks: true,
      });

      const findManyCall = (db.list.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyCall.include.tasks).toBeDefined();
    });
  });

  describe('getListById', () => {
    it('should fetch a single list by ID', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue(mockList);

      const result = await getListById('list-123', mockUserId);

      expect(result).toBeDefined();
      expect(db.list.findFirst).toHaveBeenCalledWith({
        where: { id: 'list-123', userId: mockUserId },
        include: expect.any(Object),
      });
    });

    it('should return null when list not found', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getListById('non-existent', mockUserId);

      expect(result).toBeNull();
    });

    it('should include tasks in response', async () => {
      const listWithTasks = {
        ...mockList,
        tasks: [
          { id: 'task-1', title: 'Task 1', status: 'TODO', priority: 'MEDIUM' },
          { id: 'task-2', title: 'Task 2', status: 'DONE', priority: 'HIGH' },
        ],
      };
      (db.list.findFirst as jest.Mock).mockResolvedValue(listWithTasks);

      const result = await getListById('list-123', mockUserId);

      expect(result?.tasks).toHaveLength(2);
      expect(result?.tasks?.[0].id).toBe('task-1');
    });
  });

  describe('createList', () => {
    it('should create a list with provided data', async () => {
      (db.list.findMany as jest.Mock).mockResolvedValue([]);
      (db.list.create as jest.Mock).mockResolvedValue(mockList);

      const result = await createList(mockUserId, {
        title: 'New List',
        description: 'Description',
        icon: '📋',
        color: '#D97757',
      });

      expect(result).toBeDefined();
      expect(db.list.create).toHaveBeenCalled();
    });

    it('should unset other default lists when setting new default', async () => {
      (db.list.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.list.findMany as jest.Mock).mockResolvedValue([]);
      (db.list.create as jest.Mock).mockResolvedValue(mockList);

      await createList(mockUserId, {
        title: 'New Default',
        isDefault: true,
      });

      expect(db.list.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    });

    it('should auto-assign sortOrder if not provided', async () => {
      const existingList = { ...mockList, sortOrder: 2 };
      (db.list.findFirst as jest.Mock).mockResolvedValueOnce(existingList).mockResolvedValue([]);
      (db.list.create as jest.Mock).mockResolvedValue(mockList);

      await createList(mockUserId, {
        title: 'New List',
      });

      const createCall = (db.list.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.sortOrder).toBe(3);
    });

    it('should start sortOrder from 0 if no lists exist', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue(null);
      (db.list.create as jest.Mock).mockResolvedValue(mockList);

      await createList(mockUserId, {
        title: 'First List',
      });

      const createCall = (db.list.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.sortOrder).toBe(0);
    });
  });

  describe('updateList', () => {
    it('should update an existing list', async () => {
      (db.list.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.list.findFirst as jest.Mock).mockResolvedValue(mockList);

      const result = await updateList('list-123', mockUserId, {
        title: 'Updated Title',
      });

      expect(result).toBeDefined();
      expect(db.list.updateMany).toHaveBeenCalledWith({
        where: { id: 'list-123', userId: mockUserId },
        data: expect.objectContaining({
          title: 'Updated Title',
        }),
      });
    });

    it('should return null when list not found', async () => {
      (db.list.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await updateList('non-existent', mockUserId, {
        title: 'Updated Title',
      });

      expect(result).toBeNull();
    });

    it('should unset other default lists when setting new default', async () => {
      (db.list.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.list.findFirst as jest.Mock).mockResolvedValue(mockList);

      await updateList('list-123', mockUserId, {
        isDefault: true,
      });

      expect(db.list.updateMany).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          id: { not: 'list-123' },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue({
        isDefault: false,
      });
      (db.list.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await deleteList('list-123', mockUserId);

      expect(result).toBe(true);
      expect(db.list.deleteMany).toHaveBeenCalledWith({
        where: { id: 'list-123', userId: mockUserId },
      });
    });

    it('should return false when list not found', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await deleteList('non-existent', mockUserId);

      expect(result).toBe(false);
    });

    it('should prevent deletion of default list', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue({
        isDefault: true,
      });

      await expect(deleteList('default-list', mockUserId)).rejects.toThrow(
        'Cannot delete the default list'
      );
    });
  });

  describe('batchDeleteLists', () => {
    it('should delete multiple lists', async () => {
      (db.list.findMany as jest.Mock).mockResolvedValue([]);
      (db.list.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await batchDeleteLists(mockUserId, ['list-1', 'list-2', 'list-3']);

      expect(result).toBe(3);
    });

    it('should exclude default lists from deletion', async () => {
      const defaultLists = [
        { id: 'list-1', isDefault: true },
        { id: 'list-3', isDefault: true },
      ];
      (db.list.findMany as jest.Mock).mockResolvedValue(defaultLists);
      (db.list.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await batchDeleteLists(mockUserId, ['list-1', 'list-2', 'list-3']);

      expect(result).toBe(1);
      expect(db.list.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['list-2'] },
          userId: mockUserId,
        },
      });
    });

    it('should return 0 when all lists are default', async () => {
      (db.list.findMany as jest.Mock).mockResolvedValue([
        { id: 'list-1', isDefault: true },
        { id: 'list-2', isDefault: true },
      ]);

      const result = await batchDeleteLists(mockUserId, ['list-1', 'list-2']);

      expect(result).toBe(0);
    });
  });

  describe('updateListOrders', () => {
    it('should update sort order for multiple lists', async () => {
      (db.list.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await updateListOrders(mockUserId, [
        { id: 'list-1', sortOrder: 0 },
        { id: 'list-2', sortOrder: 1 },
        { id: 'list-3', sortOrder: 2 },
      ]);

      expect(result).toBe(3);
      expect(db.list.updateMany).toHaveBeenCalledTimes(3);
    });

    it('should return 0 when no lists to update', async () => {
      const result = await updateListOrders(mockUserId, []);

      expect(result).toBe(0);
    });
  });

  describe('getDefaultList', () => {
    it('should return existing default list', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue(mockList);

      const result = await getDefaultList(mockUserId);

      expect(result).toBeDefined();
      expect(db.list.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          isDefault: true,
        },
        include: expect.any(Object),
      });
    });

    it('should create default list if none exists', async () => {
      const newDefaultList = {
        ...mockList,
        id: 'new-default',
        title: 'Inbox',
        isDefault: true,
        sortOrder: 0,
      };
      (db.list.findFirst as jest.Mock).mockResolvedValue(null);
      (db.list.create as jest.Mock).mockResolvedValue(newDefaultList);

      const result = await getDefaultList(mockUserId);

      expect(result.title).toBe('Inbox');
      expect(result.isDefault).toBe(true);
      expect(db.list.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          title: 'Inbox',
          isDefault: true,
          sortOrder: 0,
        },
        include: expect.any(Object),
      });
    });
  });

  describe('getDefaultListId', () => {
    it('should return existing default list ID', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue({
        id: 'default-123',
      });

      const result = await getDefaultListId(mockUserId);

      expect(result).toBe('default-123');
    });

    it('should create and return new default list ID', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue(null);
      (db.list.create as jest.Mock).mockResolvedValue({
        id: 'new-default-123',
      });

      const result = await getDefaultListId(mockUserId);

      expect(result).toBe('new-default-123');
      expect(db.list.create).toHaveBeenCalled();
    });
  });
});
