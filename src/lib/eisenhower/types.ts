/**
 * Eisenhower Matrix Types
 *
 * The Eisenhower Matrix categorizes tasks based on two dimensions:
 * - Urgency: Is the task time-sensitive?
 * - Importance: Is the task aligned with important goals?
 *
 * This creates 4 quadrants:
 * 1. DO FIRST: Urgent & Important
 * 2. SCHEDULE: Not Urgent & Important
 * 3. DELEGATE: Urgent & Not Important
 * 4. ELIMINATE: Not Urgent & Not Important
 */

import type { TaskDto } from '@/lib/tasks/types';

/**
 * The four quadrants of the Eisenhower Matrix
 */
export type EisenhowerQuadrant =
  | 'do-first' // Urgent & Important - Do these immediately
  | 'schedule' // Not Urgent & Important - Schedule these
  | 'delegate' // Urgent & Not Important - Delegate if possible
  | 'eliminate'; // Not Urgent & Not Important - Remove these

/**
 * Display configuration for each quadrant
 */
export interface QuadrantConfig {
  id: EisenhowerQuadrant;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

/**
 * A task with its assigned quadrant
 */
export interface TaskWithQuadrant extends TaskDto {
  quadrant: EisenhowerQuadrant;
}

/**
 * The complete Eisenhower matrix data structure
 */
export interface EisenhowerMatrixData {
  doFirst: TaskWithQuadrant[];
  schedule: TaskWithQuadrant[];
  delegate: TaskWithQuadrant[];
  eliminate: TaskWithQuadrant[];
}

/**
 * Counts of tasks per quadrant
 */
export interface QuadrantCounts {
  doFirst: number;
  schedule: number;
  delegate: number;
  eliminate: number;
  total: number;
}

/**
 * Drag data for moving tasks between quadrants
 */
export interface EisenhowerDragData {
  taskId: string;
  fromQuadrant: EisenhowerQuadrant;
  toQuadrant: EisenhowerQuadrant;
}

/**
 * Configuration options for the Eisenhower Matrix
 */
export interface EisenhowerOptions {
  /** Include completed tasks in the matrix */
  includeCompleted?: boolean;
  /** Include cancelled tasks in the matrix */
  includeCancelled?: boolean;
  /** Filter to specific list */
  listId?: string;
  /** Filter to specific tag */
  tagId?: string;
  /** Search query */
  search?: string;
}

/**
 * Manual quadrant assignment (user override)
 * Maps task ID to its manually assigned quadrant
 */
export type ManualQuadrantAssignments = Record<string, EisenhowerQuadrant | null>;
