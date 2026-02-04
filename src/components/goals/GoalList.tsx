'use client';

/**
 * GoalList Component
 *
 * List view for goals with filtering, sorting, and empty states.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GoalDto, CreateGoalInput, UpdateGoalInput } from '@/lib/goals';
import { GoalItem } from './GoalItem';
import { GoalModal } from './GoalModal';

export interface GoalListProps {
  goals: GoalDto[];
  isLoading: boolean;
  onAdd: (input: CreateGoalInput) => Promise<GoalDto | null>;
  onUpdate: (id: string, input: UpdateGoalInput) => Promise<GoalDto | null>;
  onDelete: (id: string) => Promise<boolean>;
  onUpdateProgress: (id: string, increment: number) => Promise<GoalDto | null>;
  onComplete: (id: string) => Promise<GoalDto | null>;
  onPause: (id: string) => Promise<GoalDto | null>;
}

const SORT_OPTIONS = [
  { value: 'sortOrder', label: 'Custom' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'progress', label: 'Progress' },
  { value: 'createdAt', label: 'Created' },
  { value: 'title', label: 'Title' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function GoalList({
  goals,
  isLoading,
  onAdd,
  onUpdate,
  onDelete,
  onUpdateProgress,
  onComplete,
  onPause,
}: GoalListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalDto | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [sortBy, setSortBy] = useState('sortOrder');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter and sort goals
  const filteredGoals = goals
    .filter((goal) => {
      if (statusFilter === 'all') return true;
      return goal.status === statusFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'progress':
          return (b.progress ?? 0) - (a.progress ?? 0);
        case 'createdAt':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return a.sortOrder - b.sortOrder;
      }
    });

  // Calculate stats
  const stats = {
    total: goals.length,
    active: goals.filter((g) => g.status === 'ACTIVE').length,
    completed: goals.filter((g) => g.status === 'COMPLETED').length,
    paused: goals.filter((g) => g.status === 'PAUSED').length,
    overallProgress:
      goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + (g.progress ?? 0), 0) / goals.length)
        : 0,
  };

  const handleEdit = (goal: GoalDto) => {
    setEditingGoal(goal);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleDelete = async (goalId: string) => {
    await onDelete(goalId);
  };

  const handleSave = async (input: CreateGoalInput) => {
    if (modalMode === 'edit' && editingGoal) {
      await onUpdate(editingGoal.id, input);
    } else {
      await onAdd(input);
    }
    setIsModalOpen(false);
    setEditingGoal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900">My Goals</h2>
        <button
          onClick={() => {
            setEditingGoal(null);
            setModalMode('create');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#D97757] text-white rounded-lg hover:bg-[#c96a4f] transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Goals</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-[#D97757]">{stats.active}</div>
          <div className="text-sm text-gray-500">Active</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500">Completed</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.overallProgress}%</div>
          <div className="text-sm text-gray-500">Avg Progress</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Filter */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-[#D97757] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#D97757] focus:border-transparent"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by: {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Goals Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : filteredGoals.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredGoals.map((goal) => (
              <GoalItem
                key={goal.id}
                goal={goal}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onUpdateProgress={onUpdateProgress}
                onComplete={onComplete}
                onPause={onPause}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No goals yet</h3>
          <p className="text-gray-500 mb-4">
            {statusFilter === 'all'
              ? 'Create your first goal to start tracking your progress.'
              : `No ${statusFilter.toLowerCase()} goals found.`}
          </p>
          {statusFilter === 'all' && (
            <button
              onClick={() => {
                setEditingGoal(null);
                setModalMode('create');
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#D97757] text-white rounded-lg hover:bg-[#c96a4f] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create Goal
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSave}
        goal={editingGoal}
        mode={modalMode}
      />
    </div>
  );
}
