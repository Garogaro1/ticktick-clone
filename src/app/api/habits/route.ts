/**
 * Habits API Routes
 *
 * GET /api/habits - List user's habits
 * POST /api/habits - Create a new habit
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getHabits, createHabit } from '@/lib/habits';
import { createHabitSchema, habitQuerySchema } from '@/lib/habits/schemas';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const query = Object.fromEntries(searchParams.entries());

    const validatedQuery = habitQuerySchema.safeParse(query);

    if (!validatedQuery.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: validatedQuery.error.issues },
        { status: 400 }
      );
    }

    const result = await getHabits(session.user.id, validatedQuery.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching habits:', error);
    return NextResponse.json({ error: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const validatedBody = createHabitSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validatedBody.error.issues },
        { status: 400 }
      );
    }

    const habit = await createHabit(session.user.id, validatedBody.data);

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    console.error('Error creating habit:', error);
    return NextResponse.json({ error: 'Failed to create habit' }, { status: 500 });
  }
}
