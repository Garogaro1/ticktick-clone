'use client';

import { useState } from 'react';
import { KanbanBoard } from '@/components/kanban';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { ListSidebar } from '@/components/lists';
import { SmartListSidebar } from '@/components/smart-lists';
import { useKanban } from '@/hooks/useKanban';
import { getSmartListFilter, type SmartListType } from '@/lib/smart-lists';
import type { TaskDto } from '@/lib/tasks/types';
import { cn } from '@/lib/utils/cn';

/**
 * Kanban Page - Task board with drag-and-drop columns.
 *
 * Features:
 * - Group tasks by status, priority, list, or tag
 * - Drag tasks between columns to update their properties
 * - Sort tasks within columns
 * - Click tasks to edit details
 * - Filter by smart lists or user lists
 * - Warm Claude theme styling
 */
export default function KanbanPage() {
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

  // Kanban hook
  const {
    groupBy,
    sortBy,
    sortOrder,
    columns,
    isLoading,
    error,
    setGroupBy,
    setSortBy,
    setSortOrder,
    moveTask,
    refetch,
    updateTask,
    deleteTask,
  } = useKanban({
    autoFetch: true,
    filter,
  });

  // Handlers
  const handleEditTask = (task: TaskDto) => {
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
    // Find list title - would need lists for this
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
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                    <path d="M15 3v18" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-text-primary">Kanban Board</h1>
                  <p className="text-xs text-text-secondary">{getViewTitle()}</p>
                </div>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-2">
                <a
                  href="/tasks"
                  className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-all duration-200"
                >
                  List View
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

        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden p-6">
          <KanbanBoard
            columns={columns}
            groupBy={groupBy}
            sortBy={sortBy}
            sortOrder={sortOrder}
            isLoading={isLoading}
            error={error}
            onGroupByChange={setGroupBy}
            onSortByChange={setSortBy}
            onSortOrderChange={setSortOrder}
            onTaskMove={moveTask}
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
