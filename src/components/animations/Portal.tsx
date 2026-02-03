'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ReactNode } from 'react';

export interface PortalProps {
  children: ReactNode;
  container?: HTMLElement | null;
}

/**
 * Portal component for rendering outside the DOM hierarchy.
 *
 * Uses React 18's createPortal with automatic cleanup.
 */
export function Portal({ children, container }: PortalProps) {
  const portalRef = useRef<HTMLElement | null>(null);
  const isDefaultPortal = !container;

  // Create default portal container if none provided
  useEffect(() => {
    if (isDefaultPortal) {
      portalRef.current = document.createElement('div');
      portalRef.current.setAttribute('data-portal', 'true');
      document.body.appendChild(portalRef.current);

      return () => {
        if (portalRef.current && portalRef.current.parentNode) {
          portalRef.current.parentNode.removeChild(portalRef.current);
        }
      };
    }
  }, [isDefaultPortal]);

  // Use provided container or default
  const targetContainer = container || portalRef.current;

  if (!targetContainer) {
    return null;
  }

  return createPortal(children, targetContainer);
}
