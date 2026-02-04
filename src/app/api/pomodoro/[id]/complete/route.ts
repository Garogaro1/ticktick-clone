/**
 * Complete Pomodoro Session API Route
 *
 * POST /api/pomodoro/[id]/complete - Mark a Pomodoro session as completed
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { completePomodoroSession } from '@/lib/pomodoro/service';
import { CompletePomodoroSchema } from '@/lib/pomodoro/schemas';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const result = CompletePomodoroSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 }
      );
    }

    const pomodoroSession = await completePomodoroSession(
      id,
      session.user.id,
      result.data.wasCompleted
    );

    return NextResponse.json({ session: pomodoroSession });
  } catch (error) {
    logger.error('Error completing Pomodoro session', error instanceof Error ? error : undefined);

    if (error instanceof Error && error.message === 'Pomodoro session not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: 'Failed to complete Pomodoro session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
