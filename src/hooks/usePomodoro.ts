'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  PomodoroSessionDto,
  PomodoroTimerState,
  PomodoroSettings,
  PomodoroSessionType,
  PomodoroStatistics,
} from '@/lib/pomodoro/types';
import { formatTime, minutesToSeconds, calculateProgress } from '@/lib/pomodoro/utils';

const TIMER_STORAGE_KEY = 'pomodoro-timer';
const SETTINGS_STORAGE_KEY = 'pomodoro-settings';

export interface UsePomodoroOptions {
  autoFetch?: boolean;
  onSessionComplete?: (session: PomodoroSessionDto) => void;
  onTick?: (remaining: number) => void;
}

export interface UsePomodoroResult {
  // Timer state
  timerState: PomodoroTimerState;
  formattedTime: string;
  progress: number;

  // Settings
  settings: PomodoroSettings;
  updateSettings: (newSettings: Partial<PomodoroSettings>) => void;

  // Timer controls
  startTimer: (options?: {
    duration?: number;
    type?: PomodoroSessionType;
    taskId?: string;
    taskTitle?: string;
  }) => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  stopTimer: (wasCompleted?: boolean) => Promise<void>;

  // Statistics
  statistics: PomodoroStatistics | null;
  statisticsLoading: boolean;
  refreshStatistics: () => Promise<void>;

  // Sessions
  sessions: PomodoroSessionDto[];
  sessionsLoading: boolean;
  refreshSessions: () => Promise<void>;

  // State helpers
  isRunning: boolean;
  isPaused: boolean;
  isStopped: boolean;
  currentTaskId: string | null;
}

/**
 * Hook for managing Pomodoro timer state and sessions.
 *
 * Provides timer controls, statistics, and session management
 * with localStorage persistence.
 */
