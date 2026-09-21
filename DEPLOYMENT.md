# Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+
- Git

## Table of Contents

- [Development Setup](#development-setup)
- [Production Deployment](#production-deployment)
- [Monitoring](#monitoring)
- [Rollback Procedures](#rollback-procedures)
- [Health Checks](#health-checks)
- [Troubleshooting](#troubleshooting)

## Development Setup

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Node.js 18+ (for local development without containers)

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/svend4/info4project.git
cd info4project
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Start development environment:
```bash
docker compose up -d
```

4. Verify services are running:
```bash
docker compose ps
docker compose logs -f
```

5. Access the application:
- Frontend: http://localhost:80
- Backend API: http://localhost:3000
- Health check: http://localhost/health

### Stopping Development Environment

```bash
docker compose down
```

### Removing Volumes (Clean reset)

```bash
docker compose down -v
```

## Production Deployment

### Prerequisites

- Production-grade Docker registry (Docker Hub, ECR, GCR, etc.)
- Kubernetes cluster (optional, for orchestration)
- SSL/TLS certificates
- Production database server
- Monitoring and logging infrastructure

### Build and Push Images

1. Build images:
```bash
docker compose build
```

2. Tag images for registry:
```bash
docker tag info4project-backend:latest <registry>/info4project-backend:v1.0.0
docker tag info4project-frontend:latest <registry>/info4project-frontend:v1.0.0
```

3. Push to registry:
```bash
docker push <registry>/info4project-backend:v1.0.0
docker push <registry>/info4project-frontend:v1.0.0
```

### Docker Compose Deployment

1. Update `.env` for production:
```bash
NODE_ENV=production
LOG_LEVEL=warn
BACKEND_PORT=3000
REACT_APP_API_URL=https://api.yourdomain.com
```

2. Deploy stack:
```bash
docker compose -f docker-compose.yml up -d
```

3. Verify deployment:
```bash
docker compose ps
docker compose logs
```

## Monitoring

### Container Logs

View logs for specific service:
```bash
docker compose logs backend
docker compose logs frontend
```

Follow logs in real-time:
```bash
docker compose logs -f backend
```

View last N lines:
```bash
docker compose logs --tail=100 backend
```

### Resource Usage Statistics

Monitor container resource usage:
```bash
docker stats
docker stats info4project-backend
docker stats info4project-frontend
```

## Rollback Procedures

### Immediate Rollback (Docker Compose)

1. Stop current stack:
```bash
docker compose down
```

2. Restart with previous image:
```bash
docker compose up -d
```

## Health Checks

### Backend Health Endpoint

```bash
curl -f http://localhost:3000/api/tasks
echo $?  # Exit code 0 = healthy
```

### Frontend Health Endpoint

```bash
curl -f http://localhost/health
echo $?  # Exit code 0 = healthy
```

## Support and Documentation

For additional help:
- GitHub Issues: https://github.com/svend4/info4project/issues
- Documentation: See README.md
- Contact: stefan.engel.de@gmail.com
