# 🚀 Ralph для TickTick Clone - Готово к использованию!

## ✅ Что создано

Полная enterprise-grade система для автономной разработки TickTick clone через Ralph Wiggum loop.

### 📁 Структура проекта

```
ticktick-clone/
├── 📄 CLAUDE.md                    # Ralph-aware инструкции
├── 📄 AGENTS.md                    # Operational guide (команды)
├── 📄 PROMPT_plan.md              # Промпт для планирования
├── 📄 PROMPT_build.md             # Промпт для реализации
├── 📄 ralph-loop.sh               # Главный скрипт Ralph
├── 📂 .ralph/                      # Конфигурация Ralph
│   └── validate.sh                # Скрипт валидации
├── 📂 docs/
│   ├── TICKTICK_FEATURES_COMPLETE.md  # ВСЕ 150+ функций
│   ├── DESIGN_RULES_CLAUDE_STYLE.md   # Правила дизайна
│   ├── PHASE_BREAKDOWN.md             # 25 фаз разработки
│   └── plans/
│       └── phase-1-core-tasks.md      # План Phase 1
└── 📂 specs/                       # Тут будут спецификации
```

---

## 🎯 Как запустить Ralph для TickTick Clone

### Вариант 1: Через slash команду (проще)

Открой Claude Code в `C:\AITEST\ticktick-clone` и выполни:

```
/ralph-setup
```

Ответь на вопросы:
1. Project type: `web`
2. Tech stack: `nextjs` (или что тебе нужно)
3. Main goal: `Full TickTick clone with task management, calendar, reminders, pomodoro, habits`

### Вариант 2: Запустить сразу (уже настроено)

```bash
cd C:\AITEST\ticktick-clone

# Сначала планирование (генерирует IMPLEMENTATION_PLAN.md)
./ralph-loop.sh plan

# Потом реализация (выполняет задачи)
./ralph-loop.sh build
```

---

## 🔥 Ralph Универсальный (для ЛЮБОГО проекта!)

### Для НОВОГО проекта:

```bash
cd /path/to/your-project

# Запусти slash команду
/ralph-setup

# Или создай файлы вручную (скопируй из ticktick-clone)
```

**Что нужно:**
1. ✅ `PROMPT_plan.md` - planning mode prompt
2. ✅ `PROMPT_build.md` - building mode prompt
3. ✅ `AGENTS.md` - operational guide
4. ✅ `IMPLEMENTATION_PLAN.md` - пустой шаблон
5. ✅ `specs/` - директория для требований
6. ✅ `ralph-loop.sh` - главный скрипт

### Любой проект → За 2 минуты

```bash
# 1. Скопируй файлы из ticktick-clone
cp -r ralph-loop.sh .ralph/ PROMPT_*.md AGENTS.md /path/to/your-project/

# 2. Отредактируй AGENTS.md под свой проект
# (поменяй команды сборки/тестов)

# 3. Создай первый spec
mkdir specs
echo "# My Feature
## Overview
..." > specs/my-feature.md

# 4. Запусти планирование
cd /path/to/your-project
./ralph-loop.sh plan

# 5. Запусти реализацию
./ralph-loop.sh build
```

---

## 📊 TickTick Clone - 25 Фаз

Все фазы разбиты на manageable chunks (3-7 дней каждая):

### Foundation (Phases 1-3)
- Phase 1: Project Infrastructure
- Phase 2: Database Foundation
- Phase 3: Authentication System

### Core Tasks (Phases 4-6)
- Phase 4: Task Data Model
- Phase 5: Task CRUD API
- Phase 6: Task Basic UI

### Organization (Phases 7-9)
- Phase 7: Lists System
- Phase 8: Lists UI
- Phase 9: Tags System

### Filtering (Phases 10-11)
- Phase 10: Advanced Filtering
- Phase 11: Sorting System

### Calendar (Phases 12-14)
- Phase 12: Calendar Data Model
- Phase 13: Monthly Calendar View
- Phase 14: Daily/Weekly Views

### Advanced Views (Phases 15-16)
- Phase 15: Kanban Board
- Phase 16: Eisenhower Matrix

### Reminders (Phases 17-18)
- Phase 17: Reminder System
- Phase 18: Recurring Tasks

### Polish (Phases 19-21)
- Phase 19: Responsive Design
- Phase 20: Animations & Transitions
- Phase 21: Accessibility

### Productivity (Phases 22-24)
- Phase 22: Pomodoro Timer
- Phase 23: Habit Tracker
- Phase 24: Goals Feature

### Final (Phase 25)
- Phase 25: Production Ready

**Подробнее:** `docs/PHASE_BREAKDOWN.md`

---

## 🛠️ Ralph Commands

```bash
./ralph-loop.sh              # Build mode (выполнять задачи)
./ralph-loop.sh plan         # Plan mode (сгенерировать план)
./ralph-loop.sh 20           # Build mode, max 20 итераций
./ralph-loop.sh validate     # Проверить валидацию
```

---

## 📝 Создание Спецификаций

### Format

`specs/feature-name.md`:
```markdown
# Feature Name

## Overview
Что делает эта фича и почему.

## Requirements
- Требование 1
- Требование 2

## Acceptance Criteria
- [ ] Критерий 1 (проверяемый)
- [ ] Критерий 2 (проверяемый)

## Examples
Примеры использования
```

### Пример для Task Management

