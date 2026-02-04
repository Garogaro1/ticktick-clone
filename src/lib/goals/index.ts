/**
 * Goal Tracker Module
 *
 * Exports for the goal tracking feature.
 */

export * from './types';
export * from './utils';
export * from './service';

// Export validation schemas separately to avoid naming conflicts
export {
  createGoalSchema,
  updateGoalSchema,
  goalQuerySchema,
  updateGoalProgressSchema,
  batchUpdateGoalsSchema,
  batchDeleteGoalsSchema,
  goalStatisticsQuerySchema,
} from './schemas';
