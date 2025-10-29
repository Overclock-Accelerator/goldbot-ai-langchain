# Docker Deployment Guide

Complete guide for running GoldBot AI with Docker and Docker Compose.

## Quick Start (Development)

```bash
# Start both Next.js app and LangGraph server
docker compose up

# Or run in background
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

Access:
- **Next.js App**: http://localhost:3002
- **LangGraph API**: http://localhost:2024
- **LangGraph Studio**: https://smith.langchain.com/studio?baseUrl=http://localhost:2024

---

## Architecture

### Development Setup (`docker-compose.yml`)
- **In-memory storage**: No persistence between restarts
- **Fast startup**: ~30 seconds
- **Use case**: Local development, demos, testing
- **Services**:
  - `langgraph-server` - LangGraph Platform API (port 2024)
  - `nextjs-app` - Next.js application (port 3002)

### Production Setup (`docker-compose.prod.yml`)
- **Persistent storage**: Redis + PostgreSQL
- **Thread persistence**: Conversations survive restarts
- **Use case**: Production deployment, staging
- **Services**:
  - `redis` - Checkpointing and caching (port 6379)
  - `postgres` - Thread and conversation storage (port 5432)
  - `langgraph-server` - LangGraph Platform API (port 2024)
  - `nextjs-app` - Next.js application (port 3002)

---

## Prerequisites

### Required
- Docker 20.10+ (`docker --version`)
- Docker Compose 2.0+ (`docker compose version`)
- `.env.local` file with required environment variables

### Environment Variables

Create `.env.local` (already exists):
```bash
# Required
ANTHROPIC_API_KEY=sk-ant-...
GOLDAPI_KEY=goldapi-...

# Optional (LangSmith observability)
LANGSMITH_API_KEY=lsv2_pt_...
LANGSMITH_TRACING_V2=true
LANGSMITH_PROJECT=goldbot-ai
```

For production, add:
```bash
# Production-specific
POSTGRES_PASSWORD=your_secure_password_here
```

---

## Development Commands

### Basic Operations
```bash
# Start services
docker compose up

# Start in background
docker compose up -d

# Stop services
docker compose down

# Stop and remove volumes
docker compose down -v

# Restart a specific service
docker compose restart nextjs-app
docker compose restart langgraph-server

# View logs
docker compose logs -f
docker compose logs -f nextjs-app
docker compose logs -f langgraph-server
```

### Rebuilding
```bash
# Rebuild images after code changes
docker compose up --build

# Rebuild specific service
docker compose up --build nextjs-app
```

### Shell Access
```bash
# Access Next.js container
docker compose exec nextjs-app sh

# Access LangGraph container
docker compose exec langgraph-server sh

# Run npm commands
docker compose exec nextjs-app npm install <package>
docker compose exec nextjs-app npm run lint
```

---

## Production Deployment

### 1. Configure Environment
```bash
# Copy environment file
cp .env.local .env.production

# Edit production settings
nano .env.production

# Set secure PostgreSQL password
echo "POSTGRES_PASSWORD=$(openssl rand -base64 32)" >> .env.production
```

### 2. Start Production Stack
```bash
# Start with production config
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check health status
docker compose -f docker-compose.prod.yml ps
```

### 3. Verify Services
```bash
# Check LangGraph health
curl http://localhost:2024/ok
# Expected: {"ok":true}

# Check Next.js
curl http://localhost:3002
# Expected: HTML response

# Check Redis
docker compose -f docker-compose.prod.yml exec redis redis-cli ping
# Expected: PONG

# Check PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres pg_isready -U goldbot
# Expected: /var/run/postgresql:5432 - accepting connections
```

### 4. Database Management
```bash
# Access PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres psql -U goldbot -d goldbot

# Backup database
docker compose -f docker-compose.prod.yml exec postgres pg_dump -U goldbot goldbot > backup.sql

# Restore database
docker compose -f docker-compose.prod.yml exec -T postgres psql -U goldbot goldbot < backup.sql

# View database size
docker compose -f docker-compose.prod.yml exec postgres psql -U goldbot -d goldbot -c "SELECT pg_size_pretty(pg_database_size('goldbot'));"
```

### 5. Production Operations
```bash
# Stop production stack
docker compose -f docker-compose.prod.yml down

# Update code and redeploy
git pull
docker compose -f docker-compose.prod.yml up -d --build

# View resource usage
docker stats

# Clean up old images
docker image prune -a
```

---

## Health Checks

All services include health checks for reliability:

### LangGraph Server
- **Endpoint**: `http://localhost:2024/ok`
- **Interval**: Every 10 seconds
- **Retries**: 5 attempts
- **Start period**: 30 seconds

### Next.js App
- **Endpoint**: `http://localhost:3002`
- **Interval**: Every 10 seconds
- **Retries**: 3 attempts
- **Start period**: 20 seconds

### Redis (Production)
- **Command**: `redis-cli ping`
- **Interval**: Every 5 seconds
- **Retries**: 5 attempts

### PostgreSQL (Production)
- **Command**: `pg_isready -U goldbot`
- **Interval**: Every 5 seconds
- **Retries**: 5 attempts
- **Start period**: 10 seconds

---

## Networking

