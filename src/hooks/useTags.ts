'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TagDto } from '@/lib/tags/types';

export interface UseTagsOptions {
  autoFetch?: boolean;
}

export interface UseTagsResult {
  tags: TagDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTag: (name: string, options?: { color?: string | null }) => Promise<TagDto | null>;
  updateTag: (id: string, updates: Partial<TagDto>) => Promise<boolean>;
  deleteTag: (id: string) => Promise<boolean>;
}

/**
 * Hook for fetching and managing tags.
 *
 * Provides tag CRUD operations with optimistic updates.
 */
export function useTags(options: UseTagsOptions = {}): UseTagsResult {
  const { autoFetch = true } = options;

  const [tags, setTags] = useState<TagDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags
  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/tags?sortBy=sortOrder&sortOrder=asc');

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      setTags(data.tags || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTags([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchTags();
    }
  }, [fetchTags, autoFetch]);

  // Add tag
  const addTag = useCallback(
    async (name: string, options?: { color?: string | null }): Promise<TagDto | null> => {
      setError(null);

      try {
        const response = await fetch('/api/tags', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, ...options }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add tag');
        }

        const data = await response.json();
        const newTag = data.tag;

        // Optimistic update - add to end of list
        setTags((prev) => [...prev, newTag]);

        return newTag;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  // Update tag
  const updateTag = useCallback(async (id: string, updates: Partial<TagDto>): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update tag');
      }

      const data = await response.json();
      const updatedTag = data.tag;

      // Optimistic update
      setTags((prev) => prev.map((tag) => (tag.id === id ? updatedTag : tag)));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  // Delete tag
  const deleteTag = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete tag');
      }

      // Optimistic update
      setTags((prev) => prev.filter((tag) => tag.id !== id));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  return {
    tags,
    isLoading,
    error,
    refetch: fetchTags,
    addTag,
    updateTag,
    deleteTag,
  };
}
