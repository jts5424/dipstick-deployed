# Dipstick - Vehicle Analysis Platform

A comprehensive vehicle analysis platform that parses service history, performs maintenance gap analysis, risk evaluation, and market valuation to help users make informed vehicle purchase decisions.

## Project Structure

```
Dipstick/
├── frontend/              # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── pages/        # Main application pages
│   │   ├── components/   # Reusable UI components
│   │   └── lib/          # API clients and utilities
│   └── public/           # Static assets
│
├── prototype/backend/     # Express.js backend (Node.js)
│   ├── api/routes/       # API route handlers
│   ├── services/         # Business logic services
│   ├── middleware/       # Request validation
│   └── data/             # SQLite database storage
│
├── server/                # Production proxy server (optional)
│   └── index.ts          # Proxies API calls and serves frontend
│
├── dev/                   # Development framework for module testing
│   ├── modules/          # Module-based architecture for testing
│   └── framework/        # Shared framework utilities
│
├── shared/                # Shared TypeScript types and schemas
│   └── schema.ts         # Drizzle ORM schema (user auth - PostgreSQL)
│
├── start-servers.ps1     # Start both frontend and backend (dev)
├── stop-servers.ps1      # Stop all servers
└── README.md             # This file
```

### Development vs Production

**Development Mode:**
- Frontend runs on port 3000 (Vite dev server)
- Backend runs on port 5001 (Express API)
- Use `start-servers.ps1` to run both

**Production Mode:**
- Root `server/` proxies API calls and serves built frontend
- Single port (default 5000)
- Use `npm run build` then `npm start`

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Vite** for build tooling
- **Wouter** for routing
- **Radix UI** for component primitives
- **Tailwind CSS** for styling
- **Recharts** for data visualization

### Backend
- **Express.js** for API server
- **SQLite3** for database
- **OpenAI API** for AI-powered analysis
- **PDF-parse** for service history extraction

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- OpenAI API key (set in environment variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Dipstick
   ```

2. **Install dependencies**
   ```bash
   # Frontend
   cd frontend
   npm install
   
   # Backend
   cd ../prototype/backend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # In prototype/backend/
   echo "OPENAI_API_KEY=your_key_here" > .env
   ```

4. **Start both servers**
   ```powershell
   # From root directory
   .\start-servers.ps1
   ```

   Or manually:
   ```bash
   # Terminal 1 - Backend (port 5001)
   cd prototype/backend
   npm run dev
   
   # Terminal 2 - Frontend (port 3000)
   cd frontend
   npm run dev
   ```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Health Check: http://localhost:5001/api/health

## Database Structure

### Vehicle Data (SQLite)
The main application uses SQLite with the following normalized structure:

- **`portfolio`** - Vehicle information and parsed service history
- **`service_history_analysis`** - AI analysis of service history
- **`routine_maintenance`** - Maintenance schedule data
- **`gap_analysis`** - Maintenance gap analysis results
- **`unscheduled_maintenance`** - Unscheduled repair forecasts
- **`risk_evaluation`** - Risk assessment data
- **`market_valuation`** - Market valuation data

Each analysis type is stored in its own table with `portfolio_id` as the foreign key.

### User Authentication (Supabase PostgreSQL)
The root `server/` directory is configured with **Drizzle ORM** for Supabase PostgreSQL-based user authentication:
- **Drizzle ORM**: TypeScript ORM for type-safe database queries
- **Database**: Supabase PostgreSQL (configured via `DATABASE_URL` environment variable)
- **Schema**: Defined in `shared/schema.ts` (users table)
- **Migrations**: Managed via `drizzle-kit` (run `npm run db:push` to sync schema)
- **Configuration**: `drizzle.config.ts` connects to Supabase PostgreSQL
- **Status**: Ready for deployment - connect to Supabase by setting `DATABASE_URL`

**Note**: The vehicle data uses SQLite in `prototype/backend/`, while user authentication uses Supabase PostgreSQL via Drizzle.

## Workflow

1. **Parse PDF** - Upload and parse vehicle service history PDF
   - Extracts service records
   - Analyzes service history
   - Saves to database

2. **Run Analysis** - Generate comprehensive analysis
   - Step 1: Routine maintenance schedule
   - Step 2: Gap analysis (maintenance gaps)
   - Step 3: Unscheduled maintenance (typical failures)
   - Step 4: Risk assessment
   - Step 5: Market valuation

3. **View Reports** - Access analysis results in different tabs
   - Summary
   - Market Valuation
   - Projected Future Repairs
   - Maintenance & Due Now
   - Leverage Builder
   - Vehicle History

## Development

### Scripts

**Root level:**
- `start-servers.ps1` - Start both frontend and backend
- `stop-servers.ps1` - Stop all running servers
- `npm run build` - Build frontend and server for production
- `npm run db:push` - Push Drizzle schema to Supabase PostgreSQL

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start production server

**Production Server (Root):**
- `npm run dev` - Start development server (proxies to backend)
- `npm start` - Start production server (serves built frontend + proxies API)

## API Endpoints

- `POST /api/prototype/parse-pdf` - Parse service history PDF
- `POST /api/prototype/service-history-analysis` - Analyze service history
- `POST /api/prototype/routine-maintenance` - Get maintenance schedule
- `POST /api/prototype/maintenance-gap-analysis` - Perform gap analysis
- `POST /api/prototype/unscheduled-maintenance` - Get unscheduled repairs
- `POST /api/prototype/unscheduled-maintenance-risk` - Risk evaluation
- `POST /api/prototype/market-valuation` - Get market valuation
- `GET /api/prototype/portfolio` - Get all portfolios
- `GET /api/prototype/portfolio/:id` - Get specific portfolio
- `POST /api/prototype/portfolio` - Save/update portfolio
- `DELETE /api/prototype/portfolio/:id` - Delete portfolio

## Contributing

1. Follow TypeScript best practices
2. Use meaningful commit messages
3. Test changes before committing
4. Update documentation as needed

## Deployment

### Railway + Supabase Setup

The application is configured for deployment on Railway with Supabase PostgreSQL:

**Required Files:**
- `railway.json` - Railway deployment configuration
- `nixpacks.toml` - Build configuration (in each service directory)
- `drizzle.config.ts` - Drizzle ORM configuration for Supabase
- `shared/schema.ts` - Database schema definitions
- `server/` - Production server that proxies API and serves frontend

**Environment Variables for Railway:**
- `DATABASE_URL` - Supabase PostgreSQL connection string
- `OPENAI_API_KEY` - Required for PDF parsing
- `NODE_ENV` - Set to `production`
- `PROTOTYPE_BACKEND_URL` - Backend API URL (if using separate services)

**Supabase Setup:**
1. Create a Supabase project
2. Get the PostgreSQL connection string
3. Set `DATABASE_URL` in Railway environment variables
4. Run `npm run db:push` to sync Drizzle schema to Supabase

See `RAILWAY_DEPLOYMENT.md` for detailed deployment instructions.

## License

MIT

