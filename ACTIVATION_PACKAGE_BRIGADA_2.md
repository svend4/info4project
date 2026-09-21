# 📦 ПАКЕТ АКТИВАЦИИ - БРИГАДИР #2 (DEVOPS)

**От**: Координатор Stefan Engel  
**Кому**: Бригадир #2 (DevOps Team Lead)  
**Время**: 2026-09-21 08:00  
**Ветка**: feature/devops  
**Задача**: 100 минут, 8 блоков, Docker + CI/CD инфраструктура

---

## 🎯 ВАШ КЛАСТЕР

Вы отвечаете за DevOps инфраструктуру. Под вашим управлением три агента:

- **Агент #4A**: Docker backend (Docker Backend)
- **Агент #4B**: Docker frontend (Docker Frontend)
- **Агент #4C**: Инфраструктура (Infrastructure/Compose)

---

## 📋 ВАШ ПОЛНЫЙ ПЛАН НА ДЕНЬ

### Блок 1 (0-5 минут): Инициализация
```bash
git checkout feature/devops
git pull origin feature/devops
mkdir -p docker .github/workflows
```
**Ответственный**: Агент #4A  
**Валидация**: Директории docker/ и .github/workflows/ созданы

---

### Блок 2 (5-20 минут): Dockerfile.backend

```dockerfile
FROM node:18-alpine

WORKDIR /app/backend

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --only=production

# Copy application code
COPY src/ ./src/
COPY .env.example .env

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD curl -f http://localhost:3000/api/tasks || exit 1

# Run as non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "src/server.js"]
```

**Файл**: docker/Dockerfile.backend  
**Ответственный**: Агент #4A  
**Валидация**:
- docker build -f docker/Dockerfile.backend . (успешна)
- Образ компилируется без ошибок
- FROM node:18-alpine используется
- HEALTHCHECK добавлен

---

### Блок 3 (20-35 минут): Dockerfile.frontend

```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder

WORKDIR /app/frontend

COPY package*.json ./
RUN npm ci

COPY src/ ./src/
COPY public/ ./public/

RUN npm run build

# Stage 2: Production
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/frontend/build /usr/share/nginx/html

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Файл**: docker/Dockerfile.frontend  
**Ответственный**: Агент #4B  
**Валидация**:
- docker build -f docker/Dockerfile.frontend . (успешна)
- Образ компилируется без ошибок
- Multi-stage build используется
- nginx:alpine используется

---

### Блок 4 (35-45 минут): nginx.conf

```nginx
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    gzip on;

    server {
        listen 80;
        server_name _;

        # Frontend
        location / {
            root /usr/share/nginx/html;
            index index.html;
            try_files $uri $uri/ /index.html;
        }

        # Backend API proxy
        location /api {
            proxy_pass http://backend:3000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 30s;
            proxy_connect_timeout 10s;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
    }
}
```

**Файл**: docker/nginx.conf  
**Ответственный**: Агент #4C  
**Валидация**:
- nginx -t проходит (синтаксис валиден)
- proxy_pass http://backend:3000 направляет на правильный хост
- Health endpoint /health возвращает 200

---

### Блок 5 (45-65 минут): docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/tasks"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - task-network
    volumes:
      - ./src:/app/backend/src
      - ./data:/app/backend/data
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - task-network
    restart: unless-stopped
    environment:
      - REACT_APP_API_URL=http://localhost:3000

networks:
  task-network:
    driver: bridge

volumes:
  backend-data:
```

**Файл**: docker-compose.yml  
**Ответственный**: Агент #4C  
**Валидация**:
- docker-compose config (валидный YAML)
- Services определены: backend, frontend
- Networks настроены: task-network
- Volumes созданы для development

---

### Блок 6 (65-70 минут): .env.example

```env
# Environment
NODE_ENV=production
LOG_LEVEL=info

# Backend
BACKEND_PORT=3000
BACKEND_HOST=localhost

# Frontend
FRONTEND_PORT=80
REACT_APP_API_URL=http://localhost:3000
```

