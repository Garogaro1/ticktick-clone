/**
 * useReminders Hook
 *
 * Custom hook for reminder state management with optimistic updates
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ReminderDto, ReminderType, ReminderPreset, REMINDER_PRESETS } from '@/lib/reminders';

interface UseRemindersOptions {
  autoFetch?: boolean;
  taskId?: string;
  status?: string;
  includePending?: boolean;
}

interface UseRemindersResult {
  reminders: ReminderDto[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addReminder: (
    taskId: string,
    preset?: ReminderPreset,
    customFireAt?: Date,
    customRelativeOffset?: number | null,
    type?: ReminderType
  ) => Promise<ReminderDto | null>;
  addQuickReminder: (taskId: string, minutesBefore: number) => Promise<ReminderDto | null>;
  updateReminder: (id: string, updates: Partial<ReminderDto>) => Promise<boolean>;
  deleteReminder: (id: string) => Promise<boolean>;
  dismissReminder: (id: string) => Promise<boolean>;
  snoozeReminder: (id: string, minutes: number) => Promise<boolean>;
  snoozeReminderUntil: (id: string, until: Date) => Promise<boolean>;
}

export function useReminders(options: UseRemindersOptions = {}): UseRemindersResult {
  const { autoFetch = true, taskId, status, includePending } = options;

  const [reminders, setReminders] = useState<ReminderDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    if (!autoFetch) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (taskId) params.append('taskId', taskId);
      if (status) params.append('status', status);
      if (includePending) params.append('includePending', 'true');

      const response = await fetch(`/api/reminders?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reminders');
      }

      const data = await response.json();
      setReminders(data.reminders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [autoFetch, taskId, status, includePending]);

  // Add reminder with preset
  const addReminder = useCallback(
    async (
      targetTaskId: string,
      preset: ReminderPreset = '15min_before',
      customFireAt?: Date,
      customRelativeOffset?: number | null,
      type: ReminderType = 'IN_APP'
    ): Promise<ReminderDto | null> => {
      setError(null);

      try {
        let fireAt: Date | undefined;
        let relativeOffset: number | null | undefined;

        if (preset === 'custom' && customFireAt) {
          fireAt = customFireAt;
        } else if (preset === 'custom' && customRelativeOffset !== undefined) {
          relativeOffset = customRelativeOffset;
        } else {
          const presetData = REMINDER_PRESETS[preset];
          relativeOffset = presetData.minutes;
        }

        const response = await fetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            taskId: targetTaskId,
            type,
            fireAt,
            relativeOffset,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create reminder');
        }

        const data = await response.json();
        const newReminder = data.reminder;

        // Optimistic update
        setReminders((prev) => [...prev, newReminder]);
        return newReminder;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        return null;
      }
    },
    []
  );

  // Add quick reminder (just specify minutes before due date)
  const addQuickReminder = useCallback(
    async (targetTaskId: string, minutesBefore: number): Promise<ReminderDto | null> => {
      return addReminder(targetTaskId, 'custom', undefined, minutesBefore);
    },
    [addReminder]
  );

  // Update reminder
  const updateReminder = useCallback(
    async (id: string, updates: Partial<ReminderDto>): Promise<boolean> => {
      setError(null);

      // Optimistic update
      const previousReminders = [...reminders];
      setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));

      try {
        const response = await fetch(`/api/reminders/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          throw new Error('Failed to update reminder');
        }

        const data = await response.json();
        setReminders((prev) => prev.map((r) => (r.id === id ? data.reminder : r)));
        return true;
      } catch (err) {
        // Rollback
        setReminders(previousReminders);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [reminders]
  );

  // Delete reminder
  const deleteReminder = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);

      // Optimistic update
      const previousReminders = [...reminders];
      setReminders((prev) => prev.filter((r) => r.id !== id));

      try {
        const response = await fetch(`/api/reminders/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete reminder');
        }

        return true;
      } catch (err) {
        // Rollback
        setReminders(previousReminders);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [reminders]
  );

  // Dismiss reminder
  const dismissReminder = useCallback(
    async (id: string): Promise<boolean> => {
      setError(null);

      // Optimistic update
      const previousReminders = [...reminders];
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: 'DISMISSED' as const, dismissedAt: new Date() } : r
        )
      );

      try {
        const response = await fetch(`/api/reminders/${id}/dismiss`, {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to dismiss reminder');
        }

        const data = await response.json();
        setReminders((prev) => prev.map((r) => (r.id === id ? data.reminder : r)));
        return true;
      } catch (err) {
        // Rollback
        setReminders(previousReminders);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [reminders]
  );

  // Snooze reminder for N minutes
  const snoozeReminder = useCallback(
    async (id: string, minutes: number): Promise<boolean> => {
      setError(null);

      const snoozedUntil = new Date();
      snoozedUntil.setMinutes(snoozedUntil.getMinutes() + minutes);

      // Optimistic update
      const previousReminders = [...reminders];
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'SNOOZED' as const,
                snoozedUntil,
                snoozeCount: r.snoozeCount + 1,
              }
            : r
        )
      );

      try {
        const response = await fetch(`/api/reminders/${id}/snooze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes }),
        });

        if (!response.ok) {
          throw new Error('Failed to snooze reminder');
        }

        const data = await response.json();
        setReminders((prev) => prev.map((r) => (r.id === id ? data.reminder : r)));
        return true;
      } catch (err) {
        // Rollback
        setReminders(previousReminders);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [reminders]
  );

  // Snooze reminder until specific time
  const snoozeReminderUntil = useCallback(
    async (id: string, until: Date): Promise<boolean> => {
      setError(null);

      // Optimistic update
      const previousReminders = [...reminders];
      setReminders((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status: 'SNOOZED' as const,
                snoozedUntil: until,
                snoozeCount: r.snoozeCount + 1,
              }
            : r
        )
      );

      try {
        const response = await fetch(`/api/reminders/${id}/snooze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ until: until.toISOString() }),
        });

        if (!response.ok) {
          throw new Error('Failed to snooze reminder');
        }

        const data = await response.json();
        setReminders((prev) => prev.map((r) => (r.id === id ? data.reminder : r)));
        return true;
      } catch (err) {
        // Rollback
        setReminders(previousReminders);
        setError(err instanceof Error ? err.message : 'Unknown error');
        return false;
      }
    },
    [reminders]
  );

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return {
    reminders,
    isLoading,
    error,
    refetch: fetchReminders,
    addReminder,
    addQuickReminder,
    updateReminder,
    deleteReminder,
    dismissReminder,
    snoozeReminder,
    snoozeReminderUntil,
  };
}

/**
 * Hook for reminders of a specific task
 */
export function useTaskReminders(taskId: string | undefined) {
  return useReminders({
    autoFetch: !!taskId,
    taskId,
  });
}
