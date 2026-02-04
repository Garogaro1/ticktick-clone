/**
 * Tag by ID API Route
 *
 * GET /api/tags/[id] - Get a single tag
 * PUT /api/tags/[id] - Update a tag
 * DELETE /api/tags/[id] - Delete a tag
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getTagById, updateTag, deleteTag } from '@/lib/tags/service';
import { UpdateTagSchema } from '@/lib/tags/schemas';
import type { TagUpdateResponse, TagDeleteResponse } from '@/lib/tags';
import { logger } from '@/lib/logger';

/**
 * GET /api/tags/[id]
 *
 * Retrieve a single tag by ID.
 *
 * @response { tag: TagDto }
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

    // Fetch tag
    const tag = await getTagById(id, session.user.id);

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    return NextResponse.json({ tag });
  } catch (error) {
    logger.error('Tag GET error', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/tags/[id]
 *
 * Update an existing tag.
 *
 * Request body (all fields optional):
 * - name: string
 * - color: string | null
 * - sortOrder: number
 *
 * @response { tag: TagDto }
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

    // Parse and validate request body
    const body = await request.json();
    const validation = UpdateTagSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    // Update tag
    const tag = await updateTag(id, session.user.id, data);

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const response: TagUpdateResponse = { tag };
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Tag update error', error instanceof Error ? error : undefined);

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

/**
 * DELETE /api/tags/[id]
 *
 * Delete a tag.
 *
 * @response { success: boolean, tagId: string }
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

    // Delete tag
    const success = await deleteTag(id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 });
    }

    const response: TagDeleteResponse = { success: true, tagId: id };
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Tag deletion error', error instanceof Error ? error : undefined);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
