# 🚀 TickTick Clone - Ralph Autonomous Development

## Что это?

**Полный клон TickTick** с **автономной разработкой** через Ralph Wiggum loop.

**Что делает Ralph:**
- Читает план из `docs/plans/`
- Выполняет задачи САМ (без твоего участия)
- Коммитит после каждой задачи
- Работает часами автономно
- Создаёт готовое приложение

---

## 📁 Структура проекта

```
ticktick-clone/
├── docs/
│   ├── TICKTICK_FEATURES_COMPLETE.md    /* ВСЕ 150+ функций TickTick */
│   ├── DESIGN_RULES_CLAUDE_STYLE.md     /* Правила дизайна в стиле Claude */
│   └── plans/
│       └── phase-1-core-tasks.md        /* План Phase 1 (12 задач) */
├── start-ralph.bat                       /* One-click launcher */
└── README.md
```

---

## 🎯 Полный список функций (150+ features)

Смотри [TICKTICK_FEATURES_COMPLETE.md](docs/TICKTICK_FEATURES_COMPLETE.md):

### 10 фаз разработки:
1. ✅ **Foundation** - Setup, инфраструктура
2. ✅ **Core Tasks** - Базовое управление задачами
3. ✅ **Organization** - Lists, Tags, Filters, Subtasks
4. ✅ **Advanced Views** - Calendar, Kanban, Timeline, Eisenhower
5. ✅ **Reminders** - Все типы напоминаний
6. ✅ **Productivity** - Pomodoro, Habits
7. ✅ **Collaboration** - Sharing, assignments
8. ✅ **Integrations** - Calendar sync, email, widgets
9. ✅ **Advanced** - NLP, Voice, Search
10. ✅ **Polish** - Performance, UX

---

## 🎨 Дизайн система (Claude Code style)

Смотри [DESIGN_RULES_CLAUDE_STYLE.md](docs/DESIGN_RULES_CLAUDE_STYLE.md):

### Ключевые принципы:
- ✅ **Warm minimalism** - кремовые/бежевые тона
- ✅ **Speed as design principle** - прототипируй в коде
- ✅ **Micro-interactions** - анимации 150-300ms
- ✅ **Emotional design** - тёплый, дружелюбный интерфейс
- ✅ **Accessibility** - WCAG 2.1 AA

### Цветовая палитра:
```css
Background: #FCFBF9  /* Тёплый крем */
Primary:    #D97757  /* Терракота */
Text:       #2D2A26  /* Тёплый серый (не чёрный!) */
```

---

## 🚀 Быстрый старт

### Вариант 1: One-click launcher (проще)

Двойной клик на:
```
start-ralph.bat
```

Ralph начнёт работать САМ над Phase 1 (12 задач).

### Вариант 2: Запуск через терминал

```bash
cd C:\AITEST\ticktick-clone
claude
```

Внутри Claude Code:
```
/ralph-wiggum:ralph-loop "Read docs/plans/phase-1-core-tasks.md and execute ALL tasks..." --completion-promise "ALL 12 TASKS COMPLETED AND TESTS PASS" --max-iterations 100
```

---

## 👀 Как мониторить прогресс

**Открой другую консоль** и выполни:

```powershell
# Смотри состояние в реальном времени
Get-Content .claude\ralph-loop.local.md -Wait
```

**Что увидишь:**
```
---
active: true
iteration: 7
max_iterations: 100
completion_promise: "ALL 12 TASKS COMPLETED AND TESTS PASS"
started_at: "2026-02-02T14:30:00Z"
---
```

---

## 🛑 Как остановить Ralph

**В Claude Code:**
```
/ralph-wiggum:cancel-ralph
```

**Или удали файл состояния:**
```powershell
Remove-Item .claude\ralph-loop.local.md
```

---

## 📋 Phase 1: Core Task Management (12 задач)

**Что будет создано:**

1. ✅ **Project Setup** - Next.js 15, Tailwind, Prisma
2. ✅ **Database Schema** - User, Task, List модели
3. ✅ **Authentication** - NextAuth.js
4. ✅ **Task API** - CRUD операции
5. ✅ **List API** - CRUD операции
6. ✅ **Task UI** - список, чекбоксы, модалы
7. ✅ **Task Properties** - due date, priority, list
8. ✅ **Lists UI** - сайдбар, навигация
9. ✅ **Filtering & Sorting** - фильтры, сортировка
10. ✅ **Responsive Design** - мобильная версия
11. ✅ **Testing** - unit, integration, E2E тесты
12. ✅ **Polish** - анимации, shortcuts, оптимизация

