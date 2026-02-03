'use client';

import { memo } from 'react';
import type { WeekViewData, CalendarEvent } from '@/lib/calendar/types';
import { cn } from '@/lib/utils';
import { getTimeString } from '@/lib/utils/date';

export interface WeekCalendarProps {
  /** Week view data */
  weekViewData: WeekViewData | null;
  /** Click on time slot */
  onTimeSlotClick?: (date: Date, hour: number, minute: number) => void;
  /** Click on event */
  onEventClick?: (event: CalendarEvent) => void;
  /** Start of day hour */
  startHour?: number;
  /** End of day hour */
  endHour?: number;
  /** Height of each hour slot */
  hourHeight?: number;
  /** Show current time indicator */
  showCurrentTime?: boolean;
  /** Additional class names */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
}

/**
 * Week calendar view with 7-day time grid.
 *
 * Displays a full week with events positioned by time and day.
 */
export const WeekCalendar = memo(function WeekCalendar({
  weekViewData,
  onTimeSlotClick,
  onEventClick,
  startHour = 0,
  endHour = 23,
  hourHeight = 40,
  showCurrentTime = true,
  className,
  isLoading = false,
  error = null,
}: WeekCalendarProps) {
  // Loading state
  if (isLoading) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ minHeight: '600px' }}
      >
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-text-secondary">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ minHeight: '600px' }}
      >
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load calendar</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!weekViewData) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ minHeight: '600px' }}
      >
        <div className="text-center text-text-secondary">
          <p>No tasks scheduled</p>
          <p className="text-sm mt-1">Click on a time slot to add a task</p>
        </div>
      </div>
    );
  }

  const displayHours = weekViewData.hours.filter((h) => h >= startHour && h <= endHour);
  const gridHeight = displayHours.length * hourHeight;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Get priority color
  const getPriorityColor = (priority: CalendarEvent['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300';
      case 'MEDIUM':
        return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-900/30 dark:border-orange-700 dark:text-orange-300';
      case 'LOW':
        return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300';
    }
  };

  // Calculate position and height for an event
  const getEventStyle = (event: CalendarEvent, dayIndex: number) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;

    const top = ((startMinutes - startHour * 60) / 60) * hourHeight;
    const height = Math.max((durationMinutes / 60) * hourHeight, 16); // Min height for visibility

    const left = `${(dayIndex / 7) * 100}%`;
    const width = `${100 / 7}%`;

    return { top: `${top}px`, height: `${height}px`, left, width };
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Day headers */}
      <div className="flex border-b border-border-secondary mb-2">
        {/* Empty corner for time labels */}
        <div className="w-16 flex-shrink-0" />
        {/* Day columns */}
        {weekViewData.days.map((day) => (
          <div
            key={day.date.toISOString()}
            className="flex-1 text-center py-2 px-1"
            style={{ minWidth: 0 }}
          >
            <div className={cn('text-xs font-medium', day.isToday && 'text-accent-primary')}>
              {formatDayName(day.date)}
            </div>
            <div className={cn('text-sm', day.isToday && 'font-semibold text-accent-primary')}>
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Week grid */}
      <div className="bg-bg-secondary rounded-lg border border-border-secondary overflow-x-auto">
        <div className="relative" style={{ height: `${gridHeight}px`, minWidth: '600px' }}>
          {/* Time labels column */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col z-10 bg-bg-secondary">
            {displayHours.map((hour) => (
              <div
                key={hour}
                className="flex-1 border-b border-border-secondary/50 pr-2 text-right text-xs text-text-secondary flex items-center justify-end"
                style={{ height: `${hourHeight}px` }}
              >
                {formatHour(hour)}
              </div>
            ))}
          </div>

          {/* Day columns with time slots */}
          <div className="ml-16 relative">
            {/* Hour rows - horizontal lines */}
            {displayHours.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-b border-border-secondary"
                style={{ top: `${(hour - startHour) * hourHeight}px`, height: `${hourHeight}px` }}
              >
                {/* Half-hour line */}
                <div className="absolute top-1/2 left-0 right-0 border-t border-border-secondary/30" />
              </div>
            ))}

            {/* Day column dividers */}
            {weekViewData.days.map((_, index) => (
              <div
                key={`divider-${index}`}
                className="absolute top-0 bottom-0 border-r border-border-secondary/30"
                style={{ left: `${((index + 1) / 7) * 100}%` }}
              />
            ))}

            {/* Today column highlight */}
            {weekViewData.days.findIndex((d) => d.isToday) >= 0 && (
              <div
                className="absolute top-0 bottom-0 bg-accent-primary/5 pointer-events-none"
                style={{
                  left: `${(weekViewData.days.findIndex((d) => d.isToday) / 7) * 100}%`,
                  width: `${100 / 7}%`,
                }}
              />
            )}

            {/* Current time indicator */}
            {showCurrentTime && weekViewData.days.some((d) => d.isToday) && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{
                  top: `${((currentHour * 60 + currentMinute) / 60 - startHour) * hourHeight}px`,
                }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-accent-primary" />
                  <div className="flex-1 h-px bg-accent-primary" />
                </div>
              </div>
            )}

            {/* Time slot click areas */}
            {weekViewData.days.map((day, dayIndex) => (
              <div
                key={day.date.toISOString()}
                className="absolute top-0 bottom-0"
                style={{ left: `${(dayIndex / 7) * 100}%`, width: `${100 / 7}%` }}
              >
                {displayHours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 cursor-pointer hover:bg-bg-tertiary/30 transition-colors"
                    style={{
                      top: `${(hour - startHour) * hourHeight}px`,
                      height: `${hourHeight}px`,
                    }}
                    onClick={() => onTimeSlotClick?.(day.date, hour, 0)}
                    role="presentation"
                  />
                ))}
              </div>
            ))}

            {/* Events */}
            {weekViewData.events.map((event) => {
              if (event.allDay) return null;

              const dayIndex = weekViewData.days.findIndex(
                (d) =>
                  d.date.getDate() === event.start.getDate() &&
                  d.date.getMonth() === event.start.getMonth() &&
                  d.date.getFullYear() === event.start.getFullYear()
              );

              if (
                dayIndex < 0 ||
                event.start.getHours() < startHour ||
                event.start.getHours() > endHour
              ) {
                return null;
              }

              const style = getEventStyle(event, dayIndex);

              return (
                <div
                  key={event.id}
                  className={cn(
                    'absolute rounded-md border-l-2 p-1 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden',
                    getPriorityColor(event.priority),
                    event.status === 'DONE' && 'opacity-60 line-through'
                  )}
                  style={style}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick?.(event);
                  }}
                >
                  <div className="text-xs font-medium truncate">{event.title}</div>
                  <div className="text-xs opacity-75 truncate">
                    {getTimeString(event.start)} - {getTimeString(event.end)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event count footer */}
      {weekViewData.events.length > 0 && (
        <div className="mt-3 text-center text-sm text-text-secondary">
          {weekViewData.events.length} {weekViewData.events.length === 1 ? 'event' : 'events'} this
          week
        </div>
      )}
    </div>
  );
});

/**
 * Format hour for display.
 */
function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

/**
 * Format day name for week header.
 */
function formatDayName(date: Date): string {
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  return formatter.format(date);
}
