'use client';

import { useState, useMemo } from 'react';
import { TaskList, TaskDetailModal } from '@/components/tasks';
import { ListSidebar } from '@/components/lists';
import { SmartListSidebar } from '@/components/smart-lists';
import { AdvancedFilterPanel, SavedFiltersModal } from '@/components/filters';
import { MobileSheet } from '@/components/ui/MobileSheet';
import { HamburgerButton, MobileNav, getDefaultNavItems } from '@/components/mobile';
import { useTasks, type SortBy, type SortOrder } from '@/hooks/useTasks';
import { useLists } from '@/hooks/useLists';
import { useSortPreferences } from '@/hooks/useSortPreferences';
import { getSmartListFilter, type SmartListType } from '@/lib/smart-lists';
import type { TaskFilter } from '@/components/filters';
import type { SavedFilter } from '@/lib/filters/types';
import { cn } from '@/lib/utils';

/**
 * Tasks Page - Main task management interface with smart lists and advanced filtering.
 *
 * Features:
 * - Smart Lists navigation (Today, Tomorrow, Next 7 Days, etc.)
 * - User Lists navigation
 * - Advanced filtering (status, priority, list, tags, date range)
 * - Saved custom filters
 * - Task list with filtering and sorting
 * - Add new tasks
 * - Edit task details
 * - Delete tasks
 * - Mobile responsive with hamburger menu and bottom nav
 * - Warm Claude theme styling
 */
