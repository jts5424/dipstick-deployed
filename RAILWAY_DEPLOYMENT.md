# Railway Deployment Guide - Complete Reference

Complete guide for deploying the Dipstick application to Railway.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Critical Pre-Deployment Checklist](#critical-pre-deployment-checklist)
3. [Architecture Overview](#architecture-overview)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Environment Variables Setup](#environment-variables-setup)
6. [Verification & Testing](#verification--testing)
7. [Troubleshooting](#troubleshooting)
8. [Database & Storage Considerations](#database--storage-considerations)
9. [Quick Reference](#quick-reference)

---

## Prerequisites

- ✅ GitHub repository: `https://github.com/jts5424/dipstick-deployed`
- ✅ Railway account (sign up at [railway.app](https://railway.app) if needed)
- ✅ OpenAI API key (for prototype backend)
- ✅ Anthropic API key (optional, for dev backend if using Claude API)

## Critical Pre-Deployment Checklist

Before deploying, ensure:

- ✅ **Backend Port Configuration**: `prototype/backend/server.js` uses `process.env.PORT` (already fixed)
- ✅ **Frontend Static Serving**: `serve` package is in `frontend/package.json` dependencies (already present)
- ✅ **Railway Config Files**: `railway.json` and `nixpacks.toml` exist for all services (already present)

### Important Notes

- **Database**: Currently using SQLite. Data is **ephemeral** (lost on redeploy). For production, consider:
  - Migrating to Supabase PostgreSQL (recommended)
  - Using Railway Volumes to persist SQLite database
  
- **File Uploads**: Currently using local filesystem. Files will be **lost on redeploy**. For production, consider:
  - Railway Volumes for persistent storage
  - External storage (S3, Cloudflare R2, etc.)

---

## Architecture Overview

The application consists of **3 separate Railway services**:

1. **Prototype Backend** (`prototype/backend/`) - Express API server for the prototype functionality
2. **Dev Backend** (`dev/`) - Module-based development API server  
3. **Unified Frontend** (`frontend/`) - React app with Prototype and Dev modes

Each service runs independently and communicates via HTTP APIs.

---

## Step-by-Step Deployment

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** (top right)
3. Select **"Deploy from GitHub repo"**
4. If prompted, authorize Railway to access your GitHub account
5. Find and select your repository: **`jts5424/dipstick-deployed`**
6. Click **"Deploy Now"** or **"Add Service"**

**Note:** Railway will create a project, but we need to add 3 separate services. The first one might auto-deploy - that's okay, we'll configure it properly.

---

### Step 2: Deploy Prototype Backend (Service 1)

#### 2.1 Add the Service
1. In your Railway project, click **"+ New"** (top right)
2. Select **"GitHub Repo"**
3. Choose **`jts5424/dipstick-deployed`**
4. Railway will ask for configuration - we'll set it up manually

#### 2.2 Configure the Service
1. Click on the service (it might be named something like "dipstick-deployed")
2. Click **"Settings"** tab
3. Scroll down to **"Source"** section
4. Set **"Root Directory"** to: `prototype/backend`
5. Click **"Save"**

#### 2.3 Set Environment Variables
1. Click the **"Variables"** tab (at the top, next to Settings)
2. Click **"+ New Variable"** and add each of these:

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 2:**
   - Name: `CORS_ORIGIN`
   - Value: `https://your-frontend-url.railway.app`
   - **Note:** You'll update this after the frontend deploys. For now, use a placeholder or leave it as `*` temporarily.
   - Click **"Add"**

   **Variable 3:**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-openai-key-here` (your real OpenAI API key)
   - Click **"Add"**

   **Variable 4 (Optional):**
   - Name: `OPENAI_MODEL`
   - Value: `gpt-4o-mini`
   - Click **"Add"**

3. After adding all variables, Railway will automatically redeploy the service

#### 2.4 Get the Backend URL
1. Go to the **"Settings"** tab
2. Scroll to **"Domains"** section
3. You'll see a Railway-generated domain like: `dipstick-prototype-backend-production.up.railway.app`
4. **Copy this URL** - you'll need it for the frontend!

---

### Step 3: Deploy Dev Backend (Service 2)

#### 3.1 Add the Service
1. In your Railway project, click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose **`jts5424/dipstick-deployed`**

#### 3.2 Configure the Service
1. Click on the new service
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `dev`
4. Click **"Save"**

#### 3.3 Set Environment Variables
1. Click the **"Variables"** tab
2. Click **"+ New Variable"**

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 2:**
   - Name: `CORS_ORIGIN`
   - Value: `https://your-frontend-url.railway.app` (update this after frontend deploys)
   - Click **"Add"**

   **Variable 3 (Optional - only if using Claude API):**
   - Name: `ANTHROPIC_API_KEY`
   - Value: `your-anthropic-key`
   - Click **"Add"**

#### 3.4 Get the Backend URL
1. Go to **"Settings"** → **"Domains"**
2. **Copy the Railway-generated URL** (e.g., `dipstick-dev-backend-production.up.railway.app`)

---

### Step 4: Deploy Frontend (Service 3)

#### 4.1 Add the Service
1. Click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose **`jts5424/dipstick-deployed`**

#### 4.2 Configure the Service
1. Click on the new service
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `frontend`
4. Click **"Save"**

#### 4.3 Set Environment Variables
1. Click the **"Variables"** tab
2. Click **"+ New Variable"**

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 2:**
   - Name: `VITE_PROTOTYPE_API_URL`
   - Value: `https://your-prototype-backend-url.railway.app` (from Step 2.4, no trailing slash!)
   - **Important**: This should be the full backend URL WITHOUT `/api` at the end
   - Example: `https://dipstick-prototype-backend-production.up.railway.app`
   - The frontend will automatically append `/api` to this URL
   - Click **"Add"**

   **Variable 3:**
   - Name: `VITE_DEV_API_URL`
   - Value: `https://your-dev-backend-url.railway.app` (from Step 3.4, no trailing slash!)
   - Click **"Add"**

   **Note:** You do NOT need to set `PORT` for the frontend. Railway automatically sets it, and the frontend build process uses it automatically.

#### 4.4 Get the Frontend URL
1. Go to **"Settings"** → **"Domains"**
2. **Copy the Railway-generated URL** (e.g., `dipstick-frontend-production.up.railway.app`)

---

### Step 5: Update CORS Origins

Now that you have the frontend URL, update the CORS settings in both backends:

#### 5.1 Update Prototype Backend CORS
1. Go to **Prototype Backend** service
2. Click **"Variables"** tab
3. Find `CORS_ORIGIN`
4. Update it to your **frontend URL** (from Step 4.4)
5. Click **"Save"**
6. Railway will automatically redeploy

#### 5.2 Update Dev Backend CORS
1. Go to **Dev Backend** service
2. Click **"Variables"** tab
3. Find `CORS_ORIGIN`
4. Update it to your **frontend URL** (from Step 4.4)
5. Click **"Save"**
6. Railway will automatically redeploy

---

## Environment Variables Quick Reference

**Where to set:** Each service has its own **"Variables"** tab (not at project level).

See [Step-by-Step Deployment](#step-by-step-deployment) for detailed instructions on setting variables.

| Service | Root Directory | Required Variables |
|---------|---------------|-------------------|
| Prototype Backend | `prototype/backend` | `NODE_ENV`, `CORS_ORIGIN`, `OPENAI_API_KEY` |
| Dev Backend | `dev` | `NODE_ENV`, `CORS_ORIGIN` |
| Frontend | `frontend` | `NODE_ENV`, `VITE_PROTOTYPE_API_URL`, `VITE_DEV_API_URL` |

**Optional Variables:**
- Prototype Backend: `OPENAI_MODEL` (default: `gpt-4o-mini`), `MAX_FILE_SIZE` (default: `10485760`)
- Dev Backend: `ANTHROPIC_API_KEY` (if using Claude API)

**Important Notes:**
- Railway automatically sets `PORT` - **do not set it manually**
- All URLs must use `https://` (not `http://`)
- No trailing slashes in URLs (e.g., `https://example.com` not `https://example.com/`)
- Variable names are case-sensitive

---

## Verification & Testing

### Step 1: Verify All Services Are Running

In Railway dashboard, check that all 3 services show:
- [ ] Status: **"Active"** (green)
- [ ] Latest deployment: **"Succeeded"**
- [ ] No error messages in the service overview

### Step 2: Test Backend Services

#### Test Prototype Backend
Open in browser: `https://your-prototype-backend.railway.app/api/health`

Expected response:
```json
{
  "status": "ok",
  "message": "Dipstik API is running"
}
```

If you see this response, your backend is working correctly! ✅

#### Test Dev Backend
Open in browser: `https://your-dev-backend.railway.app/modules`

Expected response:
```json
{
  "success": true,
  "modules": [...]
}
```

### Step 3: Test Frontend

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

### Step 4: Final Test

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

---

## Troubleshooting

### Common Errors and Solutions

#### Error: "Build failed" or "Nixpacks build failed"

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

#### Error: "Cannot find module" or "Module not found"

**Possible Causes:**
1. Dependencies not installed
2. Missing package.json
3. Build process failed

**Solution:**
1. Check Deployments tab → Latest deployment → Build Logs
2. Look for npm install errors
3. Verify package.json has all dependencies listed
4. Check if there are any missing dependencies

#### Error: "Port already in use" or "EADDRINUSE"

**Solution:**
- Railway automatically sets PORT environment variable
- Make sure your code uses `process.env.PORT` not a hardcoded port
- Check that server.js uses: `const PORT = process.env.PORT || 5000`

#### Error: "CORS policy" or "Access-Control-Allow-Origin"

**Solution:**
1. Check CORS_ORIGIN environment variable is set in backend services
2. Make sure it matches your frontend URL exactly
3. No trailing slashes
4. Use https:// not http://
5. Update CORS_ORIGIN and wait for redeploy

#### Error: "Environment variable not found"

**Solution:**
1. Go to Service → Variables tab
2. Verify all required variables are set
3. Check variable names are exact (case-sensitive)
4. No spaces around the = sign
5. Make sure you saved the variables

#### Error: "404 Not Found" for API calls

**Solution:**
1. Check backend service is running (Status should be "Active")
2. Verify `VITE_PROTOTYPE_API_URL` is set correctly:
   - Should be the full backend URL (e.g., `https://your-backend.railway.app`)
   - Should NOT include `/api` at the end
   - Should NOT have a trailing slash
   - Should use `https://` not `http://`
3. Test backend directly: `https://your-backend.railway.app/api/health`
4. Check browser console for the actual API URL being used (look for `[API] 🔗 Using backend URL:`)
5. Check Railway logs for errors
6. Verify CORS is configured correctly (backend should allow frontend origin)

#### Error: Frontend shows blank page

**Solution:**
1. Check browser console (F12) for errors
2. Verify frontend build succeeded (check Deployments tab)
3. Check that VITE_PROTOTYPE_API_URL and VITE_DEV_API_URL are set
4. Make sure URLs don't have trailing slashes
5. Check Railway logs for build errors

#### Error: "Cannot GET /" when visiting backend

**This is normal!** The backend doesn't have a root route by default. Test the API endpoints:
- Health: `https://your-backend.railway.app/api/health`
- Portfolio: `https://your-backend.railway.app/api/portfolio`

### How to Check Railway Logs

1. Go to Service → Deployments tab
2. Click on the latest deployment
3. Check:
   - **Build Logs** - Shows npm install and build process
   - **Deploy Logs** - Shows runtime errors

Look for:
- Red error messages
- "Failed" or "Error" keywords
- Stack traces

### Quick Diagnostic Steps

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

### Getting Help

When asking for help, provide:
1. **Which service** is having the error (Prototype Backend, Dev Backend, or Frontend)
2. **Exact error message** from Railway logs
3. **What you were trying to do** when the error occurred
4. **Screenshot** of the error (if possible)

---

## Quick Reference

### Deployment Checklist

- [ ] Railway account created
- [ ] GitHub repository connected to Railway
- [ ] All 3 services created
- [ ] Root directories set correctly
- [ ] Environment variables set for all services
- [ ] Backend URLs copied
- [ ] Frontend environment variables updated with backend URLs
- [ ] CORS_ORIGIN updated in both backends
- [ ] All services show "Active" status
- [ ] Backend health endpoints work
- [ ] Frontend loads without errors
- [ ] Browser console shows no errors

### Common Issues Quick Fix

**Frontend can't connect to backend?**
- Check `VITE_PROTOTYPE_API_URL` is set correctly:
  - Should be full backend URL: `https://your-backend.railway.app`
  - Should NOT include `/api` at the end
  - Should NOT have trailing slash
- Verify backend services are running (check logs)
- Check browser console for API URL being used
- Test backend health endpoint directly: `https://your-backend.railway.app/api/health`
- Verify CORS_ORIGIN in backend matches frontend URL

**CORS errors?**
- Update `CORS_ORIGIN` in both backends to match frontend URL exactly
- Remove trailing slashes from URLs
- Use HTTPS URLs in production

**Build fails?**
- Check Railway build logs
- Verify all dependencies in package.json
- Check Node.js version compatibility
- Verify Root Directory is correct

---

## Custom Domain Setup

### Setting Up Your Custom Domain

1. **Get your domain ready**
   - Have your domain registered (e.g., `dipstick.com`)
   - Access to your domain registrar's DNS settings

2. **Add custom domain in Railway (Frontend)**
   - Go to your **Frontend** service in Railway
   - Click **"Settings"** tab
   - Scroll to **"Domains"** section
   - Click **"Custom Domain"**
   - Enter your domain (e.g., `dipstick.com` or `www.dipstick.com`)
   - Railway will provide DNS records you need to add

3. **Add DNS records at your domain registrar**
   - Railway will show you something like:
     - **Type:** `CNAME`
     - **Name:** `@` (or `www` if you entered www.dipstick.com)
     - **Value:** `something.railway.app` (Railway-provided CNAME target)
   - Go to your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.)
   - Add the CNAME record Railway provided
   - Save the DNS record

4. **Wait for DNS propagation**
   - DNS changes can take 5 minutes to 48 hours (usually 15-30 minutes)
   - You can check propagation status at [whatsmydns.net](https://www.whatsmydns.net)

5. **SSL Certificate**
   - Railway automatically provisions SSL certificates
   - Once DNS propagates, Railway will automatically set up HTTPS
   - This usually happens within a few minutes after DNS is ready

6. **Update environment variables**
   - **Frontend:** No changes needed (Railway handles it automatically)
   - **Prototype Backend:** Update `CORS_ORIGIN` to include your custom domain:
     ```
     CORS_ORIGIN=https://dipstick.com,https://www.dipstick.com
     ```
   - **Dev Backend:** Update `CORS_ORIGIN` to include your custom domain:
     ```
     CORS_ORIGIN=https://dipstick.com,https://www.dipstick.com
     ```

### Optional: Custom Domains for Backends

If you want custom domains for your API backends (e.g., `api.dipstick.com`):

1. **Prototype Backend:**
   - Settings → Domains → Custom Domain
   - Enter: `api-prototype.dipstick.com` (or `api.dipstick.com`)
   - Add the CNAME record at your registrar
   - Update frontend `VITE_PROTOTYPE_API_URL` to use the custom domain

2. **Dev Backend:**
   - Settings → Domains → Custom Domain
   - Enter: `api-dev.dipstick.com`
   - Add the CNAME record at your registrar
   - Update frontend `VITE_DEV_API_URL` to use the custom domain

### Common Domain Setup Issues

#### GoDaddy: "Record data is invalid" or "Record name conflicts"

**Problem:** GoDaddy doesn't allow CNAME records on root domains (`@`).

**Solution 1: Use www subdomain (Recommended)**
1. In Railway: Remove root domain, add `www.yourdomain.com` instead
2. In GoDaddy: Add CNAME record:
   - Type: `CNAME`
   - Name: `www`
   - Value: `[railway-cname-value]` (no https://, no trailing slash)
   - TTL: 600 (default)
3. Set up redirect in GoDaddy: `yourdomain.com` → `www.yourdomain.com`

**Solution 2: Use Cloudflare (Supports root CNAME)**
1. Sign up for free Cloudflare account
2. Add your domain to Cloudflare
3. Update nameservers in GoDaddy to Cloudflare's nameservers
4. In Cloudflare DNS: Add CNAME record:
   - Type: `CNAME`
   - Name: `@` (or leave blank for root)
   - Target: `[railway-cname-value]`
   - Proxy: Off or On (both work)
5. Wait for nameserver propagation (15-30 minutes)

**If you see "Record name conflicts" in Cloudflare:**
- Delete any existing A, AAAA, or CNAME records with blank name (root domain)
- Then add your CNAME record

#### DNS not propagating?
- Wait longer (can take up to 48 hours, usually 15-30 minutes)
- Check that you entered the CNAME record correctly (no https://, no trailing slash)
- Verify the record type is `CNAME` not `A`
- Test at [whatsmydns.net](https://www.whatsmydns.net)

#### SSL certificate not working?
- Wait for DNS to fully propagate first
- Railway will automatically provision SSL once DNS is ready
- Check Railway logs for SSL errors

#### CORS errors after adding domain?
- Make sure you updated `CORS_ORIGIN` in both backends to include your custom domain
- Wait for backends to redeploy after updating CORS_ORIGIN

## Database & Storage Considerations

### Current Setup
- **Database**: SQLite (`prototype/backend/data/executionLog.db`)
- **File Uploads**: Local filesystem (`prototype/backend/uploads/`)

### Production Recommendations

#### Option 1: Migrate to Supabase PostgreSQL (Recommended)

1. **Set Up Supabase:**
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Get connection string from Settings → Database → Connection string

2. **Update Backend:**
   - Install PostgreSQL driver: `npm install pg`
   - Update `prototype/backend/services/executionLogger.js`:
     - Replace SQLite with PostgreSQL connection
     - Convert SQLite syntax to PostgreSQL (e.g., `INTEGER PRIMARY KEY AUTOINCREMENT` → `SERIAL PRIMARY KEY`)
     - Update `INSERT OR REPLACE` to PostgreSQL `INSERT ... ON CONFLICT`

3. **Environment Variables:**
   - Add `DATABASE_URL` to Railway (use Supabase connection string)

4. **Run Migrations:**
   - Use Drizzle ORM (already in project) or create migration scripts
   - Run migrations on first deploy

#### Option 2: Use Railway Volumes (For SQLite)

1. **Add Volume in Railway:**
   - Service → Settings → Volumes
   - Add volume: `/app/data`
   - Update `dbPath` in `executionLogger.js` to use volume path

2. **File Uploads:**
   - Add volume: `/app/uploads`
   - Files will persist across redeploys

#### Option 3: External Storage (For File Uploads)

- Use Cloudflare R2, AWS S3, or similar
- Update multer configuration to upload directly to external storage
- Update API routes to serve files from external storage

## Next Steps

Once everything is deployed and working:

- ✅ Test all functionality
- ✅ Set up custom domain (see above)
- ✅ Configure monitoring/alerts
- ✅ Set up database backups (if using PostgreSQL)
- ✅ Review Railway usage and costs
- ✅ Consider migrating to PostgreSQL for production

---

## Local Development

### Running Services Locally

#### Prototype Backend
```bash
cd prototype/backend
npm install
npm start
```
Runs on `http://localhost:5000` by default

#### Dev Backend
```bash
cd dev
npm install
npm run dev:server
```
Runs on `http://localhost:5001` by default

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:3000` by default

### Local Environment Variables

Create `.env` files in each service directory for local development:

**prototype/backend/.env:**
```
PORT=5000
NODE_ENV=development
OPENAI_API_KEY=your-key-here
CORS_ORIGIN=http://localhost:3000
OPENAI_MODEL=gpt-4o-mini
```

**dev/.env:**
```
PORT=5001
NODE_ENV=development
ANTHROPIC_API_KEY=your-key-here
CORS_ORIGIN=http://localhost:3000
```

**frontend/.env:**
```
VITE_PROTOTYPE_API_URL=http://localhost:5000
VITE_DEV_API_URL=http://localhost:5001
```

**Note:** The frontend uses Vite proxy in development mode, so these URLs are only needed if you want to override the proxy defaults.

### Security Best Practices

1. **Never commit secrets** - `.env` files are in `.gitignore`
2. **Use platform secrets management** - Use Railway's environment variables for production
3. **Rotate keys regularly** - Change API keys periodically
4. **Limit CORS origins** - Set `CORS_ORIGIN` to your actual frontend domain in production (not `*`)
5. **Use different keys** - Use separate API keys for development and production
6. **No trailing slashes** - Environment variable URLs should not have trailing slashes (e.g., `https://example.com` not `https://example.com/`)
7. **HTTPS only in production** - Always use `https://` URLs in production environment variables
8. **Case sensitive variables** - Variable names must match exactly (e.g., `NODE_ENV` not `node_env`)
9. **No spaces around =** - When Railway shows the variable, it's already formatted correctly

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [GitHub Repository](https://github.com/jts5424/dipstick-deployed)
