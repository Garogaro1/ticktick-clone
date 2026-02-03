'use client';

import { useState, useRef, useEffect, KeyboardEvent, MouseEvent } from 'react';
import { motion } from 'framer-motion';
import { TaskStatus, Priority } from '@prisma/client';
import { cn } from '@/lib/utils';
import { TagBadge } from '@/components/tags';
import { ReminderBadge } from '@/components/reminders';
import { AnimatedCheckbox } from './AnimatedCheckbox';
import type { TaskDto } from '@/lib/tasks/types';

export interface DragHandleProps {
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners?: React.HTMLAttributes<HTMLElement>;
  isDragging: boolean;
}

export interface AnimatedTaskItemProps {
  task: TaskDto;
  onUpdate?: (
    id: string,
    updates: Partial<Pick<TaskDto, 'title' | 'status' | 'priority'>>
  ) => Promise<boolean>;
  onDelete?: (id: string) => void;
  onEdit?: (task: TaskDto) => void;
  dragHandleProps?: DragHandleProps;
  isLoading?: boolean;
  className?: string;
  index?: number;
}

const priorityConfig: Record<Priority, { color: string; label: string }> = {
  [Priority.NONE]: { color: 'text-text-tertiary', label: '' },
  [Priority.LOW]: { color: 'text-text-tertiary', label: 'Low' },
  [Priority.MEDIUM]: { color: 'text-warning', label: 'Medium' },
  [Priority.HIGH]: { color: 'text-error', label: 'High' },
};

/**
 * AnimatedTaskItem component with smooth enter/exit animations.
 *
 * Features:
 * - AnimatePresence for list item animations
 * - AnimatedCheckbox with confetti
 * - Smooth slide-in/slide-out on add/delete
 * - Stagger animations for natural feel
 * - Warm Claude theme styling
 */
export function AnimatedTaskItem({
  task,
  onUpdate,
  onDelete,
  onEdit,
  dragHandleProps,
  isLoading = false,
  className,
}: AnimatedTaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDone = task.status === TaskStatus.DONE;
  const isCancelled = task.status === TaskStatus.CANCELLED;
  const isInactive = isDone || isCancelled;
  const priority = priorityConfig[task.priority];
  const hasDueDate =
    task.dueDate && new Date(task.dueDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;
  const hasSubtasks = (task._count?.subtasks || 0) > 0;

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleStatusToggle = async () => {
    if (!onUpdate || isLoading) return;
    const newStatus = isDone ? TaskStatus.TODO : TaskStatus.DONE;
    await onUpdate(task.id, { status: newStatus });
  };

  const handleStartEdit = () => {
    if (!onUpdate || isLoading) return;
    setIsEditing(true);
    setEditValue(task.title);
  };

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || !onUpdate) {
      setIsEditing(false);
      setEditValue(task.title);
      return;
    }

    if (trimmed !== task.title) {
      await onUpdate(task.id, { title: trimmed });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditValue(task.title);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const handleClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    if (onEdit) {
      onEdit(task);
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return null;
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
        mass: 0.8,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <motion.div
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={cn(
        'group flex items-center gap-3 px-4 py-3 bg-background-card rounded-lg border',
        'hover:border-border-default hover:shadow-sm',
        'transition-all duration-200',
        isEditing && 'border-primary ring-1 ring-primary/20',
        isInactive && 'opacity-60 bg-background-secondary',
        isOverdue && 'border-error/30 bg-error/5',
        isLoading && 'opacity-50 pointer-events-none',
        dragHandleProps?.isDragging && 'opacity-50 shadow-md',
        className
      )}
      onClick={handleClick}
      style={{ zIndex: isEditing ? 10 : 1 }}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <button
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
          className={cn(
            'flex-shrink-0 p-1 text-text-tertiary hover:text-text-primary cursor-grab active:cursor-grabbing rounded',
            'hover:bg-background-secondary transition-colors'
          )}
          aria-label="Drag to reorder"
        >
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
            <circle cx="9" cy="12" r="1" />
            <circle cx="9" cy="5" r="1" />
            <circle cx="9" cy="19" r="1" />
            <circle cx="15" cy="12" r="1" />
            <circle cx="15" cy="5" r="1" />
            <circle cx="15" cy="19" r="1" />
          </svg>
        </button>
      )}

      {/* Animated Checkbox */}
      <AnimatedCheckbox
        checked={isDone}
        onChange={handleStatusToggle}
        disabled={isLoading}
        isLoading={isLoading}
        showConfetti={!isDone}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSaveEdit}
            className="w-full bg-transparent outline-none text-text-primary"
          />
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <motion.span
              className={cn(
                'text-base',
                isDone ? 'line-through text-text-tertiary' : 'text-text-primary',
                isCancelled && 'line-through text-text-tertiary'
              )}
              animate={{
                opacity: isDone ? 0.6 : 1,
                textDecoration: isDone ? 'line-through' : 'none',
              }}
              transition={{ duration: 0.2 }}
            >
              {task.title}
            </motion.span>

            {/* Priority badge */}
            {task.priority !== Priority.NONE && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  priority.color,
                  task.priority === Priority.HIGH && 'bg-error/10',
                  task.priority === Priority.MEDIUM && 'bg-warning/10',
                  task.priority === Priority.LOW && 'bg-text-tertiary/10'
                )}
              >
                {priority.label}
              </motion.span>
            )}

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {task.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} variant="compact" />
                ))}
              </div>
            )}

            {/* Due date */}
            {hasDueDate && (
              <span
                className={cn(
                  'text-xs flex items-center gap-1',
                  isOverdue ? 'text-error' : 'text-text-tertiary'
                )}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(task.dueDate)}
              </span>
            )}

            {/* Subtasks count */}
            {hasSubtasks && (
              <span className="text-xs text-text-tertiary flex items-center gap-1">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                {task._count?.subtasks}
              </span>
            )}

            {/* Reminders badge */}
            {task.reminders && task.reminders.length > 0 && (
              <ReminderBadge reminders={task.reminders} />
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <motion.div
        className={cn('flex items-center gap-1', isEditing && 'opacity-0')}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Edit button */}
        {onUpdate && !isEditing && (
          <motion.button
            onClick={handleStartEdit}
            className="p-2 text-text-tertiary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-all duration-200"
            aria-label="Edit task"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </motion.button>
        )}

        {/* Delete button */}
        {onDelete && (
          <motion.button
            onClick={() => onDelete(task.id)}
            className="p-2 text-text-tertiary hover:text-error hover:bg-error/10 rounded-lg transition-all duration-200"
            aria-label="Delete task"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
