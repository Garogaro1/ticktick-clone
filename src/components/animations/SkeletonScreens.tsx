'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TaskListSkeletonProps {
  count?: number;
  className?: string;
}

/**
 * Skeleton loader for task list.
 */
export function TaskListSkeleton({ count = 5, className }: TaskListSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Filter tabs skeleton */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 bg-background-secondary rounded-lg p-1">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-16 h-8 bg-background-card rounded-md"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>

      {/* Add task input skeleton */}
      <motion.div
        className="h-12 bg-background-card rounded-lg border border-border-subtle"
        initial={{ opacity: 0.5 }}
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Task items skeleton */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <TaskItemSkeleton key={i} delay={i * 0.1} />
        ))}
      </div>
    </div>
  );
}

export interface TaskItemSkeletonProps {
  delay?: number;
  className?: string;
}

/**
 * Skeleton loader for single task item.
 */
export function TaskItemSkeleton({ delay = 0, className }: TaskItemSkeletonProps) {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 px-4 py-3 bg-background-card rounded-lg border border-border-subtle',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
    >
      {/* Checkbox skeleton */}
      <motion.div
        className="w-5 h-5 rounded border-2 border-border-subtle"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity, delay }}
      />

      {/* Content skeleton */}
      <div className="flex-1 flex items-center gap-2">
        <motion.div
          className="h-5 bg-border-subtle rounded max-w-xs"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay }}
        />
        <motion.div
          className="h-5 w-16 bg-border-subtle rounded-full"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: delay + 0.1 }}
        />
      </div>
    </motion.div>
  );
}

export interface CalendarSkeletonProps {
  view?: 'month' | 'week' | 'day';
  className?: string;
}

/**
 * Skeleton loader for calendar views.
 */
export function CalendarSkeleton({ view = 'month', className }: CalendarSkeletonProps) {
  if (view === 'month') {
    return <MonthCalendarSkeleton className={className} />;
  }
  if (view === 'week') {
    return <WeekCalendarSkeleton className={className} />;
  }
  return <DayCalendarSkeleton className={className} />;
}

export function MonthCalendarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <motion.div
          className="h-8 w-40 bg-background-card rounded-lg"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="h-8 w-8 bg-background-card rounded-lg"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Weekday headers skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div
            key={day}
            className="h-8 flex items-center justify-center text-sm font-medium text-text-tertiary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 42 }).map((_, i) => (
          <motion.div
            key={i}
            className="aspect-square bg-background-card rounded-lg border border-border-subtle"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (i % 7) * 0.05, duration: 0.3 }}
          >
            <motion.div
              className="w-full h-full"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: (i * 0.02) % 1 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function WeekCalendarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <motion.div
          className="h-8 w-40 bg-background-card rounded-lg"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      {/* Week grid skeleton */}
      <div className="grid grid-cols-8 gap-1">
        {/* Time column */}
        <div className="flex flex-col gap-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-16 flex items-start justify-center text-xs text-text-tertiary pt-1"
            >
              {6 + i}:00
            </div>
          ))}
        </div>

        {/* Day columns */}
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div key={dayIndex} className="flex flex-col gap-1">
            {Array.from({ length: 12 }).map((_, slotIndex) => (
              <motion.div
                key={slotIndex}
                className="h-16 bg-background-card rounded border border-border-subtle"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: ((dayIndex * 12 + slotIndex) * 0.01) % 1,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DayCalendarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <motion.div
          className="h-8 w-48 bg-background-card rounded-lg"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </div>

      {/* Day time slots skeleton */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: 16 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-16 bg-background-card rounded-lg border border-border-subtle flex items-center px-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02, duration: 0.3 }}
          >
            <span className="text-xs text-text-tertiary w-12">{6 + i}:00</span>
            <motion.div
              className="flex-1 h-6 bg-border-subtle rounded"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: (i * 0.05) % 1 }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export interface KanbanSkeletonProps {
  columns?: number;
  className?: string;
}

/**
 * Skeleton loader for Kanban board.
 */
export function KanbanSkeleton({ columns = 4, className }: KanbanSkeletonProps) {
  return (
    <div className={cn('flex gap-4 overflow-x-auto', className)}>
      {Array.from({ length: columns }).map((_, colIndex) => (
        <motion.div
          key={colIndex}
          className="flex-shrink-0 w-72 bg-background-secondary rounded-xl p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: colIndex * 0.1, duration: 0.4 }}
        >
          {/* Column header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-3 h-3 rounded-full bg-border-subtle"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.div
                className="h-5 w-24 bg-border-subtle rounded"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
            <motion.div
              className="h-5 w-6 bg-border-subtle rounded"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* Column cards skeleton */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, cardIndex) => (
              <motion.div
                key={cardIndex}
                className="h-20 bg-background-card rounded-lg border border-border-subtle p-3"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: (colIndex * 3 + cardIndex * 0.2) % 1,
                }}
              >
                <div className="h-4 bg-border-subtle rounded w-3/4 mb-2" />
                <div className="h-3 bg-border-subtle rounded w-1/2" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export interface EisenhowerSkeletonProps {
  className?: string;
}

/**
 * Skeleton loader for Eisenhower Matrix.
 */
export function EisenhowerSkeleton({ className }: EisenhowerSkeletonProps) {
  const quadrants = [
    { label: 'Do First', color: 'bg-error/10' },
    { label: 'Schedule', color: 'bg-warning/10' },
    { label: 'Delegate', color: 'bg-blue-500/10' },
    { label: "Don't Do", color: 'bg-text-tertiary/10' },
  ];

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-4', className)}>
      {quadrants.map((quadrant, i) => (
        <motion.div
          key={i}
          className={cn('rounded-xl p-4 border border-border-subtle', quadrant.color)}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
        >
          {/* Quadrant header skeleton */}
          <div className="flex items-center justify-between mb-4">
            <motion.div
              className="h-6 w-28 bg-border-subtle rounded"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <motion.div
              className="h-5 w-8 bg-border-subtle rounded-full"
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* Quadrant items skeleton */}
          <div className="flex flex-col gap-2">
            {Array.from({ length: 2 }).map((_, j) => (
              <motion.div
                key={j}
                className="h-16 bg-background-card rounded-lg border border-border-subtle p-3"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: (i * 2 + j * 0.3) % 1,
                }}
              >
                <div className="h-4 bg-border-subtle rounded w-full mb-2" />
                <div className="h-3 bg-border-subtle rounded w-1/3" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export interface ListSidebarSkeletonProps {
  className?: string;
}

/**
 * Skeleton loader for sidebar lists.
 */
export function ListSidebarSkeleton({ className }: ListSidebarSkeletonProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* All Tasks button skeleton */}
      <motion.div
        className="h-10 bg-background-card rounded-lg border border-border-subtle"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Favorites section skeleton */}
      <div>
        <motion.div
          className="h-5 w-20 bg-border-subtle rounded mb-2"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="flex flex-col gap-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-10 bg-background-card rounded-lg border border-border-subtle"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>

      {/* Lists section skeleton */}
      <div>
        <motion.div
          className="h-5 w-16 bg-border-subtle rounded mb-2"
          animate={{ opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <div className="flex flex-col gap-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className="h-10 bg-background-card rounded-lg border border-border-subtle"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
