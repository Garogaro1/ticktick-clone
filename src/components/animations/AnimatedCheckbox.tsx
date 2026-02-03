'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface AnimatedCheckboxProps {
  checked: boolean;
  onChange?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showConfetti?: boolean;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const iconSizes = {
  sm: 10,
  md: 14,
  lg: 16,
};

/**
 * AnimatedCheckbox component with confetti celebration effect.
 *
 * Features:
 * - Smooth scale animation on check/uncheck
 * - Confetti burst on completion
 * - Spring physics for natural feel
 * - Accessibility support
 * - Warm Claude theme colors
 */
export function AnimatedCheckbox({
  checked,
  onChange,
  disabled = false,
  isLoading = false,
  size = 'md',
  className,
  showConfetti = true,
}: AnimatedCheckboxProps) {
  const [confettiParticles, setConfettiParticles] = useState<
    Array<{ id: number; x: number; y: number; color: string }>
  >([]);

  const handleClick = () => {
    if (disabled || isLoading) return;

    // Trigger confetti on check (not uncheck)
    if (!checked && showConfetti) {
      const colors = ['#D97757', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
      const particles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.cos((i * 30 * Math.PI) / 180) * 30,
        y: Math.sin((i * 30 * Math.PI) / 180) * 30,
        color: colors[i % colors.length],
      }));
      setConfettiParticles(particles);

      // Clear confetti after animation
      setTimeout(() => setConfettiParticles([]), 800);
    }

    onChange?.();
  };

  const iconSize = iconSizes[size];

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        'relative flex-shrink-0 rounded-md border-2 flex items-center justify-center',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        sizeClasses[size],
        checked
          ? 'bg-success border-success'
          : 'border-border-subtle hover:border-primary bg-background-card',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={checked ? 'Mark as incomplete' : 'Mark as complete'}
      aria-checked={checked}
      role="checkbox"
    >
      {/* Confetti particles */}
      {showConfetti &&
        confettiParticles.map((particle) => (
          <motion.span
            key={particle.id}
            className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
            style={{
              backgroundColor: particle.color,
              left: '50%',
              top: '50%',
              marginLeft: -3,
              marginTop: -3,
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1, 0],
              x: particle.x,
              y: particle.y,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 0.6,
              ease: 'easeOut',
            }}
          />
        ))}

      {/* Checkbox background burst */}
      {checked && (
        <motion.span
          className="absolute inset-0 bg-success/30 rounded-md"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      )}

      {/* Checkmark icon */}
      <motion.svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
        initial={false}
        animate={{
          scale: checked ? 1 : 0.5,
          opacity: checked ? 1 : 0,
          rotate: checked ? 0 : -10,
        }}
        transition={{
          type: 'spring' as const,
          stiffness: 400,
          damping: 20,
        }}
      >
        <polyline points="20 6 9 17 4 12" />
      </motion.svg>

      {/* Checkbox scale animation */}
      <motion.span
        className="absolute inset-0 rounded-md border-2 border-primary"
        initial={false}
        animate={{
          scale: checked ? [1, 0.9, 1] : 1,
        }}
        transition={{
          duration: 0.2,
          times: [0, 0.5, 1],
        }}
      />
    </button>
  );
}
