'use client';

import { useState, useRef, useEffect, KeyboardEvent, MouseEvent } from 'react';
import { useTags } from '@/hooks/useTags';
import { TagBadge } from './TagBadge';
import { cn } from '@/lib/utils';
import type { TagDto } from '@/lib/tags/types';

export interface TagPickerProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  onCreateTag?: (name: string, color?: string | null) => Promise<TagDto | null>;
}

const DEFAULT_COLORS = [
  '#D97757', // Terracotta (primary)
  '#E8A838', // Warm Yellow
  '#7FA657', // Muted Green
  '#4A8A7D', // Teal
  '#5B8FB9', // Soft Blue
  '#7B6BA8', // Muted Purple
  '#B85C7A', // Rose
  '#9A6B56', // Brown
];

/**
 * TagPicker component for selecting and managing tags.
 *
 * Features:
 * - Search and filter tags
 * - Multi-select with checkboxes
 * - Create new tags inline
 * - Keyboard navigation
 * - Selected tags display with remove option
 * - Warm Claude theme styling
 */
export function TagPicker({
  selectedTagIds,
  onChange,
  placeholder = 'Add tags...',
  className,
  disabled = false,
  allowCreate = true,
  onCreateTag,
}: TagPickerProps) {
  const { tags, isLoading } = useTags();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));
  const availableTags = tags.filter(
    (tag) =>
      !selectedTagIds.includes(tag.id) && tag.name.toLowerCase().includes(search.toLowerCase())
  );

  // Show create option if search doesn't match existing tags
  const showCreateOption =
    allowCreate &&
    search.trim().length > 0 &&
    !tags.some((tag) => tag.name.toLowerCase() === search.toLowerCase());

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside as unknown as EventListener);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside as unknown as EventListener);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll('li');
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex]);

  const handleToggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!onCreateTag || !search.trim()) return;

    setIsCreating(true);
    try {
      // Pick a color cyclically
      const color = DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length];
      const newTag = await onCreateTag(search.trim(), color);
      if (newTag) {
        onChange([...selectedTagIds, newTag.id]);
        setSearch('');
        setIsOpen(false);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    const totalOptions = availableTags.length + (showCreateOption ? 1 : 0);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % totalOptions);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (showCreateOption && highlightedIndex === availableTags.length) {
            handleCreateTag();
          } else if (availableTags[highlightedIndex]) {
            handleToggleTag(availableTags[highlightedIndex].id);
          }
        } else if (showCreateOption) {
          handleCreateTag();
        } else if (availableTags.length > 0) {
          handleToggleTag(availableTags[0].id);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Backspace':
        if (!search && selectedTagIds.length > 0) {
          onChange(selectedTagIds.slice(0, -1));
        }
        break;
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} removable onRemove={() => handleToggleTag(tag.id)} />
          ))}
        </div>
      )}

      {/* Input and dropdown */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isLoading}
          placeholder={selectedTags.length === 0 ? placeholder : ''}
          className={cn(
            'w-full px-4 py-3 pr-10 bg-background-card',
            'border border-border-subtle rounded-lg',
            'text-text-primary placeholder:text-text-tertiary',
            'focus:border-primary outline-none transition-all duration-200',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        />

        {/* Dropdown arrow icon */}
        <button
          type="button"
          onClick={() => {
            setIsOpen(!isOpen);
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
          tabIndex={-1}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('transition-transform duration-200', isOpen && 'rotate-180')}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <ul
            ref={listRef}
            className={cn(
              'absolute z-50 w-full mt-2 bg-background-card border border-border-subtle rounded-lg shadow-lg overflow-hidden',
              'max-h-60 overflow-y-auto'
            )}
          >
            {isLoading ? (
              <li className="px-4 py-3 text-text-tertiary text-sm">Loading tags...</li>
            ) : availableTags.length === 0 && !showCreateOption ? (
              <li className="px-4 py-3 text-text-tertiary text-sm">
                {search ? 'No tags found' : 'No tags available'}
              </li>
            ) : (
              <>
                {availableTags.map((tag, index) => (
                  <li
                    key={tag.id}
                    onClick={() => handleToggleTag(tag.id)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'px-4 py-2.5 flex items-center gap-3 cursor-pointer',
                      'transition-colors duration-150',
                      highlightedIndex === index && 'bg-background-secondary',
                      'hover:bg-background-secondary'
                    )}
                  >
                    <span
                      className={cn(
                        'w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150',
                        selectedTagIds.includes(tag.id)
                          ? 'bg-primary border-primary'
                          : 'border-border-subtle'
                      )}
                    >
                      {selectedTagIds.includes(tag.id) && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color || '#D97757' }}
                    />
                    <span className="flex-1 text-text-primary truncate">{tag.name}</span>
                    {tag._count?.tasks ? (
                      <span className="text-xs text-text-tertiary">{tag._count.tasks}</span>
                    ) : null}
                  </li>
                ))}

                {/* Create new tag option */}
                {showCreateOption && (
                  <li
                    onClick={handleCreateTag}
                    onMouseEnter={() => setHighlightedIndex(availableTags.length)}
                    className={cn(
                      'px-4 py-2.5 flex items-center gap-3 cursor-pointer',
                      'transition-colors duration-150',
                      highlightedIndex === availableTags.length && 'bg-background-secondary',
                      'hover:bg-background-secondary',
                      isCreating && 'opacity-60 cursor-wait'
                    )}
                  >
                    <span className="w-4 h-4 rounded border-2 border-border-subtle flex items-center justify-center">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-text-tertiary"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </span>
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0 bg-primary/20"
                      style={{
                        backgroundColor: DEFAULT_COLORS[tags.length % DEFAULT_COLORS.length],
                      }}
                    />
                    <span className="flex-1 text-text-primary">
                      Create <strong>&quot;{search.trim()}&quot;</strong>
                    </span>
                  </li>
                )}
              </>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
