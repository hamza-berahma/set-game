# Railway Deployment Setup Guide

Complete guide for setting up frontend and backend connections on Railway.

## Step-by-Step Setup

### 1. Deploy Backend First

1. Create a new Railway project
2. Add PostgreSQL service (Railway will auto-set `DATABASE_URL`)
3. Add Redis service (optional, Railway will auto-set `REDIS_URL`)
4. Deploy backend service:
   - Root Directory: `backend`
   - Railway will auto-detect Dockerfile or Nixpacks

### 2. Get Backend URL

1. Go to backend service → Settings → Networking
2. Click "Generate Domain" or use the provided Railway domain
3. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend

### 3. Configure Backend Environment Variables

Go to backend service → Variables tab and add:

**Required:**
```
NODE_ENV=production
JWT_SECRET=<generate-a-strong-random-string-min-32-chars>
```

**Optional (but recommended):**
```
CORS_ORIGIN=<will-set-after-frontend-is-deployed>
REDIS_URL=<auto-set-if-you-added-redis-service>
```

**Database:**
- `DATABASE_URL` is automatically set when you add PostgreSQL service
- Use "Add Reference" to link it to your backend service

**To generate JWT_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Run Database Migrations

After backend is deployed:

**Option A: Railway CLI**
```bash
npm i -g @railway/cli
railway login
railway link
railway run psql $DATABASE_URL -f migrations/001_initial_schema.sql
railway run psql $DATABASE_URL -f migrations/002_room_settings_and_logging.sql
```

**Option B: Railway Shell**
1. Go to backend service → Deployments → Latest deployment
2. Click "Shell" tab
3. Run:
```bash
cd /app
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_room_settings_and_logging.sql
```

### 5. Deploy Frontend

1. In the same Railway project, add a new service
2. Select your GitHub repository
3. Set Root Directory to: `frontend`
4. Railway will detect the Dockerfile

### 6. Get Frontend URL

1. Go to frontend service → Settings → Networking
2. Click "Generate Domain"
3. Copy the URL (e.g., `https://frontend-production-xxxx.up.railway.app`)
4. **Save this URL**

### 7. Configure Frontend Environment Variables

Go to frontend service → Variables tab and add:

**Required:**
```
VITE_API_URL=<your-backend-url-from-step-2>
```

**Important:** 
- Must include `https://` protocol
- Example: `VITE_API_URL=https://backend-production-xxxx.up.railway.app`
- This is a **build-time** variable - you must **redeploy** after changing it

### 8. Update Backend CORS

Go back to backend service → Variables tab:

1. Update `CORS_ORIGIN` to your frontend URL:
   ```
   CORS_ORIGIN=https://frontend-production-xxxx.up.railway.app
   ```

2. If you have multiple origins (e.g., www and non-www), separate with commas:
   ```
   CORS_ORIGIN=https://frontend-production-xxxx.up.railway.app,https://www.frontend-production-xxxx.up.railway.app
   ```

3. Railway will auto-redeploy backend when you change variables

### 9. Verify Connections

**Backend Health:**
- Visit: `https://your-backend-url.railway.app/health`
- Should return: `{"status":"ok","timestamp":"..."}`

**Frontend:**
- Visit your frontend URL
- Open browser console (F12)
- Check for any connection errors
- Try logging in/registering

## Environment Variables Summary

### Backend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NODE_ENV` | Yes | Environment mode | `production` |
| `JWT_SECRET` | Yes | Secret for JWT tokens | `your-32-char-secret` |
| `DATABASE_URL` | Yes | PostgreSQL connection | Auto-set by Railway |
| `CORS_ORIGIN` | Recommended | Allowed frontend origins | `https://frontend-url.railway.app` |
| `REDIS_URL` | Optional | Redis connection | Auto-set by Railway |
| `PORT` | Auto | Server port | Auto-set by Railway |

### Frontend Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | Yes | Backend API URL | `https://backend-url.railway.app` |

## Troubleshooting

### Frontend can't connect to backend

1. **Check VITE_API_URL:**
   - Must be set in frontend service variables
   - Must include `https://` protocol
   - Must match your backend URL exactly
   - **Redeploy frontend** after changing (build-time variable)

2. **Check CORS_ORIGIN:**
   - Must be set in backend service variables
   - Must match your frontend URL exactly
   - Can be comma-separated for multiple origins

3. **Check browser console:**
   - Look for CORS errors
   - Look for connection refused errors
   - Check Network tab for failed requests

### Backend health check fails

1. Check backend logs in Railway dashboard
2. Verify `DATABASE_URL` is set correctly
3. Check database migrations ran successfully
4. Verify `JWT_SECRET` is set

### WebSocket connection fails

1. Ensure `CORS_ORIGIN` includes your frontend URL
2. Check that Socket.IO is using the correct URL
3. Verify both services are using HTTPS (Railway provides this)

## Quick Reference

**Backend URL format:**
```
https://<service-name>-<hash>.up.railway.app
```

**Frontend URL format:**
```
https://<service-name>-<hash>.up.railway.app
```

**Connection flow:**
```
User → Frontend (Railway) → Backend (Railway) → Database (Railway)
```

## Notes

- Frontend environment variables are **build-time** - changes require redeployment
- Backend environment variables are **runtime** - changes trigger auto-redeploy
- Always use HTTPS URLs in production (Railway provides this automatically)
- Socket.IO automatically uses WSS when frontend is on HTTPS

