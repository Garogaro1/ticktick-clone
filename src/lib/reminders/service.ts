/**
 * Reminder Service Layer
 *
 * Business logic for reminder CRUD operations
 */

import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
import {
  CreateReminderInput,
  UpdateReminderInput,
  ReminderDto,
  ReminderListOptions,
  ReminderListResponse,
  SnoozeOptions,
  ReminderType,
  ReminderStatus,
} from './types';

/**
 * Transform Prisma reminder to DTO
 */
export function toReminderDto(
  reminder: Prisma.ReminderGetPayload<{ include?: { task?: boolean } }>
): ReminderDto {
  return {
    id: reminder.id,
    type: reminder.type,
    fireAt: reminder.fireAt,
    relativeOffset: reminder.relativeOffset,
    status: reminder.status,
    snoozedUntil: reminder.snoozedUntil,
    snoozeCount: reminder.snoozeCount,
    sentAt: reminder.sentAt,
    dismissedAt: reminder.dismissedAt,
    createdAt: reminder.createdAt,
    updatedAt: reminder.updatedAt,
    taskId: reminder.taskId,
    userId: reminder.userId,
  };
}

/**
 * Calculate fireAt from relativeOffset and task dueDate
 */
function calculateFireAt(
  relativeOffset: number | null | undefined,
  taskDueDate: Date | null
): Date | null {
  if (relativeOffset === null || relativeOffset === undefined) {
    return null;
  }

  if (!taskDueDate) {
    throw new Error('Task must have a due date for relative reminders');
  }

  const fireAt = new Date(taskDueDate);
  fireAt.setMinutes(fireAt.getMinutes() - relativeOffset);

  // Don't allow reminders in the past
  if (fireAt < new Date()) {
    throw new Error('Reminder time cannot be in the past');
  }

  return fireAt;
}

/**
 * Get reminders with filtering and pagination
 */
export async function getReminders(
  userId: string,
  options: ReminderListOptions = {}
): Promise<ReminderListResponse> {
  const {
    status,
    type,
    taskId,
    fireBefore,
    fireAfter,
    includePending,
    sortBy = 'fireAt',
    sortOrder = 'asc',
    limit = 50,
    offset = 0,
  } = options;

  const where: Prisma.ReminderWhereInput = {
    userId,
    ...(status && { status }),
    ...(type && { type }),
    ...(taskId && { taskId }),
    ...(includePending && { status: 'PENDING' }),
    ...(fireBefore && { fireAt: { lte: fireBefore } }),
    ...(fireAfter && { fireAt: { gte: fireAfter } }),
    // If snoozed, use snoozedUntil for time-based queries
    ...(fireBefore && status === 'SNOOZED' && { snoozedUntil: { lte: fireBefore } }),
  };

  const [reminders, total] = await Promise.all([
    db.reminder.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            dueDate: true,
          },
        },
      },
    }),
    db.reminder.count({ where }),
  ]);

  return {
    reminders: reminders.map(toReminderDto),
    total,
    limit,
    offset,
  };
}

/**
 * Get a single reminder by ID
 */
