'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import type { TagDto } from '@/lib/tags/types';

export interface TagModalProps {
  tag: TagDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (id: string, data: { name: string; color: string | null }) => Promise<boolean>;
  onCreate?: (name: string, color?: string | null) => Promise<TagDto | null>;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  { value: '#D97757', label: 'Terracotta' },
  { value: '#E8A838', label: 'Warm Yellow' },
  { value: '#7FA657', label: 'Muted Green' },
  { value: '#4A8A7D', label: 'Teal' },
  { value: '#5B8FB9', label: 'Soft Blue' },
  { value: '#7B6BA8', label: 'Muted Purple' },
  { value: '#B85C7A', label: 'Rose' },
  { value: '#9A6B56', label: 'Brown' },
  { value: null, label: 'None' },
];

/**
 * TagModal component for creating and editing tags.
 *
 * Features:
 * - Name input with validation
 * - Color picker with presets
 * - Create and edit modes
 * - Delete option (for existing tags)
 * - Live preview of tag appearance
 * - Warm Claude theme styling
 */
export function TagModal({
  tag,
  isOpen,
  onClose,
  onSave,
  onCreate,
  onDelete,
  isLoading = false,
}: TagModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditMode = tag !== null;

  // Sync form with tag
  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
    } else {
      setName('');
      setColor(null);
    }
    setShowDeleteConfirm(false);
  }, [tag, isOpen]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    try {
      let success = false;

      if (isEditMode && onSave) {
        success = await onSave(tag.id, { name: trimmedName, color });
      } else if (!isEditMode && onCreate) {
        const newTag = await onCreate(trimmedName, color);
        success = newTag !== null;
      }

      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (tag && onDelete) {
      onDelete(tag.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const hasChanges = name.trim() !== (tag?.name || '') || color !== (tag?.color || null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Tag' : 'New Tag'}
      size="md"
      footer={
        <>
          {isEditMode && onDelete && !showDeleteConfirm && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowDeleteConfirm(true)}
              className="mr-auto text-error hover:text-error hover:bg-error/10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </Button>
          )}
          {showDeleteConfirm && (
            <div className="mr-auto flex items-center gap-2">
              <span className="text-sm text-text-secondary">Delete this tag?</span>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDelete}
                className="bg-error hover:bg-error/80"
              >
                Delete
              </Button>
            </div>
          )}
          <Button variant="outline" size="md" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isLoading || !name.trim()}
          >
            {isSaving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Tag'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Live preview */}
        <div className="flex items-center gap-3 p-4 bg-background-secondary rounded-lg">
          <span className="text-sm text-text-secondary">Preview:</span>
          <span
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{
              backgroundColor: color ? `${color}15` : '#D9775715',
              color: color || '#D97757',
              border: `1px solid ${color ? `${color}30` : '#D9775730'}`,
            }}
          >
            {name.trim() || 'Tag Name'}
          </span>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Name *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            className="w-full"
            maxLength={50}
          />
          <p className="mt-1 text-xs text-text-tertiary">{name.length}/50 characters</p>
        </div>

        {/* Color */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">Color</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setColor(preset.value)}
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200',
                  'border-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
                  color === preset.value
                    ? 'border-primary ring-2 ring-primary/30 scale-105'
                    : 'border-border-subtle hover:border-border-default',
                  !preset.value && 'bg-background-card'
                )}
                style={preset.value ? { backgroundColor: `${preset.value}20` } : undefined}
                aria-label={`Select ${preset.label} color`}
              >
                {preset.value && (
                  <span
                    className="w-5 h-5 rounded-full"
                    style={{ backgroundColor: preset.value }}
                  />
                )}
                {!preset.value && (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="text-text-tertiary"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom color input */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Custom Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={color || '#D97757'}
              onChange={(e) => setColor(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer border-0 bg-transparent"
            />
            <Input
              value={color || ''}
              onChange={(e) => setColor(e.target.value || null)}
              placeholder="#D97757"
              className="flex-1 font-mono"
              maxLength={7}
              pattern="^#[0-9A-Fa-f]{6}$"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
