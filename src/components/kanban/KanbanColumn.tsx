'use client';

import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils/cn';
import type { KanbanColumn as KanbanColumnType } from '@/lib/kanban';
import type { TaskDto } from '@/lib/tasks/types';
import { KanbanTaskCard } from './KanbanTaskCard';

export interface KanbanColumnProps {
  column: KanbanColumnType;
  isLoading?: boolean;
  onTaskClick?: (task: TaskDto) => void;
  disabled?: boolean;
}

/**
 * Kanban column component.
 *
 * Displays a column with a header, task count, and drop zone.
 * Shows visual feedback when a task is dragged over.
 */
export function KanbanColumn({
  column,
  isLoading = false,
  onTaskClick,
  disabled = false,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    disabled,
    data: {
      type: 'column',
      columnId: column.id,
      columnValue: column.value,
      groupBy: 'status', // Will be dynamic from parent
    },
  });

  const hasColor = column.color && column.color !== '#9CA3AF';
  const columnStyle = hasColor ? { borderTopColor: column.color ?? undefined } : undefined;

  return (
    <div
      className={cn(
        'flex flex-col h-full min-w-[280px] max-w-[400px] w-full',
        'bg-background-secondary rounded-lg border border-border-subtle',
        isOver && 'ring-2 ring-primary ring-opacity-50'
      )}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b border-border-subtle',
          'bg-background-card rounded-t-lg'
        )}
        style={columnStyle}
      >
        <div className="flex items-center gap-2">
          {/* Icon */}
          {column.icon && (
            <span className="text-sm" role="img" aria-label="column icon">
              {column.icon}
            </span>
          )}

          {/* Color indicator */}
          {hasColor && (
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: column.color ?? undefined }}
            />
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold text-text-primary">{column.title}</h3>

          {/* Task count badge */}
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full font-medium',
              'bg-background-tertiary text-text-secondary'
            )}
          >
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Drop Zone / Task List */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 p-3 space-y-2 overflow-y-auto',
          'min-h-[200px] max-h-[calc(100vh-300px)]',
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
        ) : column.tasks.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-24 text-text-tertiary text-sm">
            No tasks
          </div>
        ) : (
          // Tasks
          column.tasks.map((task) => (
            <KanbanTaskCard key={task.id} task={task} disabled={disabled} onClick={onTaskClick} />
          ))
        )}
      </div>
    </div>
  );
}
