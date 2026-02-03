'use client';

import { memo } from 'react';
import type { DayViewData, CalendarEvent } from '@/lib/calendar/types';
import { TimeGrid } from './TimeGrid';
import { cn } from '@/lib/utils';

export interface DayCalendarProps {
  /** Day view data */
  dayViewData: DayViewData | null;
  /** Click on time slot */
  onTimeSlotClick?: (hour: number, minute: number) => void;
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
 * Day calendar view with hourly time slots.
 *
 * Displays a single day with events positioned by time.
 */
export const DayCalendar = memo(function DayCalendar({
  dayViewData,
  onTimeSlotClick,
  onEventClick,
  startHour = 0,
  endHour = 23,
  hourHeight = 60,
  showCurrentTime = true,
  className,
  isLoading = false,
  error = null,
}: DayCalendarProps) {
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
  if (!dayViewData) {
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

  // Separate all-day events from timed events
  const allDayEvents = dayViewData.events.filter((e) => e.allDay);
  const timedEvents = dayViewData.events.filter((e) => !e.allDay);

  const formatDateString = (date: Date): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return formatter.format(date);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Date header */}
      <div className="mb-4">
        <h3
          className={cn(
            'text-lg font-semibold',
            isToday(dayViewData.date) && 'text-accent-primary'
          )}
        >
          {formatDateString(dayViewData.date)}
          {isToday(dayViewData.date) && ' (Today)'}
        </h3>
      </div>

      {/* All-day events section */}
      {allDayEvents.length > 0 && (
        <div className="mb-4 p-3 bg-bg-secondary rounded-lg border border-border-secondary">
          <div className="text-xs font-medium text-text-secondary mb-2">All Day</div>
          <div className="space-y-2">
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-2 p-2 bg-bg-primary rounded border-l-4 border-accent-tertiary cursor-pointer hover:bg-bg-tertiary transition-colors"
                onClick={() => onEventClick?.(event)}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{event.title}</div>
                  {event.description && (
                    <div className="text-xs text-text-secondary truncate">{event.description}</div>
                  )}
                </div>
                {event.priority !== 'NONE' && (
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      event.priority === 'HIGH' && 'bg-red-500',
                      event.priority === 'MEDIUM' && 'bg-orange-500',
                      event.priority === 'LOW' && 'bg-blue-500'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Time grid */}
      <div className="bg-bg-secondary rounded-lg border border-border-secondary overflow-hidden">
        <TimeGrid
          events={timedEvents}
          hours={dayViewData.hours}
          startHour={startHour}
          endHour={endHour}
          hourHeight={hourHeight}
          showCurrentTime={showCurrentTime}
          onTimeSlotClick={onTimeSlotClick}
          onEventClick={onEventClick}
        />
      </div>

      {/* Event count footer */}
      {dayViewData.events.length > 0 && (
        <div className="mt-3 text-center text-sm text-text-secondary">
          {dayViewData.events.length} {dayViewData.events.length === 1 ? 'event' : 'events'}{' '}
          scheduled
        </div>
      )}
    </div>
  );
});
