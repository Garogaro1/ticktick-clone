/**
 * Goals Batch Operations API Route
 *
 * POST /api/goals/batch - Batch update or delete goals
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { batchUpdateGoalStatus, batchDeleteGoals, updateGoalOrders } from '@/lib/goals';
import { batchUpdateGoalsSchema, batchDeleteGoalsSchema } from '@/lib/goals/schemas';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'updateStatus') {
      const validatedBody = batchUpdateGoalsSchema.safeParse(body);

      if (!validatedBody.success) {
        return NextResponse.json(
          { error: 'Invalid input', issues: validatedBody.error.issues },
          { status: 400 }
        );
      }

      const count = await batchUpdateGoalStatus(
        session.user.id,
        validatedBody.data.goalIds,
        validatedBody.data.status ?? 'ACTIVE'
      );

      return NextResponse.json({ count, message: `Updated ${count} goal(s)` });
    }

    if (action === 'delete') {
      const validatedBody = batchDeleteGoalsSchema.safeParse(body);

      if (!validatedBody.success) {
        return NextResponse.json(
          { error: 'Invalid input', issues: validatedBody.error.issues },
          { status: 400 }
        );
      }

      const count = await batchDeleteGoals(session.user.id, validatedBody.data.goalIds);

      return NextResponse.json({ count, message: `Deleted ${count} goal(s)` });
    }

    if (action === 'reorder') {
      const { orders } = body;

      if (!Array.isArray(orders)) {
        return NextResponse.json({ error: 'Invalid orders array' }, { status: 400 });
      }

      await updateGoalOrders(session.user.id, orders);

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    logger.error('Error processing batch operation', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Failed to process batch operation' }, { status: 500 });
  }
}
