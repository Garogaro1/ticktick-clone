import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type SkeletonVariant = 'rectangular' | 'circular' | 'text';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Width of the skeleton (CSS value like '100%', '200px', etc.)
   */
  width?: string | number;
  /**
   * Height of the skeleton (CSS value like '20px', '1rem', etc.)
   */
  height?: string | number;
  /**
   * Shape of the skeleton
   */
  variant?: SkeletonVariant;
  /**
   * Whether to show a shimmer animation
   */
  animate?: boolean;
}

const variantStyles: Record<SkeletonVariant, string> = {
  rectangular: 'rounded-lg',
  circular: 'rounded-full',
  text: 'rounded-sm h-4',
};

/**
 * Skeleton component for content placeholder loading states.
 * Uses warm Claude theme colors and matches final layout structure.
 *
 * @example
 * <Skeleton variant="text" width="100%" height="16px" />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height="200px" />
 */
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  ({ width, height, variant = 'rectangular', animate = true, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-background-secondary',
          variantStyles[variant],
          animate && 'animate-pulse',
          className
        )}
        style={{
          width,
          height,
          ...style,
        }}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

/**
 * SkeletonCard component for card-shaped loading placeholders.
 *
 * @example
 * <SkeletonCard />
 */
export const SkeletonCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('bg-background-card p-6 rounded-lg shadow-sm', className)}
        {...props}
      >
        <div className="flex items-center gap-4 mb-4">
          <Skeleton variant="circular" width="40px" height="40px" />
          <div className="flex-1">
            <Skeleton variant="text" width="60%" className="mb-2" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
        <Skeleton variant="text" width="100%" className="mb-2" />
        <Skeleton variant="text" width="80%" className="mb-2" />
        <Skeleton variant="text" width="90%" />
      </div>
    );
  }
);

SkeletonCard.displayName = 'SkeletonCard';

/**
 * SkeletonList component for list-shaped loading placeholders.
 *
 * @example
 * <SkeletonList count={5} />
 */
export interface SkeletonListProps extends HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export const SkeletonList = forwardRef<HTMLDivElement, SkeletonListProps>(
  ({ count = 3, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('space-y-3', className)} {...props}>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="flex items-center gap-3">
            <Skeleton variant="circular" width="20px" height="20px" />
            <Skeleton variant="text" width="100%" />
          </div>
        ))}
      </div>
    );
  }
);

SkeletonList.displayName = 'SkeletonList';
