'use client';

import { cn } from '@/lib/utils/cn';
import type { CalendarDay as CalendarDayType, CalendarEvent } from '@/lib/calendar/types';
import { formatDateShort } from '@/lib/utils/date';
import { Priority } from '@prisma/client';
import { useMemo } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

export interface CalendarDayProps {
  /** Day data */
  day: CalendarDayType;
  /** Whether the day is selected */
  isSelected?: boolean;
  /** Click handler */
  onClick?: (date: Date) => void;
  /** Click handler for a task */
  onTaskClick?: (event: CalendarEvent) => void;
  /** Maximum events to show before truncating */
  maxEvents?: number;
  /** Whether to show event indicators for overflow */
  showOverflowIndicator?: boolean;
  /** Whether drag and drop is enabled */
  enableDragDrop?: boolean;
}

/**
 * Priority color classes for task chips.
 */
const priorityColors: Record<Priority, string> = {
  NONE: 'border-l-border-subtle',
  LOW: 'border-l-blue-400',
  MEDIUM: 'border-l-yellow-500',
  HIGH: 'border-l-red-500',
};

/**
 * Generate a stable ID for a calendar day cell.
 */
function getDayCellId(date: Date): string {
  return `day-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Generate a stable ID for a draggable task.
 */
function getTaskDraggableId(eventId: string, date: Date): string {
  return `task-${eventId}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

/**
 * Single day cell in the calendar grid.
 *
 * Displays the day number and task chips for events.
 * Supports drag-and-drop for moving tasks between dates.
 */
export function CalendarDay({
  day,
  isSelected = false,
  onClick,
  onTaskClick,
  maxEvents = 3,
  showOverflowIndicator = true,
  enableDragDrop = true,
}: CalendarDayProps) {
  const { date, isCurrentMonth, isToday, events } = day;

  // Set up droppable zone for this day
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: getDayCellId(date),
    disabled: !enableDragDrop,
    data: {
      date: date.toISOString(),
    },
  });

  // Truncate events if needed
  const visibleEvents = useMemo(() => {
    return events.slice(0, maxEvents);
  }, [events, maxEvents]);

  const overflowCount = useMemo(() => {
    return Math.max(0, events.length - maxEvents);
  }, [events, maxEvents]);

  const handleClick = () => {
    onClick?.(date);
  };

  const handleTaskClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    onTaskClick?.(event);
  };

  return (
    <div
      ref={enableDragDrop ? setDroppableRef : undefined}
      className={cn(
        'min-h-[100px] p-2 border-t border-l border-border-subtle first:border-l-0',
        'transition-colors duration-150 ease-out',
        'hover:bg-background-secondary',
        isCurrentMonth ? 'bg-background-primary' : 'bg-background-muted/30',
        isSelected && 'ring-2 ring-inset ring-primary',
        !isCurrentMonth && 'opacity-50',
        isOver && enableDragDrop && 'bg-primary/5 ring-2 ring-primary/30'
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={formatDateShort(date)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Day number */}
      <div
        className={cn(
          'flex items-center justify-center w-7 h-7 mb-1 text-sm font-medium rounded-full',
          isToday && 'bg-primary text-white',
          !isToday && isCurrentMonth && 'text-text-primary',
          !isToday && !isCurrentMonth && 'text-text-tertiary'
        )}
      >
        {date.getDate()}
      </div>

      {/* Task chips */}
      <div className="flex flex-col gap-1">
        {visibleEvents.map((event) => (
          <DraggableCalendarTaskChip
            key={event.id}
            event={event}
            date={date}
            onClick={(e) => handleTaskClick(event, e)}
            enableDragDrop={enableDragDrop}
          />
        ))}

        {/* Overflow indicator */}
        {showOverflowIndicator && overflowCount > 0 && (
          <button
            type="button"
            className="text-xs text-text-secondary hover:text-text-primary transition-colors text-left truncate"
            onClick={handleClick}
          >
            +{overflowCount} more
          </button>
        )}
      </div>
    </div>
  );
}

interface CalendarTaskChipProps {
  event: CalendarEvent;
  date: Date;
  onClick?: (e: React.MouseEvent) => void;
  enableDragDrop?: boolean;
}

/**
 * Draggable task chip displayed in a calendar day.
 */
function DraggableCalendarTaskChip({
  event,
  date,
  onClick,
  enableDragDrop = true,
}: CalendarTaskChipProps) {
  const { setNodeRef, attributes, listeners, isDragging, transform } = useDraggable({
    id: getTaskDraggableId(event.id, date),
    disabled: !enableDragDrop || event.status === 'DONE' || event.status === 'CANCELLED',
    data: {
      taskId: event.id,
      taskTitle: event.title,
      date: date.toISOString(),
    },
  });

  const isDone = event.status === 'DONE' || event.status === 'CANCELLED';
  const isOverdue = event.isOverdue && !isDone;
  const isDragDisabled = !enableDragDrop || isDone;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex items-center gap-1.5 px-2 py-1 rounded text-xs',
        'border-l-2 transition-all duration-150 ease-out',
        'hover:shadow-sm',
        'truncate max-w-full',
        priorityColors[event.priority],
        isDone ? 'opacity-60' : 'opacity-100',
        isOverdue && 'bg-red-50 dark:bg-red-950/20',
        // Enable cursor interaction only when not dragging
        !isDragging && 'cursor-pointer',
        // Show grab cursor for draggable items
        !isDragDisabled && !isDragging && 'cursor-grab',
        !isDragDisabled && isDragging && 'cursor-grabbing'
      )}
      onClick={onClick}
      {...attributes}
      {...listeners}
      title={`${event.title}${event.description ? ': ' + event.description : ''}`}
    >
      {/* List color indicator */}
      {event.listColor && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: event.listColor }}
        />
      )}

      {/* Task title */}
      <span className="truncate flex-1">{event.title}</span>

      {/* Recurring indicator */}
      {event.isRecurring && <span className="text-text-tertiary flex-shrink-0">↻</span>}
    </div>
  );
}
