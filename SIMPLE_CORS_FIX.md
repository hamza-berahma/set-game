# Simple CORS Fix - Step by Step

## Your URLs
- **Backend**: `https://set-game-production-a2b7.up.railway.app`
- **Frontend**: `https://capable-kindness-production-f5a2.up.railway.app`

## Fix in 2 Steps

### Step 1: Find the Exact Origin from Browser

1. Open your frontend: `https://capable-kindness-production-f5a2.up.railway.app`
2. Press **F12** (opens DevTools)
3. Click **Network** tab
4. Try to login or make any API call
5. Click on the **failed request** (it will be red)
6. Look at **Request Headers** section
7. Find the line that says: `Origin: https://...`
8. **Copy that EXACT value** (including https://)

### Step 2: Set CORS_ORIGIN in Railway

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your **Backend Service** (set-game-production-a2b7)
3. Click **Variables** tab
4. Find `CORS_ORIGIN` or click **+ New Variable**
5. Set the value to the EXACT origin you copied from Step 1
6. Click **Save**

Railway will automatically redeploy. Wait 1-2 minutes, then try your frontend again.

## Still Not Working?

### Option A: Allow All Origins (Temporary)

1. In Railway Backend → Variables
2. Set `CORS_ORIGIN=*`
3. Save and wait for redeploy
4. Test your frontend

If this works, then it's definitely a URL mismatch issue. Go back and set it to your exact frontend URL.

### Option B: Check Backend Logs

1. In Railway Backend → Deployments → Latest
2. Click **Logs** tab
3. Look for lines that say:
   - `CORS blocked origin: ...` (shows what browser sent)
   - `Allowed origins: ...` (shows what's configured)
4. Make sure they match exactly

## Common Mistakes

❌ **Wrong:**
```
CORS_ORIGIN=capable-kindness-production-f5a2.up.railway.app
```
(Missing https://)

❌ **Wrong:**
```
CORS_ORIGIN=https://capable-kindness-production-f5a2.up.railway.app/
```
(Has trailing slash - though code handles this now)

✅ **Correct:**
```
CORS_ORIGIN=https://capable-kindness-production-f5a2.up.railway.app
```

## Quick Test

After setting CORS_ORIGIN, test with this command:

```bash
curl -H "Origin: https://capable-kindness-production-f5a2.up.railway.app" \
     -X OPTIONS \
     https://set-game-production-a2b7.up.railway.app/health \
     -v
```

Look for this in the response:
```
< Access-Control-Allow-Origin: https://capable-kindness-production-f5a2.up.railway.app
```

If you see that, CORS is working!

