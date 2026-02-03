/**
 * Calendar Type Definitions
 *
 * TypeScript types for calendar functionality including
 * calendar events, date ranges, and time ranges.
 */

import { TaskStatus, Priority } from '@prisma/client';

/**
 * Time range for a single day.
 */
export interface TimeRange {
  /** Start time in minutes from midnight (0-1439) */
  start: number;
  /** End time in minutes from midnight (0-1439) */
  end: number;
}

/**
 * Date range for calendar views.
 */
export interface DateRange {
  /** Start date */
  start: Date;
  /** End date (inclusive) */
  end: Date;
}

/**
 * Calendar event derived from a task.
 */
export interface CalendarEvent {
  /** Task ID */
  id: string;
  /** Task title */
  title: string;
  /** Event start date/time */
  start: Date;
  /** Event end date/time */
  end: Date;
  /** Whether the event is all-day (no specific time) */
  allDay: boolean;
  /** Task status */
  status: TaskStatus;
  /** Task priority */
  priority: Priority;
  /** Task description (optional) */
  description?: string | null;
  /** List ID */
  listId: string;
  /** List color */
  listColor?: string | null;
  /** Tags associated with the task */
  tags: Array<{
    id: string;
    name: string;
    color: string | null;
  }>;
  /** Whether this is a recurring event */
  isRecurring: boolean;
  /** Estimated time in minutes */
  estimatedTime?: number | null;
  /** Whether the task is overdue */
  isOverdue: boolean;
}

/**
 * Day in a month calendar view.
 */
export interface CalendarDay {
  /** Date of the day */
  date: Date;
  /** Whether the day is in the current month */
  isCurrentMonth: boolean;
  /** Whether the day is today */
  isToday: boolean;
  /** Whether the day is selected */
  isSelected: boolean;
  /** Events for this day */
  events: CalendarEvent[];
}

/**
 * Week in a calendar view.
 */
export interface CalendarWeek {
  /** Start date of the week */
  startDate: Date;
  /** Days in the week */
  days: CalendarDay[];
}

/**
 * Month calendar view data.
 */
export interface MonthViewData {
  /** First day of the month */
  firstDay: Date;
  /** Last day of the month */
  lastDay: Date;
  /** Weeks in the month (6 weeks max for display) */
  weeks: CalendarWeek[];
  /** Total events count */
  totalEvents: number;
}

/**
 * Week calendar view data.
 */
export interface WeekViewData {
  /** Start date of the week */
  startDate: Date;
  /** End date of the week */
  endDate: Date;
  /** Days in the week */
  days: CalendarDay[];
  /** Hours displayed (0-23) */
  hours: number[];
  /** Events for the week */
  events: CalendarEvent[];
}

/**
 * Day calendar view data.
 */
export interface DayViewData {
  /** Date being viewed */
  date: Date;
  /** Hours displayed (0-23) */
  hours: number[];
  /** Events for the day */
  events: CalendarEvent[];
}

/**
 * Calendar view type.
 */
export type CalendarViewType = 'month' | 'week' | 'day' | 'agenda';

/**
 * Calendar view options.
 */
export interface CalendarViewOptions {
  /** View type */
  view: CalendarViewType;
  /** Current reference date */
  currentDate: Date;
  /** Selected date */
  selectedDate?: Date;
  /** Start of week day (0 = Sunday, 1 = Monday) */
  startOfWeek?: number;
  /** Show/hide weekends */
  showWeekends?: boolean;
  /** Timezone to display events in */
  timezone?: string;
  /** Filter by list IDs */
  listIds?: string[];
  /** Filter by tag IDs */
  tagIds?: string[];
  /** Filter by status */
  status?: TaskStatus[];
  /** Filter by priority */
  priority?: Priority[];
  /** Include completed tasks */
  includeCompleted?: boolean;
}

/**
 * Agenda item for list view.
 */
export interface AgendaItem {
  /** Date header */
  date: Date;
  /** Events for this date */
  events: CalendarEvent[];
}

/**
 * Agenda view data.
 */
export interface AgendaViewData {
  /** Start date */
  startDate: Date;
  /** End date */
  endDate: Date;
  /** Agenda items grouped by date */
  items: AgendaItem[];
  /** Total event count */
  totalEvents: number;
}

/**
 * Calendar event filter options.
 */
export interface CalendarEventFilter {
  /** Date range to filter by */
  dateRange?: DateRange;
  /** Filter by list IDs */
  listIds?: string[];
  /** Filter by tag IDs */
  tagIds?: string[];
  /** Filter by status */
  status?: TaskStatus[];
  /** Filter by priority */
  priority?: Priority[];
  /** Search query (searches titles) */
  search?: string;
  /** Include completed tasks */
  includeCompleted?: boolean;
  /** Minimum priority level */
  minPriority?: Priority;
  /** Exclude all-day events */
  excludeAllDay?: boolean;
  /** Only show all-day events */
  onlyAllDay?: boolean;
}
