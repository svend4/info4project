# 🚀 АГЕНТЫ ИНСТРУКЦИЯ - ПАРАЛЛЕЛЬНАЯ РАЗРАБОТКА ПРОЕКТА

**Дата начала**: 2026-09-21  
**Архитектура**: Projects Architecture (Parallel Agent Coordination)  
**Цель**: Два агента работают параллельно для 1.55x ускорения

---

## 👋 HELLO AGENTS!

Вы - часть **Projects Architecture** демонстрации. Вместо того, чтобы один разработчик писал всё последовательно, **четыре агента работают параллельно** через координацию.

- ✅ **Agent #1 (Backend)**: Завершен - REST API (95.45% coverage)
- ✅ **Agent #3 (Testing)**: Завершен - Test Suite (92% coverage)
- 🚀 **Agent #2 (Frontend)**: ВЫ! Начните с feature/frontend-ui
- 🚀 **Agent #4 (DevOps)**: ВЫ! Начните с feature/devops

---

## 📋 АГЕНТ #2: FRONTEND REACT DEVELOPER

### 📍 ВАШ ПУТЬ

1. **Прочитайте**: `/AGENT_SPECIFICATIONS.md` (секция "АГЕНТ #2")
2. **Выполните**: 5 блоков работы (Инициализация → Компоненты → Тесты → Валидация → Коммит)
3. **Отправьте**: git push к feature/frontend-ui
4. **Результат**: React приложение с API интеграцией

### ⏱️ ОЖИДАЕМОЕ ВРЕМЯ: 55 минут

### ✅ ЗАДАЧИ (В этом порядке!)

**БЛОК 1 (10 мин)**: Инициализация проекта
```bash
git checkout feature/frontend-ui
git pull origin feature/frontend-ui
npm install
npm --version  # должен быть 9+
node --version # должен быть 18+
```

**БЛОК 2 (15 мин)**: React компоненты
```
✓ frontend/src/components/App.jsx (state management)
✓ frontend/src/components/TaskList.jsx (list display)
✓ frontend/src/components/TaskForm.jsx (form with validation)
✓ frontend/src/components/TaskItem.jsx (task card)
✓ frontend/src/components/LoadingSpinner.jsx (loading UI)
✓ frontend/src/api.js (API service layer)
```

**БЛОК 3 (20 мин)**: Тесты (>80% coverage)
```
✓ frontend/tests/api.test.js (8+ tests)
✓ frontend/tests/App.test.js (6+ tests)
```

**БЛОК 4 (5 мин)**: Запустить тесты
```bash
npm test -- --coverage
# ✓ Все тесты должны ПРОЙТИ
# ✓ Coverage >80%
```

**БЛОК 5 (5 мин)**: Коммит и push
```bash
git add frontend/ tests/
git commit -m "✨ feat: Implement React frontend with components and tests"
git push origin feature/frontend-ui
```

### 🔗 ИНТЕГРАЦИЯ С BACKEND

Backend API ready at: `http://localhost:3000/api`

**Используйте эти endpoints:**
```javascript
GET /api/tasks
  ← { success: true, data: [...], count: N }

POST /api/tasks
  → { title, description, priority, status, dueDate }
  ← { success: true, data: {...} }

GET /api/tasks/:id
  ← { success: true, data: {...} }

PUT /api/tasks/:id
  → { updates: {...} }
  ← { success: true, data: {...} }

DELETE /api/tasks/:id
  ← { success: true, message: "..." }
```

### 📚 ИНСТРУКЦИИ НАХОДЯТСЯ В:
- `/AGENT_SPECIFICATIONS.md` - Детальные блоки и требования
- `/COORDINATOR_VALIDATION_CHECKLIST.md` - Как валидировать вашу работу

---

## 📋 АГЕНТ #4: DEVOPS/INFRASTRUCTURE ENGINEER

### 📍 ВАШ ПУТЬ

1. **Прочитайте**: `/AGENT_SPECIFICATIONS.md` (секция "АГЕНТ #4")
2. **Выполните**: 8 блоков работы (Docker → Compose → CI/CD → Deploy)
3. **Отправьте**: git push к feature/devops
4. **Результат**: Полная Docker инфраструктура + CI/CD pipeline

### ⏱️ ОЖИДАЕМОЕ ВРЕМЯ: 100 минут

### ✅ ЗАДАЧИ (В этом порядке!)

**БЛОК 1 (5 мин)**: Инициализация
```bash
git checkout feature/devops
git pull origin feature/devops
mkdir -p docker .github/workflows
```

**БЛОК 2 (15 мин)**: docker/Dockerfile.backend
```dockerfile
✓ FROM node:18-alpine
✓ WORKDIR /app/backend
✓ npm ci --only=production
✓ HEALTHCHECK (GET /api/tasks)
✓ USER nodejs (non-root)
✓ CMD ["node", "src/server.js"]
```

**БЛОК 3 (15 мин)**: docker/Dockerfile.frontend
```dockerfile
✓ Stage 1: Builder (node:18-alpine)
✓ Stage 2: Production (nginx:alpine)
✓ COPY nginx.conf
✓ HEALTHCHECK
```

**БЛОК 4 (10 мин)**: docker/nginx.conf
```nginx
✓ location / → /usr/share/nginx/html
✓ location /api → proxy_pass http://backend:3000
✓ location /health → 200 OK
✓ Security headers (X-Frame-Options, etc.)
```

