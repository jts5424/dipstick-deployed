# Railway Deployment - Step-by-Step Guide

Follow these steps exactly to deploy your Dipstick application to Railway.

## Prerequisites
- ✅ GitHub repository: `https://github.com/jts5424/dipstick-deployed`
- ✅ Railway account (sign up at [railway.app](https://railway.app) if needed)
- ✅ OpenAI API key (for prototype backend)

---

## Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** (top right)
3. Select **"Deploy from GitHub repo"**
4. If prompted, authorize Railway to access your GitHub account
5. Find and select your repository: **`jts5424/dipstick-deployed`**
6. Click **"Deploy Now"** or **"Add Service"**

**Note:** Railway will create a project, but we need to add 3 separate services. The first one might auto-deploy - that's okay, we'll configure it properly.

---

## Step 2: Deploy Prototype Backend (Service 1)

### 2.1 Add the Service
1. In your Railway project, click **"+ New"** (top right)
2. Select **"GitHub Repo"**
3. Choose **`jts5424/dipstick-deployed`**
4. Railway will ask for configuration - we'll set it up manually

### 2.2 Configure the Service
1. Click on the service (it might be named something like "dipstick-deployed")
2. Click **"Settings"** tab
3. Scroll down to **"Source"** section
4. Set **"Root Directory"** to: `prototype/backend`
5. Click **"Save"**

### 2.3 Set Environment Variables
1. Still in Settings, scroll to **"Variables"** section
2. Click **"+ New Variable"** and add each of these:

   ```
   NODE_ENV = production
   ```
   
   ```
   CORS_ORIGIN = https://your-frontend-url.railway.app
   ```
   **Note:** You'll update this after the frontend deploys. For now, use a placeholder or leave it as `*` temporarily.
   
   ```
   OPENAI_API_KEY = sk-your-actual-openai-key-here
   ```
   
   ```
   OPENAI_MODEL = gpt-4o-mini
   ```
   (This one is optional)

3. Click **"Save"** after adding each variable

### 2.4 Get the Backend URL
1. Go to the **"Settings"** tab
2. Scroll to **"Domains"** section
3. You'll see a Railway-generated domain like: `dipstick-prototype-backend-production.up.railway.app`
4. **Copy this URL** - you'll need it for the frontend!

---

## Step 3: Deploy Dev Backend (Service 2)

### 3.1 Add the Service
1. In your Railway project, click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose **`jts5424/dipstick-deployed`**

### 3.2 Configure the Service
1. Click on the new service
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `dev`
4. Click **"Save"**

### 3.3 Set Environment Variables
1. In **"Variables"** section, add:

   ```
   NODE_ENV = production
   ```
   
   ```
   CORS_ORIGIN = https://your-frontend-url.railway.app
   ```
   (Update this after frontend deploys)
   
   ```
   ANTHROPIC_API_KEY = your-anthropic-key
   ```
   (Optional - only if you're using Claude API)

### 3.4 Get the Backend URL
1. Go to **"Settings"** → **"Domains"**
2. **Copy the Railway-generated URL** (e.g., `dipstick-dev-backend-production.up.railway.app`)

---

## Step 4: Deploy Frontend (Service 3)

### 4.1 Add the Service
1. Click **"+ New"** again
2. Select **"GitHub Repo"**
3. Choose **`jts5424/dipstick-deployed`**

### 4.2 Configure the Service
1. Click on the new service
2. Go to **"Settings"** tab
3. Set **"Root Directory"** to: `frontend`
4. Click **"Save"**

### 4.3 Set Environment Variables
1. In **"Variables"** section, add:

   ```
   NODE_ENV = production
   ```
   
   ```
   VITE_PROTOTYPE_API_URL = https://your-prototype-backend-url.railway.app
   ```
   **Replace with the actual URL from Step 2.4** (no trailing slash!)
   
   ```
   VITE_DEV_API_URL = https://your-dev-backend-url.railway.app
   ```
   **Replace with the actual URL from Step 3.4** (no trailing slash!)

### 4.4 Get the Frontend URL
1. Go to **"Settings"** → **"Domains"**
2. **Copy the Railway-generated URL** (e.g., `dipstick-frontend-production.up.railway.app`)

---

## Step 5: Update CORS Origins

Now that you have the frontend URL, update the CORS settings in both backends:

### 5.1 Update Prototype Backend CORS
1. Go to **Prototype Backend** service
2. **Settings** → **Variables**
3. Find `CORS_ORIGIN`
4. Update it to your **frontend URL** (from Step 4.4)
5. Click **"Save"**
6. Railway will automatically redeploy

### 5.2 Update Dev Backend CORS
1. Go to **Dev Backend** service
2. **Settings** → **Variables**
3. Find `CORS_ORIGIN`
4. Update it to your **frontend URL** (from Step 4.4)
5. Click **"Save"**
6. Railway will automatically redeploy

---

## Step 6: Verify Deployment

### 6.1 Check All Services Are Running
1. In Railway dashboard, you should see 3 services
2. Each should show **"Active"** status
3. Check the **"Deployments"** tab for each service - should show "Succeeded"

### 6.2 Test the Application
1. Visit your **frontend URL** (from Step 4.4)
2. You should see the Dipstick app with two tabs: "Prototype" and "Dev"
3. Test the Prototype tab:
   - Try uploading a PDF
   - Check if analysis works
4. Open browser console (F12) to check for errors

### 6.3 Common Issues

**Frontend shows "Cannot connect to backend"**
- Check that `VITE_PROTOTYPE_API_URL` and `VITE_DEV_API_URL` are set correctly
- Verify backend services are running (check Railway logs)
- Make sure URLs don't have trailing slashes

**CORS errors in browser console**
- Verify `CORS_ORIGIN` in both backends matches your frontend URL exactly
- Check that all services are using HTTPS URLs

**Build failures**
- Check the **"Deployments"** tab for error logs
- Verify all environment variables are set
- Make sure root directories are correct

---

## Quick Reference: Environment Variables

### Prototype Backend
```
Root Directory: prototype/backend
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.railway.app
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini (optional)
```

### Dev Backend
```
Root Directory: dev
NODE_ENV=production
CORS_ORIGIN=https://your-frontend.railway.app
ANTHROPIC_API_KEY=... (optional)
```

### Frontend
```
Root Directory: frontend
NODE_ENV=production
VITE_PROTOTYPE_API_URL=https://prototype-backend.railway.app
VITE_DEV_API_URL=https://dev-backend.railway.app
```

---

## Troubleshooting

### Service won't deploy
- Check **"Deployments"** tab for error messages
- Verify **Root Directory** is set correctly
- Check that `package.json` exists in the root directory

### Can't find Root Directory setting
- Make sure you're in the **"Settings"** tab of the service
- Scroll down to **"Source"** section
- Root Directory should be there

### Environment variables not working
- Make sure variable names are **exactly** as shown (case-sensitive)
- No spaces around the `=` sign
- Click **"Save"** after adding each variable
- Service will redeploy automatically when you save

### Need to see logs
- Click on any service
- Go to **"Deployments"** tab
- Click on the latest deployment
- View **"Build Logs"** or **"Deploy Logs"**

---

## Next Steps

Once everything is deployed:
- ✅ Test all functionality
- ✅ Set up custom domains (optional)
- ✅ Configure monitoring/alerts
- ✅ Set up database backups (if using SQLite, consider PostgreSQL)

---

## Need Help?

If you're stuck:
1. Check Railway's **"Deployments"** tab for error logs
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set correctly
4. Make sure all 3 services show "Active" status

