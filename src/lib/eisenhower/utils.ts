/**
 * Eisenhower Matrix Utilities
 *
 * Functions for categorizing tasks into the four quadrants of the
 * Eisenhower Matrix based on urgency and importance.
 */

import type { TaskDto } from '@/lib/tasks/types';
import type {
  EisenhowerQuadrant,
  EisenhowerMatrixData,
  QuadrantCounts,
  QuadrantConfig,
  TaskWithQuadrant,
  ManualQuadrantAssignments,
  EisenhowerOptions,
} from './types';
import { Priority, TaskStatus } from '@prisma/client';
import { isToday, isTomorrow, isWithinNextDays, startOfDay } from '@/lib/utils/date';

/**
 * Days threshold for considering a task as "urgent"
 * Tasks due within this many days (or overdue) are considered urgent
 */
const URGENT_DAYS_THRESHOLD = 2;

/**
 * Check if a task is considered "important" based on its priority.
 *
 * Important tasks have HIGH or MEDIUM priority.
 *
 * @param task - Task to check
 * @returns True if the task is important
 */
export function isImportant(task: TaskDto): boolean {
  return task.priority === Priority.HIGH || task.priority === Priority.MEDIUM;
}

/**
 * Check if a task is considered "urgent" based on its due date.
 *
 * Urgent tasks are:
 * - Overdue (past due date and not completed)
 * - Due today
 * - Due tomorrow
 * - Due within the next 2 days
 *
 * @param task - Task to check
 * @returns True if the task is urgent
 */
export function isUrgent(task: TaskDto): boolean {
  // No due date = not urgent
  if (!task.dueDate) {
    return false;
  }

  // Completed/cancelled tasks are not urgent
  if (task.status === TaskStatus.DONE || task.status === TaskStatus.CANCELLED) {
    return false;
  }

  const dueDate = startOfDay(new Date(task.dueDate));
  const today = startOfDay(new Date());

  // Overdue = urgent
  if (dueDate < today) {
    return true;
  }

  // Due today or tomorrow = urgent
  if (isToday(dueDate) || isTomorrow(dueDate)) {
    return true;
  }

  // Due within next N days = urgent
  return isWithinNextDays(dueDate, URGENT_DAYS_THRESHOLD);
}

/**
 * Determine the appropriate quadrant for a task.
 *
 * Quadrants:
 * - do-first: Urgent & Important - Do these immediately
 * - schedule: Not Urgent & Important - Schedule these
 * - delegate: Urgent & Not Important - Delegate if possible
 * - eliminate: Not Urgent & Not Important - Remove these
 *
 * @param task - Task to categorize
 * @param manualAssignments - Manual quadrant overrides (optional)
 * @returns The appropriate quadrant for the task
 */
export function getQuadrant(
  task: TaskDto,
  manualAssignments?: ManualQuadrantAssignments
): EisenhowerQuadrant {
  // Check for manual override first
  if (manualAssignments && manualAssignments[task.id] !== undefined) {
    const manualQuadrant = manualAssignments[task.id];
    if (manualQuadrant) {
      return manualQuadrant;
    }
  }

  const urgent = isUrgent(task);
  const important = isImportant(task);

  if (urgent && important) {
    return 'do-first';
  }
  if (!urgent && important) {
    return 'schedule';
  }
  if (urgent && !important) {
    return 'delegate';
  }
  return 'eliminate';
}

/**
 * Get configuration for all quadrants.
 *
 * @returns Array of quadrant configurations
 */
