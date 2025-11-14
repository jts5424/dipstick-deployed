import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import analyzeRoutes from './api/routes/analyze.js'
import parsePdfRoutes from './api/routes/parse-pdf.js'
import routineMaintenanceRoutes from './api/routes/routine-maintenance.js'
import unscheduledMaintenanceRoutes from './api/routes/unscheduled-maintenance.js'
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
const PORT = process.env.PORT || 5000

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : '*', // Allow all origins in development if not specified
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
app.use('/api/analyze', upload.single('serviceHistory'), analyzeRoutes)
app.use('/api/parse-pdf', upload.single('serviceHistory'), parsePdfRoutes)
app.use('/api/routine-maintenance', routineMaintenanceRoutes)
app.use('/api/unscheduled-maintenance', unscheduledMaintenanceRoutes)

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

