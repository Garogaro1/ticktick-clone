/**
 * Task Schemas Tests
 *
 * Tests for Zod validation schemas used in Task API endpoints.
 */

import {
  CreateTaskSchema,
  UpdateTaskSchema,
  TaskQuerySchema,
  BatchUpdateTaskSchema,
  BatchDeleteTaskSchema,
  CompleteTaskSchema,
  TaskStatusEnum,
  PriorityEnum,
  SortOrderEnum,
  SortByEnum,
} from './schemas';

describe('Task Schemas', () => {
  describe('Enums', () => {
    it('should validate task status enum values', () => {
      const validStatuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'];
      validStatuses.forEach((status) => {
        expect(() => TaskStatusEnum.parse(status)).not.toThrow();
      });
    });

    it('should validate priority enum values', () => {
      const validPriorities = ['NONE', 'LOW', 'MEDIUM', 'HIGH'];
      validPriorities.forEach((priority) => {
        expect(() => PriorityEnum.parse(priority)).not.toThrow();
      });
    });

    it('should validate sort order enum values', () => {
      expect(() => SortOrderEnum.parse('asc')).not.toThrow();
      expect(() => SortOrderEnum.parse('desc')).not.toThrow();
    });

    it('should validate sort by enum values', () => {
      const validSortFields = [
        'createdAt',
        'updatedAt',
        'dueDate',
        'priority',
        'title',
        'sortOrder',
      ];
      validSortFields.forEach((field) => {
        expect(() => SortByEnum.parse(field)).not.toThrow();
      });
    });
  });

  describe('CreateTaskSchema', () => {
    const validTaskData = {
      title: 'New Task',
      description: 'Task description',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '2025-12-31',
      listId: 'clx1234567890',
      tags: [{ id: 'clx1234567890' }],
    };

    it('should accept valid task data', () => {
      const result = CreateTaskSchema.safeParse(validTaskData);
      expect(result.success).toBe(true);
    });

    it('should require title field', () => {
      const result = CreateTaskSchema.safeParse({ ...validTaskData, title: '' });
      expect(result.success).toBe(false);
    });

    it('should limit title to 500 characters', () => {
      const longTitle = 'a'.repeat(501);
      const result = CreateTaskSchema.safeParse({ ...validTaskData, title: longTitle });
      expect(result.success).toBe(false);
    });

    it('should limit description to 10000 characters', () => {
      const longDescription = 'a'.repeat(10001);
      const result = CreateTaskSchema.safeParse({ ...validTaskData, description: longDescription });
      expect(result.success).toBe(false);
    });

    it('should accept task with only required fields', () => {
      const result = CreateTaskSchema.safeParse({ title: 'Minimal Task' });
      expect(result.success).toBe(true);
    });

    it('should validate CUID format for listId', () => {
      const result = CreateTaskSchema.safeParse({ ...validTaskData, listId: 'invalid-id' });
      expect(result.success).toBe(false);
    });

    it('should accept array of tags', () => {
      const result = CreateTaskSchema.safeParse({
        ...validTaskData,
        tags: [{ id: 'clx1234567890' }, { id: 'clx0987654321' }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('UpdateTaskSchema', () => {
    const validUpdateData = {
      title: 'Updated Task',
      description: 'Updated description',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    };

    it('should accept valid update data', () => {
      const result = UpdateTaskSchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no updates)', () => {
      const result = UpdateTaskSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow nullifying optional fields', () => {
      const result = UpdateTaskSchema.safeParse({
        description: null,
        dueDate: null,
        listId: null,
      });
      expect(result.success).toBe(true);
    });

    it('should validate title length when updating', () => {
      const result = UpdateTaskSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('TaskQuerySchema', () => {
    const validQuery = {
      status: 'TODO',
      priority: 'HIGH',
      listId: 'clx1234567890',
      sortBy: 'dueDate',
      sortOrder: 'asc',
      limit: '20',
      offset: '0',
    };

    it('should accept valid query parameters', () => {
      const result = TaskQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should coerce limit and offset to numbers', () => {
      const result = TaskQuerySchema.safeParse(validQuery);
      if (result.success) {
        expect(typeof result.data.limit).toBe('number');
        expect(typeof result.data.offset).toBe('number');
      }
    });

    it('should coerce date strings to Date objects', () => {
      const result = TaskQuerySchema.safeParse({
        dueBefore: '2025-12-31',
        dueAfter: '2025-01-01',
      });
      if (result.success) {
        expect(result.data.dueBefore).toBeInstanceOf(Date);
        expect(result.data.dueAfter).toBeInstanceOf(Date);
      }
    });

    it('should validate limit range (1-100)', () => {
      const tooSmall = TaskQuerySchema.safeParse({ limit: '0' });
      expect(tooSmall.success).toBe(false);

      const tooBig = TaskQuerySchema.safeParse({ limit: '101' });
      expect(tooBig.success).toBe(false);
    });

    it('should accept empty query', () => {
      const result = TaskQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate search query length', () => {
      const result = TaskQuerySchema.safeParse({ search: 'a'.repeat(201) });
      expect(result.success).toBe(false);
    });

    it('should validate CUID format for listId', () => {
      const result = TaskQuerySchema.safeParse({ listId: 'invalid-id' });
      expect(result.success).toBe(false);
    });
  });

  describe('BatchUpdateTaskSchema', () => {
    const validBatchUpdate = {
      taskIds: ['clx1234567890', 'clx0987654321'],
      updates: {
        status: 'DONE',
        priority: 'HIGH',
      },
    };

    it('should accept valid batch update data', () => {
      const result = BatchUpdateTaskSchema.safeParse(validBatchUpdate);
      expect(result.success).toBe(true);
    });

    it('should require at least one task ID', () => {
      const result = BatchUpdateTaskSchema.safeParse({
        taskIds: [],
        updates: { status: 'DONE' },
      });
      expect(result.success).toBe(false);
    });

    it('should validate CUID format for task IDs', () => {
      const result = BatchUpdateTaskSchema.safeParse({
        taskIds: ['invalid-id'],
        updates: { status: 'DONE' },
      });
      expect(result.success).toBe(false);
    });

    it('should accept updates with only status', () => {
      const result = BatchUpdateTaskSchema.safeParse({
        taskIds: ['clx1234567890'],
        updates: { status: 'DONE' },
      });
      expect(result.success).toBe(true);
    });

    it('should accept updates with only priority', () => {
      const result = BatchUpdateTaskSchema.safeParse({
        taskIds: ['clx1234567890'],
        updates: { priority: 'HIGH' },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('BatchDeleteTaskSchema', () => {
    const validBatchDelete = {
      taskIds: ['clx1234567890', 'clx0987654321'],
    };

    it('should accept valid batch delete data', () => {
      const result = BatchDeleteTaskSchema.safeParse(validBatchDelete);
      expect(result.success).toBe(true);
    });

    it('should require at least one task ID', () => {
      const result = BatchDeleteTaskSchema.safeParse({ taskIds: [] });
      expect(result.success).toBe(false);
    });

    it('should validate CUID format for task IDs', () => {
      const result = BatchDeleteTaskSchema.safeParse({
        taskIds: ['invalid-id'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('CompleteTaskSchema', () => {
    it('should accept empty object', () => {
      const result = CompleteTaskSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept spentTime as non-negative integer', () => {
      const result = CompleteTaskSchema.safeParse({ spentTime: 30 });
      expect(result.success).toBe(true);
    });

    it('should reject negative spentTime', () => {
      const result = CompleteTaskSchema.safeParse({ spentTime: -5 });
      expect(result.success).toBe(false);
    });

    it('should reject non-integer spentTime', () => {
      const result = CompleteTaskSchema.safeParse({ spentTime: 30.5 });
      expect(result.success).toBe(false);
    });
  });
});
