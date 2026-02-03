/**
 * Calendar Event Generation Utilities
 *
 * Converts tasks into calendar events and generates
 * calendar views for different display modes.
 */

import type { Task, Priority } from '@prisma/client';
import type {
  CalendarEvent,
  CalendarDay,
  CalendarWeek,
  DateRange,
  MonthViewData,
  WeekViewData,
  DayViewData,
  AgendaViewData,
  AgendaItem,
  CalendarEventFilter,
  CalendarViewOptions,
} from './types';
import {
  startOfDay,
  endOfDay,
  isSameDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMinutes,
  isWithinRange,
  isPast,
} from '@/lib/utils/date';

/**
 * Convert a task to a calendar event.
 *
 * @param task - Task to convert
 * @returns Calendar event or null if task has no date
 */
export function taskToCalendarEvent(task: TaskWithTags): CalendarEvent | null {
  // Use dueDate as the primary date, fall back to startDate
  const eventDate = task.dueDate || task.startDate;

  if (!eventDate) {
    return null;
  }

  const start = new Date(eventDate);
  let end: Date;

  // Determine if this is an all-day event (exactly midnight with no time components)
  const hasTime =
    start.getHours() !== 0 ||
    start.getMinutes() !== 0 ||
    start.getSeconds() !== 0 ||
    start.getMilliseconds() !== 0;

  if (hasTime) {
    // If the task has a specific time, use estimatedTime or default to 1 hour
    const duration = task.estimatedTime || 60;
    end = addMinutes(start, duration);
  } else {
    // All-day event: end at the end of the day
    end = endOfDay(start);
  }

  const isOverdue = task.status !== 'DONE' && task.status !== 'CANCELLED' && isPast(start);

  return {
    id: task.id,
    title: task.title,
    start,
    end,
    allDay: hasTime === false,
    status: task.status,
    priority: task.priority,
    description: task.description,
    listId: task.listId,
    listColor: task.list?.color || null,
    tags: task.tags.map((tt) => ({
      id: tt.tag.id,
      name: tt.tag.name,
      color: tt.tag.color,
    })),
    isRecurring: !!task.recurrenceRule,
    estimatedTime: task.estimatedTime,
    isOverdue,
  };
}

/**
 * Get calendar events for a specific date.
 *
 * @param tasks - Tasks to convert
 * @param date - Date to get events for
 * @param filter - Optional filter options
 * @returns Array of calendar events
 */
export function getEventsForDate(
  tasks: TaskWithTags[],
  date: Date,
  filter?: CalendarEventFilter
): CalendarEvent[] {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  let events = tasks.map(taskToCalendarEvent).filter((event): event is CalendarEvent => {
    if (!event) return false;

    // Check if event overlaps with the target date
    const eventStart = event.allDay ? startOfDay(event.start) : event.start;
    const eventEnd = event.allDay ? endOfDay(event.end) : event.end;

    return isTimeOverlap(eventStart, eventEnd, dayStart, dayEnd);
  });

  // Apply filters
  if (filter) {
    events = applyEventFilters(events, filter);
  }

  return events;
}

/**
 * Get calendar events for a date range.
 *
 * @param tasks - Tasks to convert
 * @param range - Date range
 * @param filter - Optional filter options
 * @returns Array of calendar events
 */
export function getEventsForRange(
  tasks: TaskWithTags[],
  range: DateRange,
  filter?: CalendarEventFilter
): CalendarEvent[] {
  let events = tasks.map(taskToCalendarEvent).filter((event): event is CalendarEvent => {
    if (!event) return false;

    // Check if event overlaps with the range
    const eventStart = event.allDay ? startOfDay(event.start) : event.start;
    const eventEnd = event.allDay ? endOfDay(event.end) : event.end;

    return isTimeOverlap(eventStart, eventEnd, range.start, range.end);
  });

  // Apply filters
  if (filter) {
    events = applyEventFilters(events, filter);
  }

  return events;
}

/**
 * Check if two time ranges overlap.
 */
function isTimeOverlap(start1: Date, end1: Date, start2: Date, end2: Date): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Apply filters to calendar events.
 */
