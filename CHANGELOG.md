# Changelog

All notable changes and improvements to the Dipstick project.

## Repository Cleanup (Latest)

### Files Removed
- `start-backend.ps1`, `start-frontend.ps1` - Consolidated into `start-servers.ps1`
- `restart-services.ps1` - Redundant
- `test-frontend-build.ps1`, `test-frontend-dev.ps1`, `test-local.ps1` - Test scripts
- `postcss.config.js.backup` - Backup file
- `RENAME_CHECKLIST.md`, `CODEBASE_ANALYSIS_REPORT.md`, `RAILWAY_FRONTEND_FIX.md` - Completed/outdated docs
- `frontend-legacy/` - Old frontend code (removed by user)
- `attached_assets/` - Unused assets (removed by user)

### Configuration Updates
- Updated `.gitignore` with proper exclusions
- Cleaned up `vite.config.ts` path aliases
- Consolidated startup scripts

### Documentation
- Created comprehensive `README.md` with project structure and deployment guide
- Created `RAILWAY_DEPLOYMENT.md` for Railway deployment instructions
- Consolidated cleanup and integration notes into this changelog

## Architecture

### Current Structure
- **Frontend**: `frontend/` - React/TypeScript application
- **Prototype Backend**: `prototype/backend/` - Express.js API server
- **Dev Backend**: `dev/` - Module-based development API server
- **Production Server**: `server/` - Proxy server for Railway deployment
- **Shared**: `shared/` - Drizzle ORM schema for Supabase PostgreSQL

### Integration
- Frontend communicates with backend via API layer (`frontend/src/lib/api.ts`)
- Data transformation handled by `frontend/src/lib/portfolioTransform.ts`
- Production server proxies API requests and serves static frontend

## Deployment

### Railway Configuration
- Three separate services: Prototype Backend, Dev Backend, Frontend
- Each service has `railway.json` and `nixpacks.toml` configuration
- Environment variables configured per service

### Database
- **Development**: SQLite in `prototype/backend/data/`
- **Production**: Supabase PostgreSQL via Drizzle ORM
- Schema defined in `shared/schema.ts`
- Migrations via `npm run db:push`

### Key Files for Deployment
- `railway.json` (root and service-specific)
- `nixpacks.toml` (build configs)
- `drizzle.config.ts` (PostgreSQL connection)
- `server/` directory (production server)

## Recent Fixes

### Backend Port Configuration
- Fixed `prototype/backend/server.js` to use `process.env.PORT` instead of hardcoded port
- Ensures Railway deployment works correctly

### Data Transformation
- Fixed market valuation data flow from backend to frontend
- Fixed projected future repairs data transformation
- Updated gap analysis calculations and display

### UI Improvements
- Maintenance cost outlook chart with user-configurable miles/year
- Fixed maintenance urgency display with proper color coding
- Improved gap analysis calculations and overdue detection