**БЛОК 5 (20 мин)**: docker-compose.yml
```yaml
✓ Backend service (port 3000)
✓ Frontend service (port 80)
✓ Healthchecks
✓ Networks: task-network
✓ Volumes for dev
```

**БЛОК 6 (5 мин)**: .env.example
```
✓ NODE_ENV, LOG_LEVEL
✓ BACKEND_PORT, BACKEND_HOST
✓ FRONTEND_PORT
✓ REACT_APP_API_URL
```

**БЛОК 7 (20 мин)**: .github/workflows/ci-cd.yml
```yaml
✓ test-backend job
✓ test-frontend job
✓ build-docker job
✓ integration-tests job
✓ security-scan job
```

**БЛОК 8 (10 мин)**: DEPLOYMENT.md
```markdown
✓ Development setup
✓ Production deployment
✓ Monitoring
✓ Rollback procedure
```

### 🧪 ЛОКАЛЬНОЕ ТЕСТИРОВАНИЕ

Когда завершите docker-compose.yml:
```bash
docker-compose up -d
sleep 10

# Backend test
curl http://localhost:3000/api/tasks
# Expected: { "success": true, "data": [...] }

# Frontend test
curl http://localhost/health
# Expected: 200 OK

docker-compose down
```

### 📚 ИНСТРУКЦИИ НАХОДЯТСЯ В:
- `/AGENT_SPECIFICATIONS.md` - Детальные блоки и требования
- `/COORDINATOR_VALIDATION_CHECKLIST.md` - Как валидировать вашу работу

---

## 🎯 ОБЩИЕ ПРАВИЛА

### ✅ ЧТО ДЕЛАТЬ

1. **Читайте внимательно**: AGENT_SPECIFICATIONS.md содержит ВСЮ информацию
2. **Работайте по блокам**: Выполняйте в порядке 1→2→3→4→5
3. **Тестируйте локально**: Перед push убедитесь что всё работает
4. **Коммитьте регулярно**: После каждого блока
5. **Запушьте в конце**: git push origin feature/[ваша-ветка]

### ❌ ЧТО НЕ ДЕЛАТЬ

1. **Не пропускайте блоки**: Порядок важен!
2. **Не меняйте ветки**: Оставайтесь на feature/frontend-ui или feature/devops
3. **Не пишите в main**: Только в вашей feature ветке
4. **Не удаляйте файлы**: Консервативно - добавляйте, не удаляйте
5. **Не игнорируйте ошибки**: Если тест падает - исправьте, не пропускайте

---

## 📊 КООРДИНАТОРСКАЯ ПОДДЕРЖКА

**Координатор** работает параллельно с вами:
- ✅ Проверяет ваши коммиты каждые 3-5 минут
- ✅ Валидирует структуру и синтаксис
- ✅ Помогает с проблемами (но не пишет код!)
- ✅ Детектирует конфликты немедленно
- ✅ Документирует прогресс в реальном времени

**Когда закончите**:
1. Координатор pull оба branches
2. Запустит integration tests
3. Валидирует контракты API
4. Merge всё в main
5. Создаст final PR

---

## 🔗 ЗАВИСИМОСТИ

**Frontend блокирует на**: ✅ Backend (Backend готов!)

**DevOps независим от**: Frontend, Backend (может начать сразу!)

**Testing готов запуститься**: Параллельно с вами обоими

---

## ⏱️ ОЖИДАЕМЫЙ ГРАФИК

```
0-10м   | Frontend: Блок 1         | DevOps: Блок 1       |
10-25м  | Frontend: Блок 2         | DevOps: Блок 2-3     |
25-45м  | Frontend: Блок 3         | DevOps: Блок 4-5     |
45-55м  | Frontend: Блок 4-5       | DevOps: Блок 6-7     |
55-100м |                          | DevOps: Блок 8       |
100+м   | READY                    | READY                |

ПАРАЛЛЕЛЬНО: 100 минут
vs ПОСЛЕДОВАТЕЛЬНО: 155 минут
УСКОРЕНИЕ: 1.55x
```

---

## 🚀 НАЧНИТЕ СЕЙЧАС!

**Агент #2 (Frontend)**:
```bash
git checkout feature/frontend-ui
git pull origin feature/frontend-ui
cat AGENT_SPECIFICATIONS.md | grep -A 100 "АГЕНТ #2"
# Выполняйте блок за блоком!
```

**Агент #4 (DevOps)**:
```bash
git checkout feature/devops
git pull origin feature/devops
cat AGENT_SPECIFICATIONS.md | grep -A 250 "АГЕНТ #4"
# Выполняйте блок за блоком!
```

---

## 📚 КЛЮЧЕВЫЕ ФАЙЛЫ

| Файл | Назначение |
|------|-----------|
| AGENT_SPECIFICATIONS.md | **ГЛАВНЫЙ** - Ваши детальные инструкции |
| COORDINATOR_MONITORING_SESSION.md | Live dashboard мониторирования |
| COORDINATOR_VALIDATION_CHECKLIST.md | Как валидировать вашу работу |
| REPORT_RU_STATUS.md | Статус проекта на русском |

---

## 💪 УСПЕХИ!

Вы делаете эту демонстрацию успешной. Projects Architecture работает только если:

1. ✅ Агенты хорошо скоординированы
2. ✅ Инструкции ясные и детальные  
3. ✅ Валидация автоматизирована
4. ✅ Параллелизм работает

**Спасибо за участие в Projects Architecture!** 🚀

---

_Сессия: claude/kind-wozniak-qgqi2t_  
_Начало: 2026-09-21_  
_Статус: 🚀 АКТИВНО_
