# Phase 1: Project Infrastructure

## Overview
Initialize complete Next.js 15 project with TypeScript, Tailwind CSS (warm Claude theme), ESLint, Prettier, Git hooks, and CI/CD pipeline for autonomous TickTick clone development.

## Requirements

### Next.js 15 Setup
- Use `next-app` template with App Router
- Enable TypeScript with strict mode
- Configure project structure:
  - `app/` - App Router pages and layouts
  - `components/` - React components
  - `lib/` - Shared utilities and helpers
  - `styles/` - Global styles and Tailwind config
  - `types/` - TypeScript type definitions

### Tailwind CSS Configuration
- Install and configure Tailwind CSS
- Setup custom color palette (warm Claude style):
  - Primary: #D97757 (terracotta)
  - Background: #FCFBF9 (warm cream)
  - Text: #2D2A26 (warm dark gray)
- Configure custom spacing scale (4px grid)
- Add custom border radius values
- Setup custom animation durations
- Enable dark mode class strategy

### Code Quality Tools
- ESLint:
  - Next.js recommended config
  - TypeScript rules
  - Custom rules for project standards
- Prettier:
  - 2 space indentation
  - Trailing commas
  - Single quotes
  - Semicolons
- TypeScript:
  - Strict mode enabled
  - Path aliases configured (@/*)
  - No implicit any

### Git Hooks
- Install husky for Git hooks
- Install lint-staged for file staging
- Configure pre-commit hook:
  - Run lint-staged (format + lint)
  - Run typecheck
- Configure commit-msg hook (optional)

### CI/CD Pipeline
- Create GitHub Actions workflow
- Configure automated testing on PR
- Setup automated deployment preview
- Configure branch protection rules

## Acceptance Criteria

- [ ] Next.js 15 project created with `npm create next-app`
- [ ] TypeScript configured with strict mode and path aliases
- [ ] Tailwind CSS installed and configured with warm theme colors
- [ ] Custom design tokens defined (colors, spacing, typography)
- [ ] ESLint configured with 0 errors on fresh project
- [ ] Prettier configured and formatting correctly
- [ ] Git hooks (husky + lint-staged) installed and tested
- [ ] GitHub Actions workflow created and tested
- [ ] All validation commands pass:
  - `npm run lint` - 0 errors
  - `npm run typecheck` - 0 errors
  - `npm run build` - succeeds
- [ ] Development server runs with hot reload: `npm run dev`
- [ ] Production build succeeds: `npm run build`
- [ ] README.md updated with setup instructions

## Technical Constraints

- Must use Next.js 15 with App Router (not Pages Router)
- Must use TypeScript (not JavaScript)
- Must follow Claude Code design aesthetic (warm colors, not cold blue)
- All paths must use aliases (e.g., `@/components/Button`)
- No placeholder comments - implement fully or document TODO

## Examples

### Example 1: Create Project
```bash
npx create-next-app@latest ticktick-clone --typescript --tailwind --eslint
cd ticktick-clone
```

### Example 2: Tailwind Config
```javascript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D97757",
          light: "#E8B4A3",
          dark: "#A85B3F",
        },
        background: {
          main: "#FCFBF9",
          secondary: "#F5F3EF",
          card: "#FFFFFF",
        },
        text: {
          primary: "#2D2A26",
          secondary: "#6B665F",
          tertiary: "#9A958C",
        },
      },
    },
  },
  plugins: [],
};
export default config;
```

### Example 3: Path Alias
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## Dependencies to Install

```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "eslint": "^8",
    "eslint-config-next": "15.0.0",
    "eslint-config-prettier": "^9.0.0",
    "prettier": "^3.0.0",
    "husky": "^9.0.0",
    "lint-staged": "^15.0.0",
    "typescript": "^5"
  }
}
```

## Success Metrics

- Time to `npm run dev`: < 5 minutes
- First hot reload: < 10 seconds
- Lint time: < 30 seconds
- Build time: < 2 minutes
- Repo size: < 50MB initial

## Notes

- This is the foundation for all future phases
- Invest time in proper setup now, saves time later
- Document any deviations from standard Next.js setup in AGENTS.md
- Keep CLAUDE.md updated with learnings
- All commits should pass hooks successfully
