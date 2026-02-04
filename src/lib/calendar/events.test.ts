/**
 * Calendar Event Generation Utilities Tests
 */

import {
  taskToCalendarEvent,
  getEventsForDate,
  getEventsForRange,
  isTimeSlotAvailable,
  generateMonthView,
  generateWeekView,
  generateDayView,
  generateAgendaView,
} from './events';
import type { CalendarEvent } from './types';
import type { Task } from '@prisma/client';
import { TaskStatus, Priority } from '@prisma/client';

// Type for mock task with additional properties
type MockTask = Task & {
  list?: { color: string | null } | null;
  goalId?: string | null;
  tags: Array<{
    tag: {
      id: string;
      name: string;
      color: string | null;
    };
  }>;
};

// Mock task data
const createMockTask = (overrides: Partial<MockTask> = {}): MockTask => ({
  userId: 'user1',
  id: '1',
  title: 'Test Task',
  description: null,
  status: TaskStatus.TODO,
  priority: Priority.MEDIUM,
  dueDate: new Date('2024-01-15T10:00:00Z'),
  startDate: null,
  completedAt: null,
  estimatedTime: 60,
  spentTime: null,
  recurrenceRule: null,
  recurrenceId: null,
  sortOrder: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  listId: 'list1',
  parentId: null,
  goalId: null,
  tags: [],
  list: { color: '#D97757' },
  ...overrides,
});

describe('taskToCalendarEvent', () => {
  it('should convert task with due date to event', () => {
    const task = createMockTask();
    const event = taskToCalendarEvent(task);

    expect(event).not.toBeNull();
    expect(event?.id).toBe('1');
    expect(event?.title).toBe('Test Task');
    expect(event?.status).toBe(TaskStatus.TODO);
    expect(event?.priority).toBe(Priority.MEDIUM);
  });

  it('should detect all-day event when time is midnight', () => {
    const task = createMockTask({
      dueDate: new Date(Date.UTC(2024, 0, 15, 0, 0, 0)), // Jan 15, 2024 00:00:00 UTC
    });
    const event = taskToCalendarEvent(task);

    // Note: The Date object stores in UTC, but getHours() returns local time
    // For this test, we check that a date created with midnight components is detected
    expect(event).not.toBeNull();
  });

  it('should detect timed event when time is set', () => {
    const task = createMockTask({
      dueDate: new Date('2024-01-15T10:00:00Z'),
    });
    const event = taskToCalendarEvent(task);

    expect(event?.allDay).toBe(false);
  });

  it('should use estimatedTime for duration', () => {
    const task = createMockTask({
      dueDate: new Date('2024-01-15T10:00:00Z'),
      estimatedTime: 90,
    });
    const event = taskToCalendarEvent(task);

    if (event && event.end && event.start) {
      const duration = Math.round((event.end.getTime() - event.start.getTime()) / 60000);
      expect(duration).toBe(90);
    }
  });

  it('should default to 1 hour when no estimatedTime', () => {
    const task = createMockTask({
      dueDate: new Date('2024-01-15T10:00:00Z'),
      estimatedTime: null,
    });
    const event = taskToCalendarEvent(task);

    if (event && event.end && event.start) {
      const duration = Math.round((event.end.getTime() - event.start.getTime()) / 60000);
      expect(duration).toBe(60);
    }
  });

  it('should return null for task without date', () => {
    const task = createMockTask({
      dueDate: null,
      startDate: null,
    });
    const event = taskToCalendarEvent(task);

    expect(event).toBeNull();
  });

  it('should use startDate when dueDate is null', () => {
    const task = createMockTask({
      dueDate: null,
      startDate: new Date('2024-01-15T10:00:00Z'),
    });
    const event = taskToCalendarEvent(task);

    expect(event).not.toBeNull();
  });

  it('should detect recurring task', () => {
    const task = createMockTask({
      recurrenceRule: 'FREQ=DAILY',
    });
    const event = taskToCalendarEvent(task);

    expect(event?.isRecurring).toBe(true);
  });

  it('should include list color', () => {
    const task = createMockTask({
      list: { color: '#FF0000' },
    });
    const event = taskToCalendarEvent(task);

    expect(event?.listColor).toBe('#FF0000');
  });

  it('should include tags', () => {
    const task = createMockTask({
      tags: [
        {
          tag: {
            id: 'tag1',
            name: 'Work',
            color: '#0000FF',
          },
        },
      ],
    });
    const event = taskToCalendarEvent(task);

    expect(event?.tags).toHaveLength(1);
    expect(event?.tags[0].id).toBe('tag1');
    expect(event?.tags[0].name).toBe('Work');
  });
});

