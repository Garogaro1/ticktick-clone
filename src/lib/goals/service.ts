/**
 * Goal Tracker Service Layer
 *
 * Business logic for goal CRUD operations, progress calculation, and statistics.
 */

import { db } from '@/lib/db';
import type { Task } from '@prisma/client';
import type {
  GoalDto,
  CreateGoalInput,
  UpdateGoalInput,
  GoalListFilters,
  GoalListResponse,
  UpdateGoalProgressInput,
  GoalStatistics,
  GoalWithTasks,
} from './types';
import { calculateGoalProgress, getGoalDeadlineInfo, shouldAutoCompleteGoal } from './utils';
import { startOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } from '@/lib/utils/date';

// ============================================================================
// Goal CRUD Operations
// ============================================================================

/**
 * Get all goals for a user with optional filtering.
 */
export async function getGoals(
  userId: string,
  filters: GoalListFilters = {}
): Promise<GoalListResponse> {
  const { status, search, sortBy = 'sortOrder', sortOrder = 'asc', page = 1, limit = 50 } = filters;

  // Build where clause
  const where: {
    userId: string;
    status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
    title?: { contains: string; mode: 'insensitive' };
  } = { userId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  // Build order by
  let orderBy: { sortOrder?: 'asc' | 'desc'; [key: string]: 'asc' | 'desc' | undefined } = {};
  if (sortBy === 'progress') {
    // Special handling for progress-based sorting (done after fetch)
    orderBy = { sortOrder: sortOrder === 'asc' ? 'asc' : 'desc' };
  } else {
    orderBy = { [sortBy]: sortOrder };
  }

  // Count total
  const total = await db.goal.count({ where });

  // Calculate pagination
  const skip = (page - 1) * limit;
  const totalPages = Math.ceil(total / limit);

  // Fetch goals
  const goals = await db.goal.findMany({
    where,
    orderBy,
    skip,
    take: limit,
  });

  // Enrich with progress and deadline data
  let enrichedGoals = goals.map((goal) => enrichGoalWithData(goal));

  // Sort by progress if needed
  if (sortBy === 'progress') {
    enrichedGoals = enrichedGoals.sort((a, b) => {
      const aProgress = a.progress ?? 0;
      const bProgress = b.progress ?? 0;
      return sortOrder === 'asc' ? aProgress - bProgress : bProgress - aProgress;
    });
  }

  return {
    goals: enrichedGoals,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get a single goal by ID.
 */
export async function getGoalById(userId: string, goalId: string): Promise<GoalDto | null> {
  const goal = await db.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) return null;

  return enrichGoalWithData(goal);
}

/**
 * Get a goal with associated tasks.
 */
export async function getGoalWithTasks(
  userId: string,
  goalId: string
): Promise<GoalWithTasks | null> {
  const goal = await db.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!goal) return null;

  // Get tasks linked to this goal (will need goalId field on Task model)
  // For now, return empty array until we add the relation
  const tasks: Task[] = [];

  return {
    ...enrichGoalWithData(goal),
    tasks,
  };
}

/**
 * Create a new goal.
 */
export async function createGoal(userId: string, input: CreateGoalInput): Promise<GoalDto> {
  const data: {
    userId: string;
    title: string;
    description: string | null | undefined;
    targetValue: number | null;
    currentValue: number;
    unit: string | null | undefined;
    deadline: Date | null | undefined;
    sortOrder: number;
    status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  } = {
    userId,
    title: input.title,
    description: input.description ?? null,
    targetValue: input.targetValue ?? null,
    currentValue: 0,
    unit: input.unit ?? null,
    deadline: input.deadline ?? null,
    sortOrder: input.sortOrder ?? 0,
    status: 'ACTIVE',
  };

  const goal = await db.goal.create({
    data,
  });

  return enrichGoalWithData(goal);
}

/**
 * Update an existing goal.
 */
export async function updateGoal(
  userId: string,
  goalId: string,
  input: UpdateGoalInput
): Promise<GoalDto | null> {
  // Verify ownership
  const existing = await db.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) return null;

  const goal = await db.goal.update({
    where: { id: goalId },
    data: input,
  });

  return enrichGoalWithData(goal);
}

