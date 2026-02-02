/**
 * Database integration tests
 *
 * These tests run against a real SQLite database.
 * They verify that the Prisma schema and migrations work correctly.
 *
 * @see https://www.prisma.io/docs/guides/testing/integration-testing
 */

import { PrismaClient, TaskStatus, Priority, GoalStatus, User, List, Tag } from '@prisma/client';

describe('Database Integration Tests', () => {
  let prisma: PrismaClient;

  beforeAll(() => {
    // Create a new Prisma Client for testing
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL ?? 'file:./prisma/dev.db',
        },
      },
    });
  });

  // Note: We don't disconnect in afterAll to avoid setImmediate issues in jest
  // The connection will be cleaned up when the process exits

  describe('User CRUD operations', () => {
    const testUserEmail = `test-${Date.now()}@example.com`;

    it('should create a new user', async () => {
      const user = await prisma.user.create({
        data: {
          email: testUserEmail,
          name: 'Test User',
        },
      });

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.email).toBe(testUserEmail);
      expect(user.name).toBe('Test User');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should find a user by email', async () => {
      const user = await prisma.user.create({
        data: {
          email: testUserEmail,
          name: 'Find Test User',
        },
      });

      const found = await prisma.user.findUnique({
        where: { email: testUserEmail },
      });

      expect(found).toBeDefined();
      expect(found?.email).toBe(testUserEmail);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should update a user', async () => {
      const user = await prisma.user.create({
        data: {
          email: testUserEmail,
          name: 'Original Name',
        },
      });

      const newName = 'Updated Test User';
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: newName },
      });

      expect(updated.name).toBe(newName);

      // Clean up
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('List CRUD operations', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `test-list-${Date.now()}@example.com`,
          name: 'List Test User',
        },
      });
    });

    afterEach(async () => {
      // Clean up: delete user (cascades to lists)
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    it('should create a default inbox list', async () => {
      const list = await prisma.list.create({
        data: {
          title: 'Inbox',
          isDefault: true,
          userId: testUser.id,
        },
      });

      expect(list).toBeDefined();
      expect(list.title).toBe('Inbox');
      expect(list.isDefault).toBe(true);
    });

    it('should create lists with custom properties', async () => {
      const list = await prisma.list.create({
        data: {
          title: 'Work',
          icon: '💼',
          color: '#D97757',
          isFavorite: true,
          userId: testUser.id,
        },
      });

      expect(list.icon).toBe('💼');
      expect(list.color).toBe('#D97757');
      expect(list.isFavorite).toBe(true);
    });

    it('should find lists by user', async () => {
      await prisma.list.create({
        data: {
          title: 'Personal',
          userId: testUser.id,
        },
      });

      const lists = await prisma.list.findMany({
        where: { userId: testUser.id },
      });

      expect(lists.length).toBeGreaterThan(0);
      expect(lists[0].userId).toBe(testUser.id);
    });
  });

  describe('Task CRUD operations', () => {
    let testUser: User;
    let testList: List;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `test-task-${Date.now()}@example.com`,
          name: 'Task Test User',
        },
      });

      testList = await prisma.list.create({
        data: {
          title: 'Test List',
          userId: testUser.id,
        },
      });
    });

    afterEach(async () => {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    it('should create a task with default values', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Test Task',
          userId: testUser.id,
          listId: testList.id,
        },
      });

      expect(task).toBeDefined();
      expect(task.title).toBe('Test Task');
      expect(task.status).toBe(TaskStatus.TODO);
      expect(task.priority).toBe(Priority.NONE);
    });

    it('should create a task with custom status and priority', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'High Priority Task',
          status: TaskStatus.IN_PROGRESS,
          priority: Priority.HIGH,
          userId: testUser.id,
          listId: testList.id,
        },
      });

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.priority).toBe(Priority.HIGH);
    });

    it('should create a task with due date', async () => {
      const dueDate = new Date('2026-12-31');
      const task = await prisma.task.create({
        data: {
          title: 'Task with Due Date',
          dueDate,
          userId: testUser.id,
          listId: testList.id,
        },
      });

      expect(task.dueDate).toEqual(dueDate);
    });

    it('should create subtasks', async () => {
      const parent = await prisma.task.create({
        data: {
          title: 'Parent Task',
          userId: testUser.id,
          listId: testList.id,
        },
      });

      const subtask = await prisma.task.create({
        data: {
          title: 'Subtask',
          userId: testUser.id,
          listId: testList.id,
          parentId: parent.id,
        },
      });

      expect(subtask.parentId).toBe(parent.id);

      const parentWithSubtasks = await prisma.task.findUnique({
        where: { id: parent.id },
        include: { subtasks: true },
      });

      expect(parentWithSubtasks?.subtasks).toHaveLength(1);
    });

    it('should filter tasks by status', async () => {
      await prisma.task.createMany({
        data: [
          {
            title: 'Todo Task',
            status: TaskStatus.TODO,
            userId: testUser.id,
            listId: testList.id,
          },
          {
            title: 'Done Task',
            status: TaskStatus.DONE,
            userId: testUser.id,
            listId: testList.id,
          },
        ],
      });

      const todoTasks = await prisma.task.findMany({
        where: {
          userId: testUser.id,
          status: TaskStatus.TODO,
        },
      });

      expect(todoTasks.length).toBe(1);
      expect(todoTasks[0].status).toBe(TaskStatus.TODO);
    });
  });

  describe('Tag and TaskTag operations', () => {
    let testUser: User;
    let testList: List;
    let testTag: Tag;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `test-tag-${Date.now()}@example.com`,
          name: 'Tag Test User',
        },
      });

      testList = await prisma.list.create({
        data: {
          title: 'Test List',
          userId: testUser.id,
        },
      });

      testTag = await prisma.tag.create({
        data: {
          name: 'urgent',
          color: '#E57373',
          userId: testUser.id,
        },
      });
    });

    afterEach(async () => {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    it('should create a tag', async () => {
      expect(testTag).toBeDefined();
      expect(testTag.name).toBe('urgent');
      expect(testTag.color).toBe('#E57373');
    });

    it('should associate a task with a tag', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Urgent Task',
          userId: testUser.id,
          listId: testList.id,
          tags: {
            create: {
              tagId: testTag.id,
            },
          },
        },
      });

      const taskWithTag = await prisma.task.findUnique({
        where: { id: task.id },
        include: { tags: true },
      });

      expect(taskWithTag?.tags).toHaveLength(1);
      expect(taskWithTag?.tags[0].tagId).toBe(testTag.id);
    });

    it('should find tasks by tag', async () => {
      const task = await prisma.task.create({
        data: {
          title: 'Tagged Task',
          userId: testUser.id,
          listId: testList.id,
          tags: {
            create: {
              tagId: testTag.id,
            },
          },
        },
      });

      const taggedTasks = await prisma.task.findMany({
        where: {
          userId: testUser.id,
          tags: {
            some: {
              tagId: testTag.id,
            },
          },
        },
      });

      expect(taggedTasks.length).toBe(1);
      expect(taggedTasks[0].id).toBe(task.id);
    });
  });

  describe('Habit operations', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `test-habit-${Date.now()}@example.com`,
          name: 'Habit Test User',
        },
      });
    });

    afterEach(async () => {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    it('should create a habit', async () => {
      const habit = await prisma.habit.create({
        data: {
          title: 'Morning Exercise',
          frequency: 'daily',
          targetCount: 1,
          userId: testUser.id,
        },
      });

      expect(habit).toBeDefined();
      expect(habit.title).toBe('Morning Exercise');
      expect(habit.frequency).toBe('daily');
      expect(habit.targetCount).toBe(1);
    });

    it('should create habit entries', async () => {
      const habit = await prisma.habit.create({
        data: {
          title: 'Read 30 minutes',
          frequency: 'daily',
          targetCount: 1,
          userId: testUser.id,
        },
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const entry = await prisma.habitEntry.create({
        data: {
          habitId: habit.id,
          date: today,
          count: 1,
        },
      });

      expect(entry).toBeDefined();
      expect(entry.habitId).toBe(habit.id);
    });
  });

  describe('Goal operations', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `test-goal-${Date.now()}@example.com`,
          name: 'Goal Test User',
        },
      });
    });

    afterEach(async () => {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    it('should create a goal', async () => {
      const goal = await prisma.goal.create({
        data: {
          title: 'Read 10 books this year',
          targetValue: 10,
          currentValue: 3,
          unit: 'books',
          status: GoalStatus.ACTIVE,
          userId: testUser.id,
        },
      });

      expect(goal).toBeDefined();
      expect(goal.title).toBe('Read 10 books this year');
      expect(goal.targetValue).toBe(10);
      expect(goal.currentValue).toBe(3);
      expect(goal.status).toBe(GoalStatus.ACTIVE);
    });

    it('should update goal progress', async () => {
      const goal = await prisma.goal.create({
        data: {
          title: 'Exercise goal',
          targetValue: 30,
          currentValue: 10,
          unit: 'days',
          userId: testUser.id,
        },
      });

      const updated = await prisma.goal.update({
        where: { id: goal.id },
        data: { currentValue: 15 },
      });

      expect(updated.currentValue).toBe(15);
    });
  });

  describe('PomodoroSession operations', () => {
    let testUser: User;

    beforeEach(async () => {
      testUser = await prisma.user.create({
        data: {
          email: `test-pomodoro-${Date.now()}@example.com`,
          name: 'Pomodoro Test User',
        },
      });
    });

    afterEach(async () => {
      await prisma.user.delete({
        where: { id: testUser.id },
      });
    });

    it('should create a Pomodoro session', async () => {
      const session = await prisma.pomodoroSession.create({
        data: {
          duration: 25,
          breakDuration: 5,
          userId: testUser.id,
          wasCompleted: true,
          type: 'work',
        },
      });

      expect(session).toBeDefined();
      expect(session.duration).toBe(25);
      expect(session.breakDuration).toBe(5);
      expect(session.wasCompleted).toBe(true);
    });
  });
});
