# Dipstik - Architecture Review & Cleanup Summary

## Architecture Overview

Dipstik is a **React + Node.js/Express** web application that analyzes vehicle service history PDFs and generates maintenance reports using AI (OpenAI) to help users negotiate used car purchases.

### Current Architecture (As Implemented)

```
┌─────────────────┐
│   React Frontend │
│   (Vite + React) │
└────────┬─────────┘
         │
         │ HTTP/REST API
         │
┌────────▼─────────────────────────────────────┐
│         Express Backend Server               │
│  ┌────────────────────────────────────────┐  │
│  │  API Routes:                           │  │
│  │  - POST /api/parse-pdf                 │  │
│  │  - POST /api/routine-maintenance       │  │
│  │  - POST /api/unscheduled-maintenance   │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │  Services Layer:                       │  │
│  │  - aiPdfParser.js (OpenAI PDF parsing) │  │
│  │  - aiResearchService.js (OpenAI queries)│ │
│  │  - executionLogger.js (SQLite DB)      │  │
│  └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
         │
         │
┌────────▼─────────┐
│   SQLite Database │
│  (executionLog.db)│
└───────────────────┘
```

### Data Flow

1. **User uploads PDF** → Frontend calls `/api/parse-pdf`
   - PDF is parsed using AI (OpenAI) only
   - Service history records are extracted
   - Vehicle info (make/model/year) may be extracted from PDF

2. **User submits vehicle data** → Frontend calls two endpoints in parallel:
   - `/api/routine-maintenance` - Gets recommended maintenance schedule
   - `/api/unscheduled-maintenance` - Gets forecast of typical failures

3. **All operations are logged** to SQLite database for audit trail

### Key Components

#### Frontend (`frontend/`)
- **React + Vite** application
- Components:
  - `VehicleForm.jsx` - Input form for vehicle data + PDF upload
  - `ReportDisplay.jsx` - Displays analysis results
  - `MaintenanceTable.jsx` - Renders maintenance data tables
- API client in `services/api.js` handles all backend communication

#### Backend (`backend/`)
- **Express.js** REST API
- **Services:**
  - `aiPdfParser.js` - OpenAI-powered PDF parsing for complex formats (Carfax, dealer records, etc.)
  - `aiResearchService.js` - Queries OpenAI for maintenance schedules and failure patterns
  - `executionLogger.js` - SQLite database logging for all operations (ready for future use)
- **Routes:**
  - `parse-pdf.js` - Handles PDF upload and calls AI parser
  - `routine-maintenance.js` - Queries AI and formats routine maintenance data
  - `unscheduled-maintenance.js` - Queries AI and formats unscheduled maintenance data

#### Database
- **SQLite** (`backend/data/executionLog.db`)
- Tables:
  - `analysis_sessions` - Tracks each analysis session
  - `service_history_inputs` - Stores parsed service records
  - `generated_tables` - Stores generated maintenance tables
  - `generated_reports` - Stores generated reports
  - `ai_research_queries` - Logs all AI API calls

## Issues Found & Fixed

### ✅ Cleanup Completed

1. **Hardcoded test data removed** (`aiResearchService.js`)
   - Removed hardcoded "Audi A6 2018" vehicle spec
   - Now uses actual vehicle parameters from request

2. **Duplicate directory removed**
   - Deleted `frontend/backend/` directory (empty duplicate)

3. **Legacy code removed**
   - Deleted `/api/analyze` route (not used by frontend)
   - Deleted `vehicleAnalyzer.js` service (only used by deleted route)
   - Deleted `reportGenerator.js` (unused, only imported by deleted service)
   - Deleted `pdfParser.js` wrapper (merged logic into route)
   - Deleted `scheduleComparator.js` (inlined formatting into route)
   - Deleted test utility files (`test-api-key.js`, `test-env.js`)

4. **Unused code removed**
   - Removed `promisify` import from `executionLogger.js` (never used)
   - Removed `parsePDFWithVision()` stub from `aiPdfParser.js`
   - Removed unused `analyzeVehicle` function from frontend `api.js`
   - Removed fallback PDF parsing (AI-only now)
   - Removed redundant `dotenv.config()` from `aiResearchService.js`

5. **Code simplification**
   - Removed redundant `vehicleData` object creation in routes
   - Simplified file cleanup logic in parse-pdf route
   - Inlined data formatting logic into routes (removed scheduleComparator)
   - Fixed `unscheduled-maintenance.js` route to return full data structure

6. **Code cleanup**
   - Removed unnecessary console.log statements
   - Fixed misleading comments
   - Removed unused parameters

### Current Architecture

The application now uses a clean, focused architecture:
- **3 API endpoints** (all actively used by frontend):
  - `/api/parse-pdf` - Parses service history PDFs using AI
  - `/api/routine-maintenance` - Gets recommended maintenance schedule from AI
  - `/api/unscheduled-maintenance` - Gets failure forecasts from AI

- **3 core services**:
  - `aiPdfParser.js` - OpenAI-powered PDF parsing (extracts service history from PDFs)
  - `aiResearchService.js` - OpenAI queries for maintenance schedules and failure patterns
  - `executionLogger.js` - SQLite database logging (ready for future use)

- **Data formatting** happens directly in route handlers (keeps routes simple and clear)

### ⚠️ Note

**Service history comparison not yet implemented**
- The app gets maintenance schedules from AI but doesn't compare them against actual service history
- Data formatting is done in routes, not in a separate service
- This is a core feature mentioned in requirements but not yet implemented

## File Structure

```
Dipstik/
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── services/           # API client
│   │   └── App.jsx
│   └── package.json
│
├── backend/                     # Express backend
│   ├── api/
│   │   └── routes/             # API route handlers
│   ├── services/               # Business logic services
│   ├── middleware/             # Express middleware
│   ├── data/                   # SQLite database
│   ├── uploads/                # Temporary PDF storage
│   ├── server.js               # Express server entry point
│   └── package.json
│
├── ARCHITECTURE.md             # Original architecture doc
├── ARCHITECTURE_REVIEW.md      # This file
└── package.json                # Root package (runs both servers)
```

## Recommendations (For Future Development)

1. **Complete the analysis logic**
   - Implement service history comparison (compare parsed service history against AI maintenance schedules)
   - Add logic to determine overdue items and calculate next due dates

2. **Current architecture is good for prototype**
   - Three separate endpoints allow parallel requests
   - Clean separation of concerns
   - Easy to understand and maintain

3. **When scaling to production:**
   - Add caching layer for AI responses (reduce costs)
   - Migrate SQLite to PostgreSQL
   - Add rate limiting
   - Add authentication/authorization
   - Consider adding retry logic for AI API calls

4. **Environment configuration**
   - Ensure `.env` file is properly documented
   - Add example `.env.example` file

## Technology Stack

- **Frontend:** React 18, Vite, Axios
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **AI:** OpenAI API (GPT-4)
- **PDF Processing:** pdf-parse (with AI enhancement)
- **Validation:** Joi
- **File Upload:** Multer

