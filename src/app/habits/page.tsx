'use client';

/**
 * Habits Page
 *
 * Main page for habit tracking with list, calendar, and grid views.
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHabits } from '@/hooks/useHabits';
import type { HabitDto } from '@/lib/habits';
import { HabitList, HabitModal, HabitCalendar } from '@/components/habits';

const VIEW_MODES = [
  { value: 'list', label: 'List', icon: '📋' },
  { value: 'calendar', label: 'Calendar', icon: '📅' },
] as const;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
] as const;

export default function HabitsPage() {
  const {
    habits,
    statistics,
    filteredHabits,
    isLoading,
    error,
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    showArchived,
    setShowArchived,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    refetch,
  } = useHabits({ autoFetch: true });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitDto | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedHabitForCalendar, setSelectedHabitForCalendar] = useState<HabitDto | null>(null);

  const handleAddHabit = useCallback(async () => {
    setEditingHabit(null);
    setIsModalOpen(true);
  }, []);

  const handleEditHabit = useCallback(async (habit: HabitDto) => {
    setEditingHabit(habit);
    setIsModalOpen(true);
  }, []);

  const handleDeleteHabit = useCallback(
    async (id: string) => {
      if (!confirm('Are you sure you want to delete this habit? This action cannot be undone.')) {
        return;
      }

      const success = await deleteHabit(id);
      if (!success) {
        alert('Failed to delete habit. Please try again.');
      }
    },
    [deleteHabit]
  );

  const handleSaveHabit = useCallback(
    async (input: Parameters<typeof addHabit>[0]) => {
      if (editingHabit) {
        await updateHabit(editingHabit.id, input);
        return;
      }
      await addHabit(input);
    },
    [editingHabit, addHabit, updateHabit]
  );

  const handleToggle = useCallback(
    async (id: string) => {
      await toggleHabit(id, selectedDate);
    },
    [toggleHabit, selectedDate]
  );

  const handleMonthChange = useCallback(
    async (year: number, month: number) => {
      // In a real app, this would fetch calendar data for the new month
      // For now, we'll just update the selected date
      setSelectedDate(new Date(year, month - 1, 1));
    },
    [setSelectedDate]
  );

  const handleDateClick = useCallback(
    async (date: Date) => {
      setSelectedDate(date);
      // Toggle the habit for the clicked date
      if (selectedHabitForCalendar) {
        await toggleHabit(selectedHabitForCalendar.id, date);
      }
    },
    [selectedHabitForCalendar, toggleHabit, setSelectedDate]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span>🎯</span>
                Habits
              </h1>
              {statistics && (
                <p className="text-sm text-gray-500 mt-1">
                  {statistics.activeHabits} active habits • {statistics.completedToday} completed
                  today
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Filter */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
                {FILTER_OPTIONS.map((filterOption) => (
                  <button
                    key={filterOption.value}
                    onClick={() => setFilter(filterOption.value)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${
                        filter === filterOption.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }
                    `}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {VIEW_MODES.map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() => setViewMode(mode.value)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5
                      ${
                        viewMode === mode.value
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-900'
                      }
                    `}
                  >
                    <span>{mode.icon}</span>
                    <span className="hidden sm:inline">{mode.label}</span>
                  </button>
                ))}
              </div>

              {/* Add Habit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddHabit}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="hidden sm:inline">Add Habit</span>
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24">
        {/* Statistics Cards */}
        {statistics && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-2xl font-bold text-gray-900">{statistics.totalHabits}</div>
              <div className="text-xs text-gray-500">Total Habits</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-2xl font-bold text-green-600">{statistics.completedToday}</div>
              <div className="text-xs text-gray-500">Completed Today</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">🔥</div>
              <div className="text-2xl font-bold text-orange-500">
                {statistics.currentStreaks[0]?.streak || 0}
              </div>
              <div className="text-xs text-gray-500">Best Streak</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-2xl font-bold text-blue-500">{statistics.completionRate}%</div>
              <div className="text-xs text-gray-500">Completion Rate</div>
            </div>
          </motion.div>
        )}

        {/* Mobile Filter */}
        <div className="sm:hidden flex items-center gap-2 mb-4 overflow-x-auto">
          {FILTER_OPTIONS.map((filterOption) => (
            <button
              key={filterOption.value}
              onClick={() => setFilter(filterOption.value)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                ${
                  filter === filterOption.value
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-500 border border-gray-200'
                }
              `}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {viewMode === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <HabitList
                habits={filteredHabits}
                onToggle={handleToggle}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
                isLoading={isLoading}
                filter={filter}
                showArchived={showArchived}
              />

              {/* Archived Toggle */}
              {habits.some((h) => h.isArchived) && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    {showArchived ? 'Hide' : 'Show'} archived habits
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {viewMode === 'calendar' && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Habit Selector for Calendar View */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Habit to View
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {filteredHabits.map((habit) => (
                    <button
                      key={habit.id}
                      onClick={() => setSelectedHabitForCalendar(habit)}
                      className={`
                        p-3 rounded-lg border-2 text-left transition-all
                        ${
                          selectedHabitForCalendar?.id === habit.id
                            ? 'border-gray-900 bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{habit.icon || '🎯'}</span>
                        <span className="font-medium truncate">{habit.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calendar */}
              {selectedHabitForCalendar ? (
                <HabitCalendar
                  habit={selectedHabitForCalendar}
                  calendarData={[]} // Will be populated by API
                  onMonthChange={handleMonthChange}
                  onDateClick={handleDateClick}
                  isLoading={isLoading}
                />
              ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
                  <div className="text-4xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Select a habit</h3>
                  <p className="text-gray-500">Choose a habit above to view its calendar</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoading && habits.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-gray-200 rounded-xl p-12 text-center"
          >
            <div className="text-5xl mb-4">🎯</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Start building good habits</h2>
            <p className="text-gray-500 mb-6">
              Create your first habit and start tracking your progress today.
            </p>
            <button
              onClick={handleAddHabit}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Create Your First Habit
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
      <HabitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveHabit}
        habit={editingHabit}
        mode={editingHabit ? 'edit' : 'create'}
      />
    </div>
  );
}
