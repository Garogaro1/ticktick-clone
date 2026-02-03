/**
 * Tag Service Tests
 *
 * Tests for tag business logic layer including CRUD operations,
 * batch operations, and data transformation.
 */

import {
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  batchDeleteTags,
  updateTagOrders,
  getTagsByTaskId,
  assignTagsToTask,
} from './service';
import { db } from '@/lib/db';

// Mock the database
type MockModel = {
  findMany: jest.Mock;
  findFirst: jest.Mock;
  count: jest.Mock;
  create: jest.Mock;
  createMany: jest.Mock;
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
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    deleteMany: jest.fn(),
  });

  return {
    db: {
      tag: createMockModel(),
      taskTag: createMockModel(),
      task: createMockModel(),
    },
  };
});

describe('Tag Service', () => {
  const mockUserId = 'user-123';

  const mockTag = {
    id: 'tag-123',
    name: 'Work',
    color: '#D97757',
    sortOrder: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    userId: mockUserId,
    _count: { tasks: 5 },
    tasks: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTags', () => {
    it('should fetch tags with filters', async () => {
      const mockTags = [mockTag];
      (db.tag.count as jest.Mock).mockResolvedValue(1);
      (db.tag.findMany as jest.Mock).mockResolvedValue(mockTags);

      const result = await getTags(mockUserId, {
        where: { name: { contains: 'work' } },
        orderBy: { sortOrder: 'asc' },
        take: 10,
        skip: 0,
      });

      expect(result.tags).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(db.tag.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          name: { contains: 'work' },
        },
      });
      expect(db.tag.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no tags found', async () => {
      (db.tag.count as jest.Mock).mockResolvedValue(0);
      (db.tag.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTags(mockUserId);

      expect(result.tags).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should include tasks when requested', async () => {
      (db.tag.count as jest.Mock).mockResolvedValue(1);
      (db.tag.findMany as jest.Mock).mockResolvedValue([mockTag]);

      await getTags(mockUserId, {
        includeTasks: true,
      });

      const findManyCall = (db.tag.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyCall.include.tasks).toBeDefined();
    });
  });

  describe('getTagById', () => {
    it('should fetch a single tag by ID', async () => {
      (db.tag.findFirst as jest.Mock).mockResolvedValue(mockTag);

      const result = await getTagById('tag-123', mockUserId);

      expect(result).toBeDefined();
      expect(db.tag.findFirst).toHaveBeenCalledWith({
        where: { id: 'tag-123', userId: mockUserId },
        include: expect.any(Object),
      });
    });

    it('should return null when tag not found', async () => {
      (db.tag.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getTagById('non-existent', mockUserId);

      expect(result).toBeNull();
    });

    it('should include tasks in response', async () => {
      const tagWithTasks = {
        ...mockTag,
        tasks: [
          { task: { id: 'task-1', title: 'Task 1', status: 'TODO', priority: 'MEDIUM' } },
          { task: { id: 'task-2', title: 'Task 2', status: 'DONE', priority: 'HIGH' } },
        ],
      };
      (db.tag.findFirst as jest.Mock).mockResolvedValue(tagWithTasks);

      const result = await getTagById('tag-123', mockUserId);

      expect(result?.tasks).toHaveLength(2);
      expect(result?.tasks?.[0].id).toBe('task-1');
    });
  });

  describe('createTag', () => {
    it('should create a tag with provided data', async () => {
      (db.tag.findFirst as jest.Mock).mockResolvedValue(null);
      (db.tag.findMany as jest.Mock).mockResolvedValue([]);
      (db.tag.create as jest.Mock).mockResolvedValue(mockTag);

      const result = await createTag(mockUserId, {
        name: 'Personal',
        color: '#5B9A8B',
      });

      expect(result).toBeDefined();
      expect(db.tag.create).toHaveBeenCalled();
    });

    it('should throw error when tag with same name exists', async () => {
      (db.tag.findFirst as jest.Mock).mockResolvedValue(mockTag);

      await expect(
        createTag(mockUserId, {
          name: 'Work',
        })
      ).rejects.toThrow('already exists');
    });

    it('should auto-assign sortOrder if not provided', async () => {
      const existingTag = { ...mockTag, sortOrder: 2 };
      (db.tag.findFirst as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(existingTag);
      (db.tag.create as jest.Mock).mockResolvedValue(mockTag);

      await createTag(mockUserId, {
        name: 'New Tag',
      });

      const createCall = (db.tag.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.sortOrder).toBe(3);
    });

    it('should start sortOrder from 0 if no tags exist', async () => {
      (db.tag.findFirst as jest.Mock).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      (db.tag.create as jest.Mock).mockResolvedValue(mockTag);

      await createTag(mockUserId, {
        name: 'First Tag',
      });

      const createCall = (db.tag.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.sortOrder).toBe(0);
    });
  });

  describe('updateTag', () => {
    it('should update an existing tag', async () => {
      const updatedTag = { ...mockTag, name: 'Updated Work' };
      (db.tag.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockTag) // Tag exists
        .mockResolvedValueOnce(null) // No duplicate with new name
        .mockResolvedValueOnce(updatedTag); // Fetched updated tag
      (db.tag.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await updateTag('tag-123', mockUserId, {
        name: 'Updated Work',
      });

      expect(result).toBeDefined();
      expect(db.tag.updateMany).toHaveBeenCalledWith({
        where: { id: 'tag-123', userId: mockUserId },
        data: expect.objectContaining({
          name: 'Updated Work',
        }),
      });
    });

    it('should return null when tag not found', async () => {
      (db.tag.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await updateTag('non-existent', mockUserId, {
        name: 'Updated Name',
      });

      expect(result).toBeNull();
    });

    it('should throw error when updating to existing name', async () => {
      const existingTag = { ...mockTag, id: 'other-tag', name: 'Personal' };
      (db.tag.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockTag)
        .mockResolvedValueOnce(existingTag);

      await expect(
        updateTag('tag-123', mockUserId, {
          name: 'Personal',
        })
      ).rejects.toThrow('already exists');
    });

    it('should allow updating to same name', async () => {
      (db.tag.findFirst as jest.Mock)
        .mockResolvedValueOnce(mockTag)
        .mockResolvedValueOnce(null) // No duplicate check needed when same name
        .mockResolvedValue(mockTag);
      (db.tag.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await updateTag('tag-123', mockUserId, {
        name: 'Work',
      });

      expect(result).toBeDefined();
    });
  });

  describe('deleteTag', () => {
    it('should delete a tag', async () => {
      (db.tag.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await deleteTag('tag-123', mockUserId);

      expect(result).toBe(true);
      expect(db.tag.deleteMany).toHaveBeenCalledWith({
        where: { id: 'tag-123', userId: mockUserId },
      });
    });

    it('should return false when tag not found', async () => {
      (db.tag.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await deleteTag('non-existent', mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('batchDeleteTags', () => {
    it('should delete multiple tags', async () => {
      (db.tag.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await batchDeleteTags(mockUserId, ['tag-1', 'tag-2', 'tag-3']);

      expect(result).toBe(3);
    });

    it('should return 0 when no tags to delete', async () => {
      (db.tag.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await batchDeleteTags(mockUserId, []);

      expect(result).toBe(0);
    });
  });

  describe('updateTagOrders', () => {
    it('should update sort order for multiple tags', async () => {
      (db.tag.updateMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await updateTagOrders(mockUserId, [
        { id: 'tag-1', sortOrder: 0 },
        { id: 'tag-2', sortOrder: 1 },
        { id: 'tag-3', sortOrder: 2 },
      ]);

      expect(result).toBe(3);
      expect(db.tag.updateMany).toHaveBeenCalledTimes(3);
    });

    it('should return 0 when no tags to update', async () => {
      const result = await updateTagOrders(mockUserId, []);

      expect(result).toBe(0);
    });
  });

  describe('getTagsByTaskId', () => {
    it('should fetch tags for a task', async () => {
      const mockTaskTags = [
        {
          tag: mockTag,
        },
      ];
      (db.taskTag.findMany as jest.Mock).mockResolvedValue(mockTaskTags);

      const result = await getTagsByTaskId('task-123', mockUserId);

      expect(result).toHaveLength(1);
      expect(db.taskTag.findMany).toHaveBeenCalledWith({
        where: {
          taskId: 'task-123',
          tag: {
            userId: mockUserId,
          },
        },
        include: expect.any(Object),
        orderBy: {
          tag: {
            sortOrder: 'asc',
          },
        },
      });
    });

    it('should return empty array when task has no tags', async () => {
      (db.taskTag.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTagsByTaskId('task-123', mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('assignTagsToTask', () => {
    it('should assign tags to a task', async () => {
      (db.task.findFirst as jest.Mock).mockResolvedValue({ id: 'task-123' });
      (db.tag.findMany as jest.Mock).mockResolvedValue([{ id: 'tag-1' }, { id: 'tag-2' }]);
      (db.taskTag.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
      (db.taskTag.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await assignTagsToTask('task-123', mockUserId, ['tag-1', 'tag-2']);

      expect(result).toBe(2);
      expect(db.taskTag.deleteMany).toHaveBeenCalled();
      expect(db.taskTag.createMany).toHaveBeenCalled();
    });

    it('should throw error when task not found', async () => {
      (db.task.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(assignTagsToTask('task-123', mockUserId, ['tag-1'])).rejects.toThrow(
        'Task not found'
      );
    });

    it('should throw error when tag not found', async () => {
      (db.task.findFirst as jest.Mock).mockResolvedValue({ id: 'task-123' });
      (db.tag.findMany as jest.Mock).mockResolvedValue([{ id: 'tag-1' }]);

      await expect(assignTagsToTask('task-123', mockUserId, ['tag-1', 'tag-2'])).rejects.toThrow(
        'One or more tags not found'
      );
    });

    it('should clear all tags when empty array provided', async () => {
      (db.task.findFirst as jest.Mock).mockResolvedValue({ id: 'task-123' });
      (db.tag.findMany as jest.Mock).mockResolvedValue([]); // No tags to verify
      (db.taskTag.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });

      const result = await assignTagsToTask('task-123', mockUserId, []);

      expect(result).toBe(0);
      expect(db.taskTag.deleteMany).toHaveBeenCalled();
      expect(db.taskTag.createMany).not.toHaveBeenCalled();
    });
  });
});
