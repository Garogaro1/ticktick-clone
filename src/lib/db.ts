/**
 * Prisma Client singleton for database access.
 *
 * This file provides:
 * - Single Prisma Client instance (prevents connection exhaustion)
 * - Type-safe database access
 * - Hot reload support in development
 *
 * @example
 * import { db } from '@/lib/db';
 * const tasks = await db.task.findMany();
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global variable to hold the Prisma Client instance in development.
 * This ensures we don't create multiple instances during hot reload.
 */
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Creates Prisma Client options with logging configuration.
 * - In development: Logs all queries to help with debugging
 * - In production: Logs only errors
 */
function getPrismaClientOptions() {
  const logLevels = process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'];

  return {
    log: logLevels as Array<'query' | 'error' | 'warn' | 'info'>,
  };
}

/**
 * Creates a new Prisma Client instance or returns the existing one.
 * This prevents connection exhaustion during development with hot reload.
 */
function createPrismaClient(): PrismaClient {
  if (process.env.NODE_ENV === 'development') {
    // Reuse the client in development to avoid connection pool exhaustion
    if (!global.prisma) {
      global.prisma = new PrismaClient(getPrismaClientOptions());
    }
    return global.prisma;
  }

  // In production, create a new instance
  return new PrismaClient(getPrismaClientOptions());
}

/**
 * The exported Prisma Client instance.
 * Use this throughout the application for database access.
 *
 * @example
 * import { db } from '@/lib/db';
 *
 * // Find all tasks for a user
 * const tasks = await db.task.findMany({
 *   where: { userId: 'user-id' }
 * });
 *
 * // Create a new task
 * const task = await db.task.create({
 *   data: {
 *     title: 'My task',
 *     userId: 'user-id',
 *     listId: 'list-id',
 *   }
 * });
 */
export const db = createPrismaClient();

/**
 * Gracefully closes the database connection.
 * Call this when shutting down the application (e.g., in tests).
 *
 * @example
 * import { db } from '@/lib/db';
 * await db.$disconnect();
 */
export async function disconnectDatabase(): Promise<void> {
  await db.$disconnect();
}

/**
 * Type alias for the Prisma Client for convenience.
 */
export type Prisma = typeof db;
