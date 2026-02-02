/**
 * Prisma Seed Script
 *
 * Populates the database with sample data for development and testing.
 * Run with: npm run prisma:seed
 *
 * @see https://www.prisma.io/docs/guides/database/seed-database
 */

import { config } from 'dotenv';
import { PrismaClient, TaskStatus, Priority, GoalStatus } from '@prisma/client';

// Load environment variables from .env.local
config({ path: '.env.local' });

const prisma = new PrismaClient();

/**
 * Clears all existing data from the database.
 * Useful for resetting the database to a clean state.
 */
async function clearDatabase() {
  await prisma.pomodoroSession.deleteMany();
  await prisma.habitEntry.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.list.deleteMany();
  await prisma.user.deleteMany();
}

/**
 * Creates sample user data.
 */
async function seedUsers() {
  const user = await prisma.user.create({
    data: {
      email: 'demo@example.com',
      name: 'Demo User',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    },
  });

  console.log(`✓ Created user: ${user.email}`);
  return user;
}

/**
 * Creates sample lists (Inbox, Work, Personal).
 */
async function seedLists(userId: string) {
  const inbox = await prisma.list.create({
    data: {
      title: 'Inbox',
      isDefault: true,
      sortOrder: 0,
      userId,
    },
  });

  const work = await prisma.list.create({
    data: {
      title: 'Work',
      icon: '💼',
      color: '#D97757',
      sortOrder: 1,
      userId,
    },
  });

  const personal = await prisma.list.create({
    data: {
      title: 'Personal',
      icon: '🏠',
      color: '#5B9A8B',
      sortOrder: 2,
      userId,
    },
  });

  console.log(`✓ Created lists: Inbox, Work, Personal`);
  return { inbox, work, personal };
}

/**
 * Creates sample tags for task categorization.
 */
async function seedTags(userId: string) {
  const urgent = await prisma.tag.create({
    data: {
      name: 'urgent',
      color: '#E57373',
      sortOrder: 0,
      userId,
    },
  });

  const bug = await prisma.tag.create({
    data: {
      name: 'bug',
      color: '#FF6B6B',
      sortOrder: 1,
      userId,
    },
  });

  const feature = await prisma.tag.create({
    data: {
      name: 'feature',
      color: '#4ECDC4',
      sortOrder: 2,
      userId,
    },
  });

  const research = await prisma.tag.create({
    data: {
      name: 'research',
      color: '#95E1D3',
      sortOrder: 3,
      userId,
    },
  });

  console.log(`✓ Created tags: urgent, bug, feature, research`);
  return { urgent, bug, feature, research };
}

/**
 * Creates sample tasks with various statuses and priorities.
 */
async function seedTasks(userId: string, inboxId: string, workId: string, personalId: string) {
  // Tasks for Inbox
  const task1 = await prisma.task.create({
    data: {
      title: 'Welcome to TickTick Clone',
      description: 'This is your new task management app. Try creating a task!',
      status: TaskStatus.DONE,
      priority: Priority.NONE,
      listId: inboxId,
      userId,
      sortOrder: 0,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: 'Learn the keyboard shortcuts',
      description: 'Press ? to see all available keyboard shortcuts',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      listId: inboxId,
      userId,
      sortOrder: 1,
    },
  });

  // Tasks for Work
  const task3 = await prisma.task.create({
    data: {
      title: 'Review pull requests',
      description: 'Check the pending PRs from the team',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      listId: workId,
      userId,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      estimatedTime: 30,
      sortOrder: 0,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: 'Prepare presentation for sprint planning',
      status: TaskStatus.TODO,
      priority: Priority.HIGH,
      listId: workId,
      userId,
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
      estimatedTime: 60,
      sortOrder: 1,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      title: 'Fix navigation bug on mobile',
      description: 'Users report the menu not opening on iOS Safari',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      listId: workId,
      userId,
      sortOrder: 2,
    },
  });

  // Tasks for Personal
  const task6 = await prisma.task.create({
    data: {
      title: 'Buy groceries',
      description: 'Milk, eggs, bread, vegetables',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      listId: personalId,
      userId,
      dueDate: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
      sortOrder: 0,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      title: 'Call mom',
      status: TaskStatus.TODO,
      priority: Priority.LOW,
      listId: personalId,
      userId,
      sortOrder: 1,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      title: 'Read 30 pages',
      description: 'Continue reading "Atomic Habits"',
      status: TaskStatus.DONE,
      priority: Priority.NONE,
      listId: personalId,
      userId,
      completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      sortOrder: 2,
    },
  });

  // Create a subtask
  const subtask1 = await prisma.task.create({
    data: {
      title: 'Prepare slide deck',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      listId: workId,
      userId,
      parentId: task4.id,
      sortOrder: 0,
    },
  });

  const subtask2 = await prisma.task.create({
    data: {
      title: 'Practice delivery',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      listId: workId,
      userId,
      parentId: task4.id,
      sortOrder: 1,
    },
  });

  console.log(`✓ Created tasks with various statuses and priorities`);
  return { task1, task2, task3, task4, task5, task6, task7, task8, subtask1, subtask2 };
}

