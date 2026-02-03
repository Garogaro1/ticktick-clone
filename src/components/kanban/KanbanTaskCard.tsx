'use client';

import { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils/cn';
import { TaskStatus, Priority } from '@prisma/client';
import type { TaskDto } from '@/lib/tasks/types';
import { TagBadge } from '@/components/tags/TagBadge';

export interface KanbanTaskCardProps {
  task: TaskDto;
  disabled?: boolean;
  onClick?: (task: TaskDto) => void;
}

const priorityConfig: Record<Priority, { color: string; label: string; bg: string }> = {
  [Priority.NONE]: { color: 'text-text-tertiary', label: '', bg: '' },
  [Priority.LOW]: { color: 'text-text-tertiary', label: 'Low', bg: 'bg-blue-500/10 text-blue-600' },
  [Priority.MEDIUM]: { color: 'text-warning', label: 'Med', bg: 'bg-warning/10 text-warning' },
  [Priority.HIGH]: { color: 'text-error', label: 'High', bg: 'bg-error/10 text-error' },
};

/**
 * Compact task card for Kanban board.
 *
 * Displays task title, priority badge, tags, and due date.
 * Draggable when not disabled.
 */
export const KanbanTaskCard = memo(function KanbanTaskCard({
  task,
  disabled = false,
  onClick,
}: KanbanTaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: disabled || task.status === TaskStatus.CANCELLED,
    data: {
      type: 'task',
      taskId: task.id,
      taskTitle: task.title,
      currentColumn: `status-${task.status}`,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  const isDone = task.status === TaskStatus.DONE;
  const isCancelled = task.status === TaskStatus.CANCELLED;
  const priority = priorityConfig[task.priority];

  // Format due date
  const formatDueDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative p-3 bg-background-card rounded-lg border border-border-subtle',
        'hover:border-border-default hover:shadow-sm transition-all duration-150',
        'cursor-pointer select-none',
        isDragging && 'opacity-50 rotate-2 shadow-lg',
        isDone && 'opacity-70 bg-background-secondary',
        isCancelled && 'opacity-50 bg-background-secondary line-through',
        isOverdue && 'border-error/30 bg-error/5',
        disabled && 'cursor-default'
      )}
      onClick={() => onClick?.(task)}
    >
      {/* Title */}
      <h4
        className={cn(
          'text-sm font-medium text-text-primary line-clamp-2 mb-2',
          isDone && 'line-through text-text-tertiary'
        )}
      >
        {task.title}
      </h4>

      {/* Meta info */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Priority badge */}
        {task.priority !== Priority.NONE && (
          <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', priority.bg)}>
            {priority.label}
          </span>
        )}

        {/* Due date */}
        {task.dueDate && (
          <span
            className={cn(
              'text-xs flex items-center gap-1',
              isOverdue ? 'text-error' : 'text-text-tertiary'
            )}
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {formatDueDate(task.dueDate)}
          </span>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex items-center gap-1">
            {task.tags.slice(0, 2).map((tag) => (
              <TagBadge key={tag.id} tag={tag} variant="compact" />
            ))}
            {task.tags.length > 2 && (
              <span className="text-xs text-text-tertiary">+{task.tags.length - 2}</span>
            )}
          </div>
        )}
      </div>

      {/* Drag handle indicator */}
      {!disabled && !isCancelled && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="p-1 text-text-tertiary hover:text-text-primary">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>
        </div>
      )}

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-text-tertiary mt-2 line-clamp-2">{task.description}</p>
      )}

      {/* Subtasks indicator */}
      {((task._count?.subtasks ?? 0) || 0) > 0 && (
        <div className="flex items-center gap-1 mt-2 text-xs text-text-tertiary">
          <svg
            className="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          {task._count?.subtasks ?? 0} subtasks
        </div>
      )}
    </div>
  );
});
