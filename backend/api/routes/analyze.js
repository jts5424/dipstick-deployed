import express from 'express'
import { analyzeVehicleData } from '../../services/vehicleAnalyzer.js'
import { validate, vehicleDataSchema, validatePDFFile } from '../../middleware/validation.js'

const router = express.Router()

// Apply validation middleware
router.post('/', 
  validatePDFFile, // Validate PDF file first
  validate(vehicleDataSchema, 'body'), // Validate vehicle data
  async (req, res) => {
    try {
      // Data is already validated and sanitized by middleware
      const vehicleData = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year, // Already parsed as number by Joi
        mileage: req.body.mileage // Already parsed as number by Joi
      }

      const pdfFile = req.file

      const reportData = await analyzeVehicleData(vehicleData, pdfFile)

      res.json(reportData)
    } catch (error) {
      console.error('Error analyzing vehicle:', error)
      res.status(500).json({ 
        error: 'Failed to analyze vehicle data',
        message: error.message 
      })
    }
  }
)

export default router