/**
 * Creates task-tag associations.
 */
async function seedTaskTags(
  taskIds: Record<string, { id: string }>,
  tagIds: Record<string, { id: string }>
) {
  await prisma.taskTag.create({
    data: { taskId: taskIds.task3.id, tagId: tagIds.urgent.id },
  });
  await prisma.taskTag.create({
    data: { taskId: taskIds.task5.id, tagId: tagIds.bug.id },
  });
  await prisma.taskTag.create({
    data: { taskId: taskIds.task2.id, tagId: tagIds.feature.id },
  });
  await prisma.taskTag.create({
    data: { taskId: taskIds.task4.id, tagId: tagIds.research.id },
  });

  console.log(`✓ Created task-tag associations`);
}

/**
 * Creates sample habits.
 */
async function seedHabits(userId: string) {
  const habit1 = await prisma.habit.create({
    data: {
      title: 'Morning meditation',
      description: '10 minutes of mindfulness',
      color: '#9B87B1',
      icon: '🧘',
      frequency: 'daily',
      targetCount: 1,
      sortOrder: 0,
      userId,
    },
  });

  const habit2 = await prisma.habit.create({
    data: {
      title: 'Exercise',
      description: '30 minutes of physical activity',
      color: '#E57373',
      icon: '💪',
      frequency: 'daily',
      targetCount: 1,
      sortOrder: 1,
      userId,
    },
  });

  const habit3 = await prisma.habit.create({
    data: {
      title: 'Read before bed',
      description: 'At least 20 pages',
      color: '#5B9A8B',
      icon: '📚',
      frequency: 'daily',
      targetCount: 1,
      sortOrder: 2,
      userId,
    },
  });

  console.log(`✓ Created habits`);
  return { habit1, habit2, habit3 };
}

/**
 * Creates sample habit entries.
 */
async function seedHabitEntries(habits: Record<string, { id: string }>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dayBefore = new Date(today);
  dayBefore.setDate(dayBefore.getDate() - 2);

  // Create entries for the past 3 days
  for (const habit of Object.values(habits)) {
    await prisma.habitEntry.createMany({
      data: [
        { habitId: habit.id, date: dayBefore, count: 1 },
        { habitId: habit.id, date: yesterday, count: 1 },
        { habitId: habit.id, date: today, count: 1 },
      ],
    });
  }

  console.log(`✓ Created habit entries`);
}

/**
 * Creates sample goals.
 */
async function seedGoals(userId: string) {
  const goal1 = await prisma.goal.create({
    data: {
      title: 'Complete 100 tasks this month',
      description: 'Track your productivity and aim for consistency',
      targetValue: 100,
      currentValue: 24,
      unit: 'tasks',
      status: GoalStatus.ACTIVE,
      sortOrder: 0,
      userId,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      title: 'Read 10 books this year',
      description: 'Expand your knowledge and perspective',
      targetValue: 10,
      currentValue: 3,
      unit: 'books',
      status: GoalStatus.ACTIVE,
      sortOrder: 1,
      userId,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    },
  });

  console.log(`✓ Created goals`);
  return { goal1, goal2 };
}

/**
 * Creates sample Pomodoro sessions.
 */
async function seedPomodoroSessions(userId: string) {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

  await prisma.pomodoroSession.createMany({
    data: [
      {
        userId,
        duration: 25,
        breakDuration: 5,
        startedAt: twoHoursAgo,
        completedAt: new Date(twoHoursAgo.getTime() + 25 * 60 * 1000),
        wasCompleted: true,
        type: 'work',
      },
      {
        userId,
        duration: 5,
        breakDuration: 0,
        startedAt: new Date(twoHoursAgo.getTime() + 25 * 60 * 1000),
        completedAt: new Date(twoHoursAgo.getTime() + 30 * 60 * 1000),
        wasCompleted: true,
        type: 'break',
      },
      {
        userId,
        duration: 25,
        breakDuration: 5,
        startedAt: oneHourAgo,
        completedAt: new Date(oneHourAgo.getTime() + 25 * 60 * 1000),
        wasCompleted: true,
        type: 'work',
      },
    ],
  });

  console.log(`✓ Created Pomodoro sessions`);
}

/**
 * Main seed function.
 */
async function main() {
  console.log('🌱 Starting database seed...\n');

  await clearDatabase();

  const user = await seedUsers();
  const lists = await seedLists(user.id);
  const tags = await seedTags(user.id);
  const tasks = await seedTasks(user.id, lists.inbox.id, lists.work.id, lists.personal.id);
  await seedTaskTags(tasks, tags);
  const habits = await seedHabits(user.id);
  await seedHabitEntries(habits);
  await seedGoals(user.id);
  await seedPomodoroSessions(user.id);

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log('  - 1 user');
  console.log('  - 3 lists (Inbox, Work, Personal)');
  console.log('  - 4 tags (urgent, bug, feature, research)');
  console.log('  - 10 tasks (including subtasks)');
  console.log('  - 3 habits with entries');
  console.log('  - 2 goals');
  console.log('  - 3 Pomodoro sessions');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
