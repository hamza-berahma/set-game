# Infrastructure Setup

This directory contains Docker Compose configuration for the SET game backend services.

## Services

- **PostgreSQL**: Database server (port 5432)
- **Redis**: Cache server (port 6379)

## Prerequisites

- Docker and Docker Compose installed
- Ports 5432 and 6379 available

## Setup

**Note:** These commands require `sudo` on most Linux systems.

### Start all services

```bash
sudo docker-compose -f infrastructure/docker-compose.yml up -d
```

### Start individual services

```bash
# Start PostgreSQL only
sudo docker-compose -f infrastructure/docker-compose.yml up -d postgres

# Start Redis only
sudo docker-compose -f infrastructure/docker-compose.yml up -d redis
```

### Alternative: Run from project root

```bash
cd infrastructure
sudo docker-compose up -d
```

### Stop services

```bash
sudo docker-compose -f infrastructure/docker-compose.yml down
```

### View logs

```bash
# All services
sudo docker-compose -f infrastructure/docker-compose.yml logs -f

# Redis only
sudo docker-compose -f infrastructure/docker-compose.yml logs -f redis

# PostgreSQL only
sudo docker-compose -f infrastructure/docker-compose.yml logs -f postgres
```

### Check service status

```bash
sudo docker-compose -f infrastructure/docker-compose.yml ps
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
sudo docker exec -it setgame-redis redis-cli

# Test commands in Redis CLI
PING  # Should return PONG
SET test "hello"  # Set a test key
GET test  # Should return "hello"
```

**Note:** Redis is optional. The application will work without it using in-memory storage, but game states will not persist across server restarts. See `START_REDIS.md` in the project root for more details.

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

