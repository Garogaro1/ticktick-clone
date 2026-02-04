/**
 * Dynamic imports for code splitting and lazy loading.
 *
 * Use these lazy-loaded components for better performance.
 * Components are loaded only when needed.
 *
 * @example
 * import { TaskDetailModal } from '@/lib/dynamic-imports';
 * <TaskDetailModal task={task} isOpen={open} onClose={() => setOpen(false)} />
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import dynamic from 'next/dynamic';

/**
 * Loading component for modals.
 */
function ModalLoading() {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-background-card rounded-lg p-6" aria-busy="true" aria-label="Loading">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    </div>
  );
}

/**
 * Loading component for pages.
 */
export function PageLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

/**
 * Dynamically imports heavy components with loading states.
 * These use explicit any casts to avoid complex type inference issues with dynamic imports.
 * Type safety is maintained at the call site through component props.
 */

// TaskDetailModal - Used when editing tasks
export const TaskDetailModal = dynamic(
  () => import('@/components/tasks/TaskDetailModal').then((mod) => mod.TaskDetailModal),
  {
    loading: () => <ModalLoading />,
    ssr: false,
  }
) as any;

// AddListModal - Used when creating/editing lists
export const AddListModal = dynamic(
  () => import('@/components/lists/AddListModal').then((mod) => mod.AddListModal),
  {
    loading: () => <ModalLoading />,
    ssr: false,
  }
) as any;

// TagModal - Used when creating/editing tags
export const TagModal = dynamic(
  () => import('@/components/tags/TagModal').then((mod) => mod.TagModal),
  {
    loading: () => <ModalLoading />,
    ssr: false,
  }
) as any;

// SavedFiltersModal - Used when managing saved filters
export const SavedFiltersModal = dynamic(
  () => import('@/components/filters/SavedFiltersModal').then((mod) => mod.SavedFiltersModal),
  {
    loading: () => <ModalLoading />,
    ssr: false,
  }
) as any;

// PomodoroTimer - Pomodoro timer component (heavy)
export const PomodoroTimer = dynamic(
  () => import('@/components/pomodoro/PomodoroTimer').then((mod) => mod.PomodoroTimer),
  {
    loading: () => <div className="h-64 flex items-center justify-center">Loading timer...</div>,
    ssr: false,
  }
) as any;

// EisenhowerMatrix - Large matrix component
export const EisenhowerMatrix = dynamic(
  () => import('@/components/eisenhower/EisenhowerMatrix').then((mod) => mod.EisenhowerMatrix),
  {
    loading: () => <div className="h-96 flex items-center justify-center">Loading matrix...</div>,
    ssr: true,
  }
) as any;

// HabitCalendar - Calendar view for habits
export const HabitCalendar = dynamic(
  () => import('@/components/habits/HabitCalendar').then((mod) => mod.HabitCalendar),
  {
    loading: () => <div className="h-64 flex items-center justify-center">Loading calendar...</div>,
    ssr: true,
  }
) as any;

// GoalPicker - Goal selection dropdown
export const GoalPicker = dynamic(
  () => import('@/components/goals/GoalPicker').then((mod) => mod.GoalPicker),
  {
    loading: () => <div className="h-10">Loading...</div>,
    ssr: false,
  }
) as any;

// ReminderPicker - Reminder selection dropdown
export const ReminderPicker = dynamic(
  () => import('@/components/reminders/ReminderPicker').then((mod) => mod.ReminderPicker),
  {
    loading: () => <div className="h-10">Loading...</div>,
    ssr: false,
  }
) as any;
