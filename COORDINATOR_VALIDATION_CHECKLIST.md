# ✅ КООРДИНАТОРСКАЯ ЧЕКЛИСТ ВАЛИДАЦИИ

**Назначение**: Быстрая валидация коммитов агентов без написания кода  
**Инструмент**: Git hooks + manual review  
**Метода**: Validate, Help, NOT Write

---

## 📋 FRONTEND VALIDATION CHECKLIST (Agent #2)

### Блок 1: Project Initialization
**После коммита:**
```bash
✓ git log origin/feature/frontend-ui | head -1
✓ ls -la frontend/
✓ cat frontend/package.json | grep -E "react|axios|jest"
```

**Критерии успеха:**
- [ ] frontend/ директория существует
- [ ] package.json имеет React, axios, jest, @testing-library/react
- [ ] node_modules/ создана (check by: npm list react)
- [ ] Нет npm ERR в логах

---

### Блок 2: Component Structure
**После коммита:**
```bash
✓ ls -la frontend/src/components/
✓ wc -l frontend/src/components/*.jsx
✓ grep -l "useState\|useEffect" frontend/src/components/*.jsx
```

**Критерии успеха:**
- [ ] App.jsx существует (>50 строк кода)
- [ ] TaskList.jsx существует (>40 строк)
- [ ] TaskForm.jsx существует (>60 строк)
- [ ] TaskItem.jsx существует (>40 строк)
- [ ] LoadingSpinner.jsx существует (>20 строк)
- [ ] api.js существует (>100 строк с валидацией контрактов)

**API Contract Validation:**
```bash
✓ grep -A 5 "GET.*tasks" frontend/src/api.js
✓ grep -A 5 "POST.*tasks" frontend/src/api.js
✓ grep -A 5 "response.success" frontend/src/api.js
✓ grep -A 5 "try.*catch" frontend/src/api.js
```

**Критерии успеха:**
- [ ] Используются endpoints: /api/tasks, /api/tasks/:id
- [ ] Проверяется response.success
- [ ] Обработана ошибка через response.error
- [ ] Используется try/catch для всех API вызовов

---

### Блок 3: Test Implementation
**После коммита:**
```bash
✓ ls -la frontend/tests/
✓ grep -c "test(" frontend/tests/*.js
✓ grep -c "describe(" frontend/tests/*.js
```

**Критерии успеха:**
- [ ] api.test.js существует (минимум 8 тестов)
- [ ] App.test.js существует (минимум 6 тестов)
- [ ] Есть describe блоки для организации
- [ ] Используются proper Arrange-Act-Assert паттерны

---

### Блок 4: Test Execution
**Запустить:**
```bash
cd frontend
npm test -- --coverage 2>&1 | tee test-output.log
```

**Критерии успеха:**
- [ ] "Tests: X passed" (все тесты ЗЕЛЁНЫЕ)
- [ ] Coverage: Line Coverage >80%
- [ ] Coverage: Branch Coverage >75%
- [ ] Coverage: Function Coverage >80%
- [ ] Нет ошибок типов или синтаксиса

**Если падают тесты:**
- ❌ НЕ исправляй код сам!
- ✅ Скопируй логи ошибок
- ✅ Отправь агенту: "Test X падает потому что... Проверь строку Y в файле Z"
- ✅ Повтори валидацию

---

### Блок 5: Commit & Push
**После коммита:**
```bash
✓ git log origin/feature/frontend-ui -1 --stat
✓ git show origin/feature/frontend-ui --name-only
```

**Критерии успеха:**
- [ ] Коммит находится на origin/feature/frontend-ui
- [ ] Включены файлы: App.jsx, TaskList.jsx, api.test.js, App.test.js
- [ ] Message содержит: "✨ feat: Implement React frontend"
- [ ] Не было force-push (только regular push)

---

## 🛠️ DEVOPS VALIDATION CHECKLIST (Agent #4)

### Блок 2: Dockerfile.backend
**После коммита:**
```bash
✓ ls -la docker/Dockerfile.backend
✓ grep "FROM\|WORKDIR\|HEALTHCHECK\|USER" docker/Dockerfile.backend
✓ docker build -f docker/Dockerfile.backend -t backend-test . 2>&1 | head -20
```

