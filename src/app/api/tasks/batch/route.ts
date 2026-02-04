/**
 * Batch Task Operations API Route
 *
 * POST /api/tasks/batch - Batch update or delete tasks
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { batchUpdateTasks, batchDeleteTasks } from '@/lib/tasks/service';
import {
  BatchUpdateTaskSchema,
  BatchDeleteTaskSchema,
  type BatchUpdateResponse,
  type BatchDeleteResponse,
} from '@/lib/tasks';
import { logger } from '@/lib/logger';

/**
 * POST /api/tasks/batch
 *
 * Perform batch operations on multiple tasks.
 * Requires an 'operation' parameter in the request body.
 *
 * Supported operations:
 * - update: Batch update tasks
 * - delete: Batch delete tasks
 *
 * Request body for update:
 * - operation: "update"
 * - taskIds: string[] - Array of task IDs
 * - updates: { status?: TaskStatus, priority?: Priority, listId?: string | null }
 *
 * Request body for delete:
 * - operation: "delete"
 * - taskIds: string[] - Array of task IDs
 *
 * @response { updated: number, tasks: TaskDto[] } | { deleted: number, taskIds: string[] }
 * @error { error: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { operation } = body;

    if (operation === 'update') {
      // Validate batch update request
      const validation = BatchUpdateTaskSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
      }

      const { taskIds, updates } = validation.data;
      const result = await batchUpdateTasks(session.user.id, taskIds, updates);

      const response: BatchUpdateResponse = {
        updated: result.count,
        tasks: result.tasks,
      };
      return NextResponse.json(response);
    }

    if (operation === 'delete') {
      // Validate batch delete request
      const validation = BatchDeleteTaskSchema.safeParse(body);
      if (!validation.success) {
        return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
      }

      const { taskIds } = validation.data;
      const deleted = await batchDeleteTasks(session.user.id, taskIds);

      const response: BatchDeleteResponse = {
        deleted,
        taskIds,
      };
      return NextResponse.json(response);
    }

    return NextResponse.json(
      { error: 'Invalid operation. Use "update" or "delete"' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Batch operation error', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
