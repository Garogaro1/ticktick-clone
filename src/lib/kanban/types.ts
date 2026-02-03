/**
 * Kanban Type Definitions
 *
 * TypeScript types for Kanban board functionality.
 * Supports grouping by status, priority, list, and tag.
 */

import { TaskStatus, Priority } from '@prisma/client';
import type { TaskDto } from '@/lib/tasks/types';

/**
 * Group by options for Kanban columns.
 */
export type KanbanGroupBy = 'status' | 'priority' | 'list' | 'tag';

/**
 * Kanban column definition.
 */
export interface KanbanColumn {
  id: string;
  title: string;
  value: string;
  color?: string | null;
  icon?: string;
  tasks: TaskDto[];
}

/**
 * Status column definitions for Kanban board.
 */
export const STATUS_COLUMNS: Array<{ value: TaskStatus; title: string; color: string }> = [
  { value: TaskStatus.TODO, title: 'To Do', color: '#9CA3AF' },
  { value: TaskStatus.IN_PROGRESS, title: 'In Progress', color: '#D97757' },
  { value: TaskStatus.DONE, title: 'Done', color: '#10B981' },
  { value: TaskStatus.CANCELLED, title: 'Cancelled', color: '#6B7280' },
];

/**
 * Priority column definitions for Kanban board.
 */
export const PRIORITY_COLUMNS: Array<{ value: Priority; title: string; color: string }> = [
  { value: Priority.HIGH, title: 'High', color: '#EF4444' },
  { value: Priority.MEDIUM, title: 'Medium', color: '#F59E0B' },
  { value: Priority.LOW, title: 'Low', color: '#3B82F6' },
  { value: Priority.NONE, title: 'None', color: '#9CA3AF' },
];

/**
 * Kanban board options.
 */
export interface KanbanOptions {
  groupBy: KanbanGroupBy;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
  filter?: {
    listId?: string;
    tagId?: string;
    search?: string;
  };
}

/**
 * Drag data for Kanban drag-and-drop.
 */
export interface KanbanDragData {
  type: 'task';
  taskId: string;
  taskTitle: string;
  currentColumn: string;
}

/**
 * Column data for Kanban drop zones.
 */
export interface KanbanColumnData {
  type: 'column';
  columnId: string;
  columnValue: string;
  groupBy: KanbanGroupBy;
}

/**
 * Task with list info for Kanban display.
 */
export type TaskWithList = TaskDto & {
  list?: {
    id: string;
    title: string;
    color: string | null;
  } | null;
};

/**
 * Group tasks by a specific field.
 */
export interface GroupedTasks {
  columns: KanbanColumn[];
  totalTasks: number;
}

/**
 * Kanban board state.
 */
export interface KanbanState {
  groupBy: KanbanGroupBy;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  columns: KanbanColumn[];
  isLoading: boolean;
  error: string | null;
}
