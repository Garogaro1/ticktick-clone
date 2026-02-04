/**
 * Task by ID API Route
 *
 * GET /api/tasks/[id] - Get a single task
 * PUT /api/tasks/[id] - Update a task
 * DELETE /api/tasks/[id] - Delete a task
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTaskById, updateTask, deleteTask } from '@/lib/tasks/service';
import { updateGoalProgress } from '@/lib/goals';
import { UpdateTaskSchema } from '@/lib/tasks/schemas';
import { TaskStatus } from '@prisma/client';
import type { TaskUpdateResponse, TaskDeleteResponse } from '@/lib/tasks';

/**
 * GET /api/tasks/[id]
 *
 * Retrieve a single task by ID.
 *
 * @response { task: TaskDto }
 * @error { error: string }
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch task
    const task = await getTaskById(id, session.user.id);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Task GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/tasks/[id]
 *
 * Update an existing task.
 *
 * Request body (all fields optional):
 * - title: string
 * - description: string | null
 * - status: TaskStatus
 * - priority: Priority
 * - dueDate: Date | null
 * - startDate: Date | null
 * - completedAt: Date | null
 * - estimatedTime: number | null
 * - spentTime: number | null
 * - recurrenceRule: string | null
 * - listId: string | null
 * - parentId: string | null
 * - sortOrder: number
 * - tags: Array<{ id: string }>
 *
 * @response { task: TaskDto }
 * @error { error: string }
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get the current task to check if it's linked to a goal and if status is changing
    const currentTask = await getTaskById(id, session.user.id);

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    // Check if task is being marked as DONE and has a linked goal
    const isCompletingTask =
      data.status === TaskStatus.DONE &&
      currentTask &&
      currentTask.status !== TaskStatus.DONE &&
      currentTask.goalId;

    // Update task
    const task = await updateTask(id, session.user.id, data);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Auto-update goal progress when task is completed
    if (isCompletingTask && currentTask.goalId) {
      try {
        await updateGoalProgress(session.user.id, currentTask.goalId, {
          increment: 1,
        });
      } catch (goalError) {
        // Log the error but don't fail the task update
        console.error('Failed to update goal progress:', goalError);
      }
    }

    // If task is being uncompleted (status changed from DONE to something else), decrement goal progress
    if (
      data.status &&
      data.status !== TaskStatus.DONE &&
      currentTask &&
      currentTask.status === TaskStatus.DONE &&
      currentTask.goalId
    ) {
      try {
        await updateGoalProgress(session.user.id, currentTask.goalId, {
          increment: -1,
        });
      } catch (goalError) {
        console.error('Failed to update goal progress:', goalError);
      }
    }

    const response: TaskUpdateResponse = { task };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Task update error:', error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ error: 'Invalid listId, parentId, or tag ID' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks/[id]
 *
 * Delete a task.
 *
 * @response { success: boolean, taskId: string }
 * @error { error: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete task
    const success = await deleteTask(id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const response: TaskDeleteResponse = { success: true, taskId: id };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Task deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