Services communicate over the `goldbot-network` bridge:

| Service | Internal Host | External Port |
|---------|---------------|---------------|
| Next.js | `nextjs-app` | 3002 |
| LangGraph | `langgraph-server` | 2024 |
| Redis | `redis` | 6379 (prod only) |
| PostgreSQL | `postgres` | 5432 (prod only) |

Internal service-to-service communication:
```javascript
// Next.js → LangGraph
const langgraphUrl = process.env.LANGGRAPH_API_URL || 'http://langgraph-server:2024';

// LangGraph → Redis (production)
const redisUri = 'redis://redis:6379';

// LangGraph → PostgreSQL (production)
const postgresUri = 'postgres://goldbot:password@postgres:5432/goldbot';
```

---

## Volumes

### Development
- `node_modules` - Excludes local node_modules for container independence
- `.next` - Excludes Next.js build cache
- Project root - Mounted for hot-reload

### Production
- `langgraph-data` - PostgreSQL persistent storage
- `redis-data` - Redis persistent storage

Manage volumes:
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect goldbot-ai_langgraph-data

# Backup volume
docker run --rm -v goldbot-ai_langgraph-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data

# Restore volume
docker run --rm -v goldbot-ai_langgraph-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /

# Remove volumes (⚠️ destroys data)
docker compose -f docker-compose.prod.yml down -v
```

---

## Troubleshooting

### Service Won't Start
```bash
# Check logs
docker compose logs langgraph-server
docker compose logs nextjs-app

# Check if ports are in use
lsof -i :2024
lsof -i :3002

# Kill conflicting processes
lsof -ti:2024 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### Health Check Failures
```bash
# Check service health
docker compose ps

# Manually test health endpoint
docker compose exec langgraph-server wget -O- http://localhost:2024/ok
docker compose exec nextjs-app wget -O- http://localhost:3002

# Increase health check timeout (edit docker-compose.yml)
healthcheck:
  start_period: 60s  # Increase from 30s
```

### Database Connection Issues (Production)
```bash
# Test PostgreSQL connection
docker compose -f docker-compose.prod.yml exec postgres psql -U goldbot -d goldbot -c "SELECT 1;"

# Check Redis connection
docker compose -f docker-compose.prod.yml exec redis redis-cli ping

# Verify environment variables
docker compose -f docker-compose.prod.yml exec langgraph-server env | grep -E 'REDIS|POSTGRES'
```

### Out of Disk Space
```bash
# Clean up Docker resources
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Check disk usage
docker system df
```

### Permission Issues
```bash
# Fix ownership (Linux/macOS)
sudo chown -R $USER:$USER .

# Reset file permissions
find . -type f -exec chmod 644 {} \;
find . -type d -exec chmod 755 {} \;
```

---

## Performance Optimization

### Development
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1
export COMPOSE_DOCKER_CLI_BUILD=1

# Limit CPU/memory
docker compose up --scale nextjs-app=1 --cpus=2 --memory=4g
```

### Production
```bash
# Add resource limits to docker-compose.prod.yml
services:
  nextjs-app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

---

## Monitoring

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f nextjs-app

# Last 100 lines
docker compose logs --tail=100

# Since timestamp
docker compose logs --since 2024-01-01T10:00:00
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Container processes
docker compose top
```

### LangSmith Observability
All LangGraph operations are traced in LangSmith:
- URL: https://smith.langchain.com/
- Project: `goldbot-ai`

---

## Migration from Local to Docker

### 1. Stop Local Services
```bash
# Kill existing processes
lsof -ti:2024 | xargs kill -9
lsof -ti:3002 | xargs kill -9
```

### 2. Start Docker Services
```bash
docker compose up -d
```

### 3. Verify Migration
```bash
# Test chat endpoint
curl -X POST http://localhost:3002/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the current gold price?"}'
```

---

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build images
        run: docker compose -f docker-compose.prod.yml build

      - name: Run tests
        run: docker compose -f docker-compose.prod.yml up -d

      - name: Health check
        run: |
          sleep 30
          curl -f http://localhost:2024/ok
          curl -f http://localhost:3002
```

---

## Security Best Practices

1. **Environment Variables**
   - Never commit `.env.local` or `.env.production`
   - Use Docker secrets for production passwords
   - Rotate API keys regularly

2. **Network Security**
   - Use internal networks for service communication
   - Expose only necessary ports
   - Implement rate limiting

3. **Container Security**
   - Run containers as non-root user (already configured)
   - Keep base images updated
   - Scan images for vulnerabilities

4. **Production Hardening**
   ```bash
   # Use read-only root filesystem
   read_only: true

   # Drop unnecessary capabilities
   cap_drop:
     - ALL

   # Prevent privilege escalation
   security_opt:
     - no-new-privileges:true
   ```

---

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [LangGraph Platform Docs](https://langchain-ai.github.io/langgraph/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment)
- [LangSmith Documentation](https://docs.smith.langchain.com/)

---

## Support

If you encounter issues:
1. Check this documentation's troubleshooting section
2. Review service logs: `docker compose logs -f`
3. Verify environment variables are set correctly
4. Ensure Docker daemon is running: `docker ps`
5. Check health status: `docker compose ps`
