# Railway Deployment Verification Checklist

## ✅ Step 1: Verify All Services Are Running

In Railway dashboard, check that all 3 services show:
- [ ] Status: **"Active"** (green)
- [ ] Latest deployment: **"Succeeded"**
- [ ] No error messages in the service overview

## ✅ Step 2: Get Your Service URLs

For each service, go to **Settings → Domains** and copy the Railway-generated URLs:

### Prototype Backend URL:
```
https://____________________.railway.app
```

### Dev Backend URL:
```
https://____________________.railway.app
```

### Frontend URL:
```
https://____________________.railway.app
```

## ✅ Step 3: Verify Environment Variables

### Prototype Backend Variables:
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` = (your frontend URL)
- [ ] `OPENAI_API_KEY` = (your OpenAI key)

### Dev Backend Variables:
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN` = (your frontend URL)

### Frontend Variables:
- [ ] `NODE_ENV=production`
- [ ] `VITE_PROTOTYPE_API_URL` = (prototype backend URL)
- [ ] `VITE_DEV_API_URL` = (dev backend URL)

**Important:** Make sure:
- No trailing slashes in URLs (e.g., `https://example.com` not `https://example.com/`)
- URLs use `https://` not `http://`
- CORS_ORIGIN in backends matches your frontend URL exactly

## ✅ Step 4: Test Backend Services

### Test Prototype Backend:
Open in browser: `https://your-prototype-backend.railway.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Dipstik API is running"
}
```

### Test Dev Backend:
Open in browser: `https://your-dev-backend.railway.app/modules`

Expected response:
```json
{
  "success": true,
  "modules": [...]
}
```

## ✅ Step 5: Test Frontend

1. Visit your frontend URL in a browser
2. Open browser console (F12 → Console tab)
3. Check for errors:
   - [ ] No CORS errors
   - [ ] No 404 errors for API calls
   - [ ] No connection refused errors

4. Test Prototype Tab:
   - [ ] Page loads without errors
   - [ ] Can see the vehicle form
   - [ ] Portfolio dropdown loads (if you have data)

5. Test Dev Tab:
   - [ ] Page loads without errors
   - [ ] Can see module explorer
   - [ ] Can list modules

## ✅ Step 6: Common Issues & Fixes

### Issue: Frontend shows "Cannot connect to backend"
**Fix:**
- Verify `VITE_PROTOTYPE_API_URL` and `VITE_DEV_API_URL` are set correctly
- Check backend services are running
- Make sure URLs don't have trailing slashes

### Issue: CORS errors in browser console
**Fix:**
- Update `CORS_ORIGIN` in both backends to match your frontend URL exactly
- Backends will auto-redeploy when you save
- Wait for redeploy to complete before testing again

### Issue: 404 errors for API calls
**Fix:**
- Check that backend URLs in frontend env vars are correct
- Verify backend services are actually running
- Check Railway logs for backend errors

### Issue: Frontend shows blank page
**Fix:**
- Check browser console for errors
- Verify frontend build succeeded (check Deployments tab)
- Make sure all environment variables are set

## ✅ Step 7: Update CORS (If Needed)

If you see CORS errors:

1. **Prototype Backend:**
   - Settings → Variables
   - Update `CORS_ORIGIN` to your frontend URL
   - Save (auto-redeploys)

2. **Dev Backend:**
   - Settings → Variables
   - Update `CORS_ORIGIN` to your frontend URL
   - Save (auto-redeploys)

3. Wait for both to redeploy (check Deployments tab)

4. Refresh frontend and test again

## ✅ Step 8: Final Test

1. Visit frontend URL
2. Test Prototype tab:
   - [ ] Upload a PDF (if you have one)
   - [ ] Run analysis
   - [ ] Check portfolio functionality
3. Test Dev tab:
   - [ ] Browse modules
   - [ ] Test API endpoints
4. Check browser console:
   - [ ] No errors
   - [ ] API calls succeed

## 🎉 Success!

If all checks pass, your deployment is complete!

## Next Steps (Optional)

- [ ] Set up custom domain
- [ ] Configure monitoring/alerts
- [ ] Set up database backups
- [ ] Add SSL certificate (Railway does this automatically)

