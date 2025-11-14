# Dipstik - Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn

## Environment Configuration

### Local Development Setup

1. **Backend**: Copy `backend/.env.example` to `backend/.env` and fill in your values:
   ```bash
   cd backend
   cp .env.example .env
   # Then edit .env with your actual values
   ```

2. **Frontend**: Copy `frontend/.env.example` to `frontend/.env` (optional, defaults work for dev)

### Required Environment Variables

#### Backend Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origins (comma-separated)
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 10485760 = 10MB)
- `OPENAI_API_KEY` - OpenAI API key for PDF parsing (required for Carfax parsing)
- `OPENAI_MODEL` - OpenAI model to use (default: gpt-4o-mini)

#### Frontend Variables
- `VITE_API_BASE_URL` - Backend API URL (empty for dev proxy)
- `VITE_PORT` - Frontend dev server port (default: 3000)
- `VITE_API_TARGET` - Backend URL for Vite proxy (default: http://localhost:5000)

### Cloud Deployment

**Never commit `.env` files to git!** They are already in `.gitignore`.

For cloud deployment (AWS, Heroku, Vercel, Railway, etc.), set environment variables in your hosting platform:

#### Example: Vercel
```bash
vercel env add OPENAI_API_KEY
vercel env add PORT
# etc.
```

#### Example: Railway/Render
Set environment variables in the platform dashboard under "Environment Variables"

#### Example: AWS/Docker
```bash
docker run -e OPENAI_API_KEY=sk-... -e PORT=5000 ...
```

**Important:** 
- The `.env.example` file shows what variables are needed (safe to commit)
- The actual `.env` file should never be committed (already in `.gitignore`)
- For production, always set environment variables through your hosting platform's interface

## Installation

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend will run on `http://localhost:5000`

### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:3000`

## Project Structure

```
dipstik/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── ARCHITECTURE.md    # Architecture documentation
└── readme.md          # Project requirements
```

## Next Steps

1. **Configure AI Research Service**: Update `backend/services/aiResearchService.js` to integrate with your AI research capability
2. **Enhance PDF Parser**: Improve `backend/services/pdfParser.js` to handle various PDF formats
3. **Test with Sample Data**: Upload a sample service history PDF to test the flow

## API Endpoints

- `POST /api/analyze` - Main endpoint for vehicle analysis
- `GET /api/health` - Health check endpoint

