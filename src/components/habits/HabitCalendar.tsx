'use client';

/**
 * HabitCalendar Component
 *
 * Calendar view for habit tracking with month navigation.
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from '@/lib/utils/date';
import type { HabitDto, HabitCalendarData } from '@/lib/habits';

export interface HabitCalendarProps {
  habit: HabitDto;
  calendarData: HabitCalendarData[];
  onMonthChange: (year: number, month: number) => void;
  onDateClick?: (date: Date) => void;
  isLoading?: boolean;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitCalendar({
  habit,
  calendarData,
  onMonthChange,
  onDateClick,
  isLoading = false,
}: HabitCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  // Create a map of completion data by date
  const completionMap = useMemo(() => {
    const map = new Map<string, HabitCalendarData>();
    calendarData.forEach((data) => {
      const key = format(data.date, 'yyyy-MM-dd');
      map.set(key, data);
    });
    return map;
  }, [calendarData]);

  const handlePreviousMonth = () => {
    const newMonth = subMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth.getFullYear(), newMonth.getMonth() + 1);
  };

  const handleNextMonth = () => {
    const newMonth = addMonths(currentMonth, 1);
    setCurrentMonth(newMonth);
    onMonthChange(newMonth.getFullYear(), newMonth.getMonth() + 1);
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    onMonthChange(new Date().getFullYear(), new Date().getMonth() + 1);
  };

  const getDayIntensity = (date: Date): number => {
    if (!isSameMonth(date, currentMonth)) return 0;

    const key = format(date, 'yyyy-MM-dd');
    const data = completionMap.get(key);

    if (!data || !data.completed) return 0;

    // Calculate intensity based on count vs target
    const ratio = data.actualCount / data.targetCount;
    if (ratio >= 2) return 4;
    if (ratio >= 1.5) return 3;
    if (ratio >= 1) return 2;
    if (ratio >= 0.5) return 1;
    return 0;
  };

  const getDayStyle = (date: Date): React.CSSProperties => {
    const intensity = getDayIntensity(date);
    if (intensity === 0 || !isSameMonth(date, currentMonth)) {
      return {};
    }

    const baseColor = habit.color || '#D97757';
    const opacity = 0.2 + intensity * 0.2;

    return {
      backgroundColor: `${baseColor}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`,
    };
  };

  // Calculate completion stats for the month
  const monthStats = useMemo(() => {
    const daysInMonth = calendarDays.filter((d) => isSameMonth(d, currentMonth));
    const completedDays = daysInMonth.filter((d) => getDayIntensity(d) >= 2);

    return {
      total: daysInMonth.length,
      completed: completedDays.length,
      percentage:
        daysInMonth.length > 0 ? Math.round((completedDays.length / daysInMonth.length) * 100) : 0,
    };
  }, [calendarDays, currentMonth, completionMap]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePreviousMonth}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="text-center">
          <h3 className="font-semibold text-gray-900">{format(currentMonth, 'MMMM yyyy')}</h3>
          <div className="text-xs text-gray-500 mt-0.5">
            {monthStats.completed} of {monthStats.total} days ({monthStats.percentage}%)
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={handleNextMonth}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAY_LABELS.map((day) => (
          <div key={day} className="text-xs font-medium text-gray-400 text-center py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date: Date, index: number) => {
          const isCurrentMonth = isSameMonth(date, currentMonth);
          const isTodayDate = isToday(date);
          const intensity = getDayIntensity(date);
          const key = format(date, 'yyyy-MM-dd');

          return (
            <motion.button
              key={key}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.01 }}
              onClick={() => onDateClick?.(date)}
              className={`
                relative aspect-square rounded-lg flex items-center justify-center text-sm transition-all
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                ${isTodayDate ? 'ring-2 ring-gray-900 ring-offset-1' : ''}
                hover:scale-105 active:scale-95
              `}
              style={getDayStyle(date)}
              disabled={isLoading}
            >
              <span className="relative z-10">{format(date, 'd')}</span>

              {/* Completion indicator */}
              {intensity >= 2 && isCurrentMonth && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: habit.color || '#D97757' }}
                />
              )}

              {/* Partial completion indicator */}
              {intensity === 1 && isCurrentMonth && (
                <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-gray-400" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-100" />
          <span>None</span>
        </div>
        <div
          className="w-3 h-3 rounded"
          style={{ backgroundColor: `${habit.color || '#D97757'}33` }}
        />
        <div
          className="w-3 h-3 rounded"
          style={{ backgroundColor: `${habit.color || '#D97757'}66` }}
        />
        <div
          className="w-3 h-3 rounded"
          style={{ backgroundColor: `${habit.color || '#D97757'}99` }}
        />
        <div className="w-3 h-3 rounded" style={{ backgroundColor: habit.color || '#D97757' }} />
        <span>More</span>
      </div>
    </div>
  );
}
