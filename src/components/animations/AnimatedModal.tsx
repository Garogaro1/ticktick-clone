'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
  MouseEvent,
  KeyboardEvent,
} from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Portal } from './Portal';

export type AnimatedModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: AnimatedModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
}

const sizeStyles: Record<AnimatedModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-7xl w-full mx-4',
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: (direction: number) => ({
    opacity: 0,
    scale: 0.95,
    y: direction * 20,
  }),
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 25,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.2,
      ease: 'easeInOut' as const,
    },
  },
};

/**
 * AnimatedModal component with spring physics.
 *
 * Features:
 * - Smooth open/close animations
 * - Backdrop blur transition
 * - Spring physics for natural feel
 * - Keyboard (Escape) to close
 * - Focus trap on open
 * - Portal rendering
 * - Accessibility support
 */
export function AnimatedModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  contentClassName,
}: AnimatedModalProps) {
  const [direction, setDirection] = useState(1);
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        setDirection(-1);
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  // Set direction when opening
  useEffect(() => {
    if (isOpen) {
      setDirection(1);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <Portal>
      <AnimatePresence mode="wait" initial={false}>
        {isOpen && (
          <MotionConfig transition={{ type: 'spring' as const, stiffness: 300, damping: 30 }}>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {/* Backdrop overlay */}
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                variants={backdropVariants}
                onClick={handleOverlayClick}
                aria-hidden="true"
              />

              {/* Modal */}
              <motion.div
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={title ? 'modal-title' : undefined}
                aria-describedby={description ? 'modal-description' : undefined}
                className={cn(
                  'relative z-10 w-full bg-background-card rounded-xl shadow-2xl',
                  'flex flex-col max-h-[90vh]',
                  sizeStyles[size],
                  className
                )}
                variants={modalVariants}
                custom={direction}
                initial="hidden"
                animate="visible"
                exit="exit"
                onKeyDown={handleKeyDown}
                tabIndex={-1}
              >
                {/* Header */}
                {(title || showCloseButton) && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
                    <div>
                      {title && (
                        <h2 id="modal-title" className="text-lg font-semibold text-text-primary">
                          {title}
                        </h2>
                      )}
                      {description && (
                        <p id="modal-description" className="text-sm text-text-secondary mt-1">
                          {description}
                        </p>
                      )}
                    </div>
                    {showCloseButton && (
                      <motion.button
                        onClick={() => {
                          setDirection(-1);
                          onClose();
                        }}
                        className="p-2 text-text-tertiary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-colors"
                        aria-label="Close modal"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </motion.button>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className={cn('flex-1 overflow-y-auto px-6 py-4', contentClassName)}>
                  {children}
                </div>

                {/* Footer */}
                {footer && (
                  <motion.div
                    className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border-subtle"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {footer}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </MotionConfig>
        )}
      </AnimatePresence>
    </Portal>
  );
}

/**
 * AnimatedModalHeader component.
 */
export interface AnimatedModalHeaderProps {
  title?: string;
  description?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export function AnimatedModalHeader({
  title,
  description,
  onClose,
  showCloseButton = true,
}: AnimatedModalHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
      <div>
        {title && (
          <motion.h2
            id="modal-title"
            className="text-lg font-semibold text-text-primary"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h2>
        )}
        {description && (
          <motion.p
            id="modal-description"
            className="text-sm text-text-secondary mt-1"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
          >
            {description}
          </motion.p>
        )}
      </div>
      {showCloseButton && onClose && (
        <motion.button
          onClick={onClose}
          className="p-2 text-text-tertiary hover:text-text-primary hover:bg-background-secondary rounded-lg transition-colors"
          aria-label="Close modal"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </motion.button>
      )}
    </div>
  );
}

/**
 * AnimatedModalBody component.
 */
export interface AnimatedModalBodyProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedModalBody({ children, className }: AnimatedModalBodyProps) {
  return (
    <motion.div
      className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

/**
 * AnimatedModalFooter component.
 */
export interface AnimatedModalFooterProps {
  children: ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right';
}

export function AnimatedModalFooter({
  children,
  className,
  align = 'right',
}: AnimatedModalFooterProps) {
  const alignStyles = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 px-6 py-4 border-t border-border-subtle',
        alignStyles[align],
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
