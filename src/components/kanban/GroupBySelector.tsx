'use client';

import { cn } from '@/lib/utils/cn';
import type { KanbanGroupBy } from '@/lib/kanban';

export interface GroupBySelectorProps {
  groupBy: KanbanGroupBy;
  onGroupByChange: (groupBy: KanbanGroupBy) => void;
  disabled?: boolean;
}

const GROUP_BY_OPTIONS: Array<{ value: KanbanGroupBy; label: string; icon: string }> = [
  { value: 'status', label: 'Status', icon: '📊' },
  { value: 'priority', label: 'Priority', icon: '🔴' },
  { value: 'list', label: 'List', icon: '📁' },
  { value: 'tag', label: 'Tag', icon: '🏷️' },
];

/**
 * Group by selector for Kanban board.
 *
 * Allows switching between different grouping options.
 */
export function GroupBySelector({
  groupBy,
  onGroupByChange,
  disabled = false,
}: GroupBySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-secondary">Group by:</span>
      <div className="flex items-center bg-background-secondary rounded-lg p-1 border border-border-subtle">
        {GROUP_BY_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onGroupByChange(option.value)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
              groupBy === option.value
                ? 'bg-background-card text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary hover:bg-background-tertiary',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
            aria-pressed={groupBy === option.value}
            aria-label={`Group by ${option.label}`}
          >
            <span className="text-base" role="img" aria-label="icon">
              {option.icon}
            </span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
