'use client';

/**
 * HabitList Component
 *
 * List view for habits with filtering and empty states.
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { HabitDto } from '@/lib/habits';
import { HabitItem } from './HabitItem';

export interface HabitListProps {
  habits: HabitDto[];
  onToggle: (id: string) => Promise<void>;
  onEdit: (habit: HabitDto) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
  filter?: 'all' | 'completed' | 'active';
  showArchived?: boolean;
}

export function HabitList({
  habits,
  onToggle,
  onEdit,
  onDelete,
  isLoading = false,
  filter = 'all',
  showArchived = false,
}: HabitListProps) {
  // Filter and sort habits
  const filteredHabits = useMemo(() => {
    let filtered = [...habits];

    // Filter by archive status
    if (!showArchived) {
      filtered = filtered.filter((h) => !h.isArchived);
    }

    // Filter by completion status
    if (filter === 'completed') {
      filtered = filtered.filter((h) => h.completedToday);
    } else if (filter === 'active') {
      filtered = filtered.filter((h) => !h.completedToday);
    }

    // Sort: incomplete first, then by streak, then by sort order
    filtered.sort((a, b) => {
      // Incomplete habits first
      if (a.completedToday !== b.completedToday) {
        return a.completedToday ? 1 : -1;
      }

      // Then by streak (highest first)
      const aStreak = a.currentStreak ?? 0;
      const bStreak = b.currentStreak ?? 0;
      if (aStreak !== bStreak) {
        return bStreak - aStreak;
      }

      // Then by sort order
      return a.sortOrder - b.sortOrder;
    });

    return filtered;
  }, [habits, filter, showArchived]);

  // Calculate stats
  const totalHabits = habits.filter((h) => !h.isArchived).length;
  const completedToday = habits.filter((h) => !h.isArchived && h.completedToday).length;
  const activeStreaks = habits.filter((h) => !h.isArchived && (h.currentStreak ?? 0) > 0).length;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  if (filteredHabits.length === 0) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-sm mx-auto"
        >
          <div className="text-4xl mb-4">
            {filter === 'completed' ? '✅' : filter === 'active' ? '📋' : '🎯'}
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {filter === 'completed'
              ? 'No completed habits yet'
              : filter === 'active'
                ? 'No active habits'
                : showArchived
                  ? 'No archived habits'
                  : 'No habits yet'}
          </h3>
          <p className="text-gray-500">
            {filter === 'completed'
              ? 'Complete some habits to see them here.'
              : filter === 'active'
                ? 'All habits are completed! Great job!'
                : showArchived
                  ? 'Archive habits to see them here.'
                  : 'Create your first habit to start tracking.'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-gray-500">
          {completedToday} of {totalHabits} completed today
        </div>
        {activeStreaks > 0 && (
          <div className="text-sm text-orange-500 font-medium flex items-center gap-1">
            <span>🔥</span>
            {activeStreaks} active streak{activeStreaks !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Habits List */}
      <AnimatePresence mode="popLayout">
        {filteredHabits.map((habit) => (
          <HabitItem
            key={habit.id}
            habit={habit}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
