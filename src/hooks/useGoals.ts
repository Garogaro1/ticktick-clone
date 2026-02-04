'use client';

/**
 * useGoals Hook
 *
 * Custom hook for managing goals with optimistic updates and localStorage persistence.
 */

import { useState, useEffect, useCallback } from 'react';
import type {
  GoalDto,
  CreateGoalInput,
  UpdateGoalInput,
  GoalListFilters,
  GoalStatistics,
} from '@/lib/goals';

const GOALS_CACHE_KEY = 'goals-cache';
const GOALS_VIEW_KEY = 'goal-view';

export interface UseGoalsOptions {
  autoFetch?: boolean;
  filters?: GoalListFilters;
}

export interface UseGoalsResult {
  // Data
  goals: GoalDto[];
  statistics: GoalStatistics | null;
  filteredGoals: GoalDto[];

  // Loading states
  isLoading: boolean;
  isStatisticsLoading: boolean;
  error: string | null;

  // View state
  viewMode: 'list' | 'cards' | 'timeline';
  setViewMode: (mode: 'list' | 'cards' | 'timeline') => void;
  statusFilter: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'all';
  setStatusFilter: (status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'all') => void;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;

  // CRUD operations
  addGoal: (input: CreateGoalInput) => Promise<GoalDto | null>;
  updateGoal: (id: string, input: UpdateGoalInput) => Promise<GoalDto | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  updateProgress: (id: string, increment: number) => Promise<GoalDto | null>;
  completeGoal: (id: string) => Promise<GoalDto | null>;
  pauseGoal: (id: string) => Promise<GoalDto | null>;
  abandonGoal: (id: string) => Promise<GoalDto | null>;

  // Refresh
  refetch: () => Promise<void>;
  refetchStatistics: () => Promise<void>;
}

/**
 * Hook for managing goals with optimistic updates and caching.
 */
