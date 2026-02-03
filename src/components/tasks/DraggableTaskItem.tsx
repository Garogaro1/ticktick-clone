'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskItem } from './TaskItem';
import type { TaskDto } from '@/lib/tasks/types';

export interface DraggableTaskItemProps {
  task: TaskDto;
  onUpdate?: (
    id: string,
    updates: Partial<Pick<TaskDto, 'title' | 'status' | 'priority'>>
  ) => Promise<boolean>;
  onDelete?: (id: string) => void;
  onEdit?: (task: TaskDto) => void;
  isDragging?: boolean;
  disabled?: boolean;
}

/**
 * Draggable wrapper for TaskItem component.
 *
 * Provides drag handle and visual feedback during drag operations.
 */
export function DraggableTaskItem({
  task,
  onUpdate,
  onDelete,
  onEdit,
  isDragging = false,
  disabled = false,
}: DraggableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskItem
        task={task}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onEdit={onEdit}
        dragHandleProps={{
          attributes: attributes as React.HTMLAttributes<HTMLElement>,
          listeners: listeners as React.HTMLAttributes<HTMLElement> | undefined,
          isDragging: isSortableDragging || isDragging,
        }}
      />
    </div>
  );
}
