# info4project — Система управления задачами (Task Management System)

Полнофункциональное клиент-серверное веб-приложение для управления задачами (REST API на Node.js/Express + SPA на React) с набором модульных, интеграционных, нагрузочных и security-тестов, Docker/nginx-инфраструктурой, CI/CD-пайплайном и документацией по иерархической координации агентов разработки.

## Структура проекта (`main`)

```text
├── .env.example                       # Шаблон переменных окружения
├── .github/workflows/ci-cd.yml        # GitHub Actions CI/CD (test-backend, test-frontend, build-docker, integration-tests, security-scan)
├── AGENT_SPECIFICATIONS.md            # Технические спецификации для агентов Frontend и DevOps
├── COORDINATOR_MONITORING_SESSION.md  # Панель мониторинга сессии координатора
├── DEPLOYMENT.md                      # Руководство по развёртыванию, мониторингу и откату
├── DEVOPS_COORDINATOR_MESSAGE.md      # Инструкции координатора для DevOps
├── FRONTEND_COORDINATOR_MESSAGE.md    # Инструкции координатора для Frontend
├── LICENSE                            # Лицензия GNU AGPL v3
├── README.md                          # Документация репозитория
├── START_DEVOPS_NOW.md                # Быстрый старт DevOps-агента
├── START_FRONTEND_NOW.md              # Быстрый старт Frontend-агента
├── docker-compose.yml                 # Оркестрация сервисов backend и frontend (сеть task-network)
├── docker/
│   ├── Dockerfile.backend             # Образ backend (node:18-alpine)
│   ├── Dockerfile.frontend            # Multi-stage сборка frontend (node:18-alpine -> nginx:alpine)
│   └── nginx.conf                     # Конфигурация nginx (статика, проксирование /api -> backend:3000, /health)
├── backend/
│   ├── package.json                   # Express 4, Jest, Supertest
│   ├── jest.config.js
│   ├── server.js                      # Express REST API с хранением задач в памяти
│   ├── src/db/                        # Модули подключения и оптимизации запросов (index.js, query-optimization.js)
│   └── tests/                         # Тесты: tasks.test.js, edge-cases.test.js, edge-cases-security.test.js, security.test.js, performance.test.js
└── frontend/
    ├── package.json                   # React 18, react-scripts 5.0.1, axios, Testing Library, Jest
    ├── jest.config.js
    ├── README.md                      # Документация frontend-приложения
    ├── src/
    │   ├── api.js                     # Клиент REST API
    │   └── components/                # App.jsx, TaskList.jsx, TaskForm.jsx, TaskItem.jsx, LoadingSpinner.jsx, *.css
    └── tests/                         # App.test.js, TaskForm.test.js, TaskItem.test.js, TaskList.test.js, LoadingSpinner.test.js, api.test.js
```

## API и технологический стек

- **Backend (`backend/server.js`):** Node.js 18+, Express `^4.18.2`.
  - Эндпоинты в `backend/server.js` на `main`: `GET /api/tasks`, `POST /api/tasks`, `GET /api/tasks/:id`, `DELETE /api/tasks/:id`.
  - Контракт ответа: `{ success, data, error? }`.
- **Frontend (`frontend/`):** React `^18.2.0`, `axios ^1.6.0`, `react-scripts 5.0.1`, тестирование через Jest + `@testing-library/react`.
- **Контейнеризация и CI/CD:** Docker, Docker Compose, nginx (порт `80` для UI и `/health`, прокси `/api` на `backend:3000`), GitHub Actions (`.github/workflows/ci-cd.yml`).

## Проверенные команды запуска и тестирования

### Локальный запуск (Node.js 18+)

```bash
# Backend (порт 3000)
cd backend
npm install
npm start       # запуск node server.js
npm test        # запуск Jest (jest --passWithNoTests)
npm run test:coverage

# Frontend
cd frontend
npm install
npm start       # сервер разработки react-scripts
npm test        # Jest с покрытием
npm run build   # production-сборка
```

### Docker Compose (по `DEPLOYMENT.md` и `docker-compose.yml`)

```bash
cp .env.example .env
docker compose up -d
docker compose ps
curl -f http://localhost:3000/api/tasks
curl -f http://localhost/health
```

> **Примечание по `docker/Dockerfile.backend` в `main`:** в `docker/Dockerfile.backend` указаны `COPY src/ ./src/` и `CMD ["node", "src/server.js"]`, тогда как в ветке `main` точка входа сервера находится в `backend/server.js` (`"main": "server.js"`, `"start": "node server.js"` в `backend/package.json`), а вариант `backend/src/server.js` размещён в ветке `feature/testing-ci`.

## Ветки репозитория

- `main` — защищённая основная ветка (включает код `backend/` и `frontend/`, Docker-конфигурацию, CI/CD-воркфлоу `.github/workflows/ci-cd.yml` и объединённый `DEPLOYMENT.md`; в неё влиты изменения из `feature/backend-api`, `feature/frontend-ui`, `feature/devops` и PR [#1](../../pull/1) из `svend4-patch-1`).
- `feature/testing-ci` — неслитая ветка с альтернативной структурой `backend/src/server.js` (включая `PUT /api/tasks/:id` и `uuid`), `playwright.config.js`, `backend/tests/e2e.test.js`, `backend/tests/playwright/`, `backend/README.md` и workflow `.github/workflows/test.yml`.
- `claude/kind-wozniak-qgqi2t` — неслитая ветка с полным комплектом координационных отчётов, чеклистов валидации и брифингов (`ACTIVATION_PACKAGE_BRIGADA_1..3.md`, `AGENTS_BRIEFING.md`, `COORDINATION_READY.md`, `COORDINATOR_ACTIVATION_ORDER.md`, `COORDINATOR_LIVE_SESSION.md`, `COORDINATOR_VALIDATION_CHECKLIST.md`, `DAILY_REPORT_2026_09_21.md`, `HIERARCHICAL_AGENT_MANAGEMENT.md`, `PROJECTS_ARCHITECTURE_SUCCESS.md`, `REPORT_RU_STATUS.md`, `TEAM_LEAD_BRIEFING_RU.md`, `ГЛАВНЫЙ_ОТЧЕТ_РУ.md`, `monitor_agents.sh`).
- `codex/readme-overview-20261118` — неслитая ветка с открытым draft PR [#2](../../pull/2) («Add concise project README»).
- `feature/backend-api`, `feature/frontend-ui`, `feature/devops`, `svend4-patch-1` — ветки предыдущих этапов разработки, изменения которых уже вошли в `main`.

## Лицензия

В ветке `main` репозиторий распространяется под лицензией **GNU Affero General Public License v3** (см. файл `LICENSE`). В `backend/package.json` указана лицензия ISC, а в `backend/README.md` ветки `feature/testing-ci` упоминается MIT.
