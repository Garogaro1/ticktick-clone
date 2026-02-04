/**
 * Pomodoro Service Layer
 *
 * Business logic for Pomodoro session CRUD operations
 */

import { Prisma, type PomodoroSession } from '@prisma/client';
import { db } from '@/lib/db';
import {
  CreatePomodoroInput,
  UpdatePomodoroInput,
  PomodoroSessionDto,
  PomodoroListOptions,
  PomodoroListResponse,
  PomodoroStatistics,
  PomodoroSessionType,
} from './types';
import { calculateStatistics } from './utils';

/**
 * Transform Prisma PomodoroSession to DTO
 */
export function toPomodoroDto(session: PomodoroSession): PomodoroSessionDto {
  return {
    id: session.id,
    duration: session.duration,
    breakDuration: session.breakDuration,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    wasCompleted: session.wasCompleted,
    type: session.type as PomodoroSessionType,
    taskId: session.taskId,
    userId: session.userId,
  };
}

/**
 * Get Pomodoro sessions with filtering and pagination
 */
export async function getPomodoroSessions(
  userId: string,
  options: PomodoroListOptions = {}
): Promise<PomodoroListResponse> {
  const {
    type,
    taskId,
    wasCompleted,
    startDate,
    endDate,
    sortBy = 'startedAt',
    sortOrder = 'desc',
    limit = 50,
    offset = 0,
  } = options;

  const where: Prisma.PomodoroSessionWhereInput = {
    userId,
    ...(type && { type }),
    ...(taskId !== undefined && { taskId }),
    ...(wasCompleted !== undefined && { wasCompleted }),
    ...(startDate && { startedAt: { gte: startDate } }),
    ...(endDate && { startedAt: { lte: endDate } }),
  };

  const [sessions, total] = await Promise.all([
    db.pomodoroSession.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      take: limit,
      skip: offset,
    }),
    db.pomodoroSession.count({ where }),
  ]);

  return {
    sessions: sessions.map(toPomodoroDto),
    total,
    limit,
    offset,
  };
}

/**
 * Get a single Pomodoro session by ID
 */
export async function getPomodoroSessionById(
  sessionId: string,
  userId: string
): Promise<PomodoroSessionDto | null> {
  const session = await db.pomodoroSession.findFirst({
    where: { id: sessionId, userId },
  });

  return session ? toPomodoroDto(session) : null;
}

/**
 * Create a new Pomodoro session
 */
export async function createPomodoroSession(
  userId: string,
  input: CreatePomodoroInput
): Promise<PomodoroSessionDto> {
  const { duration = 25, breakDuration = 5, type = 'work', taskId } = input;

  // Verify task exists if provided
  if (taskId) {
    const task = await db.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!task) {
      throw new Error('Task not found');
    }
  }

  const session = await db.pomodoroSession.create({
    data: {
      userId,
      duration,
      breakDuration,
      type,
      taskId,
    },
  });

  return toPomodoroDto(session);
}

/**
 * Update a Pomodoro session
 */
export async function updatePomodoroSession(
  sessionId: string,
  userId: string,
  input: UpdatePomodoroInput
): Promise<PomodoroSessionDto> {
  // Verify session exists and belongs to user
  const existing = await db.pomodoroSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!existing) {
    throw new Error('Pomodoro session not found');
  }

  const session = await db.pomodoroSession.update({
    where: { id: sessionId },
    data: {
      ...input,
      completedAt: input.completedAt ?? (input.wasCompleted ? new Date() : undefined),
    },
  });

  return toPomodoroDto(session);
}

/**
 * Delete a Pomodoro session
 */
export async function deletePomodoroSession(sessionId: string, userId: string): Promise<void> {
  // Verify session exists and belongs to user
  const existing = await db.pomodoroSession.findFirst({
    where: { id: sessionId, userId },
  });

  if (!existing) {
    throw new Error('Pomodoro session not found');
  }

  await db.pomodoroSession.delete({
    where: { id: sessionId },
  });
}

/**
 * Complete a Pomodoro session
 */
export async function completePomodoroSession(
  sessionId: string,
  userId: string,
  wasCompleted: boolean = true
): Promise<PomodoroSessionDto> {
  const session = await db.pomodoroSession.update({
    where: { id: sessionId },
    data: {
      wasCompleted,
      completedAt: new Date(),
    },
  });

  return toPomodoroDto(session);
}

