# Frontend Integration Guide

This guide explains how the new frontend (in `client/`) has been integrated with the prototype backend.

## Architecture Overview

- **New Frontend**: Located in `client/` directory (TypeScript/React with modern UI)
- **Prototype Backend**: Located in `prototype/backend/` (Express.js API server)
- **Main Server**: Located in `server/` (proxies API calls to prototype backend and serves the frontend)

## How It Works

1. The main server (port 5000) serves the React frontend and proxies API requests
2. The prototype backend runs on port 5001 and handles all vehicle analysis logic
3. API calls from the frontend go to `/api/prototype/*` which are proxied to the backend

## Running the Application

### Option 1: Run Both Servers Manually

1. **Start the prototype backend** (in one terminal):
   ```bash
   cd prototype/backend
   npm install  # if not already done
   PROTOTYPE_BACKEND_PORT=5001 npm start
   ```

2. **Start the main server** (in another terminal):
   ```bash
   npm install  # if not already done
   npm run dev
   ```

3. Open your browser to `http://localhost:5000`

### Option 2: Use a Process Manager (Recommended)

You can use `concurrently` or similar tools to run both servers together. Add this to your root `package.json`:

```json
{
  "scripts": {
    "dev:all": "concurrently \"npm run dev:backend\" \"npm run dev\"",
    "dev:backend": "cd prototype/backend && PROTOTYPE_BACKEND_PORT=5001 npm start"
  }
}
```

Then run:
```bash
npm run dev:all
```

## Environment Variables

### Main Server
- `PORT`: Port for the main server (default: 5000)
- `PROTOTYPE_BACKEND_URL`: URL of the prototype backend (default: http://localhost:5001)
- `NODE_ENV`: Set to `production` for production builds

### Prototype Backend
- `PROTOTYPE_BACKEND_PORT`: Port for the backend (default: 5001)
- `PORT`: Alternative way to set port (defaults to 5001 if PROTOTYPE_BACKEND_PORT not set)
- `OPENAI_API_KEY`: Required for PDF parsing functionality
- `CORS_ORIGIN`: CORS allowed origins (default: *)

## API Integration

The frontend uses the API service layer in `client/src/lib/api.ts` which:
- Makes requests to `/api/prototype/*` endpoints
- These are proxied by the main server to the prototype backend
- Data is transformed from backend format to frontend format using `client/src/lib/portfolioTransform.ts`

## Data Flow

1. User interacts with frontend (e.g., uploads PDF, views vehicle)
2. Frontend calls API functions from `client/src/lib/api.ts`
3. Requests go to `/api/prototype/*` endpoints
4. Main server proxies to prototype backend (port 5001)
5. Backend processes request and returns data
6. Frontend transforms data using `portfolioTransform.ts`
7. UI updates with the transformed data

## Current Status

✅ **Completed:**
- API service layer created
- Server proxy configured
- Portfolio data fetching integrated
- Home page loads vehicles from backend
- Data transformation utilities created

🔄 **In Progress:**
- Full vehicle report page integration
- Add vehicle page integration
- Compare page integration

📝 **To Do:**
- Complete all page integrations
- Error handling improvements
- Loading states
- Remove old frontend directory (after full migration)

## Troubleshooting

### Backend not responding
- Make sure prototype backend is running on port 5001
- Check `PROTOTYPE_BACKEND_URL` environment variable
- Verify backend logs for errors

### CORS errors
- Ensure `CORS_ORIGIN` includes your frontend URL
- Check that proxy is working correctly

### Port conflicts
- Change `PROTOTYPE_BACKEND_PORT` to a different port
- Update `PROTOTYPE_BACKEND_URL` in main server accordingly

## Migration Notes

The old frontend in `frontend/` directory is still present but will be removed once the integration is complete. The new frontend in `client/` is the active frontend.

