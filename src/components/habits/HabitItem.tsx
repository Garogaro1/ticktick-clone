'use client';

/**
 * HabitItem Component
 *
 * Individual habit display with toggle completion, streak indicator,
 * and quick actions.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { HabitDto } from '@/lib/habits';

export interface HabitItemProps {
  habit: HabitDto;
  onToggle: (id: string) => Promise<void>;
  onEdit: (habit: HabitDto) => void;
  onDelete: (id: string) => void;
  isCompact?: boolean;
}

const STREAK_ICONS = ['🔥', '⚡', '✨', '💫', '🌟'];

export function HabitItem({
  habit,
  onToggle,
  onEdit,
  onDelete,
  isCompact = false,
}: HabitItemProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    await onToggle(habit.id);
    setIsToggling(false);
  };

  const getStreakIcon = (streak: number): string => {
    if (streak === 0) return '';
    if (streak >= 30) return STREAK_ICONS[0];
    if (streak >= 21) return STREAK_ICONS[1];
    if (streak >= 14) return STREAK_ICONS[2];
    if (streak >= 7) return STREAK_ICONS[3];
    return STREAK_ICONS[4];
  };

  const getStreakColor = (streak: number): string => {
    if (streak >= 30) return 'text-orange-500';
    if (streak >= 21) return 'text-yellow-500';
    if (streak >= 14) return 'text-blue-500';
    if (streak >= 7) return 'text-green-500';
    return 'text-gray-400';
  };

  const isCompleted = habit.completedToday;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={`
        relative group bg-white border rounded-xl p-4 transition-all duration-200
        ${isCompleted ? 'border-green-200 bg-green-50/50' : 'border-gray-200 hover:border-gray-300'}
        ${isCompact ? 'p-3' : 'p-4'}
      `}
      style={{
        borderLeftColor: isCompleted ? habit.color || undefined : undefined,
        borderLeftWidth: isCompleted ? '4px' : '1px',
      }}
    >
      <div className="flex items-center gap-3">
        {/* Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          disabled={isToggling}
          className={`
            flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-200
            ${
              isCompleted
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-400 text-transparent hover:text-green-400'
            }
            ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && (
            <motion.svg
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          )}
          {!isCompleted && habit.icon && <span className="text-xl">{habit.icon}</span>}
        </motion.button>

        {/* Habit Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`
              font-medium truncate transition-all duration-200
              ${isCompleted ? 'line-through text-gray-400' : 'text-gray-900'}
            `}
            >
              {habit.title}
            </h3>
            {habit.frequency !== 'daily' && (
              <span className="text-xs text-gray-400 capitalize">
                {habit.frequency === 'weekly' ? 'Weekly' : 'Monthly'}
              </span>
            )}
          </div>

          {!isCompact && (
            <div className="flex items-center gap-3 mt-1 text-sm">
              {/* Streak */}
              {habit.currentStreak !== undefined && habit.currentStreak > 0 && (
                <div className={`flex items-center gap-1 ${getStreakColor(habit.currentStreak)}`}>
                  <span>{getStreakIcon(habit.currentStreak)}</span>
                  <span className="font-medium">{habit.currentStreak}</span>
                  <span className="text-gray-400">day streak</span>
                </div>
              )}

              {/* Target count */}
              {habit.targetCount > 1 && (
                <div className="text-gray-400">
                  <span>Target: {habit.targetCount}x</span>
                </div>
              )}

              {/* Best streak */}
              {habit.longestStreak !== undefined && habit.longestStreak > 0 && (
                <div className="text-gray-400">
                  <span>Best: {habit.longestStreak}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Completion Rate Badge */}
        {!isCompact && habit.completionRate !== undefined && (
          <div className="text-right">
            <div className="text-sm font-medium" style={{ color: habit.color || '#D97757' }}>
              {habit.completionRate}%
            </div>
            <div className="text-xs text-gray-400">this month</div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(habit)}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Edit habit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
          </button>
          <button
            onClick={() => onDelete(habit.id)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            aria-label="Delete habit"
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
        </div>
      </div>

      {/* Progress Bar (for multi-target habits) */}
      {habit.targetCount > 1 && !isCompact && (
        <div className="mt-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, ((habit._count?.entries || 0) / habit.targetCount) * 100)}%`,
              }}
              transition={{ duration: 0.3 }}
              className="h-full rounded-full"
              style={{ backgroundColor: habit.color || '#D97757' }}
            />
          </div>
        </div>
      )}
    </motion.div>
  );
}
