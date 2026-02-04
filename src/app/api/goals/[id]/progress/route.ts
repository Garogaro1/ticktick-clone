/**
 * Goal Progress API Route
 *
 * POST /api/goals/[id]/progress - Update goal progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGoalById, updateGoalProgress } from '@/lib/goals';
import { updateGoalProgressSchema } from '@/lib/goals/schemas';
import { logger } from '@/lib/logger';

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
    const body = await request.json();

    const validatedBody = updateGoalProgressSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validatedBody.error.issues },
        { status: 400 }
      );
    }

    // Verify goal exists and belongs to user
    const existingGoal = await getGoalById(session.user.id, id);
    if (!existingGoal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    const goal = await updateGoalProgress(session.user.id, id, validatedBody.data);

    if (!goal) {
      return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    logger.error('Error updating goal progress', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to update goal progress' }, { status: 500 });
  }
}
