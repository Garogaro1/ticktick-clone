/**
 * List Module
 *
 * Exports all types, schemas, and services for the List feature.
 */

// Types
export type {
  ListDto,
  ListWithTaskCount,
  ListWithFullRelations,
  ListListResponse,
  ListDetailResponse,
  ListCreateResponse,
  ListUpdateResponse,
  ListDeleteResponse,
  ListErrorResponse,
  ListListOptions,
} from './types';

// Schemas
export {
  CreateListSchema,
  UpdateListSchema,
  ListQuerySchema,
  BatchDeleteListSchema,
  UpdateListOrderSchema,
} from './schemas';

export type {
  CreateListInput,
  UpdateListInput,
  ListQueryInput,
  BatchDeleteListInput,
  UpdateListOrderInput,
} from './schemas';

// Service
export {
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