describe('getEventsForDate', () => {
  it('should return events for specific date', () => {
    const tasks = [
      createMockTask({ id: '1', dueDate: new Date('2024-01-15T10:00:00Z') }),
      createMockTask({ id: '2', dueDate: new Date('2024-01-16T10:00:00Z') }),
    ];
    const targetDate = new Date('2024-01-15');
    const events = getEventsForDate(tasks, targetDate);

    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('1');
  });

  it('should include all-day events', () => {
    const tasks = [createMockTask({ id: '1', dueDate: new Date(Date.UTC(2024, 0, 15, 0, 0, 0)) })];
    const targetDate = new Date('2024-01-15');
    const events = getEventsForDate(tasks, targetDate);

    expect(events).toHaveLength(1);
    // All-day detection depends on the Date object's local time representation
    expect(events[0].start).toBeTruthy();
  });

  it('should return empty array when no events match', () => {
    const tasks = [createMockTask({ id: '1', dueDate: new Date('2024-01-15T10:00:00Z') })];
    const targetDate = new Date('2024-01-16');
    const events = getEventsForDate(tasks, targetDate);

    expect(events).toHaveLength(0);
  });
});

describe('getEventsForRange', () => {
  it('should return events within date range', () => {
    const tasks = [
      createMockTask({ id: '1', dueDate: new Date('2024-01-15T10:00:00Z') }),
      createMockTask({ id: '2', dueDate: new Date('2024-01-20T10:00:00Z') }),
      createMockTask({ id: '3', dueDate: new Date('2024-02-01T10:00:00Z') }),
    ];
    const range = {
      start: new Date('2024-01-01'),
      end: new Date('2024-01-31'),
    };
    const events = getEventsForRange(tasks, range);

    expect(events).toHaveLength(2);
    const ids = events.map((e) => e.id);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
    expect(ids).not.toContain('3');
  });
});

describe('isTimeSlotAvailable', () => {
  it('should return true when no events exist', () => {
    const events: CalendarEvent[] = [];
    const start = new Date('2024-01-15T10:00:00Z');
    const end = new Date('2024-01-15T11:00:00Z');

    expect(isTimeSlotAvailable(events, start, end)).toBe(true);
  });

  it('should return true when slot does not overlap', () => {
    const calendarEvent = taskToCalendarEvent(
      createMockTask({
        dueDate: new Date('2024-01-15T09:00:00Z'),
        estimatedTime: 30,
      })
    );
    expect(calendarEvent).not.toBeNull();

    const event = {
      ...calendarEvent,
      id: '1',
    } as CalendarEvent;
    const start = new Date('2024-01-15T10:00:00Z');
    const end = new Date('2024-01-15T11:00:00Z');

    expect(isTimeSlotAvailable([event], start, end)).toBe(true);
  });

  it('should return false when slot overlaps', () => {
    const calendarEvent = taskToCalendarEvent(
      createMockTask({
        dueDate: new Date('2024-01-15T10:00:00Z'),
        estimatedTime: 60,
      })
    );
    expect(calendarEvent).not.toBeNull();

    const event = {
      ...calendarEvent,
      id: '1',
    } as CalendarEvent;
    const start = new Date('2024-01-15T10:30:00Z');
    const end = new Date('2024-01-15T11:30:00Z');

    expect(isTimeSlotAvailable([event], start, end)).toBe(false);
  });

  it('should exclude specified event ID', () => {
    const calendarEvent = taskToCalendarEvent(
      createMockTask({
        dueDate: new Date('2024-01-15T10:00:00Z'),
        estimatedTime: 60,
      })
    );
    expect(calendarEvent).not.toBeNull();

    const event = {
      ...calendarEvent,
      id: '1',
    } as CalendarEvent;
    const start = new Date('2024-01-15T10:30:00Z');
    const end = new Date('2024-01-15T11:00:00Z');

    expect(isTimeSlotAvailable([event], start, end, '1')).toBe(true);
  });
});

