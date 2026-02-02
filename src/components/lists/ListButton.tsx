'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ListDto } from '@/lib/lists/types';

export interface ListButtonProps {
  list: ListDto;
  isActive?: boolean;
  onClick: () => void;
  onToggleFavorite?: (listId: string, isFavorite: boolean) => void;
  onEdit?: (list: ListDto) => void;
  onDelete?: (list: ListDto) => void;
  showActions?: boolean;
}

/**
 * Individual list button for sidebar navigation.
 *
 * Features:
 * - List icon/color indicator
 * - Task count badge
 * - Favorite star toggle
 * - Active state indicator
 * - Hover actions (edit, delete)
 */
export const ListButton = forwardRef<HTMLButtonElement, ListButtonProps>(
  (
    { list, isActive = false, onClick, onToggleFavorite, onEdit, onDelete, showActions = false },
    ref
  ) => {
    const handleFavoriteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleFavorite?.(list.id, !list.isFavorite);
    };

    const handleEditClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit?.(list);
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete?.(list);
    };

    // Get display icon or default
    const displayIcon = list.icon || '📝';

    // Get background color from list color or default
    const bgColor = list.color ? `${list.color}20` : 'bg-background-secondary';

    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
          'transition-all duration-200 ease-out',
          'hover:bg-background-secondary',
          isActive
            ? 'bg-primary/10 text-primary font-medium'
            : 'text-text-secondary hover:text-text-primary',
          list.isDefault && 'opacity-80'
        )}
      >
        {/* Active indicator bar */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
        )}

        {/* Icon/color indicator */}
        <div
          className={cn(
            'w-8 h-8 rounded-md flex items-center justify-center text-sm shrink-0',
            bgColor
          )}
          style={list.color ? { backgroundColor: `${list.color}20` } : undefined}
        >
          {displayIcon}
        </div>

        {/* List title and count */}
        <div className="flex-1 min-w-0 text-left">
          <span className="truncate block">{list.title}</span>
        </div>

        {/* Task count */}
        {list._count && (
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full shrink-0',
              isActive ? 'bg-primary/20 text-primary' : 'bg-background-tertiary text-text-secondary'
            )}
          >
            {list._count.tasks}
          </span>
        )}

        {/* Favorite star toggle */}
        {onToggleFavorite && (
          <button
            onClick={handleFavoriteClick}
            className={cn(
              'shrink-0 transition-colors duration-200',
              list.isFavorite ? 'text-amber-500' : 'text-text-tertiary hover:text-amber-500'
            )}
            aria-label={list.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill={list.isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="2"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )}

        {/* Hover actions */}
        {showActions && !list.isDefault && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-1 bg-background-card rounded-lg shadow-sm border border-border p-0.5">
            <button
              onClick={handleEditClick}
              className="p-1.5 text-text-secondary hover:text-text-primary hover:bg-background-secondary rounded transition-all"
              aria-label="Edit list"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1.5 text-text-secondary hover:text-error hover:bg-error/10 rounded transition-all"
              aria-label="Delete list"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 6h18" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </button>
    );
  }
);

ListButton.displayName = 'ListButton';
