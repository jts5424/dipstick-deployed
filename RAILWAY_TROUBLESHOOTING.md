# Railway Troubleshooting Guide

## Common Errors and Solutions

### Error: "Build failed" or "Nixpacks build failed"

**Possible Causes:**
1. Root Directory not set correctly
2. Missing package.json in the root directory
3. Node.js version incompatibility

**Solution:**
1. Go to Service → Settings → Source
2. Verify Root Directory is set:
   - Prototype Backend: `prototype/backend`
   - Dev Backend: `dev`
   - Frontend: `frontend`
3. Check that `package.json` exists in that directory
4. Redeploy the service

---

### Error: "Cannot find module" or "Module not found"

**Possible Causes:**
1. Dependencies not installed
2. Missing package.json
3. Build process failed

**Solution:**
1. Check Deployments tab → Latest deployment → Build Logs
2. Look for npm install errors
3. Verify package.json has all dependencies listed
4. Check if there are any missing dependencies

---

### Error: "Port already in use" or "EADDRINUSE"

**Solution:**
- Railway automatically sets PORT environment variable
- Make sure your code uses `process.env.PORT` not a hardcoded port
- Check that server.js uses: `const PORT = process.env.PORT || 5000`

---

### Error: "CORS policy" or "Access-Control-Allow-Origin"

**Solution:**
1. Check CORS_ORIGIN environment variable is set in backend services
2. Make sure it matches your frontend URL exactly
3. No trailing slashes
4. Use https:// not http://
5. Update CORS_ORIGIN and wait for redeploy

---

### Error: "Environment variable not found"

**Solution:**
1. Go to Service → Variables tab
2. Verify all required variables are set
3. Check variable names are exact (case-sensitive)
4. No spaces around the = sign
5. Make sure you saved the variables

---

### Error: "404 Not Found" for API calls

**Solution:**
1. Check backend service is running (Status should be "Active")
2. Verify backend URL in frontend environment variables
3. Test backend directly: `https://your-backend.railway.app/api/health`
4. Check Railway logs for errors

---

### Error: Frontend shows blank page

**Solution:**
1. Check browser console (F12) for errors
2. Verify frontend build succeeded (check Deployments tab)
3. Check that VITE_PROTOTYPE_API_URL and VITE_DEV_API_URL are set
4. Make sure URLs don't have trailing slashes
5. Check Railway logs for build errors

---

## How to Check Railway Logs

1. Go to Service → Deployments tab
2. Click on the latest deployment
3. Check:
   - **Build Logs** - Shows npm install and build process
   - **Deploy Logs** - Shows runtime errors

Look for:
- Red error messages
- "Failed" or "Error" keywords
- Stack traces

---

## Quick Diagnostic Steps

1. **Check Service Status:**
   - All services should show "Active" (green)
   - Latest deployment should show "Succeeded"

2. **Check Environment Variables:**
   - Service → Variables tab
   - Verify all required variables are present
   - Check values are correct

3. **Check Root Directory:**
   - Service → Settings → Source
   - Verify Root Directory is correct

4. **Test Backend Directly:**
   - Open backend URL in browser
   - Try `/api/health` endpoint
   - Check for error messages

5. **Check Browser Console:**
   - Open frontend URL
   - Press F12 → Console tab
   - Look for red error messages

---

## Getting Help

When asking for help, provide:
1. **Which service** is having the error (Prototype Backend, Dev Backend, or Frontend)
2. **Exact error message** from Railway logs
3. **What you were trying to do** when the error occurred
4. **Screenshot** of the error (if possible)

