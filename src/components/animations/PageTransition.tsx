'use client';

import { motion, Variants } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type TransitionType = 'fade' | 'slide' | 'scale' | 'flip';

export interface PageTransitionProps {
  children: ReactNode;
  type?: TransitionType;
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  delay?: number;
  className?: string;
  staggerChildren?: number;
}

const slideVariants: Variants = {
  hidden: (direction: string) => ({
    opacity: 0,
    x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
    y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
  }),
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  exit: (direction: string) => ({
    opacity: 0,
    x: direction === 'left' ? -50 : direction === 'right' ? 50 : 0,
    y: direction === 'up' ? -50 : direction === 'down' ? 50 : 0,
  }),
};

const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

const flipVariants: Variants = {
  hidden: { opacity: 0, rotateY: -90 },
  visible: { opacity: 1, rotateY: 0 },
  exit: { opacity: 0, rotateY: 90 },
};

const variantsMap: Record<TransitionType, Variants> = {
  fade: fadeVariants,
  slide: slideVariants,
  scale: scaleVariants,
  flip: flipVariants,
};

/**
 * PageTransition wrapper for smooth page transitions.
 *
 * Features:
 * - Multiple transition types (fade, slide, scale, flip)
 * - Directional control for slide transitions
 * - Stagger children animations
 * - Configurable duration and delay
 * - Spring or ease transitions
 */
export function PageTransition({
  children,
  type = 'fade',
  direction = 'up',
  duration = 0.3,
  delay = 0,
  className,
  staggerChildren,
}: PageTransitionProps) {
  const variants = variantsMap[type];

  return (
    <motion.div
      custom={direction}
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{
        duration,
        delay,
        ease: [0.215, 0.61, 0.355, 1], // ease-out from design tokens
      }}
      className={cn('w-full', className)}
    >
      {staggerChildren ? (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren,
              },
            },
          }}
        >
          {children}
        </motion.div>
      ) : (
        children
      )}
    </motion.div>
  );
}

/**
 * StaggerChildren wrapper for animating list items sequentially.
 */
export interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  variants?: Variants;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.05,
  className,
  variants,
}: StaggerChildrenProps) {
  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      <motion.div variants={variants || defaultVariants}>{children}</motion.div>
    </motion.div>
  );
}

/**
 * ListItem wrapper for staggered list animations.
 */
export interface ListItemProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ListItem({ children, className, delay }: ListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * FadeIn component for simple fade-in animations.
 */
export interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  from?: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

export function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  className,
  from = 'bottom',
}: FadeInProps) {
  const fromVariants = {
    bottom: { y: 20 },
    top: { y: -20 },
    left: { x: -20 },
    right: { x: 20 },
    center: { scale: 0.95 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...fromVariants[from] }}
      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      transition={{ duration, delay, ease: [0.215, 0.61, 0.355, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn component for scale-based animations.
 */
export interface ScaleInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  initialScale?: number;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.3,
  className,
  initialScale = 0.9,
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: initialScale }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration,
        delay,
        type: 'spring' as const,
        stiffness: 200,
        damping: 20,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
