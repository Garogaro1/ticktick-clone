'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils/cn';
import type { EisenhowerQuadrant, QuadrantConfig, TaskWithQuadrant } from '@/lib/eisenhower';
import { EisenhowerTaskCard } from './EisenhowerTaskCard';

export interface EisenhowerQuadrantProps {
  id: EisenhowerQuadrant;
  config: QuadrantConfig;
  tasks: TaskWithQuadrant[];
  isLoading?: boolean;
  onTaskClick?: (task: TaskWithQuadrant) => void;
  disabled?: boolean;
}

/**
 * Eisenhower Matrix quadrant component.
 *
 * Displays a quadrant with a header, task count, and drop zone.
 * Shows visual feedback when a task is dragged over.
 */
export function EisenhowerQuadrant({
  id,
  config,
  tasks,
  isLoading = false,
  onTaskClick,
  disabled = false,
}: EisenhowerQuadrantProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `quadrant-${id}`,
    disabled,
    data: {
      type: 'quadrant',
      quadrant: id,
    },
  });

  return (
    <div
      className={cn(
        'flex flex-col h-full min-w-[280px] max-w-[400px] w-full',
        'bg-background-secondary rounded-lg border border-border-subtle',
        'transition-all duration-200',
        isOver && 'ring-2 ring-primary ring-opacity-50 scale-[1.02]'
      )}
    >
      {/* Quadrant Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b border-border-subtle',
          'bg-background-card rounded-t-lg',
          config.borderColor,
          'border-t-4'
        )}
      >
        <div className="flex items-center gap-2">
          {/* Icon */}
          <span className="text-lg" role="img" aria-label={`${config.label} icon`}>
            {config.icon}
          </span>

          {/* Title and description */}
          <div className="flex flex-col">
            <h3 className={cn('text-sm font-semibold text-text-primary', config.color)}>
              {config.label}
            </h3>
            <p className="text-xs text-text-tertiary">{config.description}</p>
          </div>
        </div>

        {/* Task count badge */}
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-medium',
            'bg-background-tertiary text-text-secondary'
          )}
        >
          {tasks.length}
        </span>
      </div>

      {/* Recommended action hint */}
      <div className={cn('px-4 py-2 text-xs text-text-tertiary italic', config.bgColor)}>
        {getActionHint(id)}
      </div>

      {/* Drop Zone / Task List */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 space-y-2 overflow-y-auto',
          'min-h-[200px] max-h-[calc(100vh-350px)]',
          isOver && 'bg-primary/5'
        )}
      >
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-3 bg-background-card rounded-lg border border-border-subtle animate-pulse"
            >
              <div className="h-4 bg-background-tertiary rounded w-3/4 mb-2" />
              <div className="h-3 bg-background-tertiary rounded w-1/2" />
            </div>
          ))
        ) : tasks.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center h-24 text-text-tertiary text-sm gap-1">
            <span className="text-2xl opacity-50">{config.icon}</span>
            <span>No tasks</span>
          </div>
        ) : (
          // Tasks
          tasks.map((task) => (
            <EisenhowerTaskCard
              key={task.id}
              task={task}
              disabled={disabled}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Get the action hint for a quadrant.
 */
function getActionHint(quadrant: EisenhowerQuadrant): string {
  const hints: Record<EisenhowerQuadrant, string> = {
    'do-first': '🚀 Do these tasks immediately',
    schedule: '📅 Schedule time for these',
    delegate: '👤 Delegate if possible',
    eliminate: '🗑️ Consider removing these',
  };
  return hints[quadrant];
}
