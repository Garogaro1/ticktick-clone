# Analytics Events Documentation

## Overview

This document describes the analytics system for the TickTick clone application, including event naming conventions, planned analytics events, and usage examples.

### Analytics System

The analytics system is currently implemented as a **placeholder** that respects the feature flag configuration. This allows for:

- **Feature Flag Control**: Analytics can be enabled/disabled via `NEXT_PUBLIC_ANALYTICS_ENABLED`
- **Privacy-First Approach**: No tracking is sent unless explicitly enabled
- **Future-Ready**: Easy to integrate with analytics providers (Google Analytics, Plausible, PostHog, etc.)
- **Development Safety**: Analytics don't fire during development unless enabled

### Current Implementation

The analytics utility is located at `src/lib/analytics.ts` (planned for Task 1.22) and provides:

```typescript
import { trackEvent, trackPageView } from '@/lib/analytics';
```

**Important**: Analytics functions are no-ops when `NEXT_PUBLIC_ANALYTICS_ENABLED=false` (default).

---

## Event Naming Conventions

All analytics events follow a consistent naming pattern to ensure data quality and easy analysis.

### Format: `[category]_[action]_[object]`

### Categories

- **task**: Task-related actions
- **list**: List/folder-related actions
- **tag**: Tag-related actions
- **view**: Page/view navigation
- **user**: User account actions
- **search**: Search and filtering
- **calendar**: Calendar interactions
- **pomodoro**: Timer sessions
- **habit**: Habit tracking
- **goal**: Goal-related actions

### Actions

- **create**: Created something new
- **update**: Modified existing item
- **delete**: Removed/deleted
- **complete**: Marked as done
- **uncomplete**: Marked as undone
- **view**: Viewed/opened
- **click**: Clicked/tapped
- **filter**: Applied filter
- **sort**: Changed sort order
- **drag**: Dragged and dropped
- **start**: Started something
- **stop**: Stopped something
- **pause**: Paused something
- **resume**: Resumed something

### Objects

- **task**: Single task
- **list**: Task list
- **tag**: Tag
- **habit**: Habit
- **goal**: Goal
- **timer**: Pomodoro timer
- **calendar**: Calendar view
- **modal**: Dialog/modal window
- **button**: Button click
- **filter**: Filter criteria

### Examples

- `task_create_task` - User created a new task
- `task_complete_task` - User completed a task
- `list_create_list` - User created a new list
- `view_view_calendar` - User opened calendar view
- `pomodoro_start_timer` - User started Pomodoro timer
- `filter_apply_priority` - User applied priority filter

---

## Planned Analytics Events

### Task Events

| Event Name             | Description                  | Properties                                            | Phase |
| ---------------------- | ---------------------------- | ----------------------------------------------------- | ----- |
| `task_create_task`     | User created a new task      | `list_id`, `has_due_date`, `has_priority`, `has_tags` | 6     |
| `task_update_task`     | User edited a task           | `task_id`, `changed_fields`                           | 6     |
| `task_delete_task`     | User deleted a task          | `task_id`, `list_id`                                  | 6     |
| `task_complete_task`   | User completed a task        | `task_id`, `list_id`, `days_overdue`                  | 6     |
| `task_uncomplete_task` | User marked task incomplete  | `task_id`, `list_id`                                  | 6     |
| `task_create_subtask`  | User created a subtask       | `parent_task_id`, `list_id`                           | 6     |
| `task_set_priority`    | User changed task priority   | `task_id`, `old_priority`, `new_priority`             | 6     |
| `task_set_due_date`    | User set/changed due date    | `task_id`, `has_time`, `is_recurring`                 | 12    |
| `task_add_tag`         | User added a tag to task     | `task_id`, `tag_id`                                   | 9     |
| `task_remove_tag`      | User removed a tag from task | `task_id`, `tag_id`                                   | 9     |

### List Events

