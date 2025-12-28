# Railway Deployment Guide

This guide will walk you through deploying the Dipstick application to Railway.

## Architecture Overview

The application consists of **3 separate Railway services**:

1. **Prototype Backend** - Express API server for the prototype functionality
2. **Dev Backend** - Module-based development API server  
3. **Unified Frontend** - React app with Prototype and Dev modes

## Step-by-Step Deployment

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"** (or connect your repo)
4. Select your repository

### Step 2: Add First Service - Prototype Backend

1. In your Railway project, click **"+ New"** → **"GitHub Repo"** (or **"Empty Service"** if already connected)
2. Configure the service:
   - **Name**: `dipstick-prototype-backend` (or any name you prefer)
   - **Root Directory**: `prototype/backend`
   - Railway will auto-detect Node.js and use `railway.json` config

3. **Set Environment Variables** (Settings → Variables):
   ```
   PORT=5000 (auto-set by Railway, but you can set default)
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.railway.app
   OPENAI_API_KEY=sk-your-openai-key-here
   OPENAI_MODEL=gpt-4o-mini (optional)
   MAX_FILE_SIZE=10485760 (optional, 10MB default)
   ```

4. **Deploy**: Railway will automatically build and deploy

5. **Get the URL**: After deployment, go to Settings → Domains and copy the Railway-generated URL (e.g., `https://dipstick-prototype-backend-production.up.railway.app`)

### Step 3: Add Second Service - Dev Backend

1. In your Railway project, click **"+ New"** → **"GitHub Repo"** (or **"Empty Service"**)
2. Configure the service:
   - **Name**: `dipstick-dev-backend`
   - **Root Directory**: `dev`
   - Railway will auto-detect Node.js and use `railway.json` config

3. **Set Environment Variables** (Settings → Variables):
   ```
   PORT=5001 (auto-set by Railway, but you can set default)
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend-domain.railway.app
   ANTHROPIC_API_KEY=your-anthropic-key-here (if using Claude)
   ```

4. **Deploy**: Railway will automatically build and deploy

5. **Get the URL**: After deployment, copy the Railway-generated URL (e.g., `https://dipstick-dev-backend-production.up.railway.app`)

### Step 4: Add Third Service - Unified Frontend

1. In your Railway project, click **"+ New"** → **"GitHub Repo"** (or **"Empty Service"**)
2. Configure the service:
   - **Name**: `dipstick-frontend`
   - **Root Directory**: `frontend`
   - Railway will auto-detect Node.js and use `railway.json` config

3. **Set Environment Variables** (Settings → Variables):
   ```
   PORT=3000 (auto-set by Railway)
   NODE_ENV=production
   VITE_PROTOTYPE_API_URL=https://dipstick-prototype-backend-production.up.railway.app
   VITE_DEV_API_URL=https://dipstick-dev-backend-production.up.railway.app
   ```
   
   **Important**: Replace the URLs above with the actual Railway URLs from Steps 2 and 3!

4. **Deploy**: Railway will automatically build and deploy

5. **Get the URL**: After deployment, copy the Railway-generated URL (e.g., `https://dipstick-frontend-production.up.railway.app`)

### Step 5: Update CORS Origins

After all services are deployed, update the CORS origins in both backends:

1. **Prototype Backend** → Settings → Variables:
   - Update `CORS_ORIGIN` to: `https://dipstick-frontend-production.up.railway.app` (use your actual frontend URL)

2. **Dev Backend** → Settings → Variables:
   - Update `CORS_ORIGIN` to: `https://dipstick-frontend-production.up.railway.app` (use your actual frontend URL)

3. Both services will automatically redeploy when you save the variables

### Step 6: Test Your Deployment

1. Visit your frontend URL: `https://dipstick-frontend-production.up.railway.app`
2. Test the Prototype tab:
   - Upload a PDF
   - Run analysis
   - Check portfolio functionality
3. Test the Dev tab (if implemented):
   - Check module listing
   - Test API endpoints

## Custom Domains (Optional)

### Set Up Custom Domain for Frontend

1. Go to Frontend Service → Settings → Domains
2. Click **"Custom Domain"**
3. Enter your domain (e.g., `dipstick.com`)
4. Railway will provide DNS records:
   - Type: `CNAME`
   - Name: `@` (or `www`)
   - Value: Railway-provided CNAME target
5. Add the DNS record at your domain registrar
6. Railway automatically provisions SSL certificate

### Set Up Custom Domains for Backends (Optional)

If you want custom API domains:

1. **Prototype Backend** → Settings → Domains → Custom Domain: `api-prototype.dipstick.com`
2. **Dev Backend** → Settings → Domains → Custom Domain: `api-dev.dipstick.com`
3. Update frontend environment variables:
   - `VITE_PROTOTYPE_API_URL=https://api-prototype.dipstick.com`
   - `VITE_DEV_API_URL=https://api-dev.dipstick.com`
4. Update CORS origins in both backends to include your custom domains

## Environment Variables Summary

### Prototype Backend Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Auto | Railway sets this automatically |
| `NODE_ENV` | Yes | Set to `production` |
| `CORS_ORIGIN` | Yes | Frontend URL (comma-separated for multiple) |
| `OPENAI_API_KEY` | Yes* | OpenAI API key for PDF parsing |
| `OPENAI_MODEL` | No | Default: `gpt-4o-mini` |
| `MAX_FILE_SIZE` | No | Default: `10485760` (10MB) |

*Required for AI-powered PDF parsing

### Dev Backend Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Auto | Railway sets this automatically |
| `NODE_ENV` | Yes | Set to `production` |
| `CORS_ORIGIN` | Yes | Frontend URL |
| `ANTHROPIC_API_KEY` | No | For Claude API (if using) |

### Frontend Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | Auto | Railway sets this automatically |
| `NODE_ENV` | Yes | Set to `production` |
| `VITE_PROTOTYPE_API_URL` | Yes | Prototype backend URL |
| `VITE_DEV_API_URL` | Yes | Dev backend URL |

## Troubleshooting

### Frontend can't connect to backend
- Check that `VITE_PROTOTYPE_API_URL` and `VITE_DEV_API_URL` are set correctly
- Verify backend services are running (check Railway logs)
- Check CORS settings in backend services

### CORS errors
- Ensure `CORS_ORIGIN` in backends includes your frontend URL
- Check that URLs don't have trailing slashes
- Verify both services are using HTTPS in production

### Build failures
- Check Railway build logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility (Railway uses latest LTS)

### Database issues
- SQLite database is stored in the service's filesystem
- For production, consider migrating to PostgreSQL (Railway offers managed PostgreSQL)

## Continuous Deployment

Railway automatically deploys when you push to your connected branch (usually `main` or `master`).

To disable auto-deploy or change the branch:
1. Go to Service → Settings → Source
2. Configure your deployment settings

## Monitoring

- **Logs**: View real-time logs in Railway dashboard
- **Metrics**: Railway provides basic metrics (CPU, memory, network)
- **Alerts**: Set up alerts in Railway for service failures

## Next Steps

- Set up custom domains for production
- Configure database backups (if using PostgreSQL)
- Set up monitoring and alerts
- Configure environment-specific variables for staging/production

