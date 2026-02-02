'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface AddTaskInputProps {
  onAdd: (title: string) => Promise<void>;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * AddTaskInput component for quick task creation.
 *
 * Features:
 * - Auto-focus on mount
 * - Enter to add, Shift+Enter for new line
 * - Clear after add
 * - Loading state
 * - Warm Claude theme styling
 */
export function AddTaskInput({
  onAdd,
  isLoading = false,
  placeholder = 'Add a task...',
  className,
}: AddTaskInputProps) {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;

    await onAdd(trimmed);
    setValue('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 bg-background-card rounded-lg border transition-all duration-200',
        isFocused ? 'border-primary shadow-md' : 'border-border-subtle hover:border-border-default',
        className
      )}
    >
      <div className="flex-1 flex items-center gap-3 px-4 py-3">
        {/* Add icon */}
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'text-text-tertiary transition-colors duration-200',
            isFocused && 'text-primary'
          )}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          className="flex-1 bg-transparent outline-none text-text-primary placeholder:text-text-tertiary disabled:opacity-60"
        />
      </div>

      {/* Add button - show when typing or focused */}
      {(value || isFocused) && (
        <div className="pr-2">
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.3"
                />
                <path
                  d="M12 2C12 2 12 6 12 12C12 18 12 22 12 22"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <>
                <span className="hidden sm:inline">Add</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