| Event Name         | Description              | Properties                  | Phase |
| ------------------ | ------------------------ | --------------------------- | ----- |
| `list_create_list` | User created a new list  | `list_type` (inbox/custom)  | 7     |
| `list_update_list` | User edited list details | `list_id`, `changed_fields` | 7     |
| `list_delete_list` | User deleted a list      | `list_id`, `task_count`     | 7     |
| `list_view_list`   | User opened a list       | `list_id`, `task_count`     | 8     |
| `list_set_default` | User set list as default | `list_id`                   | 8     |

### Tag Events

| Event Name          | Description            | Properties                 | Phase |
| ------------------- | ---------------------- | -------------------------- | ----- |
| `tag_create_tag`    | User created a new tag | `has_color`                | 9     |
| `tag_update_tag`    | User edited tag        | `tag_id`, `changed_fields` | 9     |
| `tag_delete_tag`    | User deleted a tag     | `tag_id`, `usage_count`    | 9     |
| `tag_filter_by_tag` | User filtered by tag   | `tag_id`                   | 9     |

### View & Navigation Events

| Event Name           | Description                      | Properties                         | Phase |
| -------------------- | -------------------------------- | ---------------------------------- | ----- |
| `view_view_list`     | User switched to list view       | `list_id`                          | 6     |
| `view_view_calendar` | User opened calendar             | `view_type` (monthly/weekly/daily) | 13    |
| `view_view_kanban`   | User opened Kanban board         | `group_by`                         | 15    |
| `view_view_matrix`   | User opened Eisenhower matrix    | -                                  | 16    |
| `view_navigate_date` | User navigated to different date | `direction`, `view_type`           | 13    |

### Search & Filter Events

| Event Name                   | Description                | Properties                              | Phase |
| ---------------------------- | -------------------------- | --------------------------------------- | ----- |
| `search_perform_search`      | User performed a search    | `query_length`, `has_filters`           | 10    |
| `filter_apply_smart_list`    | User selected a smart list | `smart_list_type` (today/tomorrow/week) | 10    |
| `filter_apply_custom_filter` | User applied custom filter | `filter_criteria`                       | 10    |
| `filter_save_filter`         | User saved a custom filter | `filter_name`                           | 10    |
| `sort_change_sort`           | User changed sort order    | `sort_by`, `sort_direction`             | 11    |

### Calendar Events

| Event Name             | Description                   | Properties                | Phase |
| ---------------------- | ----------------------------- | ------------------------- | ----- |
| `calendar_change_view` | User changed calendar view    | `old_view`, `new_view`    | 13    |
| `calendar_drag_task`   | User dragged task to new date | `task_id`, `days_changed` | 13    |
| `calendar_click_date`  | User clicked on a date        | `date`, `has_tasks`       | 13    |

### Pomodoro Timer Events

| Event Name                  | Description                       | Properties                   | Phase |
| --------------------------- | --------------------------------- | ---------------------------- | ----- |
| `pomodoro_start_timer`      | User started Pomodoro timer       | `duration`, `linked_task_id` | 22    |
| `pomodoro_pause_timer`      | User paused the timer             | `elapsed_time`               | 22    |
| `pomodoro_resume_timer`     | User resumed the timer            | `elapsed_time`               | 22    |
| `pomodoro_complete_session` | User completed a Pomodoro session | `duration`, `was_productive` | 22    |
| `pomodoro_skip_break`       | User skipped break                | `sessions_completed`         | 22    |

### Habit Tracker Events

| Event Name             | Description                        | Properties                  | Phase |
| ---------------------- | ---------------------------------- | --------------------------- | ----- |
| `habit_create_habit`   | User created a new habit           | `frequency`, `has_reminder` | 23    |
| `habit_complete_habit` | User marked habit complete for day | `habit_id`, `streak_length` | 23    |
| `habit_miss_habit`     | User missed habit for a day        | `habit_id`, `streak_length` | 23    |
| `habit_view_calendar`  | User opened habit calendar         | `habit_id`                  | 23    |

### Goal Events

