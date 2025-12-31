import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import parsePdfRoutes from './api/routes/parse-pdf.js'
import routineMaintenanceRoutes from './api/routes/routine-maintenance.js'
import unscheduledMaintenanceRoutes from './api/routes/unscheduled-maintenance.js'
import analyzeServiceHistoryRoutes from './api/routes/analyze-service-history.js'
import maintenanceGapAnalysisRoutes from './api/routes/maintenance-gap-analysis.js'
import unscheduledMaintenanceRiskRoutes from './api/routes/unscheduled-maintenance-risk.js'
import portfolioRoutes from './api/routes/portfolio.js'
import marketValuationRoutes from './api/routes/market-valuation.js'
import totalCostOfOwnershipRoutes from './api/routes/total-cost-of-ownership.js'
import { initializeDatabase } from './services/executionLogger.js'

// Load environment variables
dotenv.config()

// Debug: Log if OpenAI API key is loaded (without exposing the full key)
if (process.env.OPENAI_API_KEY) {
  console.log('✓ OpenAI API key loaded (starts with:', process.env.OPENAI_API_KEY.substring(0, 7) + '...)')
} else {
  console.log('⚠ OpenAI API key not found. AI PDF parsing will be disabled.')
  console.log('  To enable AI parsing, create backend/.env with: OPENAI_API_KEY=your-key-here')
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
// Use port 5001 by default to avoid conflicts with the main server (port 5000)
// Can be overridden with PROTOTYPE_BACKEND_PORT environment variable
const PORT = process.env.PROTOTYPE_BACKEND_PORT || process.env.PORT || 5001

// Configure CORS
const isProduction = process.env.NODE_ENV === 'production'
const corsOrigin = process.env.CORS_ORIGIN

if (isProduction && !corsOrigin) {
  console.error('ERROR: CORS_ORIGIN environment variable is required in production')
  process.exit(1)
}

const corsOptions = {
  origin: corsOrigin 
    ? corsOrigin.split(',').map(origin => origin.trim())
    : 'http://localhost:3000', // Safe default for development
  credentials: true
}

// Middleware
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configure multer for file uploads
const maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760') // Default 10MB
const upload = multer({ 
  dest: join(__dirname, 'uploads/'),
  limits: { fileSize: maxFileSize }
})

// Routes
app.use('/api/parse-pdf', upload.single('serviceHistory'), parsePdfRoutes)
app.use('/api/routine-maintenance', routineMaintenanceRoutes)
app.use('/api/unscheduled-maintenance', unscheduledMaintenanceRoutes)
app.use('/api/analyze-service-history', analyzeServiceHistoryRoutes)
app.use('/api/maintenance-gap-analysis', maintenanceGapAnalysisRoutes)
app.use('/api/unscheduled-maintenance-risk', unscheduledMaintenanceRiskRoutes)
app.use('/api/portfolio', portfolioRoutes)
app.use('/api/market-valuation', marketValuationRoutes)
app.use('/api/total-cost-of-ownership', totalCostOfOwnershipRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Dipstik API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      portfolio: '/api/portfolio',
      parsePdf: '/api/parse-pdf',
      routineMaintenance: '/api/routine-maintenance',
      unscheduledMaintenance: '/api/unscheduled-maintenance',
      analyzeServiceHistory: '/api/analyze-service-history',
      maintenanceGapAnalysis: '/api/maintenance-gap-analysis',
      unscheduledMaintenanceRisk: '/api/unscheduled-maintenance-risk',
      marketValuation: '/api/market-valuation',
      totalCostOfOwnership: '/api/total-cost-of-ownership'
    }
  })
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dipstik API is running' })
})

// Initialize database on startup
initializeDatabase().then(() => {
  console.log('Database initialized')
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch((error) => {
  console.error('Failed to initialize database:', error)
  process.exit(1)
})

