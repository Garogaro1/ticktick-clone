/**
 * Reminder Detail API Routes
 *
 * GET /api/reminders/[id] - Get a single reminder
 * PUT /api/reminders/[id] - Update a reminder
 * DELETE /api/reminders/[id] - Delete a reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getReminderById, updateReminder, deleteReminder } from '@/lib/reminders/service';
import { UpdateReminderSchema } from '@/lib/reminders/schemas';
import { logger } from '@/lib/logger';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const reminder = await getReminderById(id, session.user.id);

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    logger.error('Error fetching reminder', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Failed to fetch reminder',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const result = UpdateReminderSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 }
      );
    }

    const reminder = await updateReminder(id, session.user.id, result.data);

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    logger.error('Error updating reminder', error instanceof Error ? error : undefined);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Reminder not found or access denied') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('cannot be in the past')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to update reminder',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const success = await deleteReminder(id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting reminder', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Failed to delete reminder',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
