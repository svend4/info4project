# 🎯 АГЕНТСКИЕ СПЕЦИФИКАЦИИ И ИНСТРУКЦИИ

**ВАЖНО**: Это расширенные технические спецификации для АГЕНТОВ.  
Координатор направляет и проверяет, АГЕНТЫ выполняют.

---

## 📋 АГЕНТ #2: FRONTEND REACT DEVELOPER

### Текущий Статус
- **Ветка**: feature/frontend-ui
- **Статус**: READY TO START
- **Блокировка**: РАЗБЛОКИРОВАН - Backend готов к интеграции

### ✅ ФИНАЛЬНЫЕ ЗАДАЧИ (Выполнить в этом порядке)

#### БЛОК 1: Инициализация проекта (10 минут)

```bash
# Команды которые НУЖНО выполнить:
git checkout feature/frontend-ui
git pull origin feature/frontend-ui

# Проверить текущую структуру:
ls -la
cat FRONTEND_COORDINATOR_MESSAGE.md

# Создать package.json если не существует:
# (должен иметь React, axios, jest, @testing-library)

# Инсталировать зависимости:
npm install

# Проверить версию Node:
node --version  # должен быть 18+
npm --version   # должен быть 9+
```

**Проверка успеха:**
- ✅ package.json существует
- ✅ node_modules/ создана
- ✅ Нет error в консоли

---

#### БЛОК 2: Создать структуру компонентов (15 минут)

**Структура ДОЛЖНА быть:**
```
frontend/
├── src/
│   ├── components/
│   │   ├── App.jsx (ГЛАВНЫЙ компонент - STATE管理)
│   │   ├── TaskList.jsx (ОТОБРАЖЕНИЕ списка задач)
│   │   ├── TaskForm.jsx (ФОРМА создания/редактирования)
│   │   ├── TaskItem.jsx (КАРТОЧКА одной задачи)
│   │   ├── LoadingSpinner.jsx (ИНДИКАТОР загрузки)
│   │   └── App.css (СТИЛИ)
│   ├── api.js (СЕРВИС слой - вызывает Backend)
│   └── index.js (ТОЧКА входа)
├── tests/
│   ├── App.test.js
│   ├── api.test.js
│   └── TaskForm.test.js
├── package.json
├── jest.config.js
└── .gitignore
```

**Инструкции по файлам:**

##### App.jsx ТРЕБОВАНИЯ:
```javascript
// ДОЛЖНО БЫТЬ:
- useState для tasks[]
- useState для loading
- useState для error
- useState для selectedTask (для редактирования)
- useEffect(() => { loadTasks() }, [])

// ФУНКЦИИ:
- loadTasks() - вызывает API.getAllTasks()
- handleAddTask(taskData) - вызывает API.createTask()
- handleUpdateTask(id, updates) - вызывает API.updateTask()
- handleDeleteTask(id) - вызывает API.deleteTask()

// ОТОБРАЖЕНИЕ:
- Header с заголовком
- Ошибок banner (если error !== null)
- TaskForm (для добавления/редактирования)
- TaskList (показывает все задачи)
- Loading spinner (во время загрузки)
- Footer с версией
```

##### TaskList.jsx ТРЕБОВАНИЯ:
```javascript
// Props:
- tasks: Array<Task>
- onEdit: (task) => void
- onDelete: (id) => void
- onUpdate: (id, updates) => void

// Отображение:
- Список всех задач через map()
- TaskItem для каждой задачи
- Empty state если нет задач

// НЕ ДОЛЖНО:
- Своего state (state в App.jsx!)
- Вызовов API (API слой в api.js!)
- Loading логики (loading в App.jsx!)
```

##### TaskForm.jsx ТРЕБОВАНИЯ:
```javascript
// Props:
- onSubmit: (taskData) => Promise
- editingTask?: Task | null
- onUpdate: (id, updates) => Promise
- onCancelEdit: () => void

// Поля формы:
- title* (required, max 200 chars)
- description (optional)
- priority (dropdown: low/medium/high)
- status (dropdown: todo/in_progress/done)
- dueDate (date input)

// Валидация:
- title пусто → ERROR
- title > 200 символов → ERROR
- title с специальными символами → ALLOW

// Кнопки:
- Submit (зависит: "Add Task" или "Update Task")
- Cancel (если editingTask !== null)

// Обработка:
- При успехе → очистить форму
- При ошибке → показать ошибку
- При загрузке → disabled = true
```

