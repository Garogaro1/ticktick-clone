'use client';

import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: number | string;
}

export interface MobileNavProps {
  /** Navigation items */
  items: NavItem[];
  /** Optional current path override */
  currentPath?: string;
  /** Position of nav (bottom or top) */
  position?: 'bottom' | 'top';
  /** Optional className */
  className?: string;
}

/**
 * Mobile navigation bar component.
 *
 * A mobile-optimized navigation bar that can be positioned at the bottom or top.
 * Features large tap targets (44px minimum) for touch interaction.
 *
 * Features:
 * - Large tap targets for touch
 * - Active state indicator
 * - Optional badges
 * - Bottom or top positioning
 * - Warm Claude theme styling
 *
 * @example
 * ```tsx
 * const navItems = [
 *   { href: '/tasks', label: 'Tasks', icon: <TaskIcon /> },
 *   { href: '/calendar', label: 'Calendar', icon: <CalendarIcon /> },
 *   { href: '/kanban', label: 'Kanban', icon: <KanbanIcon /> },
 * ];
 * <MobileNav items={navItems} position="bottom" />
 * ```
 */
export function MobileNav({ items, currentPath, position = 'bottom', className }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const activePath = currentPath || pathname;

  const handleNavClick = (href: string) => {
    router.push(href);
  };

  return (
    <nav
      className={cn(
        'fixed left-0 right-0 z-40',
        'bg-background-card/95 backdrop-blur-md',
        'border-t border-border',
        'safe-area-inset-bottom',
        position === 'top' ? 'top-0 border-t-0 border-b' : 'bottom-0',
        className
      )}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {items.map((item) => {
          const isActive = activePath === item.href;
          const hasBadge = item.badge !== undefined;

          return (
            <button
              key={item.href}
              onClick={() => handleNavClick(item.href)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-16 min-h-11', // 44px minimum tap target
                'rounded-lg',
                'transition-all duration-200',
                'text-text-secondary hover:text-text-primary',
                isActive && 'text-primary'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Icon */}
              <span
                className={cn(
                  'transition-transform duration-200',
                  isActive ? 'scale-110' : 'scale-100'
                )}
              >
                {item.icon}
              </span>

              {/* Label - only show on larger mobile screens */}
              <span
                className={cn(
                  'text-xs font-medium mt-0.5',
                  'hidden sm:block' // Hide label on small phones
                )}
              >
                {item.label}
              </span>

              {/* Active indicator */}
              {isActive && <span className="absolute top-0 w-8 h-0.5 bg-primary rounded-full" />}

              {/* Badge */}
              {hasBadge && (
                <span
                  className={cn(
                    'absolute top-0 right-1',
                    'flex items-center justify-center',
                    'min-w-5 h-5 px-1',
                    'bg-primary text-white text-xs font-medium rounded-full',
                    'shadow-sm'
                  )}
                >
                  {typeof item.badge === 'number' && item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/**
 * Hamburger menu button for mobile navigation.
 */
export interface HamburgerButtonProps {
  /** Whether menu is open */
  isOpen: boolean;
  /** Toggle callback */
  onToggle: () => void;
  /** Optional className */
  className?: string;
  /** aria-label override */
  ariaLabel?: string;
}

/**
 * Hamburger menu button component.
 *
 * A touch-friendly menu button that animates between hamburger and close states.
 * Features 44px tap target for WCAG compliance.
 */
export function HamburgerButton({
  isOpen,
  onToggle,
  className,
  ariaLabel = 'Toggle menu',
}: HamburgerButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative p-2 rounded-lg',
        'text-text-secondary hover:text-text-primary hover:bg-background-secondary',
        'transition-colors duration-200',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring',
        'min-h-11 min-w-11', // 44px tap target
        className
      )}
      aria-label={ariaLabel}
      aria-expanded={isOpen}
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
        className={cn('transition-transform duration-200', isOpen ? 'rotate-90' : 'rotate-0')}
      >
        {isOpen ? (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        ) : (
          <>
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </>
        )}
      </svg>
    </button>
  );
}

/**
 * Navigation icons for common routes.
 */
export const NavIcons = {
  tasks: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  calendar: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  kanban: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </svg>
  ),
  eisenhower: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="3" width="8" height="8" rx="1" />
      <rect x="3" y="13" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
    </svg>
  ),
  pomodoro: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  profile: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  home: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  settings: (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

/**
 * Get default navigation items for the app.
 */
export function getDefaultNavItems(): NavItem[] {
  return [
    { href: '/tasks', label: 'Tasks', icon: NavIcons.tasks },
    { href: '/calendar', label: 'Calendar', icon: NavIcons.calendar },
    { href: '/pomodoro', label: 'Timer', icon: NavIcons.pomodoro },
    { href: '/kanban', label: 'Kanban', icon: NavIcons.kanban },
    { href: '/eisenhower', label: 'Matrix', icon: NavIcons.eisenhower },
  ];
}
