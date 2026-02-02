/**
 * Lists API Route
 *
 * GET /api/lists - List lists with filtering and sorting
 * POST /api/lists - Create a new list
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLists, createList } from '@/lib/lists/service';
import {
  CreateListSchema,
  ListQuerySchema,
  type ListListResponse,
  type ListCreateResponse,
} from '@/lib/lists';
import { Prisma } from '@prisma/client';

/**
 * GET /api/lists
 *
 * Retrieve a list of lists for the authenticated user.
 * Supports filtering, sorting, and pagination.
 *
 * Query parameters:
 * - search: Search in title and description
 * - isFavorite: Filter by favorite status
 * - isDefault: Filter by default status
 * - sortBy: Sort field (createdAt, updatedAt, title, sortOrder)
 * - sortOrder: Sort order (asc, desc)
 * - limit: Number of lists to return (1-100, default: 50)
 * - offset: Number of lists to skip (default: 0)
 * - includeTasks: Include tasks in response
 *
 * @response { lists: ListDto[], total: number, limit: number, offset: number }
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
    const queryValidation = ListQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json({ error: queryValidation.error.issues[0].message }, { status: 400 });
    }

    const query = queryValidation.data;

    // Build where clause
    const where: Prisma.ListWhereInput = {};

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }

    if (query.isFavorite !== undefined) {
      where.isFavorite = query.isFavorite;
    }

    if (query.isDefault !== undefined) {
      where.isDefault = query.isDefault;
    }

    // Build order by
    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'asc' }
      : { sortOrder: 'asc' as const };

    // Pagination
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    // Fetch lists
    const { lists, total } = await getLists(session.user.id, {
      where,
      orderBy,
      take: limit,
      skip: offset,
      includeTasks: query.includeTasks,
    });

    const response: ListListResponse = {
      lists,
      total,
      limit,
      offset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Lists GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/lists
 *
 * Create a new list for the authenticated user.
 *
 * Request body:
 * - title: string (required) - List title
 * - description: string (optional) - List description
 * - icon: string (optional) - Emoji or icon identifier
 * - color: string (optional) - Hex color code
 * - sortOrder: number (optional) - Sort order
 * - isDefault: boolean (optional) - Whether this is the default list
 * - isFavorite: boolean (optional) - Whether this is a favorite list
 *
 * @response { list: ListDto }
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
    const validation = CreateListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    // Create list
    const list = await createList(session.user.id, data);

    const response: ListCreateResponse = { list };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('List creation error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'A list with this title already exists' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
