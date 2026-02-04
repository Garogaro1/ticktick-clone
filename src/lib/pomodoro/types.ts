/**
 * Pomodoro Type Definitions
 *
 * Types for the Pomodoro timer system supporting work/break sessions
 * with task linking and statistics tracking.
 */

// Pomodoro session types (matching Prisma schema)
export type PomodoroSessionType = 'work' | 'break';

// Pomodoro session status
export type PomodoroSessionStatus = 'running' | 'paused' | 'completed' | 'abandoned' | 'stopped';

/**
 * Pomodoro Session DTO - Main interface for session data
 */
export interface PomodoroSessionDto {
  id: string;
  duration: number; // Duration in minutes
  breakDuration: number; // Break duration in minutes
  startedAt: Date;
  completedAt: Date | null;
  wasCompleted: boolean;
  type: PomodoroSessionType;
  taskId: string | null;
  userId: string;
}

/**
 * Pomodoro Session with Task relation
 */
export interface PomodoroSessionWithTask extends PomodoroSessionDto {
  task: {
    id: string;
    title: string;
  } | null;
}

/**
 * Create Pomodoro session input
 */
export interface CreatePomodoroInput {
  duration?: number; // Duration in minutes (default 25)
  breakDuration?: number; // Break duration in minutes (default 5)
  type?: PomodoroSessionType; // Session type (default 'work')
  taskId?: string; // Optional task to link
}

/**
 * Update Pomodoro session input
 */
export interface UpdatePomodoroInput {
  duration?: number;
  breakDuration?: number;
  wasCompleted?: boolean;
  completedAt?: Date;
}

/**
 * Pomodoro query options
 */
export interface PomodoroListOptions {
  type?: PomodoroSessionType;
  taskId?: string;
  wasCompleted?: boolean;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'startedAt' | 'completedAt' | 'duration';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Pomodoro list response with pagination
 */
export interface PomodoroListResponse {
  sessions: PomodoroSessionDto[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Pomodoro timer state
 */
export interface PomodoroTimerState {
  status: PomodoroSessionStatus;
  sessionId: string | null;
  taskId: string | null;
  taskTitle: string | null;
  type: PomodoroSessionType;
  duration: number; // Total duration in seconds
  remaining: number; // Remaining time in seconds
  breakDuration: number; // Break duration in seconds
  startedAt: Date | null;
  pausedAt: Date | null;
  totalPaused: number; // Total time paused in milliseconds
}

/**
 * Pomodoro settings
 */
export interface PomodoroSettings {
  workDuration: number; // Work duration in minutes (default 25)
  shortBreakDuration: number; // Short break duration in minutes (default 5)
  longBreakDuration: number; // Long break duration in minutes (default 15)
  longBreakAfter: number; // Number of work sessions before long break (default 4)
  autoStartBreak: boolean; // Auto-start break after work session
  autoStartWork: boolean; // Auto-start work after break
  soundEnabled: boolean; // Play sound on session complete
  notificationEnabled: boolean; // Show browser notification
  tickSoundEnabled: boolean; // Play tick sound during timer
}

/**
 * Pomodoro statistics
 */
export interface PomodoroStatistics {
  totalSessions: number;
  completedSessions: number;
  abandonedSessions: number;
  totalFocusTime: number; // Total focus time in minutes
  todayFocusTime: number; // Today's focus time in minutes
  weekFocusTime: number; // This week's focus time in minutes
  averageSessionLength: number; // Average session length in minutes
  currentStreak: number; // Current consecutive completed sessions
  longestStreak: number; // Longest streak of consecutive sessions
  sessionsByTask: Record<string, { taskTitle: string; count: number; totalTime: number }>;
  sessionsByDay: Array<{ date: string; workTime: number; breakTime: number; sessions: number }>;
}

/**
 * Daily session summary
 */
export interface DailySessionSummary {
  date: string; // ISO date string
  workSessions: number;
  breakSessions: number;
  totalFocusTime: number; // In minutes
  totalBreakTime: number; // In minutes
  completionRate: number; // 0-1
}

/**
 * Session summary for display
 */
export interface SessionSummary {
  id: string;
  type: PomodoroSessionType;
  duration: number;
  wasCompleted: boolean;
  startedAt: Date;
  completedAt: Date | null;
  taskTitle: string | null;
}

/**
 * Pomodoro preset durations
 */
export type PomodoroPreset =
  | 'pomodoro' // 25 min work, 5 min break
  | 'short' // 15 min work, 3 min break
  | 'long' // 50 min work, 10 min break
  | 'custom'; // Custom duration

/**
 * Pomodoro preset configurations
 */
export const POMODORO_PRESETS: Record<
  PomodoroPreset,
  { label: string; workMinutes: number; breakMinutes: number }
> = {
  pomodoro: { label: 'Pomodoro (25/5)', workMinutes: 25, breakMinutes: 5 },
  short: { label: 'Short (15/3)', workMinutes: 15, breakMinutes: 3 },
  long: { label: 'Long (50/10)', workMinutes: 50, breakMinutes: 10 },
  custom: { label: 'Custom', workMinutes: 25, breakMinutes: 5 },
};

/**
 * Default Pomodoro settings
 */
export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
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

/**
 * Pomodoro session type labels
 */
export const POMODORO_TYPE_LABELS: Record<PomodoroSessionType, string> = {
  work: 'Focus',
  break: 'Break',
};

/**
 * Pomodoro session status labels
 */
export const POMODORO_STATUS_LABELS: Record<PomodoroSessionStatus, string> = {
  running: 'Running',
  paused: 'Paused',
  completed: 'Completed',
  abandoned: 'Abandoned',
  stopped: 'Stopped',
};
