# Quick CORS Fix for Railway

## Your URLs
- **Backend**: `https://set-game-production-a2b7.up.railway.app`
- **Frontend**: `https://capable-kindness-production-f5a2.up.railway.app`

## Fix Steps

### 1. Set Backend CORS_ORIGIN

Go to Railway Dashboard → Backend Service → Variables tab

Add or update:
```
CORS_ORIGIN=https://capable-kindness-production-f5a2.up.railway.app
```

**Important:** 
- Must include `https://` protocol
- Must match your frontend URL exactly
- Railway will auto-redeploy after you save

### 2. Set Frontend VITE_API_URL

Go to Railway Dashboard → Frontend Service → Variables tab

Add or update:
```
VITE_API_URL=https://set-game-production-a2b7.up.railway.app
```

**Important:**
- Must include `https://` protocol
- Must match your backend URL exactly
- **You MUST trigger a new deployment** after setting this (it's a build-time variable)
- Go to Deployments → Click "Redeploy" after setting VITE_API_URL

### 3. Verify

After both are set:

1. **Backend** should auto-redeploy (check deployments)
2. **Frontend** needs manual redeploy:
   - Go to Frontend Service → Deployments
   - Click "Redeploy" button
   - Wait for build to complete

3. **Test:**
   ```bash
   # Test backend CORS
   curl -H "Origin: https://capable-kindness-production-f5a2.up.railway.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://set-game-production-a2b7.up.railway.app/health
   ```

## Multiple Origins (Optional)

If you have multiple frontend URLs (e.g., www and non-www), separate with commas:

```
CORS_ORIGIN=https://capable-kindness-production-f5a2.up.railway.app,https://www.capable-kindness-production-f5a2.up.railway.app
```

## Troubleshooting

### Still getting CORS errors?

1. **Check backend logs** - Should show: `CORS_ORIGIN: https://capable-kindness-production-f5a2.up.railway.app`
2. **Verify frontend is using correct URL** - Check browser console Network tab
3. **Clear browser cache** - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. **Check both services are redeployed** - Frontend especially needs redeploy after VITE_API_URL change

### Common Mistakes

- ❌ Forgetting `https://` protocol
- ❌ Trailing slashes in URLs
- ❌ Not redeploying frontend after setting VITE_API_URL
- ❌ Wrong URL (typo in domain)

