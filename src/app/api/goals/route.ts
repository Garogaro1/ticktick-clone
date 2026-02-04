/**
 * Goals API Routes
 *
 * GET /api/goals - List user's goals
 * POST /api/goals - Create a new goal
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGoals, createGoal } from '@/lib/goals';
import { createGoalSchema, goalQuerySchema } from '@/lib/goals/schemas';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = goalQuerySchema.safeParse(query);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: validatedQuery.error.issues },
        { status: 400 }
      );
    }

    const result = await getGoals(session.user.id, validatedQuery.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const validatedBody = createGoalSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validatedBody.error.issues },
        { status: 400 }
      );
    }

    const goal = await createGoal(session.user.id, validatedBody.data);

    return NextResponse.json({ goal }, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
