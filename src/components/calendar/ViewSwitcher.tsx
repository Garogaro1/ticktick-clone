'use client';

import { CalendarViewType } from '@/lib/calendar/types';
import { Button } from '@/components/ui/Button';

export interface ViewSwitcherProps {
  /** Current view type */
  currentView: CalendarViewType;
  /** Change view type */
  onViewChange: (view: CalendarViewType) => void;
  /** Available views */
  availableViews?: CalendarViewType[];
}

const VIEW_LABELS: Record<CalendarViewType, string> = {
  month: 'Month',
  week: 'Week',
  day: 'Day',
  agenda: 'Agenda',
};

/**
 * View switcher for calendar views.
 *
 * Provides buttons to switch between month, week, day, and agenda views.
 */
export function ViewSwitcher({
  currentView,
  onViewChange,
  availableViews = ['month', 'week', 'day', 'agenda'],
}: ViewSwitcherProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-bg-secondary rounded-lg">
      {availableViews.map((view) => (
        <Button
          key={view}
          variant={currentView === view ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onViewChange(view)}
          className="min-w-[60px] text-sm font-medium"
        >
          {VIEW_LABELS[view]}
        </Button>
      ))}
    </div>
  );
}
