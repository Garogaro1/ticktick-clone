/**
 * Single Pomodoro Session API Routes
 *
 * GET /api/pomodoro/[id] - Get a specific Pomodoro session
 * PUT /api/pomodoro/[id] - Update a Pomodoro session
 * DELETE /api/pomodoro/[id] - Delete a Pomodoro session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getPomodoroSessionById,
  updatePomodoroSession,
  deletePomodoroSession,
} from '@/lib/pomodoro/service';
import { UpdatePomodoroSchema } from '@/lib/pomodoro/schemas';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const pomodoroSession = await getPomodoroSessionById(id, session.user.id);

    if (!pomodoroSession) {
      return NextResponse.json({ error: 'Pomodoro session not found' }, { status: 404 });
    }

    return NextResponse.json({ session: pomodoroSession });
  } catch (error) {
    logger.error('Error fetching Pomodoro session', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Failed to fetch Pomodoro session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const result = UpdatePomodoroSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 }
      );
    }

    const pomodoroSession = await updatePomodoroSession(id, session.user.id, result.data);

    return NextResponse.json({ session: pomodoroSession });
  } catch (error) {
    logger.error('Error updating Pomodoro session', error instanceof Error ? error : undefined);

    if (error instanceof Error && error.message === 'Pomodoro session not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: 'Failed to update Pomodoro session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await deletePomodoroSession(id, session.user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting Pomodoro session', error instanceof Error ? error : undefined);

    if (error instanceof Error && error.message === 'Pomodoro session not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json(
      {
        error: 'Failed to delete Pomodoro session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
