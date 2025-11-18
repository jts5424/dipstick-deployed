import express from 'express'
import { validate, vehicleDataWithServiceHistorySchema } from '../../middleware/validation.js'
import { analyzeServiceHistory } from '../../services/serviceHistoryAnalyzer.js'
import { logAnalysisSession, logAICall } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/analyze-service-history - Analyze service history for expert evaluation
router.post('/', 
  validate(vehicleDataWithServiceHistorySchema, 'body'), // Validate vehicle data with service history
  async (req, res) => {
    try {
      // req.body is already validated and sanitized by middleware
      const { make, model, year, mileage, trim, engine, vin } = req.body
      const { serviceHistory } = req.body

      // Validate service history is provided
      if (!serviceHistory || !serviceHistory.records || !Array.isArray(serviceHistory.records)) {
        return res.status(400).json({
          error: 'Service history is required',
          message: 'Please provide serviceHistory with records array'
        })
      }

      // Create analysis session
      const sessionId = await logAnalysisSession({ make, model, year, mileage, trim, engine, vin })

      // Analyze service history
      const analysis = await analyzeServiceHistory(serviceHistory, {
        make,
        model,
        year,
        mileage,
        trim,
        engine,
        vin
      })

      await logAICall(sessionId, 'service_history_analysis', {
        make,
        model,
        year,
        recordCount: serviceHistory.records.length
      }, analysis)

      res.json({
        success: true,
        analysis
      })
    } catch (error) {
      console.error('Error analyzing service history:', error)
      res.status(500).json({ 
        error: 'Failed to analyze service history',
        message: error.message 
      })
    }
  }
)

export default router

