'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCalendar } from '@/hooks/useCalendar';
import { MonthCalendar } from '@/components/calendar';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { CalendarEvent } from '@/lib/calendar/types';
import type { TaskDto } from '@/lib/tasks/types';
import { formatDateFull } from '@/lib/utils/date';
import { cn } from '@/lib/utils';

/**
 * Calendar Page - Monthly view of tasks with date-based navigation.
 *
 * Features:
 * - Monthly calendar grid with task display
 * - Navigate between months
 * - Click date to add task
 * - Click task to edit details
 * - Go to today button
 * - Drag tasks to change dates (with @dnd-kit)
 * - Warm Claude theme styling
 */
export default function CalendarPage() {
  // Get all tasks (without filters to show all tasks on calendar)
  const { tasks, isLoading, error, addTask, updateTask, deleteTask } = useTasks({
    autoFetch: true,
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // Calendar state
  const {
    currentMonth,
    selectedDate,
    monthViewData,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    selectDate,
    clearSelection,
  } = useCalendar(tasks, {
    includeCompleted: true,
    startOfWeek: 0,
  });

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Add task modal state (for date click)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Handle task drop (drag and drop to reschedule)
  const handleTaskDrop = async (taskId: string, newDate: Date) => {
    // Update the task with the new due date
    await updateTask(taskId, { dueDate: newDate });
  };

  // Format month for title
  const monthTitle = useMemo(() => {
    if (!currentMonth) return '';
    return formatDateFull(currentMonth);
  }, [currentMonth]);

  // Handle date click - open add task modal
  const handleDateClick = (date: Date) => {
    selectDate(date);
    setNewTaskDate(date.toISOString().split('T')[0]);
    setNewTaskTitle('');
    setIsAddModalOpen(true);
  };

  // Handle task click - open edit modal
  const handleTaskClick = (event: CalendarEvent) => {
    const task = tasks.find((t) => t.id === event.id);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  // Handle add task from modal
  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !newTaskDate) return;

    setIsAdding(true);
    try {
      const dueDate = new Date(newTaskDate);
      // Set time to noon to avoid timezone issues
      dueDate.setHours(12, 0, 0, 0);

      const result = await addTask(newTaskTitle, '');

      if (result) {
        // Update the task with the due date
        await updateTask(result.id, { dueDate });

        setIsAddModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDate('');
        clearSelection();
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    } finally {
      setIsAdding(false);
    }
  };

  // Handle save task from detail modal
  const handleSaveTask = async (id: string, updates: Partial<TaskDto>) => {
    await updateTask(id, updates);
  };

  // Handle delete task
  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Handle close add modal
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewTaskTitle('');
    setNewTaskDate('');
    clearSelection();
  };

  return (
    <div className="min-h-screen bg-background-main">
      {/* Header */}
      <header className="bg-background-main/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-10">
        <div className="px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-text-primary">Calendar</h1>
            </div>

            {/* Calendar link */}
            <a
              href="/tasks"
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              View as List
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/30 rounded-lg text-error">
            <div className="flex items-center gap-2">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && !monthViewData && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Calendar */}
        {monthViewData && (
          <MonthCalendar
            monthViewData={monthViewData}
            selectedDate={selectedDate}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
            onToday={goToToday}
            onDateClick={handleDateClick}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskDrop}
            title={monthTitle}
          />
        )}

        {/* Empty state */}
        {!isLoading && tasks.length === 0 && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-text-tertiary mb-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="text-lg font-medium text-text-primary mb-2">No tasks yet</h3>
            <p className="text-text-secondary">
              Click on any date to add your first task, or go to the{' '}
              <a href="/tasks" className="text-primary hover:underline">
                Tasks page
              </a>
              .
            </p>
          </div>
        )}
      </main>

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />

      {/* Add task modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">
            Add Task for {selectedDate ? formatDateFull(selectedDate) : ''}
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="task-title"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Task Title
              </label>
              <Input
                id="task-title"
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newTaskTitle.trim()) {
                    handleAddTask();
                  }
                }}
                autoFocus
              />
            </div>

            <div>
              <label
                htmlFor="task-date"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Due Date
              </label>
              <Input
                id="task-date"
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleCloseAddModal}
              className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAddTask}
              disabled={!newTaskTitle.trim() || isAdding}
              className={cn(
                'px-4 py-2 bg-primary text-white rounded-lg font-medium',
                'hover:bg-primary-dark transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isAdding ? 'Adding...' : 'Add Task'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
