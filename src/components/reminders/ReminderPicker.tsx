/**
 * ReminderPicker Component
 *
 * Dropdown for adding reminders with preset options
 */

'use client';

import { useState, useCallback } from 'react';
import { Bell, Plus, ChevronDown } from 'lucide-react';
import { ReminderType, ReminderPreset, REMINDER_TYPE_LABELS } from '@/lib/reminders';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ReminderPickerProps {
  taskId: string; // Used by parent component
  taskDueDate: Date | null;
  onAdd: (
    preset: ReminderPreset,
    customFireAt?: Date,
    customRelativeOffset?: number | null
  ) => Promise<boolean>;
  className?: string;
}

interface ReminderOption {
  key: ReminderPreset;
  label: string;
  description?: string;
  disabled?: boolean;
}

const REMINDER_OPTIONS: ReminderOption[] = [
  { key: 'at_deadline', label: 'At time of task', description: 'When task is due' },
  { key: '5min_before', label: '5 minutes before' },
  { key: '15min_before', label: '15 minutes before' },
  { key: '30min_before', label: '30 minutes before' },
  { key: '1hour_before', label: '1 hour before' },
  { key: '1day_before', label: '1 day before' },
  { key: 'custom', label: 'Custom time...' },
];

export function ReminderPicker({
  taskId: _taskId,
  taskDueDate,
  onAdd,
  className,
}: ReminderPickerProps) {
  // taskId is used by parent component
  void _taskId;
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customTime, setCustomTime] = useState('');
  const [reminderType, setReminderType] = useState<ReminderType>('IN_APP');

  const hasDueDate = !!taskDueDate;

  const handleAddReminder = useCallback(
    async (preset: ReminderPreset, customFireAt?: Date, customRelativeOffset?: number | null) => {
      setIsAdding(true);
      try {
        const success = await onAdd(preset, customFireAt, customRelativeOffset);
        if (success) {
          setIsOpen(false);
          setShowCustomTime(false);
          setCustomTime('');
        }
      } finally {
        setIsAdding(false);
      }
    },
    [onAdd]
  );

  const handleCustomTimeSubmit = useCallback(() => {
    if (!customTime) return;

    const date = new Date(customTime);
    if (isNaN(date.getTime())) return;

    // Calculate relative offset if task has due date
    let relativeOffset: number | null = null;
    if (taskDueDate) {
      const diffMs = taskDueDate.getTime() - date.getTime();
      relativeOffset = Math.round(diffMs / 60000); // Convert to minutes
    }

    handleAddReminder('custom', date, relativeOffset);
  }, [customTime, taskDueDate, handleAddReminder]);

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:text-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
      >
        <Bell className="w-4 h-4" />
        <span>Add Reminder</span>
        <ChevronDown className="w-4 h-4 ml-auto" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute z-20 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            {/* Reminder Type Selector */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminder Type
              </label>
              <div className="flex gap-2">
                {Object.entries(REMINDER_TYPE_LABELS).map(([type, label]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setReminderType(type as ReminderType)}
                    className={cn(
                      'flex-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
                      reminderType === type
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Options */}
            <div className="p-2 max-h-64 overflow-y-auto">
              {REMINDER_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    if (option.key === 'custom') {
                      setShowCustomTime(true);
                    } else {
                      handleAddReminder(option.key);
                    }
                  }}
                  disabled={!hasDueDate && option.key !== 'custom'}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    isAdding && 'opacity-50 cursor-wait'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-gray-500" />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {option.label}
                      </div>
                      {option.description && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {option.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Time Input */}
            {showCustomTime && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                />
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={handleCustomTimeSubmit}
                    disabled={!customTime || isAdding}
                    className="flex-1 px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCustomTime(false);
                      setCustomTime('');
                    }}
                    className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Warning if no due date */}
            {!hasDueDate && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  <Bell className="w-3 h-3 inline mr-1" />
                  Task has no due date. Use custom time for reminders.
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
