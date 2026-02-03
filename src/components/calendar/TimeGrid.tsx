'use client';

import { memo } from 'react';
import type { CalendarEvent } from '@/lib/calendar/types';
import { getTimeString } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

export interface TimeGridProps {
  /** Hours to display (0-23) */
  hours?: number[];
  /** Events to display */
  events?: CalendarEvent[];
  /** Start of day hour */
  startHour?: number;
  /** End of day hour */
  endHour?: number;
  /** Height of each hour slot in pixels */
  hourHeight?: number;
  /** Current time indicator */
  showCurrentTime?: boolean;
  /** Click on time slot */
  onTimeSlotClick?: (hour: number, minute: number) => void;
  /** Click on event */
  onEventClick?: (event: CalendarEvent) => void;
  /** Additional class names */
  className?: string;
  /** Children to render (custom event rendering) */
  children?: React.ReactNode;
}

/**
 * Time grid for displaying calendar events in hourly slots.
 *
 * Shows hours from startHour to endHour with optional events.
 */
export const TimeGrid = memo(function TimeGrid({
  hours = Array.from({ length: 24 }, (_, i) => i),
  events = [],
  startHour = 0,
  endHour = 23,
  hourHeight = 60,
  showCurrentTime = true,
  onTimeSlotClick,
  onEventClick,
  className,
  children,
}: TimeGridProps) {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Filter hours to display
  const displayHours = hours.filter((h) => h >= startHour && h <= endHour);

  // Calculate position and height for an event
  const getEventStyle = (event: CalendarEvent) => {
    const startHour = event.start.getHours();
    const startMinute = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinute = event.end.getMinutes();

    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;

    const top = (startMinutes / 60) * hourHeight;
    const height = Math.max((durationMinutes / 60) * hourHeight, 20); // Min height for visibility

    return { top: `${top}px`, height: `${height}px` };
  };

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

  return (
    <div
      className={cn('relative flex flex-col', className)}
      style={{ height: `${displayHours.length * hourHeight}px` }}
    >
      {/* Time labels column */}
      <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col">
        {displayHours.map((hour) => (
          <div
            key={hour}
            className="flex-1 border-b border-border-secondary pr-3 text-right text-xs text-text-secondary flex items-center justify-end"
            style={{ height: `${hourHeight}px` }}
          >
            {formatHour(hour)}
          </div>
        ))}
      </div>

      {/* Main grid area */}
      <div className="ml-16 flex-1 relative">
        {/* Hour slots */}
        {displayHours.map((hour) => (
          <div
            key={hour}
            className="border-b border-border-secondary last:border-b-0 relative cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
            style={{ height: `${hourHeight}px` }}
            onClick={() => onTimeSlotClick?.(hour, 0)}
            role="presentation"
          >
            {/* Half-hour line */}
            <div className="absolute top-1/2 left-0 right-0 border-t border-border-secondary/40" />
          </div>
        ))}

        {/* Current time indicator */}
        {showCurrentTime && displayHours.some((h) => h >= currentHour && h <= endHour) && (
          <div
            className="absolute left-0 right-0 z-10 pointer-events-none"
            style={{
              top: `${((currentHour * 60 + currentMinute) / 60) * hourHeight}px`,
            }}
          >
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-accent-primary" />
              <div className="flex-1 h-px bg-accent-primary" />
            </div>
          </div>
        )}

        {/* Events */}
        {events.map((event) => {
          if (event.allDay) return null;
          const style = getEventStyle(event);
          return (
            <div
              key={event.id}
              className={cn(
                'absolute left-1 right-1 rounded-md border-l-4 p-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden',
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

        {/* Custom children */}
        {children}
      </div>
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
