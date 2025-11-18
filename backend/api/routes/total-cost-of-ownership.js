import express from 'express'
import { validate, totalCostOfOwnershipSchema } from '../../middleware/validation.js'
import { calculateTotalCostOfOwnership } from '../../services/totalCostOfOwnershipService.js'
import { logAnalysisSession, logAICall } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/total-cost-of-ownership - Calculate comprehensive TCO
router.post('/', 
  validate(totalCostOfOwnershipSchema, 'body'),
  async (req, res) => {
    try {
      const { 
        make, 
        model, 
        year, 
        mileage, 
        trim, 
        engine, 
        vin,
        purchasePrice,
        timePeriodYears,
        milesPerYear,
        gapAnalysis,
        riskEvaluation,
        serviceHistoryAnalysis,
        routineMaintenance,
        marketValuation
      } = req.body

      // Create analysis session
      const sessionId = await logAnalysisSession({ make, model, year, mileage, trim, engine, vin })

      // Calculate TCO
      const tco = calculateTotalCostOfOwnership({
        gapAnalysis: gapAnalysis || null,
        riskEvaluation: riskEvaluation || null,
        serviceHistoryAnalysis: serviceHistoryAnalysis || null,
        routineMaintenance: routineMaintenance || [],
        marketValuation: marketValuation || null,
        purchasePrice: parseFloat(purchasePrice),
        timePeriodYears: parseFloat(timePeriodYears),
        milesPerYear: parseFloat(milesPerYear),
        currentMileage: parseInt(mileage)
      })

      await logAICall(sessionId, 'total_cost_of_ownership', {
        make,
        model,
        year,
        mileage,
        purchasePrice,
        timePeriodYears,
        milesPerYear
      }, tco)

      res.json({
        success: true,
        tco
      })
    } catch (error) {
      console.error('Error calculating total cost of ownership:', error)
      res.status(500).json({ 
        error: 'Failed to calculate total cost of ownership',
        message: error.message 
      })
    }
  }
)

export default router

