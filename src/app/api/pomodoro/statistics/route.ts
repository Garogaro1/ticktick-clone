/**
 * Pomodoro Statistics API Route
 *
 * GET /api/pomodoro/statistics - Get Pomodoro statistics for the user
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPomodoroStatistics } from '@/lib/pomodoro/service';
import { StatisticsQuerySchema } from '@/lib/pomodoro/schemas';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const queryResult = StatisticsQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: queryResult.error.issues },
        { status: 400 }
      );
    }

    const statistics = await getPomodoroStatistics(session.user.id, queryResult.data.taskId);

    return NextResponse.json({ statistics });
  } catch (error) {
    console.error('Error fetching Pomodoro statistics:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch Pomodoro statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
