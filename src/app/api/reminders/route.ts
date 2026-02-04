/**
 * Reminder API Routes
 *
 * GET /api/reminders - List reminders with filtering
 * POST /api/reminders - Create a new reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getReminders, createReminder, createReminders } from '@/lib/reminders/service';
import {
  CreateReminderSchema,
  ReminderQuerySchema,
  CreateRemindersSchema,
} from '@/lib/reminders/schemas';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const queryResult = ReminderQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: queryResult.error.issues },
        { status: 400 }
      );
    }

    const result = await getReminders(session.user.id, queryResult.data);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error fetching reminders', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Failed to fetch reminders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if creating multiple reminders
    const isBatch = body.reminders && Array.isArray(body.reminders);

    if (isBatch) {
      const batchResult = CreateRemindersSchema.safeParse(body);
      if (!batchResult.success) {
        return NextResponse.json(
          { error: 'Invalid request body', issues: batchResult.error.issues },
          { status: 400 }
        );
      }

      const reminders = await createReminders(
        session.user.id,
        batchResult.data.taskId,
        batchResult.data.reminders
      );

      return NextResponse.json({ reminders }, { status: 201 });
    }

    // Single reminder creation
    const result = CreateReminderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 }
      );
    }

    const reminder = await createReminder(session.user.id, result.data.taskId, result.data);

    return NextResponse.json({ reminder }, { status: 201 });
  } catch (error) {
    logger.error('Error creating reminder', error instanceof Error ? error : undefined);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Task not found or access denied') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('cannot be in the past')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message === 'Either fireAt or relativeOffset must be provided') {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create reminder',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
