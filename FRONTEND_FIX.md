# Fix ERR_NAME_NOT_RESOLVED Error

## Problem
The frontend is trying to connect to `http://localhost:5000` (or an invalid hostname) because `VITE_API_URL` wasn't set during the build.

## Solution

### Step 1: Set VITE_API_URL in Railway

1. Go to Railway Dashboard
2. Select your **Frontend Service** (`capable-kindness-production-f5a2`)
3. Go to **Variables** tab
4. Add or update:
   ```
   VITE_API_URL=https://set-game-production-a2b7.up.railway.app
   ```
   **Important:** Must include `https://` and match your backend URL exactly

### Step 2: Trigger a New Build

Since `VITE_API_URL` is a **build-time variable**, you MUST rebuild:

**Option A: Via Railway Dashboard**
1. Go to **Deployments** tab
2. Click **"Redeploy"** button
3. Wait for the build to complete

**Option B: Via Git Push**
1. Make any small change (or just push an empty commit)
2. Railway will auto-rebuild with the new environment variable

### Step 3: Verify

After the new deployment:
1. Check the build logs - you should see: `Building with VITE_API_URL=https://set-game-production-a2b7.up.railway.app`
2. Open your frontend URL in browser
3. Open browser DevTools (F12) → Console
4. Check Network tab - API calls should go to your backend URL

## Why This Happens

Vite embeds environment variables at **build time**, not runtime. So:
- ❌ Setting `VITE_API_URL` after build = doesn't work
- ✅ Setting `VITE_API_URL` before build = works
- ✅ Rebuilding after setting = works

## Quick Test

After redeploying, check the browser console. You should see API calls going to:
```
https://set-game-production-a2b7.up.railway.app/api/...
```

Not:
```
http://localhost:5000/api/...
```

## Troubleshooting

### Still seeing localhost:5000?

1. **Clear browser cache** - Hard refresh (Ctrl+Shift+R)
2. **Check build logs** - Verify VITE_API_URL was used during build
3. **Verify variable name** - Must be exactly `VITE_API_URL` (case-sensitive)
4. **Check for typos** - URL must be exactly: `https://set-game-production-a2b7.up.railway.app`

### Build still uses wrong URL?

1. Make sure variable is set **before** clicking Redeploy
2. Check Railway build logs for: `Building with VITE_API_URL=...`
3. If it shows `http://localhost:5000`, the variable wasn't passed correctly

