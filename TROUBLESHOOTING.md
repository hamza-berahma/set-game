# Troubleshooting 502 Errors on Railway

## What Was Fixed

1. **Database Connection Resilience**
   - Removed `process.exit(-1)` from database error handler
   - Server no longer crashes on database connection errors
   - Increased connection timeout from 2s to 10s for Railway

2. **Better Error Handling**
   - Added uncaught exception handlers (non-fatal)
   - Added unhandled rejection handlers (non-fatal)
   - Server continues running even if some services fail

3. **Startup Diagnostics**
   - Added startup logging to show environment status
   - Warns about missing critical environment variables
   - Tests database connection on startup (non-blocking)

## Common 502 Error Causes

### 1. Missing DATABASE_URL

**Symptoms:**
- 502 error
- Logs show "DATABASE_URL: NOT SET"

**Fix:**
1. Go to Railway dashboard
2. Add PostgreSQL service to your project
3. Go to backend service → Variables
4. Click "Add Reference" → Select PostgreSQL service
5. This will automatically set `DATABASE_URL`

### 2. Missing JWT_SECRET

**Symptoms:**
- 502 error (if server crashes)
- Logs show "JWT_SECRET: NOT SET"

**Fix:**
1. Generate a secret: `openssl rand -base64 32`
2. Go to backend service → Variables
3. Add: `JWT_SECRET=<your-generated-secret>`
4. Railway will auto-redeploy

### 3. Database Not Ready

**Symptoms:**
- 502 error
- Logs show database connection errors

**Fix:**
1. Ensure PostgreSQL service is running
2. Check that migrations have been run
3. Verify DATABASE_URL is correctly linked

### 4. Build Failed

**Symptoms:**
- 502 error
- No deployment logs

**Fix:**
1. Check build logs in Railway
2. Look for TypeScript compilation errors
3. Ensure all dependencies are in package.json

## How to Check Logs

1. Go to Railway dashboard
2. Select your backend service
3. Click "Deployments" tab
4. Click on the latest deployment
5. Click "Logs" tab
6. Look for:
   - "Server listening on 0.0.0.0:PORT" (success)
   - "DATABASE_URL: NOT SET" (missing database)
   - "JWT_SECRET: NOT SET" (missing secret)
   - Database connection errors
   - Any red error messages

## Quick Health Check

After deploying, check these endpoints:

```bash
# Basic health (should work even without database)
curl https://your-backend.railway.app/health

# Full readiness (requires database)
curl https://your-backend.railway.app/health/ready
```

Expected responses:
- `/health`: `{"status":"ok","timestamp":"..."}`
- `/health/ready`: `{"status":"ready","database":"connected",...}`

## Required Environment Variables Checklist

**Backend Service:**
- [ ] `NODE_ENV=production`
- [ ] `DATABASE_URL` (linked from PostgreSQL service)
- [ ] `JWT_SECRET` (generate with `openssl rand -base64 32`)
- [ ] `CORS_ORIGIN` (optional, set after frontend is deployed)
- [ ] `REDIS_URL` (optional, linked from Redis service if using)

## Still Getting 502?

1. **Check Railway Logs** - Most issues show up here
2. **Verify Environment Variables** - Use the checklist above
3. **Check Database Service** - Ensure PostgreSQL is running
4. **Check Build** - Ensure TypeScript compiled successfully
5. **Try Manual Restart** - Go to deployments → Click "Redeploy"

## Server Startup Messages

When the server starts successfully, you should see:
```
=== Server Startup ===
NODE_ENV: production
DATABASE_URL: Set
JWT_SECRET: Set
PORT: <railway-port>
CORS_ORIGIN: <your-frontend-url>
✓ Database connection successful
Server listening on 0.0.0.0:<port>
Socket.IO server initialized
Health check available at http://0.0.0.0:<port>/health
```

If you see warnings, address them:
- `⚠️ WARNING: DATABASE_URL not set` → Add PostgreSQL and link it
- `⚠️ WARNING: JWT_SECRET not set` → Generate and set JWT_SECRET
- `✗ Database connection failed` → Check DATABASE_URL and PostgreSQL service

