/**
 * Pomodoro Utility Functions
 *
 * Helper functions for Pomodoro timer operations, statistics,
 * and time formatting.
 */

import type {
  PomodoroSessionDto,
  PomodoroStatistics,
  DailySessionSummary,
  SessionSummary,
  PomodoroSessionType,
} from './types';
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from '@/lib/utils/date';

// Simple helper functions not in date.ts
function differenceInMinutes(dateLeft: Date, dateRight: Date): number {
  return Math.round((dateLeft.getTime() - dateRight.getTime()) / 60000);
}

/**
 * Format seconds to MM:SS display format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format seconds to HH:MM:SS display format
 */
export function formatTimeWithHours(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format minutes to human-readable duration
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Convert minutes to seconds
 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60;
}

/**
 * Convert seconds to minutes (rounded)
 */
export function secondsToMinutes(seconds: number): number {
  return Math.round(seconds / 60);
}

/**
 * Calculate session completion percentage
 */
export function calculateProgress(totalDuration: number, remaining: number): number {
  if (totalDuration <= 0) return 0;
  return Math.max(0, Math.min(100, ((totalDuration - remaining) / totalDuration) * 100));
}

/**
 * Check if a session should be considered a long break
 * based on the number of completed work sessions
 */
export function shouldUseLongBreak(completedWorkSessions: number, longBreakAfter: number): boolean {
  return completedWorkSessions > 0 && completedWorkSessions % longBreakAfter === 0;
}

/**
 * Calculate end time for a session
 */
export function calculateEndTime(startTime: Date, durationMinutes: number): Date {
  return new Date(startTime.getTime() + durationMinutes * 60 * 1000);
}

/**
 * Check if a session is currently active
 */
export function isSessionActive(session: PomodoroSessionDto): boolean {
  if (session.completedAt || session.wasCompleted) return false;
  const endTime = calculateEndTime(session.startedAt, session.duration);
  return new Date() < endTime;
}

/**
 * Calculate elapsed time for a session in minutes
 */
export function calculateElapsedTime(session: PomodoroSessionDto): number {
  const end = session.completedAt ? new Date(session.completedAt) : new Date();
  return differenceInMinutes(end, session.startedAt);
}

/**
 * Filter sessions by date range
 */
export function filterSessionsByDate(
  sessions: PomodoroSessionDto[],
  startDate?: Date,
  endDate?: Date
): PomodoroSessionDto[] {
  return sessions.filter((session) => {
    const sessionDate = new Date(session.startedAt);
    if (startDate && sessionDate < startDate) return false;
    if (endDate && sessionDate > endDate) return false;
    return true;
  });
}

/**
 * Filter sessions by type
 */
export function filterSessionsByType(
  sessions: PomodoroSessionDto[],
  type: PomodoroSessionType
): PomodoroSessionDto[] {
  return sessions.filter((session) => session.type === type);
}

/**
 * Get today's sessions
 */
export function getTodaySessions(sessions: PomodoroSessionDto[]): PomodoroSessionDto[] {
  const today = new Date();
  const start = startOfDay(today);
  const end = endOfDay(today);
  return filterSessionsByDate(sessions, start, end);
}

/**
 * Get this week's sessions
 */
export function getWeekSessions(sessions: PomodoroSessionDto[]): PomodoroSessionDto[] {
  const today = new Date();
  const start = startOfWeek(today);
  const end = endOfWeek(today);
  return filterSessionsByDate(sessions, start, end);
}

/**
 * Calculate statistics from sessions
 */
export function calculateStatistics(sessions: PomodoroSessionDto[]): PomodoroStatistics {
  const completedSessions = sessions.filter((s) => s.wasCompleted);
  const abandonedSessions = sessions.filter((s) => !s.wasCompleted && s.completedAt);
  const workSessions = sessions.filter((s) => s.type === 'work' && s.wasCompleted);

  // Calculate total focus time (work sessions only)
  const totalFocusTime = workSessions.reduce((sum, s) => sum + s.duration, 0);

  // Calculate today's focus time
  const todaySessions = getTodaySessions(workSessions);
  const todayFocusTime = todaySessions.reduce((sum, s) => sum + s.duration, 0);

  // Calculate this week's focus time
  const weekSessions = getWeekSessions(workSessions);
  const weekFocusTime = weekSessions.reduce((sum, s) => sum + s.duration, 0);

  // Calculate average session length
  const averageSessionLength =
    completedSessions.length > 0 ? totalFocusTime / completedSessions.length : 0;

  // Calculate streak (consecutive completed sessions)
  const currentStreak = calculateCurrentStreak(sessions);
  const longestStreak = calculateLongestStreak(sessions);

  // Group sessions by task
  const sessionsByTask: PomodoroStatistics['sessionsByTask'] = {};
  workSessions.forEach((session) => {
    if (session.taskId) {
      if (!sessionsByTask[session.taskId]) {
        sessionsByTask[session.taskId] = {
          taskTitle: 'Linked Task',
          count: 0,
          totalTime: 0,
        };
      }
      sessionsByTask[session.taskId].count += 1;
      sessionsByTask[session.taskId].totalTime += session.duration;
    }
  });

  // Group sessions by day
  const sessionsByDay = groupSessionsByDay(sessions);

  return {
    totalSessions: sessions.length,
    completedSessions: completedSessions.length,
    abandonedSessions: abandonedSessions.length,
    totalFocusTime,
    todayFocusTime,
    weekFocusTime,
    averageSessionLength,
    currentStreak,
    longestStreak,
    sessionsByTask,
    sessionsByDay,
  };
}

/**
 * Calculate current streak of consecutive completed sessions
 */