/**
 * Delete a goal.
 */
export async function deleteGoal(userId: string, goalId: string): Promise<boolean> {
  // Verify ownership
  const existing = await db.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) return false;

  await db.goal.delete({
    where: { id: goalId },
  });

  return true;
}

/**
 * Batch delete goals.
 */
export async function batchDeleteGoals(userId: string, goalIds: string[]): Promise<number> {
  const result = await db.goal.deleteMany({
    where: {
      id: { in: goalIds },
      userId,
    },
  });

  return result.count;
}

/**
 * Update goal sort orders.
 */
export async function updateGoalOrders(
  userId: string,
  orders: { id: string; sortOrder: number }[]
): Promise<void> {
  await db.$transaction(
    orders.map(({ id, sortOrder }) =>
      db.goal.updateMany({
        where: { id, userId },
        data: { sortOrder },
      })
    )
  );
}

// ============================================================================
// Progress Update Operations
// ============================================================================

/**
 * Update goal progress (increment or set value).
 */
export async function updateGoalProgress(
  userId: string,
  goalId: string,
  input: UpdateGoalProgressInput
): Promise<GoalDto | null> {
  // Verify ownership
  const existing = await db.goal.findFirst({
    where: { id: goalId, userId },
  });

  if (!existing) return null;

  let currentValue = existing.currentValue;
  let status = existing.status;

  // Handle increment
  if (input.increment !== undefined) {
    currentValue = Math.max(0, currentValue + input.increment);
  }

  // Handle set value
  if (input.setValue !== undefined) {
    currentValue = input.setValue;
  }

  // Handle task linking (count completed tasks)
  if (input.taskId !== undefined) {
    // When task-goal relation is added, we can count tasks
    // For now, just increment by 1 for each task linked
    currentValue += 1;
  }

  // Auto-complete if target reached
  if (shouldAutoCompleteGoal(currentValue, existing.targetValue) && status === 'ACTIVE') {
    status = 'COMPLETED';
  }

  const goal = await db.goal.update({
    where: { id: goalId },
    data: {
      currentValue,
      status,
    },
  });

  return enrichGoalWithData(goal);
}

/**
 * Batch update goal status.
 */
