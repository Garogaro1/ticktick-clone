'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { TaskStatus, Priority } from '@/lib/tasks/types';

export interface TaskFilter {
  status?: TaskStatus | TaskStatus[];
  priority?: Priority | Priority[];
  listId?: string;
  tagIds?: string[];
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

export interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filter: TaskFilter) => void;
  onClear: () => void;
  currentFilter?: TaskFilter;
  lists?: Array<{ id: string; title: string; icon?: string }>;
  tags?: Array<{ id: string; name: string; color: string }>;
  className?: string;
}

/**
 * Advanced filter panel for custom task filtering.
 *
 * Features:
 * - Filter by status (multiple selection)
 * - Filter by priority (multiple selection)
 * - Filter by list
 * - Filter by tags (multiple selection)
 * - Filter by date range
 * - Filter by search query
 * - Clear all filters
 */
export function AdvancedFilterPanel({
  isOpen,
  onClose,
  onApply,
  onClear,
  currentFilter = {},
  lists = [],
  tags = [],
  className,
}: AdvancedFilterPanelProps) {
  const [filter, setFilter] = useState<TaskFilter>(currentFilter);

  const handleStatusChange = useCallback((status: TaskStatus) => {
    setFilter((prev) => {
      const current = prev.status;
      if (current === undefined) {
        return { ...prev, status: [status] };
      }
      if (Array.isArray(current)) {
        if (current.includes(status)) {
          const filtered = current.filter((s) => s !== status);
          return { ...prev, status: filtered.length > 0 ? filtered : undefined };
        }
        return { ...prev, status: [...current, status] };
      }
      return { ...prev, status: current === status ? undefined : [current, status] };
    });
  }, []);

  const handlePriorityChange = useCallback((priority: Priority) => {
    setFilter((prev) => {
      const current = prev.priority;
      if (current === undefined) {
        return { ...prev, priority: [priority] };
      }
      if (Array.isArray(current)) {
        if (current.includes(priority)) {
          const filtered = current.filter((p) => p !== priority);
          return { ...prev, priority: filtered.length > 0 ? filtered : undefined };
        }
        return { ...prev, priority: [...current, priority] };
      }
      return {
        ...prev,
        priority: current === priority ? undefined : [current, priority],
      };
    });
  }, []);

  const handleTagToggle = useCallback((tagId: string) => {
    setFilter((prev) => {
      const current = prev.tagIds || [];
      if (current.includes(tagId)) {
        const filtered = current.filter((id) => id !== tagId);
        return { ...prev, tagIds: filtered.length > 0 ? filtered : undefined };
      }
      return { ...prev, tagIds: [...current, tagId] };
    });
  }, []);

  const handleApply = useCallback(() => {
    onApply(filter);
    onClose();
  }, [filter, onApply, onClose]);

  const handleClearFilters = useCallback(() => {
    setFilter({});
    onClear();
  }, [onClear]);

  if (!isOpen) return null;

  const statusOptions: Array<{ value: TaskStatus; label: string; color: string }> = [
    { value: 'TODO', label: 'To Do', color: 'bg-gray-200' },
    { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-200' },
    { value: 'DONE', label: 'Done', color: 'bg-green-200' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-200' },
  ];

  const priorityOptions: Array<{ value: Priority; label: string; color: string }> = [
    { value: 'NONE', label: 'None', color: 'bg-gray-100' },
    { value: 'LOW', label: 'Low', color: 'bg-blue-100' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-orange-100' },
    { value: 'HIGH', label: 'High', color: 'bg-red-100' },
  ];

  const selectedStatuses = Array.isArray(filter.status)
    ? filter.status
    : filter.status
      ? [filter.status]
      : [];
  const selectedPriorities = Array.isArray(filter.priority)
    ? filter.priority
    : filter.priority
      ? [filter.priority]
      : [];

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 mt-2 bg-background-card border border-border rounded-lg shadow-lg z-50',
        'max-h-96 overflow-y-auto',
        className
      )}
    >
      <div className="p-4">
        {/* Status Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Status</h3>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleStatusChange(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  'border-2',
                  selectedStatuses.includes(option.value)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Priority</h3>
          <div className="flex flex-wrap gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePriorityChange(option.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                  'border-2',
                  selectedPriorities.includes(option.value)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* List Filter */}
        {lists.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">List</h3>
            <select
              value={filter.listId || ''}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  listId: e.target.value || undefined,
                }))
              }
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">All Lists</option>
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.icon ? `${list.icon} ` : ''}
                  {list.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tags Filter */}
        {tags.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-text-primary mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = filter.tagIds?.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => handleTagToggle(tag.id)}
                    className={cn(
                      'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200',
                      'border-2',
                      isSelected
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    )}
                    style={
                      !isSelected
                        ? { backgroundColor: `${tag.color}20`, borderColor: tag.color }
                        : undefined
                    }
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Due Date</h3>
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="dueDateFrom" className="text-xs text-text-secondary">
                From
              </label>
              <input
                id="dueDateFrom"
                type="date"
                value={filter.dueDateFrom || ''}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    dueDateFrom: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="dueDateTo" className="text-xs text-text-secondary">
                To
              </label>
              <input
                id="dueDateTo"
                type="date"
                value={filter.dueDateTo || ''}
                onChange={(e) =>
                  setFilter((prev) => ({
                    ...prev,
                    dueDateTo: e.target.value || undefined,
                  }))
                }
                className="w-full px-3 py-2 bg-background-secondary border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={handleClearFilters} className="flex-1">
            Clear All
          </Button>
          <Button variant="primary" onClick={handleApply} className="flex-1">
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
