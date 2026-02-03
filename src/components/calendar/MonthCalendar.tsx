'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { CalendarHeader } from './CalendarHeader';
import { CalendarDay } from './CalendarDay';
import type { MonthViewData, CalendarEvent } from '@/lib/calendar/types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LABELS_MONDAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export interface MonthCalendarProps {
  /** Month view data */
  monthViewData: MonthViewData;
  /** Selected date */
  selectedDate?: Date | null;
  /** Whether weekends should be shown */
  showWeekends?: boolean;
  /** Start day of week (0 = Sunday, 1 = Monday) */
  startOfWeek?: number;
  /** Navigate to previous month */
  onPreviousMonth: () => void;
  /** Navigate to next month */
  onNextMonth: () => void;
  /** Navigate to today */
  onToday: () => void;
  /** Handle date click */
  onDateClick?: (date: Date) => void;
  /** Handle task click */
  onTaskClick?: (event: CalendarEvent) => void;
  /** Handle task drop on a date (drag-and-drop) */
  onTaskDrop?: (taskId: string, newDate: Date) => void;
  /** Optional header title */
  title?: string;
  /** Maximum events to show per day */
  maxEventsPerDay?: number;
  /** Whether to show overflow indicator */
  showOverflowIndicator?: boolean;
  /** Whether to enable drag and drop */
  enableDragDrop?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * Monthly calendar grid component.
 *
 * Displays a 6-week calendar grid with tasks shown on each day.
 * Includes navigation controls, drag-and-drop support, and responsive layout.
 */
export function MonthCalendar({
  monthViewData,
  selectedDate,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  showWeekends = true,
  startOfWeek = 0,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onDateClick,
  onTaskClick,
  onTaskDrop,
  title,
  maxEventsPerDay = 3,
  showOverflowIndicator = true,
  enableDragDrop = true,
  className,
}: MonthCalendarProps) {
  const [activeDrag, setActiveDrag] = useState<{ id: string; title: string } | null>(null);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts (prevents accidental drags)
      },
    })
  );

  const weekdayLabels = startOfWeek === 1 ? WEEKDAY_LABELS_MONDAY : WEEKDAY_LABELS;

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskId = active.data.current?.taskId;
    const taskTitle = active.data.current?.taskTitle;
    if (taskId) {
      setActiveDrag({ id: taskId, title: taskTitle });
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over || !onTaskDrop) return;

    // Get the task ID from the draggable
    const taskId = active.data.current?.taskId;
    if (!taskId) return;

    // Get the date from the droppable
    const overId = over.id as string;
    if (!overId.startsWith('day-')) return;

    // Parse the date from the droppable ID (format: day-year-month-day)
    const parts = overId.split('-');
    if (parts.length !== 4) return;

    const year = parseInt(parts[1], 10);
    const month = parseInt(parts[2], 10);
    const day = parseInt(parts[3], 10);

    const newDate = new Date(year, month, day, 12, 0, 0, 0);

    // Check if the date actually changed
    const oldDate = new Date(active.data.current?.date || '');
    if (
      oldDate.getFullYear() === year &&
      oldDate.getMonth() === month &&
      oldDate.getDate() === day
    ) {
      return; // Same date, no change needed
    }

    onTaskDrop(taskId, newDate);
  };

  // Wrap calendar in DndContext if drag-drop is enabled
  const calendarContent = (
    <div className={cn('w-full', className)}>
      {/* Calendar header with navigation */}
      <CalendarHeader
        currentMonth={monthViewData.firstDay}
        onPreviousMonth={onPreviousMonth}
        onNextMonth={onNextMonth}
        onToday={onToday}
        title={title}
      />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-px mb-2">
        {weekdayLabels.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="border border-border-subtle rounded-lg overflow-hidden">
        {monthViewData.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.days.map((day) => (
              <CalendarDay
                key={day.date.toISOString()}
                day={day}
                isSelected={
                  selectedDate ? day.date.getTime() === selectedDate.getTime() : day.isSelected
                }
                onClick={onDateClick}
                onTaskClick={onTaskClick}
                maxEvents={maxEventsPerDay}
                showOverflowIndicator={showOverflowIndicator}
                enableDragDrop={enableDragDrop}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Stats footer */}
      <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
        <span>{monthViewData.totalEvents} events this month</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Today</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-background-secondary border border-border-subtle" />
            <span>Other month</span>
          </div>
          {enableDragDrop && (
            <div className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 text-text-tertiary"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
              <span>Drag tasks to reschedule</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!enableDragDrop || !onTaskDrop) {
    return calendarContent;
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {calendarContent}
      <DragOverlay>
        {activeDrag && (
          <div className="px-3 py-2 rounded bg-primary text-white text-sm shadow-lg">
            {activeDrag.title}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
