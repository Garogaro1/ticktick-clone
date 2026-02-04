/**
 * Habit Statistics API Route
 *
 * GET /api/habits/statistics - Get habit statistics for the user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getHabitStatistics } from '@/lib/habits';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statistics = await getHabitStatistics(session.user.id);

    return NextResponse.json({ statistics });
  } catch (error) {
    logger.error(
      'Error fetching habit statistics:',
      error instanceof Error ? error : new Error(String(error))
    );
    return NextResponse.json({ error: 'Failed to fetch habit statistics' }, { status: 500 });
  }
}
