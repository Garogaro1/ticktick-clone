'use client';

import { useState, useEffect, useCallback } from 'react';
import { TaskStatus, Priority } from '@prisma/client';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TagPicker } from '@/components/tags';
import { ReminderPicker, ReminderList } from '@/components/reminders';
import { GoalPicker } from '@/components/goals';
import { useTags } from '@/hooks/useTags';
import { useTaskReminders } from '@/hooks/useReminders';
import { useGoals } from '@/hooks/useGoals';
import { cn } from '@/lib/utils';
import type { TaskDto } from '@/lib/tasks/types';
import type { TagDto } from '@/lib/tags/types';

export interface TaskDetailModalProps {
  task: TaskDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (id: string, updates: Partial<TaskDto>) => Promise<void>;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
}

const statusOptions: { value: TaskStatus; label: string; icon: string }[] = [
  { value: TaskStatus.TODO, label: 'To Do', icon: '○' },
  { value: TaskStatus.IN_PROGRESS, label: 'In Progress', icon: '◐' },
  { value: TaskStatus.DONE, label: 'Done', icon: '●' },
  { value: TaskStatus.CANCELLED, label: 'Cancelled', icon: '⊘' },
];

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: Priority.NONE, label: 'None', color: 'text-text-tertiary' },
  { value: Priority.LOW, label: 'Low', color: 'text-text-tertiary' },
  { value: Priority.MEDIUM, label: 'Medium', color: 'text-warning' },
  { value: Priority.HIGH, label: 'High', color: 'text-error' },
];

/**
 * TaskDetailModal component for viewing and editing task details.
 *
 * Features:
 * - Full task details
 * - Edit all properties
 * - Status and priority selection
 * - Due date picker
 * - Description editing
 * - Goal linking
 * - Delete confirmation
 * - Warm Claude theme styling
 */
