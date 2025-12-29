# How to Set Environment Variables in Railway

## Where to Set Environment Variables

**Answer: Set them in EACH SERVICE, not in the project.**

Each service (Prototype Backend, Dev Backend, Frontend) has its own environment variables section.

---

## Step-by-Step: Setting Environment Variables

### For Prototype Backend Service:

1. In Railway dashboard, click on your **Prototype Backend** service
2. Click the **"Variables"** tab (at the top, next to Settings, Deployments, etc.)
3. Click **"+ New Variable"** button
4. Add each variable one by one:

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 2:**
   - Name: `CORS_ORIGIN`
   - Value: `https://your-frontend-url.railway.app` (replace with your actual frontend URL)
   - Click **"Add"**

   **Variable 3:**
   - Name: `OPENAI_API_KEY`
   - Value: `sk-your-actual-openai-key-here` (your real OpenAI API key)
   - Click **"Add"**

   **Variable 4 (Optional):**
   - Name: `OPENAI_MODEL`
   - Value: `gpt-4o-mini`
   - Click **"Add"**

5. After adding all variables, Railway will automatically redeploy the service

---

### For Dev Backend Service:

1. Click on your **Dev Backend** service
2. Click the **"Variables"** tab
3. Click **"+ New Variable"**

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 2:**
   - Name: `CORS_ORIGIN`
   - Value: `https://your-frontend-url.railway.app` (replace with your actual frontend URL)
   - Click **"Add"**

   **Variable 3 (Optional - only if using Claude API):**
   - Name: `ANTHROPIC_API_KEY`
   - Value: `your-anthropic-key`
   - Click **"Add"**

---

### For Frontend Service:

1. Click on your **Frontend** service
2. Click the **"Variables"** tab
3. Click **"+ New Variable"**

   **Variable 1:**
   - Name: `NODE_ENV`
   - Value: `production`
   - Click **"Add"**

   **Variable 2:**
   - Name: `VITE_PROTOTYPE_API_URL`
   - Value: `https://your-prototype-backend-url.railway.app` (no trailing slash!)
   - Click **"Add"**

   **Variable 3:**
   - Name: `VITE_DEV_API_URL`
   - Value: `https://your-dev-backend-url.railway.app` (no trailing slash!)
   - Click **"Add"**

   **Note:** You do NOT need to set `PORT` for the frontend. Railway automatically sets it, and the frontend build process uses it automatically.

---

## Visual Guide: Where to Find Variables Tab

```
Railway Dashboard
┌─────────────────────────────────────┐
│ Service: Prototype Backend          │
├─────────────────────────────────────┤
│ [Settings] [Variables] [Deployments]│ ← Click "Variables" here
│         [Metrics] [Logs]            │
├─────────────────────────────────────┤
│                                     │
│ Environment Variables               │
│ ┌─────────────────────────────────┐ │
│ │ + New Variable                  │ │ ← Click this to add
│ └─────────────────────────────────┘ │
│                                     │
│ [List of existing variables]       │
└─────────────────────────────────────┘
```

---

## Important Notes:

1. **Each service has its own variables** - don't set them at the project level
2. **No PORT variable needed for frontend** - Railway sets it automatically
3. **No trailing slashes** - URLs should be like `https://example.com` not `https://example.com/`
4. **Case sensitive** - Variable names must match exactly (e.g., `NODE_ENV` not `node_env`)
5. **No spaces around =** - When Railway shows the variable, it's already formatted correctly
6. **Auto-redeploy** - Services automatically redeploy when you add/change variables

---

## Quick Checklist:

### Prototype Backend Variables:
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN=https://your-frontend.railway.app`
- [ ] `OPENAI_API_KEY=sk-...`

### Dev Backend Variables:
- [ ] `NODE_ENV=production`
- [ ] `CORS_ORIGIN=https://your-frontend.railway.app`

### Frontend Variables:
- [ ] `NODE_ENV=production`
- [ ] `VITE_PROTOTYPE_API_URL=https://prototype-backend.railway.app`
- [ ] `VITE_DEV_API_URL=https://dev-backend.railway.app`
- [ ] **NO PORT variable needed!**

---

## How to Get Your Service URLs:

1. Click on any service
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Copy the Railway-generated URL (looks like `https://service-name-production.up.railway.app`)

Use these URLs in your environment variables!

