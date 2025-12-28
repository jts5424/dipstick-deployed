import express from 'express'
import { validate, vehicleDataSchema } from '../../middleware/validation.js'
import { getMarketValuation } from '../../services/marketValuationService.js'
import { logAnalysisSession, logAICall } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/market-valuation - Get market valuation for a vehicle
router.post('/', 
  validate(vehicleDataSchema, 'body'),
  async (req, res) => {
    try {
      const { make, model, year, mileage, trim, engine, vin } = req.body

      // Create analysis session
      const sessionId = await logAnalysisSession({ make, model, year, mileage, trim, engine, vin })

      // Get market valuation
      const valuation = await getMarketValuation({ make, model, year, mileage, trim, engine, vin })

      await logAICall(sessionId, 'market_valuation', {
        make,
        model,
        year,
        mileage
      }, valuation)

      res.json({
        success: true,
        valuation
      })
    } catch (error) {
      console.error('Error getting market valuation:', error)
      res.status(500).json({ 
        error: 'Failed to get market valuation',
        message: error.message 
      })
    }
  }
)

export default router