function applyEventFilters(events: CalendarEvent[], filter: CalendarEventFilter): CalendarEvent[] {
  let filtered = events;

  // Filter by status
  if (filter.status && filter.status.length > 0) {
    const statusFilter = filter.status;
    filtered = filtered.filter((e) => statusFilter.includes(e.status));
  }

  // Filter by priority
  if (filter.priority && filter.priority.length > 0) {
    const priorityFilter = filter.priority;
    filtered = filtered.filter((e) => priorityFilter.includes(e.priority));
  }

  // Filter by list IDs
  if (filter.listIds && filter.listIds.length > 0) {
    const listIdFilter = filter.listIds;
    filtered = filtered.filter((e) => listIdFilter.includes(e.listId));
  }

  // Filter by tag IDs
  if (filter.tagIds && filter.tagIds.length > 0) {
    const tagIdFilter = filter.tagIds;
    filtered = filtered.filter((e) => e.tags.some((t) => tagIdFilter.includes(t.id)));
  }

  // Filter by search query
  if (filter.search) {
    const query = filter.search.toLowerCase();
    filtered = filtered.filter(
      (e) => e.title.toLowerCase().includes(query) || e.description?.toLowerCase().includes(query)
    );
  }

  // Include/exclude completed
  if (!filter.includeCompleted) {
    filtered = filtered.filter((e) => e.status !== 'DONE');
  }

  // Filter by minimum priority
  if (filter.minPriority !== undefined) {
    const priorityOrder: Record<Priority, number> = {
      NONE: 0,
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
    };
    const minPriorityValue = priorityOrder[filter.minPriority];
    filtered = filtered.filter((e) => priorityOrder[e.priority] >= minPriorityValue);
  }

  // Filter all-day events
  if (filter.excludeAllDay) {
    filtered = filtered.filter((e) => !e.allDay);
  }

  if (filter.onlyAllDay) {
    filtered = filtered.filter((e) => e.allDay);
  }

  return filtered;
}

/**
 * Generate month view data for a calendar.
 *
 * @param tasks - Tasks to include
 * @param currentDate - Reference date for the month
 * @param options - View options
 * @returns Month view data
 */
export function generateMonthView(
  tasks: TaskWithTags[],
  currentDate: Date,
  options: Partial<CalendarViewOptions> = {}
): MonthViewData {
  const startOfWeekDay = options.startOfWeek ?? 0;

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Get the calendar start (first visible day)
  const calendarStart = startOfWeek(monthStart, startOfWeekDay);
  // Get the calendar end (last visible day - 6 weeks max)
  const calendarEnd = addDays(calendarStart, 41); // 6 rows of 7 days

  // Get events for the visible range
  const events = getEventsForRange(tasks, { start: calendarStart, end: calendarEnd }, options);

  // Generate weeks
  const weeks: CalendarWeek[] = [];
  let currentWeekStart = new Date(calendarStart);

  for (let i = 0; i < 6; i++) {
    const weekEnd = addDays(currentWeekStart, 6);
    const weekDays: CalendarDay[] = [];

    for (let j = 0; j < 7; j++) {
      const dayDate = addDays(currentWeekStart, j);
      const dayEvents = events.filter((e) => isSameDay(e.start, dayDate));

      weekDays.push({
        date: dayDate,
        isCurrentMonth: isSameMonth(dayDate, currentDate),
        isToday: isSameDay(dayDate, new Date()),
        isSelected: options.selectedDate ? isSameDay(dayDate, options.selectedDate) : false,
        events: dayEvents,
      });
    }

    weeks.push({
      startDate: new Date(currentWeekStart),
      days: weekDays,
    });

    currentWeekStart = addDays(weekEnd, 1);

    // Stop if we've gone past the month end
    if (currentWeekStart > monthEnd) {
      break;
    }
  }

  return {
    firstDay: monthStart,
    lastDay: monthEnd,
    weeks,
    totalEvents: events.length,
  };
}

/**
 * Check if two dates are in the same month.
 */
function isSameMonth(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth();
}