export async function getReminderById(
  reminderId: string,
  userId: string
): Promise<ReminderDto | null> {
  const reminder = await db.reminder.findFirst({
    where: { id: reminderId, userId },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return reminder ? toReminderDto(reminder) : null;
}

/**
 * Get reminders for a specific task
 */
export async function getRemindersByTaskId(taskId: string, userId: string): Promise<ReminderDto[]> {
  const reminders = await db.reminder.findMany({
    where: { taskId, userId },
    orderBy: { fireAt: 'asc' },
  });

  return reminders.map(toReminderDto);
}

/**
 * Get pending reminders that should fire
 */
export async function getPendingReminders(
  userId: string,
  before: Date = new Date()
): Promise<ReminderDto[]> {
  const reminders = await db.reminder.findMany({
    where: {
      userId,
      status: 'PENDING',
      OR: [{ fireAt: { lte: before } }, { snoozedUntil: { lte: before } }],
    },
    orderBy: { fireAt: 'asc' },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return reminders.map(toReminderDto);
}

/**
 * Create a new reminder
 */
export async function createReminder(
  userId: string,
  taskId: string,
  data: Omit<CreateReminderInput, 'taskId'>
): Promise<ReminderDto> {
  // Verify task exists and belongs to user
  const task = await db.task.findFirst({
    where: { id: taskId, userId },
    select: { dueDate: true },
  });

  if (!task) {
    throw new Error('Task not found or access denied');
  }

  // Calculate fireAt if relativeOffset is provided
  let fireAt: Date | undefined = data.fireAt ?? undefined;
  if (data.relativeOffset !== undefined && data.relativeOffset !== null) {
    const calculated = calculateFireAt(data.relativeOffset, task.dueDate);
    if (!calculated) {
      throw new Error('Cannot create reminder: task has no due date');
    }
    fireAt = calculated;
  } else if (!fireAt) {
    // Default to task due date if available, otherwise error
    if (task.dueDate) {
      fireAt = task.dueDate;
    } else {
      throw new Error('Either fireAt or relativeOffset must be provided');
    }
  }

  // Check if fireAt is in the past
  if (fireAt < new Date()) {
    throw new Error('Reminder time cannot be in the past');
  }

  const reminder = await db.reminder.create({
    data: {
      userId,
      taskId,
      type: (data.type ?? 'IN_APP') as 'IN_APP' | 'PUSH' | 'EMAIL',
      fireAt,
      relativeOffset: data.relativeOffset,
      status: 'PENDING' as const,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return toReminderDto(reminder);
}

/**
 * Create multiple reminders for a task
 */
export async function createReminders(
  userId: string,
  taskId: string,
  reminders: Array<Omit<CreateReminderInput, 'taskId'>>
): Promise<ReminderDto[]> {
  // Verify task exists and belongs to user
  const task = await db.task.findFirst({
    where: { id: taskId, userId },
    select: { dueDate: true },
  });

  if (!task) {
    throw new Error('Task not found or access denied');
  }

  // Calculate fireAt for each reminder
  const reminderData = reminders.map((r) => {
    let fireAt: Date | undefined = r.fireAt ?? undefined;

    if (r.relativeOffset !== undefined && r.relativeOffset !== null) {
      const calculated = calculateFireAt(r.relativeOffset, task.dueDate);
      if (!calculated) {
        throw new Error('Cannot create reminder: task has no due date');
      }
      fireAt = calculated;
    } else if (!fireAt) {
      if (task.dueDate) {
        fireAt = task.dueDate;
      } else {
        throw new Error('Either fireAt or relativeOffset must be provided');
      }
    }

    if (fireAt && fireAt < new Date()) {
      throw new Error('Reminder time cannot be in the past');
    }

    return {
      userId,
      taskId,
      type: (r.type ?? 'IN_APP') as ReminderType,
      fireAt,
      relativeOffset: r.relativeOffset,
      status: 'PENDING' as ReminderStatus,
    };
  });

  await db.reminder.createMany({
    data: reminderData,
  });

  // Fetch and return created reminders
  const newReminders = await db.reminder.findMany({
    where: { taskId, userId },
    orderBy: { fireAt: 'asc' },
  });

  return newReminders.map(toReminderDto);
}

/**
 * Update a reminder
 */
export async function updateReminder(
  reminderId: string,
  userId: string,
  data: UpdateReminderInput
): Promise<ReminderDto | null> {
  // Check if reminder exists and belongs to user
  const existing = await db.reminder.findFirst({
    where: { id: reminderId, userId },
    include: {
      task: {
        select: {
          dueDate: true,
        },
      },
    },
  });

  if (!existing) {
    throw new Error('Reminder not found or access denied');
  }

  // Calculate fireAt if relativeOffset is being updated
  let fireAt: Date | undefined = data.fireAt ?? undefined;
  if (data.relativeOffset !== undefined) {
    const calculated = calculateFireAt(
      data.relativeOffset,
      existing.task.dueDate ?? existing.fireAt
    );
    if (!calculated) {
      throw new Error('Cannot update reminder: task has no due date');
    }
    fireAt = calculated;
  }

  const reminder = await db.reminder.update({
    where: { id: reminderId },
    data: {
      ...(data.type !== undefined && { type: data.type }),
      ...(fireAt !== undefined && { fireAt }),
      ...(data.relativeOffset !== undefined && { relativeOffset: data.relativeOffset }),
      ...(data.status !== undefined && { status: data.status }),
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return toReminderDto(reminder);
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string, userId: string): Promise<boolean> {
  try {
    await db.reminder.deleteMany({
      where: { id: reminderId, userId },
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Delete multiple reminders
 */
export async function deleteReminders(reminderIds: string[], userId: string): Promise<number> {
  const result = await db.reminder.deleteMany({
    where: {
      id: { in: reminderIds },
      userId,
    },
  });
  return result.count;
}

/**
 * Dismiss a reminder
 */
export async function dismissReminder(
  reminderId: string,
  userId: string
): Promise<ReminderDto | null> {
  const reminder = await db.reminder.findFirst({
    where: { id: reminderId, userId },
  });

  if (!reminder) {
    throw new Error('Reminder not found or access denied');
  }

  if (reminder.status !== 'PENDING' && reminder.status !== 'SNOOZED') {
    throw new Error('Can only dismiss pending or snoozed reminders');
  }

  const updated = await db.reminder.update({
    where: { id: reminderId },
    data: {
      status: 'DISMISSED',
      dismissedAt: new Date(),
      snoozedUntil: null,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return toReminderDto(updated);
}

/**
 * Snooze a reminder
 */
export async function snoozeReminder(
  reminderId: string,
  userId: string,
  options: SnoozeOptions
): Promise<ReminderDto | null> {
  const reminder = await db.reminder.findFirst({
    where: { id: reminderId, userId },
  });

  if (!reminder) {
    throw new Error('Reminder not found or access denied');
  }

  if (
    reminder.status !== 'PENDING' &&
    reminder.status !== 'SNOOZED' &&
    reminder.status !== 'SENT'
  ) {
    throw new Error('Can only snooze pending or sent reminders');
  }

  let snoozedUntil: Date;

  if (options.until) {
    snoozedUntil = options.until;
  } else if (options.minutes) {
    snoozedUntil = new Date();
    snoozedUntil.setMinutes(snoozedUntil.getMinutes() + options.minutes);
  } else {
    throw new Error('Either minutes or until must be provided');
  }

  if (snoozedUntil < new Date()) {
    throw new Error('Snooze time must be in the future');
  }

  const updated = await db.reminder.update({
    where: { id: reminderId },
    data: {
      status: 'SNOOZED',
      snoozedUntil,
      snoozeCount: { increment: 1 },
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return toReminderDto(updated);
}

/**
 * Mark reminder as sent
 */
export async function markReminderSent(
  reminderId: string,
  userId: string
): Promise<ReminderDto | null> {
  const reminder = await db.reminder.findFirst({
    where: { id: reminderId, userId },
  });

  if (!reminder) {
    throw new Error('Reminder not found or access denied');
  }

  const updated = await db.reminder.update({
    where: { id: reminderId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
  });

  return toReminderDto(updated);
}

/**
 * Get reminders that need to be sent
 */
export async function getRemindersToSend(before: Date = new Date()): Promise<ReminderDto[]> {
  const reminders = await db.reminder.findMany({
    where: {
      status: { in: ['PENDING', 'SNOOZED'] },
      OR: [
        { fireAt: { lte: before }, status: 'PENDING' },
        { snoozedUntil: { lte: before }, status: 'SNOOZED' },
      ],
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          dueDate: true,
        },
      },
    },
    orderBy: { fireAt: 'asc' },
  });

  return reminders.map(toReminderDto);
}

/**
 * Count reminders by status
 */
export async function countRemindersByStatus(
  userId: string
): Promise<Record<ReminderStatus, number>> {
  const counts = await db.reminder.groupBy({
    by: ['status'],
    where: { userId },
    _count: true,
  });

  const result: Record<string, number> = {
    PENDING: 0,
    SENT: 0,
    DISMISSED: 0,
    SNOOZED: 0,
  };

  for (const count of counts) {
    result[count.status] = count._count;
  }

  return result as Record<ReminderStatus, number>;
}
