# Redis Setup Guide for Railway

Redis is used for two purposes in this application:
1. **Socket.IO Adapter** - Enables horizontal scaling (multiple backend instances can share WebSocket connections)
2. **Game State Caching** - Caches game states for faster retrieval

## Quick Setup on Railway

### Step 1: Add Redis Service

1. Go to your Railway project dashboard
2. Click **"+ New"** → **"Database"** → **"Add Redis"**
3. Railway will automatically create a Redis instance

### Step 2: Link Redis to Backend

1. Go to your **backend service** → **Variables** tab
2. Click **"+ New Variable"**
3. Click **"Add Reference"** (this links the Redis service)
4. Select **"REDIS_URL"** from the Redis service
5. Railway will automatically set `REDIS_URL` with the connection string

**OR manually add:**
- Go to **Redis service** → **Variables** tab
- Copy the `REDIS_URL` value
- Go to **Backend service** → **Variables** tab
- Add: `REDIS_URL=<paste-the-redis-url>`

### Step 3: Verify Connection

After redeploying the backend, check the logs. You should see:

**Success:**
```
Redis client connecting...
Redis client ready
Socket.IO Redis adapter initialized - horizontal scaling enabled
```

**If Redis is not available (fallback mode):**
```
Redis not available - falling back to in-memory storage
Redis not available - using in-memory Socket.IO adapter (single instance only)
```

## How It Works

### Without Redis (Current State)
- ✅ Application works fine
- ✅ Game state stored in memory
- ✅ Socket.IO works with single instance
- ❌ Cannot scale to multiple backend instances
- ❌ Game state lost on server restart

### With Redis
- ✅ Horizontal scaling enabled (multiple backend instances)
- ✅ Game state persisted across restarts
- ✅ Faster game state retrieval
- ✅ WebSocket events shared across all instances

## Configuration

The application automatically detects Redis via the `REDIS_URL` environment variable:

```env
REDIS_URL=redis://default:password@hostname:port
```

Railway automatically provides this when you link the Redis service.

## Troubleshooting

### Redis Not Connecting

1. **Check REDIS_URL is set:**
   - Go to backend service → Variables
   - Verify `REDIS_URL` exists and has a value

2. **Check Redis service is running:**
   - Go to Redis service → Check status is "Active"

3. **Check logs:**
   - Look for Redis connection errors in backend logs
   - Common errors:
     - `ECONNREFUSED` - Redis service not running
     - `ENOTFOUND` - Invalid Redis URL
     - `Authentication failed` - Wrong password

### Redis Connection Timeout

The application has a 2-second connection timeout. If Redis takes longer to start:
- Wait for Redis service to fully start
- Redeploy backend service

### Fallback Behavior

The application gracefully falls back to in-memory storage if Redis is unavailable:
- Game state stored in memory (lost on restart)
- Socket.IO uses in-memory adapter (single instance only)
- Application continues to work normally

## Testing Redis Connection

After setup, you can verify Redis is working:

1. **Check backend logs** for "Redis client ready"
2. **Create a game room** - should work normally
3. **Check Redis service metrics** in Railway dashboard

## Cost Considerations

- Railway Redis is included in Railway's pricing
- Check Railway pricing page for current Redis costs
- For development, you can use Railway's free tier Redis

## Production Recommendations

1. **Enable Redis persistence** (if available in Railway Redis)
2. **Monitor Redis memory usage** via Railway dashboard
3. **Set up Redis backups** (if critical data is stored)
4. **Use Redis for session storage** (future enhancement)

## Manual Redis Setup (Alternative)

If you prefer to use an external Redis service:

1. Get Redis URL from your provider (e.g., Upstash, Redis Cloud)
2. Add to backend service variables:
   ```
   REDIS_URL=redis://username:password@hostname:port
   ```
3. Redeploy backend service

