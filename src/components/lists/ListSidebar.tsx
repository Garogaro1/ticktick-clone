'use client';

import { useState } from 'react';
import { ListButton } from './ListButton';
import { AddListModal } from './AddListModal';
import { useLists } from '@/hooks/useLists';
import { cn } from '@/lib/utils';
import type { ListDto } from '@/lib/lists/types';

export interface ListSidebarProps {
  activeListId?: string | null;
  onSelectList: (listId: string | null) => void;
  className?: string;
}

/**
 * Sidebar component for list navigation.
 *
 * Features:
 * - All lists display
 * - Active list indicator
 * - Task count per list
 * - Favorite lists section
 * - Add new list button
 * - Edit/delete lists
 */
export function ListSidebar({ activeListId, onSelectList, className }: ListSidebarProps) {
  const { lists, isLoading, error, refetch, addList, updateList, deleteList, toggleFavorite } =
    useLists({ autoFetch: true });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ListDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Separate favorite and regular lists
  const favoriteLists = lists.filter((l) => l.isFavorite);
  const regularLists = lists.filter((l) => !l.isFavorite);

  // Sort by sortOrder within each group
  const sortLists = (a: ListDto, b: ListDto) => a.sortOrder - b.sortOrder;
  favoriteLists.sort(sortLists);
  regularLists.sort(sortLists);

  const handleAddList = async (data: {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => {
    setIsSaving(true);
    const result = await addList(data.title, {
      description: data.description,
      icon: data.icon,
      color: data.color,
    });
    setIsSaving(false);
    return !!result;
  };

  const handleUpdateList = async (data: {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => {
    if (!editingList) return false;

    setIsSaving(true);
    const result = await updateList(editingList.id, data);
    setIsSaving(false);

    if (result) {
      setEditingList(null);
    }

    return result;
  };

  const handleDeleteList = async (list: ListDto) => {
    if (list.isDefault) {
      alert('Cannot delete the default Inbox list.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${list.title}"? Tasks in this list will not be deleted.`
    );

    if (confirmed) {
      await deleteList(list.id);
      // If deleted list was active, switch to all tasks
      if (activeListId === list.id) {
        onSelectList(null);
      }
    }
  };

  const handleToggleFavorite = async (listId: string, isFavorite: boolean) => {
    await toggleFavorite(listId, isFavorite);
  };

  const isListActive = (listId: string) => activeListId === listId;

  return (
    <>
      <aside
        className={cn(
          'w-64 bg-background-card border-r border-border h-full flex flex-col',
          className
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Lists</h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-all duration-200"
              aria-label="Add new list"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* All Tasks button */}
          <button
            onClick={() => onSelectList(null)}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
              'transition-all duration-200 ease-out',
              'hover:bg-background-secondary',
              activeListId === null
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary'
            )}
          >
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-background-secondary">
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
            </div>
            <span className="flex-1 text-left">All Tasks</span>
          </button>
        </div>

        {/* Lists */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-10 bg-background-secondary rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-4 text-sm text-error text-center">
              {error}
              <button onClick={refetch} className="block mx-auto mt-2 text-primary hover:underline">
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* Favorite Lists */}
              {favoriteLists.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-3">
                    Favorites
                  </h3>
                  <div className="space-y-1">
                    {favoriteLists.map((list) => (
                      <ListButton
                        key={list.id}
                        list={list}
                        isActive={isListActive(list.id)}
                        onClick={() => onSelectList(list.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={setEditingList}
                        onDelete={handleDeleteList}
                        showActions
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Lists */}
              {regularLists.length > 0 && (
                <div>
                  {favoriteLists.length > 0 && (
                    <h3 className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-2 px-3">
                      Lists
                    </h3>
                  )}
                  <div className="space-y-1">
                    {regularLists.map((list) => (
                      <ListButton
                        key={list.id}
                        list={list}
                        isActive={isListActive(list.id)}
                        onClick={() => onSelectList(list.id)}
                        onToggleFavorite={handleToggleFavorite}
                        onEdit={setEditingList}
                        onDelete={handleDeleteList}
                        showActions
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {lists.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-text-secondary text-sm mb-3">No lists yet</p>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Create your first list
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border">
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
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Profile</span>
          </a>
        </div>
      </aside>

      {/* Add List Modal */}
      <AddListModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddList}
        isLoading={isSaving}
      />

      {/* Edit List Modal */}
      <AddListModal
        isOpen={!!editingList}
        onClose={() => setEditingList(null)}
        onSave={handleUpdateList}
        list={editingList}
        isLoading={isSaving}
      />
    </>
  );
}
