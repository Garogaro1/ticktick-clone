'use client';

/**
 * Goals Page
 *
 * Main page for goal tracking with progress visualization and statistics.
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGoals } from '@/hooks/useGoals';
import type { GoalDto } from '@/lib/goals';
import { GoalList, GoalModal } from '@/components/goals';

export default function GoalsPage() {
  const {
    goals,
    statistics,
    isLoading,
    error,
    addGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
    completeGoal,
    pauseGoal,
    refetch,
  } = useGoals({ autoFetch: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalDto | null>(null);

  const handleAddGoal = useCallback(async () => {
    setEditingGoal(null);
    setIsModalOpen(true);
  }, []);

  const handleDeleteGoal = useCallback(
    async (id: string) => {
      const success = await deleteGoal(id);
      if (!success) {
        alert('Failed to delete goal. Please try again.');
      }
      return success;
    },
    [deleteGoal]
  );

  const handleSaveGoal = useCallback(
    async (input: Parameters<typeof addGoal>[0]) => {
      if (editingGoal) {
        await updateGoal(editingGoal.id, input);
      } else {
        await addGoal(input);
      }
    },
    [editingGoal, addGoal, updateGoal]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🏆</span>
                Goals
              </h1>
              {statistics && (
                <p className="text-sm text-gray-500 mt-1">
                  {statistics.activeGoals} active goals • {statistics.overallProgress}% average
                  progress
                </p>
              )}
            </div>

            <button
              onClick={handleAddGoal}
              className="px-4 py-2 bg-[#D97757] text-white rounded-lg hover:bg-[#c96a4f] transition-colors flex items-center gap-2 shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Goal
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6 pb-24">
        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.totalGoals}</div>
              <div className="text-xs text-gray-500">Total Goals</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-2xl font-bold text-[#D97757]">{statistics.activeGoals}</div>
              <div className="text-xs text-gray-500">Active</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-bold text-green-600">{statistics.completedGoals}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-2xl font-bold text-blue-500">{statistics.overallProgress}%</div>
              <div className="text-xs text-gray-500">Avg Progress</div>
            </div>
          </motion.div>
        )}

        {/* Upcoming Deadlines */}
        {statistics && statistics.nearestDeadlines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white border border-gray-200 rounded-xl p-4 mb-6"
          >
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-[#D97757]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Upcoming Deadlines
            </h3>
            <div className="space-y-2">
              {statistics.nearestDeadlines.slice(0, 3).map((deadline) => (
                <div key={deadline.goalId} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{deadline.goalTitle}</span>
                  <span
                    className={`font-medium ${deadline.daysRemaining < 0 ? 'text-red-500' : 'text-gray-500'}`}
                  >
                    {deadline.daysRemaining === 0
                      ? 'Today'
                      : deadline.daysRemaining < 0
                        ? `${Math.abs(deadline.daysRemaining)}d overdue`
                        : `${deadline.daysRemaining}d left`}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Goals List */}
        <GoalList
          goals={goals}
          isLoading={isLoading}
          onAdd={addGoal}
          onUpdate={updateGoal}
          onDelete={handleDeleteGoal}
          onUpdateProgress={updateProgress}
          onComplete={completeGoal}
          onPause={pauseGoal}
        />

        {/* Empty State */}
        {!isLoading && goals.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-xl p-16 text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Set your first goal</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Goals give you something to strive for. Set a target, track your progress, and achieve
              your dreams.
            </p>
            <button
              onClick={handleAddGoal}
              className="px-6 py-3 bg-[#D97757] text-white rounded-lg hover:bg-[#c96a4f] transition-colors shadow-sm"
            >
              Create Your First Goal
            </button>
          </motion.div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button onClick={refetch} className="mt-2 text-sm text-red-700 underline">
              Try again
            </button>
          </div>
        )}
      </main>

      {/* Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        goal={editingGoal}
        mode={editingGoal ? 'edit' : 'create'}
      />
    </div>
  );
}
