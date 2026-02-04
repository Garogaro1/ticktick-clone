/**
 * Batch Reminder Operations API Route
 *
 * POST /api/reminders/batch - Batch operations (delete, dismiss, markSent)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { deleteReminders, dismissReminder, markReminderSent } from '@/lib/reminders/service';
import { BatchReminderSchema } from '@/lib/reminders/schemas';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const result = BatchReminderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 }
      );
    }

    const { operation, reminderIds } = result.data;
    let count = 0;
    const reminders: unknown[] = [];

    switch (operation) {
      case 'delete':
        count = await deleteReminders(reminderIds, session.user.id);
        break;

      case 'dismiss':
        // Dismiss each reminder individually
        for (const id of reminderIds) {
          const reminder = await dismissReminder(id, session.user.id);
          if (reminder) {
            reminders.push(reminder);
            count++;
          }
        }
        break;

      case 'markSent':
        // Mark each as sent individually
        for (const id of reminderIds) {
          const reminder = await markReminderSent(id, session.user.id);
          if (reminder) {
            reminders.push(reminder);
            count++;
          }
        }
        break;

      default:
        return NextResponse.json({ error: 'Invalid operation' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      operation,
      count,
      reminders: operation === 'delete' ? undefined : reminders,
    });
  } catch (error) {
    logger.error('Error performing batch operation', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Failed to perform batch operation',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