##### TaskItem.jsx ТРЕБОВАНИЯ:
```javascript
// Props:
- task: Task
- onEdit: (task) => void
- onDelete: (id) => void
- onUpdate: (id, updates) => void

// Отображение:
- Checkbox для completed
- Title (если completed, то strikethrough)
- Description
- Priority badge (color: high=red, medium=yellow, low=green)
- Status badge
- Created date
- Edit кнопка (pencil emoji)
- Delete кнопка (trash emoji)

// Функции:
- handleToggleComplete() → вызывает onUpdate(id, {completed: !task.completed})
- handleDelete() → подтверждает через confirm() → вызывает onDelete()
```

##### api.js ТРЕБОВАНИЯ:
```javascript
// КОНТРАКТ Backend:
GET /api/tasks
  Response: { success: true, data: [...], count: N }

POST /api/tasks (body: {title, description, priority, status, dueDate})
  Response: { success: true, data: {...} }

GET /api/tasks/:id
  Response: { success: true, data: {...} }

PUT /api/tasks/:id (body: {title?, description?, completed?, ...})
  Response: { success: true, data: {...} }

DELETE /api/tasks/:id
  Response: { success: true, message: "..." }

// ВАЛИДАЦИЯ ответов:
- Всегда проверяй response.success перед использованием data
- Если response.success === false, используй response.error
- Ловя все errors в try/catch

// ФУНКЦИИ:
export const tasksAPI = {
  async getAllTasks() -> { success, tasks[], count, error }
  async createTask(data) -> { success, task, error }
  async getTask(id) -> { success, task, error }
  async updateTask(id, updates) -> { success, task, error }
  async deleteTask(id) -> { success, message, error }
}

// API BASE URL:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
```

---

#### БЛОК 3: Написать тесты (20 минут)

**Файл**: frontend/tests/api.test.js

```javascript
describe('tasksAPI', () => {
  // Тест 1: getAllTasks успех
  test('getAllTasks returns all tasks', async () => {
    // Arrange: mock fetch
    // Act: call tasksAPI.getAllTasks()
    // Assert: success === true, tasks is array, count is number
  })

  // Тест 2: getAllTasks ошибка
  test('getAllTasks handles error', async () => {
    // Arrange: mock fetch с ошибкой
    // Act: call tasksAPI.getAllTasks()
    // Assert: success === false, error defined
  })

  // Тест 3: createTask валидирует title
  test('createTask validates required title', async () => {
    // Act: call createTask({ title: '' })
    // Assert: success === false, error mentions "required"
  })

  // Тест 4: createTask создает задачу
  test('createTask creates new task', async () => {
    // Arrange: mock fetch
    // Act: call createTask({title: 'Test'})
    // Assert: success === true, task.id exists
  })

  // Тест 5: updateTask обновляет
  test('updateTask updates existing task', async () => {
    // Arrange: mock fetch
    // Act: call updateTask('1', {title: 'Updated'})
    // Assert: success === true, task.title === 'Updated'
  })

  // Тест 6: deleteTask удаляет
  test('deleteTask deletes task', async () => {
    // Arrange: mock fetch
    // Act: call deleteTask('1')
    // Assert: success === true, message defined
  })

  // Тест 7: Contract validation - success field
  test('validates response has success field', async () => {
    // Arrange: mock response без success field
    // Act: call getAllTasks()
    // Assert: success === false, error mentions "Invalid response"
  })

  // Тест 8: Contract validation - data field
  test('validates response has data field', async () => {
    // Arrange: mock response без data field
    // Act: call getAllTasks()
    // Assert: success === false, error mentions "Invalid response"
  })
})

// Целевое покрытие: >80% (MUST HAVE!)
```

**Файл**: frontend/tests/App.test.js