export default function TasksPage() {
  // Navigation state
  const [activeTab, setActiveTab] = useState<'smart' | 'lists'>('smart');
  const [selectedSmartList, setSelectedSmartList] = useState<SmartListType>('all');
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Advanced filter state
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilter, setAdvancedFilter] = useState<TaskFilter>({});
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Sort preferences (persistent)
  const { sortBy, sortOrder, updatePreferences } = useSortPreferences();

  // Data hooks
  const { lists } = useLists({ autoFetch: true });

  // Transform lists for filter panel (convert null icon to undefined)
  const listsForFilter = useMemo(
    () =>
      lists.map((list) => ({
        id: list.id,
        title: list.title,
        icon: list.icon ?? undefined,
      })),
    [lists]
  );

  // Build filter for useTasks based on current selection
  const taskFilter = useMemo(() => {
    const baseFilter: Record<string, string | undefined> = {};

    // Apply smart list filter
    if (activeTab === 'smart' && selectedSmartList !== 'all') {
      const smartFilter = getSmartListFilter(selectedSmartList);
      Object.assign(baseFilter, smartFilter);
    }

    // Apply list filter
    if (activeTab === 'lists' && selectedListId) {
      baseFilter.listId = selectedListId;
    }

    // Apply advanced filters
    if (advancedFilter.status) {
      const status = Array.isArray(advancedFilter.status)
        ? advancedFilter.status.join(',')
        : advancedFilter.status;
      baseFilter.status = status;
    }
    if (advancedFilter.priority) {
      const priority = Array.isArray(advancedFilter.priority)
        ? advancedFilter.priority.join(',')
        : advancedFilter.priority;
      baseFilter.priority = priority;
    }
    if (advancedFilter.listId) {
      baseFilter.listId = advancedFilter.listId;
    }
    if (advancedFilter.tagIds && advancedFilter.tagIds.length > 0) {
      baseFilter.tagId = advancedFilter.tagIds.join(',');
    }
    if (advancedFilter.dueDateFrom) {
      baseFilter.dueAfter = advancedFilter.dueDateFrom;
    }
    if (advancedFilter.dueDateTo) {
      baseFilter.dueBefore = advancedFilter.dueDateTo;
    }
    if (advancedFilter.search) {
      baseFilter.search = advancedFilter.search;
    }

    return Object.keys(baseFilter).length > 0 ? baseFilter : undefined;
  }, [activeTab, selectedSmartList, selectedListId, advancedFilter]);

  const { tasks, isLoading, error, addTask, updateTask, deleteTask, reorderTasks } = useTasks({
    autoFetch: true,
    filter: taskFilter,
    sortBy,
    sortOrder,
  });

  // Task detail state
  const [selectedTask, setSelectedTask] = useState<
    Awaited<ReturnType<typeof useTasks>>['tasks'][number] | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return Object.keys(advancedFilter).filter(
      (key) =>
        advancedFilter[key as keyof TaskFilter] !== undefined &&
        advancedFilter[key as keyof TaskFilter] !== '' &&
        (Array.isArray(advancedFilter[key as keyof TaskFilter])
          ? (advancedFilter[key as keyof TaskFilter] as unknown[]).length > 0
          : true)
    ).length;
  }, [advancedFilter]);

  // Handlers
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

  const handleApplyAdvancedFilter = (filter: TaskFilter) => {
    setAdvancedFilter(filter);
    // Switch to smart list "all" to apply custom filters
    setActiveTab('smart');
    setSelectedSmartList('all');
  };

  const handleClearAdvancedFilter = () => {
    setAdvancedFilter({});
  };

  const handleSelectSavedFilter = (savedFilter: SavedFilter) => {
    setAdvancedFilter(savedFilter.filter);
    setActiveTab('smart');
    setSelectedSmartList('all');
  };

  const handleTabChange = (tab: 'smart' | 'lists') => {
    setActiveTab(tab);
    // Clear advanced filter when switching tabs
    setAdvancedFilter({});
  };

  const handleSortChange = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    updatePreferences(newSortBy, newSortOrder);
  };

  const handleReorderTasks = async (updates: Array<{ id: string; sortOrder: number }>) => {
    return await reorderTasks(updates);
  };

  // Get current view title
  const viewTitle = useMemo(() => {
    if (activeTab === 'smart') {
      if (selectedSmartList === 'all') {
        return activeFilterCount > 0 ? 'Filtered Tasks' : 'All Tasks';
      }
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
    const list = lists.find((l) => l.id === selectedListId);
    return list?.title || 'All Tasks';
  }, [activeTab, selectedSmartList, selectedListId, lists, activeFilterCount]);

  // Navigation items for bottom nav
  const navItems = useMemo(() => getDefaultNavItems(), []);

  return (
    <div className="flex h-screen bg-background-main overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-56 lg:w-64 bg-background-card border-r border-border flex-col">
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

      {/* Mobile Sidebar Sheet */}
      <MobileSheet
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        side="left"
        maxWidth="280px"
      >
        {/* Tab Switcher */}
        <div className="flex border-b border-border">
          <button
            onClick={() => {
              handleTabChange('smart');
            }}
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
            onClick={() => {
              handleTabChange('lists');
            }}
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
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'smart' ? (
            <SmartListSidebar
              activeSmartList={selectedSmartList}
              onSelectSmartList={(list) => {
                setSelectedSmartList(list);
                setIsMobileSidebarOpen(false);
              }}
            />
          ) : (
            <ListSidebar
              activeListId={selectedListId}
              onSelectList={(id) => {
                setSelectedListId(id);
                setIsMobileSidebarOpen(false);
              }}
              className="border-none"
            />
          )}
        </div>
      </MobileSheet>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shrink-0 bg-background-main/80 backdrop-blur-md border-b border-border-subtle">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-3">
                {/* Mobile Hamburger */}
                <HamburgerButton
                  isOpen={isMobileSidebarOpen}
                  onToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
                  className="md:hidden"
                />

                {/* Logo - hidden on mobile */}
                <div className="hidden sm:block w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
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
                <h1 className="text-lg sm:text-xl font-semibold text-text-primary truncate max-w-[150px] sm:max-w-none">
                  {viewTitle}
                </h1>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Advanced Filter Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                    className={cn(
                      'flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      'min-h-11', // 44px tap target
                      activeFilterCount > 0
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-background-secondary'
                    )}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span className="hidden sm:inline">Filter</span>
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Advanced Filter Panel */}
                  <AdvancedFilterPanel
                    isOpen={showAdvancedFilter}
                    onClose={() => setShowAdvancedFilter(false)}
                    onApply={handleApplyAdvancedFilter}
                    onClear={handleClearAdvancedFilter}
                    currentFilter={advancedFilter}
                    lists={listsForFilter}
                  />
                </div>

                {/* Saved Filters Button */}
                <button
                  onClick={() => setShowSavedFilters(true)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 rounded-lg text-sm font-medium',
                    'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
                    'transition-all duration-200 min-h-11' // 44px tap target
                  )}
                  title="Saved filters"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="hidden sm:inline">Saved</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
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
              onReorderTasks={handleReorderTasks}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onChangeSort={handleSortChange}
            />
          </div>
        </div>
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <div className="md:hidden">
        <MobileNav items={navItems} position="bottom" />
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

      {/* Saved Filters Modal */}
      <SavedFiltersModal
        isOpen={showSavedFilters}
        onClose={() => setShowSavedFilters(false)}
        onSelectFilter={handleSelectSavedFilter}
        currentFilter={advancedFilter}
      />
    </div>
  );
}
