'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TaskDto } from '@/lib/tasks/types';

export type SortBy = 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title' | 'sortOrder';
export type SortOrder = 'asc' | 'desc';

export interface UseTasksOptions {
  autoFetch?: boolean;
  filter?: {
    status?: string;
    priority?: string;
    listId?: string;
    tagId?: string;
    goalId?: string;
    search?: string;
    dueDate?: string;
    dueBefore?: string;
    dueAfter?: string;
  };
  sortBy?: SortBy;
  sortOrder?: SortOrder;
}

export interface UseTasksResult {
  tasks: TaskDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addTask: (title: string, description?: string) => Promise<TaskDto | null>;
  updateTask: (id: string, updates: Partial<TaskDto>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  reorderTasks: (updates: Array<{ id: string; sortOrder: number }>) => Promise<boolean>;
}

/**
 * Hook for fetching and managing tasks.
 *
 * Provides task CRUD operations with optimistic updates.
 */
export function useTasks(options: UseTasksOptions = {}): UseTasksResult {
  const { autoFetch = true, filter = {}, sortBy = 'sortOrder', sortOrder = 'asc' } = options;

  const [tasks, setTasks] = useState<TaskDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build query string from filter options
  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (filter.status) params.set('status', filter.status);
    if (filter.priority) params.set('priority', filter.priority);
    if (filter.listId) params.set('listId', filter.listId);
    if (filter.tagId) params.set('tagId', filter.tagId);
    if (filter.goalId) params.set('goalId', filter.goalId);
    if (filter.search) params.set('search', filter.search);
    if (filter.dueDate) params.set('dueDate', filter.dueDate);
    if (filter.dueBefore) params.set('dueBefore', filter.dueBefore);
    if (filter.dueAfter) params.set('dueAfter', filter.dueAfter);
    // Add sort parameters
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    return params.toString();
  };

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryString = buildQueryString();
      const response = await fetch(`/api/tasks${queryString ? `?${queryString}` : ''}`);

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [filter]);

  // Auto-fetch on mount and filter change
  useEffect(() => {
    if (autoFetch) {
      fetchTasks();
    }
  }, [fetchTasks, autoFetch]);

  // Add task
  const addTask = useCallback(
    async (title: string, description?: string): Promise<TaskDto | null> => {
      setError(null);

      try {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, description }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to add task');
        }

        const data = await response.json();
        const newTask = data.task;

        // Optimistic update
        setTasks((prev) => [newTask, ...prev]);

        return newTask;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  // Update task
  const updateTask = useCallback(
    async (id: string, updates: Partial<TaskDto>): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update task');
        }

        const data = await response.json();
        const updatedTask = data.task;

        // Optimistic update
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)));

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  // Delete task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete task');
      }

      // Optimistic update
      setTasks((prev) => prev.filter((task) => task.id !== id));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, []);

  // Reorder tasks (for drag-and-drop)
  const reorderTasks = useCallback(
    async (updates: Array<{ id: string; sortOrder: number }>): Promise<boolean> => {
      setError(null);

      try {
        const response = await fetch('/api/tasks/reorder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reorder tasks');
        }

        const data = await response.json();
        const updatedTasks = data.tasks as TaskDto[];

        // Update tasks with new sort orders
        setTasks((prev) => {
          const updatedMap = new Map<string, TaskDto>(updatedTasks.map((t) => [t.id, t]));
          return prev.map((task) => updatedMap.get(task.id) ?? task);
        });

        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    []
  );

  return {
    tasks,
    isLoading,
    error,
    refetch: fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
  };
}
