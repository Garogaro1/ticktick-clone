/**
 * Reminder Type Definitions
 *
 * Types for the Reminder system supporting multiple reminders per task
 * with in-app, push, and email notification types.
 */

// Reminder types (matching Prisma schema)
export type ReminderType = 'IN_APP' | 'PUSH' | 'EMAIL';

// Reminder statuses (matching Prisma schema)
export type ReminderStatus = 'PENDING' | 'SENT' | 'DISMISSED' | 'SNOOZED';

/**
 * Reminder DTO - Main interface for reminder data
 */
export interface ReminderDto {
  id: string;
  type: ReminderType;
  fireAt: Date;
  relativeOffset: number | null;
  status: ReminderStatus;
  snoozedUntil: Date | null;
  snoozeCount: number;
  sentAt: Date | null;
  dismissedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  userId: string;
}

/**
 * Reminder with Task relation
 */
export interface ReminderWithTask extends ReminderDto {
  task: {
    id: string;
    title: string;
    dueDate: Date | null;
  };
}

/**
 * Create reminder input
 */
export interface CreateReminderInput {
  taskId: string;
  type?: ReminderType;
  fireAt?: Date;
  relativeOffset?: number | null; // Minutes before due date
}

/**
 * Update reminder input
 */
export interface UpdateReminderInput {
  type?: ReminderType;
  fireAt?: Date;
  relativeOffset?: number | null;
  status?: ReminderStatus;
}

/**
 * Reminder query options
 */
export interface ReminderListOptions {
  status?: ReminderStatus;
  type?: ReminderType;
  taskId?: string;
  fireBefore?: Date;
  fireAfter?: Date;
  includePending?: boolean; // Include only pending reminders
  sortBy?: 'fireAt' | 'createdAt' | 'snoozedUntil';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Reminder list response with pagination
 */
export interface ReminderListResponse {
  reminders: ReminderDto[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Snooze options
 */
export interface SnoozeOptions {
  minutes?: number; // Snooze for N minutes
  until?: Date; // Or snooze until specific time
}

/**
 * Reminder delivery result
 */
export interface ReminderDeliveryResult {
  success: boolean;
  reminderId: string;
  type: ReminderType;
  deliveredAt?: Date;
  error?: string;
}

/**
 * Reminder summary for display
 */
export interface ReminderSummary {
  id: string;
  type: ReminderType;
  fireAt: Date;
  status: ReminderStatus;
  isOverdue: boolean;
  isSnoozed: boolean;
  taskTitle: string;
  taskDueDate: Date | null;
}

/**
 * Quick add reminder presets (relative offsets)
 */
export type ReminderPreset =
  | 'at_deadline' // 0 minutes before
  | '5min_before' // 5 minutes before
  | '15min_before' // 15 minutes before
  | '30min_before' // 30 minutes before
  | '1hour_before' // 1 hour before
  | '1day_before' // 1 day before
  | 'custom'; // Custom time

/**
 * Quick add reminder preset values
 */
export const REMINDER_PRESETS: Record<ReminderPreset, { label: string; minutes: number | null }> = {
  at_deadline: { label: 'At time of task', minutes: 0 },
  '5min_before': { label: '5 minutes before', minutes: 5 },
  '15min_before': { label: '15 minutes before', minutes: 15 },
  '30min_before': { label: '30 minutes before', minutes: 30 },
  '1hour_before': { label: '1 hour before', minutes: 60 },
  '1day_before': { label: '1 day before', minutes: 1440 },
  custom: { label: 'Custom time', minutes: null },
};

/**
 * Reminder type labels
 */
export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  IN_APP: 'In-App Notification',
  PUSH: 'Push Notification',
  EMAIL: 'Email',
};

/**
 * Reminder status labels
 */
export const REMINDER_STATUS_LABELS: Record<ReminderStatus, string> = {
  PENDING: 'Pending',
  SENT: 'Sent',
  DISMISSED: 'Dismissed',
  SNOOZED: 'Snoozed',
};
