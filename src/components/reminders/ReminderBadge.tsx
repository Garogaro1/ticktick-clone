/**
 * ReminderBadge Component
 *
 * Displays reminder status on task items
 */

'use client';

import { memo } from 'react';
import { Bell, BellOff } from 'lucide-react';
import { ReminderDto } from '@/lib/reminders';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ReminderBadgeProps {
  reminders: ReminderDto[];
  className?: string;
}

export const ReminderBadge = memo(function ReminderBadge({
  reminders,
  className,
}: ReminderBadgeProps) {
  // Filter to show only pending/snoozed reminders
  const activeReminders = reminders.filter((r) => r.status === 'PENDING' || r.status === 'SNOOZED');

  if (activeReminders.length === 0) {
    return null;
  }

  // Find the next upcoming reminder
  const now = new Date();
  const nextReminder = activeReminders
    .filter((r) => {
      const fireTime = r.status === 'SNOOZED' && r.snoozedUntil ? r.snoozedUntil : r.fireAt;
      return fireTime > now;
    })
    .sort((a, b) => {
      const aTime = a.status === 'SNOOZED' && a.snoozedUntil ? a.snoozedUntil : a.fireAt;
      const bTime = b.status === 'SNOOZED' && b.snoozedUntil ? b.snoozedUntil : b.fireAt;
      return aTime.getTime() - bTime.getTime();
    })[0];

  if (!nextReminder) {
    return null;
  }

  const fireTime =
    nextReminder.status === 'SNOOZED' && nextReminder.snoozedUntil
      ? nextReminder.snoozedUntil
      : nextReminder.fireAt;

  const isOverdue = fireTime < now;
  const isSnoozed = nextReminder.status === 'SNOOZED';

  const timeString = formatDistanceToNow(fireTime);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
        isSnoozed
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
          : isOverdue
            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        className
      )}
      title={`Reminder: ${fireTime.toLocaleString()}`}
    >
      {isSnoozed ? (
        <>
          <BellOff className="w-3 h-3" />
          <span>Snoozed {timeString}</span>
        </>
      ) : (
        <>
          <Bell className="w-3 h-3" />
          <span>{isOverdue ? 'Overdue' : `in ${timeString}`}</span>
        </>
      )}
      {activeReminders.length > 1 && (
        <span className="ml-0.5 opacity-75">+{activeReminders.length - 1}</span>
      )}
    </div>
  );
});
