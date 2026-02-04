'use client';

import { useState } from 'react';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useTasks } from '@/hooks/useTasks';
import {
  PomodoroTimer,
  PomodoroSettingsModal,
  PomodoroTaskSelectorModal,
  PomodoroStatistics,
  PomodoroSessionList,
} from '@/components/pomodoro';
import { MobileNav, getDefaultNavItems } from '@/components/mobile';

/**
 * Pomodoro Page - Focus timer with statistics.
 *
 * Features:
 * - 25/5 minute Pomodoro timer
 * - Customizable durations
 * - Task linking
 * - Session statistics
 * - Recent session history
 * - Sound and browser notifications
 * - Mobile responsive with bottom nav
 * - Warm Claude theme styling
 */
export default function PomodoroPage() {
  // Pomodoro state
  const {
    timerState,
    formattedTime,
    progress,
    settings,
    updateSettings,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    statistics,
    statisticsLoading,
    sessions,
    sessionsLoading,
    isRunning,
    isPaused,
    isStopped,
    currentTaskId,
  } = usePomodoro({
    autoFetch: true,
    onSessionComplete: (session) => {
      // Auto-start break if enabled
      if (session.type === 'work' && settings.autoStartBreak) {
        setTimeout(() => {
          startTimer({ type: 'break' });
        }, 1000);
      }
    },
  });

  // Tasks for linking
  const { tasks } = useTasks({
    autoFetch: true,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Modal states
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTaskSelectorOpen, setIsTaskSelectorOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Handle timer start with task
  const handleStart = () => {
    startTimer(
      selectedTaskId
        ? {
            taskId: selectedTaskId,
            taskTitle: tasks.find((t) => t.id === selectedTaskId)?.title ?? undefined,
          }
        : undefined
    );
  };

  // Handle task selection
  const handleSelectTask = (taskId: string | null) => {
    setSelectedTaskId(taskId);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍅</span>
            <h1 className="text-xl font-semibold text-text-primary">Pomodoro Timer</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 pb-24">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Timer */}
          <div className="flex flex-col gap-6">
            <PomodoroTimer
              timerState={timerState}
              formattedTime={formattedTime}
              progress={progress}
              isRunning={isRunning}
              isPaused={isPaused}
              isStopped={isStopped}
              currentTaskId={currentTaskId}
              onStart={handleStart}
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStop={stopTimer}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenTaskSelector={() => setIsTaskSelectorOpen(true)}
            />

            {/* Current Task Display */}
            {selectedTaskId && (
              <div className="bg-background-card rounded-xl p-4">
                <div className="text-sm text-text-secondary mb-2">Linked Task</div>
                <div className="text-text-primary font-medium">
                  {tasks.find((t) => t.id === selectedTaskId)?.title || 'Unknown task'}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Statistics & Sessions */}
          <div className="flex flex-col gap-6">
            <PomodoroStatistics statistics={statistics} isLoading={statisticsLoading} />

            <PomodoroSessionList sessions={sessions} isLoading={sessionsLoading} />
          </div>
        </div>
      </main>

      {/* Modals */}
      <PomodoroSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <PomodoroTaskSelectorModal
        isOpen={isTaskSelectorOpen}
        onClose={() => setIsTaskSelectorOpen(false)}
        tasks={tasks}
        selectedTaskId={selectedTaskId}
        onSelectTask={handleSelectTask}
      />

      {/* Mobile Navigation */}
      <MobileNav items={getDefaultNavItems()} currentPath="/pomodoro" />
    </div>
  );
}
