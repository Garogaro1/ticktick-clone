# UI Component Library

Complete documentation for the TickTick clone's reusable UI components, built with React, TypeScript, and Tailwind CSS following the warm Claude design system.

## Table of Contents

- [Overview](#overview)
- [Design System](#design-system)
- [Installation](#installation)
- [Components](#components)
  - [Button](#button)
  - [Card](#card)
  - [Input](#input)
  - [Modal](#modal)
  - [Spinner](#spinner)
  - [Skeleton](#skeleton)
- [Accessibility](#accessibility)
- [Theming](#theming)

---

## Overview

The UI component library is a collection of accessible, reusable components built with:

- **React 18+** - Functional components with hooks
- **TypeScript** - Full type safety and IntelliSense
- **Tailwind CSS** - Utility-first styling
- **Forward Refs** - Ref forwarding for advanced use cases
- **Claude Design System** - Warm, minimalist aesthetic

### Key Features

- **Accessibility First** - WCAG 2.1 AA compliant
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Support** - ARIA attributes included
- **Responsive Design** - Mobile-first approach
- **Consistent Spacing** - 4px grid system
- **Smooth Animations** - 200ms transitions with easing

---

## Design System

### Color Palette

All components use the warm Claude theme colors:

#### Primary Colors

```css
--color-primary: #d97757 /* Terracotta - main actions */ --color-primary-light: #e8b4a3
  /* Soft coral - hover states */ --color-primary-dark: #a85b3f
  /* Deep terracotta - active states */;
```

#### Background Colors

```css
--color-bg-main: #fcfbf9 /* Warm cream - page background */ --color-bg-secondary: #f5f3ef
  /* Darker cream - sections */ --color-bg-card: #ffffff /* Pure white - cards */;
```

#### Text Colors

```css
--color-text-primary: #2d2a26 /* Warm dark gray - headings */ --color-text-secondary: #6b665f
  /* Muted gray - body text */ --color-text-tertiary: #9a958c /* Subtle gray - metadata */;
```

#### Semantic Colors

```css
--color-border: #e5e2db /* Subtle borders */ --color-border-dark: #d4d1ca /* Hover borders */
  --color-error: #c45454 /* Error states */ --color-focus-ring: #d97757 /* Focus indicators */;
```

### Typography

- **Font Family**: Inter (or system UI fonts)
- **Base Size**: 16px
- **Line Height**: 1.5 for body text
- **Font Weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing Scale

All spacing follows the 4px grid system:

```
4px  - Tight spacing (icon padding)
8px  - Small spacing (button padding)
12px - Medium spacing (form fields)
16px - Base spacing (sections)
24px - Large spacing (cards)
32px - XL spacing (page margins)
```

### Border Radius

```
4px  - Small elements (badges, tags)
8px  - Buttons, inputs
12px - Cards
16px - Modals, large containers
```

### Animation Timing

All transitions use consistent timing:

```
150ms - Fast interactions (checkbox, toggle)
200ms - Default interactions (hover, focus)
300ms - Complex animations (modal, slide-in)
400ms - Slow animations (multi-step transitions)
```

**Easing Function**: `cubic-bezier(0, 0, 0.2, 1)` (ease-out)

---

## Installation

All components are located in `src/components/ui/` and can be imported directly:

```tsx
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
```

### Utility Function

All components use the `cn` utility for conditional class names:

```tsx
import { cn } from '@/lib/utils';

// Merge class names with conflict resolution
const className = cn('base-class', isActive && 'active-class', 'additional-class');
```

---

## Components

### Button

Versatile button component with multiple variants and sizes.

#### Props

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}
```

#### Variants

**Primary** - Main actions, CTAs

```tsx
<Button variant="primary">Create Task</Button>
```

**Secondary** - Alternative actions

```tsx
<Button variant="secondary">Cancel</Button>
```

**Outline** - Less prominent actions

```tsx
<Button variant="outline">Learn More</Button>
```

**Ghost** - Subtle, icon buttons

```tsx
<Button variant="ghost">
  <Icon name="edit" />
</Button>
```

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

#### Examples

**Full Width Button**

```tsx
<Button fullWidth size="md">
  Submit Form
</Button>
```

**With Icon**

```tsx
<Button variant="primary" size="md">
  <PlusIcon />
  Add New Task
</Button>
```

**Disabled State**

```tsx
<Button disabled variant="primary">
  Processing...
</Button>
```

**As Link**

```tsx
<Button variant="ghost" onClick={() => router.push('/settings')}>
  Settings
</Button>
```

#### Accessibility

- Keyboard navigable with `Tab` and `Enter`/`Space`
- Visible focus ring (2px outline with offset)
- Disabled state has reduced opacity and `not-allowed` cursor
- ARIA attributes can be passed via `aria-*` props

---

### Card

Container component for grouping related content.

#### Props

```typescript
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}
```

#### Variants

**Default** - Simple card with background

```tsx
<Card variant="default">
  <h2>Card Title</h2>
  <p>Card content goes here.</p>
</Card>
```

**Outlined** - Card with border

```tsx
<Card variant="outlined">
  <h3>Task Details</h3>
  <p>This card has a visible border.</p>
</Card>
```

**Elevated** - Card with shadow

```tsx
<Card variant="elevated">
  <h3>Featured Card</h3>
  <p>This card stands out with a shadow.</p>
</Card>
```

#### Padding Options

```tsx
<Card padding="none">Custom padding</Card>
<Card padding="sm">Small padding (16px)</Card>
<Card padding="md">Medium padding (24px)</Card>
<Card padding="lg">Large padding (32px)</Card>
```

#### Interactive Cards

```tsx
<Card
  variant="outlined"
  padding="md"
  hover
  onClick={() => handleClick()}
  className="cursor-pointer"
>
  <h3>Click Me</h3>
  <p>This card responds to hover and clicks.</p>
</Card>
```

#### Examples

**Task Card**

```tsx
<Card variant="outlined" padding="md" hover>
  <div className="flex items-start gap-3">
    <input type="checkbox" className="mt-1" />
    <div className="flex-1">
      <h3 className="font-semibold text-text-primary">Complete project proposal</h3>
      <p className="text-sm text-text-secondary mt-1">Due: Today at 5:00 PM</p>
    </div>
  </div>
</Card>
```

**Stats Card**

```tsx
<Card variant="elevated" padding="lg">
  <div className="text-center">
    <p className="text-3xl font-bold text-primary">24</p>
    <p className="text-text-secondary">Tasks Completed</p>
  </div>
</Card>
```

**Custom Card with Header**

```tsx
<Card variant="default" padding="none">
  <div className="px-6 py-4 border-b border-border">
    <h2 className="text-lg font-semibold">Settings</h2>
  </div>
  <div className="p-6">{/* Settings content */}</div>
</Card>
```

#### Accessibility

- Semantically neutral `<div>` (use `role="region"` if needed)
- Keyboard accessible when combined with interactive elements
- Hover state indicates interactivity

---

### Input

Text input component with integrated label, error, and helper text.

#### Props

```typescript
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  inputSize?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
}
```

#### Sizes

```tsx
<Input inputSize="sm" placeholder="Small input" />
<Input inputSize="md" placeholder="Medium input" />
<Input inputSize="lg" placeholder="Large input" />
```

#### Examples

**Basic Input**

```tsx
<Input type="text" placeholder="Enter task name" />
```

**With Label**

```tsx
<Input label="Task Name" type="text" placeholder="What needs to be done?" />
```

**With Helper Text**

```tsx
<Input label="Due Date" type="date" helperText="Select when this task is due" />
```

**With Error State**

```tsx
<Input
  label="Email"
  type="email"
  error="Please enter a valid email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**Controlled Input**

```tsx
const [value, setValue] = useState('');

<Input
  label="Task Description"
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Add details..."
/>;
```

**Disabled Input**

```tsx
<Input label="Completed Date" type="text" value="2026-02-02" disabled />
```

**Auto-Focus Input**

```tsx
<Input
  label="Quick Add"
  type="text"
  placeholder="Type and press Enter"
  autoFocus
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleAddTask();
    }
  }}
/>
```

#### Validation Example

```tsx
function TaskForm() {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (title.trim().length < 3) {
      setError('Task name must be at least 3 characters');
      return;
    }
    setError('');
    // Submit logic
  };

  return (
    <div>
      <Input
        label="Task Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={error}
        placeholder="Enter task name"
      />
      <Button onClick={handleSubmit}>Add Task</Button>
    </div>
  );
}
```

#### Accessibility

- Label automatically linked to input via `htmlFor`
- Error state announced to screen readers
- Focus-visible outline for keyboard navigation
- Disabled state clearly indicated
- ARIA attributes can be passed (e.g., `aria-invalid`, `aria-describedby`)

---

### Modal

Dialog component for focused user interactions.

#### Props

```typescript
interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}
```

#### Sizes

```tsx
<Modal size="sm">...</Modal>   {/* max-w-md (448px) */}
<Modal size="md">...</Modal>   {/* max-w-lg (512px) */}
<Modal size="lg">...</Modal>   {/* max-w-2xl (672px) */}
<Modal size="xl">...</Modal>   {/* max-w-4xl (896px) */}
<Modal size="full">...</Modal> {/* max-w-full with margin */}
```

#### Examples

**Basic Modal**

```tsx
function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Task">
        <p>Enter your task details below.</p>
        <Input label="Task Name" placeholder="What needs to be done?" />
      </Modal>
    </>
  );
}
```

**Modal with Footer Actions**

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Delete Task"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  <p>Are you sure you want to delete this task? This action cannot be undone.</p>
</Modal>
```

**Large Modal**

```tsx
<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Task Settings" size="lg">
  <div className="space-y-4">
    <Input label="Task Name" value={task.name} />
    <Input label="Description" type="textarea" />
    <Input label="Due Date" type="date" />
  </div>
</Modal>
```

**Modal Without Title**

```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  footer={<Button onClick={() => setIsOpen(false)}>Close</Button>}
>
  <div className="text-center">
    <div className="text-4xl mb-4">✅</div>
    <h2 className="text-xl font-semibold mb-2">Task Completed!</h2>
    <p className="text-text-secondary">Great job! You've completed 5 tasks today.</p>
  </div>
</Modal>
```

**Form Modal**

```tsx
function NewTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [taskName, setTaskName] = useState('');

  const handleSubmit = () => {
    createTask(taskName);
    setTaskName('');
    setIsOpen(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      title="New Task"
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Create Task
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <Input
          label="Task Name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="What needs to be done?"
          autoFocus
        />
      </form>
    </Modal>
  );
}
```

#### Accessibility

- **Backdrop click** closes modal
- **Escape key** closes modal
- **Focus trap** - Tab cycles within modal
- **Body scroll lock** - Prevents background scrolling
- **ARIA attributes**:
  - `role="dialog"` on modal
  - `aria-modal="true"` announces modal to screen readers
  - `aria-labelledby` links to title
- **Return focus** - Focus returns to trigger element after close

---

### Spinner

Loading indicator for async operations.

#### Props

```typescript
interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}
```

#### Sizes

```tsx
<Spinner size="sm" /> {/* 16px */}
<Spinner size="md" /> {/* 24px */}
<Spinner size="lg" /> {/* 32px */}
```

#### Variants

**Primary** - Brand color (terracotta)

```tsx
<Spinner variant="primary" size="md" />
```

**Secondary** - Subtle gray

```tsx
<Spinner variant="secondary" size="md" />
```

#### Examples

**Button Loading State**

```tsx
function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    await saveTask();
    setIsLoading(false);
  };

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      {isLoading ? (
        <>
          <Spinner size="sm" variant="primary" />
          Saving...
        </>
      ) : (
        'Save Task'
      )}
    </Button>
  );
}
```

**Full Page Loader**

```tsx
function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size="lg" variant="primary" className="mx-auto mb-4" />
        <p className="text-text-secondary">Loading your tasks...</p>
      </div>
    </div>
  );
}
```

**Card Loading State**

```tsx
<Card padding="lg">
  <div className="flex items-center justify-center py-8">
    <Spinner size="md" variant="primary" />
  </div>
</Card>
```

**Inline Loading**

```tsx
<div className="flex items-center gap-2">
  <Spinner size="sm" variant="secondary" />
  <span className="text-sm text-text-secondary">Syncing...</span>
</div>
```

#### Accessibility

- `role="status"` can be added for screen readers
- Use with `aria-live="polite"` for loading announcements
- Add `aria-busy="true"` to loading sections

```tsx
<div aria-busy="true" aria-live="polite">
  <Spinner size="md" />
  <span>Loading data...</span>
</div>
```

---

### Skeleton

Content placeholder for loading states.

#### Props

```typescript
interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  variant?: 'rectangular' | 'circular' | 'text';
  animate?: boolean;
}
```

#### Base Variants

**Rectangular** - General content

```tsx
<Skeleton variant="rectangular" width="100%" height="200px" />
```

**Circular** - Avatars, icons

```tsx
<Skeleton variant="circular" width={40} height={40} />
```

**Text** - Text lines

```tsx
<Skeleton variant="text" width="100%" />
<Skeleton variant="text" width="80%" />
```

#### Composite Components

**SkeletonCard** - Card-shaped placeholder

```tsx
import { SkeletonCard } from '@/components/ui/Skeleton';

<SkeletonCard />;
```

**SkeletonList** - List-shaped placeholder

```tsx
import { SkeletonList } from '@/components/ui/Skeleton';

<SkeletonList count={5} />;
```

#### Examples

**Task List Loading**

```tsx
function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return <SkeletonList count={5} />;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
}
```

**Profile Loading**

```tsx
function ProfileCard() {
  const [user, setUser] = useState(null);

  if (!user) {
    return (
      <Card padding="md">
        <div className="flex items-center gap-4">
          <Skeleton variant="circular" width={64} height={64} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      </Card>
    );
  }

  return <UserProfile user={user} />;
}
```

**Article Loading**

```tsx
function Article() {
  const [article, setArticle] = useState(null);

  if (!article) {
    return (
      <article>
        <Skeleton variant="rectangular" width="100%" height={300} className="mb-6" />
        <Skeleton variant="text" width="80%" className="mb-4 h-8" />
        <div className="space-y-2">
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="100%" />
          <Skeleton variant="text" width="90%" />
        </div>
      </article>
    );
  }

  return <ArticleContent article={article} />;
}
```

**Dashboard Loading**

```tsx
function Dashboard() {
  const [stats, setStats] = useState(null);

  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return <DashboardStats stats={stats} />;
}
```

**Disable Animation**

```tsx
// For users who prefer reduced motion
<Skeleton variant="text" width="100%" animate={false} />
```

#### Accessibility

- Use `aria-busy="true"` on loading containers
- Add `aria-live="polite"` for status announcements
- Respect `prefers-reduced-motion` for accessibility

```tsx
<div aria-busy="true" aria-live="polite">
  <SkeletonList count={3} />
  <p className="sr-only">Loading tasks...</p>
</div>
```

---

## Accessibility

All components follow WCAG 2.1 AA guidelines:

### Keyboard Navigation

- **Tab** - Move focus between interactive elements
- **Enter/Space** - Activate buttons and links
- **Escape** - Close modals and dropdowns
- **Arrow Keys** - Navigate within components (where applicable)

### Focus Indicators

All interactive elements have visible focus states:

```css
/* Warm primary color ring */
focus-visible:outline-2
focus-visible:outline-offset-2
focus-visible:outline-focus-ring
```

### Screen Reader Support

- Semantic HTML elements
- ARIA labels and roles
- Live regions for dynamic content
- Error announcements

### Color Contrast

All text and UI elements meet WCAG AA contrast ratios:

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Reduced Motion

Respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  /* Disable or simplify animations */
}
```

---

## Theming

### Custom Colors

Override theme colors in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: '#YOUR_COLOR',
        light: '#YOUR_LIGHT_COLOR',
        dark: '#YOUR_DARK_COLOR',
      },
      // ... other colors
    },
  },
}
```

### Custom Spacing

Adjust spacing scale:

```typescript
theme: {
  extend: {
    spacing: {
      4: '4px',
      8: '8px',
      // ... customize values
    },
  },
}
```

### Custom Animation Timing

Adjust transition durations:

```typescript
theme: {
  extend: {
    transitionDuration: {
      150: '150ms',
      200: '200ms',
      // ... customize values
    },
  },
}
```

---

## Best Practices

### Component Composition

Combine components for complex UIs:

```tsx
<Card padding="md" hover>
  <div className="flex items-center gap-3">
    <input type="checkbox" />
    <div className="flex-1">
      <h3 className="font-semibold">Task Title</h3>
      <p className="text-sm text-text-secondary">Description</p>
    </div>
    <Button variant="ghost" size="sm">
      <EditIcon />
    </Button>
  </div>
