'use client';

/**
 * GoalModal Component
 *
 * Modal for creating and editing goals.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GoalDto } from '@/lib/goals';
import { getGoalSuggestions } from '@/lib/goals/utils';

export interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: {
    title: string;
    description?: string;
    targetValue?: number;
    unit?: string;
    deadline?: Date;
  }) => Promise<void>;
  goal?: GoalDto | null;
  mode?: 'create' | 'edit';
}

const SUGGESTED_UNITS = [
  { value: 'tasks', label: 'Tasks' },
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'items', label: 'Items' },
  { value: 'books', label: 'Books' },
  { value: 'sessions', label: 'Sessions' },
  { value: 'miles', label: 'Miles' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'minutes', label: 'Minutes' },
  { value: '', label: 'Custom' },
];

export function GoalModal({ isOpen, onClose, onSave, goal, mode = 'create' }: GoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetValue, setTargetValue] = useState<number | undefined>(undefined);
  const [unit, setUnit] = useState('');
  const [deadline, setDeadline] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Reset form when opening/closing or goal changes
  useEffect(() => {
    if (isOpen) {
      if (goal && mode === 'edit') {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setTargetValue(goal.targetValue ?? undefined);
        setUnit(goal.unit || '');
        setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
      } else {
        setTitle('');
        setDescription('');
        setTargetValue(undefined);
        setUnit('');
        setDeadline('');
      }
      setShowSuggestions(false);
    }
  }, [isOpen, goal, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSaving(true);

    try {
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        targetValue,
        unit: unit || undefined,
        deadline: deadline ? new Date(deadline) : undefined,
      });

      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectSuggestion = (suggestion: {
    title: string;
    unit: string;
    targetValue: number;
  }) => {
    setTitle(suggestion.title);
    setUnit(suggestion.unit);
    setTargetValue(suggestion.targetValue);
    setShowSuggestions(false);
  };

  if (!isOpen) return null;

  const isEditing = mode === 'edit' && goal;
  const previewProgress = targetValue ? 0 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
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
                {isEditing ? 'Edit Goal' : 'New Goal'}
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
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Read 12 books this year"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97757] focus:border-transparent"
                  required
                  maxLength={100}
                />
                {!isEditing && (
                  <button
                    type="button"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="mt-2 text-sm text-[#D97757] hover:text-[#c96a4f] flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Get suggestions
                  </button>
                )}
              </div>

              {/* Suggestions */}
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-3 bg-gray-50 rounded-xl space-y-2"
                >
                  <div className="text-sm font-medium text-gray-700">Quick start templates:</div>
                  {getGoalSuggestions().map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-3 py-2 bg-white rounded-lg hover:bg-gray-100 transition-colors text-sm"
                    >
                      {suggestion.title} ({suggestion.targetValue} {suggestion.unit})
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you want to achieve?"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97757] focus:border-transparent resize-none"
                  rows={2}
                  maxLength={500}
                />
              </div>

              {/* Target Value & Unit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="targetValue"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Target Value
                  </label>
                  <input
                    id="targetValue"
                    type="number"
                    value={targetValue ?? ''}
                    onChange={(e) =>
                      setTargetValue(e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    placeholder="100"
                    min={1}
                    max={1000000}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97757] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    id="unit"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97757] focus:border-transparent"
                  >
                    {SUGGESTED_UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Deadline */}
              <div>
                <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline (optional)
                </label>
                <input
                  id="deadline"
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D97757] focus:border-transparent"
                />
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-2">Preview</div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#D97757] flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{title || 'Goal Title'}</div>
                    <div className="text-sm text-gray-500">
                      {targetValue ? `${0}/${targetValue} ${unit || ''}` : 'Open-ended goal'}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-[#D97757]">{previewProgress}%</div>
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
                  className="flex-1 px-4 py-2 bg-[#D97757] text-white rounded-lg hover:bg-[#c96a4f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
