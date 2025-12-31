# Quick CORS Fix

## Your URLs
- **Backend**: `https://set-game-production-a2b7.up.railway.app`
- **Frontend**: `https://capable-kindness-production-f5a2.up.railway.app`

## Fix CORS Error - 3 Steps

### Step 1: Set CORS_ORIGIN in Backend

1. Go to Railway Dashboard
2. Select **Backend Service** (`set-game-production-a2b7`)
3. Go to **Variables** tab
4. Add or update:
   ```
   CORS_ORIGIN=https://capable-kindness-production-f5a2.up.railway.app
   ```
5. **Save** - Railway will auto-redeploy

### Step 2: Verify Backend Logs

After backend redeploys, check the logs. You should see:
```
CORS Configuration: Allowing https://capable-kindness-production-f5a2.up.railway.app
```

If you see:
```
CORS Configuration: Allowing all origins (*)
```
Then `CORS_ORIGIN` is not set correctly.

### Step 3: Test

Open your frontend in browser and check:
- Browser console (F12) - should have no CORS errors
- Network tab - API requests should succeed

## Common Mistakes

❌ **Wrong:**
```
CORS_ORIGIN=capable-kindness-production-f5a2.up.railway.app
```
(Missing `https://`)

❌ **Wrong:**
```
CORS_ORIGIN=https://capable-kindness-production-f5a2.up.railway.app/
```
(Trailing slash)

✅ **Correct:**
```
CORS_ORIGIN=https://capable-kindness-production-f5a2.up.railway.app
```

## Still Getting CORS Errors?

1. **Check backend logs** for:
   - `CORS blocked origin: ...` - shows what origin was blocked
   - `Allowed origins: ...` - shows what's configured

2. **Verify exact URL match:**
   - Open browser DevTools → Network tab
   - Look at the `Origin` header in requests
   - Must match `CORS_ORIGIN` exactly (including `https://`)

3. **Clear browser cache:**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

4. **Check both services are deployed:**
   - Backend should show: `CORS Configuration: Allowing https://capable-kindness-production-f5a2.up.railway.app`
   - Frontend should be using: `VITE_API_URL=https://set-game-production-a2b7.up.railway.app`

## Debug CORS

Test CORS with curl:
```bash
curl -H "Origin: https://capable-kindness-production-f5a2.up.railway.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://set-game-production-a2b7.up.railway.app/api/auth/login \
     -v
```

Should return `Access-Control-Allow-Origin` header with your frontend URL.

