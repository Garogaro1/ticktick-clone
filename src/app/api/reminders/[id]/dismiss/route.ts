/**
 * Dismiss Reminder API Route
 *
 * POST /api/reminders/[id]/dismiss - Dismiss a reminder
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { dismissReminder } from '@/lib/reminders/service';

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
    const reminder = await dismissReminder(id, session.user.id);

    if (!reminder) {
      return NextResponse.json({ error: 'Reminder not found' }, { status: 404 });
    }

    return NextResponse.json({ reminder });
  } catch (error) {
    console.error('Error dismissing reminder:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Reminder not found or access denied') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
      if (error.message.includes('Can only dismiss')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to dismiss reminder',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
