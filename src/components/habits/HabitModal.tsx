'use client';

/**
 * HabitModal Component
 *
 * Modal for creating and editing habits.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { HabitDto } from '@/lib/habits';
import { DEFAULT_HABIT_COLORS, DEFAULT_HABIT_ICONS } from '@/lib/habits/utils';

export interface HabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: {
    title: string;
    description?: string;
    color?: string;
    icon?: string;
    frequency?: 'daily' | 'weekly' | 'monthly';
    targetCount?: number;
  }) => Promise<void>;
  habit?: HabitDto | null;
  mode?: 'create' | 'edit';
}

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Every week' },
  { value: 'monthly', label: 'Monthly', description: 'Every month' },
];

export function HabitModal({ isOpen, onClose, onSave, habit, mode = 'create' }: HabitModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(DEFAULT_HABIT_COLORS[0]);
  const [icon, setIcon] = useState<string>('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [targetCount, setTargetCount] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Reset form when opening/closing or habit changes
  useEffect(() => {
    if (isOpen) {
      if (habit && mode === 'edit') {
        setTitle(habit.title);
        setDescription(habit.description || '');
        setColor(habit.color || DEFAULT_HABIT_COLORS[0]);
        setIcon(habit.icon || '');
        setFrequency(habit.frequency as 'daily' | 'weekly' | 'monthly');
        setTargetCount(habit.targetCount || 1);
      } else {
        setTitle('');
        setDescription('');
        setColor(DEFAULT_HABIT_COLORS[Math.floor(Math.random() * DEFAULT_HABIT_COLORS.length)]);
        setIcon('');
        setFrequency('daily');
        setTargetCount(1);
      }
    }
  }, [isOpen, habit, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        color,
        icon: icon || undefined,
        frequency,
        targetCount,
      });

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isEditing = mode === 'edit' && habit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Exercise"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
              maxLength={500}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIcon('')}
                className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                  !icon ? 'border-gray-900 bg-gray-100' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                -
              </button>
              {DEFAULT_HABIT_ICONS.map((iconOption) => (
                <button
                  key={iconOption.emoji}
                  type="button"
                  onClick={() => setIcon(iconOption.emoji)}
                  className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center text-lg transition-all ${
                    icon === iconOption.emoji
                      ? 'border-gray-900 bg-gray-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={iconOption.name}
                >
                  {iconOption.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_HABIT_COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === colorOption
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  aria-label={`Select color ${colorOption}`}
                />
              ))}
            </div>
          </div>

          {/* Frequency Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <div className="grid grid-cols-3 gap-2">
              {FREQUENCY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFrequency(option.value as 'daily' | 'weekly' | 'monthly')}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    frequency === option.value
                      ? 'border-gray-900 bg-gray-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Target Count */}
          <div>
            <label htmlFor="targetCount" className="block text-sm font-medium text-gray-700 mb-1">
              Target Count (per {frequency})
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setTargetCount(Math.max(1, targetCount - 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                id="targetCount"
                type="number"
                value={targetCount}
                onChange={(e) => setTargetCount(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={100}
                className="w-20 text-center px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setTargetCount(Math.min(100, targetCount + 1))}
                className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
              <span className="text-sm text-gray-500">
                {targetCount === 1 ? 'time' : 'times'} per {frequency}
              </span>
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="text-sm text-gray-500 mb-2">Preview</div>
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl"
                style={{ borderColor: color, backgroundColor: `${color}20` }}
              >
                {icon || '🎯'}
              </div>
              <div>
                <div className="font-medium text-gray-900">{title || 'Habit Title'}</div>
                <div className="text-sm text-gray-500">
                  {frequency} • {targetCount}x • <span style={{ color }}>●</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isSaving}
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