**Критерии успеха:**
- [ ] Dockerfile существует
- [ ] FROM node:18-alpine (именно эта версия!)
- [ ] WORKDIR /app/backend
- [ ] HEALTHCHECK настроен (GET http://localhost:3000/api/tasks)
- [ ] USER nodejs (non-root user)
- [ ] docker build проходит БЕЗ ошибок

**Если build падает:**
- ❌ НЕ исправляй Dockerfile!
- ✅ Скопируй вывод ошибки
- ✅ Укажи на проблему: "Line X имеет синтаксис ошибку: ..."
- ✅ Помоги агенту исправить

---

### Блок 3: Dockerfile.frontend
**После коммита:**
```bash
✓ grep -A 20 "Stage 1\|Builder" docker/Dockerfile.frontend
✓ grep -A 20 "Stage 2\|Production\|nginx" docker/Dockerfile.frontend
✓ docker build -f docker/Dockerfile.frontend -t frontend-test . 2>&1 | head -20
```

**Критерии успеха:**
- [ ] Dockerfile имеет 2 стадии (Builder + Production)
- [ ] Stage 1: FROM node:18-alpine
- [ ] Stage 1: RUN npm run build
- [ ] Stage 2: FROM nginx:alpine
- [ ] Stage 2: COPY --from=builder
- [ ] docker build проходит БЕЗ ошибок
- [ ] Image размер разумный (<100MB)

---

### Блок 4: nginx.conf
**После коммита:**
```bash
✓ cat docker/nginx.conf
✓ grep -E "location|proxy_pass|add_header" docker/nginx.conf
✓ nginx -t -c docker/nginx.conf 2>&1
```

**Критерии успеха:**
- [ ] nginx.conf существует
- [ ] location / с try_files $uri /index.html
- [ ] location /api с proxy_pass http://backend:3000
- [ ] Security headers: X-Frame-Options, X-Content-Type-Options
- [ ] nginx -t проходит БЕЗ синтаксис ошибок

---

### Блок 5: docker-compose.yml
**После коммита:**
```bash
✓ docker-compose config > /dev/null 2>&1 && echo "VALID" || echo "INVALID"
✓ grep -E "service|container_name|ports|environment" docker-compose.yml
✓ docker-compose build --no-cache 2>&1 | tail -20
```

**Критерии успеха:**
- [ ] docker-compose.yml синтаксически верный (docker-compose config)
- [ ] version: '3.8'
- [ ] services: backend, frontend
- [ ] backend имеет healthcheck
- [ ] frontend зависит от backend (depends_on)
- [ ] networks: task-network
- [ ] docker-compose build проходит БЕЗ ошибок

**Если build падает:**
- Скопируй последних 20 строк ошибки
- Укажи какой сервис падает (backend или frontend)
- Помоги агенту диагностировать

---

### Блок 6-7: .env.example & CI/CD Pipeline
**После коммита:**
```bash
✓ cat .env.example | wc -l
✓ grep -E "NODE_ENV|BACKEND_PORT|FRONTEND_PORT" .env.example
✓ grep -E "test-backend|test-frontend|build-docker" .github/workflows/ci-cd.yml
```

**Критерии успеха:**
- [ ] .env.example существует
- [ ] Содержит: NODE_ENV, LOG_LEVEL, BACKEND_PORT, FRONTEND_PORT
- [ ] .github/workflows/ci-cd.yml существует
- [ ] Включены jobs: test-backend, test-frontend, build-docker, integration-tests
- [ ] YAML синтаксически верный (yamllint проверка)

---

### Блок 8: DEPLOYMENT.md
**После коммита:**
```bash
✓ cat DEPLOYMENT.md | head -30
✓ grep -E "Development|Production|docker-compose" DEPLOYMENT.md
```

**Критерии успеха:**
- [ ] DEPLOYMENT.md существует
- [ ] Содержит Development Setup раздел
- [ ] Содержит Production Deployment раздел
- [ ] Содержит Monitoring раздел
- [ ] Содержит Rollback Procedure

---

## 🚀 ИНТЕГРАЦИОННАЯ ВАЛИДАЦИЯ (When both complete)

```bash
# Pull both branches
git fetch origin
git checkout feature/frontend-ui
git pull origin feature/frontend-ui
git checkout feature/devops
git pull origin feature/devops

# Test docker-compose
docker-compose up -d
sleep 10

# API test
curl -s http://localhost:3000/api/tasks | jq '.'
# Должна вернуть: { "success": true, "data": [...], "count": N }

# Frontend health
curl -s http://localhost/health
# Должна вернуть: 200 OK

# Cleanup
docker-compose down
```

---

## 📝 КАК ИСПОЛЬЗОВАТЬ ЭТУ ЧЕКЛИСТ

1. **Каждые 3-5 минут**: Проверь git log на новые коммиты
   ```bash
   git fetch origin
   git log origin/feature/frontend-ui -3 --oneline
   git log origin/feature/devops -3 --oneline
   ```

2. **Если новый коммит**: Применить чеклист для этого Блока
   ```bash
   git show origin/feature/frontend-ui | head -50
   ```

3. **Если все критерии ✅**: Документировать в COORDINATOR_MONITORING_SESSION.md

4. **Если есть проблема ❌**:
   - ✅ Определить точную проблему
   - ✅ Дать рекомендацию агенту (но НЕ код!)
   - ✅ Повторить проверку после исправления

5. **НИКОГДА не писать код вместо агента!**

---

_Эта чеклист помогает координатору:_  
- ✅ Быстро валидировать работу
- ✅ Помогать решать проблемы
- ✅ Не писать код сам
- ✅ Фокусироваться на координации
