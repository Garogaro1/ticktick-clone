/**
 * Goal Tracker Utilities
 *
 * Helper functions for goal progress calculation, deadline tracking, and formatting.
 */

import type { GoalProgress, GoalDeadlineInfo } from './types';
import { startOfDay, differenceInDays } from 'date-fns';

// ============================================================================
// Progress Calculation
// ============================================================================

/**
 * Calculate progress percentage for a goal.
 */
export function calculateGoalProgress(
  currentValue: number,
  targetValue: number | null | undefined
): GoalProgress {
  const current = Math.max(0, currentValue);
  const target = targetValue ?? null;

  if (target === null) {
    return {
      current,
      target: null,
      percentage: 0,
      remaining: null,
      isCompleted: false,
    };
  }

  const percentage = Math.min(100, Math.max(0, Math.round((current / target) * 100)));
  const remaining = Math.max(0, target - current);
  const isCompleted = current >= target;

  return {
    current,
    target,
    percentage,
    remaining,
    isCompleted,
  };
}

/**
 * Get a random goal color for visual differentiation.
 */
export function getRandomGoalColor(): string {
  const colors = [
    '#D97757', // Terracotta (warm)
    '#E07A5F', // Coral
    '#81B29A', // Sage green
    '#F2CC8F', // Soft yellow
    '#3D405B', // Deep blue
    '#8E9AAF', // Muted blue
    '#E76F51', // Burnt orange
    '#2A9D8F', // Teal
    '#264653', // Dark teal
    '#F4A261', // Sandy orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Get status badge color for a goal.
 */
export function getGoalStatusColor(
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED'
): string {
  switch (status) {
    case 'ACTIVE':
      return '#D97757'; // Terracotta
    case 'PAUSED':
      return '#F4A261'; // Sandy orange
    case 'COMPLETED':
      return '#81B29A'; // Sage green
    case 'ABANDONED':
      return '#9CA3AF'; // Gray
    default:
      return '#D97757';
  }
}

/**
 * Get status label for display.
 */
export function getGoalStatusLabel(
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ABANDONED'
): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'PAUSED':
      return 'Paused';
    case 'COMPLETED':
      return 'Completed';
    case 'ABANDONED':
      return 'Abandoned';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// Deadline Calculation
// ============================================================================

/**
 * Calculate deadline information for a goal.
 */
export function getGoalDeadlineInfo(deadline: Date | null): GoalDeadlineInfo {
  if (!deadline) {
    return {
      isOverdue: false,
      daysRemaining: null,
      deadline: null,
      timeRemaining: 'No deadline',
    };
  }

  const today = startOfDay(new Date());
  const deadlineDate = startOfDay(deadline);
  const daysRemaining = differenceInDays(deadlineDate, today);
  const isOverdue = daysRemaining < 0;

  let timeRemaining: string;
  if (isOverdue) {
    const daysPast = Math.abs(daysRemaining);
    if (daysPast === 1) {
      timeRemaining = '1 day overdue';
    } else if (daysPast < 7) {
      timeRemaining = `${daysPast} days overdue`;
    } else if (daysPast < 30) {
      const weeks = Math.floor(daysPast / 7);
      timeRemaining = `${weeks} week${weeks > 1 ? 's' : ''} overdue`;
    } else {
      const months = Math.floor(daysPast / 30);
      timeRemaining = `${months} month${months > 1 ? 's' : ''} overdue`;
    }
  } else if (daysRemaining === 0) {
    timeRemaining = 'Due today';
  } else if (daysRemaining === 1) {
    timeRemaining = '1 day left';
  } else if (daysRemaining < 7) {
    timeRemaining = `${daysRemaining} days left`;
  } else if (daysRemaining < 30) {
    const weeks = Math.floor(daysRemaining / 7);
    timeRemaining = `${weeks} week${weeks > 1 ? 's' : ''} left`;
  } else {
    const months = Math.floor(daysRemaining / 30);
    timeRemaining = `${months} month${months > 1 ? 's' : ''} left`;
  }

  return {
    isOverdue,
    daysRemaining,
    deadline: deadlineDate,
    timeRemaining,
  };
}

/**
 * Format progress bar color based on percentage.
 */
export function getProgressColor(percentage: number, isOverdue: boolean): string {
  if (isOverdue) {
    return '#EF4444'; // Red
  }
  if (percentage >= 100) {
    return '#81B29A'; // Green (completed)
  }
  if (percentage >= 75) {
    return '#2A9D8F'; // Teal
  }
  if (percentage >= 50) {
    return '#D97757'; // Terracotta (primary)
  }
  if (percentage >= 25) {
    return '#F4A261'; // Orange
  }
  return '#E76F51'; // Burnt orange
}

/**
 * Calculate if a goal should be marked as completed based on progress.
 */
export function shouldAutoCompleteGoal(
  currentValue: number,
  targetValue: number | null | undefined
): boolean {
  if (!targetValue) return false;
  return currentValue >= targetValue;
}

/**
 * Get motivation message based on progress.
 */
export function getGoalMotivationMessage(
  percentage: number,
  daysRemaining: number | null
): string | null {
  if (percentage >= 100) {
    return 'Goal achieved! Great work!';
  }

  if (daysRemaining !== null && daysRemaining < 0) {
    return 'This goal is overdue. Keep pushing!';
  }

  if (daysRemaining !== null && daysRemaining <= 3 && percentage < 75) {
    return 'Deadline approaching! Stay focused.';
  }

  if (percentage >= 75) {
    return 'Almost there! Keep going!';
  }

  if (percentage >= 50) {
    return "Halfway there! You've got this.";
  }

  if (percentage >= 25) {
    return 'Making progress. Stay consistent!';
  }

  return null;
}

/**
 * Generate goal suggestions based on common patterns.
 */
export function getGoalSuggestions(): Array<{ title: string; unit: string; targetValue: number }> {
  return [
    { title: 'Complete tasks', unit: 'tasks', targetValue: 100 },
    { title: 'Read books', unit: 'books', targetValue: 12 },
    { title: 'Exercise sessions', unit: 'sessions', targetValue: 50 },
    { title: 'Meditation minutes', unit: 'minutes', targetValue: 1000 },
    { title: 'Projects completed', unit: 'projects', targetValue: 5 },
    { title: 'Learn new skills', unit: 'skills', targetValue: 3 },
    { title: 'Write journal entries', unit: 'entries', targetValue: 30 },
    { title: 'Code review contributions', unit: 'reviews', targetValue: 20 },
  ];
}
