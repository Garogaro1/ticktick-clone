/**
 * Tag Module
 *
 * Exports all Tag types, schemas, and service functions.
 */

// Types
export type {
  TagDto,
  TagWithTaskCount,
  TagWithFullRelations,
  TagListResponse,
  TagDetailResponse,
  TagCreateResponse,
  TagUpdateResponse,
  TagDeleteResponse,
  TagErrorResponse,
  TagListOptions,
} from './types';

// Schemas
export {
  SortOrderEnum,
  SortByEnum,
  CreateTagSchema,
  UpdateTagSchema,
  TagQuerySchema,
  BatchDeleteTagSchema,
  UpdateTagOrderSchema,
  AssignTagsSchema,
} from './schemas';

// Schema types
export type {
  CreateTagInput,
  UpdateTagInput,
  TagQueryInput,
  BatchDeleteTagInput,
  UpdateTagOrderInput,
  AssignTagsInput,
} from './schemas';

// Service functions
export {
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
