'use client';

/**
 * Goal Detail Page
 *
 * Shows detailed goal information with linked tasks.
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGoals } from '@/hooks/useGoals';
import { useTasks } from '@/hooks/useTasks';
import { GoalModal, GoalProgressBar } from '@/components/goals';
import { TaskList } from '@/components/tasks';
import { Button } from '@/components/ui/Button';

interface GoalDetailPageProps {
  params: {
    id: string;
  };
}

export default function GoalDetailPage({ params }: GoalDetailPageProps) {
  const router = useRouter();
  const {
    goals,
    isLoading: goalsLoading,
    updateGoal,
    deleteGoal,
  } = useGoals({
    autoFetch: true,
  });
  const { tasks, isLoading: tasksLoading } = useTasks({
    autoFetch: true,
    filter: { goalId: params.id },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Find the goal from the goals list
  const goal = goals.find((g) => g.id === params.id);

  // Redirect if goal not found
  useEffect(() => {
    if (!goalsLoading && goals.length > 0 && !goal) {
      router.push('/goals');
    }
  }, [goal, goalsLoading, goals.length, router]);

  const handleUpdateGoal = useCallback(
    async (input: {
      title: string;
      description?: string;
      targetValue?: number;
      unit?: string;
      deadline?: Date;
    }) => {
      if (!goal) return;
      await updateGoal(goal.id, input);
    },
    [goal, updateGoal]
  );

  const handleDelete = useCallback(async () => {
    if (!goal) return;
    setIsDeleting(true);
    const success = await deleteGoal(goal.id);
    if (success) {
      router.push('/goals');
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      alert('Failed to delete goal. Please try again.');
    }
  }, [goal, deleteGoal, router]);

  const handleCompleteGoal = useCallback(async () => {
    if (!goal) return;
    await updateGoal(goal.id, { status: 'COMPLETED' });
  }, [goal, updateGoal]);

  const handlePauseGoal = useCallback(async () => {
    if (!goal) return;
    const newStatus = goal.status === 'PAUSED' ? 'ACTIVE' : 'PAUSED';
    await updateGoal(goal.id, { status: newStatus });
  }, [goal, updateGoal]);

  // Filter tasks linked to this goal
  const linkedTasks = tasks.filter((t) => t.goalId === params.id);

  // Calculate task stats
  const completedTasks = linkedTasks.filter((t) => t.status === 'DONE').length;
  const totalTasks = linkedTasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  if (goalsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#D97757] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading goal...</p>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Goal not found</h2>
          <button onClick={() => router.push('/goals')} className="text-[#D97757] hover:underline">
            Back to Goals
          </button>
        </div>
      </div>
    );
  }

  const isCompleted = goal.status === 'COMPLETED';
  const isPaused = goal.status === 'PAUSED';
  const isAbandoned = goal.status === 'ABANDONED';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/goals')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex-1">Goal Details</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseGoal}
                disabled={isCompleted || isAbandoned}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </Button>
              {!isCompleted && !isAbandoned && (
                <Button variant="primary" size="sm" onClick={handleCompleteGoal}>
                  Complete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isCompleted || isAbandoned}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-error hover:text-error hover:bg-error/10"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Goal Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-6 mb-6"
        >
          {/* Status Badge */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    isCompleted
                      ? 'bg-green-100 text-green-700'
                      : isPaused
                        ? 'bg-gray-100 text-gray-700'
                        : isAbandoned
                          ? 'bg-red-100 text-red-700'
                          : 'bg-[#D97757]/10 text-[#D97757]'
                  }`}
                >
                  {goal.status === 'ACTIVE' && '🎯 Active'}
                  {goal.status === 'PAUSED' && '⏸️ Paused'}
                  {goal.status === 'COMPLETED' && '✅ Completed'}
                  {goal.status === 'ABANDONED' && '❌ Abandoned'}
                </span>
                {goal.deadline && (
                  <span className="text-sm text-gray-500">
                    Due: {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{goal.title}</h2>
              {goal.description && <p className="text-gray-600 mt-2">{goal.description}</p>}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <GoalProgressBar goal={goal} />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{goal.currentValue}</div>
              <div className="text-xs text-gray-500">Current</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{goal.targetValue ?? '∞'}</div>
              <div className="text-xs text-gray-500">Target</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#D97757]">{goal.progress ?? 0}%</div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
          </div>
        </motion.div>

        {/* Tasks Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Linked Tasks</h3>
            <div className="text-sm text-gray-500">
              {completedTasks} of {totalTasks} completed
            </div>
          </div>

          {/* Task Progress */}
          {totalTasks > 0 && (
            <div className="mb-4">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#D97757] transition-all duration-300"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Tasks List */}
          <TaskList
            tasks={linkedTasks}
            isLoading={tasksLoading}
            onUpdateTask={async () => {
              // Task updates are handled by the hook
              return true;
            }}
            onEditTask={(task) => {
              // Navigate to task edit
              router.push(`/tasks?edit=${task.id}`);
            }}
          />

          {/* Empty State */}
          {!tasksLoading && linkedTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500 mb-4">No tasks linked to this goal yet.</p>
              <Button variant="primary" size="md" onClick={() => router.push('/tasks')}>
                Add Tasks
              </Button>
            </div>
          )}
        </motion.div>
      </main>

      {/* Edit Modal */}
      <GoalModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleUpdateGoal}
        goal={goal}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowDeleteConfirm(false)}
          />
          <div className="relative bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Goal?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{goal.title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-error hover:bg-error/80"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
