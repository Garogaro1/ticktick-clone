'use client';

import { useState, useCallback } from 'react';
import { TaskStatus, Priority } from '@prisma/client';
import { TaskItem } from './TaskItem';
import { AddTaskInput } from './AddTaskInput';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';
import type { TaskDto } from '@/lib/tasks/types';

export interface TaskListProps {
  tasks: TaskDto[];
  isLoading?: boolean;
  onAddTask?: (title: string) => Promise<void>;
  onUpdateTask?: (
    id: string,
    updates: Partial<Pick<TaskDto, 'title' | 'status' | 'priority'>>
  ) => Promise<boolean>;
  onDeleteTask?: (id: string) => void;
  onEditTask?: (task: TaskDto) => void;
  className?: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = 'createdAt' | 'dueDate' | 'priority' | 'title';

const filterButtons: { value: TaskFilter; label: string; count: (tasks: TaskDto[]) => number }[] = [
  { value: 'all', label: 'All', count: (t) => t.length },
  {
    value: 'active',
    label: 'Active',
    count: (t) => t.filter((task) => task.status !== TaskStatus.DONE).length,
  },
  {
    value: 'completed',
    label: 'Completed',
    count: (t) => t.filter((task) => task.status === TaskStatus.DONE).length,
  },
];

const sortOptions: { value: TaskSort; label: string }[] = [
  { value: 'createdAt', label: 'Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
];

/**
 * TaskList component for displaying and managing tasks.
 *
 * Features:
 * - Filter by status (all, active, completed)
 * - Sort by multiple fields
 * - Add new tasks
 * - Inline editing
 * - Bulk status updates
 * - Empty states
 * - Warm Claude theme styling
 */
export function TaskList({
  tasks,
  isLoading = false,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  className,
}: TaskListProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [sort, setSort] = useState<TaskSort>('createdAt');
  const [isAdding, setIsAdding] = useState(false);

  // Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return task.status !== TaskStatus.DONE;
    if (filter === 'completed') return task.status === TaskStatus.DONE;
    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'createdAt':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'dueDate':
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'priority':
        const priorityOrder = [Priority.NONE, Priority.LOW, Priority.MEDIUM, Priority.HIGH];
        return priorityOrder.indexOf(b.priority) - priorityOrder.indexOf(a.priority);
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Group tasks by status for better organization
  const activeTasks = sortedTasks.filter(
    (t) => t.status !== TaskStatus.DONE && t.status !== TaskStatus.CANCELLED
  );
  const completedTasks = sortedTasks.filter((t) => t.status === TaskStatus.DONE);

  const handleAddTask = useCallback(
    async (title: string) => {
      if (!onAddTask) return;
      setIsAdding(true);
      try {
        await onAddTask(title);
      } finally {
        setIsAdding(false);
      }
    },
    [onAddTask]
  );

  const handleUpdateTask = useCallback(
    async (id: string, updates: Partial<Pick<TaskDto, 'title' | 'status' | 'priority'>>) => {
      if (!onUpdateTask) return false;
      return await onUpdateTask(id, updates);
    },
    [onUpdateTask]
  );

  const handleDeleteTask = useCallback(
    (id: string) => {
      if (!onDeleteTask) return;
      onDeleteTask(id);
    },
    [onDeleteTask]
  );

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Header with filters and sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-background-secondary rounded-lg p-1">
          {filterButtons.map(({ value, label, count }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                filter === value
                  ? 'bg-background-card text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {label}
              <span className="ml-1.5 text-text-tertiary">{count(tasks)}</span>
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-tertiary">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as TaskSort)}
            className="px-3 py-2 bg-background-card border border-border-subtle rounded-lg text-sm text-text-primary focus:border-primary outline-none transition-all duration-200"
          >
            {sortOptions.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Add task input */}
      {onAddTask && (
        <AddTaskInput onAdd={handleAddTask} isLoading={isAdding} placeholder="Add a task..." />
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedTasks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-background-secondary flex items-center justify-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-text-tertiary"
            >
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks yet'}
          </h3>
          <p className="text-text-secondary">
            {filter === 'completed'
              ? 'Complete a task to see it here'
              : 'Add a task to get started'}
          </p>
        </div>
      )}

      {/* Task list */}
      {!isLoading && sortedTasks.length > 0 && (
        <div className="flex flex-col gap-2">
          {/* Active tasks */}
          {activeTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              {activeTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onUpdate={onUpdateTask ? handleUpdateTask : undefined}
                  onDelete={onDeleteTask ? handleDeleteTask : undefined}
                  onEdit={onEditTask}
                />
              ))}
            </div>
          )}

          {/* Completed tasks section */}
          {completedTasks.length > 0 && filter !== 'active' && (
            <div className="mt-4">
              <div className="flex items-center gap-2 px-2 mb-2">
                <div className="h-px flex-1 bg-border-subtle" />
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                  Completed ({completedTasks.length})
                </span>
                <div className="h-px flex-1 bg-border-subtle" />
              </div>
              <div className="flex flex-col gap-2">
                {completedTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={onUpdateTask ? handleUpdateTask : undefined}
                    onDelete={onDeleteTask ? handleDeleteTask : undefined}
                    onEdit={onEditTask}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
