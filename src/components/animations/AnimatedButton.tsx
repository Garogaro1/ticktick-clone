'use client';

import { forwardRef, ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AnimatedButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type AnimatedButtonSize = 'sm' | 'md' | 'lg';

export interface AnimatedButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: AnimatedButtonVariant;
  size?: AnimatedButtonSize;
  fullWidth?: boolean;
  isLoading?: boolean;
  ripple?: boolean;
  children?: ReactNode;
}

const variantStyles: Record<AnimatedButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark active:bg-primary-darker',
  secondary: 'bg-background-secondary text-text-primary hover:bg-border active:bg-border-strong',
  outline:
    'bg-transparent border-2 border-border-subtle text-text-primary hover:border-primary hover:text-primary active:bg-primary/10',
  ghost:
    'bg-transparent text-text-secondary hover:text-text-primary hover:bg-background-secondary active:bg-border',
  danger: 'bg-error text-white hover:bg-error-dark active:bg-error-darker',
};

const sizeStyles: Record<AnimatedButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm h-8',
  md: 'px-4 py-2 text-base h-10',
  lg: 'px-6 py-3 text-lg h-12',
};

const sizeIconStyles: Record<AnimatedButtonSize, string> = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

/**
 * AnimatedButton component with micro-interactions.
 *
 * Features:
 * - Scale animation on hover/press
 * - Ripple effect on click
 * - Loading state with spinner
 * - Spring physics for natural feel
 * - Accessibility support
 * - Warm Claude theme colors
 */
export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      ripple = true,
      children,
      disabled,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || isLoading || disabled) return;

      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const newRipple = {
        id: Date.now(),
        x,
        y,
      };

      setRipples((prev) => [...prev, newRipple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);

      onClick?.(event);
    };

    const isDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium rounded-lg',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'overflow-hidden',
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        transition={{
          type: 'spring' as const,
          stiffness: 400,
          damping: 17,
        }}
        {...props}
      >
        {/* Ripple effects */}
        {ripples.map((rippleItem) => (
          <motion.span
            key={rippleItem.id}
            className="absolute rounded-full bg-white/30 pointer-events-none"
            style={{
              left: rippleItem.x,
              top: rippleItem.y,
              width: 0,
              height: 0,
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 20, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Loading spinner */}
        {isLoading && (
          <motion.svg
            className={cn('animate-spin', sizeIconStyles[size])}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </motion.svg>
        )}

        {/* Button content */}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {children}
        </motion.span>
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';

import { useState } from 'react';
