/**
 * Tasks Reorder API Route
 *
 * POST /api/tasks/reorder - Reorder multiple tasks (for drag-and-drop)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { reorderTasks } from '@/lib/tasks/service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Validation schema for reorder request
const ReorderSchema = z.object({
  updates: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number(),
    })
  ),
});

/**
 * POST /api/tasks/reorder
 *
 * Reorder multiple tasks by updating their sort orders.
 * Used for drag-and-drop reordering.
 *
 * Request body:
 * - updates: Array<{ id: string, sortOrder: number }>
 *
 * @response { tasks: TaskDto[] }
 * @error { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = ReorderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const { updates } = validation.data;

    // Validate at least one update
    if (updates.length === 0) {
      return NextResponse.json({ error: 'At least one update is required' }, { status: 400 });
    }

    // Reorder tasks
    const tasks = await reorderTasks(session.user.id, updates);

    return NextResponse.json({ tasks });
  } catch (error) {
    logger.error('Tasks reorder error', error instanceof Error ? error : undefined);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
