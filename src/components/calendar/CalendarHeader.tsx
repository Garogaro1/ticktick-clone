'use client';

import { Button } from '@/components/ui/Button';
import { ChevronLeftIcon, ChevronRightIcon, TodayIcon } from './icons';

export interface CalendarHeaderProps {
  /** Current month being viewed */
  currentMonth: Date;
  /** Go to previous month */
  onPreviousMonth: () => void;
  /** Go to next month */
  onNextMonth: () => void;
  /** Go to today */
  onToday: () => void;
  /** Optional title override */
  title?: string;
}

/**
 * Calendar header with month navigation and "Today" button.
 *
 * Displays the current month/year with navigation controls.
 */
export function CalendarHeader({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
  title,
}: CalendarHeaderProps) {
  const formatMonthYear = (date: Date): string => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-semibold text-text-primary">
          {title || formatMonthYear(currentMonth)}
        </h2>
        <Button variant="outline" size="sm" onClick={onToday} className="text-sm font-normal">
          <TodayIcon className="w-4 h-4" />
          Today
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onPreviousMonth} aria-label="Previous month">
          <ChevronLeftIcon className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onNextMonth} aria-label="Next month">
          <ChevronRightIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
