import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerVariant = 'primary' | 'secondary';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-3',
  lg: 'w-8 h-8 border-4',
};

const variantStyles: Record<SpinnerVariant, string> = {
  primary: 'border-primary border-t-transparent',
  secondary: 'border-text-tertiary border-t-transparent',
};

/**
 * Spinner component for loading states with warm Claude theme colors.
 *
 * @example
 * <Spinner size="md" variant="primary" />
 */
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ size = 'md', variant = 'primary', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-full animate-spin',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
