'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ListDto } from '@/lib/lists/types';

export interface UseListsOptions {
  autoFetch?: boolean;
}

export interface UseListsResult {
  lists: ListDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addList: (
    title: string,
    options?: { description?: string; icon?: string; color?: string }
  ) => Promise<ListDto | null>;
  updateList: (id: string, updates: Partial<ListDto>) => Promise<boolean>;
  deleteList: (id: string) => Promise<boolean>;
  toggleFavorite: (id: string, isFavorite: boolean) => Promise<boolean>;
}

/**
 * Hook for fetching and managing lists.
 *
 * Provides list CRUD operations with optimistic updates.
 */
export function useLists(options: UseListsOptions = {}): UseListsResult {
  const { autoFetch = true } = options;

  const [lists, setLists] = useState<ListDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lists
  const fetchLists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/lists?sortBy=sortOrder&sortOrder=asc');

      if (!response.ok) {
        throw new Error('Failed to fetch lists');
      }

      const data = await response.json();
      setLists(data.lists || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLists([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchLists();
    }
  }, [fetchLists, autoFetch]);

  // Add list
  const addList = useCallback(
    async (
      title: string,
      options?: { description?: string; icon?: string; color?: string }
    ): Promise<ListDto | null> => {
      setError(null);

      try {
        const response = await fetch('/api/lists', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, ...options }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add list');
        }

        const data = await response.json();
        const newList = data.list;

        // Optimistic update - add to end of list
        setLists((prev) => [...prev, newList]);

        return newList;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  // Update list
  const updateList = useCallback(
    async (id: string, updates: Partial<ListDto>): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch(`/api/lists/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update list');
        }

        const data = await response.json();
        const updatedList = data.list;

        // Optimistic update
        setLists((prev) => prev.map((list) => (list.id === id ? updatedList : list)));

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  // Delete list
  const deleteList = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/lists/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete list');
      }

      // Optimistic update
      setLists((prev) => prev.filter((list) => list.id !== id));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (id: string, isFavorite: boolean): Promise<boolean> => {
      return updateList(id, { isFavorite });
    },
    [updateList]
  );

  return {
    lists,
    isLoading,
    error,
    refetch: fetchLists,
    addList,
    updateList,
    deleteList,
    toggleFavorite,
  };
}
