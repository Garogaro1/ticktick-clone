/**
 * Individual Habit API Routes
 *
 * GET /api/habits/[id] - Get a single habit
 * PUT /api/habits/[id] - Update a habit
 * DELETE /api/habits/[id] - Delete a habit
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getHabitById, updateHabit, deleteHabit } from '@/lib/habits';
import { updateHabitSchema } from '@/lib/habits/schemas';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const habit = await getHabitById(session.user.id, id);

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error('Error fetching habit:', error);
    return NextResponse.json({ error: 'Failed to fetch habit' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validatedBody = updateHabitSchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validatedBody.error.issues },
        { status: 400 }
      );
    }

    const habit = await updateHabit(session.user.id, id, validatedBody.data);

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ habit });
  } catch (error) {
    console.error('Error updating habit:', error);
    return NextResponse.json({ error: 'Failed to update habit' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const success = await deleteHabit(session.user.id, id);

    if (!success) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting habit:', error);
    return NextResponse.json({ error: 'Failed to delete habit' }, { status: 500 });
  }
}
