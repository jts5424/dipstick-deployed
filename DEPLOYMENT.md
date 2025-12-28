# Deployment Guide

This guide covers deploying the unified Dipstick application to Railway.

## Architecture

The application consists of three separate services:

1. **Prototype Backend** (`prototype/backend/`) - Express server for the prototype functionality
2. **Dev Backend** (`dev/`) - Module-based development API server
3. **Unified Frontend** (`frontend/`) - React app with Prototype and Dev modes

## Railway Services Setup

### Service 1: Prototype Backend

- **Root Directory**: `prototype/backend/`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: Auto-assigned (uses `PORT` env var)
- **Environment Variables**:
  - `PORT` - Server port (auto-set by Railway)
  - `OPENAI_API_KEY` - For PDF parsing
  - `CORS_ORIGIN` - Allowed origins (comma-separated)

### Service 2: Dev Backend

- **Root Directory**: `dev/`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: Auto-assigned (uses `PORT` env var)
- **Environment Variables**:
  - `PORT` - Server port (auto-set by Railway)
  - `ANTHROPIC_API_KEY` - For Claude API
  - `CORS_ORIGIN` - Allowed origins (comma-separated)

### Service 3: Unified Frontend

- **Root Directory**: `frontend/`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s dist -l $PORT`
- **Port**: Auto-assigned (uses `PORT` env var)
- **Environment Variables**:
  - `VITE_PROTOTYPE_API_URL` - Prototype backend URL (e.g., `https://api-prototype.yourdomain.com`)
  - `VITE_DEV_API_URL` - Dev backend URL (e.g., `https://api-dev.yourdomain.com`)

## Deployment Steps

1. **Create Railway Project**: Create a new project in Railway

2. **Add Services**: Add three services from the same repository:
   - Service 1: Connect to `prototype/backend/` directory
   - Service 2: Connect to `dev/` directory
   - Service 3: Connect to `frontend/` directory

3. **Configure Environment Variables**: Set the required environment variables for each service

4. **Set Custom Domains** (optional):
   - Prototype Backend: `api-prototype.yourdomain.com`
   - Dev Backend: `api-dev.yourdomain.com`
   - Frontend: `yourdomain.com` (main domain)

5. **Deploy**: Railway will automatically deploy on git push

## Local Development

### Prototype Backend
```bash
cd prototype/backend
npm install
npm start
```

### Dev Backend
```bash
cd dev
npm install
npm run dev:server
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables for Local Development

Create `.env` files in each service directory:

**prototype/backend/.env**:
```
PORT=5000
OPENAI_API_KEY=your-key-here
CORS_ORIGIN=http://localhost:3000
```

**dev/.env**:
```
PORT=5001
ANTHROPIC_API_KEY=your-key-here
CORS_ORIGIN=http://localhost:3000
```

**frontend/.env**:
```
VITE_PROTOTYPE_API_URL=http://localhost:5000
VITE_DEV_API_URL=http://localhost:5001
```

## Notes

- The frontend uses Vite proxy in development mode
- In production, set `VITE_PROTOTYPE_API_URL` and `VITE_DEV_API_URL` to the deployed backend URLs
- Railway automatically sets the `PORT` environment variable
- CORS must be configured to allow requests from the frontend domain

