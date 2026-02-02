import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: InputSize;
  fullWidth?: boolean;
}

const sizeStyles: Record<InputSize, string> = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-3 text-base',
  lg: 'px-5 py-4 text-lg',
};

/**
 * Input component with warm Claude theme colors and micro-interactions.
 *
 * @example
 * <Input label="Email" type="email" placeholder="you@example.com" />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      inputSize = 'md',
      fullWidth = true,
      disabled = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={cn('flex flex-col gap-2', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          className={cn(
            'rounded-lg border-2 border-border bg-background-card',
            'text-text-primary placeholder:text-text-tertiary',
            'transition-all duration-200 ease-out',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
            'hover:border-border-dark',
            'focus:border-primary',
            'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-background-secondary',
            error && 'border-error focus:border-error',
            sizeStyles[inputSize],
            fullWidth && 'w-full',
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        {helperText && !error && <p className="text-sm text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
