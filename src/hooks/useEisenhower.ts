'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { TaskDto } from '@/lib/tasks/types';
import type {
  EisenhowerQuadrant,
  EisenhowerMatrixData,
  QuadrantCounts,
  ManualQuadrantAssignments,
  EisenhowerOptions,
} from '@/lib/eisenhower';
import {
  categorizeTasks,
  sortQuadrantTasks,
  getQuadrantCounts,
  moveToQuadrant as moveToQuadrantUtil,
  clearQuadrantAssignment as clearQuadrantAssignmentUtil,
} from '@/lib/eisenhower';
import { useTasks } from './useTasks';

export interface UseEisenhowerOptions {
  autoFetch?: boolean;
  filter?: {
    listId?: string;
    tagId?: string;
    search?: string;
  };
  includeCompleted?: boolean;
  includeCancelled?: boolean;
}

export interface UseEisenhowerResult {
  // State
  matrixData: EisenhowerMatrixData;
  quadrantCounts: QuadrantCounts;
  manualAssignments: ManualQuadrantAssignments;
  isLoading: boolean;
  error: string | null;

  // Actions
  moveToQuadrant: (taskId: string, toQuadrant: EisenhowerQuadrant) => void;
  clearQuadrantAssignment: (taskId: string) => void;
  refetch: () => Promise<void>;

  // Task actions (delegated from useTasks)
  addTask: (title: string, description?: string) => Promise<TaskDto | null>;
  updateTask: (id: string, updates: Partial<TaskDto>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;

  // Computed
  totalTasks: number;
  hasManualAssignments: boolean;
}

const MANUAL_ASSIGNMENTS_KEY = 'eisenhower-manual-assignments';

/**
 * Load manual quadrant assignments from localStorage.
 */
function loadManualAssignments(): ManualQuadrantAssignments {
  if (typeof window === 'undefined') return {};
  try {
    const saved = localStorage.getItem(MANUAL_ASSIGNMENTS_KEY);
    return saved ? (JSON.parse(saved) as ManualQuadrantAssignments) : {};
  } catch {
    return {};
  }
}

/**
 * Save manual quadrant assignments to localStorage.
 */
function saveManualAssignments(assignments: ManualQuadrantAssignments): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MANUAL_ASSIGNMENTS_KEY, JSON.stringify(assignments));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Hook for Eisenhower Matrix state and operations.
 *
 * Manages task categorization into the four quadrants based on
 * urgency and importance, with support for manual overrides.
 */
export function useEisenhower(options: UseEisenhowerOptions = {}): UseEisenhowerResult {
  const {
    autoFetch = true,
    filter = {},
    includeCompleted = false,
    includeCancelled = false,
  } = options;

  // State for manual assignments
  const [manualAssignments, setManualAssignmentsState] = useState<ManualQuadrantAssignments>({});
  const [matrixData, setMatrixData] = useState<EisenhowerMatrixData>({
    doFirst: [],
    schedule: [],
    delegate: [],
    eliminate: [],
  });

  // Fetch tasks
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

  // Load manual assignments on mount
  useEffect(() => {
    setManualAssignmentsState(loadManualAssignments());
  }, []);

  // Categorize tasks when tasks or manual assignments change
  useEffect(() => {
    const eisenhowerOptions: EisenhowerOptions = {
      includeCompleted,
      includeCancelled,
      listId: filter.listId,
      tagId: filter.tagId,
      search: filter.search,
    };

    const categorized = categorizeTasks(tasks, manualAssignments, eisenhowerOptions);

    // Sort tasks within each quadrant
    setMatrixData({
      doFirst: sortQuadrantTasks(categorized.doFirst),
      schedule: sortQuadrantTasks(categorized.schedule),
      delegate: sortQuadrantTasks(categorized.delegate),
      eliminate: sortQuadrantTasks(categorized.eliminate),
    });
  }, [tasks, manualAssignments, includeCompleted, includeCancelled, filter]);

  // Calculate counts
  const quadrantCounts = useMemo(() => getQuadrantCounts(matrixData), [matrixData]);

  // Total tasks
  const totalTasks = quadrantCounts.total;

  // Has manual assignments
  const hasManualAssignments = Object.keys(manualAssignments).length > 0;

  // Move task to a different quadrant (manual override)
  const moveToQuadrant = useCallback(
    (taskId: string, toQuadrant: EisenhowerQuadrant) => {
      const updated = moveToQuadrantUtil(taskId, toQuadrant, manualAssignments);
      setManualAssignmentsState(updated);
      saveManualAssignments(updated);
    },
    [manualAssignments]
  );

  // Clear manual quadrant assignment
  const clearQuadrantAssignment = useCallback(
    (taskId: string) => {
      const updated = clearQuadrantAssignmentUtil(taskId, manualAssignments);
      setManualAssignmentsState(updated);
      saveManualAssignments(updated);
    },
    [manualAssignments]
  );

  // Refetch all data
  const refetch = useCallback(async () => {
    await refetchTasks();
  }, [refetchTasks]);

  return {
    matrixData,
    quadrantCounts,
    manualAssignments,
    isLoading: tasksLoading,
    error: tasksError,
    moveToQuadrant,
    clearQuadrantAssignment,
    refetch,
    addTask,
    updateTask,
    deleteTask,
    totalTasks,
    hasManualAssignments,
  };
}
