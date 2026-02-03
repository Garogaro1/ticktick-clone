'use client';

import { useState, useCallback, useMemo } from 'react';
import type { TaskDto } from '@/lib/tasks/types';
import type {
  MonthViewData,
  WeekViewData,
  DayViewData,
  CalendarViewOptions,
  CalendarViewType,
} from '@/lib/calendar/types';
import { generateMonthView, generateWeekView, generateDayView } from '@/lib/calendar/events';
import {
  addMonths,
  addWeeks,
  addDays,
  startOfMonth,
  startOfWeek,
  startOfDay,
} from '@/lib/utils/date';

/**
 * Options for the useCalendar hook.
 */
export interface UseCalendarOptions {
  /** Initial month (defaults to current month) */
  initialMonth?: Date;
  /** Initial view type */
  initialView?: CalendarViewType;
  /** Whether to include completed tasks */
  includeCompleted?: boolean;
  /** Start day of week (0 = Sunday, 1 = Monday) */
  startOfWeek?: number;
}

/**
 * Result from the useCalendar hook.
 */
export interface UseCalendarResult {
  /** Current viewing date (reference for navigation) */
  currentDate: Date;
  /** Current view type */
  view: CalendarViewType;
  /** Selected date */
  selectedDate: Date | null;
  /** Month view data */
  monthViewData: MonthViewData | null;
  /** Week view data */
  weekViewData: WeekViewData | null;
  /** Day view data */
  dayViewData: DayViewData | null;
  /** All tasks */
  tasks: TaskDto[];
  /** Whether data is loading */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Set view type */
  setView: (view: CalendarViewType) => void;
  /** Go to previous period */
  goToPrevious: () => void;
  /** Go to next period */
  goToNext: () => void;
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
 * Provides view generation for month/week/day views,
 * date navigation, and task management for the calendar.
 */
export function useCalendar(tasks: TaskDto[], options: UseCalendarOptions = {}): UseCalendarResult {
  const {
    initialMonth,
    initialView = 'month',
    includeCompleted = false,
    startOfWeek: startOfDayOfWeek = 0,
  } = options;

  const today = new Date();

  const [currentDate, setCurrentDate] = useState<Date>(
    initialMonth ? startOfMonth(initialMonth) : startOfMonth(today)
  );
  const [view, setView] = useState<CalendarViewType>(initialView);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [internalTasks, setInternalTasks] = useState<TaskDto[]>(tasks);

  // Update internal tasks when prop changes
  const syncedTasks = useMemo(() => {
    return tasks.length > 0 ? tasks : internalTasks;
  }, [tasks, internalTasks]);

  // Calendar options for view generation
  const calendarOptions: Partial<CalendarViewOptions> = useMemo(
    () => ({
      startOfWeek: startOfDayOfWeek,
      includeCompleted,
      selectedDate: selectedDate ?? undefined,
    }),
    [startOfDayOfWeek, includeCompleted, selectedDate]
  );

  // Generate month view data
  const monthViewData = useMemo(() => {
    if (syncedTasks.length === 0 || view !== 'month') {
      return null;
    }

    try {
      const calendarTasks = syncedTasks.map(convertTaskDtoToCalendarTask);
      return generateMonthView(calendarTasks, currentDate, calendarOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate month view');
      return null;
    }
  }, [syncedTasks, currentDate, calendarOptions, view]);

  // Generate week view data
  const weekViewData = useMemo(() => {
    if (syncedTasks.length === 0 || view !== 'week') {
      return null;
    }

    try {
      const calendarTasks = syncedTasks.map(convertTaskDtoToCalendarTask);
      return generateWeekView(calendarTasks, currentDate, calendarOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate week view');
      return null;
    }
  }, [syncedTasks, currentDate, calendarOptions, view]);

  // Generate day view data
  const dayViewData = useMemo(() => {
    if (syncedTasks.length === 0 || view !== 'day') {
      return null;
    }

    try {
      const calendarTasks = syncedTasks.map(convertTaskDtoToCalendarTask);
      return generateDayView(calendarTasks, currentDate, calendarOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate day view');
      return null;
    }
  }, [syncedTasks, currentDate, calendarOptions, view]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setError(null);
    switch (view) {
      case 'month':
        setCurrentDate((prev) => startOfMonth(addMonths(prev, -1)));
        break;
      case 'week':
        setCurrentDate((prev) => startOfWeek(addWeeks(prev, -1), startOfDayOfWeek));
        break;
      case 'day':
        setCurrentDate((prev) => startOfDay(addDays(prev, -1)));
        break;
    }
  }, [view, startOfDayOfWeek]);

  const goToNext = useCallback(() => {
    setError(null);
    switch (view) {
      case 'month':
        setCurrentDate((prev) => startOfMonth(addMonths(prev, 1)));
        break;
      case 'week':
        setCurrentDate((prev) => startOfWeek(addWeeks(prev, 1), startOfDayOfWeek));
        break;
      case 'day':
        setCurrentDate((prev) => startOfDay(addDays(prev, 1)));
        break;
    }
  }, [view, startOfDayOfWeek]);

  const goToToday = useCallback(() => {
    setError(null);
    setCurrentDate(today);
    setSelectedDate(today);
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
    currentDate,
    view,
    selectedDate,
    monthViewData,
    weekViewData,
    dayViewData,
    tasks: syncedTasks,
    isLoading,
    error,
    setView,
    goToPrevious,
    goToNext,
    goToToday,
    selectDate,
    clearSelection,
    setTasks,
  };
}