```javascript
describe('App Component', () => {
  // Тест 1: Рендерится без ошибок
  test('renders without crashing', () => {
    // Arrange: render App
    // Assert: screen has heading
  })

  // Тест 2: Загружает задачи при монте
  test('loads tasks on mount', async () => {
    // Arrange: mock tasksAPI.getAllTasks
    // Act: render App, wait for tasks
    // Assert: tasks displayed
  })

  // Тест 3: Показывает ошибку если API падает
  test('displays error when API fails', async () => {
    // Arrange: mock tasksAPI с ошибкой
    // Act: render App
    // Assert: error message visible
  })

  // Тест 4: Добавляет задачу
  test('adds new task', async () => {
    // Arrange: render App
    // Act: заполнить форму, submit
    // Assert: новая задача в списке
  })

  // Тест 5: Удаляет задачу
  test('deletes task', async () => {
    // Arrange: render App с задачами
    // Act: click delete, confirm
    // Assert: задача удалена из списка
  })

  // Тест 6: Редактирует задачу
  test('edits existing task', async () => {
    // Arrange: render App
    // Act: click edit, change title, submit
    // Assert: задача обновлена
  })
})

// Целевое покрытие: >80%
```

---

#### БЛОК 4: Запустить тесты (5 минут)

```bash
# Запустить тесты:
npm test -- --coverage

# ТРЕБОВАНИЯ:
- Все тесты должны ПРОЙТИ (0 failures)
- Coverage должен быть >80% (lines, branches, functions, statements)
- Если coverage < 80% → добавить еще тестов

# Если тесты падают:
- Прочитать ошибку
- Исправить код
- Запустить снова
- Повторять пока все не пройдут

# Если coverage < 80%:
- Смотреть coverage report
- Найти непокрытые строки
- Добавить тесты для них
- Запустить снова
```

---

#### БЛОК 5: Коммит и Push (5 минут)

```bash
# Проверить статус:
git status

# Добавить все файлы:
git add frontend/ tests/

# Коммит:
git commit -m "✨ feat: Implement React frontend with components and tests

- Create React components (App, TaskList, TaskForm, TaskItem, LoadingSpinner)
- Implement API service layer with full contract validation
- Add comprehensive test suite (8+ API tests, 6+ component tests)
- Responsive CSS styling with mobile support
- Error handling and input validation
- >80% test coverage achieved

Components: App (state), TaskList, TaskForm, TaskItem, LoadingSpinner
API Layer: getAllTasks, createTask, getTask, updateTask, deleteTask
Tests: Contract compliance, error handling, component behavior
Coverage: >80% (lines, branches, functions, statements)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push:
git push origin feature/frontend-ui

# Проверить что запушилось:
git log origin/feature/frontend-ui -1 --oneline
```

---

### 🎯 УСПЕХ = Когда:
- ✅ Все файлы структуры созданы
- ✅ Все компоненты реализованы  
- ✅ API слой валидирует контракты
- ✅ 14+ тестов написано
- ✅ >80% coverage достигнуто
- ✅ Все тесты ПРОХОДЯТ
- ✅ Коммит запушен на feature/frontend-ui

---

## 📋 АГЕНТ #4: DEVOPS/INFRASTRUCTURE ENGINEER

### Текущий Статус
- **Ветка**: feature/devops
- **Статус**: READY TO START
- **Блокировка**: РАЗБЛОКИРОВАН - Может начать

### ✅ ФИНАЛЬНЫЕ ЗАДАЧИ (Выполнить в этом порядке)

#### БЛОК 1: Инициализация (5 минут)

```bash
git checkout feature/devops
git pull origin feature/devops

# Проверить текущую структуру:
ls -la
cat DEVOPS_COORDINATOR_MESSAGE.md

# Создать директории:
mkdir -p docker
mkdir -p .github/workflows
```

---

#### БЛОК 2: Dockerfile для Backend (15 минут)

**Файл**: docker/Dockerfile.backend

