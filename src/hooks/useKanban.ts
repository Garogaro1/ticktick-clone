'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TaskDto } from '@/lib/tasks/types';
import type { KanbanColumn, KanbanGroupBy, GroupedTasks } from '@/lib/kanban';
import { groupTasks, sortColumnTasks, getDefaultGroupBy } from '@/lib/kanban';
import { useTasks } from './useTasks';
import { useLists } from './useLists';

export interface UseKanbanOptions {
  autoFetch?: boolean;
  initialGroupBy?: KanbanGroupBy;
  initialSortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  initialSortOrder?: 'asc' | 'desc';
  filter?: {
    listId?: string;
    tagId?: string;
    search?: string;
  };
}

export interface UseKanbanResult {
  // State
  groupBy: KanbanGroupBy;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  columns: KanbanColumn[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setGroupBy: (groupBy: KanbanGroupBy) => void;
  setSortBy: (sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title') => void;
  setSortOrder: (sortOrder: 'asc' | 'desc') => void;
  moveTask: (taskId: string, fromColumn: string, toColumn: string) => Promise<boolean>;
  refetch: () => Promise<void>;

  // Task actions (delegated from useTasks)
  addTask: (title: string, description?: string) => Promise<TaskDto | null>;
  updateTask: (id: string, updates: Partial<TaskDto>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;

  // Stats
  totalTasks: number;
  totalColumns: number;
}

const GROUP_BY_KEY = 'kanban-groupBy';
const SORT_BY_KEY = 'kanban-sortBy';
const SORT_ORDER_KEY = 'kanban-sortOrder';

/**
 * Hook for Kanban board state and operations.
 *
 * Manages task grouping, column state, and drag-and-drop operations.
 */
export function useKanban(options: UseKanbanOptions = {}): UseKanbanResult {
  const {
    autoFetch = true,
    initialGroupBy,
    initialSortBy = 'createdAt',
    initialSortOrder = 'asc',
    filter = {},
  } = options;

  // Load preferences from localStorage
  const loadGroupBy = (): KanbanGroupBy => {
    if (typeof window === 'undefined') return getDefaultGroupBy();
    try {
      const saved = localStorage.getItem(GROUP_BY_KEY);
      return (saved as KanbanGroupBy) || initialGroupBy || getDefaultGroupBy();
    } catch {
      return initialGroupBy || getDefaultGroupBy();
    }
  };

  const loadSortBy = (): 'createdAt' | 'dueDate' | 'priority' | 'title' => {
    if (typeof window === 'undefined') return initialSortBy;
    try {
      const saved = localStorage.getItem(SORT_BY_KEY);
      return (saved as 'createdAt' | 'dueDate' | 'priority' | 'title') || initialSortBy;
    } catch {
      return initialSortBy;
    }
  };

  const loadSortOrder = (): 'asc' | 'desc' => {
    if (typeof window === 'undefined') return initialSortOrder;
    try {
      const saved = localStorage.getItem(SORT_ORDER_KEY);
      return (saved as 'asc' | 'desc') || initialSortOrder;
    } catch {
      return initialSortOrder;
    }
  };

  // State
  const [groupBy, setGroupByState] = useState<KanbanGroupBy>(loadGroupBy);
  const [sortBy, setSortByState] = useState<'createdAt' | 'dueDate' | 'priority' | 'title'>(
    loadSortBy()
  );
  const [sortOrder, setSortOrderState] = useState<'asc' | 'desc'>(loadSortOrder());
  const [columns, setColumns] = useState<KanbanColumn[]>([]);

  // Fetch tasks and lists
  const {
    tasks,
    isLoading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
    addTask,
    updateTask,
    deleteTask,
  } = useTasks({
    autoFetch,
    filter: {
      listId: filter.listId,
      tagId: filter.tagId,
      search: filter.search,
    },
  });

  const { lists, isLoading: listsLoading } = useLists({ autoFetch });

  // Group tasks into columns
  const groupedData = useMemo<GroupedTasks>(() => {
    return groupTasks(tasks, groupBy, lists);
  }, [tasks, groupBy, lists]);

  // Sort tasks within columns
  const sortedColumns = useMemo<KanbanColumn[]>(() => {
    return groupedData.columns.map((column) => ({
      ...column,
      tasks: sortColumnTasks(column.tasks, sortBy, sortOrder),
    }));
  }, [groupedData.columns, sortBy, sortOrder]);

  // Update columns when grouped data or sort changes
  useEffect(() => {
    setColumns(sortedColumns);
  }, [sortedColumns]);

  // Save preferences to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(GROUP_BY_KEY, groupBy);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [groupBy]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SORT_BY_KEY, sortBy);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [sortBy]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(SORT_ORDER_KEY, sortOrder);
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [sortOrder]);

  // Set group by
  const setGroupBy = useCallback((newGroupBy: KanbanGroupBy) => {
    setGroupByState(newGroupBy);
  }, []);

  // Set sort by
  const setSortBy = useCallback((newSortBy: 'createdAt' | 'dueDate' | 'priority' | 'title') => {
    setSortByState(newSortBy);
  }, []);

  // Set sort order
  const setSortOrder = useCallback((newSortOrder: 'asc' | 'desc') => {
    setSortOrderState(newSortOrder);
  }, []);

  // Move task between columns (for drag-and-drop)
  const moveTask = useCallback(
    async (taskId: string, fromColumn: string, toColumn: string): Promise<boolean> => {
      // If moving within the same column, no change needed
      if (fromColumn === toColumn) {
        return true;
      }

      // Determine the update based on groupBy
      let updates: Partial<TaskDto> = {};

      switch (groupBy) {
        case 'status':
          // Extract status from column ID (format: status-TODO)
          const status = toColumn.replace('status-', '') as TaskDto['status'];
          updates = { status };
          break;
        case 'priority':
          // Extract priority from column ID (format: priority-HIGH)
          const priority = toColumn.replace('priority-', '') as TaskDto['priority'];
          updates = { priority };
          break;
        case 'list':
          // Extract list ID from column ID (format: list-{id})
          const listId = toColumn.replace('list-', '');
          updates = { listId };
          break;
        case 'tag':
          // For tag grouping, we don't move tasks between tags
          // Tasks can have multiple tags, so this doesn't make sense
          return false;
      }

      return updateTask(taskId, updates);
    },
    [groupBy, updateTask]
  );

  // Refetch all data
  const refetch = useCallback(async () => {
    await Promise.all([refetchTasks()]);
  }, [refetchTasks]);

  return {
    groupBy,
    sortBy,
    sortOrder,
    columns,
    isLoading: tasksLoading || listsLoading,
    error: tasksError,
    setGroupBy,
    setSortBy,
    setSortOrder,
    moveTask,
    refetch,
    addTask,
    updateTask,
    deleteTask,
    totalTasks: groupedData.totalTasks,
    totalColumns: groupedData.columns.length,
  };
}
