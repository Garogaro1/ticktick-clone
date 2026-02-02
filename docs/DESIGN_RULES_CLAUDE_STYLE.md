# Design Rules: Claude Code Inspired Warm Minimalist Design

## 📐 Core Design Philosophy

Based on research into Claude's design approach and 2025-2026 UX trends.

### 1. Speed as a Design Principle
> "Design something? Ship it." - Claude Design Team

**Rules:**
- ✅ **Prototype through real interaction**, not Figma perfection
- ✅ **Iterate in code**, not mockups
- ✅ **Design for unpredictable systems** (AI doesn't behave the same way twice)
- ✅ **Rough enough to get into code quickly**
- ✅ **Static mockups don't cut it** - design through live iteration

**Why:** Claude's designer Kyle Turman learned that designing for AI requires real interaction testing, not static mockups. You discover the right design by USING it, not perfecting it in Figma.

---

## 🎨 Color Psychology: Warm & Inviting

### Why Beige/Cream Palette?

From color psychology research:
- **Beige evokes**: Calmness, simplicity, elegance
- **Cream creates**: Warm, inviting spaces
- **Warm tones**: Build trust faster than cold blue/gray
- **Result**: Users feel "at home," not in a sterile tool

### Color Selection Rules

**1. Base Colors (70% of interface)**
```css
Background: #FCFBF9  /* Warm off-white - reduces eye strain */
Secondary:  #F5F3EF  /* Slightly darker - subtle contrast */
Cards:      #FFFFFF  /* Pure white - content focus */
```

**2. Accent Colors (20% of interface)**
```css
Primary:    #D97757  /* Warm terracotta - action without aggression */
Highlight:  #E8B4A3  /* Soft coral - hover states */
```

**3. Text Colors (10% of interface)**
```css
Primary:   #2D2A26  /* Warm dark gray - not harsh black */
Secondary: #6B665F  /* Muted - guides eye gently */
Tertiary:  #9A958C  /* Subtle - metadata, dates */
```

**Color Selection Checklist:**
- ✅ No pure black (#000000) - too harsh
- ✅ No pure blue (#0000FF) - feels cold/corporate
- ✅ All colors have warm undertone (slight yellow/brown)
- ✅ Pass WCAG AA contrast (4.5:1 minimum)
- ✅ Test with color blindness simulators

---

## ✨ Micro-Interaction Rules (2026 Best Practices)

Based on research: Micro-interactions boost retention by **400%**.

### The 4 Parts of Every Micro-Interaction

From Dan Saffer's framework:

**1. Trigger** - What starts it?
- User hover, click, focus, scroll
- System event (data loaded, error occurred)

**2. Rules** - How does it behave?
- What happens during interaction
- Duration, easing, sequence

**3. Feedback** - What does user see/hear/feel?
- Visual change (color, size, position)
- Audio (subtle click, success chime)
- Haptic (vibration on mobile)

**4. Loops/Modes** - What happens over time?
- One-time (button click)
- Repeating (loading spinner)
- Long-term (onboarding progress)

### Animation Timing Rules

```css
/* Fast Interactions (immediate feedback) */
Checkbox check:        150ms  /* Feels instant */
Button hover:          200ms  /* Noticeable but not slow */
Toggle switch:         200ms  /* Physical feel */

/* Normal Interactions (state changes) */
Modal open:            200ms  /* Respectful of user time */
Toast slide-in:        300ms  /* Doesn't interrupt focus */
Page load fade-in:     300ms  /* Smooth, not sluggish */

/* Slow Interactions (complex changes) */
Task complete strike:  300ms  /* Satisfying completion */
Multi-step wizard:     400ms  /* Clears mental model */
```

**Easing Functions:**
```css
/* Default (most interactions) */
ease-out: cubic-bezier(0, 0, 0.2, 1)  /* Decelerate - natural */

/* Enter animations (elements appear) */
ease-out: cubic-bezier(0, 0, 0.2, 1)  /* Fast start, slow end */

/* Exit animations (elements disappear) */
ease-in: cubic-bezier(0.4, 0, 1, 1)   /* Slow start, fast end */

/* Bouncy (playful moments) */
ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### Micro-Interaction Examples

**Checkbox Task Complete:**
```css
/* Visual sequence (300ms total) */
0ms:   Scale down (0.95) + shadow reduces
100ms: Checkmark animates in (stroke-dashoffset)
200ms: Background fills (warm green)
300ms: Task title strikes through + fades (opacity 0.5)
```

**Button Hover:**
```css
/* Subtle lift (200ms) */
transform: translateY(-2px);
box-shadow: 0 6px 16px rgba(217, 119, 87, 0.15);
```

**Task Add Animation:**
```css
/* Staggered list entry */
.task-item {
  animation: slideIn 300ms ease-out;
}
.task-item:nth-child(1) { animation-delay: 0ms; }
.task-item:nth-child(2) { animation-delay: 50ms; }
.task-item:nth-child(3) { animation-delay: 100ms; }
```

### Micro-Interaction Checklist

- ✅ **Purpose first** - Does it aid understanding?
- ✅ **Subtle, not distracting** - Shouldn't interrupt focus
- ✅ **Fast enough to feel responsive** - Under 300ms
- ✅ **Slow enough to notice** - Over 100ms
- ✅ **Consistent easing** - Don't mix multiple easing functions
- ✅ **Respect prefers-reduced-motion** - Disable for accessibility

---

## 🎯 Design Principles from 2026 Trends

### 1. Design for Intent, Not Just Actions

**Traditional:**
```
User clicks button → System responds
```

**Intent-Based Design (2026):**
```
User shows intent → System anticipates → Guides to completion
```

**Example:**
- User types "Meeting tomorrow" in task input
- System highlights "tomorrow" as date
- Shows mini calendar tooltip
- User presses Enter → Task created with correct date

### 2. Exercise Restraint (Dan Saffer's Rule)

> "Microinteractions are an exercise in restraint, in doing as much as possible with as little as possible."

**Rules:**
- ✅ One micro-interaction per action (not competing animations)
- ✅ Animations should feel inevitable, not surprising
- ✅ Remove, don't add (every animation must justify its existence)

### 3. Emotional Design Over Functional Design

**Research shows:** Users make decisions in 50ms based on visual design alone.

**Warm Design Creates:**
- Trust (warm colors = approachable)
- Calm (beige/cream = reduces anxiety)
- Safety (no harsh contrasts = feels stable)

**Cold Design Creates:**
- Distance (blue/gray = corporate)
- Alert (high contrast = feels urgent)
- Stress (harsh blacks = eye fatigue)

### 4. Tactile, Human, Emotionally Resonant

From 2025 design trend research:

> "As AI tools become more sophisticated, we're seeing a hunger for interfaces that feel more human, more tactile, and more emotionally resonant."

**Implementation:**
- ✅ Soft shadows (not harsh black drops)
- ✅ Rounded corners (feels friendly, not sharp)
- ✅ Warm gradients (subtle depth)
- ✅ Organic motion (not linear robotic movement)

---

## 📐 Layout & Spacing Rules

### The 4px Grid System

All spacing should be multiples of 4px:

```css
4px  - Tight spacing (icon padding, badge padding)
8px  - Small spacing (button padding, list items)
12px - Medium spacing (form field padding)
16px - Base spacing (section margins)
24px - Large spacing (card gaps)
32px - XL spacing (page margins)
48px - XXL spacing (major sections)
```

**Why:** Creates visual rhythm and consistency.

### Visual Hierarchy Rules

**1. Size Hierarchy**
```css
Headlines:  24-32px  /* Primary focus */
Subheads:   18-20px  /* Secondary focus */
Body:       16px     /* Readable content */
Captions:   14px     Supporting info
```

**2. Weight Hierarchy**
```css
Bold (700):      Titles, actions
Semibold (600):  Emphasized text
Medium (500):    Subtitles
Regular (400):   Body text
```

**3. Color Hierarchy**
```css
Primary text:   #2D2A26  /* Highest contrast */
Secondary text: #6B665F  /* Medium contrast */
Tertiary text:  #9A958C  /* Lowest contrast */
```

**Hierarchy Checklist:**
- ✅ One clear focal point per screen
- ✅ Most important action = most prominent
- ✅ Secondary actions = less prominent
- ✅ Use size, weight, color together (not just one)

---

## 🔤 Typography Rules

### Font Selection

**Primary:** Inter (or system UI fonts)
- Clean, modern, highly legible
- Designed for screens
- Variable weight support

**Monospace:** JetBrains Mono (for code/technical)
- Clear character distinction
- Ligatures for readability
- Warm, not cold like Fira Code

### Type Scale (Major Third - 1.250)

```css
12px - Captions, metadata
14px - Small text, secondary
16px - Body text (base)
20px - Subheadings
24px - Headings
30px - Large headings
38px - Hero text
```

**Line Height Rules:**
```css
Body text:     1.5 (150%) - Optimal readability
Headings:      1.25 (125%) - Tighter, more impactful
Captions:      1.4 (140%) - Slightly open
```

**Paragraph Length:**
- ✅ 40-60 characters per line (optimal)
- ✅ Max 75 characters (readability drops after)
- ✅ Min 30 characters (eye returns too frequently)

---

## 🖼️ Component Design Rules

### Button Design

**Primary Button:**
```css
background: var(--color-primary);
color: white;
padding: 10px 20px;
border-radius: 8px;
font-weight: 500;
transition: all 200ms ease-out;
```

**Hover:**
```css
background: var(--color-primary-dark);
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(217, 119, 87, 0.2);
```

**Active:**
```css
transform: translateY(0) scale(0.98);
box-shadow: 0 2px 4px rgba(217, 119, 87, 0.1);
```

### Input Field Design

**Resting State:**
```css
background: white;
border: 1px solid #E5E2DB;
border-radius: 8px;
padding: 12px 16px;
transition: border-color 200ms ease-out;
```

**Focus State:**
```css
border-color: var(--color-primary);
outline: none;
box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.1);
```

**Error State:**
```css
border-color: var(--color-error);
box-shadow: 0 0 0 3px rgba(196, 84, 84, 0.1);
```

### Task Item Design

```css
.task-item {
  background: white;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 16px;
  transition: all 200ms ease-out;
  cursor: pointer;
}

.task-item:hover {
  background: var(--color-bg-secondary);
  border-color: var(--color-border);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--color-text-tertiary);
}
```

---

## 📱 Responsive Design Rules

### Breakpoints (Mobile-First)

```css
/* Mobile (default) */
styles: { }

/* Small tablet */
@media (min-width: 640px) { }

/* Tablet */
@media (min-width: 768px) { }

/* Desktop */
@media (min-width: 1024px) { }

/* Wide desktop */
@media (min-width: 1280px) { }
```

### Mobile Optimization Rules

**1. Touch Targets**
- Minimum 44x44px (iOS guideline)
- Minimum 48x48px (Android guideline)
- 8px spacing between targets

**2. Typography**
- Base 16px minimum (not smaller)
- Line height 1.5 for body text
- Increased contrast for outdoor visibility

**3. Gesture Support**
- Swipe to complete (natural motion)
- Pull to refresh
- Long press for context menu
- Pinch to zoom (disabled by default, enable for images)

---

## ♿ Accessibility Rules (WCAG 2.1 AA)

### Color Contrast

**Minimum Ratios:**
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

**Testing:**
```bash
# Use these tools
npm install -D pa11y
npm install -D axe-core
```

### Keyboard Navigation

**Rules:**
- ✅ All features accessible via keyboard
- ✅ Visible focus indicators (warm primary ring)
- ✅ Logical tab order (left-to-right, top-to-bottom)
- ✅ Skip to main content link
- ✅ Escape key closes modals/menus

### Screen Reader Support

**ARIA Labels:**
```html
<button aria-label="Complete task: Finish proposal">
  ✓
</button>

<div role="checkbox" aria-checked="false">
  Task item
</div>
```

**Live Regions:**
```html
<div aria-live="polite" aria-atomic="true">
  Task completed successfully
</div>
```

---

## 🚀 Performance Rules

### Animation Performance

**Use These Properties:**
```css
transform: translate() scale() rotate()  /* GPU accelerated */
opacity                                    /* GPU accelerated */
filter: blur()                            /* GPU accelerated */
```

**Avoid These Properties:**
```css
width, height        /* Triggers reflow */
left, top, bottom, right  /* Triggers reflow */
margin, padding      /* Triggers reflow */
```

**Will-Change Hint:**
```css
.button:hover {
  will-change: transform, opacity;
}
```

### Load Performance

**Rules:**
- ✅ First paint < 1.5s
- ✅ First contentful paint < 2s
- ✅ Time to interactive < 3.5s
- ✅ Cumulative layout shift < 0.1

**Techniques:**
```html
<!-- Critical CSS inline -->
<style>
  /* Above-fold styles */
</style>

<!-- Defer non-critical CSS -->
<link rel="preload" href="styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">

<!-- Lazy load images -->
<img loading="lazy" src="image.jpg" />
```

---

## 📚 Design Tokens File Structure

```
styles/
├── tokens/
│   ├── colors.css          /* All color variables */
│   ├── typography.css      /* Fonts, sizes, line heights */
│   ├── spacing.css         /* 4px grid scale */
│   ├── shadows.css         /* Shadow definitions */
│   ├── radius.css          /* Border radius values */
│   └── animation.css       /* Durations, easing functions */
├── base/
│   ├── reset.css           /* Modern CSS reset */
│   └── base.css            /* HTML element defaults */
├── components/
│   ├── buttons.css
│   ├── inputs.css
│   ├── cards.css
│   ├── task-item.css
│   └── modals.css
└── utilities/
    ├── display.css         /* Flex, grid utilities */
    ├── text.css            /* Alignment, weights */
    └── spacing.css         /* Margin, padding utilities */
```

---

## ✅ Design Review Checklist

Before shipping any feature, verify:

**Visual Design:**
- [ ] Uses warm color palette (no harsh blacks/blues)
- [ ] Consistent 4px grid spacing
- [ ] Clear visual hierarchy (one focal point)
- [ ] Appropriate contrast ratios (4.5:1 minimum)

**Micro-interactions:**
- [ ] Animations are 150-300ms (not too fast/slow)
- [ ] Easing functions are consistent
- [ ] Interactions feel inevitable, not surprising
- [ ] Supports prefers-reduced-motion

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Focus indicators visible
- [ ] Color contrast passes WCAG AA

**Performance:**
- [ ] Animations use GPU-accelerated properties
- [ ] First paint under 1.5s
- [ ] No layout shifts
- [ ] Lazy loading implemented

**Emotional Design:**
- [ ] Interface feels warm, not sterile
- [ ] Error states are helpful, not blaming
- [ ] Success states celebrate achievements
- [ ] User feels capable, not confused

---

**Last Updated:** February 2026
**Sources:**
- Claude Design Team philosophy
- 2026 UX trends research
- Color psychology studies
- Micro-interaction best practices
- WCAG 2.1 accessibility guidelines
