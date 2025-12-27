# Starting Redis

Redis is optional - the application will work without it using in-memory storage. However, for production use or to persist game states, Redis is recommended.

## Start Redis with Docker Compose

```bash
# Start Redis only
sudo docker-compose -f infrastructure/docker-compose.yml up -d redis

# Or start both PostgreSQL and Redis
sudo docker-compose -f infrastructure/docker-compose.yml up -d
```

## Verify Redis is Running

```bash
# Check if Redis container is running
sudo docker ps | grep redis

# Test Redis connection
sudo docker exec -it setgame-redis redis-cli PING
# Should return: PONG
```

## Stop Redis

```bash
sudo docker-compose -f infrastructure/docker-compose.yml stop redis
```

## Troubleshooting

### Redis connection errors

If you see "Redis connection error" or "Redis connection closed" messages:

1. **Check if Redis is running:**
   ```bash
   sudo docker ps | grep redis
   ```

2. **Check Redis logs:**
   ```bash
   sudo docker logs setgame-redis
   ```

3. **Start Redis if not running:**
   ```bash
   sudo docker-compose -f infrastructure/docker-compose.yml up -d redis
   ```

### Port Already in Use

If port 6379 is already in use:

```bash
# Find what's using port 6379
sudo lsof -i :6379

# Or use netstat
sudo netstat -tlnp | grep 6379
```

You can either:
- Stop the conflicting service
- Change the Redis port in `docker-compose.yml` and set `REDIS_URL` environment variable

### Application Works Without Redis

The application gracefully falls back to in-memory storage when Redis is unavailable. You'll see:
- "Redis not available - falling back to in-memory storage" warning
- Game states stored in memory (lost on server restart)
- All functionality still works

## Environment Variables

You can configure Redis connection via environment variables:

```bash
# Default: redis://localhost:6379
export REDIS_URL=redis://localhost:6379

# Custom host/port
export REDIS_URL=redis://your-redis-host:6379

# With password
export REDIS_URL=redis://:password@localhost:6379
```

Add to `.env` file in the backend directory:

```
REDIS_URL=redis://localhost:6379
```