ТРЕБОВАНИЯ:
```dockerfile
# Base: node:18-alpine
# Workdir: /app/backend

# Copy package*.json
# RUN npm ci --only=production

# Copy backend/src ./src

# Add non-root user (nodejs:1001)
# chown -R nodejs:nodejs /app/backend

# HEALTHCHECK:
#   GET http://localhost:3000/api/tasks → 200 OK
#   interval: 30s, timeout: 10s, retries: 3

# EXPOSE 3000
# USER nodejs
# CMD: ["node", "src/server.js"]

# LABELS (Docker metadata):
#   description, version, maintainer
```

ПРОВЕРКА:
```bash
# Должно компилироваться без ошибок:
docker build -f docker/Dockerfile.backend -t task-backend:test .

# Если ошибка - исправить до успеха
```

---

#### БЛОК 3: Dockerfile для Frontend (15 минут)

**Файл**: docker/Dockerfile.frontend

ТРЕБОВАНИЯ:
```dockerfile
# Stage 1: Builder (node:18-alpine)
#   Copy frontend/package*.json
#   RUN npm ci
#   Copy frontend/ .
#   RUN npm run build → /app/frontend/build

# Stage 2: Production (nginx:alpine)
#   Copy nginx.conf → /etc/nginx/conf.d/default.conf
#   Copy --from=builder /app/frontend/build → /usr/share/nginx/html
#   Add non-root user
#   HEALTHCHECK: GET http://localhost/health → 200
#   EXPOSE 80
#   CMD: ["nginx", "-g", "daemon off;"]

# LABELS: description, version, maintainer
```

ПРОВЕРКА:
```bash
docker build -f docker/Dockerfile.frontend -t task-frontend:test .
# Без ошибок
```

---

#### БЛОК 4: nginx.conf конфиг (10 минут)

**Файл**: docker/nginx.conf

ТРЕБОВАНИЯ:
```nginx
server {
    listen 80;
    server_name localhost;
    
    # Gzip compression (на)
    
    # Security headers:
    #   X-Frame-Options: SAMEORIGIN
    #   X-Content-Type-Options: nosniff
    #   X-XSS-Protection: 1; mode=block
    #   Referrer-Policy: strict-origin-when-cross-origin
    
    # Static files location /:
    #   root /usr/share/nginx/html
    #   try_files $uri $uri/ /index.html
    
    # API proxy /api:
    #   proxy_pass http://backend:3000
    #   proxy_set_header Host $host
    #   proxy_set_header X-Real-IP $remote_addr
    #   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for
    
    # Health check /health:
    #   return 200 "healthy"
}
```

ПРОВЕРКА:
```bash
# Синтаксис должен быть правильный:
nginx -t -c docker/nginx.conf
# Без ошибок
```

---

#### БЛОК 5: docker-compose.yml (20 минут)

**Файл**: docker-compose.yml

ТРЕБОВАНИЯ:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    container_name: task-api-backend
    ports:
      - "${BACKEND_PORT:-3000}:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    healthcheck:
      - test, interval, timeout, retries, start_period
    restart: unless-stopped
    networks:
      - task-network
    volumes:
      - ./backend/src:/app/backend/src (для dev mode)

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    container_name: task-api-frontend
    ports:
      - "${FRONTEND_PORT:-80}:80"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - REACT_APP_API_URL=http://localhost:3000/api
    healthcheck:
      - test, interval, timeout, retries
    restart: unless-stopped
    networks:
      - task-network

networks:
  task-network:
    driver: bridge
```

ПРОВЕРКА:
```bash
# Синтаксис YAML валидный:
docker-compose config > /dev/null
# Без ошибок

# Images build:
docker-compose build
# Без ошибок

# Services стартуют:
docker-compose up -d
sleep 10

# Backend здоров:
curl http://localhost:3000/api/tasks
# Должна вернуть { success: true, ... }

# Frontend здоров:
curl http://localhost/health
# Должна вернуть 200

# Остановить:
docker-compose down
```

---

#### БЛОК 6: .env.example (5 минут)

**Файл**: .env.example

ТРЕБОВАНИЯ:
```bash
# Environment
NODE_ENV=development
LOG_LEVEL=debug

# Backend
BACKEND_PORT=3000
BACKEND_HOST=0.0.0.0

# Frontend
FRONTEND_PORT=80
REACT_APP_API_URL=http://localhost:3000/api

