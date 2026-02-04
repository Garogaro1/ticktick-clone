'use client';

/**
 * GoalItem Component
 *
 * Single goal card with progress visualization and quick actions.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GoalDto } from '@/lib/goals';
import { GoalProgressBar } from './GoalProgressBar';
import { getGoalStatusColor, getGoalStatusLabel } from '@/lib/goals/utils';

export interface GoalItemProps {
  goal: GoalDto;
  onEdit: (goal: GoalDto) => void;
  onDelete: (goalId: string) => void;
  onUpdateProgress: (goalId: string, increment: number) => Promise<GoalDto | null>;
  onComplete: (goalId: string) => Promise<GoalDto | null>;
  onPause: (goalId: string) => Promise<GoalDto | null>;
}

export function GoalItem({
  goal,
  onEdit,
  onDelete,
  onUpdateProgress,
  onComplete,
  onPause,
}: GoalItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const statusColor = getGoalStatusColor(goal.status);
  const statusLabel = getGoalStatusLabel(goal.status);
  const progress = goal.progress ?? 0;
  const isCompleted = progress >= 100 || goal.status === 'COMPLETED';
  const isPaused = goal.status === 'PAUSED';
  const isAbandoned = goal.status === 'ABANDONED';

  const handleQuickAdd = async () => {
    if (isUpdating || isCompleted || isPaused || isAbandoned) return;

    setIsUpdating(true);
    try {
      await onUpdateProgress(goal.id, 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (goal.status === 'COMPLETED') {
        await onPause(goal.id);
      } else {
        await onComplete(goal.id);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePause = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onPause(goal.id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Main Card */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{goal.title}</h3>
            {goal.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{goal.description}</p>
            )}
          </div>

          {/* Status Badge */}
          <motion.span
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="ml-2 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap"
            style={{ backgroundColor: `${statusColor}20`, color: statusColor }}
          >
            {statusLabel}
          </motion.span>
        </div>

        {/* Progress Bar */}
        <GoalProgressBar goal={goal} size="sm" showLabel showRemaining className="mb-3" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Deadline */}
          {goal.deadline && (
            <div
              className={`text-xs flex items-center gap-1 ${
                goal.isOverdue ? 'text-red-500' : 'text-gray-500'
              }`}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {goal.isOverdue
                ? 'Overdue'
                : goal.daysRemaining === 0
                  ? 'Due today'
                  : goal.daysRemaining === 1
                    ? '1 day left'
                    : `${goal.daysRemaining} days left`}
            </div>
          )}

          {/* Quick Actions (visible on hover) */}
          <AnimatePresence>
            {showActions && !isAbandoned && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1"
              >
                {!isCompleted && !isPaused && (
                  <>
                    {/* Quick Add Button */}
                    <button
                      onClick={handleQuickAdd}
                      disabled={isUpdating}
                      className="p-1.5 text-gray-400 hover:text-[#D97757] hover:bg-[#D97757]10 rounded-lg transition-colors disabled:opacity-50"
                      title="Quick add +1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </button>

                    {/* Pause Button */}
                    <button
                      onClick={handlePause}
                      disabled={isUpdating}
                      className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Pause goal"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Complete/Resume Button */}
                <button
                  onClick={handleComplete}
                  disabled={isUpdating}
                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                    isCompleted
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                  }`}
                  title={isCompleted ? 'Mark as active' : 'Mark as complete'}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isCompleted ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    )}
                  </svg>
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => onEdit(goal)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit goal"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => {
                    if (confirm(`Delete goal "${goal.title}"?`)) {
                      onDelete(goal.id);
                    }
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete goal"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Expandable Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 px-4 py-3 bg-gray-50"
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{goal.currentValue}</div>
                <div className="text-xs text-gray-500">Current</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{goal.targetValue ?? '∞'}</div>
                <div className="text-xs text-gray-500">Target</div>
              </div>
              <div>
                <div className="text-2xl font-bold" style={{ color: statusColor }}>
                  {progress}%
                </div>
                <div className="text-xs text-gray-500">Progress</div>
              </div>
            </div>
            {goal.targetValue && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Remaining</span>
                  <span className="font-medium text-gray-900">
                    {Math.max(0, goal.targetValue - goal.currentValue)} {goal.unit || ''}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
      >
        {isExpanded ? (
          <span className="flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            Show less
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            Show details
          </span>
        )}
      </button>
    </motion.div>
  );
}