/**
 * Generate week view data for a calendar.
 *
 * @param tasks - Tasks to include
 * @param currentDate - Reference date (typically the selected date)
 * @param options - View options
 * @returns Week view data
 */
export function generateWeekView(
  tasks: TaskWithTags[],
  currentDate: Date,
  options: Partial<CalendarViewOptions> = {}
): WeekViewData {
  const startOfWeekDay = options.startOfWeek ?? 0;

  const weekStart = startOfWeek(currentDate, startOfWeekDay);
  const weekEnd = endOfWeek(currentDate, startOfWeekDay);

  const events = getEventsForRange(tasks, { start: weekStart, end: weekEnd }, options);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 7; i++) {
    const dayDate = addDays(weekStart, i);
    const dayEvents = events.filter((e) => isSameDay(e.start, dayDate));

    days.push({
      date: dayDate,
      isCurrentMonth: true,
      isToday: isSameDay(dayDate, new Date()),
      isSelected: options.selectedDate ? isSameDay(dayDate, options.selectedDate) : false,
      events: dayEvents,
    });
  }

  return {
    startDate: weekStart,
    endDate: weekEnd,
    days,
    hours: Array.from({ length: 24 }, (_, i) => i),
    events,
  };
}

/**
 * Generate day view data for a calendar.
 *
 * @param tasks - Tasks to include
 * @param currentDate - Date to view
 * @param options - View options
 * @returns Day view data
 */
export function generateDayView(
  tasks: TaskWithTags[],
  currentDate: Date,
  options: Partial<CalendarViewOptions> = {}
): DayViewData {
  const events = getEventsForDate(tasks, currentDate, options);

  return {
    date: currentDate,
    hours: Array.from({ length: 24 }, (_, i) => i),
    events,
  };
}

/**
 * Generate agenda view data for a date range.
 *
 * @param tasks - Tasks to include
 * @param startDate - Start of range
 * @param endDate - End of range
 * @param options - View options
 * @returns Agenda view data
 */
export function generateAgendaView(
  tasks: TaskWithTags[],
  startDate: Date,
  endDate: Date,
  options: Partial<CalendarViewOptions> = {}
): AgendaViewData {
  const events = getEventsForRange(tasks, { start: startDate, end: endDate }, options);

  // Group events by date
  const eventsByDate = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const dateKey = startOfDay(event.start).toISOString();
    const existing = eventsByDate.get(dateKey) ?? [];
    existing.push(event);
    eventsByDate.set(dateKey, existing);
  }

  // Create agenda items
  const items: AgendaItem[] = [];
  const dates = Array.from(eventsByDate.keys()).sort();

  for (const dateKey of dates) {
    const date = new Date(dateKey);
    const eventsForDate = eventsByDate.get(dateKey);
    if (eventsForDate) {
      items.push({
        date,
        events: eventsForDate,
      });
    }
  }

  return {
    startDate,
    endDate,
    items,
    totalEvents: events.length,
  };
}

/**
 * Get overlapping events for a specific date/time.
 * Useful for detecting conflicts.
 *
 * @param events - Events to check
 * @param date - Date to check at
 * @returns Array of overlapping events
 */
export function getOverlappingEvents(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((event) => {
    if (event.allDay) {
      return isSameDay(event.start, date);
    }
    return isWithinRange(date, event.start, event.end);
  });
}

/**
 * Check if an event time slot is available.
 *
 * @param events - Existing events
 * @param start - Proposed start time
 * @param end - Proposed end time
 * @param excludeEventId - Event ID to exclude from check
 * @returns True if the time slot is available
 */
export function isTimeSlotAvailable(
  events: CalendarEvent[],
  start: Date,
  end: Date,
  excludeEventId?: string
): boolean {
  for (const event of events) {
    if (excludeEventId && event.id === excludeEventId) {
      continue;
    }

    if (event.allDay) {
      // All-day events block the entire day
      if (isSameDay(start, event.start)) {
        return false;
      }
    } else {
      // Check for time overlap
      if (start < event.end && end > event.start) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Type for task with tags and list relations.
 */
type TaskWithTags = Task & {
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
  list?: {
    color: string | null;
  } | null;
};
