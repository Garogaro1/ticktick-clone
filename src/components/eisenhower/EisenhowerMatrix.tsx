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
import type {
  TaskWithQuadrant,
  EisenhowerQuadrant,
  ManualQuadrantAssignments,
} from '@/lib/eisenhower';
import { EisenhowerQuadrant as Quadrant } from './EisenhowerQuadrant';
import { getQuadrantConfigs } from '@/lib/eisenhower';

export interface EisenhowerMatrixProps {
  matrixData: {
    doFirst: TaskWithQuadrant[];
    schedule: TaskWithQuadrant[];
    delegate: TaskWithQuadrant[];
    eliminate: TaskWithQuadrant[];
  };
  manualAssignments?: ManualQuadrantAssignments;
  isLoading?: boolean;
  error?: string | null;
  disabled?: boolean;
  onTaskMove?: (taskId: string, toQuadrant: EisenhowerQuadrant) => void;
  onTaskClick?: (task: TaskWithQuadrant) => void;
  onRefetch?: () => void;
  className?: string;
}

interface ActiveDragData {
  id: string;
  title: string;
  fromQuadrant: EisenhowerQuadrant;
}

const quadrantConfigs = getQuadrantConfigs();

/**
 * Eisenhower Matrix component.
 *
 * Displays tasks in a 2x2 grid based on urgency and importance.
 * Supports drag-and-drop to manually override categorization.
 */
export function EisenhowerMatrix({
  matrixData,
  manualAssignments = {},
  isLoading = false,
  error = null,
  disabled = false,
  onTaskMove,
  onTaskClick,
  onRefetch,
  className,
}: EisenhowerMatrixProps) {
  const [activeDrag, setActiveDrag] = useState<ActiveDragData | null>(null);

  // Configure sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px movement before drag starts
      },
    })
  );

  // Flatten tasks for finding by ID
  const allTasks = useMemo(
    () => [
      ...matrixData.doFirst,
      ...matrixData.schedule,
      ...matrixData.delegate,
      ...matrixData.eliminate,
    ],
    [matrixData]
  );

  // Create quadrant array with tasks
  const quadrants = useMemo(
    () => [
      { id: 'do-first' as const, config: quadrantConfigs[0], tasks: matrixData.doFirst },
      { id: 'schedule' as const, config: quadrantConfigs[1], tasks: matrixData.schedule },
      { id: 'delegate' as const, config: quadrantConfigs[2], tasks: matrixData.delegate },
      { id: 'eliminate' as const, config: quadrantConfigs[3], tasks: matrixData.eliminate },
    ],
    [matrixData]
  );

  // Find task by ID
  const findTaskById = useCallback(
    (taskId: string): { task: TaskWithQuadrant; quadrant: EisenhowerQuadrant } | null => {
      for (const quadrant of quadrants) {
        const task = quadrant.tasks.find((t) => t.id === taskId);
        if (task) {
          return { task, quadrant: quadrant.id };
        }
      }
      return null;
    },
    [quadrants]
  );

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const result = findTaskById(active.id as string);
    if (result) {
      setActiveDrag({
        id: result.task.id,
        title: result.task.title,
        fromQuadrant: result.quadrant,
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

    // Find the task and its source quadrant
    const result = findTaskById(activeId);
    if (!result) return;

    const { quadrant: fromQuadrant } = result;

    // Extract quadrant from drop zone ID (format: quadrant-do-first)
    const toQuadrant = overId.replace('quadrant-', '') as EisenhowerQuadrant;

    // Only update if moving to a different quadrant
    if (fromQuadrant !== toQuadrant) {
      await onTaskMove(activeId, toQuadrant);
    }
  };

  // Get active drag task for overlay
  const activeDragTask = useMemo(() => {
    if (!activeDrag) return null;
    return findTaskById(activeDrag.id)?.task;
  }, [activeDrag, findTaskById]);

  const totalTasks = allTasks.length;
  const hasManualAssignments = Object.keys(manualAssignments).length > 0;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={cn('flex flex-col h-full', className)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Eisenhower Matrix</h2>
            <p className="text-sm text-text-secondary">
              Categorize tasks by urgency and importance
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Manual assignments indicator */}
            {hasManualAssignments && (
              <div className="flex items-center gap-1.5 text-xs text-text-tertiary bg-background-tertiary px-3 py-1.5 rounded-full">
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                {Object.keys(manualAssignments).length} manual override
                {Object.keys(manualAssignments).length > 1 ? 's' : ''}
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
        {!isLoading && totalTasks === 0 && (
          <div className="flex flex-col items-center justify-center flex-1 py-20">
            <div className="w-16 h-16 mb-4 text-text-tertiary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="8" height="8" rx="1" />
                <rect x="13" y="3" width="8" height="8" rx="1" />
                <rect x="3" y="13" width="8" height="8" rx="1" />
                <rect x="13" y="13" width="8" height="8" rx="1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">No tasks to categorize</h3>
            <p className="text-sm text-text-secondary">
              Create some tasks to see them organized by urgency and importance.
            </p>
          </div>
        )}

        {/* Matrix grid - 2x2 layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {/* Do First - Top Left */}
          <div className="min-h-[400px]">
            <Quadrant
              id="do-first"
              config={quadrantConfigs[0]}
              tasks={matrixData.doFirst}
              isLoading={isLoading}
              onTaskClick={onTaskClick}
              disabled={disabled}
            />
          </div>

          {/* Schedule - Top Right */}
          <div className="min-h-[400px]">
            <Quadrant
              id="schedule"
              config={quadrantConfigs[1]}
              tasks={matrixData.schedule}
              isLoading={isLoading}
              onTaskClick={onTaskClick}
              disabled={disabled}
            />
          </div>

          {/* Delegate - Bottom Left */}
          <div className="min-h-[400px]">
            <Quadrant
              id="delegate"
              config={quadrantConfigs[2]}
              tasks={matrixData.delegate}
              isLoading={isLoading}
              onTaskClick={onTaskClick}
              disabled={disabled}
            />
          </div>

          {/* Eliminate - Bottom Right */}
          <div className="min-h-[400px]">
            <Quadrant
              id="eliminate"
              config={quadrantConfigs[3]}
              tasks={matrixData.eliminate}
              isLoading={isLoading}
              onTaskClick={onTaskClick}
              disabled={disabled}
            />
          </div>
        </div>

        {/* Stats footer */}
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <span>
            {totalTasks} task{totalTasks !== 1 ? 's' : ''} categorized
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
            <span>Drag tasks to manually reassign quadrants</span>
          </div>
        </div>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeDragTask && (
          <div className="px-4 py-3 rounded-lg bg-primary text-white shadow-lg max-w-[280px]">
            <p className="text-sm font-medium truncate">{activeDragTask.title}</p>
            <p className="text-xs opacity-80 mt-1">
              Moving from {quadrantConfigs.find((q) => q.id === activeDrag?.fromQuadrant)?.label}
            </p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
