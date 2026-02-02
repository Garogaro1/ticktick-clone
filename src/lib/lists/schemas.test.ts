/**
 * List Schemas Tests
 *
 * Tests for Zod validation schemas used in List API endpoints.
 */

import {
  CreateListSchema,
  UpdateListSchema,
  ListQuerySchema,
  BatchDeleteListSchema,
  UpdateListOrderSchema,
  SortOrderEnum,
  SortByEnum,
} from './schemas';

describe('List Schemas', () => {
  describe('Enums', () => {
    it('should validate sort order enum values', () => {
      expect(() => SortOrderEnum.parse('asc')).not.toThrow();
      expect(() => SortOrderEnum.parse('desc')).not.toThrow();
    });

    it('should validate sort by enum values', () => {
      const validSortFields = ['createdAt', 'updatedAt', 'title', 'sortOrder'];
      validSortFields.forEach((field) => {
        expect(() => SortByEnum.parse(field)).not.toThrow();
      });
    });
  });

  describe('CreateListSchema', () => {
    const validListData = {
      title: 'New List',
      description: 'List description',
      icon: '📋',
      color: '#D97757',
      sortOrder: 0,
      isDefault: false,
      isFavorite: true,
    };

    it('should accept valid list data', () => {
      const result = CreateListSchema.safeParse(validListData);
      expect(result.success).toBe(true);
    });

    it('should require title field', () => {
      const result = CreateListSchema.safeParse({ ...validListData, title: '' });
      expect(result.success).toBe(false);
    });

    it('should limit title to 100 characters', () => {
      const longTitle = 'a'.repeat(101);
      const result = CreateListSchema.safeParse({ ...validListData, title: longTitle });
      expect(result.success).toBe(false);
    });

    it('should limit description to 500 characters', () => {
      const longDescription = 'a'.repeat(501);
      const result = CreateListSchema.safeParse({ ...validListData, description: longDescription });
      expect(result.success).toBe(false);
    });

    it('should limit icon to 10 characters', () => {
      const longIcon = 'a'.repeat(11);
      const result = CreateListSchema.safeParse({ ...validListData, icon: longIcon });
      expect(result.success).toBe(false);
    });

    it('should accept list with only required fields', () => {
      const result = CreateListSchema.safeParse({ title: 'Minimal List' });
      expect(result.success).toBe(true);
    });

    it('should validate hex color format', () => {
      const invalidColor = CreateListSchema.safeParse({ ...validListData, color: 'red' });
      expect(invalidColor.success).toBe(false);

      const validColor = CreateListSchema.safeParse({ ...validListData, color: '#D97757' });
      expect(validColor.success).toBe(true);
    });

    it('should accept emoji as icon', () => {
      const result = CreateListSchema.safeParse({ ...validListData, icon: '📋' });
      expect(result.success).toBe(true);
    });

    it('should validate sortOrder as non-negative integer', () => {
      const negativeSort = CreateListSchema.safeParse({ ...validListData, sortOrder: -1 });
      expect(negativeSort.success).toBe(false);
    });
  });

  describe('UpdateListSchema', () => {
    const validUpdateData = {
      title: 'Updated List',
      description: 'Updated description',
      icon: '📌',
      color: '#5B9A8B',
      sortOrder: 1,
      isDefault: true,
      isFavorite: false,
    };

    it('should accept valid update data', () => {
      const result = UpdateListSchema.safeParse(validUpdateData);
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no updates)', () => {
      const result = UpdateListSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should allow nullifying optional fields', () => {
      const result = UpdateListSchema.safeParse({
        description: null,
        icon: null,
        color: null,
      });
      expect(result.success).toBe(true);
    });

    it('should validate title length when updating', () => {
      const result = UpdateListSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('should validate hex color format on update', () => {
      const invalidColor = UpdateListSchema.safeParse({ color: 'red' });
      expect(invalidColor.success).toBe(false);

      const validColor = UpdateListSchema.safeParse({ color: '#5B9A8B' });
      expect(validColor.success).toBe(true);
    });

    it('should validate sortOrder as non-negative integer on update', () => {
      const result = UpdateListSchema.safeParse({ sortOrder: -1 });
      expect(result.success).toBe(false);
    });
  });

  describe('ListQuerySchema', () => {
    const validQuery = {
      search: 'work',
      isFavorite: 'true',
      isDefault: 'false',
      sortBy: 'title',
      sortOrder: 'asc',
      limit: '20',
      offset: '0',
      includeTasks: 'true',
    };

    it('should accept valid query parameters', () => {
      const result = ListQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should coerce boolean strings to booleans', () => {
      const result = ListQuerySchema.safeParse(validQuery);
      if (result.success) {
        expect(typeof result.data.isFavorite).toBe('boolean');
        expect(typeof result.data.isDefault).toBe('boolean');
        expect(typeof result.data.includeTasks).toBe('boolean');
      }
    });

    it('should coerce limit and offset to numbers', () => {
      const result = ListQuerySchema.safeParse(validQuery);
      if (result.success) {
        expect(typeof result.data.limit).toBe('number');
        expect(typeof result.data.offset).toBe('number');
      }
    });

    it('should validate limit range (1-100)', () => {
      const tooSmall = ListQuerySchema.safeParse({ limit: '0' });
      expect(tooSmall.success).toBe(false);

      const tooBig = ListQuerySchema.safeParse({ limit: '101' });
      expect(tooBig.success).toBe(false);
    });

    it('should accept empty query', () => {
      const result = ListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate search query length', () => {
      const result = ListQuerySchema.safeParse({ search: 'a'.repeat(201) });
      expect(result.success).toBe(false);
    });
  });

  describe('BatchDeleteListSchema', () => {
    const validBatchDelete = {
      listIds: ['clx1234567890', 'clx0987654321'],
    };

    it('should accept valid batch delete data', () => {
      const result = BatchDeleteListSchema.safeParse(validBatchDelete);
      expect(result.success).toBe(true);
    });

    it('should require at least one list ID', () => {
      const result = BatchDeleteListSchema.safeParse({ listIds: [] });
      expect(result.success).toBe(false);
    });

    it('should validate CUID format for list IDs', () => {
      const result = BatchDeleteListSchema.safeParse({
        listIds: ['invalid-id'],
      });
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateListOrderSchema', () => {
    const validOrderData = {
      listOrders: [
        { id: 'clx1234567890', sortOrder: 0 },
        { id: 'clx0987654321', sortOrder: 1 },
        { id: 'clxaaaaaaaaaa', sortOrder: 2 },
      ],
    };

    it('should accept valid order update data', () => {
      const result = UpdateListOrderSchema.safeParse(validOrderData);
      expect(result.success).toBe(true);
    });

    it('should require at least one list order', () => {
      const result = UpdateListOrderSchema.safeParse({ listOrders: [] });
      expect(result.success).toBe(false);
    });

    it('should validate CUID format for list IDs', () => {
      const result = UpdateListOrderSchema.safeParse({
        listOrders: [{ id: 'invalid-id', sortOrder: 0 }],
      });
      expect(result.success).toBe(false);
    });

    it('should validate sortOrder as non-negative integer', () => {
      const result = UpdateListOrderSchema.safeParse({
        listOrders: [{ id: 'clx1234567890', sortOrder: -1 }],
      });
      expect(result.success).toBe(false);
    });

    it('should accept single list order', () => {
      const result = UpdateListOrderSchema.safeParse({
        listOrders: [{ id: 'clx1234567890', sortOrder: 0 }],
      });
      expect(result.success).toBe(true);
    });
  });
});