**Файл**: .env.example  
**Ответственный**: Агент #4B  
**Валидация**:
- Файл .env.example создан
- Все необходимые переменные есть
- Комментарии ясные

---

### Блок 7 (70-90 минут): CI/CD Pipeline

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop, feature/*]
  pull_request:
    branches: [main, develop]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - run: npm run lint

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm ci
      - run: cd frontend && npm test -- --coverage
      - run: cd frontend && npm run lint

  build-docker:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - run: docker build -f docker/Dockerfile.backend -t backend:latest .
      - run: docker build -f docker/Dockerfile.frontend -t frontend:latest .

  integration-tests:
    needs: build-docker
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: docker-compose up -d
      - run: sleep 10
      - run: curl -f http://localhost:3000/api/tasks
      - run: curl -f http://localhost/health
      - run: docker-compose down

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: snyk/actions/node@master
```

**Файл**: .github/workflows/ci-cd.yml  
**Ответственный**: Агент #4B  
**Валидация**:
- YAML синтаксис валиден
- Jobs определены: test-backend, test-frontend, build-docker, integration-tests, security-scan
- Зависимости настроены: needs

---

### Блок 8 (90-100 минут): DEPLOYMENT.md

```markdown
# Deployment Guide

## Development

```bash
docker-compose up -d
```

Backend: http://localhost:3000
Frontend: http://localhost

## Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

```bash
docker-compose logs -f
docker stats
```

## Rollback

```bash
docker-compose down
git checkout previous-tag
docker-compose up -d
```
```

**Файл**: DEPLOYMENT.md  
**Ответственный**: Агент #4C  
**Валидация**:
- DEPLOYMENT.md создан
- Инструкции для development, production, rollback
- Примеры команд ясные

---

## 📞 ВА ША РОЛЬ КАК БРИГАДИРА

### Каждый час (09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 16:00):
```
Быстрая синхронизация со своими агентами:
1. Какой блок сейчас делаете?
2. Какой процент завершено?
3. Есть ли проблемы?
4. Нужна ли моя помощь?
```

### Каждые 2 часа (10:00, 12:00, 14:00, 16:00):
```
Детальная проверка:
1. git log feature/devops -1 --oneline
2. docker build -f docker/Dockerfile.backend .
   (компилируется? нет ошибок?)
3. docker build -f docker/Dockerfile.frontend .
4. docker-compose config
   (YAML валиден?)
5. nginx -t
   (синтаксис OK?)
```

### 17:00 - Ежедневный отчет:
```
Координатору:

"Привет! Вот статус DevOps кластера:

БЛОКИ:
✅ Блок 1: Готов! (5 мин)
✅ Блок 2: Готов! (15 мин)
✅ Блок 3: Готов! (15 мин)
✅ Блок 4: Готов! (10 мин)
✅ Блок 5: Готов! (20 мин)
✅ Блок 6: Готов! (5 мин)
✅ Блок 7: Готов! (20 мин)
✅ Блок 8: Готов! (10 мин)

МЕТРИКИ:
- Docker builds: Успешны ✓
- YAML: Валиден ✓
- CI/CD: Настроена ✓
- Commits: 8 новых коммитов ✓

БЛОКИРОВКИ: НЕТ ✓

ETA ЗАВЕРШЕНИЯ: ГОТОВ!

Нужна ли моя помощь? НЕТ, ВСЕ ГЛАДКО!"
```

---

## 🎯 ФИНАЛЬНАЯ КОНТРОЛЬНАЯ ТОЧКА

Перед 17:00 отчетом проверьте:

```
☑️ docker build успешен? (обе Dockerfiles)
☑️ docker-compose config валиден?
☑️ nginx -t прошел?
☑️ git push выполнен?
☑️ YAML файлы без ошибок?
☑️ Коммиты регулярные (каждые 15-20 мин)?

ЕСЛИ ВСЕ ☑️: Отправьте мне 17:00 отчет!
```

---

**Начинайте сейчас! Первый блок - это инициализация (mkdir).**

Удачи! 🚀

---

_Пакет активации Бригадира #2_  
_Координатор Stefan Engel_  
_2026-09-21 08:00_
