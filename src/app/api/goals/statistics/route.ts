/**
 * Goal Statistics API Route
 *
 * GET /api/goals/statistics - Get goal statistics for the user
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGoalStatistics } from '@/lib/goals';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statistics = await getGoalStatistics(session.user.id);

    return NextResponse.json({ statistics });
  } catch (error) {
    logger.error('Error fetching goal statistics', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
