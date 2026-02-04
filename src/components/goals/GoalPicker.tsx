'use client';

/**
 * GoalPicker Component
 *
 * Dropdown for selecting a goal to link to a task.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { GoalDto } from '@/lib/goals';

export interface GoalPickerProps {
  goals: GoalDto[];
  selectedGoalId: string | null;
  onChange: (goalId: string | null) => void;
  onCreateGoal?: () => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function GoalPicker({
  goals,
  selectedGoalId,
  onChange,
  onCreateGoal,
  placeholder = 'Link to a goal...',
  disabled = false,
  className,
}: GoalPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter goals based on search query
  const filteredGoals = goals.filter((goal) => {
    if (searchQuery.trim() === '') return true;
    return goal.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get selected goal
  const selectedGoal = goals.find((g) => g.id === selectedGoalId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleSelect = useCallback(
    (goalId: string | null) => {
      onChange(goalId);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onChange]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    },
    [onChange]
  );

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-primary',
    PAUSED: 'bg-text-tertiary',
    COMPLETED: 'bg-success',
    ABANDONED: 'bg-text-tertiary',
  };

  const getProgressColor = (progress: number, status: string) => {
    if (status === 'COMPLETED') return 'bg-success';
    if (status === 'ABANDONED') return 'bg-text-tertiary';
    if (progress >= 75) return 'bg-primary';
    if (progress >= 50) return 'bg-warning';
    return 'bg-border-default';
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between gap-2 px-4 py-3',
          'bg-background-card border border-border-subtle rounded-lg',
          'text-left text-text-primary placeholder:text-text-tertiary',
          'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
          'transition-all duration-200',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-border-default cursor-pointer'
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {selectedGoal ? (
            <>
              <div
                className={cn(
                  'w-2 h-2 rounded-full flex-shrink-0',
                  statusColors[selectedGoal.status]
                )}
              />
              <span className="truncate">{selectedGoal.title}</span>
              {selectedGoal.targetValue && (
                <span className="text-xs text-text-tertiary flex-shrink-0">
                  {selectedGoal.progress ?? 0}%
                </span>
              )}
            </>
          ) : (
            <span className="text-text-tertiary">{placeholder}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {selectedGoal && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-text-tertiary hover:text-text-primary rounded transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              'text-text-tertiary transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-border-subtle overflow-hidden"
          >
            {/* Search input */}
            <div className="p-3 border-b border-border-subtle">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals..."
                className="w-full px-3 py-2 bg-background-secondary rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* "No goal" option */}
            {searchQuery === '' && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={cn(
                  'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                  'hover:bg-background-secondary',
                  !selectedGoalId && 'bg-primary/5'
                )}
              >
                <div className="w-8 h-8 rounded-full bg-border-default flex items-center justify-center text-text-tertiary">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </div>
                <span className="text-sm text-text-secondary">No goal</span>
              </button>
            )}

            {/* Goals list */}
            <div className="max-h-60 overflow-y-auto">
              {filteredGoals.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-text-tertiary">
                  {searchQuery ? 'No goals found' : 'No goals yet'}
                </div>
              ) : (
                filteredGoals.map((goal) => {
                  const isSelected = goal.id === selectedGoalId;
                  const progress = goal.progress ?? 0;

                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleSelect(goal.id)}
                      className={cn(
                        'w-full px-4 py-3 flex items-center gap-3 text-left transition-colors',
                        'hover:bg-background-secondary',
                        isSelected && 'bg-primary/5'
                      )}
                    >
                      {/* Status indicator */}
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full flex-shrink-0',
                          statusColors[goal.status]
                        )}
                      />

                      {/* Goal info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-text-primary truncate">
                          {goal.title}
                        </div>

                        {/* Progress bar */}
                        {goal.targetValue && (
                          <div className="mt-1.5">
                            <div className="flex items-center justify-between text-xs text-text-tertiary mb-1">
                              <span>
                                {goal.currentValue} / {goal.targetValue} {goal.unit || ''}
                              </span>
                              <span>{progress}%</span>
                            </div>
                            <div className="h-1 bg-border-subtle rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all duration-300',
                                  getProgressColor(progress, goal.status)
                                )}
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Checkmark for selected */}
                      {isSelected && (
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-primary flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Create new goal button */}
            {onCreateGoal && (
              <div className="p-2 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => {
                    onCreateGoal();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-sm text-primary hover:bg-primary/5 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Create new goal
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
