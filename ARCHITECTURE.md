# Dipstik - High-Level Architecture

## Overview
Dipstik is a web-based platform that analyzes vehicle service history and generates maintenance reports to help users negotiate used car purchases.

## System Architecture

### 1. Frontend Layer
**Technology Stack**: React/Next.js or Vue.js
- **User Input Form**: 
  - Vehicle information (make, model, year, mileage)
  - PDF upload for service history
  - Form validation
- **Report Display**:
  - Immediately due work package table
  - Unscheduled maintenance forecast table
  - Overall condition summary report
  - Interactive UI with filtering/sorting capabilities

### 2. Backend API Layer
**Technology Stack**: Node.js/Express or Python/FastAPI
- **RESTful API Endpoints**:
  - `POST /api/analyze` - Main endpoint to process vehicle data and generate reports
  - `POST /api/upload` - Handle PDF upload and processing
- **Request Processing**:
  - Validate input data
  - Coordinate between services
  - Return structured report data

### 3. PDF Processing Service
**Technology Stack**: Python (PyPDF2/pdfplumber) or Node.js (pdf-parse)
- **Functionality**:
  - Extract text from uploaded PDF service history documents
  - Parse service records (dates, mileage, services performed)
  - Structure extracted data into standardized format
  - Handle various PDF formats and layouts

### 4. AI Research Service
**Technology Stack**: Integration with existing AI research capability (e.g., OpenAI API, Anthropic Claude, or custom AI service)
- **Functionality**:
  - Query AI for recommended routine maintenance schedules by make/model/year
  - Query AI for typical unscheduled maintenance items and failure patterns
  - Retrieve cost ranges (independent shop and OEM) for maintenance items
  - Get expert recommendations from indie mechanics perspective
- **Input**: Vehicle make, model, year
- **Output**: Structured maintenance schedule data and unscheduled maintenance patterns
- **Caching**: May cache results to reduce API calls for same vehicle specs

### 5. Data Layer (Execution Log)
**Storage**: SQLite (prototype) or PostgreSQL (production)
- **Purpose**: Audit trail and execution log of all operations
- **Schema**:
  - `analysis_sessions` table: session_id, timestamp, vehicle_make, vehicle_model, vehicle_year, mileage, created_at
  - `service_history_inputs` table: session_id, service_record_id, service_date, mileage, service_description, raw_pdf_data, parsed_data
  - `generated_tables` table: session_id, table_type (routine/unscheduled/overall), table_data (JSON), created_at
  - `generated_reports` table: session_id, report_type, report_data (JSON), created_at
  - `ai_research_queries` table: session_id, query_type, query_params, response_data, timestamp
- **Functionality**:
  - Log all service history inputs from PDF parsing
  - Store all generated tables and reports
  - Track AI research queries and responses
  - Enable audit trail and potential report regeneration

### 6. Business Logic Layer

#### 6.1 Schedule Comparison Engine
- Compare service history against recommended maintenance schedules
- Calculate overdue items and severity
- Determine next due dates based on intervals

#### 6.2 Forecast Engine
- Analyze service history patterns
- Predict unscheduled maintenance based on:
  - Mileage thresholds
  - Age of vehicle
  - Historical failure patterns
  - Typical failure intervals
- Calculate likelihood percentages
- Generate narrative explanations

#### 6.3 Report Generator
- Aggregate data from comparison and forecast engines
- Categorize items (immediately due, next 10k miles, 3-5 year forecast)
- Calculate total costs
- Generate narrative summaries

### 7. External Integrations
- **AI Research Service**: Primary integration for maintenance schedules and failure patterns
- **Future Enhancements**:
  - Cost estimation APIs
  - Vehicle specification databases

## Data Flow

