'use client';

import { useState } from 'react';
import { EisenhowerMatrix } from '@/components/eisenhower';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { ListSidebar } from '@/components/lists';
import { SmartListSidebar } from '@/components/smart-lists';
import { useEisenhower } from '@/hooks/useEisenhower';
import { getSmartListFilter, type SmartListType } from '@/lib/smart-lists';
import type { TaskDto } from '@/lib/tasks/types';
import type { TaskWithQuadrant, EisenhowerQuadrant } from '@/lib/eisenhower';
import { cn } from '@/lib/utils/cn';

/**
 * Eisenhower Matrix Page - 4-quadrant task prioritization.
 *
 * Features:
 * - Tasks auto-categorized by urgency (due date) and importance (priority)
 * - Drag tasks between quadrants to manually override categorization
 * - Manual overrides persist in localStorage
 * - Filter by smart lists or user lists
 * - Click tasks to edit details
 * - Warm Claude theme styling
 */
export default function EisenhowerPage() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'smart' | 'lists'>('smart');
  const [selectedSmartList, setSelectedSmartList] = useState<SmartListType>('all');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Task detail modal state
  const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Build filter based on navigation selection
  const filter = useState(() => {
    const baseFilter: Record<string, string> = {};

    if (activeTab === 'smart' && selectedSmartList !== 'all') {
      const smartFilter = getSmartListFilter(selectedSmartList);
      Object.assign(baseFilter, smartFilter);
    }

    if (activeTab === 'lists' && selectedListId) {
      baseFilter.listId = selectedListId;
    }

    return Object.keys(baseFilter).length > 0 ? baseFilter : undefined;
  })[0];

  // Eisenhower hook
  const {
    matrixData,
    manualAssignments,
    isLoading,
    error,
    moveToQuadrant,
    refetch,
    updateTask,
    deleteTask,
  } = useEisenhower({
    autoFetch: true,
    filter,
    includeCompleted: false,
    includeCancelled: false,
  });

  // Handlers
  const handleEditTask = (task: TaskWithQuadrant) => {
    // Convert TaskWithQuadrant to TaskDto for the modal
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (id: string, updates: Partial<TaskDto>) => {
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

  const handleMoveTask = async (taskId: string, toQuadrant: EisenhowerQuadrant) => {
    moveToQuadrant(taskId, toQuadrant);
  };

  const handleTabChange = (tab: 'smart' | 'lists') => {
    setActiveTab(tab);
    setSelectedSmartList('all');
    setSelectedListId(null);
  };

  // Get current view title
  const getViewTitle = () => {
    if (activeTab === 'smart') {
      const titles: Record<SmartListType, string> = {
        all: 'All Tasks',
        today: 'Today',
        tomorrow: 'Tomorrow',
        next7Days: 'Next 7 Days',
        overdue: 'Overdue',
        noDate: 'No Date',
        completed: 'Completed',
      };
      return titles[selectedSmartList];
    }
    return selectedListId ? 'List View' : 'All Tasks';
  };

  return (
    <div className="flex h-screen bg-background-main overflow-hidden">
      {/* Sidebar */}
      <div className="w-56 bg-background-card border-r border-border flex flex-col shrink-0">
        {/* Tab Switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => handleTabChange('smart')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors duration-200',
              activeTab === 'smart'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Smart
          </button>
          <button
            onClick={() => handleTabChange('lists')}
            className={cn(
              'flex-1 py-3 text-sm font-medium transition-colors duration-200',
              activeTab === 'lists'
                ? 'text-primary border-b-2 border-primary bg-primary/5'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            Lists
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'smart' ? (
            <SmartListSidebar
              activeSmartList={selectedSmartList}
              onSelectSmartList={setSelectedSmartList}
            />
          ) : (
            <ListSidebar
              activeListId={selectedListId}
              onSelectList={setSelectedListId}
              className="border-none"
            />
          )}
        </div>
      </div>

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
                    <rect x="3" y="3" width="8" height="8" rx="1" />
                    <rect x="13" y="3" width="8" height="8" rx="1" />
                    <rect x="3" y="13" width="8" height="8" rx="1" />
                    <rect x="13" y="13" width="8" height="8" rx="1" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text-primary">Eisenhower Matrix</h1>
                  <p className="text-xs text-text-secondary">{getViewTitle()}</p>
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2">
                <a
                  href="/tasks"
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-all duration-200"
                >
                  List
                </a>
                <a
                  href="/kanban"
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-all duration-200"
                >
                  Kanban
                </a>
                <a
                  href="/calendar"
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-all duration-200"
                >
                  Calendar
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Eisenhower Matrix */}
        <div className="flex-1 overflow-hidden p-6">
          <EisenhowerMatrix
            matrixData={matrixData}
            manualAssignments={manualAssignments}
            isLoading={isLoading}
            error={error}
            onTaskMove={handleMoveTask}
            onTaskClick={handleEditTask}
            onRefetch={refetch}
          />
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
