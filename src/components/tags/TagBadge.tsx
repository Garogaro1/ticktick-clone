'use client';

import { ButtonHTMLAttributes, memo } from 'react';
import { cn } from '@/lib/utils';
import type { TaskTagDto } from '@/lib/tasks/types';
import type { TagDto } from '@/lib/tags/types';

export interface TagBadgeProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tag: TaskTagDto | TagDto;
  variant?: 'default' | 'compact';
  removable?: boolean;
  onRemove?: () => void;
}

const DEFAULT_COLOR = '#D97757';

/**
 * Convert hex color to CSS variable or inline style with appropriate background opacity.
 */
function getTagStyle(color: string | null) {
  const tagColor = color || DEFAULT_COLOR;

  return {
    backgroundColor: `${tagColor}15`,
    color: tagColor,
    borderColor: `${tagColor}30`,
  };
}

/**
 * TagBadge component for displaying a single tag.
 *
 * Features:
 * - Colored badge based on tag color
 * - Compact and default variants
 * - Optional remove button
 * - Clickable for filtering
 * - Warm Claude theme styling
 */
export const TagBadge = memo(
  ({
    tag,
    variant = 'default',
    removable = false,
    onRemove,
    className,
    ...props
  }: TagBadgeProps) => {
    const style = getTagStyle(tag.color);

    return (
      <button
        style={style}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full text-sm font-medium transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          'hover:brightness-95 active:brightness-90',
          variant === 'compact' ? 'px-2 py-0.5' : 'px-3 py-1',
          removable && 'pr-1.5',
          className
        )}
        {...props}
      >
        <span className="truncate max-w-[120px]">{tag.name}</span>
        {removable && onRemove && (
          <span
            className={cn(
              'flex items-center justify-center w-4 h-4 rounded-full',
              'hover:bg-black/10 transition-colors duration-150'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            role="button"
            tabIndex={0}
            aria-label={`Remove ${tag.name} tag`}
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </span>
        )}
      </button>
    );
  }
);

TagBadge.displayName = 'TagBadge';
