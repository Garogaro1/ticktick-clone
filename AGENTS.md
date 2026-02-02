# TickTick Clone - Ralph Operational Guide

## Build Commands

### Development
```bash
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm run start        # Start production server
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix lint issues automatically
npm run typecheck    # Run TypeScript type checking
npm run format        # Format code with Prettier
```

### Database
```bash
npx prisma generate   # Generate Prisma client
npx prisma migrate dev # Apply migrations (dev)
npx prisma db push    # Push schema changes (dev quick)
npx prisma studio     # Open Prisma Studio (DB viewer)
npx prisma db seed    # Seed database with sample data
```

### Testing
```bash
npm test              # Run all tests
npm test:watch        # Run tests in watch mode
npm test:coverage     # Run tests with coverage report
npm run test:e2e      # Run E2E tests
```

## Validation Commands

**Run these after implementing to get immediate feedback:**

1. **Typecheck**: `npm run typecheck` - Must have 0 errors
2. **Lint**: `npm run lint` - Must have 0 errors
3. **Tests**: `npm test` - Must all pass
4. **Build**: `npm run build` - Must succeed

## Project Structure

```
src/
├── app/              # Next.js app router
├── components/       # React components
├── lib/              # Shared utilities (STANDARD LIBRARY)
│   ├── db/           # Database utilities
│   ├── auth/         # Authentication utilities
│   └── utils/        # General utilities
├── styles/           # Global styles
└── types/            # TypeScript types
```

**Important**: `src/lib` is the project's standard library. Always check if a utility exists before creating new ones.

## Development Workflow

1. Read task from IMPLEMENTATION_PLAN.md
2. Search codebase first (don't assume not implemented)
3. Implement feature completely (no placeholders)
4. Run ALL validation commands
5. Fix any issues
6. Commit with descriptive message
7. Update IMPLEMENTATION_PLAN.md

## Common Patterns

### Database Query
```typescript
// Use Prisma from src/lib/db.ts
import { db } from '@/lib/db';
const tasks = await db.task.findMany(...);
```

### Authentication
```typescript
// Use auth helpers from src/lib/auth/
import { getSession } from '@/lib/auth';
const session = await getSession();
```

### API Routes
```typescript
// In app/api/...
import { validateRequest } from '@/lib/api/validation';
```

## Known Issues

- Check IMPLEMENTATION_PLAN.md for current known issues
- Always resolve test failures before committing
- Never leave TODOs in committed code

## Performance

- Keep First Contentful Paint < 1.5s
- Keep Time to Interactive < 3.5s
- Use Next.js Image component for images
- Use React.memo for expensive components

## Design System

All UI MUST follow the warm, minimalist Claude Code style:
- Colors: See docs/DESIGN_RULES_CLAUDE_STYLE.md
- No pure black (#000000) - use #2D2A26
- No cold blue - use warm terracotta (#D97757)
- Spacing: 4px grid system
- Border radius: 8px for buttons/inputs

## Testing Standards

- Unit tests: >80% coverage required
- Integration tests: For all API routes
- E2E tests: For critical user flows
- No TODOs in tests - implement or skip

## Git Conventions

- Commit messages: "Phase X: Task description"
- Never commit broken tests
- Never commit with console.log
- Create PRs for phase completion
