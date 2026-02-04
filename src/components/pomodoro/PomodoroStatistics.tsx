'use client';

import { cn } from '@/lib/utils';
import type { PomodoroStatistics } from '@/lib/pomodoro/types';
import { formatDuration, getStreakMessage } from '@/lib/pomodoro/utils';

export interface PomodoroStatisticsProps {
  statistics: PomodoroStatistics | null;
  isLoading?: boolean;
  className?: string;
}

/**
 * PomodoroStatistics component for displaying Pomodoro statistics.
 *
 * Features:
 * - Total focus time display
 * - Today/week focus time
 * - Session counts and completion rate
 * - Streak display with motivational message
 * - Warm Claude theme styling
 */
export function PomodoroStatistics({
  statistics,
  isLoading = false,
  className,
}: PomodoroStatisticsProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-4 p-6 bg-background-card rounded-xl', className)}>
        <div className="animate-pulse flex gap-4">
          <div className="flex-1 h-24 bg-background-secondary rounded-lg" />
          <div className="flex-1 h-24 bg-background-secondary rounded-lg" />
          <div className="flex-1 h-24 bg-background-secondary rounded-lg" />
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className={cn('p-6 bg-background-card rounded-xl text-center', className)}>
        <p className="text-text-secondary">Start your first Pomodoro session to see statistics!</p>
      </div>
    );
  }

  const completionRate =
    statistics.totalSessions > 0
      ? (statistics.completedSessions / statistics.totalSessions) * 100
      : 0;

  return (
    <div className={cn('flex flex-col gap-4 p-6 bg-background-card rounded-xl', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">Statistics</h3>
        <span className="text-sm text-text-secondary">All time</span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Focus Time */}
        <div className="bg-background-secondary rounded-lg p-4">
          <div className="text-2xl font-bold text-text-primary tabular-nums">
            {formatDuration(statistics.totalFocusTime)}
          </div>
          <div className="text-sm text-text-secondary mt-1">Total Focus Time</div>
        </div>

        {/* Today Focus Time */}
        <div className="bg-background-secondary rounded-lg p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {formatDuration(statistics.todayFocusTime)}
          </div>
          <div className="text-sm text-text-secondary mt-1">Today</div>
        </div>

        {/* Completed Sessions */}
        <div className="bg-background-secondary rounded-lg p-4">
          <div className="text-2xl font-bold text-text-primary tabular-nums">
            {statistics.completedSessions}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            of {statistics.totalSessions} sessions
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-background-secondary rounded-lg p-4">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {statistics.currentStreak}
          </div>
          <div className="text-sm text-text-secondary mt-1">session streak</div>
        </div>
      </div>

      {/* Completion Rate Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Completion Rate</span>
          <span className="text-sm font-medium text-text-primary tabular-nums">
            {completionRate.toFixed(0)}%
          </span>
        </div>
        <div className="h-2 bg-background-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Streak Message */}
      {statistics.currentStreak > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-primary font-medium">
            {getStreakMessage(statistics.currentStreak)}
          </p>
        </div>
      )}

      {/* Week Overview */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-text-primary">This Week</h4>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-background-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${Math.min(100, (statistics.weekFocusTime / (25 * 5)) * 100)}%` }}
            />
          </div>
          <span className="text-sm text-text-secondary whitespace-nowrap">
            {formatDuration(statistics.weekFocusTime)} this week
          </span>
        </div>
      </div>

      {/* Average Session Length */}
      {statistics.averageSessionLength > 0 && (
        <div className="flex items-center justify-between py-3 border-t border-border">
          <span className="text-sm text-text-secondary">Average Session</span>
          <span className="text-sm font-medium text-text-primary tabular-nums">
            {Math.round(statistics.averageSessionLength)} minutes
          </span>
        </div>
      )}

      {/* Longest Streak */}
      {statistics.longestStreak > 0 && (
        <div className="flex items-center justify-between py-3 border-t border-border">
          <span className="text-sm text-text-secondary">Longest Streak</span>
          <span className="text-sm font-medium text-text-primary tabular-nums">
            {statistics.longestStreak} sessions
          </span>
        </div>
      )}
    </div>
  );
}
