/**
 * Tag Schemas Tests
 *
 * Tests for Zod validation schemas used in Tag API endpoints.
 */

import {
  CreateTagSchema,
  UpdateTagSchema,
  TagQuerySchema,
  BatchDeleteTagSchema,
  UpdateTagOrderSchema,
  AssignTagsSchema,
  SortOrderEnum,
  SortByEnum,
} from './schemas';

describe('Tag Schemas', () => {
  describe('Enums', () => {
    it('should validate sort order enum values', () => {
      expect(() => SortOrderEnum.parse('asc')).not.toThrow();
      expect(() => SortOrderEnum.parse('desc')).not.toThrow();
    });

    it('should validate sort by enum values', () => {
      const validSortFields = ['createdAt', 'updatedAt', 'name', 'sortOrder'];
      validSortFields.forEach((field) => {
        expect(() => SortByEnum.parse(field)).not.toThrow();
      });
    });
  });

  describe('CreateTagSchema', () => {
    const validTagData = {
      name: 'Work',
      color: '#D97757',
      sortOrder: 0,
    };

    it('should accept valid tag data', () => {
      const result = CreateTagSchema.safeParse(validTagData);
      expect(result.success).toBe(true);
    });

    it('should require name field', () => {
      const result = CreateTagSchema.safeParse({ ...validTagData, name: '' });
      expect(result.success).toBe(false);
    });

    it('should limit name to 50 characters', () => {
      const longName = 'a'.repeat(51);
      const result = CreateTagSchema.safeParse({ name: longName });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from name', () => {
      const result = CreateTagSchema.safeParse({ name: '  Work  ' });
      if (result.success) {
        expect(result.data.name).toBe('Work');
      }
    });

    it('should accept tag with only required field', () => {
      const result = CreateTagSchema.safeParse({ name: 'Personal' });
      expect(result.success).toBe(true);
    });

    it('should validate hex color format', () => {
      const invalidColor = CreateTagSchema.safeParse({ ...validTagData, color: 'red' });
      expect(invalidColor.success).toBe(false);

      const validColor = CreateTagSchema.safeParse({ ...validTagData, color: '#D97757' });
      expect(validColor.success).toBe(true);
    });

    it('should accept null color', () => {
      const result = CreateTagSchema.safeParse({ name: 'Work', color: null });
      expect(result.success).toBe(true);
    });

    it('should validate sortOrder as non-negative integer', () => {
      const negativeSort = CreateTagSchema.safeParse({ name: 'Work', sortOrder: -1 });
      expect(negativeSort.success).toBe(false);
    });
  });

  describe('UpdateTagSchema', () => {
    const validUpdateData = {
      name: 'Updated Work',
      color: '#5B9A8B',
      sortOrder: 1,
    };

    it('should accept valid update data', () => {
      const result = UpdateTagSchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no updates)', () => {
      const result = UpdateTagSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow nullifying color field', () => {
      const result = UpdateTagSchema.safeParse({
        color: null,
      });
      expect(result.success).toBe(true);
    });

    it('should validate name length when updating', () => {
      const result = UpdateTagSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });

    it('should validate hex color format on update', () => {
      const invalidColor = UpdateTagSchema.safeParse({ color: 'red' });
      expect(invalidColor.success).toBe(false);

      const validColor = UpdateTagSchema.safeParse({ color: '#5B9A8B' });
      expect(validColor.success).toBe(true);
    });

    it('should validate sortOrder as non-negative integer on update', () => {
      const result = UpdateTagSchema.safeParse({ sortOrder: -1 });
      expect(result.success).toBe(false);
    });

    it('should trim whitespace from name on update', () => {
      const result = UpdateTagSchema.safeParse({ name: '  Work  ' });
      if (result.success) {
        expect(result.data.name).toBe('Work');
      }
    });
  });

  describe('TagQuerySchema', () => {
    const validQuery = {
      search: 'work',
      sortBy: 'name',
      sortOrder: 'asc',
      limit: '20',
      offset: '0',
      includeTasks: 'true',
    };

    it('should accept valid query parameters', () => {
      const result = TagQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should coerce limit and offset to numbers', () => {
      const result = TagQuerySchema.safeParse(validQuery);
      if (result.success) {
        expect(typeof result.data.limit).toBe('number');
        expect(typeof result.data.offset).toBe('number');
      }
    });

    it('should coerce includeTasks to boolean', () => {
      const result = TagQuerySchema.safeParse(validQuery);
      if (result.success) {
        expect(typeof result.data.includeTasks).toBe('boolean');
      }
    });

    it('should validate limit range (1-100)', () => {
      const tooSmall = TagQuerySchema.safeParse({ limit: '0' });
      expect(tooSmall.success).toBe(false);

      const tooBig = TagQuerySchema.safeParse({ limit: '101' });
      expect(tooBig.success).toBe(false);
    });

    it('should accept empty query', () => {
      const result = TagQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate search query length', () => {
      const result = TagQuerySchema.safeParse({ search: 'a'.repeat(201) });
      expect(result.success).toBe(false);
    });
  });

  describe('BatchDeleteTagSchema', () => {
    const validBatchDelete = {
      tagIds: ['clx1234567890', 'clx0987654321'],
    };

    it('should accept valid batch delete data', () => {
      const result = BatchDeleteTagSchema.safeParse(validBatchDelete);
      expect(result.success).toBe(true);
    });

    it('should require at least one tag ID', () => {
      const result = BatchDeleteTagSchema.safeParse({ tagIds: [] });
      expect(result.success).toBe(false);
    });

    it('should validate CUID format for tag IDs', () => {
      const result = BatchDeleteTagSchema.safeParse({
        tagIds: ['invalid-id'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateTagOrderSchema', () => {
    const validOrderData = {
      tagOrders: [
        { id: 'clx1234567890', sortOrder: 0 },
        { id: 'clx0987654321', sortOrder: 1 },
        { id: 'clxaaaaaaaaaa', sortOrder: 2 },
      ],
    };

    it('should accept valid order update data', () => {
      const result = UpdateTagOrderSchema.safeParse(validOrderData);
      expect(result.success).toBe(true);
    });

    it('should require at least one tag order', () => {
      const result = UpdateTagOrderSchema.safeParse({ tagOrders: [] });
      expect(result.success).toBe(false);
    });

    it('should validate CUID format for tag IDs', () => {
      const result = UpdateTagOrderSchema.safeParse({
        tagOrders: [{ id: 'invalid-id', sortOrder: 0 }],
      });
      expect(result.success).toBe(false);
    });

    it('should validate sortOrder as non-negative integer', () => {
      const result = UpdateTagOrderSchema.safeParse({
        tagOrders: [{ id: 'clx1234567890', sortOrder: -1 }],
      });
      expect(result.success).toBe(false);
    });

    it('should accept single tag order', () => {
      const result = UpdateTagOrderSchema.safeParse({
        tagOrders: [{ id: 'clx1234567890', sortOrder: 0 }],
      });
      expect(result.success).toBe(true);
    });
  });

  describe('AssignTagsSchema', () => {
    it('should accept valid tag IDs array', () => {
      const result = AssignTagsSchema.safeParse({
        tagIds: ['clx1234567890', 'clx0987654321'],
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty tag IDs array', () => {
      const result = AssignTagsSchema.safeParse({
        tagIds: [],
      });
      expect(result.success).toBe(true);
    });

    it('should accept undefined tagIds', () => {
      const result = AssignTagsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate CUID format for tag IDs', () => {
      const result = AssignTagsSchema.safeParse({
        tagIds: ['invalid-id'],
      });
      expect(result.success).toBe(false);
    });
  });
});