export function usePomodoro(options: UsePomodoroOptions = {}): UsePomodoroResult {
  const { autoFetch = true, onSessionComplete, onTick } = options;

  // Timer state
  const [timerState, setTimerState] = useState<PomodoroTimerState>(() => loadTimerState());
  const [settings, setSettings] = useState<PomodoroSettings>(() => loadSettings());

  // Statistics and sessions
  const [statistics, setStatistics] = useState<PomodoroStatistics | null>(null);
  const [statisticsLoading, setStatisticsLoading] = useState(false);
  const [sessions, setSessions] = useState<PomodoroSessionDto[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Refs for timer management
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Persist timer state
  const persistTimerState = useCallback((state: PomodoroTimerState) => {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Persist settings
  const persistSettings = useCallback((newSettings: PomodoroSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Timer tick function
  const tick = useCallback(() => {
    const now = Date.now();
    const delta = (now - lastTickRef.current) / 1000;
    lastTickRef.current = now;

    setTimerState((prev) => {
      if (prev.status !== 'running' || prev.remaining <= 0) {
        return prev;
      }

      const newRemaining = Math.max(0, prev.remaining - delta);
      const newState = { ...prev, remaining: newRemaining };
      persistTimerState(newState);

      // Notify on tick callback
      if (onTick) {
        onTick(newRemaining);
      }

      // Check if timer completed
      if (newRemaining <= 0) {
        // Clear interval
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Complete the session
        completeSession(newState);

        return {
          ...newState,
          status: 'completed',
          remaining: 0,
        };
      }

      return newState;
    });
  }, [persistTimerState, onTick]);

  // Start timer interval
  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(tick, 100); // 100ms for smooth updates
  }, [tick]);

  // Stop timer interval
  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Complete a session (API call + state update)
  const completeSession = useCallback(
    async (state: PomodoroTimerState) => {
      if (!state.sessionId) return;

      try {
        const response = await fetch(`/api/pomodoro/${state.sessionId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wasCompleted: true }),
        });

        if (response.ok) {
          const data = await response.json();
          const completedSession = data.session as PomodoroSessionDto;

          // Notify on complete callback
          if (onSessionComplete) {
            onSessionComplete(completedSession);
          }

          // Refresh statistics and sessions
          refreshStatistics();
          refreshSessions();

          // Play notification sound
          playNotificationSound();

          // Show browser notification
          showBrowserNotification(state.type);
        }
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    },
    [onSessionComplete]
  );

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!settings.soundEnabled) return;

    try {
      if (typeof window !== 'undefined' && 'Audio' in window) {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => {
          // Auto-play was prevented, ignore
        });
      }
    } catch {
      // Sound not available, ignore
    }
  }, [settings.soundEnabled]);

  // Show browser notification
  const showBrowserNotification = useCallback(
    (type: PomodoroSessionType) => {
      if (!settings.notificationEnabled) return;
      if (typeof window === 'undefined' || !('Notification' in window)) return;

      if (Notification.permission === 'granted') {
        const title = type === 'work' ? 'Focus session complete!' : 'Break time is over!';
        const body =
          type === 'work' ? 'Great work! Time for a break.' : 'Break is done! Ready to focus?';

        new Notification(title, {
          body,
          icon: '/icon-192.png',
          tag: 'pomodoro-session',
        });
      }
    },
    [settings.notificationEnabled]
  );

  // Request notification permission
  const requestNotificationPermission = useCallback(() => {
    if (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }
  }, []);

  // Start timer
  const startTimer = useCallback(
    async (options?: {
      duration?: number;
      type?: PomodoroSessionType;
      taskId?: string;
      taskTitle?: string;
    }) => {
      const {
        duration = settings.workDuration,
        type = 'work',
        taskId = null,
        taskTitle = null,
      } = options || {};

      const durationInSeconds = minutesToSeconds(duration);

      // Create new session via API
      try {
        const response = await fetch('/api/pomodoro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration,
            type,
            taskId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start timer');
        }

        const data = await response.json();
        const session = data.session as PomodoroSessionDto;

        const newState: PomodoroTimerState = {
          status: 'running',
          sessionId: session.id,
          taskId: session.taskId,
          taskTitle: taskTitle,
          type,
          duration: durationInSeconds,
          remaining: durationInSeconds,
          breakDuration: minutesToSeconds(session.breakDuration),
          startedAt: new Date(),
          pausedAt: null,
          totalPaused: 0,
        };

        setTimerState(newState);
        persistTimerState(newState);
        startInterval();
        requestNotificationPermission();

        // Refresh sessions list
        refreshSessions();
      } catch (error) {
        console.error('Failed to start timer:', error);
      }
    },
    [settings.workDuration, persistTimerState, startInterval, requestNotificationPermission]
  );

  // Pause timer
  const pauseTimer = useCallback(async () => {
    stopInterval();

    setTimerState((prev) => {
      if (prev.status !== 'running') return prev;

      const newState: PomodoroTimerState = {
        ...prev,
        status: 'paused',
        pausedAt: new Date(),
      };
      persistTimerState(newState);
      return newState;
    });
  }, [stopInterval, persistTimerState]);

  // Resume timer
  const resumeTimer = useCallback(async () => {
    setTimerState((prev) => {
      if (prev.status !== 'paused') return prev;

      // Calculate total paused time
      const totalPaused = prev.totalPaused + (Date.now() - (prev.pausedAt?.getTime() || 0));

      const newState: PomodoroTimerState = {
        ...prev,
        status: 'running',
        pausedAt: null,
        totalPaused,
      };
      persistTimerState(newState);
      return newState;
    });

    startInterval();
  }, [startInterval, persistTimerState]);

  // Stop timer
  const stopTimer = useCallback(
    async (wasCompleted = false) => {
      stopInterval();

      const sessionId = timerState.sessionId;
      if (!sessionId) {
        // Reset state if no session
        const resetState: PomodoroTimerState = {
          status: 'stopped',
          sessionId: null,
          taskId: null,
          taskTitle: null,
          type: 'work',
          duration: minutesToSeconds(settings.workDuration),
          remaining: minutesToSeconds(settings.workDuration),
          breakDuration: minutesToSeconds(settings.shortBreakDuration),
          startedAt: null,
          pausedAt: null,
          totalPaused: 0,
        };
        setTimerState(resetState);
        persistTimerState(resetState);
        return;
      }

      // Mark session as completed/abandoned via API
      try {
        await fetch(`/api/pomodoro/${sessionId}/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ wasCompleted }),
        });
      } catch (error) {
        console.error('Failed to stop session:', error);
      }

      // Reset state
      const resetState: PomodoroTimerState = {
        status: 'stopped',
        sessionId: null,
        taskId: null,
        taskTitle: null,
        type: 'work',
        duration: minutesToSeconds(settings.workDuration),
        remaining: minutesToSeconds(settings.workDuration),
        breakDuration: minutesToSeconds(settings.shortBreakDuration),
        startedAt: null,
        pausedAt: null,
        totalPaused: 0,
      };
      setTimerState(resetState);
      persistTimerState(resetState);

      // Refresh statistics and sessions
      refreshStatistics();
      refreshSessions();
    },
    [
      timerState,
      settings.workDuration,
      settings.shortBreakDuration,
      stopInterval,
      persistTimerState,
    ]
  );

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      const updated = { ...settings, ...newSettings };
      setSettings(updated);
      persistSettings(updated);
    },
    [settings, persistSettings]
  );

  // Fetch statistics
  const refreshStatistics = useCallback(async () => {
    setStatisticsLoading(true);
    try {
      const response = await fetch('/api/pomodoro/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setStatisticsLoading(false);
    }
  }, []);

  // Fetch sessions
  const refreshSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const response = await fetch('/api/pomodoro?limit=20&sortBy=startedAt&sortOrder=desc');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  // Initialize timer state on mount
  useEffect(() => {
    if (autoFetch) {
      refreshStatistics();
      refreshSessions();

      // Resume timer if it was running
      const savedState = loadTimerState();
      if (savedState.status === 'running' && savedState.sessionId) {
        // Calculate elapsed time while away
        const elapsedSeconds =
          (Date.now() - new Date(savedState.startedAt || 0).getTime()) / 1000 -
          savedState.totalPaused / 1000;
        const newRemaining = Math.max(0, savedState.duration - elapsedSeconds);

        if (newRemaining > 0) {
          setTimerState({
            ...savedState,
            remaining: newRemaining,
          });
          startInterval();
        } else {
          // Timer completed while away
          completeSession(savedState);
          const resetState: PomodoroTimerState = {
            status: 'stopped',
            sessionId: null,
            taskId: null,
            taskTitle: null,
            type: 'work',
            duration: minutesToSeconds(settings.workDuration),
            remaining: minutesToSeconds(settings.workDuration),
            breakDuration: minutesToSeconds(settings.shortBreakDuration),
            startedAt: null,
            pausedAt: null,
            totalPaused: 0,
          };
          setTimerState(resetState);
        }
      }
    }

    return () => {
      stopInterval();
    };
  }, []);

  // Update timer state when settings change (for durations)
  useEffect(() => {
    if (timerState.status === 'stopped') {
      setTimerState((prev) => ({
        ...prev,
        duration: minutesToSeconds(settings.workDuration),
        remaining: minutesToSeconds(settings.workDuration),
        breakDuration: minutesToSeconds(settings.shortBreakDuration),
      }));
    }
  }, [settings.workDuration, settings.shortBreakDuration]);

  // Computed values
  const formattedTime = formatTime(timerState.remaining);
  const progress = calculateProgress(timerState.duration, timerState.remaining);
  const isRunning = timerState.status === 'running';
  const isPaused = timerState.status === 'paused';
  const isStopped = timerState.status === 'stopped' || timerState.status === 'completed';
  const currentTaskId = timerState.taskId;

  return {
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
    refreshStatistics,
    sessions,
    sessionsLoading,
    refreshSessions,
    isRunning,
    isPaused,
    isStopped,
    currentTaskId,
  };
}

// Helper functions

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakAfter: 4,
  autoStartBreak: false,
  autoStartWork: false,
  soundEnabled: true,
  notificationEnabled: true,
  tickSoundEnabled: false,
};

function loadTimerState(): PomodoroTimerState {
  try {
    const stored = localStorage.getItem(TIMER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }

  return {
    status: 'stopped',
    sessionId: null,
    taskId: null,
    taskTitle: null,
    type: 'work',
    duration: 1500, // 25 minutes
    remaining: 1500,
    breakDuration: 300, // 5 minutes
    startedAt: null,
    pausedAt: null,
    totalPaused: 0,
  };
}

function loadSettings(): PomodoroSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_POMODORO_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore errors
  }

  return { ...DEFAULT_POMODORO_SETTINGS };
}