`specs/task-management.md`:
```markdown
# Task Management System

## Overview
Users must be able to create, read, update, and delete tasks with properties like title, description, due date, priority.

## Requirements
- Task has title (required)
- Task has description (optional)
- Task has due date (optional)
- Task has priority: None, Low, Medium, High
- Task can be marked as completed
- Task can be permanently deleted

## Acceptance Criteria
- [ ] User can create task via UI
- [ ] User can edit task via UI
- [ ] User can delete task via UI
- [ ] Task persists across page reloads
- [ ] Task has all required properties
- [ ] Tasks are stored in database

## Examples
User creates task "Buy milk" with due date "tomorrow" and priority "High"
Task appears in task list
User edits task to mark as complete
Task is visually marked as complete
```

---

## 🎨 Дизайн Система

**Warm Claude Code Style** уже задокументирован в `docs/DESIGN_RULES_CLAUDE_STYLE.md`

### Ключевые цвета:
```css
Primary:    #D97757  /* Тёплая терракота */
Background:  #FCFBF9  /* Тёплый крем */
Text:       #2D2A26  /* Тёплый серый (не чёрный!) */
```

### Микро-взаимодействия:
- Checkbox: 200ms
- Task complete: 300ms
- Button hover: 200ms
- Modal open: 200ms

---

## ⚙️ Настройка под свой проект

### Изменить AGENTS.md

Поменяй команды под свой стек:

```bash
# Python/Django вместо Next.js
## Build Commands
python manage.py runserver
python manage.py test
black .
```

### Изменить PROMPT_*.md

Адаптируй под свой проект:
- Поменяй `specs/*` пути если другая структура
- Поменяй `src/*` если другая структура
- Поменяй `src/lib/*` если нет такой папки

---

## 🔍 Мониторинг Progress

### В реальном времени

**Терминал 1** (Ralph работает):
```bash
./ralph-loop.sh build
```

**Терминал 2** (мониторинг):
```bash
# Смотри план
tail -f IMPLEMENTATION_PLAN.md

# Или логи
tail -f .ralph/loop.log
```

### Проверить статус

```bash
# Что в плане сейчас
cat IMPLEMENTATION_PLAN.md

# Есть незавершённые задачи?
grep -c "\- \[ \]" IMPLEMENTATION_PLAN.md

# Ralph запущен?
ls -la .ralph/running.lock
```

---

## 🛑 Остановка Ralph

```bash
# Остановить текущий loop
rm .ralph/running.lock

# Или Ctrl+C в терминале где Ralph работает
```

### Если Ralph застрял

```bash
# Проверь логи
cat .ralph/loop.log

# Запусти валидацию вручную
./ralph-loop.sh validate

# Исправь ошибки или поменяй план
vim IMPLEMENTATION_PLAN.md

# Перезапусти
./ralph-loop.sh build
```

---

## 📚 Документация

1. **[PHASE_BREAKDOWN.md](docs/PHASE_BREAKDOWN.md)** - 25 фаз разработки
2. **[TICKTICK_FEATURES_COMPLETE.md](docs/TICKTICK_FEATURES_COMPLETE.md)** - Все 150+ функций
3. **[DESIGN_RULES_CLAUDE_STYLE.md](docs/DESIGN_RULES_CLAUDE_STYLE.md)** - Правила дизайна
4. **[RALPH_GUIDE.md](RALPH_GUIDE.md)** - Инструкция по запуску

---

## 🎯 Следующие шаги

### Для TickTick Clone:

```bash
cd C:\AITEST\ticktick-clone

# 1. Создай первую спецификацию
mkdir -p specs
echo "# Phase 1: Project Infrastructure
..." > specs/phase-1-infra.md

# 2. Запусти планирование
./ralph-loop.sh plan

# 3. Проверь план
cat IMPLEMENTATION_PLAN.md

# 4. Запусти реализацию
./ralph-loop.sh build

# 5. Иди пить кофе ☕
# Ralph работает сам!

# 6. Вернись через 3-7 дней
# Phase 1 будет готова!
```

### Для ЛЮБОГО другого проекта:

```bash
# 1. Запусти slash команду
/ralph-setup

# 2. Ответь на вопросы о проекте

# 3. Создай спецификацию
echo "# My Feature
..." > specs/my-feature.md

# 4. Запусти Ralph
./ralph-loop.sh plan
./ralph-loop.sh build
```

---

## 💡 Ключевые Принципы Ralph

### 1. Планирование отдельно от реализации
**Plan mode** = создает план, не пишет код
**Build mode** = выполняет план, не создаёт его

### 2. Свежий контекст каждую итерацию
- Плюсы: Нет перегрузки контекстом
- Плюсы: Каждая задача = фокус
- Плюсы: Лучшее качество за счёт свежего взгляда

### 3. Backpressure через тесты
- Тесты не проходят → Ralph исправляет
- Lint не проходит → Ralph исправляет
- Build не проходит → Ralph исправляет

### 4. Shared state через файлы
- `IMPLEMENTATION_PLAN.md` = состояние проекта
- Каждая итерация читает и обновляет план
- Простота > сложность (Markdown, не JSON)

### 5. План одноразовый, но восстанавливаемый
- План можно удалить и пересоздать
- Планирование быстро (1-2 итерации)
- Если план неправильный → regenerate

---

## 🚀 Готово к использованию!

**Всё настроено и готово.**

Запускай Ralph и наблюдай как AI строит TickTick clone САМ!

```bash
cd C:\AITEST\ticktick-clone
./ralph-loop.sh plan
```

**Удачи! 🎉**
