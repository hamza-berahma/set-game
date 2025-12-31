# CORS Debugging Guide

## If CORS errors persist after setting CORS_ORIGIN correctly

### Step 1: Check Backend Logs

After the backend redeploys, look for these log messages:

**On startup:**
```
CORS Configuration: Allowing https://capable-kindness-production-f5a2.up.railway.app
```

**If CORS is blocking:**
```
❌ CORS blocked origin: "https://capable-kindness-production-f5a2.up.railway.app"
   Normalized to: "https://capable-kindness-production-f5a2.up.railway.app"
   Allowed origins: "https://capable-kindness-production-f5a2.up.railway.app"
```

### Step 2: Check Browser Console

1. Open your frontend in browser
2. Open DevTools (F12)
3. Go to **Console** tab
4. Look for CORS errors - they'll show the exact origin being sent

### Step 3: Check Network Tab

1. Open DevTools → **Network** tab
2. Make a request (e.g., login)
3. Click on the failed request
4. Check **Request Headers** → Look for `Origin:` header
5. Compare this exact value with your `CORS_ORIGIN` setting

### Step 4: Common Issues

#### Issue 1: Protocol Mismatch
- Browser sends: `https://capable-kindness-production-f5a2.up.railway.app`
- CORS_ORIGIN set to: `http://capable-kindness-production-f5a2.up.railway.app` (missing 's')
- **Fix:** Use `https://` in CORS_ORIGIN

#### Issue 2: Case Sensitivity
- Browser sends: `https://Capable-Kindness-Production-F5a2.up.railway.app`
- CORS_ORIGIN set to: `https://capable-kindness-production-f5a2.up.railway.app`
- **Fix:** URLs are case-sensitive, must match exactly

#### Issue 3: Subdomain Mismatch
- Browser sends: `https://www.capable-kindness-production-f5a2.up.railway.app`
- CORS_ORIGIN set to: `https://capable-kindness-production-f5a2.up.railway.app`
- **Fix:** Add both to CORS_ORIGIN: `https://capable-kindness-production-f5a2.up.railway.app,https://www.capable-kindness-production-f5a2.up.railway.app`

#### Issue 4: Port Number
- Browser sends: `https://capable-kindness-production-f5a2.up.railway.app:443`
- CORS_ORIGIN set to: `https://capable-kindness-production-f5a2.up.railway.app`
- **Note:** Port 443 (HTTPS default) is usually omitted, but if browser includes it, you may need to add it

### Step 5: Test with curl

Test CORS preflight:
```bash
curl -H "Origin: https://capable-kindness-production-f5a2.up.railway.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://set-game-production-a2b7.up.railway.app/api/auth/login \
     -v
```

Look for:
- `Access-Control-Allow-Origin: https://capable-kindness-production-f5a2.up.railway.app`
- `Access-Control-Allow-Credentials: true`

### Step 6: Verify Environment Variable

In Railway:
1. Go to Backend Service → Variables
2. Check `CORS_ORIGIN` value exactly as shown
3. Copy the value and compare with browser's Origin header

### Step 7: Temporary Debug - Allow All Origins

If nothing works, temporarily set:
```
CORS_ORIGIN=*
```

This allows all origins. If this works, then it's definitely an origin matching issue.

**⚠️ Remember to change it back to your specific frontend URL after debugging!**

## What the Code Does Now

The updated CORS handler:
1. Normalizes both the incoming origin and allowed origins (removes trailing slashes, trims)
2. Compares normalized values
3. Logs detailed debug info when blocking
4. Shows exactly what was compared

## Still Not Working?

1. Check Railway backend logs for the detailed CORS debug messages
2. Copy the exact `Origin:` header from browser Network tab
3. Set `CORS_ORIGIN` to match that exact value
4. Redeploy backend
5. Clear browser cache and try again