**Результат:** Полностью рабочее MVP приложение для управления задачами.

**Время:** 2-6 часов автономной работы.

---

## 🔧 Требования

### Обязательно:
- ✅ Windows 10/11
- ✅ Claude Code CLI (уже установлен: v2.0.55)
- ✅ Ralph Wiggum Windows plugin (уже установлен)

### Будет установлено автоматически:
- Node.js 20+
- PostgreSQL (или SQLite для разработки)
- Python (для тестов)

---

## 📊 Технический стек

### Frontend:
- **Framework:** Next.js 15 (React 19)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (warm theme)
- **State:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Calendar:** FullCalendar
- **Kanban:** @dnd-kit/core
- **Rich Text:** Tiptap (Markdown)

### Backend:
- **API:** Next.js API Routes (tRPC)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js
- **File Storage:** Cloudflare R2
- **Real-time:** Pusher
- **Queue:** BullMQ (Redis)

### Mobile:
- **Framework:** React Native (Expo)
- **Navigation:** Expo Router

### Desktop:
- **Framework:** Tauri (или Electron)

---

## 🎯 Что будет в финале

### Phase 1 (сейчас):
✅ Task management
✅ Lists
✅ Basic filtering
✅ Responsive UI
✅ Authentication

### Phase 2-10 (потом):
📅 Calendar views
📊 Kanban board
📈 Eisenhower Matrix
⏱️ Pomodoro timer
💪 Habit tracker
🔔 All reminder types
👥 Collaboration
🔌 Integrations
🗣️ NLP input
📱 Mobile apps
💻 Desktop apps

---

## 📖 Документация

1. **[TICKTICK_FEATURES_COMPLETE.md](docs/TICKTICK_FEATURES_COMPLETE.md)** - Полный список функций (150+ items)
2. **[DESIGN_RULES_CLAUDE_STYLE.md](docs/DESIGN_RULES_CLAUDE_STYLE.md)** - Правила дизайна
3. **[docs/plans/phase-1-core-tasks.md](docs/plans/phase-1-core-tasks.md)** - План Phase 1

---

## 🤔 Частые вопросы

### Ralph работает сам?
**Да!** Ralph запускает Claude Code, тот выполняет задачу, закрывается, Ralph перезапускает его для следующей задачи. Полная автономность.

### Сколько времени займёт Phase 1?
**2-6 часов** зависимости от сложности задач и скорости API.

### Могу ли я остановить и продолжить позже?
**Да!** Ralph запоминает выполненные задачи (отмечает `- [x]`). Просто перезапусти `start-ralph.bat`.

### Что если Ralph ошибётся?
**Ralph исправит сам!** Задача включает запуск тестов. Если тесты падают — Ralph фиксит и повторяет.

### Нужен ли мне интернет?
**Да** для:
- Claude Code API
- npm install
- git push (опционально)

---

## 🎉 Следующие шаги

### Прямо сейчас:

1. **Открой терминал** в `C:\AITEST\ticktick-clone`
2. **Запусти:** `claude`
3. **Внутри Claude:** `/ralph-wiggum:ralph-loop "Read docs/plans/phase-1-core-tasks.md and execute ALL tasks one by one. For each task: 1) Read the task requirements, 2) Implement the solution, 3) Run validation commands (npm run lint, npm run type-check, npm test), 4) Fix any issues, 5) Mark task as completed by changing - [ ] to - [x] in plan file, 6) Commit with message 'Task N: [title]'. Continue until ALL 12 tasks complete. When done, output: <promise>ALL 12 TASKS COMPLETED AND TESTS PASS</promise>" --completion-promise "ALL 12 TASKS COMPLETED AND TESTS PASS" --max-iterations 100`

4. **Или просто двойной клик на** `start-ralph.bat`

5. **Иди喝茶/coffee** — Ralph работает сам!

6. **Вернись через 2-6 часов** — MVP готово! 🚀

---

**Создано для автономной AI-разработки.**

**Ralph Wiggum + Claude Code = Полный клон TickTick за выходные.** 🎯
