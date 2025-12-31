import express from 'express'
import fs from 'fs'
import { parsePDFWithAI } from '../../services/aiPdfParser.js'
import { validatePDFFile } from '../../middleware/validation.js'

const router = express.Router()

// POST /api/parse-pdf - Parse PDF and return service history only
router.post('/', 
  validatePDFFile, // Validate PDF file
  async (req, res) => {
    console.log('[PDF Parse] 📥 Received PDF upload request')
    const pdfFile = req.file
    if (!pdfFile) {
      console.log('[PDF Parse] ❌ No file in request')
      return res.status(400).json({ error: 'No file uploaded' })
    }
    console.log('[PDF Parse] 📄 File received:', pdfFile.originalname, `(${(pdfFile.size / 1024).toFixed(2)} KB)`)
    const cleanupFile = () => {
      if (pdfFile?.path) {
        try {
          if (fs.existsSync(pdfFile.path)) {
            fs.unlinkSync(pdfFile.path)
          }
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }

    try {
      // Check if API key is available
      if (!process.env.OPENAI_API_KEY) {
        cleanupFile()
        return res.status(500).json({ 
          error: 'OpenAI API key not configured',
          message: 'Please set OPENAI_API_KEY environment variable'
        })
      }

      console.log(`[PDF Parse] Starting parse for file: ${pdfFile.originalname} (${(pdfFile.size / 1024).toFixed(2)} KB)`)
      
      // Parse PDF with AI
      const serviceHistory = await parsePDFWithAI(pdfFile.path)
      
      console.log(`[PDF Parse] ✅ Successfully parsed PDF`)
      console.log(`[PDF Parse]   - Found ${serviceHistory.records?.length || 0} service records`)
      console.log(`[PDF Parse]   - Vehicle: ${serviceHistory.vehicleInfo?.year || '?'} ${serviceHistory.vehicleInfo?.make || '?'} ${serviceHistory.vehicleInfo?.model || '?'}`)
      
      // Clean up uploaded file
      cleanupFile()

      res.json({
        success: true,
        serviceHistory: {
          records: serviceHistory.records || [],
          metadata: serviceHistory.metadata || {},
          rawText: serviceHistory.rawText,
          vehicleInfo: serviceHistory.vehicleInfo || null
        }
      })
    } catch (error) {
      cleanupFile()
      console.error('Error parsing PDF:', error)
      res.status(500).json({ 
        error: 'Failed to parse PDF',
        message: error.message 
      })
    }
  }
)

export default router

