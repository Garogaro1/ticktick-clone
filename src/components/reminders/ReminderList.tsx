/**
 * ReminderList Component
 *
 * Displays all reminders for a task with actions
 */

'use client';

import { useState } from 'react';
import { Bell, Trash2, Clock, X, RotateCcw } from 'lucide-react';
import { ReminderDto, ReminderType, REMINDER_TYPE_LABELS } from '@/lib/reminders';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface ReminderListProps {
  reminders: ReminderDto[];
  taskTitle: string;
  taskDueDate: Date | null;
  onDismiss: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSnooze: (id: string, minutes: number) => Promise<void>;
  className?: string;
}

const SNOOZE_OPTIONS = [
  { label: '5 minutes', minutes: 5 },
  { label: '15 minutes', minutes: 15 },
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '1 day', minutes: 1440 },
];

function ReminderTypeIcon({ type }: { type: ReminderType }) {
  switch (type) {
    case 'PUSH':
      return <Bell className="w-4 h-4" />;
    case 'EMAIL':
      return <Clock className="w-4 h-4" />;
    default:
      return <Bell className="w-4 h-4" />;
  }
}

export function ReminderList({
  reminders,
  taskTitle: _taskTitle,
  taskDueDate,
  onDismiss,
  onDelete,
  onSnooze,
  className,
}: ReminderListProps) {
  const [snoozeMenuOpen, setSnoozeMenuOpen] = useState<string | null>(null);

  // taskTitle is passed for potential future use
  void _taskTitle;

  if (reminders.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No reminders set for this task</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {reminders.map((reminder) => {
        const fireTime =
          reminder.status === 'SNOOZED' && reminder.snoozedUntil
            ? reminder.snoozedUntil
            : reminder.fireAt;

        const now = new Date();
        const isOverdue = fireTime < now && reminder.status === 'PENDING';
        const isSnoozed = reminder.status === 'SNOOZED';

        return (
          <div
            key={reminder.id}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border transition-colors',
              isOverdue
                ? 'border-red-200 bg-red-50 dark:border-red-900/30 dark:bg-red-900/10'
                : isSnoozed
                  ? 'border-amber-200 bg-amber-50 dark:border-amber-900/30 dark:bg-amber-900/10'
                  : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
            )}
          >
            {/* Icon */}
            <div
              className={cn(
                'p-2 rounded-full',
                isOverdue
                  ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                  : isSnoozed
                    ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              <ReminderTypeIcon type={reminder.type} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {REMINDER_TYPE_LABELS[reminder.type]}
                </span>
                <span
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    reminder.status === 'DISMISSED'
                      ? 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      : isSnoozed
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                  )}
                >
                  {reminder.status === 'DISMISSED'
                    ? 'Dismissed'
                    : isSnoozed
                      ? 'Snoozed'
                      : isOverdue
                        ? 'Overdue'
                        : 'Pending'}
                </span>
              </div>

              <div className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                {format(fireTime, 'MMM d, h:mm a')}
                <span className="ml-2 text-xs text-gray-500">
                  ({formatDistanceToNow(fireTime, { addSuffix: true })})
                </span>
              </div>

              {reminder.relativeOffset !== null && taskDueDate && (
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                  {reminder.relativeOffset === 0
                    ? 'At task due time'
                    : `${reminder.relativeOffset} minutes before due date`}
                </div>
              )}

              {reminder.snoozeCount > 0 && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                  Snoozed {reminder.snoozeCount} time{reminder.snoozeCount > 1 ? 's' : ''}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {reminder.status !== 'DISMISSED' && (
                <>
                  {/* Snooze Button */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setSnoozeMenuOpen(snoozeMenuOpen === reminder.id ? null : reminder.id)
                      }
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-amber-900/20"
                      title="Snooze"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>

                    {/* Snooze Dropdown */}
                    {snoozeMenuOpen === reminder.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setSnoozeMenuOpen(null)}
                        />
                        <div className="absolute right-0 z-20 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                          {SNOOZE_OPTIONS.map((option) => (
                            <button
                              key={option.minutes}
                              type="button"
                              onClick={() => {
                                onSnooze(reminder.id, option.minutes);
                                setSnoozeMenuOpen(null);
                              }}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Dismiss Button */}
                  <button
                    type="button"
                    onClick={() => onDismiss(reminder.id)}
                    className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-green-900/20"
                    title="Dismiss"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => onDelete(reminder.id)}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors dark:text-gray-400 dark:hover:bg-red-900/20"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
