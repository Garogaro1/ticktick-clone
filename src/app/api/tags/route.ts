/**
 * Tags API Route
 *
 * GET /api/tags - List tags with filtering and sorting
 * POST /api/tags - Create a new tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTags, createTag } from '@/lib/tags/service';
import {
  CreateTagSchema,
  TagQuerySchema,
  type TagListResponse,
  type TagCreateResponse,
} from '@/lib/tags';
import { Prisma } from '@prisma/client';

/**
 * GET /api/tags
 *
 * Retrieve a list of tags for the authenticated user.
 * Supports filtering, sorting, and pagination.
 *
 * Query parameters:
 * - search: Search in tag name
 * - sortBy: Sort field (createdAt, updatedAt, name, sortOrder)
 * - sortOrder: Sort order (asc, desc)
 * - limit: Number of tags to return (1-100, default: 50)
 * - offset: Number of tags to skip (default: 0)
 * - includeTasks: Include tasks in response
 *
 * @response { tags: TagDto[], total: number, limit: number, offset: number }
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
    const queryValidation = TagQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!queryValidation.success) {
      return NextResponse.json({ error: queryValidation.error.issues[0].message }, { status: 400 });
    }

    const query = queryValidation.data;

    // Build where clause
    const where: Prisma.TagWhereInput = {};

    if (query.search) {
      where.name = { contains: query.search };
    }

    // Build order by
    const orderBy = query.sortBy
      ? { [query.sortBy]: query.sortOrder ?? 'asc' }
      : { sortOrder: 'asc' as const };

    // Pagination
    const limit = query.limit ?? 50;
    const offset = query.offset ?? 0;

    // Fetch tags
    const { tags, total } = await getTags(session.user.id, {
      where,
      orderBy,
      take: limit,
      skip: offset,
      includeTasks: query.includeTasks,
    });

    const response: TagListResponse = {
      tags,
      total,
      limit,
      offset,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Tags GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/tags
 *
 * Create a new tag for the authenticated user.
 *
 * Request body:
 * - name: string (required) - Tag name
 * - color: string (optional) - Hex color code
 * - sortOrder: number (optional) - Sort order
 *
 * @response { tag: TagDto }
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
    const validation = CreateTagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    // Create tag
    const tag = await createTag(session.user.id, data);

    const response: TagCreateResponse = { tag };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Tag creation error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ error: 'A tag with this name already exists' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
