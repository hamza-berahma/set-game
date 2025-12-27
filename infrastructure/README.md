# Infrastructure Setup

This directory contains Docker Compose configuration for the complete SET game application stack.

## Services

- **PostgreSQL**: Database server (port 5432)
- **Redis**: Cache server (port 6379)
- **Backend**: Node.js/Express API server (port 5000)
- **Frontend**: React application served via Nginx (port 3000)

## Prerequisites

- Docker and Docker Compose installed
- Ports 3000, 5000, 5432, and 6379 available

## Quick Start (Full Stack)

Start the entire application stack with one command:

```bash
# From project root
sudo docker-compose -f infrastructure/docker-compose.yml up -d

# Or from infrastructure directory
cd infrastructure
sudo docker-compose up -d
```

This will start:
- PostgreSQL database
- Redis cache
- Backend API server
- Frontend web application

Access the application at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

## Setup Options

**Note:** These commands require `sudo` on most Linux systems.

### Start all services (full stack)

```bash
sudo docker-compose -f infrastructure/docker-compose.yml up -d
```

### Start infrastructure only (database + Redis)

```bash
# Start PostgreSQL and Redis only
sudo docker-compose -f infrastructure/docker-compose.yml up -d postgres redis
```

### Start individual services

```bash
# Start PostgreSQL only
sudo docker-compose -f infrastructure/docker-compose.yml up -d postgres

# Start Redis only
sudo docker-compose -f infrastructure/docker-compose.yml up -d redis

# Start Backend only (requires postgres and redis)
sudo docker-compose -f infrastructure/docker-compose.yml up -d backend

# Start Frontend only (requires backend)
sudo docker-compose -f infrastructure/docker-compose.yml up -d frontend
```

### Stop services

```bash
# Stop all services
sudo docker-compose -f infrastructure/docker-compose.yml down

# Stop and remove volumes (WARNING: deletes data)
sudo docker-compose -f infrastructure/docker-compose.yml down -v
```

### Fix container name conflicts

If you get an error about container names already being in use:

```bash
# Option 1: Use docker-compose down (recommended)
sudo docker-compose -f infrastructure/docker-compose.yml down

# Option 2: Manually remove containers
sudo docker stop setgame-db setgame-redis setgame-backend setgame-frontend
sudo docker rm setgame-db setgame-redis setgame-backend setgame-frontend

# Option 3: Use cleanup script
./infrastructure/cleanup.sh
```

### View logs

```bash
# All services
sudo docker-compose -f infrastructure/docker-compose.yml logs -f

# Individual services
sudo docker-compose -f infrastructure/docker-compose.yml logs -f redis
sudo docker-compose -f infrastructure/docker-compose.yml logs -f postgres
sudo docker-compose -f infrastructure/docker-compose.yml logs -f backend
sudo docker-compose -f infrastructure/docker-compose.yml logs -f frontend
```

### Check service status

```bash
sudo docker-compose -f infrastructure/docker-compose.yml ps
```

### Rebuild services

```bash
# Rebuild all services
sudo docker-compose -f infrastructure/docker-compose.yml build

# Rebuild specific service
sudo docker-compose -f infrastructure/docker-compose.yml build backend
sudo docker-compose -f infrastructure/docker-compose.yml build frontend

# Rebuild and restart
sudo docker-compose -f infrastructure/docker-compose.yml up -d --build
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

## Docker Configuration

### Backend Service

The backend service:
- Builds TypeScript code during image build
- Connects to PostgreSQL and Redis via Docker network
- Uses environment variables for configuration
- Exposes port 5000

### Frontend Service

The frontend service:
- Builds React/Vite application during image build
- Serves static files via Nginx
- Configured for SPA routing
- Exposes port 3000 (mapped from container port 80)

### Network

All services run on a shared Docker network (`setgame-network`) allowing them to communicate using service names:
- Backend connects to `postgres:5432` and `redis:6379`
- Frontend connects to `backend:5000` for API calls

## Environment Variables

### Backend Environment Variables

Set these in `docker-compose.yml` or via `.env` file:

- `NODE_ENV`: Environment mode (production/development)
- `PORT`: Server port (default: 5000)
- `DB_HOST`: PostgreSQL host (use `postgres` in Docker)
- `DB_PORT`: PostgreSQL port (default: 5432)
- `DB_NAME`: Database name (default: setgame)
- `DB_USER`: Database user (default: setgame)
- `DB_PASSWORD`: Database password
- `REDIS_URL`: Redis connection URL (use `redis://redis:6379` in Docker)
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Allowed CORS origins

### Frontend Environment Variables

Build-time variables (set during `docker build`):

- `VITE_API_URL`: Backend API URL (default: http://localhost:5000)

For production builds, you may need to rebuild the frontend image with the correct API URL:

```bash
sudo docker-compose -f infrastructure/docker-compose.yml build --build-arg VITE_API_URL=http://localhost:5000 frontend
```

## Development vs Production

### Development (Local)

Run services individually for development:

```bash
# Start only infrastructure
sudo docker-compose -f infrastructure/docker-compose.yml up -d postgres redis

# Run backend locally
cd backend
npm install
npm run dev

# Run frontend locally
cd frontend
npm install
npm run dev
```

### Production (Docker)

Run everything in Docker:

```bash
sudo docker-compose -f infrastructure/docker-compose.yml up -d
```

