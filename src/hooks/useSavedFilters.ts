'use client';

import { useState, useEffect, useCallback } from 'react';
import type {
  SavedFilter,
  CreateSavedFilterOptions,
  UpdateSavedFilterOptions,
} from '@/lib/filters/types';

const STORAGE_KEY = 'ticktick-saved-filters';

/**
 * Hook for managing saved custom filters.
 *
 * Uses localStorage to persist filters across sessions.
 */
export function useSavedFilters() {
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load filters from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedFilter[];
        setSavedFilters(parsed);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved filters');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedFilters));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save filters');
      }
    }
  }, [savedFilters, isLoading]);

  /**
   * Creates a new saved filter.
   */
  const createFilter = useCallback((options: CreateSavedFilterOptions) => {
    const newFilter: SavedFilter = {
      id: `saved-filter-${Date.now()}`,
      name: options.name,
      filter: options.filter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSavedFilters((prev) => [...prev, newFilter]);
    return newFilter;
  }, []);

  /**
   * Updates an existing saved filter.
   */
  const updateFilter = useCallback((id: string, options: UpdateSavedFilterOptions) => {
    setSavedFilters((prev) =>
      prev.map((filter) =>
        filter.id === id
          ? {
              ...filter,
              ...(options.name && { name: options.name }),
              ...(options.filter && { filter: options.filter }),
              updatedAt: new Date().toISOString(),
            }
          : filter
      )
    );
  }, []);

  /**
   * Deletes a saved filter.
   */
  const deleteFilter = useCallback((id: string) => {
    setSavedFilters((prev) => prev.filter((filter) => filter.id !== id));
  }, []);

  /**
   * Gets a saved filter by ID.
   */
  const getFilter = useCallback(
    (id: string): SavedFilter | undefined => {
      return savedFilters.find((filter) => filter.id === id);
    },
    [savedFilters]
  );

  return {
    savedFilters,
    isLoading,
    error,
    createFilter,
    updateFilter,
    deleteFilter,
    getFilter,
  };
}
