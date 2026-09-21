# Deployment Guide

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+
- Git

## Local Development

### Start Services
```bash
docker-compose up -d
```

### Verify Services
```bash
curl http://localhost/health              # Frontend health
curl http://localhost/api/tasks            # Backend API
```

### View Logs
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Stop Services
```bash
docker-compose down
```

## Production Deployment

### Build Images
```bash
docker build -f docker/Dockerfile.backend -t task-backend:latest .
docker build -f docker/Dockerfile.frontend -t task-frontend:latest .
```

### Push to Registry
```bash
docker tag task-backend:latest registry.example.com/task-backend:latest
docker tag task-frontend:latest registry.example.com/task-frontend:latest
docker push registry.example.com/task-backend:latest
docker push registry.example.com/task-frontend:latest
```

### Run in Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Health Checks

- **Frontend:** http://localhost/health
- **Backend:** http://localhost:3000/api/health

## Troubleshooting

### Services won't start
```bash
docker-compose logs
docker-compose restart
```

### Port conflicts
```bash
lsof -i :3000
lsof -i :80
```

### Clear everything
```bash
docker-compose down -v
docker system prune -a
```
