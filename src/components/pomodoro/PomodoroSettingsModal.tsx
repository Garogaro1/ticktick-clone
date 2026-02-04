'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { PomodoroSettings, PomodoroPreset } from '@/lib/pomodoro/types';
import { POMODORO_PRESETS } from '@/lib/pomodoro/types';

export interface PomodoroSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: PomodoroSettings;
  onUpdateSettings: (settings: Partial<PomodoroSettings>) => void;
}

const PRESET_OPTIONS: { value: PomodoroPreset; label: string }[] = [
  { value: 'pomodoro', label: 'Pomodoro (25/5)' },
  { value: 'short', label: 'Short (15/3)' },
  { value: 'long', label: 'Long (50/10)' },
];

/**
 * PomodoroSettingsModal component for configuring Pomodoro timer settings.
 *
 * Features:
 * - Work/break duration settings
 * - Long break configuration
 * - Auto-start options
 * - Sound and notification settings
 * - Preset duration selections
 */
export function PomodoroSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: PomodoroSettingsModalProps) {
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    onClose();
  };

  const handlePresetChange = (preset: PomodoroPreset) => {
    const presetConfig = POMODORO_PRESETS[preset];
    setLocalSettings((prev) => ({
      ...prev,
      workDuration: presetConfig.workMinutes,
      shortBreakDuration: presetConfig.breakMinutes,
    }));
  };

  const currentPreset =
    PRESET_OPTIONS.find(
      (p) =>
        POMODORO_PRESETS[p.value].workMinutes === localSettings.workDuration &&
        POMODORO_PRESETS[p.value].breakMinutes === localSettings.shortBreakDuration
    )?.value || 'custom';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Timer Settings" size="md">
      <div className="flex flex-col gap-6">
        {/* Preset Selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-3">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handlePresetChange(option.value)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  'border-2',
                  currentPreset === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Duration Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Focus Duration
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="180"
                value={localSettings.workDuration}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    workDuration: Math.max(1, Math.min(180, parseInt(e.target.value) || 1)),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary"
              />
              <span className="text-sm text-text-secondary">min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Short Break</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="60"
                value={localSettings.shortBreakDuration}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    shortBreakDuration: Math.max(1, Math.min(60, parseInt(e.target.value) || 1)),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary"
              />
              <span className="text-sm text-text-secondary">min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Long Break</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="120"
                value={localSettings.longBreakDuration}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    longBreakDuration: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary"
              />
              <span className="text-sm text-text-secondary">min</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Long Break After
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="10"
                value={localSettings.longBreakAfter}
                onChange={(e) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    longBreakAfter: Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-text-primary"
              />
              <span className="text-sm text-text-secondary">sessions</span>
            </div>
          </div>
        </div>

        {/* Auto-start Options */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">Auto-start Options</label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-text-secondary">Auto-start break after focus</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={localSettings.autoStartBreak}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, autoStartBreak: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  localSettings.autoStartBreak ? 'bg-primary' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                    localSettings.autoStartBreak ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </div>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-text-secondary">Auto-start work after break</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={localSettings.autoStartWork}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, autoStartWork: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  localSettings.autoStartWork ? 'bg-primary' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                    localSettings.autoStartWork ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </div>
            </div>
          </label>
        </div>

        {/* Notification Settings */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-text-primary">
            Notifications & Sounds
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-text-secondary">Sound notifications</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={localSettings.soundEnabled}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, soundEnabled: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  localSettings.soundEnabled ? 'bg-primary' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                    localSettings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </div>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-text-secondary">Browser notifications</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={localSettings.notificationEnabled}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, notificationEnabled: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  localSettings.notificationEnabled ? 'bg-primary' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                    localSettings.notificationEnabled ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </div>
            </div>
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-text-secondary">Tick sound during timer</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={localSettings.tickSoundEnabled}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, tickSoundEnabled: e.target.checked }))
                }
                className="sr-only"
              />
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-colors duration-200',
                  localSettings.tickSoundEnabled ? 'bg-primary' : 'bg-border'
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200',
                    localSettings.tickSoundEnabled ? 'translate-x-7' : 'translate-x-1'
                  )}
                />
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Settings
        </Button>
      </footer>
    </Modal>
  );
}
