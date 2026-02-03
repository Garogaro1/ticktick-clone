'use client';

import { useState, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useSavedFilters } from '@/hooks/useSavedFilters';
import type { SavedFilter } from '@/lib/filters/types';

export interface SavedFiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilter: (filter: SavedFilter) => void;
  currentFilter?: SavedFilter['filter'];
  className?: string;
}

/**
 * Modal for managing saved filters.
 *
 * Features:
 * - Display all saved filters
 * - Create new saved filter from current filter
 * - Delete saved filters
 * - Select saved filter to apply
 * - Edit saved filter names
 */
export function SavedFiltersModal({
  isOpen,
  onClose,
  onSelectFilter,
  currentFilter,
  className,
}: SavedFiltersModalProps) {
  const { savedFilters, createFilter, deleteFilter, updateFilter } = useSavedFilters();
  const [newFilterName, setNewFilterName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleCreateFilter = useCallback(() => {
    if (!newFilterName.trim() || !currentFilter) return;

    createFilter({
      name: newFilterName.trim(),
      filter: currentFilter,
    });

    setNewFilterName('');
  }, [newFilterName, currentFilter, createFilter]);

  const handleDeleteFilter = useCallback(
    (id: string) => {
      if (confirm('Are you sure you want to delete this saved filter?')) {
        deleteFilter(id);
      }
    },
    [deleteFilter]
  );

  const handleStartEdit = useCallback((filter: SavedFilter) => {
    setEditingId(filter.id);
    setEditName(filter.name);
  }, []);

  const handleSaveEdit = useCallback(
    (id: string) => {
      if (!editName.trim()) return;
      updateFilter(id, { name: editName.trim() });
      setEditingId(null);
      setEditName('');
    },
    [editName, updateFilter]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditName('');
  }, []);

  const handleSelectFilter = useCallback(
    (filter: SavedFilter) => {
      onSelectFilter(filter);
      onClose();
    },
    [onSelectFilter, onClose]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Saved Filters" className={className}>
      <div className="space-y-4">
        {/* Current Filter */}
        {currentFilter && Object.keys(currentFilter).length > 0 && (
          <div className="p-3 bg-background-secondary rounded-lg">
            <p className="text-sm font-medium text-text-primary mb-2">Current Filter</p>
            <div className="flex gap-2">
              <Input
                placeholder="Filter name..."
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleCreateFilter}
                disabled={!newFilterName.trim()}
              >
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Saved Filters List */}
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Saved Filters</h3>

          {savedFilters.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-text-secondary text-sm mb-3">No saved filters yet</p>
              <p className="text-text-tertiary text-xs">
                Apply filters and save them here for quick access
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {savedFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex items-center gap-2 p-3 bg-background-secondary rounded-lg group hover:bg-background-tertiary transition-colors"
                >
                  {/* Filter Name */}
                  <div className="flex-1 min-w-0">
                    {editingId === filter.id ? (
                      <div className="flex gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit(filter.id);
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          autoFocus
                        />
                        <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(filter.id)}>
                          Save
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectFilter(filter)}
                        className="text-left w-full text-text-primary font-medium hover:text-primary transition-colors truncate"
                      >
                        {filter.name}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  {editingId !== filter.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleStartEdit(filter)}
                        className="p-1"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFilter(filter.id)}
                        className="p-1 text-error hover:text-error"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="pt-2 border-t border-border">
          <Button variant="secondary" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
