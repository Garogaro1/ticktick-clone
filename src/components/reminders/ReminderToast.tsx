/**
 * ReminderToast Component
 *
 * In-app notification toast for fired reminders
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Clock, Check } from 'lucide-react';
import { ReminderDto } from '@/lib/reminders';
import { cn } from '@/lib/utils';

interface ReminderToastProps {
  reminder: ReminderDto;
  taskTitle: string;
  taskDueDate: Date | null;
  onDismiss: (reminderId: string) => void;
  onSnooze: (reminderId: string, minutes: number) => void;
  onMarkTaskComplete?: (taskId: string) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const SNOOZE_OPTIONS = [
  { label: '5 min', minutes: 5 },
  { label: '15 min', minutes: 15 },
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
];

export function ReminderToast({
  reminder,
  taskTitle,
  taskDueDate,
  onDismiss,
  onSnooze,
  onMarkTaskComplete,
  autoClose = true,
  autoCloseDelay = 10000,
}: ReminderToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!autoClose) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 1 - elapsed / autoCloseDelay);
      setProgress(remaining * 100);

      if (elapsed >= autoCloseDelay) {
        handleClose();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onDismiss(reminder.id), 300);
  };

  const handleSnooze = (minutes: number) => {
    onSnooze(reminder.id, minutes);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-md w-full transition-all duration-300',
        'bg-white rounded-xl shadow-2xl border border-amber-200 dark:bg-gray-800 dark:border-amber-900/50',
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      )}
    >
      {/* Progress Bar */}
      {autoClose && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-t-xl overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-full dark:bg-amber-900/30">
            <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-ring" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">Reminder</h4>
              <button
                onClick={handleClose}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1 truncate">
              {taskTitle}
            </p>

            {taskDueDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due: {taskDueDate.toLocaleString()}
              </p>
            )}

            {reminder.relativeOffset !== null && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {reminder.relativeOffset === 0
                  ? 'At due time'
                  : `${reminder.relativeOffset} minutes before due`}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4">
          {/* Snooze Options */}
          <div className="flex items-center gap-1 flex-1">
            {SNOOZE_OPTIONS.map((option) => (
              <button
                key={option.minutes}
                onClick={() => handleSnooze(option.minutes)}
                className="flex-1 px-2 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Dismiss Button */}
          <button
            onClick={handleClose}
            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            Dismiss
          </button>

          {/* Mark Complete */}
          {onMarkTaskComplete && (
            <button
              onClick={() => onMarkTaskComplete(reminder.taskId)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Done
            </button>
          )}
        </div>
      </div>

      {/* Bell Ring Animation CSS */}
      <style jsx>{`
        @keyframes ring {
          0%,
          100% {
            transform: rotate(0deg);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: rotate(-10deg);
          }
          20%,
          40%,
          60%,
          80% {
            transform: rotate(10deg);
          }
        }
        .animate-ring {
          animation: ring 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

/**
 * Toast Container for displaying multiple toasts
 */
interface ReminderToastContainerProps {
  toasts: Array<{
    reminder: ReminderDto;
    taskTitle: string;
    taskDueDate: Date | null;
  }>;
  onDismiss: (reminderId: string) => void;
  onSnooze: (reminderId: string, minutes: number) => void;
  onMarkTaskComplete?: (taskId: string) => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function ReminderToastContainer({
  toasts,
  onDismiss,
  onSnooze,
  onMarkTaskComplete,
  autoClose = true,
  autoCloseDelay = 10000,
}: ReminderToastContainerProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.reminder.id} className="pointer-events-auto">
          <ReminderToast
            reminder={toast.reminder}
            taskTitle={toast.taskTitle}
            taskDueDate={toast.taskDueDate}
            onDismiss={onDismiss}
            onSnooze={onSnooze}
            onMarkTaskComplete={onMarkTaskComplete}
            autoClose={autoClose}
            autoCloseDelay={autoCloseDelay}
          />
        </div>
      ))}
    </div>
  );
}
