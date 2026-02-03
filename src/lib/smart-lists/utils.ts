/**
 * Smart list utilities for generating task filters.
 *
 * Provides pre-configured filter objects for common task views like
 * Today, Tomorrow, Next 7 Days, etc.
 */

import { startOfDay, endOfDay, addDays } from '@/lib/utils';

export type SmartListType =
  | 'all'
  | 'today'
  | 'tomorrow'
  | 'next7Days'
  | 'overdue'
  | 'noDate'
  | 'completed';

export interface SmartList {
  id: SmartListType;
  name: string;
  icon: string;
  description: string;
  getFilter: () => {
    dueDate?: string;
    dueBefore?: string;
    dueAfter?: string;
    status?: string;
  };
}

/**
 * Formats a date to ISO string for API queries.
 */
function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Smart list definitions.
 */
export const SMART_LISTS: Record<SmartListType, SmartList> = {
  all: {
    id: 'all',
    name: 'All Tasks',
    icon: '📋',
    description: 'View all your tasks',
    getFilter: () => ({}),
  },

  today: {
    id: 'today',
    name: 'Today',
    icon: '📅',
    description: 'Tasks due today',
    getFilter: () => {
      const today = startOfDay(new Date());
      return {
        dueDate: toISODate(today),
        status: 'TODO,IN_PROGRESS',
      };
    },
  },

  tomorrow: {
    id: 'tomorrow',
    name: 'Tomorrow',
    icon: '📆',
    description: 'Tasks due tomorrow',
    getFilter: () => {
      const tomorrow = addDays(startOfDay(new Date()), 1);
      return {
        dueDate: toISODate(tomorrow),
        status: 'TODO,IN_PROGRESS',
      };
    },
  },

  next7Days: {
    id: 'next7Days',
    name: 'Next 7 Days',
    icon: '🗓️',
    description: 'Tasks due in the next week',
    getFilter: () => {
      const today = startOfDay(new Date());
      const weekFromNow = addDays(endOfDay(new Date()), 7);
      return {
        dueAfter: toISODate(today),
        dueBefore: toISODate(weekFromNow),
        status: 'TODO,IN_PROGRESS',
      };
    },
  },

  overdue: {
    id: 'overdue',
    name: 'Overdue',
    icon: '⚠️',
    description: 'Tasks that are past due',
    getFilter: () => {
      const today = startOfDay(new Date());
      return {
        dueBefore: toISODate(today),
        status: 'TODO,IN_PROGRESS',
      };
    },
  },

  noDate: {
    id: 'noDate',
    name: 'No Date',
    icon: '🔹',
    description: 'Tasks without a due date',
    getFilter: () => {
      // Using a special empty string to filter for tasks without due dates
      // The API will interpret this as "tasks where dueDate is null"
      return {
        dueDate: '',
        status: 'TODO,IN_PROGRESS',
      };
    },
  },

  completed: {
    id: 'completed',
    name: 'Completed',
    icon: '✅',
    description: 'All completed tasks',
    getFilter: () => {
      return {
        status: 'DONE',
      };
    },
  },
};

/**
 * Gets a smart list by its ID.
 */
export function getSmartList(id: SmartListType): SmartList | undefined {
  return SMART_LISTS[id];
}

/**
 * Gets the filter object for a smart list ID.
 */
export function getSmartListFilter(id: SmartListType): ReturnType<SmartList['getFilter']> {
  const smartList = getSmartList(id);
  return smartList?.getFilter() ?? {};
}

/**
 * Gets all smart lists as an array (for rendering in UI).
 */
export function getAllSmartLists(): SmartList[] {
  return Object.values(SMART_LISTS);
}
