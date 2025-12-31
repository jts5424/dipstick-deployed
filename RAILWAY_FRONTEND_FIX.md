# Railway Frontend Service Issue

## Problem
Railway frontend service is configured with Root Directory = `frontend/`, but:
- The frontend is built by the root `package.json` (`npm run build`)
- The build script is in `script/build.ts` (root directory)
- `package-lock.json` is in root, not in `frontend/`
- When Railway tries `cd .. && npm ci`, it can't find `package-lock.json`

## Root Cause
The frontend is NOT a standalone service - it's part of the main server build. The main server (`server/index.ts`) serves the built frontend from `dist/public`.

## Solution Options

### Option 1: Use Root Directory (Recommended)
**In Railway Dashboard:**
1. Go to Frontend Service → Settings
2. Change **Root Directory** from `frontend/` to `/` (root)
3. Update `railway.json` to use root build commands
4. The service will build and serve the frontend as part of the main server

### Option 2: Make Frontend Standalone
Create a standalone build process in `frontend/` that doesn't depend on root:
- Copy necessary files to `frontend/`
- Create standalone build script
- More complex, not recommended

### Option 3: Single Service (Best Architecture)
Since the main server already serves the frontend, you might only need ONE Railway service:
- Root Directory: `/`
- Build: `npm run build`
- Start: `npm start`
- This serves both API and frontend

## Recommended Fix
Change Railway service Root Directory to `/` (root) instead of `frontend/`

