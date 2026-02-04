'use client';

import { useState, useEffect, useCallback } from 'react';
import type { SortBy, SortOrder } from './useTasks';
import { logger } from '@/lib/logger';

const SORT_PREFERENCES_KEY = 'ticktick:sortPreferences';

interface SortPreferences {
  sortBy: SortBy;
  sortOrder: SortOrder;
}

const DEFAULT_PREFERENCES: SortPreferences = {
  sortBy: 'sortOrder',
  sortOrder: 'asc',
};

/**
 * Hook for managing sort preferences with localStorage persistence.
 *
 * Automatically saves/loads sort preferences across sessions.
 */
export function useSortPreferences() {
  const [preferences, setPreferences] = useState<SortPreferences>(DEFAULT_PREFERENCES);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SORT_PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SortPreferences>;
        // Validate that the stored values are valid
        const validSortBy = [
          'createdAt',
          'updatedAt',
          'dueDate',
          'priority',
          'title',
          'sortOrder',
        ].includes(parsed.sortBy ?? '')
          ? parsed.sortBy
          : DEFAULT_PREFERENCES.sortBy;
        const validSortOrder = ['asc', 'desc'].includes(parsed.sortOrder ?? '')
          ? parsed.sortOrder
          : DEFAULT_PREFERENCES.sortOrder;

        setPreferences({
          sortBy: (validSortBy || DEFAULT_PREFERENCES.sortBy) as SortBy,
          sortOrder: (validSortOrder || DEFAULT_PREFERENCES.sortOrder) as SortOrder,
        });
      }
    } catch (error) {
      logger.error('Failed to load sort preferences', error instanceof Error ? error : undefined);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Update preferences
  const updatePreferences = useCallback((sortBy: SortBy, sortOrder: SortOrder) => {
    const newPreferences = { sortBy, sortOrder };
    setPreferences(newPreferences);

    try {
      localStorage.setItem(SORT_PREFERENCES_KEY, JSON.stringify(newPreferences));
    } catch (error) {
      logger.error('Failed to save sort preferences', error instanceof Error ? error : undefined);
    }
  }, []);

  // Reset to defaults
  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    try {
      localStorage.removeItem(SORT_PREFERENCES_KEY);
    } catch (error) {
      logger.error('Failed to clear sort preferences', error instanceof Error ? error : undefined);
    }
  }, []);

  return {
    sortBy: preferences.sortBy,
    sortOrder: preferences.sortOrder,
    updatePreferences,
    resetPreferences,
    isLoaded,
  };
}