export function getQuadrantConfigs(): QuadrantConfig[] {
  return [
    {
      id: 'do-first',
      label: 'Do First',
      description: 'Urgent & Important',
      color: 'text-error',
      bgColor: 'bg-error/5',
      borderColor: 'border-error/30',
      icon: '⚡',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      description: 'Not Urgent & Important',
      color: 'text-warning',
      bgColor: 'bg-warning/5',
      borderColor: 'border-warning/30',
      icon: '📅',
    },
    {
      id: 'delegate',
      label: 'Delegate',
      description: 'Urgent & Not Important',
      color: 'text-info',
      bgColor: 'bg-info/5',
      borderColor: 'border-info/30',
      icon: '👥',
    },
    {
      id: 'eliminate',
      label: 'Eliminate',
      description: 'Not Urgent & Not Important',
      color: 'text-text-tertiary',
      bgColor: 'bg-text-tertiary/5',
      borderColor: 'border-text-tertiary/20',
      icon: '🗑️',
    },
  ];
}

/**
 * Get configuration for a specific quadrant.
 *
 * @param quadrant - Quadrant ID
 * @returns Quadrant configuration
 */
export function getQuadrantConfig(quadrant: EisenhowerQuadrant): QuadrantConfig {
  const configs = getQuadrantConfigs();
  const config = configs.find((c) => c.id === quadrant);
  if (!config) {
    throw new Error(`Invalid quadrant: ${quadrant}`);
  }
  return config;
}

/**
 * Filter tasks based on Eisenhower options.
 *
 * @param tasks - All tasks to filter
 * @param options - Filter options
 * @returns Filtered tasks
 */
export function filterTasks(tasks: TaskDto[], options: EisenhowerOptions = {}): TaskDto[] {
  let filtered = [...tasks];

  // Filter by status
  if (!options.includeCompleted) {
    filtered = filtered.filter((t) => t.status !== TaskStatus.DONE);
  }
  if (!options.includeCancelled) {
    filtered = filtered.filter((t) => t.status !== TaskStatus.CANCELLED);
  }

  // Filter by list
  if (options.listId) {
    filtered = filtered.filter((t) => t.listId === options.listId);
  }

  // Filter by tag
  if (options.tagId) {
    filtered = filtered.filter((t) => t.tags.some((tag) => tag.id === options.tagId));
  }

  // Search filter
  if (options.search) {
    const searchLower = options.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(searchLower) ||
        (t.description && t.description.toLowerCase().includes(searchLower))
    );
  }

  return filtered;
}

/**
 * Map quadrant ID to property name in EisenhowerMatrixData
 */
function quadrantToProperty(quadrant: EisenhowerQuadrant): keyof EisenhowerMatrixData {
  const mapping: Record<EisenhowerQuadrant, keyof EisenhowerMatrixData> = {
    'do-first': 'doFirst',
    schedule: 'schedule',
    delegate: 'delegate',
    eliminate: 'eliminate',
  };
  return mapping[quadrant];
}

/**
 * Categorize tasks into the Eisenhower Matrix quadrants.
 *
 * @param tasks - Tasks to categorize
 * @param manualAssignments - Manual quadrant overrides (optional)
 * @param options - Filter options (optional)
 * @returns Tasks organized by quadrant
 */
export function categorizeTasks(
  tasks: TaskDto[],
  manualAssignments?: ManualQuadrantAssignments,
  options?: EisenhowerOptions
): EisenhowerMatrixData {
  const filtered = filterTasks(tasks, options);

  const result: EisenhowerMatrixData = {
    doFirst: [],
    schedule: [],
    delegate: [],
    eliminate: [],
  };

  for (const task of filtered) {
    const quadrant = getQuadrant(task, manualAssignments);
    const taskWithQuadrant: TaskWithQuadrant = { ...task, quadrant };
    const property = quadrantToProperty(quadrant);
    result[property].push(taskWithQuadrant);
  }

  return result;
}

/**
 * Calculate task counts per quadrant.
 *
 * @param matrixData - Eisenhower matrix data
 * @returns Counts for each quadrant
 */
