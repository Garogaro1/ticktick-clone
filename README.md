# TickTick Clone

Modern task management application built with Next.js 15, featuring a warm Claude-inspired design.

## Overview

This is a full-featured task management application clone inspired by TickTick. The project emphasizes clean design, smooth micro-interactions, and a warm color palette.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS with warm Claude theme
- **Linting:** ESLint 9 + Prettier
- **Git Hooks:** Husky + lint-staged
- **CI/CD:** GitHub Actions

## Prerequisites

- Node.js 22 or higher
- npm or yarn package manager

## Installation

```bash
# Clone the repository
git clone https://github.com/Garogaro1/ticktick-clone.git
cd ticktick-clone

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run typecheck    # Run TypeScript type checking
npm run format       # Format code with Prettier
```

## Validation Commands

Run these commands before committing changes:

```bash
npm run typecheck    # TypeScript checks - must pass with 0 errors
npm run lint         # Linting - must pass with 0 errors
npm run build        # Production build - must succeed
```

## Project Structure

```
src/
├── app/              # Next.js app router
│   ├── layout.tsx    # Root layout with metadata
│   ├── page.tsx      # Home page
│   └── globals.css   # Global styles
├── components/       # React components
├── lib/              # Shared utilities
├── styles/           # Global styles
│   ├── base/         # CSS reset and base styles
│   └── tokens/       # Design tokens (colors, spacing, etc.)
└── types/            # TypeScript definitions
```

## Design System

The application uses a warm Claude-inspired theme:

### Colors

- **Primary:** #D97757 (terracotta)
- **Background:** #FCFBF9 (warm cream)
- **Text:** #2D2A26 (warm dark gray)

### Principles

- **4px Grid System:** All spacing is a multiple of 4px
- **Micro-interactions:** Animations are 150-300ms
- **No pure black:** Use warm dark grays instead
- **No cold blue:** Use warm terracotta for accents

## Ralph Wiggum Setup

This project uses Ralph Wiggum for autonomous development. See `CLAUDE.md` for details.

```bash
# Plan mode - generate implementation plan
./ralph-loop.sh plan

# Build mode - execute tasks autonomously
./ralph-loop.sh build
```

## Deployment

### Vercel (Recommended)

This project is optimized for Vercel deployment.

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

**Environment Variables**

Configure these in your Vercel project settings:

```bash
# Required
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional Features
NEXT_PUBLIC_ANALYTICS_ENABLED=true
NEXT_PUBLIC_DEBUG=false

# Phase 2+ (Database)
DATABASE_URL=postgresql://...

# Phase 3+ (Authentication)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=https://your-domain.com

# Optional (Error Tracking)
SENTRY_DSN=your-sentry-dsn
SENTRY_AUTH_TOKEN=your-auth-token
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### Other Platforms

The project can be deployed to any platform supporting Next.js:

- **Netlify:** Use `npm run build` as build command
- **Railway/Render:** Connect repository and configure environment variables
- **Self-hosted:** Run `npm run build` then `npm run start`

## Documentation

- [Component Library](docs/COMPONENT_LIBRARY.md) - UI components and usage
- [Analytics Events](docs/analytics-events.md) - Analytics tracking guide
- [Design Rules](docs/DESIGN_RULES_CLAUDE_STYLE.md) - Design system
- [Implementation Plan](IMPLEMENTATION_PLAN.md) - Development roadmap

## Contributing

1. Create a feature branch
2. Make your changes
3. Run validation commands
4. Commit with descriptive message
5. Push and create a pull request

All commits are automatically validated via pre-commit hooks.

## License

ISC