export async function batchUpdateGoalStatus(
  userId: string,
  goalIds: string[],
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED'
): Promise<number> {
  const result = await db.goal.updateMany({
    where: {
      id: { in: goalIds },
      userId,
    },
    data: { status },
  });

  return result.count;
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get statistics for all user goals.
 */
export async function getGoalStatistics(userId: string): Promise<GoalStatistics> {
  const goals = await db.goal.findMany({
    where: { userId },
  });

  const activeGoals = goals.filter((g) => g.status === 'ACTIVE');
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');
  const pausedGoals = goals.filter((g) => g.status === 'PAUSED');
  const abandonedGoals = goals.filter((g) => g.status === 'ABANDONED');

  const today = startOfDay(new Date());
  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = endOfMonth(today);
  const thisYearStart = startOfYear(today);
  const thisYearEnd = endOfYear(today);

  // Calculate overall progress for active goals
  let totalProgress = 0;
  const nearestDeadlines: Array<{
    goalId: string;
    goalTitle: string;
    deadline: Date;
    daysRemaining: number;
    progress: number;
  }> = [];
  const mostProgressed: Array<{
    goalId: string;
    goalTitle: string;
    progress: number;
    currentValue: number;
    targetValue: number | null;
  }> = [];

  for (const goal of activeGoals) {
    const progressData = calculateGoalProgress(goal.currentValue, goal.targetValue);
    totalProgress += progressData.percentage;

    // Track most progressed goals
    mostProgressed.push({
      goalId: goal.id,
      goalTitle: goal.title,
      progress: progressData.percentage,
      currentValue: goal.currentValue,
      targetValue: goal.targetValue,
    });

    // Track deadlines
    if (goal.deadline) {
      const deadlineInfo = getGoalDeadlineInfo(goal.deadline);
      nearestDeadlines.push({
        goalId: goal.id,
        goalTitle: goal.title,
        deadline: goal.deadline,
        daysRemaining: deadlineInfo.daysRemaining ?? 0,
        progress: progressData.percentage,
      });
    }
  }

  // Sort and limit
  mostProgressed.sort((a, b) => b.progress - a.progress);
  nearestDeadlines.sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Goals completed this month/year
  const goalsCompletedThisMonth = completedGoals.filter((g) => {
    return g.updatedAt >= thisMonthStart && g.updatedAt <= thisMonthEnd;
  }).length;

  const goalsCompletedThisYear = completedGoals.filter((g) => {
    return g.updatedAt >= thisYearStart && g.updatedAt <= thisYearEnd;
  }).length;

  // Calculate overall progress
  const overallProgress =
    activeGoals.length > 0 ? Math.round(totalProgress / activeGoals.length) : 0;

  return {
    totalGoals: goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    abandonedGoals: abandonedGoals.length,
    pausedGoals: pausedGoals.length,
    overallProgress,
    goalsCompletedThisMonth,
    goalsCompletedThisYear,
    nearestDeadlines: nearestDeadlines.slice(0, 5),
    mostProgressed: mostProgressed.slice(0, 5),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Enrich a goal with progress, deadline, and task count data.
 */
function enrichGoalWithData(goal: {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  targetValue: number | null;
  currentValue: number;
  unit: string | null;
  deadline: Date | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): GoalDto {
  // Calculate progress
  const progressData = calculateGoalProgress(goal.currentValue, goal.targetValue);

  // Get deadline info
  const deadlineInfo = getGoalDeadlineInfo(goal.deadline);

  return {
    ...goal,
    progress: progressData.percentage,
    isOverdue: deadlineInfo.isOverdue,
    daysRemaining: deadlineInfo.daysRemaining,
  };
}

/**
 * Get goals due soon (within 7 days).
 */
export async function getUpcomingDeadlines(userId: string, days: number = 7): Promise<GoalDto[]> {
  const goals = await db.goal.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      deadline: { not: null },
    },
  });

  const today = startOfDay(new Date());
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return goals
    .filter((g) => {
      if (!g.deadline) return false;
      const deadlineDate = startOfDay(g.deadline);
      return deadlineDate >= today && deadlineDate <= futureDate;
    })
    .map((goal) => enrichGoalWithData(goal))
    .sort((a, b) => {
      const aDays = a.daysRemaining ?? 999;
      const bDays = b.daysRemaining ?? 999;
      return aDays - bDays;
    });
}

/**
 * Get stalled goals (active but with little progress near deadline).
 */
export async function getStalledGoals(userId: string): Promise<GoalDto[]> {
  const goals = await db.goal.findMany({
    where: {
      userId,
      status: 'ACTIVE',
      deadline: { not: null },
      targetValue: { not: null },
    },
  });

  const today = startOfDay(new Date());

  return goals
    .filter((g) => {
      if (!g.deadline || !g.targetValue) return false;

      const deadlineDate = startOfDay(g.deadline);
      const daysUntilDeadline = Math.ceil(
        (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );
      const progress = calculateGoalProgress(g.currentValue, g.targetValue);

      // Stalled if less than 50% complete but less than 50% of time remains
      const timeUsed = 1 - daysUntilDeadline / 30; // Assume 30-day goal period
      return progress.percentage < 50 && timeUsed > 0.5;
    })
    .map((goal) => enrichGoalWithData(goal));
}
