/**
 * Saved filter types for custom filter persistence.
 */

import type { TaskStatus, Priority } from '@/lib/tasks/types';

/**
 * A saved filter configuration.
 */
export interface SavedFilter {
  id: string;
  name: string;
  filter: {
    status?: TaskStatus | TaskStatus[];
    priority?: Priority | Priority[];
    listId?: string;
    tagIds?: string[];
    dueDateFrom?: string;
    dueDateTo?: string;
    search?: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Options for creating a new saved filter.
 */
export interface CreateSavedFilterOptions {
  name: string;
  filter: SavedFilter['filter'];
}

/**
 * Options for updating a saved filter.
 */
export interface UpdateSavedFilterOptions {
  name?: string;
  filter?: SavedFilter['filter'];
}
