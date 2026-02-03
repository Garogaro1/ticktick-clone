'use client';

import { useState, useCallback } from 'react';
import { TaskStatus } from '@prisma/client';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedTaskItem } from './AnimatedTaskItem';
import { AddTaskInput } from '@/components/tasks/AddTaskInput';
import { Spinner } from '@/components/ui/Spinner';
import { TagBadge } from '@/components/tags';
import { cn } from '@/lib/utils';
import type { TaskDto } from '@/lib/tasks/types';
import type { SortBy, SortOrder } from '@/hooks/useTasks';

export interface AnimatedTaskListProps {
  tasks: TaskDto[];
  isLoading?: boolean;
  onAddTask?: (title: string) => Promise<void>;
  onUpdateTask?: (
    id: string,
    updates: Partial<Pick<TaskDto, 'title' | 'status' | 'priority'>>
  ) => Promise<boolean>;
  onDeleteTask?: (id: string) => void;
  onEditTask?: (task: TaskDto) => void;
  onReorderTasks?: (updates: Array<{ id: string; sortOrder: number }>) => Promise<boolean>;
  activeTag?: { id: string; name: string; color: string | null } | null;
  onClearTagFilter?: () => void;
  sortBy?: SortBy;
  sortOrder?: SortOrder;
  onChangeSort?: (sortBy: SortBy, sortOrder: SortOrder) => void;
  className?: string;
}

export type TaskFilter = 'all' | 'active' | 'completed';
export type TaskSort = SortBy;

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
  { value: 'sortOrder', label: 'Custom Order' },
  { value: 'createdAt', label: 'Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'title', label: 'Title' },
  { value: 'updatedAt', label: 'Modified' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

/**
 * AnimatedTaskList component with smooth enter/exit animations.
 *
 * Features:
 * - AnimatePresence for task list animations
 * - Staggered entrance for new tasks
 * - Smooth exit animations on delete
 * - Animated checkbox with confetti
 * - Filter and sort controls
 * - Empty states with animations
 * - Warm Claude theme styling
 */
export function AnimatedTaskList({
  tasks,
  isLoading = false,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onEditTask,
  onReorderTasks, // eslint-disable-line @typescript-eslint/no-unused-vars
  activeTag,
  onClearTagFilter,
  sortBy = 'sortOrder',
  sortOrder = 'asc',
  onChangeSort,
  className,
}: AnimatedTaskListProps) {
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [isAdding, setIsAdding] = useState(false);

  // Filter tasks (client-side for status, since API handles list/tag filters)
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return task.status !== TaskStatus.DONE;
    if (filter === 'completed') return task.status === TaskStatus.DONE;
    return true;
  });

  // Tasks are already sorted from the API, just group them
  const activeTasks = filteredTasks.filter(
    (t) => t.status !== TaskStatus.DONE && t.status !== TaskStatus.CANCELLED
  );
  const completedTasks = filteredTasks.filter((t) => t.status === TaskStatus.DONE);

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
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Filter tabs with active tag indicator */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-background-secondary rounded-lg p-1">
            {filterButtons.map(({ value, label, count }) => (
              <motion.button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative',
                  filter === value
                    ? 'bg-background-card text-text-primary shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {label}
                <span className="ml-1.5 text-text-tertiary">{count(tasks)}</span>
                {filter === value && (
                  <motion.div
                    className="absolute inset-0 bg-background-card rounded-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Active tag filter indicator */}
          {activeTag && (
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <span className="text-sm text-text-tertiary">Tag:</span>
              <button
                onClick={onClearTagFilter}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-background-card border border-border-subtle hover:border-border-default transition-all duration-200 group"
              >
                <TagBadge tag={activeTag} variant="compact" />
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-tertiary group-hover:text-text-primary transition-colors"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </motion.div>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-tertiary">Sort by:</span>
          <div className="flex items-center gap-1">
            <select
              value={sortBy}
              onChange={(e) => onChangeSort?.(e.target.value as TaskSort, sortOrder)}
              className="px-3 py-2 bg-background-card border border-border-subtle rounded-l-lg text-sm text-text-primary focus:border-primary outline-none transition-all duration-200"
            >
              {sortOptions.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <motion.button
              onClick={() => onChangeSort?.(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-background-card border border-l-0 border-border-subtle rounded-r-lg text-sm text-text-primary hover:bg-background-secondary focus:border-primary outline-none transition-all duration-200"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {sortOrder === 'asc' ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 5v14" />
                  <path d="m19 12-7 7-7-7" />
                </svg>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Add task input */}
      {onAddTask && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AddTaskInput onAdd={handleAddTask} isLoading={isAdding} placeholder="Add a task..." />
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading && (
        <motion.div
          className="flex items-center justify-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <Spinner size="lg" />
        </motion.div>
      )}

      {/* Empty state */}
      {!isLoading && filteredTasks.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring' as const, stiffness: 200, damping: 20 }}
        >
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
            {activeTag
              ? 'No tasks with this tag'
              : filter === 'completed'
                ? 'No completed tasks yet'
                : 'No tasks yet'}
          </h3>
          <p className="text-text-secondary">
            {activeTag
              ? `Try selecting a different tag or clear the filter`
              : filter === 'completed'
                ? 'Complete a task to see it here'
                : 'Add a task to get started'}
          </p>
        </motion.div>
      )}

      {/* Task list with animations */}
      {!isLoading && filteredTasks.length > 0 && (
        <motion.div
          className="flex flex-col gap-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Active tasks */}
          {activeTasks.length > 0 && (
            <div className="flex flex-col gap-2">
              <AnimatePresence mode="popLayout">
                {activeTasks.map((task, index) => (
                  <AnimatedTaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onUpdate={onUpdateTask ? handleUpdateTask : undefined}
                    onDelete={onDeleteTask ? handleDeleteTask : undefined}
                    onEdit={onEditTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Completed tasks section */}
          {completedTasks.length > 0 && filter !== 'active' && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 px-2 mb-2">
                <div className="h-px flex-1 bg-border-subtle" />
                <span className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
                  Completed ({completedTasks.length})
                </span>
                <div className="h-px flex-1 bg-border-subtle" />
              </div>
              <div className="flex flex-col gap-2">
                <AnimatePresence mode="popLayout">
                  {completedTasks.map((task) => (
                    <AnimatedTaskItem
                      key={task.id}
                      task={task}
                      onUpdate={onUpdateTask ? handleUpdateTask : undefined}
                      onDelete={onDeleteTask ? handleDeleteTask : undefined}
                      onEdit={onEditTask}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
