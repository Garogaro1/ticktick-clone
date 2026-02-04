'use client';

/**
 * useHabits Hook
 *
 * Custom hook for managing habits with optimistic updates and localStorage persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  HabitDto,
  CreateHabitInput,
  UpdateHabitInput,
  HabitListFilters,
  HabitStatistics,
} from '@/lib/habits';
import { getRandomHabitColor } from '@/lib/habits/utils';
import { logger } from '@/lib/logger';

const HABITS_CACHE_KEY = 'habits-cache';
const HABIT_VIEW_KEY = 'habit-view';

export interface UseHabitsOptions {
  autoFetch?: boolean;
  filters?: HabitListFilters;
}

export interface UseHabitsResult {
  // Data
  habits: HabitDto[];
  statistics: HabitStatistics | null;
  filteredHabits: HabitDto[];

  // Loading states
  isLoading: boolean;
  isStatisticsLoading: boolean;
  error: string | null;

  // View state
  viewMode: 'list' | 'calendar' | 'grid';
  setViewMode: (mode: 'list' | 'calendar' | 'grid') => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  showArchived: boolean;
  setShowArchived: (show: boolean) => void;

  // CRUD operations
  addHabit: (input: CreateHabitInput) => Promise<HabitDto | null>;
  updateHabit: (id: string, input: UpdateHabitInput) => Promise<HabitDto | null>;
  deleteHabit: (id: string) => Promise<boolean>;
  toggleHabit: (id: string, date?: Date) => Promise<{ created: boolean; habit: HabitDto | null }>;
  archiveHabit: (id: string, archived: boolean) => Promise<boolean>;

  // Refresh
  refetch: () => Promise<void>;
  refetchStatistics: () => Promise<void>;
}

/**
 * Hook for managing habits with optimistic updates and caching.
 */