# Database (для будущего)
# DB_HOST=postgres
# DB_PORT=5432
# DB_NAME=task_db
# DB_USER=postgres
# DB_PASSWORD=postgres
```

---

#### БЛОК 7: GitHub Actions CI/CD (20 минут)

**Файл**: .github/workflows/ci-cd.yml

ТРЕБОВАНИЯ:
```yaml
name: CI/CD Pipeline

on:
  push: [main, develop, feature/**]
  pull_request: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup Node.js
      - npm ci (backend/)
      - npm test --coverage (backend/)
      - upload coverage to codecov

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup Node.js
      - npm ci (frontend/)
      - npm test --coverage (frontend/)
      - upload coverage to codecov

  build-docker:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - checkout
      - setup docker buildx
      - build Dockerfile.backend (no push)
      - build Dockerfile.frontend (no push)

  integration-tests:
    needs: [build-docker]
    runs-on: ubuntu-latest
    steps:
      - checkout
      - docker-compose up -d
      - wait for services
      - curl test http://localhost:3000/api/tasks (should be 200)
      - curl test http://localhost/health (should be 200)
      - docker-compose down

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - run trivy scan
      - upload results to GitHub security

  notify:
    needs: [all jobs]
    runs-on: ubuntu-latest
    steps:
      - notify success or failure
```

ПРОВЕРКА:
```bash
# Синтаксис YAML:
yamllint .github/workflows/ci-cd.yml
# Без ошибок

# Commits push:
git push origin feature/devops

# Проверить на GitHub:
# Actions tab → ci-cd pipeline should run
# Wait for completion (5-10 minutes)
```

---

#### БЛОК 8: DEPLOYMENT.md документация (10 минут)

**Файл**: DEPLOYMENT.md

ТРЕБОВАНИЯ:
```markdown
# Deployment Guide

## Development Setup

```bash
# Copy environment
cp .env.example .env

# Build images
docker-compose build

# Start services
docker-compose up -d

# Logs
docker-compose logs -f

# Stop
docker-compose down
```

## Production Deployment

- Все переменные окружения установлены
- SSL/TLS сертификаты готовы
- Volumы для persistence настроены
- Backup стратегия документирована

## Monitoring

- Health checks every 30 seconds
- Logs aggregation (ELK/Datadog)
- Metrics collection (Prometheus)
- Alerts if service down >5 min

## Rollback Procedure

- Keep previous images
- `docker-compose down`
- `docker-compose up` (previous version)
```

---

### 🎯 УСПЕХ = Когда:
- ✅ docker/Dockerfile.backend компилируется
- ✅ docker/Dockerfile.frontend компилируется
- ✅ docker/nginx.conf валидный
- ✅ docker-compose.yml валидный YAML
- ✅ docker-compose up работает
- ✅ curl http://localhost:3000/api/tasks возвращает 200
- ✅ curl http://localhost/health возвращает 200
- ✅ .env.example создан
- ✅ .github/workflows/ci-cd.yml валидный
- ✅ DEPLOYMENT.md написан
- ✅ Все закоммичено и запушено на feature/devops

---

## 📊 КООРДИНАТОРСКАЯ РАБОТА

### Текущий Статус:
- Агент #1 (Backend): ✅ ЗАВЕРШЕН (95.45% coverage)
- Агент #3 (Testing): ✅ ЗАВЕРШЕН (92% coverage)
- **Агент #2 (Frontend): 🚀 АКТИВНО** (Блок 1-5)
- **Агент #4 (DevOps): 🚀 АКТИВНО** (Блок 1-8)

### Координаторские Действия:
1. ⏳ Мониторить коммиты каждые 3-5 минут
2. ⏳ Когда Frontend запушит → Валидировать контракты API
3. ⏳ Когда DevOps запушит → Валидировать Docker конфиги
4. ⏳ Если конфликты → Немедленно алертировать агентов
5. ⏳ Если успех → Подготовить интеграционные тесты

---

_Это ПРАВИЛЬНЫЙ подход к Projects Architecture!_  
_Координатор управляет агентами, а не пишет код сам._
