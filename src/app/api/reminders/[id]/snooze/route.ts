/**
 * Snooze Reminder API Route
 *
 * POST /api/reminders/[id]/snooze - Snooze a reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { snoozeReminder } from '@/lib/reminders/service';
import { SnoozeReminderSchema } from '@/lib/reminders/schemas';
import { logger } from '@/lib/logger';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const result = SnoozeReminderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 }
      );
    }

    const reminder = await snoozeReminder(id, session.user.id, result.data);

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    logger.error('Error snoozing reminder', error instanceof Error ? error : undefined);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Reminder not found or access denied') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Can only snooze')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('must be in the future')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to snooze reminder',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