export function calculateCurrentStreak(sessions: PomodoroSessionDto[]): number {
  if (sessions.length === 0) return 0;

  // Sort by startedAt descending
  const sorted = [...sessions].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());

  let streak = 0;
  let lastDate: Date | null = null;

  for (const session of sorted) {
    if (!session.wasCompleted) break;

    const sessionDate = new Date(session.startedAt);
    sessionDate.setHours(0, 0, 0, 0);

    if (lastDate) {
      const dayDiff = Math.abs(differenceInMinutes(lastDate, sessionDate)) / (24 * 60);
      if (dayDiff > 1) break; // Gap in streak
    }

    streak++;
    lastDate = sessionDate;
  }

  return streak;
}

/**
 * Calculate longest streak of consecutive completed sessions
 */
export function calculateLongestStreak(sessions: PomodoroSessionDto[]): number {
  if (sessions.length === 0) return 0;

  const completedSessions = sessions.filter((s) => s.wasCompleted);
  if (completedSessions.length === 0) return 0;

  // Sort by startedAt ascending
  const sorted = [...completedSessions].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );

  let longestStreak = 1;
  let currentStreak = 1;
  let lastDate = new Date(sorted[0].startedAt);

  for (let i = 1; i < sorted.length; i++) {
    const sessionDate = new Date(sorted[i].startedAt);
    sessionDate.setHours(0, 0, 0, 0);

    const dayDiff = Math.abs(differenceInMinutes(lastDate, sessionDate)) / (24 * 60);

    if (dayDiff <= 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }

    lastDate = sessionDate;
  }

  return longestStreak;
}

/**
 * Group sessions by day for statistics
 */
export function groupSessionsByDay(
  sessions: PomodoroSessionDto[]
): PomodoroStatistics['sessionsByDay'] {
  const grouped: Record<string, { workTime: number; breakTime: number; sessions: number }> = {};

  sessions.forEach((session) => {
    const dateKey = new Date(session.startedAt).toISOString().split('T')[0];

    if (!grouped[dateKey]) {
      grouped[dateKey] = { workTime: 0, breakTime: 0, sessions: 0 };
    }

    if (session.type === 'work' && session.wasCompleted) {
      grouped[dateKey].workTime += session.duration;
    } else if (session.type === 'break' && session.wasCompleted) {
      grouped[dateKey].breakTime += session.duration;
    }
    grouped[dateKey].sessions += 1;
  });

  return Object.entries(grouped)
    .map(([date, data]) => ({
      date,
      workTime: data.workTime,
      breakTime: data.breakTime,
      sessions: data.sessions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Create daily summary from sessions
 */
export function createDailySummary(
  date: Date,
  sessions: PomodoroSessionDto[]
): DailySessionSummary {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  const daySessions = filterSessionsByDate(sessions, dayStart, dayEnd);

  const workSessions = daySessions.filter((s) => s.type === 'work');
  const breakSessions = daySessions.filter((s) => s.type === 'break');
  const completedWork = workSessions.filter((s) => s.wasCompleted);

  const totalFocusTime = completedWork.reduce((sum, s) => sum + s.duration, 0);
  const totalBreakTime = breakSessions
    .filter((s) => s.wasCompleted)
    .reduce((sum, s) => sum + s.duration, 0);

  const completionRate = workSessions.length > 0 ? completedWork.length / workSessions.length : 0;

  return {
    date: date.toISOString().split('T')[0],
    workSessions: workSessions.length,
    breakSessions: breakSessions.length,
    totalFocusTime,
    totalBreakTime,
    completionRate,
  };
}

/**
 * Create session summary for display
 */
export function createSessionSummary(
  session: PomodoroSessionDto,
  taskTitle?: string
): SessionSummary {
  return {
    id: session.id,
    type: session.type,
    duration: session.duration,
    wasCompleted: session.wasCompleted,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    taskTitle: taskTitle || null,
  };
}

/**
 * Get session type icon
 */
export function getSessionTypeIcon(type: PomodoroSessionType): string {
  return type === 'work' ? '🎯' : '☕';
}

/**
 * Get motivational message based on streak
 */
export function getStreakMessage(streak: number): string {
  if (streak === 0) return 'Start your focus journey!';
  if (streak < 4) return `${streak} session${streak > 1 ? 's' : ''} completed. Keep going!`;
  if (streak < 8) return `${streak} sessions! You're building momentum.`;
  if (streak < 12) return `${streak} sessions! Incredible focus!`;
  return `${streak} sessions! You're a productivity machine! 🚀`;
}

/**
 * Calculate estimated completion time
 */
export function calculateEstimatedEndTime(remainingSeconds: number): Date {
  return new Date(Date.now() + remainingSeconds * 1000);
}

/**
 * Get time until estimated completion
 */
export function getTimeUntilCompletion(remainingSeconds: number): string {
  if (remainingSeconds <= 0) return 'Completing...';
  if (remainingSeconds < 60) return `${Math.ceil(remainingSeconds)}s`;
  if (remainingSeconds < 3600) return `${Math.ceil(remainingSeconds / 60)}m`;
  const hours = Math.floor(remainingSeconds / 3600);
  const mins = Math.ceil((remainingSeconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

/**
 * Validate session duration
 */
export function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 180;
}

/**
 * Get default duration for session type
 */
export function getDefaultDuration(type: PomodoroSessionType): number {
  return type === 'work' ? 25 : 5;
}

/**
 * Get display color for session type
 */
export function getSessionTypeColor(type: PomodoroSessionType): string {
  return type === 'work' ? '#D97757' : '#7B9A68';
}
