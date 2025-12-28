# Railway Quick Start Checklist

Use this checklist when deploying to Railway for the first time.

## Prerequisites
- [ ] Railway account created
- [ ] GitHub repository connected to Railway
- [ ] OpenAI API key ready (for prototype backend)
- [ ] Anthropic API key ready (optional, for dev backend)

## Deployment Steps

### 1. Create Railway Project
- [ ] New Project → Deploy from GitHub repo
- [ ] Select your repository

### 2. Deploy Prototype Backend
- [ ] Add service: `prototype/backend` root directory
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN=https://your-frontend-url.railway.app` (update after frontend deploys)
  - [ ] `OPENAI_API_KEY=sk-...`
- [ ] Copy the Railway URL: `https://xxx-prototype-backend.railway.app`

### 3. Deploy Dev Backend
- [ ] Add service: `dev` root directory
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `CORS_ORIGIN=https://your-frontend-url.railway.app` (update after frontend deploys)
  - [ ] `ANTHROPIC_API_KEY=...` (optional)
- [ ] Copy the Railway URL: `https://xxx-dev-backend.railway.app`

### 4. Deploy Frontend
- [ ] Add service: `frontend` root directory
- [ ] Set environment variables:
  - [ ] `NODE_ENV=production`
  - [ ] `VITE_PROTOTYPE_API_URL=https://xxx-prototype-backend.railway.app` (from step 2)
  - [ ] `VITE_DEV_API_URL=https://xxx-dev-backend.railway.app` (from step 3)
- [ ] Copy the Railway URL: `https://xxx-frontend.railway.app`

### 5. Update CORS Origins
- [ ] Update `CORS_ORIGIN` in Prototype Backend to frontend URL
- [ ] Update `CORS_ORIGIN` in Dev Backend to frontend URL
- [ ] Both services will auto-redeploy

### 6. Test
- [ ] Visit frontend URL
- [ ] Test Prototype tab (upload PDF, run analysis)
- [ ] Test Dev tab (if implemented)
- [ ] Check browser console for errors

## Environment Variables Reference

### Prototype Backend
```
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.railway.app
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini (optional)
```

### Dev Backend
```
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.railway.app
ANTHROPIC_API_KEY=... (optional)
```

### Frontend
```
NODE_ENV=production
VITE_PROTOTYPE_API_URL=https://xxx-prototype-backend.railway.app
VITE_DEV_API_URL=https://xxx-dev-backend.railway.app
```

## Troubleshooting

**Frontend can't connect to backend?**
- Check environment variables are set correctly
- Verify backend services are running (check logs)
- Ensure CORS_ORIGIN includes frontend URL

**CORS errors?**
- Update CORS_ORIGIN in both backends
- Remove trailing slashes from URLs
- Use HTTPS URLs in production

**Build fails?**
- Check Railway build logs
- Verify all dependencies in package.json
- Check Node.js version compatibility

## Next Steps After Deployment
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Set up database backups (if needed)