/**
 * Batch delete Pomodoro sessions
 */
export async function batchDeletePomodoroSessions(
  sessionIds: string[],
  userId: string
): Promise<number> {
  const result = await db.pomodoroSession.deleteMany({
    where: {
      id: { in: sessionIds },
      userId,
    },
  });

  return result.count;
}

/**
 * Batch mark sessions as completed or abandoned
 */
export async function batchUpdatePomodoroSessions(
  sessionIds: string[],
  userId: string,
  wasCompleted: boolean
): Promise<number> {
  const result = await db.pomodoroSession.updateMany({
    where: {
      id: { in: sessionIds },
      userId,
    },
    data: {
      wasCompleted,
      completedAt: new Date(),
    },
  });

  return result.count;
}

/**
 * Get Pomodoro statistics for a user
 */
export async function getPomodoroStatistics(
  userId: string,
  taskId?: string
): Promise<PomodoroStatistics> {
  const where: Prisma.PomodoroSessionWhereInput = {
    userId,
    ...(taskId && { taskId }),
  };

  const sessions = await db.pomodoroSession.findMany({
    where,
    orderBy: { startedAt: 'desc' },
  });

  return calculateStatistics(sessions.map(toPomodoroDto));
}

/**
 * Get today's Pomodoro sessions
 */
export async function getTodayPomodoroSessions(userId: string): Promise<PomodoroSessionDto[]> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessions = await db.pomodoroSession.findMany({
    where: {
      userId,
      startedAt: {
        gte: today,
        lt: tomorrow,
      },
    },
    orderBy: { startedAt: 'desc' },
  });

  return sessions.map(toPomodoroDto);
}

/**
 * Get active (incomplete) Pomodoro session
 */
export async function getActivePomodoroSession(userId: string): Promise<PomodoroSessionDto | null> {
  const session = await db.pomodoroSession.findFirst({
    where: {
      userId,
      wasCompleted: false,
      completedAt: null,
    },
    orderBy: { startedAt: 'desc' },
  });

  return session ? toPomodoroDto(session) : null;
}

/**
 * Get sessions grouped by task
 */
export async function getPomodoroSessionsByTask(
  userId: string
): Promise<
  Array<{ taskId: string | null; taskTitle: string | null; count: number; totalTime: number }>
> {
  const sessions = await db.pomodoroSession.findMany({
    where: {
      userId,
      wasCompleted: true,
      type: 'work',
    },
    orderBy: { startedAt: 'desc' },
  });

  const grouped: Record<
    string,
    { taskId: string | null; taskTitle: string | null; count: number; totalTime: number }
  > = {};

  for (const session of sessions) {
    const key = session.taskId || 'unassigned';
    if (!grouped[key]) {
      // Fetch task title if taskId exists
      let taskTitle = null;
      if (session.taskId) {
        const task = await db.task.findUnique({
          where: { id: session.taskId },
          select: { title: true },
        });
        taskTitle = task?.title || null;
      }

      grouped[key] = {
        taskId: session.taskId,
        taskTitle,
        count: 0,
        totalTime: 0,
      };
    }
    grouped[key].count += 1;
    grouped[key].totalTime += session.duration;
  }

  return Object.values(grouped).sort((a, b) => b.totalTime - a.totalTime);
}

/**
 * Get recent completed sessions
 */
export async function getRecentPomodoroSessions(
  userId: string,
  limit: number = 10
): Promise<PomodoroSessionDto[]> {
  const sessions = await db.pomodoroSession.findMany({
    where: {
      userId,
      wasCompleted: true,
    },
    orderBy: { completedAt: 'desc' },
    take: limit,
  });

  return sessions.map(toPomodoroDto);
}

/**
 * Delete old Pomodoro sessions (cleanup utility)
 */
export async function deleteOldPomodoroSessions(
  userId: string,
  olderThanDays: number = 90
): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  const result = await db.pomodoroSession.deleteMany({
    where: {
      userId,
      startedAt: {
        lt: cutoffDate,
      },
    },
  });

  return result.count;
}
