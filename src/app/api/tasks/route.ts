/**
 * Tasks API Route
 *
 * GET /api/tasks - List tasks with filtering and sorting
 * POST /api/tasks - Create a new task
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTasks, createTask } from '@/lib/tasks/service';
import {
  CreateTaskSchema,
  TaskQuerySchema,
  type TaskListResponse,
  type TaskCreateResponse,
} from '@/lib/tasks';
import { Prisma } from '@prisma/client';

/**
 * GET /api/tasks
 *
 * Retrieve a list of tasks for the authenticated user.
 * Supports filtering, sorting, and pagination.
 *
 * Query parameters:
 * - status: Filter by status (TODO, IN_PROGRESS, DONE, CANCELLED)
 * - priority: Filter by priority (NONE, LOW, MEDIUM, HIGH)
 * - listId: Filter by list ID
 * - parentId: Filter by parent task ID (for subtasks)
 * - tagId: Filter by tag ID
 * - dueBefore: Filter tasks due before this date
 * - dueAfter: Filter tasks due after this date
 * - includeSubtasks: Include subtasks in response
 * - search: Search in title and description
 * - sortBy: Sort field (createdAt, updatedAt, dueDate, priority, title, sortOrder)
 * - sortOrder: Sort order (asc, desc)
 * - limit: Number of tasks to return (1-100, default: 50)
 * - offset: Number of tasks to skip (default: 0)
 *
 * @response { tasks: TaskDto[], total: number, limit: number, offset: number }
 * @error { error: string }
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const queryValidation = TaskQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json({ error: queryValidation.error.issues[0].message }, { status: 400 });
    }

    const query = queryValidation.data;

    // Build where clause
    const where: Prisma.TaskWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.listId) {
      where.listId = query.listId;
    }

    if (query.parentId !== undefined) {
      where.parentId = query.parentId;
    }

    if (query.tagId) {
      where.tags = {
        some: {
          tagId: query.tagId,
        },
      };
    }

    if (query.dueBefore || query.dueAfter) {
      const dueDateCondition: Prisma.DateTimeFilter | undefined = {};
      if (query.dueBefore) {
        dueDateCondition.lte = query.dueBefore;
      }
      if (query.dueAfter) {
        dueDateCondition.gte = query.dueAfter;
      }
      where.dueDate = dueDateCondition;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    // Build order by
    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'asc' }
      : { sortOrder: 'asc' as const };

    // Pagination
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    // Fetch tasks
    const { tasks, total } = await getTasks(session.user.id, {
      where,
      orderBy,
      take: limit,
      skip: offset,
      includeSubtasks: query.includeSubtasks,
    });

    const response: TaskListResponse = {
      tasks,
      total,
      limit,
      offset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Tasks GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 *
 * Create a new task for the authenticated user.
 *
 * Request body:
 * - title: string (required) - Task title
 * - description: string (optional) - Task description
 * - status: TaskStatus (optional) - Task status
 * - priority: Priority (optional) - Task priority
 * - dueDate: Date (optional) - Due date
 * - startDate: Date (optional) - Start date
 * - estimatedTime: number (optional) - Estimated time in minutes
 * - listId: string (optional) - List ID (defaults to Inbox)
 * - parentId: string (optional) - Parent task ID for subtasks
 * - sortOrder: number (optional) - Sort order
 * - tags: Array<{ id: string }> (optional) - Task tags
 *
 * @response { task: TaskDto }
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
    const validation = CreateTaskSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    // Create task
    const task = await createTask(session.user.id, data);

    const response: TaskCreateResponse = { task };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Task creation error:', error);

    // Handle specific Prisma errors
    if (error instanceof Error) {
      // Foreign key constraint violation
      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json({ error: 'Invalid listId, parentId, or tag ID' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
