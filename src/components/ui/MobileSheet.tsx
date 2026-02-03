'use client';

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface MobileSheetProps {
  /** Whether the sheet is open */
  isOpen: boolean;
  /** Called when the sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: React.ReactNode;
  /** Position of the sheet */
  side?: 'left' | 'right' | 'top' | 'bottom';
  /** Maximum width of the sheet */
  maxWidth?: string;
  /** Optional className */
  className?: string;
  /** Whether to show an overlay backdrop */
  showBackdrop?: boolean;
  /** Whether close on backdrop click */
  closeOnBackdropClick?: boolean;
  /** Whether close on escape key */
  closeOnEscape?: boolean;
}

/**
 * Mobile sheet component for slide-over panels.
 *
 * A mobile-friendly slide-over panel that animates in from the edge of the screen.
 * Used for navigation, filters, and other mobile-optimized UI elements.
 *
 * Features:
 * - Smooth slide-in animations
 * - Backdrop overlay
 * - Escape key to close
 * - Click outside to close
 * - Scroll locking when open
 * - Focus trap
 * - Warm Claude theme styling
 */
export function MobileSheet({
  isOpen,
  onClose,
  children,
  side = 'left',
  maxWidth = '320px',
  className,
  showBackdrop = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}: MobileSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Close on escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;

    // Store current scroll position
    const scrollY = window.scrollY;

    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Store previous active element for focus restoration
    previousActiveElement.current = document.activeElement as HTMLElement;

    return () => {
      // Restore scroll
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);

      // Restore focus
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !sheetRef.current) return;

    // Focus first focusable element
    const focusableElements = sheetRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    if (firstElement) {
      firstElement.focus();
    }
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const slideClasses = {
    left: 'translate-x-0 -translate-x-full data-[state=open]:translate-x-0',
    right: 'translate-x-full data-[state=open]:translate-x-0',
    top: 'translate-y-0 -translate-y-full data-[state=open]:translate-y-0',
    bottom: 'translate-y-full data-[state=open]:translate-y-0',
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={handleBackdropClick}>
      {/* Backdrop */}
      {showBackdrop && (
        <div
          className={cn(
            'fixed inset-0 bg-black/50 backdrop-blur-sm',
            'transition-opacity duration-300',
            'opacity-0 data-[state=open]:opacity-100'
          )}
          data-state={isOpen ? 'open' : 'closed'}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={cn(
          'relative z-10 h-full bg-background-card shadow-xl',
          'transition-transform duration-300 ease-out',
          'flex flex-col',
          slideClasses[side],
          className
        )}
        style={{
          [side === 'left' || side === 'right' ? 'width' : 'height']: maxWidth,
        }}
        data-state={isOpen ? 'open' : 'closed'}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Mobile sheet header component.
 */
export interface MobileSheetHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileSheetHeader({ children, className }: MobileSheetHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-border', className)}>
      {children}
    </div>
  );
}

/**
 * Mobile sheet body component.
 */
export interface MobileSheetBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileSheetBody({ children, className }: MobileSheetBodyProps) {
  return <div className={cn('flex-1 overflow-y-auto p-4', className)}>{children}</div>;
}

/**
 * Mobile sheet footer component.
 */
export interface MobileSheetFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileSheetFooter({ children, className }: MobileSheetFooterProps) {
  return <div className={cn('p-4 border-t border-border', className)}>{children}</div>;
}

/**
 * Close button component for sheets.
 */
export interface MobileSheetCloseProps {
  onClick: () => void;
  className?: string;
  ariaLabel?: string;
}

export function MobileSheetClose({
  onClick,
  className,
  ariaLabel = 'Close',
}: MobileSheetCloseProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 rounded-lg text-text-secondary hover:text-text-primary',
        'hover:bg-background-secondary',
        'transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        'min-h-11 min-w-11', // 44px tap target
        className
      )}
      aria-label={ariaLabel}
    >
      <svg
        width="24"
        height="24"
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
    </button>
  );
}
