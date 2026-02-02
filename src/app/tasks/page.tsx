'use client';

import { useState } from 'react';
import { TaskList, TaskDetailModal } from '@/components/tasks';
import { useTasks } from '@/hooks/useTasks';

/**
 * Tasks Page - Main task management interface.
 *
 * Features:
 * - Task list with filtering and sorting
 * - Add new tasks
 * - Edit task details
 * - Delete tasks
 * - Warm Claude theme styling
 */
export default function TasksPage() {
  const { tasks, isLoading, error, addTask, updateTask, deleteTask } = useTasks({
    autoFetch: true,
  });

  const [selectedTask, setSelectedTask] = useState<
    Awaited<ReturnType<typeof useTasks>>['tasks'][number] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddTask = async (title: string) => {
    const result = await addTask(title);
    if (!result) {
      throw new Error('Failed to add task');
    }
  };

  const handleUpdateTask = async (id: string, updates: Partial<(typeof tasks)[number]>) => {
    return await updateTask(id, updates);
  };

  const handleEditTask = (task: (typeof tasks)[number]) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (id: string, updates: Partial<(typeof tasks)[number]>) => {
    const success = await updateTask(id, updates);
    if (success) {
      setIsModalOpen(false);
      setSelectedTask(null);
    }
  };

  const handleDeleteTask = (id: string) => {
    deleteTask(id);
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  return (
    <main className="min-h-screen bg-background-main">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background-main/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-text-primary">My Tasks</h1>
            </div>

            {/* User menu / profile link */}
            <a
              href="/profile"
              className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="hidden sm:inline">Profile</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Task list */}
        <TaskList
          tasks={tasks}
          isLoading={isLoading}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={deleteTask}
          onEditTask={handleEditTask}
        />
      </div>

      {/* Task detail modal */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </main>
  );
}
