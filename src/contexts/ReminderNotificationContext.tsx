/**
 * Reminder Notification Context
 *
 * Global provider for managing reminder notifications
 * Polls for due reminders and displays toasts
 */

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { ReminderDto } from '@/lib/reminders';
import { ReminderToastContainer } from '@/components/reminders';

interface NotificationToast {
  reminder: ReminderDto;
  taskTitle: string;
  taskDueDate: Date | null;
}

interface ReminderNotificationContextValue {
  activeToasts: NotificationToast[];
  dismissToast: (reminderId: string) => void;
  snoozeToast: (reminderId: string, minutes: number) => Promise<void>;
  addToast: (toast: NotificationToast) => void;
}

const ReminderNotificationContext = createContext<ReminderNotificationContextValue | undefined>(
  undefined
);

const POLL_INTERVAL = 30000; // 30 seconds
const SHOWN_REMINDERS_KEY = 'shown_reminders';

export function ReminderNotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [activeToasts, setActiveToasts] = useState<NotificationToast[]>([]);
  const [shownReminderIds, setShownReminderIds] = useState<Set<string>>(new Set());

  // Load shown reminders from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHOWN_REMINDERS_KEY);
      if (stored) {
        setShownReminderIds(new Set(JSON.parse(stored)));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Save shown reminders to localStorage
  const updateShownReminders = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(SHOWN_REMINDERS_KEY, JSON.stringify(Array.from(ids)));
    } catch {
      // Ignore localStorage errors
    }
    setShownReminderIds(ids);
  }, []);

  // Add a toast manually
  const addToast = useCallback((toast: NotificationToast) => {
    setActiveToasts((prev) => {
      // Check if already in toasts
      if (prev.some((t) => t.reminder.id === toast.reminder.id)) {
        return prev;
      }
      return [...prev, toast];
    });
  }, []);

  // Dismiss a toast
  const dismissToast = useCallback(
    (reminderId: string) => {
      setActiveToasts((prev) => prev.filter((t) => t.reminder.id !== reminderId));

      // Mark as shown so we don't show it again
      setShownReminderIds((prev) => {
        const updated = new Set(prev);
        updated.add(reminderId);
        updateShownReminders(updated);
        return updated;
      });
    },
    [updateShownReminders]
  );

  // Snooze a toast
  const snoozeToast = useCallback(async (reminderId: string, minutes: number) => {
    try {
      const response = await fetch(`/api/reminders/${reminderId}/snooze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes }),
      });

      if (response.ok) {
        setActiveToasts((prev) => prev.filter((t) => t.reminder.id !== reminderId));
      }
    } catch (error) {
      console.error('Failed to snooze reminder:', error);
    }
  }, []);

  // Poll for due reminders
  useEffect(() => {
    if (!session?.user?.id) return;

    const checkForReminders = async () => {
      try {
        const response = await fetch(`/api/reminders?includePending=true&limit=20`);
        if (!response.ok) return;

        const data = await response.json();
        const pendingReminders: ReminderDto[] = data.reminders || [];

        const now = new Date();
        const newToasts: NotificationToast[] = [];

        for (const reminder of pendingReminders) {
          // Skip if already shown
          if (shownReminderIds.has(reminder.id)) {
            continue;
          }

          // Check if reminder should fire
          const fireTime =
            reminder.status === 'SNOOZED' && reminder.snoozedUntil
              ? new Date(reminder.snoozedUntil)
              : new Date(reminder.fireAt);

          if (fireTime <= now) {
            // Mark as sent
            await fetch(`/api/reminders/${reminder.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'SENT' }),
            });

            // Fetch task details
            const taskResponse = await fetch(`/api/tasks/${reminder.taskId}`);
            if (taskResponse.ok) {
              const taskData = await taskResponse.json();
              newToasts.push({
                reminder,
                taskTitle: taskData.task?.title || 'Untitled Task',
                taskDueDate: taskData.task?.dueDate ? new Date(taskData.task.dueDate) : null,
              });
            }

            // Mark as shown
            setShownReminderIds((prev) => {
              const updated = new Set(prev);
              updated.add(reminder.id);
              updateShownReminders(updated);
              return updated;
            });
          }
        }

        // Add new toasts
        if (newToasts.length > 0) {
          setActiveToasts((prev) => {
            const existingIds = new Set(prev.map((t) => t.reminder.id));
            const uniqueNewToasts = newToasts.filter((t) => !existingIds.has(t.reminder.id));
            return [...prev, ...uniqueNewToasts];
          });

          // Play notification sound if available
          if (typeof window !== 'undefined' && 'Audio' in window) {
            try {
              const audio = new Audio('/sounds/notification.mp3');
              audio.volume = 0.5;
              audio.play().catch(() => {
                // Auto-play was prevented, ignore
              });
            } catch {
              // Sound not available, ignore
            }
          }

          // Request browser notification permission
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }

          // Show browser notification if permitted
          if ('Notification' in window && Notification.permission === 'granted') {
            newToasts.forEach((toast) => {
              new Notification('Task Reminder', {
                body: toast.taskTitle,
                icon: '/icon-192.png',
                tag: toast.reminder.id,
              });
            });
          }
        }
      } catch (error) {
        console.error('Failed to check for reminders:', error);
      }
    };

    // Check immediately on mount
    checkForReminders();

    // Set up polling
    const interval = setInterval(checkForReminders, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [session?.user?.id, shownReminderIds, updateShownReminders]);

  const value: ReminderNotificationContextValue = {
    activeToasts,
    dismissToast,
    snoozeToast,
    addToast,
  };

  return (
    <ReminderNotificationContext.Provider value={value}>
      {children}
      <ReminderToastContainer
        toasts={activeToasts}
        onDismiss={dismissToast}
        onSnooze={snoozeToast}
      />
    </ReminderNotificationContext.Provider>
  );
}

export function useReminderNotifications() {
  const context = useContext(ReminderNotificationContext);
  if (!context) {
    throw new Error('useReminderNotifications must be used within ReminderNotificationProvider');
  }
  return context;
}