export function getQuadrantCounts(matrixData: EisenhowerMatrixData): QuadrantCounts {
  return {
    doFirst: matrixData.doFirst.length,
    schedule: matrixData.schedule.length,
    delegate: matrixData.delegate.length,
    eliminate: matrixData.eliminate.length,
    total:
      matrixData.doFirst.length +
      matrixData.schedule.length +
      matrixData.delegate.length +
      matrixData.eliminate.length,
  };
}

/**
 * Get tasks for a specific quadrant.
 *
 * @param matrixData - Eisenhower matrix data
 * @param quadrant - Quadrant to get tasks for
 * @returns Tasks in the specified quadrant
 */
export function getQuadrantTasks(
  matrixData: EisenhowerMatrixData,
  quadrant: EisenhowerQuadrant
): TaskWithQuadrant[] {
  const property = quadrantToProperty(quadrant);
  return matrixData[property];
}

/**
 * Move a task to a different quadrant (manual override).
 *
 * @param taskId - ID of task to move
 * @param fromQuadrant - Current quadrant
 * @param toQuadrant - Target quadrant
 * @param currentAssignments - Current manual assignments
 * @returns Updated manual assignments
 */
export function moveToQuadrant(
  taskId: string,
  toQuadrant: EisenhowerQuadrant,
  currentAssignments: ManualQuadrantAssignments = {}
): ManualQuadrantAssignments {
  return {
    ...currentAssignments,
    [taskId]: toQuadrant,
  };
}

/**
 * Clear a manual quadrant assignment (revert to auto-categorization).
 *
 * @param taskId - ID of task to clear assignment for
 * @param currentAssignments - Current manual assignments
 * @returns Updated manual assignments
 */
export function clearQuadrantAssignment(
  taskId: string,
  currentAssignments: ManualQuadrantAssignments = {}
): ManualQuadrantAssignments {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [taskId]: _, ...rest } = currentAssignments;
  return rest;
}

/**
 * Sort tasks within a quadrant.
 *
 * Sort order:
 * 1. Overdue tasks first
 * 2. Then by due date (soonest first)
 * 3. Then by priority (HIGH first)
 * 4. Then by created date (newest first)
 *
 * @param tasks - Tasks to sort
 * @returns Sorted tasks
 */
export function sortQuadrantTasks(tasks: TaskWithQuadrant[]): TaskWithQuadrant[] {
  return [...tasks].sort((a, b) => {
    // Overdue tasks come first
    const aIsOverdue =
      a.dueDate && new Date(a.dueDate) < new Date() && a.status !== TaskStatus.DONE;
    const bIsOverdue =
      b.dueDate && new Date(b.dueDate) < new Date() && b.status !== TaskStatus.DONE;
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    // Sort by due date
    if (a.dueDate && b.dueDate) {
      const aDate = new Date(a.dueDate).getTime();
      const bDate = new Date(b.dueDate).getTime();
      if (aDate !== bDate) return aDate - bDate;
    }
    if (a.dueDate && !b.dueDate) return -1;
    if (!a.dueDate && b.dueDate) return 1;

    // Sort by priority
    const priorityOrder = {
      [Priority.HIGH]: 0,
      [Priority.MEDIUM]: 1,
      [Priority.LOW]: 2,
      [Priority.NONE]: 3,
    };
    const aPriority = priorityOrder[a.priority] ?? 3;
    const bPriority = priorityOrder[b.priority] ?? 3;
    if (aPriority !== bPriority) return aPriority - bPriority;

    // Sort by created date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/**
 * Get the recommended action for a task based on its quadrant.
 *
 * @param quadrant - Task's quadrant
 * @returns Recommended action text
 */
export function getRecommendedAction(quadrant: EisenhowerQuadrant): string {
  const actions: Record<EisenhowerQuadrant, string> = {
    'do-first': 'Do this task immediately or at the earliest available time.',
    schedule: 'Schedule a specific time to work on this task.',
    delegate: 'Delegate this task to someone else if possible.',
    eliminate: 'Consider deleting this task or moving it to a "someday" list.',
  };
  return actions[quadrant];
}