export function useGoals(options: UseGoalsOptions = {}): UseGoalsResult {
  const { autoFetch = true } = options;

  // State
  const [goals, setGoals] = useState<GoalDto[]>([]);
  const [statistics, setStatistics] = useState<GoalStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStatisticsLoading, setIsStatisticsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View state
  const [viewMode, setViewModeState] = useState<'list' | 'cards' | 'timeline'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GOALS_VIEW_KEY);
      return (stored as 'list' | 'cards' | 'timeline') || 'cards';
    }
    return 'cards';
  });
  const [statusFilter, setStatusFilter] = useState<
    'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'all'
  >('all');
  const [showCompleted, setShowCompleted] = useState(false);

  // Persist view mode
  const setViewMode = useCallback((mode: 'list' | 'cards' | 'timeline') => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(GOALS_VIEW_KEY, mode);
    }
  }, []);

  // Filter goals based on view state
  const filteredGoals = goals.filter((goal) => {
    // Status filter
    if (statusFilter !== 'all' && goal.status !== statusFilter) {
      return false;
    }
    // Show completed filter
    if (!showCompleted && goal.status === 'COMPLETED') {
      return false;
    }
    return true;
  });

  // Fetch goals
  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });

      const response = await fetch(`/api/goals?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch goals');
      }

      const data = await response.json();
      setGoals(data.goals || []);

      // Cache in localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(GOALS_CACHE_KEY, JSON.stringify(data.goals || []));
        } catch {
          // Ignore storage errors
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch goals');

      // Try to load from cache
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem(GOALS_CACHE_KEY);
          if (cached) {
            setGoals(JSON.parse(cached));
          }
        } catch {
          // Ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch statistics
  const fetchStatistics = useCallback(async () => {
    setIsStatisticsLoading(true);

    try {
      const response = await fetch('/api/goals/statistics');

      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }

      const data = await response.json();
      setStatistics(data.statistics || null);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setIsStatisticsLoading(false);
    }
  }, []);

  // Add goal
  const addGoal = useCallback(
    async (input: CreateGoalInput): Promise<GoalDto | null> => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticGoal: GoalDto = {
        id: tempId,
        userId: '',
        title: input.title,
        description: (input.description ?? undefined) || null,
        targetValue: input.targetValue ?? null,
        currentValue: 0,
        unit: input.unit ?? null,
        deadline: input.deadline ?? null,
        status: 'ACTIVE',
        sortOrder: input.sortOrder ?? goals.length,
        createdAt: new Date(),
        updatedAt: new Date(),
        progress: 0,
        isOverdue: false,
        daysRemaining: null,
      };

      setGoals((prev) => [...prev, optimisticGoal]);

      try {
        const response = await fetch('/api/goals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error('Failed to create goal');
        }

        const data = await response.json();
        const newGoal = data.goal as GoalDto;

        // Replace optimistic goal with real one
        setGoals((prev) => prev.map((g) => (g.id === tempId ? newGoal : g)));

        // Refresh statistics
        fetchStatistics();

        return newGoal;
      } catch (err) {
        // Rollback optimistic update
        setGoals((prev) => prev.filter((g) => g.id !== tempId));
        setError(err instanceof Error ? err.message : 'Failed to create goal');
        return null;
      }
    },
    [goals.length, fetchStatistics]
  );

  // Update goal
  const updateGoal = useCallback(
    async (id: string, input: UpdateGoalInput): Promise<GoalDto | null> => {
      // Optimistic update
      const previousGoals = [...goals];
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...input, updatedAt: new Date() } : g))
      );

      try {
        const response = await fetch(`/api/goals/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!response.ok) {
          throw new Error('Failed to update goal');
        }

        const data = await response.json();
        const updatedGoal = data.goal as GoalDto;

        setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));

        // Refresh statistics if status changed
        if (input.status !== undefined) {
          fetchStatistics();
        }

        return updatedGoal;
      } catch (err) {
        // Rollback optimistic update
        setGoals(previousGoals);
        setError(err instanceof Error ? err.message : 'Failed to update goal');
        return null;
      }
    },
    [goals, fetchStatistics]
  );

  // Delete goal
  const deleteGoal = useCallback(
    async (id: string): Promise<boolean> => {
      // Optimistic update
      const previousGoals = [...goals];
      setGoals((prev) => prev.filter((g) => g.id !== id));

      try {
        const response = await fetch(`/api/goals/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete goal');
        }

        // Refresh statistics
        fetchStatistics();

        return true;
      } catch (err) {
        // Rollback optimistic update
        setGoals(previousGoals);
        setError(err instanceof Error ? err.message : 'Failed to delete goal');
        return false;
      }
    },
    [goals, fetchStatistics]
  );

  // Update progress
  const updateProgress = useCallback(
    async (id: string, increment: number): Promise<GoalDto | null> => {
      try {
        const response = await fetch(`/api/goals/${id}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ increment }),
        });

        if (!response.ok) {
          throw new Error('Failed to update progress');
        }

        const data = await response.json();
        const updatedGoal = data.goal as GoalDto;

        setGoals((prev) => prev.map((g) => (g.id === id ? updatedGoal : g)));

        // Refresh statistics
        fetchStatistics();

        return updatedGoal;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update progress');
        return null;
      }
    },
    [fetchStatistics]
  );

  // Complete goal
  const completeGoal = useCallback(
    async (id: string): Promise<GoalDto | null> => {
      return updateGoal(id, { status: 'COMPLETED' });
    },
    [updateGoal]
  );

  // Pause goal
  const pauseGoal = useCallback(
    async (id: string): Promise<GoalDto | null> => {
      const goal = goals.find((g) => g.id === id);
      if (!goal) return null;

      const newStatus = goal.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
      return updateGoal(id, { status: newStatus });
    },
    [updateGoal, goals]
  );

  // Abandon goal
  const abandonGoal = useCallback(
    async (id: string): Promise<GoalDto | null> => {
      return updateGoal(id, { status: 'ABANDONED' });
    },
    [updateGoal]
  );

  // Initialize
  useEffect(() => {
    if (autoFetch) {
      fetchGoals();
      fetchStatistics();
    }
  }, [autoFetch, fetchGoals, fetchStatistics]);

  // Refetch function
  const refetch = useCallback(async () => {
    await fetchGoals();
    await fetchStatistics();
  }, [fetchGoals, fetchStatistics]);

  const refetchStatistics = useCallback(async () => {
    await fetchStatistics();
  }, [fetchStatistics]);

  return {
    goals,
    statistics,
    filteredGoals,
    isLoading,
    isStatisticsLoading,
    error,
    viewMode,
    setViewMode,
    statusFilter,
    setStatusFilter,
    showCompleted,
    setShowCompleted,
    addGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    completeGoal,
    pauseGoal,
    abandonGoal,
    refetch,
    refetchStatistics,
  };
}
