# Redis Integration

This document describes the Redis integration for game state caching in the SET game backend.

## Overview

Redis is used to cache active game states, providing fast access and persistence across server restarts (within the TTL window). The implementation includes automatic fallback to in-memory storage if Redis is unavailable.

## Setup

### 1. Start Redis Container

Using Docker Compose (recommended):

```bash
cd infrastructure
docker-compose up -d redis
```

Or manually with Docker:

```bash
docker run -d --name setgame-redis -p 6379:6379 redis:7-alpine
```

### 2. Configure Backend

The backend will automatically connect to Redis at `redis://localhost:6379`. To use a different Redis instance, set the `REDIS_URL` environment variable:

```bash
export REDIS_URL=redis://your-redis-host:6379
```

Or add to `.env` file:

```
REDIS_URL=redis://localhost:6379
```

### 3. Verify Connection

Start the backend server and check the logs. You should see:

```
Redis client connecting...
Redis client ready
```

If Redis is not available, you'll see:

```
Redis connection error: [error message]
Redis not available, game state not cached
```

The backend will continue to work using in-memory storage as a fallback.

## Architecture

### Components

1. **Redis Connection Module** (`src/config/redis.ts`)
   - Manages Redis client lifecycle
   - Handles connection errors gracefully
   - Provides connection status checks

2. **Redis Cache Service** (`src/services/RedisCacheService.ts`)
   - High-level interface for caching operations
   - Handles serialization/deserialization of game states
   - Manages TTL (24 hours for game states)

3. **Game Service** (`src/services/GameService.ts`)
   - Updated to use Redis cache
   - Falls back to in-memory Map if Redis unavailable
   - Transparent to other parts of the application

### Data Structure

Game states are stored in Redis with the key pattern:

```
game:state:{roomId}
```

Values are JSON-serialized `GameState` objects with:
- 24-hour TTL (automatic expiration)
- Date objects serialized as ISO strings

### Fallback Mechanism

The system gracefully degrades if Redis is unavailable:

1. **Redis available**: Game states are cached in Redis
2. **Redis unavailable**: Game states are stored in memory (Map)
3. **Redis reconnects**: Future game states will use Redis again
4. **Mixed state**: If Redis goes down mid-game, existing in-memory games continue

## API

### RedisCacheService Methods

- `saveGameState(roomId, gameState)`: Save game state with 24h TTL
- `getGameState(roomId)`: Retrieve game state from cache
- `deleteGameState(roomId)`: Delete game state from cache
- `isAvailable()`: Check if Redis is connected

### GameService Methods (Updated)

All game state operations are now async and use Redis:

- `createGame(roomId, playerIds)`: Creates game and saves to Redis
- `getGame(roomId)`: Retrieves from Redis (falls back to memory)
- `processCardSelection(...)`: Updates game state in Redis
- `updateGameState(roomId, gameState)`: Explicitly update cached state
- `deleteGame(roomId)`: Remove from Redis and memory

## Testing

Run the Redis tests:

```bash
npm test -- redis.test.ts
```

The tests will:
- Skip if Redis is not available (non-blocking)
- Test save/retrieve/delete operations
- Verify graceful fallback behavior

## Monitoring

### Check Redis Connection Status

```bash
# In Redis CLI
docker exec -it setgame-redis redis-cli
PING  # Should return PONG
```

### View Cached Game States

```bash
# List all game state keys
docker exec -it setgame-redis redis-cli KEYS "game:state:*"

# View a specific game state
docker exec -it setgame-redis redis-cli GET "game:state:room-abc123"

# Check TTL (time remaining)
docker exec -it setgame-redis redis-cli TTL "game:state:room-abc123"
```

### View Redis Logs

```bash
docker logs setgame-redis
```

## Troubleshooting

### Redis Not Connecting

1. **Check if Redis is running:**
   ```bash
   docker ps | grep redis
   ```

2. **Check Redis logs:**
   ```bash
   docker logs setgame-redis
   ```

3. **Test connection manually:**
   ```bash
   docker exec -it setgame-redis redis-cli PING
   ```

4. **Verify port is not in use:**
   ```bash
   lsof -i :6379
   ```

### Game States Not Persisting

- Check Redis connection status in backend logs
- Verify TTL hasn't expired (24 hours)
- Check Redis memory limits (shouldn't be an issue for game states)

### Performance Issues

- Redis should provide sub-millisecond access times
- If slow, check Redis logs for warnings
- Consider Redis connection pool settings if needed

## Future Enhancements

Potential improvements:

- Connection pooling for high concurrency
- Redis Cluster support for horizontal scaling
- Pub/Sub for real-time game state updates
- Redis Streams for game event logging
- Metrics and monitoring integration

