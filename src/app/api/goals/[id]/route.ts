/**
 * Single Goal API Routes
 *
 * GET /api/goals/[id] - Get a single goal
 * PUT /api/goals/[id] - Update a goal
 * DELETE /api/goals/[id] - Delete a goal
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGoalById, updateGoal, deleteGoal } from '@/lib/goals';
import { updateGoalSchema } from '@/lib/goals/schemas';
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

    const goal = await getGoalById(session.user.id, id);

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    logger.error('Error fetching goal', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 });
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

    const validatedBody = updateGoalSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validatedBody.error.issues },
        { status: 400 }
      );
    }

    const goal = await updateGoal(session.user.id, id, validatedBody.data);

    if (!goal) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ goal });
  } catch (error) {
    logger.error('Error updating goal', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const success = await deleteGoal(session.user.id, id);

    if (!success) {
      return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error deleting goal', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
