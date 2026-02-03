/**
 * Kanban Utilities
 *
 * Helper functions for grouping and sorting tasks in Kanban board.
 */

import { TaskStatus, Priority } from '@prisma/client';
import type { TaskDto } from '@/lib/tasks/types';
import type { ListDto } from '@/lib/lists/types';
import type { KanbanColumn, KanbanGroupBy, GroupedTasks, TaskWithList } from './types';
import { STATUS_COLUMNS, PRIORITY_COLUMNS } from './types';

/**
 * Group tasks by status.
 */
export function groupByStatus(tasks: TaskDto[], lists?: ListDto[]): KanbanColumn[] {
  return STATUS_COLUMNS.map((col) => ({
    id: `status-${col.value}`,
    title: col.title,
    value: col.value,
    color: col.color,
    tasks: tasks
      .filter((task) => task.status === col.value)
      .map((task) => enrichTaskWithList(task, lists))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

/**
 * Group tasks by priority.
 */
export function groupByPriority(tasks: TaskDto[], lists?: ListDto[]): KanbanColumn[] {
  return PRIORITY_COLUMNS.map((col) => ({
    id: `priority-${col.value}`,
    title: col.title,
    value: col.value,
    color: col.color,
    tasks: tasks
      .filter((task) => task.priority === col.value)
      .map((task) => enrichTaskWithList(task, lists))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

/**
 * Group tasks by list.
 */
export function groupByList(tasks: TaskDto[], lists?: ListDto[]): KanbanColumn[] {
  if (!lists || lists.length === 0) {
    return [];
  }

  return lists
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((list) => ({
      id: `list-${list.id}`,
      title: list.title,
      value: list.id,
      color: list.color,
      icon: list.icon || undefined,
      tasks: tasks
        .filter((task) => task.listId === list.id)
        .map((task) => enrichTaskWithList(task, lists))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    }));
}

/**
 * Group tasks by tag.
 */
export function groupByTag(tasks: TaskDto[], lists?: ListDto[]): KanbanColumn[] {
  // Collect all unique tags from tasks
  const tagMap = new Map<string, { id: string; name: string; color: string | null }>();

  tasks.forEach((task) => {
    task.tags?.forEach((tag) => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, { id: tag.id, name: tag.name, color: tag.color });
      }
    });
  });

  // Create "No Tag" column for tasks without tags
  const tasksWithoutTags = tasks.filter((task) => !task.tags || task.tags.length === 0);
  const columns: KanbanColumn[] = [];

  if (tasksWithoutTags.length > 0) {
    columns.push({
      id: 'tag-none',
      title: 'No Tag',
      value: 'none',
      color: '#9CA3AF',
      tasks: tasksWithoutTags
        .map((task) => enrichTaskWithList(task, lists))
        .sort((a, b) => a.sortOrder - b.sortOrder),
    });
  }

  // Create column for each tag
  tagMap.forEach((tag, tagId) => {
    const tasksWithTag = tasks.filter((task) => task.tags?.some((t) => t.id === tagId));
    if (tasksWithTag.length > 0) {
      columns.push({
        id: `tag-${tagId}`,
        title: tag.name,
        value: tagId,
        color: tag.color || '#D97757',
        tasks: tasksWithTag
          .map((task) => enrichTaskWithList(task, lists))
          .sort((a, b) => a.sortOrder - b.sortOrder),
      });
    }
  });

  // Sort columns by tag name, with "No Tag" at the end
  return columns.sort((a, b) => {
    if (a.id === 'tag-none') return 1;
    if (b.id === 'tag-none') return -1;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Group tasks by the specified groupBy option.
 */
export function groupTasks(
  tasks: TaskDto[],
  groupBy: KanbanGroupBy,
  lists?: ListDto[]
): GroupedTasks {
  let columns: KanbanColumn[];

  switch (groupBy) {
    case 'status':
      columns = groupByStatus(tasks, lists);
      break;
    case 'priority':
      columns = groupByPriority(tasks, lists);
      break;
    case 'list':
      columns = groupByList(tasks, lists);
      break;
    case 'tag':
      columns = groupByTag(tasks, lists);
      break;
    default:
      columns = groupByStatus(tasks, lists);
  }

  return {
    columns,
    totalTasks: tasks.length,
  };
}

/**
 * Sort tasks within a column.
 */
export function sortColumnTasks(
  tasks: TaskDto[],
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title' = 'createdAt',
  sortOrder: 'asc' | 'desc' = 'asc'
): TaskDto[] {
  const sorted = [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'createdAt':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'dueDate':
        // Tasks without due dates go to the end
        if (!a.dueDate && !b.dueDate) comparison = 0;
        else if (!a.dueDate) comparison = 1;
        else if (!b.dueDate) comparison = -1;
        else comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        break;
      case 'priority':
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, NONE: 3 };
        comparison =
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder];
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Enrich task with list information.
 */
function enrichTaskWithList(task: TaskDto, lists?: ListDto[]): TaskWithList {
  const list = lists?.find((l) => l.id === task.listId);
  return {
    ...task,
    list: list ? { id: list.id, title: list.title, color: list.color } : null,
  };
}

/**
 * Get column color for status.
 */
export function getStatusColor(status: TaskStatus): string {
  return STATUS_COLUMNS.find((col) => col.value === status)?.color || '#9CA3AF';
}

/**
 * Get column color for priority.
 */
export function getPriorityColor(priority: Priority): string {
  return PRIORITY_COLUMNS.find((col) => col.value === priority)?.color || '#9CA3AF';
}

/**
 * Get a human-readable label for groupBy option.
 */
export function getGroupByLabel(groupBy: KanbanGroupBy): string {
  switch (groupBy) {
    case 'status':
      return 'Status';
    case 'priority':
      return 'Priority';
    case 'list':
      return 'List';
    case 'tag':
      return 'Tag';
    default:
      return 'Status';
  }
}

/**
 * Get default groupBy option.
 */
export function getDefaultGroupBy(): KanbanGroupBy {
  return 'status';
}
