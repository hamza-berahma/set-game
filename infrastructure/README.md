# Infrastructure Setup

This directory contains Docker Compose configuration for the SET game backend services.

## Services

- **PostgreSQL**: Database server (port 5432)
- **Redis**: Cache server (port 6379)

## Prerequisites

- Docker and Docker Compose installed
- Ports 5432 and 6379 available

## Setup

### Start all services

```bash
docker-compose up -d
```

### Start individual services

```bash
# Start PostgreSQL only
docker-compose up -d postgres

# Start Redis only
docker-compose up -d redis
```

### Stop services

```bash
docker-compose down
```

### View logs

```bash
# All services
docker-compose logs -f

# Redis only
docker-compose logs -f redis

# PostgreSQL only
docker-compose logs -f postgres
```

### Check service status

```bash
docker-compose ps
```

## Redis Configuration

Redis is configured with:
- **Port**: 6379
- **Persistence**: AOF (Append Only File) enabled
- **TTL**: Game states expire after 24 hours

The backend will automatically connect to Redis at `redis://localhost:6379`. You can override this by setting the `REDIS_URL` environment variable.

### Test Redis Connection

```bash
# Connect to Redis CLI
docker exec -it setgame-redis redis-cli

# Test commands in Redis CLI
PING  # Should return PONG
SET test "hello"  # Set a test key
GET test  # Should return "hello"
```

## PostgreSQL Configuration

PostgreSQL is configured with:
- **User**: setgame
- **Password**: yourpassword
- **Database**: setgame
- **Port**: 5432

## Environment Variables

The backend expects these environment variables (can be set in `.env` file):

- `REDIS_URL`: Redis connection URL (default: `redis://localhost:6379`)
- Database connection is configured in `backend/src/config/database.ts`

