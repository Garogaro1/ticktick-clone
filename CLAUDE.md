# Ralph-Enabled Project

This project uses **Ralph Wiggum** autonomous development loop.

## What is Ralph?

Ralph is an autonomous AI development system that:
- Reads plans from `IMPLEMENTATION_PLAN.md`
- Executes tasks one by one
- Runs validation after each task
- Commits changes automatically
- Works for hours without human intervention

## Important for Ralph

### When Working on This Project

**DO:**
- ✅ Read `IMPLEMENTATION_PLAN.md` before starting work
- ✅ Update `IMPLEMENTATION_PLAN.md` when completing tasks
- ✅ Run validation commands before committing
- ✅ Update `AGENTS.md` when you learn new patterns
- ✅ Write tests for new features
- ✅ Follow the existing code patterns in `src/lib/`

**DON'T:**
- ❌ Assume functionality is missing - search first
- ❌ Leave placeholders or stubs
- ❌ Skip tests or validation
- ❌ Commit broken code
- ❌ Work on tasks outside current phase
- ❌ Duplicate utilities from `src/lib`

## Ralph Workflow

### Planning Mode
```bash
./ralph-loop.sh plan
```
- Reads `specs/*` files
- Generates `IMPLEMENTATION_PLAN.md`
- No code changes
- Usually 1-2 iterations

### Build Mode
```bash
./ralph-loop.sh build
# Or just:
./ralph-loop.sh
```
- Reads `IMPLEMENTATION_PLAN.md`
- Executes tasks one by one
- Runs validation after each task
- Commits changes
- Continues until plan complete

### Monitor Progress
```bash
# Watch the plan update
tail -f IMPLEMENTATION_PLAN.md

# Watch loop logs
tail -f .ralph/loop.log

# Check current status
cat .ralph/running.lock
```

## Validation Commands

After making changes, run:
```bash
npm run typecheck    # TypeScript checks
npm run lint         # Linting
npm test             # Tests
npm run build        # Production build
```

All must pass before committing.

## Project Structure

```
├── PROMPT_plan.md           # Planning instructions (read-only)
├── PROMPT_build.md          # Building instructions (read-only)
├── AGENTS.md                # Operational guide (update when learning)
├── IMPLEMENTATION_PLAN.md   # Task list (Ralph updates this)
├── specs/                   # Requirements (write here)
│   └── feature-name.md
├── src/                     # Source code
│   └── lib/                 # Standard library (check before creating)
├── .ralph/                  # Ralph configuration
│   ├── loop.sh              # Main loop script
│   └── validate.sh          # Validation script
└── CLAUDE.md                # This file
```

## Key Concepts

### Shared State
`IMPLEMENTATION_PLAN.md` is shared between Ralph iterations. Each loop:
1. Reads the plan
2. Picks the most important task
3. Implements it
4. Updates the plan (marks task done)
5. Commits
6. Next loop reads updated plan

### Fresh Context Each Loop
Ralph starts with clean context every iteration. This means:
- No context pollution
- Focused on single task
- Better performance over long sessions
- Deterministic behavior

### Backpressure
Validation commands provide backpressure:
- Tests fail → Ralph fixes before committing
- Lint fails → Ralph fixes before committing
- Build fails → Ralph fixes before committing

This ensures committed code always works.

## Adding New Features

### Step 1: Write Spec
Create `specs/your-feature.md`:
```markdown
# Your Feature

## Overview
What this feature does and why.

## Requirements
- Requirement 1
- Requirement 2

## Acceptance Criteria
- [ ] Criterion 1 (verifiable)
- [ ] Criterion 2 (verifiable)
```

### Step 2: Run Planning
```bash
./ralph-loop.sh plan
```

### Step 3: Review Plan
```bash
cat IMPLEMENTATION_PLAN.md
```

### Step 4: Execute
```bash
./ralph-loop.sh build
```

## Stopping Ralph

If Ralph goes off track:
```bash
# Stop the loop
rm .ralph/running.lock

# Or Ctrl+C in the terminal running Ralph
```

Then:
- Review `IMPLEMENTATION_PLAN.md`
- Manual edit if needed
- Regenerate plan: `./ralph-loop.sh plan`
- Restart: `./ralph-loop.sh build`

## Current Phase

We are currently on: **Phase PHASE_NUMBER**
**Phase Name:** PHASE_NAME
**Description:** PHASE_DESCRIPTION

Focus on tasks for this phase only. Check `IMPLEMENTATION_PLAN.md` for current tasks.

## Learn More

- [Ralph Setup Guide](https://github.com/ghuntley/how-to-ralph-wiggum)
- [Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Project Specs](./specs/) - Read feature specifications here
- [Implementation Plan](./IMPLEMENTATION_PLAN.md) - See current tasks
