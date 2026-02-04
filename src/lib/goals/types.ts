/**
 * Goal Tracker Types
 *
 * TypeScript types for goal CRUD operations and progress tracking.
 */

import type { Goal as PrismaGoal, Task as PrismaTask } from '@prisma/client';

// ============================================================================
// DTO Types (Data Transfer Objects)
// ============================================================================

export interface GoalDto extends PrismaGoal {
  _count?: {
    tasks: number;
  };
  progress?: number; // Percentage (0-100)
  isOverdue?: boolean;
  daysRemaining?: number | null;
  completedTasks?: PrismaTask[];
  relatedTasks?: PrismaTask[];
}

export interface GoalWithTasks extends GoalDto {
  tasks: PrismaTask[];
}

// ============================================================================
// Request/Response Types
// ============================================================================

export interface CreateGoalInput {
  title: string;
  description?: string;
  targetValue?: number;
  unit?: string;
  deadline?: Date;
  sortOrder?: number;
}

export interface UpdateGoalInput {
  title?: string;
  description?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  deadline?: Date | null;
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  sortOrder?: number;
}

export interface GoalListFilters {
  status?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED';
  search?: string;
  sortBy?: 'createdAt' | 'title' | 'sortOrder' | 'deadline' | 'progress';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface GoalListResponse {
  goals: GoalDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface UpdateGoalProgressInput {
  increment?: number; // Add to current value
  setValue?: number; // Set to specific value
  taskId?: string; // Link a completed task to this goal
}

// ============================================================================
// Statistics Types
// ============================================================================

export interface GoalStatistics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  abandonedGoals: number;
  pausedGoals: number;
  overallProgress: number; // Average progress of all active goals
  goalsCompletedThisMonth: number;
  goalsCompletedThisYear: number;
  nearestDeadlines: {
    goalId: string;
    goalTitle: string;
    deadline: Date;
    daysRemaining: number;
    progress: number;
  }[];
  mostProgressed: {
    goalId: string;
    goalTitle: string;
    progress: number;
    currentValue: number;
    targetValue: number | null;
  }[];
}

// ============================================================================
// Progress Calculation Types
// ============================================================================

export interface GoalProgress {
  current: number;
  target: number | null;
  percentage: number;
  remaining: number | null;
  isCompleted: boolean;
}

export interface GoalDeadlineInfo {
  isOverdue: boolean;
  daysRemaining: number | null;
  deadline: Date | null;
  timeRemaining: string; // Human-readable (e.g., "5 days", "2 weeks")
}

// ============================================================================
// View Types
// ============================================================================

export type GoalViewType = 'list' | 'cards' | 'timeline';

export interface GoalViewOptions {
  viewType: GoalViewType;
  statusFilter?: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED' | 'all';
  showCompleted: boolean;
}