```
User Input (Form) 
  ↓
Frontend Validation
  ↓
PDF Upload → PDF Processing Service → Parsed Service History
  ↓
Backend API (/api/analyze)
  ↓
├─→ Log Analysis Session (Data Layer)
├─→ Log Service History Inputs (Data Layer)
├─→ AI Research Service
│   ├─→ Query: Routine maintenance schedule (make/model/year)
│   └─→ Query: Typical unscheduled maintenance items (make/model/year)
├─→ Log AI Research Queries & Responses (Data Layer)
├─→ Schedule Comparison Engine
│   └─→ Compare service history vs AI-provided schedule
├─→ Forecast Engine
│   └─→ Predict unscheduled maintenance using AI data
├─→ Report Generator
│   └─→ Generate tables and summary reports
├─→ Log Generated Tables (Data Layer)
└─→ Log Generated Reports (Data Layer)
  ↓
Structured Report Data (JSON)
  ↓
Frontend Display (Tables & Summary)
```

## Component Breakdown

### Core Modules

1. **Vehicle Service Analyzer**
   - Input: Vehicle info + Service history
   - Output: Analysis results

2. **AI Research Service Integration**
   - Interface with AI research capability
   - Query for maintenance schedules
   - Query for unscheduled maintenance patterns
   - Parse and structure AI responses

3. **Service History Parser**
   - Extract and normalize service records
   - Handle various PDF formats

4. **Comparison Engine**
   - Routine maintenance comparison
   - Overdue calculation
   - Risk assessment

5. **Forecast Engine**
   - Unscheduled maintenance prediction
   - Likelihood calculation
   - Timeline estimation

6. **Report Builder**
   - Format data into report structures
   - Generate narratives
   - Calculate totals and summaries

7. **Execution Logger**
   - Log all service history inputs
   - Store generated tables and reports
   - Track AI queries and responses
   - Maintain audit trail

## Technology Recommendations

### Prototype Stack
- **Frontend**: React with Vite or Next.js
- **Backend**: Python FastAPI (good for PDF processing) or Node.js/Express
- **PDF Processing**: Python (pdfplumber) or Node.js (pdf-parse)
- **Database**: SQLite for prototype, PostgreSQL for production
- **Deployment**: Docker containers

### Key Libraries
- PDF Processing: `pdfplumber` (Python) or `pdf-parse` (Node.js)
- Data Processing: `pandas` (Python) or native JavaScript
- Date/Mileage Calculations: Built-in libraries
- API Framework: FastAPI (Python) or Express (Node.js)

## Development Phases

### Phase 1: Core Infrastructure
- Set up project structure
- Create basic frontend form
- Set up backend API skeleton
- Implement basic PDF upload

### Phase 2: AI Integration & Data Layer
- Integrate AI research service
- Create execution log database schema
- Build service history parser
- Implement logging for all operations

### Phase 3: Analysis Engines
- Build schedule comparison engine
- Implement forecast engine
- Create risk assessment logic

### Phase 4: Report Generation
- Build report generator
- Format output data
- Create frontend display components

### Phase 5: Polish & Testing
- UI/UX improvements
- Error handling
- Testing with sample data
- Documentation

## File Structure (Proposed)

```
dipstik/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── VehicleForm.jsx
│   │   │   ├── ReportDisplay.jsx
│   │   │   └── MaintenanceTable.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
├── backend/
│   ├── api/
│   │   ├── routes/
│   │   │   └── analyze.js
│   │   └── server.js
│   ├── services/
│   │   ├── pdfParser.js
│   │   ├── aiResearchService.js
│   │   ├── scheduleComparator.js
│   │   ├── forecastEngine.js
│   │   ├── reportGenerator.js
│   │   └── executionLogger.js
│   ├── data/
│   │   └── executionLog.db
│   └── package.json
├── readme.md
└── ARCHITECTURE.md
```

## Next Steps
1. Choose technology stack (Python vs Node.js)
2. Identify and configure AI research service integration
3. Set up project structure
4. Create execution log database schema
5. Build basic frontend form
6. Implement PDF upload functionality
7. Integrate AI research service for maintenance data