export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onSave,
  onDelete,
  isLoading = false,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
  const [priority, setPriority] = useState<Priority>(Priority.NONE);
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { addTag, tags: allTags } = useTags({ autoFetch: true });
  const { goals } = useGoals({ autoFetch: true });
  const {
    reminders,
    isLoading: remindersLoading,
    addReminder,
    deleteReminder,
    dismissReminder,
    snoozeReminder,
    refetch: refetchReminders,
  } = useTaskReminders(task?.id);

  // Sync form with task
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setEstimatedTime(task.estimatedTime ? String(task.estimatedTime) : '');
      setSelectedTagIds(task.tags?.map((tag) => tag.id) || []);
      setSelectedGoalId(task.goalId || null);
    }
  }, [task]);

  // Refetch reminders when modal opens
  useEffect(() => {
    if (isOpen && task?.id) {
      refetchReminders();
    }
  }, [isOpen, task?.id, refetchReminders]);

  const handleSave = async () => {
    if (!task || !onSave) return;

    setIsSaving(true);
    try {
      // Build the full tag objects from selectedTagIds for type compatibility
      // Include tags from the current task and from the full tag list (for newly created tags)
      const selectedTagObjects: Array<{ id: string; name: string; color: string | null }> = [];
      for (const tagId of selectedTagIds) {
        const existingTag = task.tags.find((t) => t.id === tagId);
        if (existingTag) {
          selectedTagObjects.push(existingTag);
        } else {
          const allTag = allTags.find((t) => t.id === tagId);
          if (allTag) {
            selectedTagObjects.push({ id: allTag.id, name: allTag.name, color: allTag.color });
          }
        }
      }

      await onSave(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        estimatedTime: estimatedTime ? parseInt(estimatedTime, 10) : null,
        tags: selectedTagObjects,
        goalId: selectedGoalId,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateTag = useCallback(
    async (name: string, color?: string | null): Promise<TagDto | null> => {
      return await addTag(name, { color });
    },
    [addTag]
  );

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handleAddReminder = async (
    preset: string,
    customFireAt?: Date,
    customRelativeOffset?: number | null
  ): Promise<boolean> => {
    if (!task) return false;

    const result = await addReminder(
      task.id,
      preset as
        | 'at_deadline'
        | '5min_before'
        | '15min_before'
        | '30min_before'
        | '1hour_before'
        | '1day_before'
        | 'custom',
      customFireAt,
      customRelativeOffset
    );
    return result !== null;
  };

  const handleDeleteReminder = async (reminderId: string) => {
    await deleteReminder(reminderId);
  };

  const handleDismissReminder = async (reminderId: string) => {
    await dismissReminder(reminderId);
  };

  const handleSnoozeReminder = async (reminderId: string, minutes: number) => {
    await snoozeReminder(reminderId, minutes);
  };

  if (!task) return null;

  const currentTagIds = task.tags?.map((tag) => tag.id).sort() || [];
  const newTagIds = [...selectedTagIds].sort();
  const tagsChanged =
    currentTagIds.length !== newTagIds.length ||
    currentTagIds.some((id, index) => id !== newTagIds[index]);

  const hasChanges =
    title.trim() !== task.title ||
    description.trim() !== (task.description || '') ||
    status !== task.status ||
    priority !== task.priority ||
    dueDate !== (task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '') ||
    estimatedTime !== (task.estimatedTime ? String(task.estimatedTime) : '') ||
    tagsChanged ||
    selectedGoalId !== (task.goalId || null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Task Details"
      size="lg"
      footer={
        <>
          {onDelete && !showDeleteConfirm && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowDeleteConfirm(true)}
              className="mr-auto text-error hover:text-error hover:bg-error/10"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
              Delete
            </Button>
          )}
          {showDeleteConfirm && (
            <div className="mr-auto flex items-center gap-2">
              <span className="text-sm text-text-secondary">Delete this task?</span>
              <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDelete}
                className="bg-error hover:bg-error/80"
              >
                Delete
              </Button>
            </div>
          )}
          <Button variant="outline" size="md" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={!hasChanges || isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={4}
            className="w-full px-4 py-3 bg-background-card border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:border-primary outline-none transition-all duration-200 resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <TagPicker
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            placeholder="Add tags..."
            allowCreate
            onCreateTag={handleCreateTag}
          />
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">Goal</label>
          <GoalPicker
            goals={goals}
            selectedGoalId={selectedGoalId}
            onChange={setSelectedGoalId}
            placeholder="Link to a goal..."
          />
        </div>

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatus(option.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                    status === option.value
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background-card border-border-subtle text-text-secondary hover:border-border-default'
                  )}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Priority</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPriority(option.value)}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border',
                    priority === option.value
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'bg-background-card border-border-subtle text-text-secondary hover:border-border-default'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Due Date and Estimated Time */}
        <div className="grid grid-cols-2 gap-4">
          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 bg-background-card border border-border-subtle rounded-lg text-text-primary focus:border-primary outline-none transition-all duration-200"
            />
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Estimated Time (minutes)
            </label>
            <input
              type="number"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="30"
              min="0"
              className="w-full px-4 py-3 bg-background-card border border-border-subtle rounded-lg text-text-primary focus:border-primary outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Reminders */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-text-secondary">Reminders</label>
            <ReminderPicker
              taskId={task.id}
              taskDueDate={task.dueDate ? new Date(task.dueDate) : null}
              onAdd={handleAddReminder}
            />
          </div>
          <div className="mt-2">
            {remindersLoading ? (
              <div className="text-center py-4 text-sm text-text-tertiary">
                Loading reminders...
              </div>
            ) : reminders.length > 0 ? (
              <ReminderList
                reminders={reminders}
                taskTitle={task.title}
                taskDueDate={task.dueDate ? new Date(task.dueDate) : null}
                onDismiss={handleDismissReminder}
                onDelete={handleDeleteReminder}
                onSnooze={handleSnoozeReminder}
                className="max-h-48 overflow-y-auto"
              />
            ) : (
              <p className="text-sm text-text-tertiary py-4 text-center">
                No reminders set. Click "Add Reminder" to create one.
              </p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-border-subtle">
          <div className="flex flex-wrap gap-4 text-xs text-text-tertiary">
            <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
            <span>Updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
            {task.completedAt && (
              <span>Completed: {new Date(task.completedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
