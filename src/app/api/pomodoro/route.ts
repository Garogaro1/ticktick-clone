/**
 * Pomodoro API Routes
 *
 * GET /api/pomodoro - List Pomodoro sessions with filtering
 * POST /api/pomodoro - Create a new Pomodoro session
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getPomodoroSessions,
  createPomodoroSession,
  batchDeletePomodoroSessions,
  batchUpdatePomodoroSessions,
} from '@/lib/pomodoro/service';
import {
  CreatePomodoroSchema,
  PomodoroQuerySchema,
  BatchPomodoroSchema,
} from '@/lib/pomodoro/schemas';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const queryResult = PomodoroQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: queryResult.error.issues },
        { status: 400 }
      );
    }

    const result = await getPomodoroSessions(session.user.id, queryResult.data);

    return NextResponse.json(result);
  } catch (error) {
    logger.error('Error fetching Pomodoro sessions', error instanceof Error ? error : undefined);
    return NextResponse.json(
      {
        error: 'Failed to fetch Pomodoro sessions',
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

    // Check if batch operation
    const isBatch = body.operation && body.sessionIds;

    if (isBatch) {
      const batchResult = BatchPomodoroSchema.safeParse(body);
      if (!batchResult.success) {
        return NextResponse.json(
          { error: 'Invalid request body', issues: batchResult.error.issues },
          { status: 400 }
        );
      }

      let count = 0;
      if (batchResult.data.operation === 'delete') {
        count = await batchDeletePomodoroSessions(batchResult.data.sessionIds, session.user.id);
      } else if (batchResult.data.operation === 'markCompleted') {
        count = await batchUpdatePomodoroSessions(
          batchResult.data.sessionIds,
          session.user.id,
          true
        );
      } else if (batchResult.data.operation === 'markAbandoned') {
        count = await batchUpdatePomodoroSessions(
          batchResult.data.sessionIds,
          session.user.id,
          false
        );
      }

      return NextResponse.json({ count }, { status: 200 });
    }

    // Single session creation
    const result = CreatePomodoroSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request body', issues: result.error.issues },
        { status: 400 }
      );
    }

    const pomodoroSession = await createPomodoroSession(session.user.id, result.data);

    return NextResponse.json({ session: pomodoroSession }, { status: 201 });
  } catch (error) {
    logger.error('Error creating Pomodoro session', error instanceof Error ? error : undefined);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === 'Task not found') {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create Pomodoro session',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
