/**
 * Batch Habits API Route
 *
 * POST /api/habits/batch - Batch delete or toggle habits
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { batchDeleteHabits, batchToggleHabits } from '@/lib/habits';
import { batchDeleteHabitsSchema, batchToggleHabitsSchema } from '@/lib/habits/schemas';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'delete') {
      const validatedBody = batchDeleteHabitsSchema.safeParse(body);

      if (!validatedBody.success) {
        return NextResponse.json(
          { error: 'Invalid input', issues: validatedBody.error.issues },
          { status: 400 }
        );
      }

      const count = await batchDeleteHabits(session.user.id, validatedBody.data.habitIds);

      return NextResponse.json({ deleted: count });
    }

    if (action === 'toggle') {
      const validatedBody = batchToggleHabitsSchema.safeParse(body);

      if (!validatedBody.success) {
        return NextResponse.json(
          { error: 'Invalid input', issues: validatedBody.error.issues },
          { status: 400 }
        );
      }

      const habits = await batchToggleHabits(
        session.user.id,
        validatedBody.data.habitIds,
        validatedBody.data.date || new Date()
      );

      return NextResponse.json({ habits });
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "delete" or "toggle"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing batch habits:', error);
    return NextResponse.json({ error: 'Failed to process batch operation' }, { status: 500 });
  }
}
