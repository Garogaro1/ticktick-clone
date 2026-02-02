/**
 * Database utility tests
 *
 * Tests for Prisma Client singleton and database connection utilities.
 * @see https://www.prisma.io/docs/guides/testing/unit-testing
 */

// Mock the Prisma Client to avoid actual database connection in tests
// Note: jest.mock is hoisted, so everything must be defined inline
jest.mock('@prisma/client', () => {
  const createMockModel = () => ({
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  });

  const mockPrismaClient = {
    user: createMockModel(),
    task: createMockModel(),
    list: createMockModel(),
    tag: createMockModel(),
    taskTag: createMockModel(),
    habit: createMockModel(),
    habitEntry: createMockModel(),
    goal: createMockModel(),
    pomodoroSession: createMockModel(),
    $disconnect: jest.fn(),
    $connect: jest.fn(),
    $transaction: jest.fn(),
    $use: jest.fn(),
    $on: jest.fn(),
    $extends: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

import { db, disconnectDatabase } from './db';

describe('Database Utilities', () => {
  describe('db singleton', () => {
    it('should export a db instance', () => {
      expect(db).toBeDefined();
      expect(db).toHaveProperty('user');
      expect(db).toHaveProperty('task');
      expect(db).toHaveProperty('list');
      expect(db).toHaveProperty('tag');
      expect(db).toHaveProperty('habit');
      expect(db).toHaveProperty('goal');
      expect(db).toHaveProperty('pomodoroSession');
    });

    it('should have the expected model methods', () => {
      expect(db.user).toHaveProperty('findMany');
      expect(db.user).toHaveProperty('create');
      expect(db.task).toHaveProperty('findMany');
      expect(db.task).toHaveProperty('create');
      expect(db.list).toHaveProperty('findMany');
      expect(db.list).toHaveProperty('create');
    });

    it('should have $disconnect method', () => {
      expect(db).toHaveProperty('$disconnect');
      expect(typeof db.$disconnect).toBe('function');
    });
  });

  describe('disconnectDatabase', () => {
    it('should export a disconnectDatabase function', () => {
      expect(disconnectDatabase).toBeDefined();
      expect(typeof disconnectDatabase).toBe('function');
    });

    it('should call $disconnect on the db instance', async () => {
      const disconnectSpy = jest.spyOn(db, '$disconnect');
      await disconnectDatabase();
      expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Database models', () => {
    it('should expose User model with query methods', () => {
      expect(db.user).toHaveProperty('findMany');
      expect(db.user).toHaveProperty('findFirst');
      expect(db.user).toHaveProperty('findUnique');
      expect(db.user).toHaveProperty('create');
      expect(db.user).toHaveProperty('update');
      expect(db.user).toHaveProperty('delete');
    });

    it('should expose Task model with query methods', () => {
      expect(db.task).toHaveProperty('findMany');
      expect(db.task).toHaveProperty('findFirst');
      expect(db.task).toHaveProperty('findUnique');
      expect(db.task).toHaveProperty('create');
      expect(db.task).toHaveProperty('update');
      expect(db.task).toHaveProperty('delete');
    });

    it('should expose List model with query methods', () => {
      expect(db.list).toHaveProperty('findMany');
      expect(db.list).toHaveProperty('findFirst');
      expect(db.list).toHaveProperty('findUnique');
      expect(db.list).toHaveProperty('create');
      expect(db.list).toHaveProperty('update');
      expect(db.list).toHaveProperty('delete');
    });

    it('should expose Tag model with query methods', () => {
      expect(db.tag).toHaveProperty('findMany');
      expect(db.tag).toHaveProperty('findFirst');
      expect(db.tag).toHaveProperty('findUnique');
      expect(db.tag).toHaveProperty('create');
      expect(db.tag).toHaveProperty('update');
      expect(db.tag).toHaveProperty('delete');
    });

    it('should expose Habit model with query methods', () => {
      expect(db.habit).toHaveProperty('findMany');
      expect(db.habit).toHaveProperty('findFirst');
      expect(db.habit).toHaveProperty('findUnique');
      expect(db.habit).toHaveProperty('create');
      expect(db.habit).toHaveProperty('update');
      expect(db.habit).toHaveProperty('delete');
    });

    it('should expose Goal model with query methods', () => {
      expect(db.goal).toHaveProperty('findMany');
      expect(db.goal).toHaveProperty('findFirst');
      expect(db.goal).toHaveProperty('findUnique');
      expect(db.goal).toHaveProperty('create');
      expect(db.goal).toHaveProperty('update');
      expect(db.goal).toHaveProperty('delete');
    });

    it('should expose PomodoroSession model with query methods', () => {
      expect(db.pomodoroSession).toHaveProperty('findMany');
      expect(db.pomodoroSession).toHaveProperty('findFirst');
      expect(db.pomodoroSession).toHaveProperty('findUnique');
      expect(db.pomodoroSession).toHaveProperty('create');
      expect(db.pomodoroSession).toHaveProperty('update');
      expect(db.pomodoroSession).toHaveProperty('delete');
    });
  });
});
