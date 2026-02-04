/**
 * Toggle Habit Entry API Route
 *
 * POST /api/habits/[id]/toggle - Toggle habit completion for a date
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { toggleHabitEntry } from '@/lib/habits';
import { toggleHabitEntrySchema } from '@/lib/habits/schemas';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const validatedBody = toggleHabitEntrySchema.safeParse(body);

    if (!validatedBody.success) {
      return NextResponse.json(
        { error: 'Invalid input', issues: validatedBody.error.issues },
        { status: 400 }
      );
    }

    // Provide default date if not specified
    const input = {
      ...validatedBody.data,
      date: validatedBody.data.date || new Date(),
    };

    const result = await toggleHabitEntry(session.user.id, id, input);

    if (!result.habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 });
    }

    return NextResponse.json({
      created: result.created,
      entry: result.entry,
      habit: result.habit,
    });
  } catch (error) {
    console.error('Error toggling habit:', error);
    return NextResponse.json({ error: 'Failed to toggle habit' }, { status: 500 });
  }
}