| Event Name             | Description                | Properties                      | Phase |
| ---------------------- | -------------------------- | ------------------------------- | ----- |
| `goal_create_goal`     | User created a new goal    | `target_type`, `deadline`       | 24    |
| `goal_update_progress` | User updated goal progress | `goal_id`, `progress_percent`   | 24    |
| `goal_complete_goal`   | User completed a goal      | `goal_id`, `linked_tasks_count` | 24    |
| `goal_link_task`       | User linked task to goal   | `goal_id`, `task_id`            | 24    |

### User Account Events

| Event Name             | Description                   | Properties         | Phase |
| ---------------------- | ----------------------------- | ------------------ | ----- |
| `user_register`        | User created an account       | `signup_method`    | 3     |
| `user_login`           | User logged in                | `login_method`     | 3     |
| `user_logout`          | User logged out               | -                  | 3     |
| `user_update_profile`  | User updated profile settings | `changed_fields`   | 3     |
| `user_update_settings` | User changed app settings     | `setting_category` | 3     |

---

## Page View Tracking

Page views are automatically tracked when the analytics feature is enabled.

### Page View Format

```typescript
trackPageView(path: string, properties?: Record<string, any>)
```

### Tracked Pages

| Page              | Route        | Properties              | Phase |
| ----------------- | ------------ | ----------------------- | ----- |
| Home              | `/`          | -                       | 1     |
| Dashboard         | `/dashboard` | -                       | 6     |
| Calendar          | `/calendar`  | `view` (month/week/day) | 13    |
| Kanban            | `/kanban`    | `group_by`              | 15    |
| Eisenhower Matrix | `/matrix`    | -                       | 16    |
| Habits            | `/habits`    | -                       | 23    |
| Goals             | `/goals`     | -                       | 24    |
| Settings          | `/settings`  | `tab`                   | 3     |

### Example

```typescript
// Track page view
trackPageView('/calendar', { view: 'month' });
```

---

## Usage Examples

### Basic Event Tracking

```typescript
import { trackEvent } from '@/lib/analytics';

// Track task creation
trackEvent('task_create_task', {
  list_id: 'inbox',
  has_due_date: true,
  has_priority: true,
  has_tags: false,
});

// Track task completion
trackEvent('task_complete_task', {
  task_id: 'task_123',
  list_id: 'inbox',
  days_overdue: 0,
});
```

### Page View Tracking

```typescript
import { trackPageView } from '@/lib/analytics';

// Track page view with properties
trackPageView('/calendar', {
  view: 'month',
  task_count: 15,
});

// Track simple page view
trackPageView('/settings');
```

### Conditional Tracking Based on Feature Flag

```typescript
import { env } from '@/lib/env';

// Only track if analytics is enabled
if (env.features.analytics) {
  trackEvent('user_custom_action', {
    /* properties */
  });
}
```

### Tracking in React Components

```typescript
'use client';

import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui';

export function CreateTaskButton() {
  const handleClick = () => {
    // Track the button click
    trackEvent('task_click_create_button', {
      location: 'header',
      list_id: 'inbox',
    });

    // Your create task logic...
  };

  return <Button onClick={handleClick}>Create Task</Button>;
}
```

### Tracking API Calls

```typescript
// In an API route or server action
import { trackEvent } from '@/lib/analytics';

export async function createTask(data: TaskData) {
  const task = await db.task.create({ data });

  // Track the creation
  trackEvent('task_create_task', {
    list_id: data.listId,
    has_due_date: !!data.dueDate,
    has_priority: !!data.priority,
    has_tags: data.tags?.length > 0,
  });

  return task;
}
```

---

## Privacy & Data Collection

### Privacy-First Design

- **Opt-In Only**: Analytics are disabled by default (`NEXT_PUBLIC_ANALYTICS_ENABLED=false`)
- **No PII**: No personally identifiable information is collected
- **No IP Logging**: IP addresses are not stored
- **No Session Recording**: No user sessions are recorded

### Data Collected

When analytics are enabled, the following **anonymous** data may be collected:

- Event names and types
- Anonymous user IDs (random UUID, no personal info)
- Feature usage patterns (what features are used)
- Performance metrics (page load times, etc.)
- Error occurrences (for debugging)

