'use client';

/**
 * GoalBadge Component
 *
 * Displays a compact goal badge with title and progress indicator.
 */

import { cn } from '@/lib/utils';
import type { GoalDto } from '@/lib/goals';
import type { TaskGoalDto } from '@/lib/tasks/types';

export interface GoalBadgeProps {
  goal: GoalDto | TaskGoalDto | null | undefined;
  variant?: 'compact' | 'default';
  showProgress?: boolean;
  className?: string;
  onClick?: () => void;
}

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-primary/10 text-primary',
  PAUSED: 'bg-text-tertiary/10 text-text-tertiary',
  COMPLETED: 'bg-success/10 text-success',
  ABANDONED: 'bg-text-tertiary/20 text-text-tertiary',
};

export function GoalBadge({
  goal,
  variant = 'compact',
  showProgress = false,
  className,
  onClick,
}: GoalBadgeProps) {
  if (!goal) return null;

  const statusColor = statusColors[goal.status] || statusColors.ACTIVE;
  const progress = goal.progress ?? 0;
  const isCompleted = goal.status === 'COMPLETED' || progress >= 100;

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full text-xs font-medium transition-all duration-200',
        variant === 'compact' ? 'px-2 py-0.5' : 'px-3 py-1',
        statusColor,
        onClick && 'hover:opacity-80 cursor-pointer',
        className
      )}
      type="button"
    >
      {/* Goal icon */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={cn('flex-shrink-0', isCompleted && 'text-success')}
      >
        <circle cx="12" cy="12" r="10" />
        {isCompleted ? (
          <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </svg>

      {/* Goal title (truncated) */}
      {variant === 'default' && <span className="max-w-[120px] truncate">{goal.title}</span>}

      {/* Progress indicator */}
      {showProgress && goal.targetValue && <span className="text-xs opacity-80">{progress}%</span>}
    </button>
  );
}
