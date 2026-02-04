'use client';

/**
 * SkipLink Component
 *
 * Provides "skip to main content" links for keyboard navigation.
 * These links are hidden until focused, allowing users to bypass navigation.
 */

import React from 'react';

export interface SkipLinkProps {
  /**
   * The ID of the element to skip to
   */
  targetId: string;

  /**
   * The label for the skip link
   * @default "Skip to main content"
   */
  label?: string;

  /**
   * Additional class names
   */
  className?: string;
}

/**
 * SkipLink component
 *
 * @example
 * ```tsx
 * <SkipLink targetId="main-content" label="Skip to main content" />
 * <main id="main-content">...</main>
 * ```
 */
export function SkipLink({
  targetId,
  label = 'Skip to main content',
  className = '',
}: SkipLinkProps) {
  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const target = document.getElementById(targetId);
    if (target) {
      // Set tabindex to -1 to allow focus, then remove after blur
      target.setAttribute('tabindex', '-1');
      target.focus();

      const removeTabindex = () => {
        target.removeAttribute('tabindex');
        target.removeEventListener('blur', removeTabindex);
      };
      target.addEventListener('blur', removeTabindex);
    }
  };

  return (
    <a
      href={`#${targetId}`}
      className={`skip-link ${className}`}
      onClick={handleClick}
      data-testid="skip-link"
    >
      {label}
    </a>
  );
}

/**
 * MultipleSkipLinks component
 *
 * Renders multiple skip links for different sections
 *
 * @example
 * ```tsx
 * <MultipleSkipLinks
 *   links={[
 *     { targetId: 'main-content', label: 'Skip to main content' },
 *     { targetId: 'navigation', label: 'Skip to navigation' },
 *   ]}
 * />
 * ```
 */
export interface MultipleSkipLinksProps {
  links: Array<{
    targetId: string;
    label: string;
  }>;
  className?: string;
}

export function MultipleSkipLinks({ links, className = '' }: MultipleSkipLinksProps) {
  return (
    <div className="skip-links" aria-label="Skip links">
      {links.map((link) => (
        <SkipLink key={link.targetId} {...link} className={className} />
      ))}
    </div>
  );
}
