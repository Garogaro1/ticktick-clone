'use client';

/**
 * GoalProgressBar Component
 *
 * Visual progress bar for goals with animations and color coding.
 */

import { motion } from 'framer-motion';
import type { GoalDto } from '@/lib/goals';
import { getProgressColor, getGoalMotivationMessage } from '@/lib/goals/utils';

export interface GoalProgressBarProps {
  goal: GoalDto;
  showLabel?: boolean;
  showRemaining?: boolean;
  showMotivation?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export function GoalProgressBar({
  goal,
  showLabel = true,
  showRemaining = false,
  showMotivation = false,
  size = 'md',
  animated = true,
  className = '',
}: GoalProgressBarProps) {
  const progress = goal.progress ?? 0;
  const isOverdue = goal.isOverdue ?? false;
  const color = getProgressColor(progress, isOverdue);

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const motivationMessage = showMotivation
    ? getGoalMotivationMessage(progress, goal.daysRemaining ?? null)
    : null;

  return (
    <div className={className}>
      {/* Label Row */}
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-semibold" style={{ color }}>
            {progress}%
          </span>
        </div>
      )}

      {/* Progress Bar */}
      <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <motion.div
          initial={animated ? { width: 0 } : false}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Remaining */}
      {showRemaining && goal.targetValue && (
        <div className="mt-1 text-xs text-gray-500">
          {goal.currentValue} / {goal.targetValue} {goal.unit || ''}
          {progress < 100 && (
            <span className="ml-2">
              ({goal.targetValue - goal.currentValue} {goal.unit || ''} remaining)
            </span>
          )}
        </div>
      )}

      {/* Motivation Message */}
      {motivationMessage && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-gray-600 italic"
        >
          {motivationMessage}
        </motion.p>
      )}
    </div>
  );
}
