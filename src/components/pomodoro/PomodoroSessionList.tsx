'use client';

import { cn } from '@/lib/utils';
import type { PomodoroSessionDto } from '@/lib/pomodoro/types';
import { formatDuration } from '@/lib/pomodoro/utils';
import { format } from 'date-fns';

export interface PomodoroSessionListProps {
  sessions: PomodoroSessionDto[];
  isLoading?: boolean;
  className?: string;
}

/**
 * PomodoroSessionList component for displaying recent Pomodoro sessions.
 *
 * Features:
 * - List of recent sessions
 * - Completion status indicator
 * - Session type (work/break)
 * - Duration and time display
 * - Empty state
 * - Warm Claude theme styling
 */
export function PomodoroSessionList({
  sessions,
  isLoading = false,
  className,
}: PomodoroSessionListProps) {
  if (isLoading) {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-background-card rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center p-8 bg-background-card rounded-xl',
          className
        )}
      >
        <span className="text-4xl mb-3">⏱️</span>
        <p className="text-text-secondary">No sessions yet</p>
        <p className="text-sm text-text-tertiary mt-1">
          Start a timer to track your focus sessions
        </p>
      </div>
    );
  }

  const formatSessionTime = (date: Date) => {
    const now = new Date();
    const sessionDate = new Date(date);
    const diffMs = now.getTime() - sessionDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return format(sessionDate, 'MMM d');
  };

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <h3 className="text-sm font-medium text-text-secondary px-2">Recent Sessions</h3>

      <div className="flex flex-col gap-2">
        {sessions.map((session) => {
          const isWork = session.type === 'work';
          const isCompleted = session.wasCompleted;

          return (
            <div
              key={session.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg bg-background-card',
                'transition-all duration-200',
                isCompleted ? 'opacity-100' : 'opacity-60'
              )}
            >
              {/* Session Type Icon */}
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full',
                  isWork ? 'bg-primary/15 text-primary' : 'bg-green-100 text-green-700'
                )}
              >
                {isWork ? '🎯' : '☕'}
              </div>

              {/* Session Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-text-primary font-medium">
                    {isWork ? 'Focus' : 'Break'}
                  </span>
                  <span className="text-text-tertiary">•</span>
                  <span className="text-sm text-text-secondary tabular-nums">
                    {formatDuration(session.duration)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-text-tertiary">
                    {formatSessionTime(session.startedAt)}
                  </span>
                  {!isCompleted && (
                    <>
                      <span className="text-text-tertiary">•</span>
                      <span className="text-xs text-text-secondary">Incomplete</span>
                    </>
                  )}
                </div>
              </div>

              {/* Completion Status */}
              <div className="flex items-center">
                {isCompleted ? (
                  <span className="text-green-500" aria-label="Completed">
                    ✓
                  </span>
                ) : (
                  <span className="text-text-tertiary" aria-label="Incomplete">
                    ○
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