export function useHabits(options: UseHabitsOptions = {}): UseHabitsResult {
  const { autoFetch = true } = options;

  // State
  const [habits, setHabits] = useState<HabitDto[]>([]);
  const [statistics, setStatistics] = useState<HabitStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewModeState] = useState<'list' | 'calendar' | 'grid'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HABIT_VIEW_KEY);
      return (stored as 'list' | 'calendar' | 'grid') || 'list';
    }
    return 'list';
  });
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showArchived, setShowArchived] = useState(false);

  // Persist view mode
  const setViewMode = useCallback((mode: 'list' | 'calendar' | 'grid') => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(HABIT_VIEW_KEY, mode);
    }
  }, []);

  // Filter habits based on view state
  const filteredHabits = habits.filter((habit) => {
    if (showArchived) return true;
    return !habit.isArchived;
  });

  // Fetch habits
  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });

      if (showArchived) {
        params.append('isArchived', 'false');
      }

      const response = await fetch(`/api/habits?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch habits');
      }

      const data = await response.json();
      setHabits(data.habits || []);

      // Cache in localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(HABITS_CACHE_KEY, JSON.stringify(data.habits || []));
        } catch {
          // Ignore storage errors
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');

      // Try to load from cache
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(HABITS_CACHE_KEY);
          if (cached) {
            setHabits(JSON.parse(cached));
          }
        } catch {
          // Ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [showArchived]);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setIsStatisticsLoading(true);

    try {
      const response = await fetch('/api/habits/statistics');

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data.statistics || null);
    } catch (err) {
      logger.error('Failed to fetch statistics', err instanceof Error ? err : undefined);
    } finally {
      setIsStatisticsLoading(false);
    }
  }, []);

  // Add habit
  const addHabit = useCallback(
    async (input: CreateHabitInput): Promise<HabitDto | null> => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticHabit: HabitDto = {
        id: tempId,
        userId: '',
        title: input.title,
        description: (input.description ?? undefined) || null,
        color: input.color || getRandomHabitColor(),
        icon: input.icon ?? null,
        frequency: input.frequency || 'daily',
        targetCount: input.targetCount || 1,
        sortOrder: input.sortOrder ?? habits.length,
        isArchived: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        entries: [],
        _count: { entries: 0 },
        currentStreak: 0,
        longestStreak: 0,
        completionRate: 0,
        completedToday: false,
      };

      setHabits((prev) => [...prev, optimisticHabit]);

      try {
        const response = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error('Failed to create habit');
        }

        const data = await response.json();
        const newHabit = data.habit as HabitDto;

        // Replace optimistic habit with real one
        setHabits((prev) => prev.map((h) => (h.id === tempId ? newHabit : h)));

        // Refresh statistics
        fetchStatistics();

        return newHabit;
      } catch (err) {
        // Rollback optimistic update
        setHabits((prev) => prev.filter((h) => h.id !== tempId));
        setError(err instanceof Error ? err.message : 'Failed to create habit');
        return null;
      }
    },
    [habits.length, fetchStatistics]
  );

  // Update habit
  const updateHabit = useCallback(
    async (id: string, input: UpdateHabitInput): Promise<HabitDto | null> => {
      // Optimistic update
      const previousHabits = [...habits];
      setHabits((prev) =>
        prev.map((h) => (h.id === id ? { ...h, ...input, updatedAt: new Date() } : h))
      );

      try {
        const response = await fetch(`/api/habits/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error('Failed to update habit');
        }

        const data = await response.json();
        const updatedHabit = data.habit as HabitDto;

        setHabits((prev) => prev.map((h) => (h.id === id ? updatedHabit : h)));

        // Refresh statistics if toggling archive
        if (input.isArchived !== undefined) {
          fetchStatistics();
        }

        return updatedHabit;
      } catch (err) {
        // Rollback optimistic update
        setHabits(previousHabits);
        setError(err instanceof Error ? err.message : 'Failed to update habit');
        return null;
      }
    },
    [habits, fetchStatistics]
  );

  // Delete habit
  const deleteHabit = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic update
      const previousHabits = [...habits];
      setHabits((prev) => prev.filter((h) => h.id !== id));

      try {
        const response = await fetch(`/api/habits/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete habit');
        }

        // Refresh statistics
        fetchStatistics();

        return true;
      } catch (err) {
        // Rollback optimistic update
        setHabits(previousHabits);
        setError(err instanceof Error ? err.message : 'Failed to delete habit');
        return false;
      }
    },
    [habits, fetchStatistics]
  );

  // Toggle habit completion
  const toggleHabit = useCallback(
    async (
      id: string,
      date: Date = new Date()
    ): Promise<{ created: boolean; habit: HabitDto | null }> => {
      try {
        const response = await fetch(`/api/habits/${id}/toggle`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: date.toISOString() }),
        });

        if (!response.ok) {
          throw new Error('Failed to toggle habit');
        }

        const data = await response.json();

        // Update habits with returned habit data
        if (data.habit) {
          setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));

          // Refresh statistics
          fetchStatistics();
        }

        return {
          created: data.created,
          habit: data.habit,
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to toggle habit');
        return { created: false, habit: null };
      }
    },
    [fetchStatistics]
  );

  // Archive/unarchive habit
  const archiveHabit = useCallback(
    async (id: string, archived: boolean): Promise<boolean> => {
      const result = await updateHabit(id, { isArchived: archived });
      return result !== null;
    },
    [updateHabit]
  );

  // Initialize
  useEffect(() => {
    if (autoFetch) {
      fetchHabits();
      fetchStatistics();
    }
  }, [autoFetch, fetchHabits, fetchStatistics]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchHabits();
    await fetchStatistics();
  }, [fetchHabits, fetchStatistics]);

  const refetchStatistics = useCallback(async () => {
    await fetchStatistics();
  }, [fetchStatistics]);

  return {
    habits,
    statistics,
    filteredHabits,
    isLoading,
    isStatisticsLoading,
    error,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    showArchived,
    setShowArchived,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    archiveHabit,
    refetch,
    refetchStatistics,
  };
}