</Card>
```

### Loading States

Always show loading feedback:

```tsx
function TaskList() {
  const { tasks, loading, error } = useTasks();

  if (loading) return <SkeletonList count={5} />;
  if (error) return <ErrorState error={error} />;
  if (tasks.length === 0) return <EmptyState />;

  return tasks.map((task) => <TaskCard key={task.id} task={task} />);
}
```

### Error Handling

Provide clear error messages:

```tsx
<Input label="Email" error={errors.email} aria-invalid={!!errors.email} />
```

### Responsive Design

Use responsive props:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card padding="md">...</Card>
  <Card padding="md">...</Card>
  <Card padding="md">...</Card>
</div>
```

---

## Troubleshooting

### Styles Not Applying

1. Check Tailwind class names are correct
2. Ensure content paths in `tailwind.config.ts` include your files
3. Run `npm run build` to regenerate CSS

### TypeScript Errors

1. Ensure `@/components/ui/*` is in your `tsconfig.json` paths
2. Check prop types match the interface
3. Use `// @ts-ignore` sparingly and report the issue

### Accessibility Issues

1. Test with keyboard only (no mouse)
2. Use screen reader (NVDA, JAWS, VoiceOver)
3. Check contrast with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
4. Validate with [axe DevTools](https://www.deque.com/axe/devtools/)

---

## Contributing

When adding new components:

1. **Follow the pattern** - Use existing components as templates
2. **TypeScript first** - Full type safety
3. **Accessibility required** - Test with keyboard and screen reader
4. **Document props** - JSDoc comments for all props
5. **Multiple examples** - Show various use cases
6. **Responsive by default** - Mobile-first approach
7. **Themed colors** - Use Claude theme colors
8. **Consistent spacing** - Follow 4px grid
9. **Smooth animations** - 200ms default duration
10. **Test thoroughly** - Edge cases and error states

---

## Resources

- [Design Rules](./DESIGN_RULES_CLAUDE_STYLE.md) - Complete design system documentation
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework
- [React Docs](https://react.dev/) - React documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/) - ARIA patterns

---

**Last Updated:** February 2026
**Version:** 1.0.0
**Maintained by:** TickTick Clone Team