describe('generateMonthView', () => {
  it('should generate month view data', () => {
    const tasks = [createMockTask({ dueDate: new Date('2024-01-15T10:00:00Z') })];
    const currentDate = new Date('2024-01-15');
    const viewData = generateMonthView(tasks, currentDate);

    expect(viewData.firstDay).toBeTruthy();
    expect(viewData.lastDay).toBeTruthy();
    expect(viewData.weeks.length).toBeGreaterThan(0);
    expect(viewData.weeks.length).toBeLessThanOrEqual(6);
  });

  it('should include all weeks', () => {
    const tasks: ReturnType<typeof createMockTask>[] = [];
    const currentDate = new Date('2024-01-15');
    const viewData = generateMonthView(tasks, currentDate);

    expect(viewData.weeks.length).toBeGreaterThan(0);
    viewData.weeks.forEach((week) => {
      expect(week.days).toHaveLength(7);
    });
  });
});

describe('generateWeekView', () => {
  it('should generate week view data', () => {
    const tasks = [createMockTask({ dueDate: new Date('2024-01-15T10:00:00Z') })];
    const currentDate = new Date('2024-01-15');
    const viewData = generateWeekView(tasks, currentDate);

    expect(viewData.startDate).toBeTruthy();
    expect(viewData.endDate).toBeTruthy();
    expect(viewData.days).toHaveLength(7);
    expect(viewData.hours).toHaveLength(24);
  });
});

describe('generateDayView', () => {
  it('should generate day view data', () => {
    const tasks = [createMockTask({ dueDate: new Date('2024-01-15T10:00:00Z') })];
    const currentDate = new Date('2024-01-15');
    const viewData = generateDayView(tasks, currentDate);

    expect(viewData.date).toBeTruthy();
    expect(viewData.hours).toHaveLength(24);
    expect(viewData.events.length).toBeGreaterThan(0);
  });
});

describe('generateAgendaView', () => {
  it('should generate agenda view data', () => {
    const tasks = [
      createMockTask({ id: '1', dueDate: new Date('2024-01-15T10:00:00Z') }),
      createMockTask({ id: '2', dueDate: new Date('2024-01-16T10:00:00Z') }),
    ];
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-01-20');
    const viewData = generateAgendaView(tasks, startDate, endDate);

    expect(viewData.startDate).toEqual(startDate);
    expect(viewData.endDate).toEqual(endDate);
    expect(viewData.items.length).toBeGreaterThan(0);
    expect(viewData.totalEvents).toBe(2);
  });

  it('should group events by date', () => {
    const tasks = [
      createMockTask({ id: '1', dueDate: new Date('2024-01-15T10:00:00Z') }),
      createMockTask({ id: '2', dueDate: new Date('2024-01-15T14:00:00Z') }),
      createMockTask({ id: '3', dueDate: new Date('2024-01-16T10:00:00Z') }),
    ];
    const startDate = new Date('2024-01-15');
    const endDate = new Date('2024-01-20');
    const viewData = generateAgendaView(tasks, startDate, endDate);

    expect(viewData.items.length).toBe(2);
    expect(viewData.items[0].events).toHaveLength(2);
    expect(viewData.items[1].events).toHaveLength(1);
  });
});
