'use client';

import { SMART_LISTS, type SmartListType } from '@/lib/smart-lists';
import { cn } from '@/lib/utils';

export interface SmartListSidebarProps {
  activeSmartList?: SmartListType;
  onSelectSmartList: (smartList: SmartListType) => void;
  className?: string;
}

/**
 * Sidebar component for smart list navigation.
 *
 * Features:
 * - Smart lists display (Today, Tomorrow, Next 7 Days, etc.)
 * - Active smart list indicator
 * - Icons for each smart list
 * - Compact design
 */
export function SmartListSidebar({
  activeSmartList = 'all',
  onSelectSmartList,
  className,
}: SmartListSidebarProps) {
  const smartLists = Object.values(SMART_LISTS);

  return (
    <aside
      className={cn(
        'w-56 bg-background-card border-r border-border h-full flex flex-col',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-text-primary">Smart Lists</h2>
      </div>

      {/* Smart Lists */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {smartLists.map((smartList) => (
            <button
              key={smartList.id}
              onClick={() => onSelectSmartList(smartList.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg',
                'transition-all duration-200 ease-out',
                'hover:bg-background-secondary',
                activeSmartList === smartList.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary'
              )}
              title={smartList.description}
            >
              <span className="text-lg" aria-hidden="true">
                {smartList.icon}
              </span>
              <span className="flex-1 text-left">{smartList.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <a
          href="/profile"
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors duration-200"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Profile</span>
        </a>
      </div>
    </aside>
  );
}
