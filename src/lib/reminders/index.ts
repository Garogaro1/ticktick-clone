/**
 * Reminder Module Exports
 */

// Types (export schemas with different names to avoid conflicts)
export type {
  ReminderDto,
  ReminderWithTask,
  CreateReminderInput as CreateReminderDto,
  UpdateReminderInput as UpdateReminderDto,
  ReminderListOptions,
  ReminderListResponse,
  SnoozeOptions,
  ReminderDeliveryResult,
  ReminderSummary,
  ReminderType,
  ReminderStatus,
  ReminderPreset,
} from './types';

export { REMINDER_PRESETS, REMINDER_TYPE_LABELS, REMINDER_STATUS_LABELS } from './types';

// Schemas (export with Schema suffix)
export {
  CreateReminderSchema,
  UpdateReminderSchema,
  ReminderQuerySchema,
  SnoozeReminderSchema,
  DismissReminderSchema,
  BatchReminderSchema,
  CreateRemindersSchema,
  ReminderPresetSchema,
} from './schemas';

export type {
  CreateReminderInput as CreateReminderSchemaInput,
  UpdateReminderInput as UpdateReminderSchemaInput,
  ReminderQueryInput,
  SnoozeReminderInput,
  BatchReminderInput,
  CreateRemindersInput,
} from './schemas';

// Service
export * from './service';
