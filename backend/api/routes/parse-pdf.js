import express from 'express'
import { parseServiceHistory } from '../../services/pdfParser.js'
import { validatePDFFile } from '../../middleware/validation.js'

const router = express.Router()

// POST /api/parse-pdf - Parse PDF and return service history only
router.post('/', 
  validatePDFFile, // Validate PDF file
  async (req, res) => {
    try {
      const pdfFile = req.file
      
      if (!pdfFile) {
        return res.status(400).json({ 
          error: 'No PDF file provided',
          message: 'Please upload a service history PDF file'
        })
      }

      const serviceHistory = await parseServiceHistory(pdfFile.path)

      console.log('Service history vehicleInfo:', serviceHistory.vehicleInfo)

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
      console.error('Error parsing PDF:', error)
      res.status(500).json({ 
        error: 'Failed to parse PDF',
        message: error.message 
      })
    }
  }
)

export default router

