# Railway Error Diagnosis Checklist

## Step 1: Identify Which Service Has the Error

- [ ] Prototype Backend
- [ ] Dev Backend  
- [ ] Frontend

## Step 2: Check Service Status

1. Go to Railway dashboard
2. Click on the service with the error
3. Check the status:
   - [ ] Shows "Active" (green) ✅
   - [ ] Shows "Failed" or "Error" (red) ❌

## Step 3: Check Deployment Logs

1. Click on the service
2. Go to **"Deployments"** tab
3. Click on the **latest deployment**
4. Check:
   - [ ] **Build Logs** - Look for red error messages
   - [ ] **Deploy Logs** - Look for runtime errors

**Common errors to look for:**
- "Cannot find module"
- "npm install failed"
- "Port already in use"
- "Environment variable not found"
- "Build failed"

## Step 4: Copy the Error Message

Copy the exact error message from the logs. It usually looks like:

```
Error: Cannot find module 'express'
    at ...
```

or

```
npm ERR! code ELIFECYCLE
npm ERR! errno 1
```

## Step 5: Check Configuration

### For Prototype Backend:
- [ ] Root Directory set to: `prototype/backend`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN` (your frontend URL)
  - [ ] `OPENAI_API_KEY` (your key)

### For Dev Backend:
- [ ] Root Directory set to: `dev`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN` (your frontend URL)

### For Frontend:
- [ ] Root Directory set to: `frontend`
- [ ] Environment variables set:
  - [ ] `NODE_ENV=production`
  - [ ] `VITE_PROTOTYPE_API_URL` (prototype backend URL)
  - [ ] `VITE_DEV_API_URL` (dev backend URL)

## Step 6: Test Backend Directly

If it's a backend service, test it directly:

1. Get the backend URL: Service → Settings → Domains
2. Open in browser: `https://your-backend.railway.app/api/health`
3. Check what you see:
   - [ ] JSON response: `{"status":"ok",...}` ✅
   - [ ] Error page ❌
   - [ ] Nothing/blank ❌

## Step 7: Common Fixes

### If you see "Cannot find module":
- Check package.json has the dependency
- Check build logs for npm install errors

### If you see "Port already in use":
- Make sure code uses `process.env.PORT`
- Railway sets PORT automatically

### If you see "Environment variable not found":
- Go to Variables tab
- Add the missing variable
- Wait for redeploy

### If build fails:
- Check Root Directory is correct
- Verify package.json exists in that directory
- Check build logs for specific errors

