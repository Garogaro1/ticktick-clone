import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-background-card border-0',
  outlined: 'bg-background-card border-2 border-border',
  elevated: 'bg-background-card border-0 shadow-md',
};

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card component with warm Claude theme colors.
 *
 * @example
 * <Card padding="md" variant="outlined">
 *   <h2>Title</h2>
 *   <p>Content</p>
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', hover = false, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl',
          'transition-all duration-200 ease-out',
          variantStyles[variant],
          paddingStyles[padding],
          hover && 'hover:shadow-md cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';
