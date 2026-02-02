'use client';

import { useState } from 'react';
import { TaskList, TaskDetailModal } from '@/components/tasks';
import { ListSidebar } from '@/components/lists';
import { useTasks } from '@/hooks/useTasks';

/**
 * Tasks Page - Main task management interface with list navigation.
 *
 * Features:
 * - Sidebar with lists navigation
 * - Task list with filtering and sorting
 * - Add new tasks
 * - Edit task details
 * - Delete tasks
 * - Filter tasks by selected list
 * - Warm Claude theme styling
 */
export default function TasksPage() {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const { tasks, isLoading, error, addTask, updateTask, deleteTask } = useTasks({
    autoFetch: true,
    filter: selectedListId ? { listId: selectedListId } : undefined,
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
    <div className="flex h-screen bg-background-main overflow-hidden">
      {/* Sidebar */}
      <ListSidebar activeListId={selectedListId} onSelectList={setSelectedListId} />

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 bg-background-main/80 backdrop-blur-md border-b border-border-subtle">
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
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
                <h1 className="text-xl font-semibold text-text-primary">My Tasks</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
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
        </div>
      </main>

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
    </div>
  );
}
