/**
 * List by ID API Route
 *
 * GET /api/lists/[id] - Get a single list
 * PUT /api/lists/[id] - Update a list
 * DELETE /api/lists/[id] - Delete a list
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getListById, updateList, deleteList } from '@/lib/lists/service';
import { UpdateListSchema } from '@/lib/lists/schemas';
import type { ListUpdateResponse, ListDeleteResponse } from '@/lib/lists';

/**
 * GET /api/lists/[id]
 *
 * Retrieve a single list by ID.
 *
 * @response { list: ListDto }
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

    // Fetch list
    const list = await getListById(id, session.user.id);

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    return NextResponse.json({ list });
  } catch (error) {
    console.error('List GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT /api/lists/[id]
 *
 * Update an existing list.
 *
 * Request body (all fields optional):
 * - title: string
 * - description: string | null
 * - icon: string | null
 * - color: string | null
 * - sortOrder: number
 * - isDefault: boolean
 * - isFavorite: boolean
 *
 * @response { list: ListDto }
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
    const validation = UpdateListSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    // Update list
    const list = await updateList(id, session.user.id, data);

    if (!list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const response: ListUpdateResponse = { list };
    return NextResponse.json(response);
  } catch (error) {
    console.error('List update error:', error);

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

/**
 * DELETE /api/lists/[id]
 *
 * Delete a list. The default list cannot be deleted.
 *
 * @response { success: boolean, listId: string }
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

    // Delete list
    const success = await deleteList(id, session.user.id);

    if (!success) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 });
    }

    const response: ListDeleteResponse = { success: true, listId: id };
    return NextResponse.json(response);
  } catch (error) {
    console.error('List deletion error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Cannot delete the default list')) {
        return NextResponse.json({ error: 'Cannot delete the default list' }, { status: 400 });
      }
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
