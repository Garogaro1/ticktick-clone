# Plan: TickTick Clone - Phase 1 Core Task Management

## Overview
Build MVP task management application with core TickTick functionality.

**Tech Stack:**
- Frontend: Next.js 15 + React + TypeScript + Tailwind CSS
- Backend: Next.js API Routes + Prisma ORM
- Database: SQLite (dev) / PostgreSQL (prod)
- Auth: NextAuth.js
- State: Zustand

**Phase 1 Scope:**
- User authentication
- Task CRUD operations
- Task lists/projects
- Basic task properties (title, description, due date, priority, completed)
- Task filtering and sorting
- Responsive UI

## Validation Commands
- `npm run lint`
- `npm run type-check`
- `npm test`

### Task 1: Project Setup
- [ ] Initialize Next.js 15 project with TypeScript
- [ ] Configure Tailwind CSS with custom TickTick-like theme
- [ ] Setup Prisma with SQLite database
- [ ] Configure ESLint and Prettier
- [ ] Setup project structure (app/, components/, lib/, prisma/)
- [ ] Mark completed

### Task 2: Database Schema
- [ ] Create Prisma schema for User model
- [ ] Create Prisma schema for Task model
- [ ] Create Prisma schema for List model
- [ ] Define relationships (User -> Tasks, User -> Lists, List -> Tasks)
- [ ] Run initial migration
- [ ] Add seed data for testing
- [ ] Mark completed

### Task 3: Authentication System
- [ ] Install and configure NextAuth.js
- [ ] Setup credential authentication (email/password)
- [ ] Create auth UI components (login, register, logout)
- [ ] Protect API routes with auth middleware
- [ ] Add session management
- [ ] Mark completed

### Task 4: Task API Endpoints
- [ ] Create GET /api/tasks - list all user's tasks
- [ ] Create POST /api/tasks - create new task
- [ ] Create PUT /api/tasks/[id] - update task
- [ ] Create DELETE /api/tasks/[id] - delete task
- [ ] Add filtering (completed, priority, list, due date)
- [ ] Add sorting (due date, priority, created at)
- [ ] Add input validation with Zod
- [ ] Mark completed

### Task 5: List API Endpoints
- [ ] Create GET /api/lists - list all user's lists
- [ ] Create POST /api/lists - create new list
- [ ] Create PUT /api/lists/[id] - update list
- [ ] Create DELETE /api/lists/[id] - delete list
- [ ] Mark completed

### Task 6: Task Management UI
- [ ] Create task list component with checkbox
- [ ] Create task item component with edit/delete
- [ ] Create add task input component
- [ ] Create task detail modal
- [ ] Implement inline editing for task title
- [ ] Add task completion toggle animation
- [ ] Mark completed

### Task 7: Task Properties
- [ ] Add due date picker component
- [ ] Add priority selector (None, Low, Medium, High)
- [ ] Add list selector/dropdown
- [ ] Add task description textarea
- [ ] Create task properties sidebar
- [ ] Mark completed

### Task 8: Lists Management UI
- [ ] Create sidebar with list navigation
- [ ] Create add list modal
- [ ] Implement list editing
- [ ] Add list deletion with confirmation
- [ ] Show task count per list
- [ ] Add "All Tasks" and "Completed" smart lists
- [ ] Mark completed

### Task 9: Task Filtering & Sorting
- [ ] Create filter bar component
- [ ] Implement filter by status (active/completed)
- [ ] Implement filter by priority
- [ ] Implement filter by list
- [ ] Add sort controls
- [ ] Implement sort by due date, priority, created
- [ ] Mark completed

### Task 10: Responsive Design
- [ ] Optimize layout for mobile (< 768px)
- [ ] Add hamburger menu for mobile sidebar
- [ ] Optimize task list for mobile
- [ ] Add touch gestures for task completion
- [ ] Test on various screen sizes
- [ ] Mark completed

### Task 11: Testing
- [ ] Write unit tests for utility functions
- [ ] Write integration tests for API routes
- [ ] Write component tests for TaskList
- [ ] Write component tests for TaskItem
- [ ] Add E2E test for create->complete->delete flow
- [ ] Ensure all tests pass
- [ ] Mark completed

### Task 12: Polish & Deployment Prep
- [ ] Add loading states and error handling
- [ ] Add toast notifications for actions
- [ ] Add keyboard shortcuts (Enter to add, Escape to cancel)
- [ ] Optimize performance (React.memo, useCallback)
- [ ] Add meta tags and SEO
- [ ] Prepare deployment configuration
- [ ] Mark completed
