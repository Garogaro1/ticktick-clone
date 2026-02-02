'use client';

import { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import type { ListDto } from '@/lib/lists/types';

export interface AddListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description?: string;
    icon?: string;
    color?: string;
  }) => Promise<boolean>;
  list?: ListDto | null;
  isLoading?: boolean;
}

// Predefined emoji icons for lists
const PREDEFINED_ICONS = [
  '📝',
  '📋',
  '📌',
  '📁',
  '🏠',
  '💼',
  '🎯',
  '💡',
  '🎨',
  '📚',
  '🛒',
  '✈️',
  '💪',
  '🎵',
  '🎮',
  '📱',
];

// Predefined colors for lists
const PREDEFINED_COLORS = [
  '#D97757', // Warm terracotta (default)
  '#E8B4A3', // Soft coral
  '#6B9B8A', // Sage green
  '#7B9BD9', // Soft blue
  '#B87BD9', // Soft purple
  '#D9B87B', // Soft gold
  '#D96B7B', // Soft red
  '#7BD9B8', // Soft teal
];

/**
 * Modal for creating or editing a list.
 *
 * Features:
 * - Title and description inputs
 * - Icon picker (emoji)
 * - Color picker (preset colors)
 * - Create/Edit mode based on props
 */
export function AddListModal({
  isOpen,
  onClose,
  onSave,
  list,
  isLoading = false,
}: AddListModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📝');
  const [color, setColor] = useState(PREDEFINED_COLORS[0]);
  const [error, setError] = useState('');

  // Reset form when modal opens or list changes
  useEffect(() => {
    if (isOpen) {
      if (list) {
        setTitle(list.title);
        setDescription(list.description || '');
        setIcon(list.icon || '📝');
        setColor(list.color || PREDEFINED_COLORS[0]);
      } else {
        setTitle('');
        setDescription('');
        setIcon('📝');
        setColor(PREDEFINED_COLORS[0]);
      }
      setError('');
    }
  }, [isOpen, list]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!title.trim()) {
      setError('List name is required');
      return;
    }

    if (title.length > 100) {
      setError('List name must be less than 100 characters');
      return;
    }

    const success = await onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      icon,
      color,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={list ? 'Edit List' : 'Create New List'}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isLoading || !title.trim()}>
            {isLoading ? 'Saving...' : list ? 'Save Changes' : 'Create List'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Title input */}
        <Input
          label="List Name"
          placeholder="e.g., Work, Personal, Shopping"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
          autoFocus
          maxLength={100}
        />

        {/* Description input */}
        <Input
          label="Description (Optional)"
          placeholder="What's this list for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />

        {/* Icon picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">Icon</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setIcon(emoji)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200',
                  'hover:bg-background-secondary',
                  icon === emoji ? 'bg-primary/20 ring-2 ring-primary' : 'bg-background-tertiary'
                )}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-text-primary">Color</label>
          <div className="flex flex-wrap gap-2">
            {PREDEFINED_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  'w-10 h-10 rounded-lg transition-all duration-200',
                  color === c ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'
                )}
                style={{ backgroundColor: c }}
                aria-label={`Select color ${c}`}
              />
            ))}
          </div>
        </div>

        {/* Preview */}
        {(title || icon) && (
          <div className="mt-2 p-3 rounded-lg border border-border bg-background-secondary">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center text-sm"
                style={{ backgroundColor: `${color}20` }}
              >
                {icon}
              </div>
              <span className="font-medium text-text-primary">{title || 'Untitled List'}</span>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
