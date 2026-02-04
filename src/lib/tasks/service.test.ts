/**
 * Task Service Tests
 *
 * Tests for task business logic layer including CRUD operations,
 * batch operations, and data transformation.
 */

import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  batchUpdateTasks,
  batchDeleteTasks,
  toTaskDto,
} from './service';
import { db } from '@/lib/db';
import { TaskStatus, Priority } from '@prisma/client';

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
      task: createMockModel(),
      list: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    },
  };
});

describe('Task Service', () => {
  const mockUserId = 'user-123';
  const mockListId = 'list-123';
  const mockTagId = 'tag-123';

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Test description',
    status: TaskStatus.TODO,
    priority: Priority.MEDIUM,
    dueDate: new Date('2025-12-31'),
    startDate: null,
    completedAt: null,
    estimatedTime: 30,
    spentTime: null,
    recurrenceRule: null,
    recurrenceId: null,
    sortOrder: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    listId: mockListId,
    parentId: null,
    userId: mockUserId,
    goalId: null,
    tags: [],
    subtasks: [],
    _count: { subtasks: 0 },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('toTaskDto', () => {
    it('should convert Prisma task to DTO', () => {
      const taskWithRelations = {
        ...mockTask,
        tags: [
          {
            tag: {
              id: mockTagId,
              name: 'Test Tag',
              color: '#FF0000',
            },
          },
        ],
        list: {
          id: mockListId,
          title: 'Test List',
          color: '#0000FF',
        },
        parent: null,
        subtasks: [],
        _count: { subtasks: 0 },
      };

      const dto = toTaskDto(
        taskWithRelations as typeof taskWithRelations & {
          list: { id: string; title: string; color: string | null };
          parent: null;
        }
      );

      expect(dto).toMatchObject({
        id: 'task-123',
        title: 'Test Task',
        description: 'Test description',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        tags: [
          {
            id: mockTagId,
            name: 'Test Tag',
            color: '#FF0000',
          },
        ],
        _count: { subtasks: 0 },
      });
    });

    it('should include subtasks when present', () => {
      const subtask = { ...mockTask, id: 'subtask-123', title: 'Subtask' };
      const taskWithRelations = {
        ...mockTask,
        tags: [],
        subtasks: [subtask],
        _count: { subtasks: 1 },
      };

      const dto = toTaskDto(
        taskWithRelations as typeof taskWithRelations & {
          list: { id: string; title: string; color: string | null };
          parent: null;
        }
      );

      expect(dto.subtasks).toHaveLength(1);
      expect(dto.subtasks?.[0].id).toBe('subtask-123');
    });
  });

  describe('getTasks', () => {
    it('should fetch tasks with filters', async () => {
      const mockTasks = [mockTask];
      (db.task.count as jest.Mock).mockResolvedValue(1);
      (db.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getTasks(mockUserId, {
        where: { status: TaskStatus.TODO },
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(db.task.count).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          status: TaskStatus.TODO,
        },
      });
      expect(db.task.findMany).toHaveBeenCalled();
    });

    it('should return empty array when no tasks found', async () => {
      (db.task.count as jest.Mock).mockResolvedValue(0);
      (db.task.findMany as jest.Mock).mockResolvedValue([]);

      const result = await getTasks(mockUserId);

      expect(result.tasks).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should include subtasks when requested', async () => {
      (db.task.count as jest.Mock).mockResolvedValue(1);
      (db.task.findMany as jest.Mock).mockResolvedValue([mockTask]);

      await getTasks(mockUserId, {
        includeSubtasks: true,
      });

      const findManyCall = (db.task.findMany as jest.Mock).mock.calls[0][0];
      expect(findManyCall.include.subtasks).toBeDefined();
    });
  });

  describe('getTaskById', () => {
    it('should fetch a single task by ID', async () => {
      (db.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      const result = await getTaskById('task-123', mockUserId);

      expect(result).toBeDefined();
      expect(db.task.findFirst).toHaveBeenCalledWith({
        where: { id: 'task-123', userId: mockUserId },
        include: expect.any(Object),
      });
    });

    it('should return null when task not found', async () => {
      (db.task.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getTaskById('non-existent', mockUserId);

      expect(result).toBeNull();
    });
  });

  describe('createTask', () => {
    it('should create a task with default list', async () => {
      (db.list.findFirst as jest.Mock).mockResolvedValue({
        id: mockListId,
        title: 'Inbox',
        isDefault: true,
      });
      (db.task.create as jest.Mock).mockResolvedValue(mockTask);

      const result = await createTask(mockUserId, {
        title: 'New Task',
        description: 'Description',
      });

      expect(result).toBeDefined();
      expect(db.list.findFirst).toHaveBeenCalledWith({
        where: { userId: mockUserId, isDefault: true },
      });
      expect(db.task.create).toHaveBeenCalled();
    });

    it('should create default list if none exists', async () => {
      const newDefaultList = {
        id: 'new-list-123',
        title: 'Inbox',
        isDefault: true,
        sortOrder: 0,
      };

      (db.list.findFirst as jest.Mock).mockResolvedValue(null);
      (db.list.create as jest.Mock).mockResolvedValue(newDefaultList);
      (db.task.create as jest.Mock).mockResolvedValue(mockTask);

      await createTask(mockUserId, {
        title: 'New Task',
      });

      expect(db.list.create).toHaveBeenCalledWith({
        data: {
          userId: mockUserId,
          title: 'Inbox',
          isDefault: true,
          sortOrder: 0,
        },
      });
    });

    it('should use provided listId', async () => {
      (db.task.create as jest.Mock).mockResolvedValue(mockTask);

      await createTask(mockUserId, {
        title: 'New Task',
        listId: 'custom-list-123',
      });

      const createCall = (db.task.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.list).toEqual({ connect: { id: 'custom-list-123' } });
    });

    it('should set completedAt when status is DONE', async () => {
      const completedTask = { ...mockTask, status: TaskStatus.DONE, completedAt: expect.any(Date) };
      (db.task.create as jest.Mock).mockResolvedValue(completedTask);

      await createTask(mockUserId, {
        title: 'Completed Task',
        status: TaskStatus.DONE,
      });

      const createCall = (db.task.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.completedAt).toBeInstanceOf(Date);
    });

    it('should create task with tags', async () => {
      (db.task.create as jest.Mock).mockResolvedValue(mockTask);

      await createTask(mockUserId, {
        title: 'Task with Tags',
        tags: [{ id: mockTagId }],
      });

      const createCall = (db.task.create as jest.Mock).mock.calls[0][0];
      expect(createCall.data.tags).toEqual({
        create: [{ tag: { connect: { id: mockTagId } } }],
      });
    });
  });

  describe('updateTask', () => {
    it('should update an existing task', async () => {
      (db.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      const result = await updateTask('task-123', mockUserId, {
        title: 'Updated Title',
      });

      expect(result).toBeDefined();
      expect(db.task.updateMany).toHaveBeenCalledWith({
        where: { id: 'task-123', userId: mockUserId },
        data: expect.objectContaining({
          title: 'Updated Title',
        }),
      });
    });

    it('should return null when task not found', async () => {
      (db.task.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await updateTask('non-existent', mockUserId, {
        title: 'Updated Title',
      });

      expect(result).toBeNull();
    });

    it('should set completedAt when status changes to DONE', async () => {
      (db.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      await updateTask('task-123', mockUserId, {
        status: TaskStatus.DONE,
      });

      const updateCall = (db.task.updateMany as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeInstanceOf(Date);
    });

    it('should clear completedAt when status is not DONE', async () => {
      (db.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      await updateTask('task-123', mockUserId, {
        status: TaskStatus.IN_PROGRESS,
      });

      const updateCall = (db.task.updateMany as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeNull();
    });

    it('should update tags when provided', async () => {
      (db.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.task.findFirst as jest.Mock).mockResolvedValue(mockTask);

      await updateTask('task-123', mockUserId, {
        tags: [{ id: mockTagId }],
      });

      const updateCall = (db.task.updateMany as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.tags).toEqual({
        deleteMany: {},
        create: [{ tag: { connect: { id: mockTagId } } }],
      });
    });
  });

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      (db.task.deleteMany as jest.Mock).mockResolvedValue({ count: 1 });

      const result = await deleteTask('task-123', mockUserId);

      expect(result).toBe(true);
      expect(db.task.deleteMany).toHaveBeenCalledWith({
        where: { id: 'task-123', userId: mockUserId },
      });
    });

    it('should return false when task not found', async () => {
      (db.task.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await deleteTask('non-existent', mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('batchUpdateTasks', () => {
    it('should update multiple tasks', async () => {
      const mockTasks = [mockTask, { ...mockTask, id: 'task-456' }];
      (db.task.updateMany as jest.Mock).mockResolvedValue({ count: 2 });
      (db.task.findMany as jest.Mock).mockResolvedValue(mockTasks);

      const result = await batchUpdateTasks(mockUserId, ['task-123', 'task-456'], {
        status: TaskStatus.DONE,
      });

      expect(result.count).toBe(2);
      expect(result.tasks).toHaveLength(2);
      expect(db.task.updateMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['task-123', 'task-456'] },
          userId: mockUserId,
        },
        data: expect.objectContaining({
          status: TaskStatus.DONE,
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should set completedAt when batch updating to DONE', async () => {
      (db.task.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (db.task.findMany as jest.Mock).mockResolvedValue([mockTask]);

      await batchUpdateTasks(mockUserId, ['task-123'], {
        status: TaskStatus.DONE,
      });

      const updateCall = (db.task.updateMany as jest.Mock).mock.calls[0][0];
      expect(updateCall.data.completedAt).toBeInstanceOf(Date);
    });
  });

  describe('batchDeleteTasks', () => {
    it('should delete multiple tasks', async () => {
      (db.task.deleteMany as jest.Mock).mockResolvedValue({ count: 3 });

      const result = await batchDeleteTasks(mockUserId, ['task-123', 'task-456', 'task-789']);

      expect(result).toBe(3);
      expect(db.task.deleteMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['task-123', 'task-456', 'task-789'] },
          userId: mockUserId,
        },
      });
    });

    it('should return 0 when no tasks found', async () => {
      (db.task.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });

      const result = await batchDeleteTasks(mockUserId, ['non-existent']);

      expect(result).toBe(0);
    });
  });
});
