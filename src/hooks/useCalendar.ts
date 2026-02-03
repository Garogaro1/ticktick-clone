'use client';

import { useState, useCallback, useMemo } from 'react';
import type { TaskDto } from '@/lib/tasks/types';
import type { MonthViewData, CalendarViewOptions } from '@/lib/calendar/types';
import { generateMonthView } from '@/lib/calendar/events';
import { addMonths, startOfMonth } from '@/lib/utils/date';

/**
 * Options for the useCalendar hook.
 */
export interface UseCalendarOptions {
  /** Initial month (defaults to current month) */
  initialMonth?: Date;
  /** Whether to include completed tasks */
  includeCompleted?: boolean;
  /** Start day of week (0 = Sunday, 1 = Monday) */
  startOfWeek?: number;
}

/**
 * Result from the useCalendar hook.
 */
export interface UseCalendarResult {
  /** Current viewing month */
  currentMonth: Date;
  /** Selected date */
  selectedDate: Date | null;
  /** Month view data */
  monthViewData: MonthViewData | null;
  /** All tasks */
  tasks: TaskDto[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Go to previous month */
  goToPreviousMonth: () => void;
  /** Go to next month */
  goToNextMonth: () => void;
  /** Go to today */
  goToToday: () => void;
  /** Select a date */
  selectDate: (date: Date) => void;
  /** Clear date selection */
  clearSelection: () => void;
  /** Set tasks manually */
  setTasks: (tasks: TaskDto[]) => void;
}

/**
 * Convert TaskDto to the format expected by calendar library.
 *
 * Note: TaskDto doesn't include userId, but the calendar library
 * expects a TaskWithTags type which includes it. We add a placeholder
 * userId since the calendar library doesn't actually use it.
 */
function convertTaskDtoToCalendarTask(task: TaskDto) {
  return {
    ...task,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    userId: 'placeholder-user-id' as any, // Add userId for type compatibility
    dueDate: task.dueDate ? new Date(task.dueDate) : null,
    startDate: task.startDate ? new Date(task.startDate) : null,
    completedAt: task.completedAt ? new Date(task.completedAt) : null,
    createdAt: new Date(task.createdAt),
    updatedAt: new Date(task.updatedAt),
    // Convert tags to TaskWithTags format
    tags: task.tags.map((tag) => ({
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
      },
    })),
    list: null, // Will be populated by full task data if needed
  };
}

/**
 * Hook for managing calendar state and navigation.
 *
 * Provides month view data generation, date navigation,
 * and task management for the calendar view.
 */
export function useCalendar(tasks: TaskDto[], options: UseCalendarOptions = {}): UseCalendarResult {
  const { initialMonth, includeCompleted = false, startOfWeek = 0 } = options;

  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialMonth ? startOfMonth(initialMonth) : startOfMonth(new Date())
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalTasks, setInternalTasks] = useState<TaskDto[]>(tasks);

  // Update internal tasks when prop changes
  const syncedTasks = useMemo(() => {
    return tasks.length > 0 ? tasks : internalTasks;
  }, [tasks, internalTasks]);

  // Generate month view data
  const monthViewData = useMemo(() => {
    if (syncedTasks.length === 0) {
      return null;
    }

    try {
      const calendarTasks = syncedTasks.map(convertTaskDtoToCalendarTask);
      const calendarOptions: Partial<CalendarViewOptions> = {
        startOfWeek,
        includeCompleted,
        selectedDate: selectedDate ?? undefined,
      };

      return generateMonthView(calendarTasks, currentMonth, calendarOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate calendar view');
      return null;
    }
  }, [syncedTasks, currentMonth, selectedDate, startOfWeek, includeCompleted]);

  // Navigation functions
  const goToPreviousMonth = useCallback(() => {
    setCurrentMonth((prev) => startOfMonth(addMonths(prev, -1)));
    setError(null);
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentMonth((prev) => startOfMonth(addMonths(prev, 1)));
    setError(null);
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setCurrentMonth(startOfMonth(today));
    setSelectedDate(today);
    setError(null);
  }, []);

  const selectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDate(null);
  }, []);

  const setTasks = useCallback((newTasks: TaskDto[]) => {
    setInternalTasks(newTasks);
    setError(null);
  }, []);

  return {
    currentMonth,
    selectedDate,
    monthViewData,
    tasks: syncedTasks,
    isLoading,
    error,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    clearSelection,
    setTasks,
  };
}
