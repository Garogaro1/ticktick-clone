/**
 * Task Reminders API Route
 *
 * GET /api/reminders/task/[taskId] - Get all reminders for a specific task
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRemindersByTaskId } from '@/lib/reminders/service';

type RouteContext = {
  params: Promise<{ taskId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await context.params;
    const reminders = await getRemindersByTaskId(taskId, session.user.id);

    return NextResponse.json({ reminders });
  } catch (error) {
    console.error('Error fetching task reminders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch reminders',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
