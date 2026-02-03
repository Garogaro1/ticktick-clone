/**
 * App Providers
 *
 * Wraps the app with necessary providers
 */

'use client';

import { SessionProvider } from 'next-auth/react';
import { ReminderNotificationProvider } from '@/contexts/ReminderNotificationContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ReminderNotificationProvider>{children}</ReminderNotificationProvider>
    </SessionProvider>
  );
}
