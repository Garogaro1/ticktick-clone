'use client';

import { useState, useMemo } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { TaskDto } from '@/lib/tasks/types';
import { TaskStatus } from '@prisma/client';

export interface PomodoroTaskSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskDto[];
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

/**
 * PomodoroTaskSelectorModal component for selecting a task to link to the timer.
 *
 * Features:
 * - Search and filter tasks
 * - Show only active tasks by default
 * - Display task priority and list
 * - Clear task selection option
 */
export function PomodoroTaskSelectorModal({
  isOpen,
  onClose,
  tasks,
  selectedTaskId,
  onSelectTask,
}: PomodoroTaskSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Filter by status
      if (!showCompleted && task.status === TaskStatus.DONE) return false;

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          task.title.toLowerCase().includes(query) ||
          task.description?.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [tasks, searchQuery, showCompleted]);

  const handleSelectTask = (taskId: string | null) => {
    onSelectTask(taskId);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Task" size="md">
      <div className="flex flex-col gap-4">
        {/* Search Input */}
        <div>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-text-primary placeholder:text-text-tertiary"
            autoFocus
          />
        </div>

        {/* Filter Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-text-secondary">Show completed tasks</span>
        </label>

        {/* Task List */}
        <div className="max-h-80 overflow-y-auto">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-text-secondary">
              {searchQuery ? 'No tasks match your search.' : 'No active tasks found.'}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {/* No Task Option */}
              <button
                onClick={() => handleSelectTask(null)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                  'hover:bg-background-secondary',
                  selectedTaskId === null
                    ? 'bg-primary/10 border-2 border-primary'
                    : 'border-2 border-transparent'
                )}
              >
                <span className="flex-1 text-text-primary font-medium">No task (just focus)</span>
                {selectedTaskId === null && <span className="text-primary">✓</span>}
              </button>

              {/* Tasks */}
              {filteredTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => handleSelectTask(task.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200',
                    'hover:bg-background-secondary',
                    selectedTaskId === task.id
                      ? 'bg-primary/10 border-2 border-primary'
                      : 'border-2 border-transparent'
                  )}
                >
                  {/* Priority indicator */}
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full flex-shrink-0',
                      task.priority === 'HIGH' && 'bg-red-500',
                      task.priority === 'MEDIUM' && 'bg-orange-400',
                      task.priority === 'LOW' && 'bg-blue-400',
                      !task.priority || (task.priority === 'NONE' && 'bg-gray-300')
                    )}
                  />

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-text-primary font-medium truncate">{task.title}</div>
                  </div>

                  {/* Selected indicator */}
                  {selectedTaskId === task.id && <span className="text-primary">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => handleSelectTask(selectedTaskId)}>
          Select Task
        </Button>
      </footer>
    </Modal>
  );
}