### Data NOT Collected

- User names or emails
- Task content or titles
- List names
- IP addresses
- Device fingerprints
- Location data

---

## Implementation Status

### Phase 1 (Current)

- ✅ Feature flag infrastructure (`NEXT_PUBLIC_ANALYTICS_ENABLED`)
- ✅ Environment variable validation
- ⏳ Analytics utility placeholder (Task 1.22)
- ⏳ Documentation (this file)

### Future Phases

- Phase 3: User account events (register, login, logout)
- Phase 6: Task CRUD events
- Phase 7: List management events
- Phase 9: Tag events
- Phase 10: Search and filter events
- Phase 13: Calendar view events
- Phase 15: Kanban board events
- Phase 16: Eisenhower matrix events
- Phase 22: Pomodoro timer events
- Phase 23: Habit tracker events
- Phase 24: Goal events

---

## Integrating Analytics Providers

### Google Analytics 4

When ready to integrate GA4:

1. Add environment variable: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
2. Install `@next/third-parties/google`
3. Initialize GA4 in `app/layout.tsx`
4. Update `trackEvent()` to use `gtag()`

### Plausible Analytics (Privacy-Friendly)

1. Add environment variable: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`
2. Install Plausible script
3. Update tracking functions

### PostHog (Product Analytics)

1. Add environment variable: `NEXT_PUBLIC_POSTHOG_KEY`
2. Install PostHog provider
3. Update tracking functions with PostHog SDK

---

## Best Practices

### DO

- ✅ Use consistent event naming conventions
- ✅ Send only necessary, non-sensitive data
- ✅ Respect the feature flag in all tracking calls
- ✅ Test analytics with feature flag disabled
- ✅ Document new events in this file
- ✅ Keep properties simple and serializable
- ✅ Use meaningful property names

### DON'T

- ❌ Send personally identifiable information
- ❌ Send task content, titles, or descriptions
- ❌ Track user keystrokes or inputs
- ❌ Send IP addresses or location data
- ❌ Track without feature flag check
- ❌ Over-track (track meaningful actions only)
- ❌ Send complex objects as properties

---

## Testing Analytics

### Test with Feature Flag Disabled (Default)

```typescript
// analytics should be no-ops
trackEvent('test_event', { test: true });
// Nothing should be sent
```

### Test with Feature Flag Enabled

```bash
# .env.local
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

```typescript
// Events should be tracked
trackEvent('test_event', { test: true });
// Check console or network tab for tracking calls
```

### Validation

To verify analytics are working:

1. Enable analytics feature flag
2. Open browser DevTools → Network tab
3. Trigger an event (e.g., create a task)
4. Check for analytics requests in network tab
5. Verify event name and properties are correct

---

## Maintenance

### Adding New Events

When adding new analytics events:

1. Follow naming conventions: `[category]_[action]_[object]`
2. Add event to this documentation with table row
3. Define required and optional properties
4. Implement tracking call in relevant code
5. Test with feature flag enabled/disabled
6. Update IMPLEMENTATION_PLAN.md task checklist

### Removing Events

When removing analytics events:

1. Remove tracking calls from code
2. Update this documentation (mark as deprecated or remove)
3. Document reason for removal
4. Consider data retention policies

---

## Related Files

- `src/lib/analytics.ts` - Analytics utility (planned for Task 1.22)
- `src/lib/env.ts` - Environment variables and feature flags
- `.env.local.example` - Environment variable template
- `IMPLEMENTATION_PLAN.md` - Task 1.22 (Configure Analytics)

---

## Questions or Issues?

If you have questions about analytics or need to add new events:

1. Check if the event already exists in this document
2. Follow the naming conventions
3. Document the event here before implementing
4. Test with feature flag both enabled and disabled
5. Update AGENTS.md with any new patterns

---

**Last Updated:** 2026-02-02
**Status:** Phase 1 - Infrastructure Setup
**Feature Flag:** `NEXT_PUBLIC_ANALYTICS_ENABLED` (default: false)
