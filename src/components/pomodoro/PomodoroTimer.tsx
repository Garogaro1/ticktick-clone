'use client';

import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { PomodoroTimerState } from '@/lib/pomodoro/types';

export interface PomodoroTimerProps {
  timerState: PomodoroTimerState;
  formattedTime: string;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  isStopped: boolean;
  currentTaskId: string | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onOpenSettings?: () => void;
  onOpenTaskSelector?: () => void;
  className?: string;
}

/**
 * PomodoroTimer component for the focus timer display and controls.
 *
 * Features:
 * - Large timer display with circular progress
 * - Play/Pause/Stop controls
 * - Session type indicator (work/break)
 * - Linked task display
 * - Warm Claude theme styling
 */
export function PomodoroTimer({
  timerState,
  formattedTime,
  progress,
  isRunning,
  isPaused,
  isStopped,
  currentTaskId,
  onStart,
  onPause,
  onResume,
  onStop,
  onOpenSettings,
  onOpenTaskSelector,
  className,
}: PomodoroTimerProps) {
  const isWork = timerState.type === 'work';
  const primaryColor = isWork ? '#D97757' : '#7B9A68';

  return (
    <div className={cn('flex flex-col items-center gap-6', className)}>
      {/* Session Type Badge */}
      <div className="flex items-center gap-4">
        <span
          className="rounded-full px-4 py-1.5 text-sm font-medium transition-colors"
          style={{
            backgroundColor: isWork ? 'rgba(217, 119, 87, 0.15)' : 'rgba(123, 154, 104, 0.15)',
            color: primaryColor,
          }}
        >
          {isWork ? '🎯 Focus' : '☕ Break'}
        </span>

        {currentTaskId && onOpenTaskSelector && (
          <button
            onClick={onOpenTaskSelector}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Linked to task
          </button>
        )}

        {onOpenSettings && (
          <button
            onClick={onOpenSettings}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Timer settings"
          >
            ⚙️ Settings
          </button>
        )}
      </div>

      {/* Circular Timer Display */}
      <div className="relative">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="rgba(45, 42, 38, 0.1)"
            strokeWidth="12"
          />

          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={primaryColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            className="transition-all duration-300 ease-out"
          />

          {/* Inner glow for running state */}
          {isRunning && (
            <circle
              cx="140"
              cy="140"
              r="114"
              fill="none"
              stroke={primaryColor}
              strokeWidth="2"
              opacity="0.3"
              className="animate-pulse"
            />
          )}
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold text-text-primary tabular-nums tracking-tight">
            {formattedTime}
          </span>

          {/* Status indicator */}
          <div className="mt-2 flex items-center gap-2">
            {isRunning && (
              <span className="flex items-center gap-1 text-sm text-text-secondary">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Running
              </span>
            )}
            {isPaused && (
              <span className="flex items-center gap-1 text-sm text-text-secondary">
                <span className="inline-block w-2 h-2 rounded-sm bg-yellow-600"></span>
                Paused
              </span>
            )}
            {isStopped && <span className="text-sm text-text-secondary">Ready to start</span>}
          </div>
        </div>
      </div>

      {/* Timer Controls */}
      <div className="flex items-center gap-4">
        {isStopped ? (
          <Button variant="primary" size="lg" onClick={onStart} className="min-w-[140px]">
            ▶ Start
          </Button>
        ) : (
          <>
            {isRunning ? (
              <Button variant="secondary" size="md" onClick={onPause} className="min-w-[100px]">
                ⏸ Pause
              </Button>
            ) : (
              <Button variant="primary" size="md" onClick={onResume} className="min-w-[100px]">
                ▶ Resume
              </Button>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={onStop}
              className="min-w-[100px] text-text-secondary hover:text-text-primary"
            >
              ⏹ Stop
            </Button>
          </>
        )}
      </div>

      {/* Duration info */}
      <div className="text-center text-sm text-text-secondary">
        {isWork ? (
          <>
            Focus for <strong>{Math.round(timerState.duration / 60)} minutes</strong>
          </>
        ) : (
          <>
            Break for <strong>{Math.round(timerState.breakDuration / 60)} minutes</strong>
          </>
        )}
      </div>

      {/* Progress text */}
      {!isStopped && (
        <div className="text-sm text-text-secondary tabular-nums">
          {progress.toFixed(0)}% complete
        </div>
      )}
    </div>
  );
}
