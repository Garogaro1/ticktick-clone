'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils/cn';
import type { TaskDto } from '@/lib/tasks/types';
import type { KanbanGroupBy, KanbanColumn as KanbanColumnType } from '@/lib/kanban';
import { KanbanColumn } from './KanbanColumn';
import { GroupBySelector } from './GroupBySelector';

export interface KanbanBoardProps {
  columns: KanbanColumnType[];
  groupBy: KanbanGroupBy;
  sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
  onGroupByChange?: (groupBy: KanbanGroupBy) => void;
  onSortByChange?: (sortBy: 'createdAt' | 'dueDate' | 'priority' | 'title') => void;
  onSortOrderChange?: (sortOrder: 'asc' | 'desc') => void;
  onTaskMove?: (taskId: string, fromColumn: string, toColumn: string) => Promise<boolean>;
  onTaskClick?: (task: TaskDto) => void;
  onRefetch?: () => void;
  className?: string;
}

interface ActiveDragData {
  id: string;
  title: string;
  columnId: string;
}

/**
 * Kanban board component.
 *
 * Displays tasks in draggable columns with drag-and-drop support.
 * Supports grouping by status, priority, list, and tag.
 */
export function KanbanBoard({
  columns,
  groupBy,
  sortBy,
  sortOrder,
  isLoading = false,
  error = null,
  disabled = false,
  onGroupByChange,
  onSortByChange,
  onSortOrderChange,
  onTaskMove,
  onTaskClick,
  onRefetch,
  className,
}: KanbanBoardProps) {
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    })
  );

  // Find task by ID across all columns
  const findTaskById = useCallback(
    (taskId: string): { task: TaskDto; columnId: string } | null => {
      for (const column of columns) {
        const task = column.tasks.find((t) => t.id === taskId);
        if (task) {
          return { task, columnId: column.id };
        }
      }
      return null;
    },
    [columns]
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const result = findTaskById(active.id as string);
    if (result) {
      setActiveDrag({
        id: result.task.id,
        title: result.task.title,
        columnId: result.columnId,
      });
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);

    if (!over || !onTaskMove) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the task and its source column
    const result = findTaskById(activeId);
    if (!result) return;

    const { columnId: fromColumn } = result;

    // Check if dropping on a different column
    if (fromColumn !== overId) {
      await onTaskMove(activeId, fromColumn, overId);
    }
  };

  // Get active drag task for overlay
  const activeDragTask = useMemo(() => {
    if (!activeDrag) return null;
    return findTaskById(activeDrag.id)?.task;
  }, [activeDrag, findTaskById]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header with controls */}
        <div className="flex items-center justify-between mb-6">
          {/* Group by selector */}
          {onGroupByChange && (
            <GroupBySelector
              groupBy={groupBy}
              onGroupByChange={onGroupByChange}
              disabled={disabled || isLoading}
            />
          )}

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            {/* Sort options */}
            {onSortByChange && onSortOrderChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-secondary">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value as typeof sortBy)}
                  disabled={disabled || isLoading}
                  className="px-3 py-2 bg-background-card border border-border-subtle rounded-l-lg text-sm text-text-primary focus:border-primary outline-none transition-all duration-200 disabled:opacity-50"
                >
                  <option value="createdAt">Created</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </select>
                <button
                  onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                  disabled={disabled || isLoading}
                  className="px-3 py-2 bg-background-card border border-l-0 border-border-subtle rounded-r-lg text-sm text-text-primary hover:bg-background-secondary focus:border-primary outline-none transition-all duration-200 disabled:opacity-50"
                  title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortOrder === 'asc' ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 19V5" />
                      <path d="m5 12 7-7 7 7" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 5v14" />
                      <path d="m19 12-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            )}

            {/* Refresh button */}
            {onRefetch && (
              <button
                onClick={onRefetch}
                disabled={isLoading}
                className={cn(
                  'p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                  isLoading && 'animate-spin'
                )}
                aria-label="Refresh"
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-4 p-4 bg-error/10 border border-error/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-error">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button onClick={onRefetch} className="text-sm text-error hover:underline">
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && columns.length === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <div className="w-16 h-16 mb-4 text-text-tertiary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
                <path d="M15 3v18" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No columns found</h3>
            <p className="text-sm text-text-secondary">
              Tasks will appear here once you create them.
            </p>
          </div>
        )}

        {/* Kanban columns grid */}
        <div className={cn('flex gap-4 overflow-x-auto pb-4', 'snap-x snap-mandatory')}>
          {columns.map((column) => (
            <div key={column.id} className="snap-start shrink-0">
              <KanbanColumn
                column={column}
                isLoading={isLoading}
                onTaskClick={onTaskClick}
                disabled={disabled}
              />
            </div>
          ))}
        </div>

        {/* Stats footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>
            {columns.reduce((sum, col) => sum + col.tasks.length, 0)} tasks across {columns.length}{' '}
            columns
          </span>
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
            <span>Drag tasks to move them</span>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragTask && (
          <div className="px-4 py-3 rounded-lg bg-primary text-white shadow-lg max-w-[300px]">
            <p className="text-sm font-medium truncate">{activeDragTask.title}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
