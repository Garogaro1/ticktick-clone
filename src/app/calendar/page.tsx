'use client';

import { useState, useMemo } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useCalendar } from '@/hooks/useCalendar';
import {
  MonthCalendar,
  DayCalendar,
  WeekCalendar,
  ViewSwitcher,
  CalendarHeader,
} from '@/components/calendar';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MobileNav, getDefaultNavItems } from '@/components/mobile';
import type { CalendarEvent } from '@/lib/calendar/types';
import type { TaskDto } from '@/lib/tasks/types';
import { formatDateFull } from '@/lib/utils/date';
import { logger } from '@/lib/logger';

/**
 * Calendar Page - Multi-view calendar with task display.
 *
 * Features:
 * - Month, week, and day views
 * - Navigate between time periods
 * - Click date/time slot to add task
 * - Click task to edit details
 * - Go to today button
 * - View switcher for changing views
 * - Today indicator in time views
 * - Mobile responsive with bottom nav
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
    currentDate,
    view,
    selectedDate,
    monthViewData,
    weekViewData,
    dayViewData,
    setView,
    goToPrevious,
    goToNext,
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

  // Add task modal state (for date/time click)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Handle task drop (drag and drop to reschedule)
  const handleTaskDrop = async (taskId: string, newDate: Date) => {
    // Update the task with the new due date
    await updateTask(taskId, { dueDate: newDate });
  };

  // Format title based on view
  const viewTitle = useMemo(() => {
    if (!currentDate) return '';
    return formatDateFull(currentDate);
  }, [currentDate]);

  // Handle date click - open add task modal
  const handleDateClick = (date: Date) => {
    selectDate(date);
    setNewTaskDate(date.toISOString().split('T')[0]);
    setNewTaskTime('');
    setNewTaskTitle('');
    setIsAddModalOpen(true);
  };

  // Handle time slot click - open add task modal with time
  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    selectDate(date);
    setNewTaskDate(date.toISOString().split('T')[0]);
    // Format time as HH:MM
    const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    setNewTaskTime(timeStr);
    setNewTaskTitle('');
    setIsAddModalOpen(true);
  };

  // Handle time slot click for day view (hour only)
  const handleDayTimeSlotClick = (hour: number, minute: number) => {
    if (currentDate) {
      handleTimeSlotClick(currentDate, hour, minute);
    }
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

      // If time is specified, set it
      if (newTaskTime) {
        const [hours, minutes] = newTaskTime.split(':').map(Number);
        dueDate.setHours(hours, minutes, 0, 0);
      } else {
        // Set time to noon to avoid timezone issues
        dueDate.setHours(12, 0, 0, 0);
      }

      const result = await addTask(newTaskTitle, '');

      if (result) {
        // Update the task with the due date
        await updateTask(result.id, { dueDate });

        setIsAddModalOpen(false);
        setNewTaskTitle('');
        setNewTaskDate('');
        setNewTaskTime('');
        clearSelection();
      }
    } catch (err) {
      logger.error('Failed to add task', err instanceof Error ? err : undefined);
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
    setNewTaskTime('');
    clearSelection();
  };

  // Navigation items for bottom nav
  const navItems = useMemo(() => getDefaultNavItems(), []);

  return (
    <div className="min-h-screen bg-background-main pb-16 md:pb-0">
      {/* Header */}
      <header className="bg-background-main/80 backdrop-blur-md border-b border-border-subtle sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-3">
              {/* Calendar Icon - larger on mobile for tap target */}
              <div className="min-h-11 min-w-11 flex items-center justify-center">
                <div className="w-8 h-8 sm:w-8 sm:h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    width="18"
                    height="18"
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
              </div>
              <h1 className="text-lg sm:text-xl font-semibold text-text-primary truncate">
                Calendar
              </h1>
            </div>

            {/* Calendar link - hidden on mobile, icon on tablet */}
            <a
              href="/tasks"
              className="hidden sm:flex text-sm text-text-secondary hover:text-text-primary transition-colors items-center gap-1 min-h-11 px-3"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>List</span>
            </a>
            {/* Icon-only link on mobile */}
            <a
              href="/tasks"
              className="sm:hidden min-h-11 min-w-11 flex items-center justify-center text-text-secondary hover:text-text-primary"
              aria-label="View as list"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
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

        {/* Calendar header with navigation and view switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <CalendarHeader
            currentMonth={currentDate}
            onPreviousMonth={goToPrevious}
            onNextMonth={goToNext}
            onToday={goToToday}
            title={viewTitle}
          />
          <ViewSwitcher currentView={view} onViewChange={setView} />
        </div>

        {/* Loading state */}
        {isLoading && !monthViewData && !weekViewData && !dayViewData && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Calendar views */}
        {view === 'month' && monthViewData && (
          <div className="overflow-x-auto -mx-2 sm:mx-0 px-2 sm:px-0">
            <MonthCalendar
              monthViewData={monthViewData}
              selectedDate={selectedDate}
              onPreviousMonth={goToPrevious}
              onNextMonth={goToNext}
              onToday={goToToday}
              onDateClick={handleDateClick}
              onTaskClick={handleTaskClick}
              onTaskDrop={handleTaskDrop}
              title={viewTitle}
            />
          </div>
        )}

        {view === 'week' && (
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <WeekCalendar
              weekViewData={weekViewData}
              isLoading={isLoading}
              error={error}
              onTimeSlotClick={handleTimeSlotClick}
              onEventClick={handleTaskClick}
              startHour={6}
              endHour={22}
              hourHeight={50}
            />
          </div>
        )}

        {view === 'day' && (
          <DayCalendar
            dayViewData={dayViewData}
            isLoading={isLoading}
            error={error}
            onTimeSlotClick={handleDayTimeSlotClick}
            onEventClick={handleTaskClick}
            startHour={6}
            endHour={22}
            hourHeight={60}
          />
        )}

        {/* Empty state */}
        {!isLoading && tasks.length === 0 && (
          <div className="text-center py-12 px-4">
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
            <p className="text-text-secondary text-sm sm:text-base">
              Click on any date to add your first task, or go to the{' '}
              <a href="/tasks" className="text-primary hover:underline">
                Tasks page
              </a>
              .
            </p>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden fixed bottom-0 left-0 right-0">
        <MobileNav items={navItems} position="bottom" />
      </div>

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
        <div className="p-4 sm:p-6 max-w-md w-full mx-auto">
          <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-4">
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

            <div>
              <label
                htmlFor="task-time"
                className="block text-sm font-medium text-text-secondary mb-2"
              >
                Due Time (optional)
              </label>
              <Input
                id="task-time"
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={handleCloseAddModal}>
              Cancel
            </Button>
            <Button onClick={handleAddTask} disabled={!newTaskTitle.trim() || isAdding}>
              {isAdding ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
