import express from 'express'
import { validate, vehicleDataSchema } from '../../middleware/validation.js'
import { queryUnscheduledMaintenance } from '../../services/aiResearchService.js'
import { logAnalysisSession, logAICall, logGeneratedTable } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/unscheduled-maintenance - Get unscheduled maintenance forecast table
router.post('/', 
  validate(vehicleDataSchema, 'body'), // Validate vehicle data
  async (req, res) => {
    try {
      // req.body is already validated and sanitized by middleware
      const { make, model, year, mileage, trim, engine, vin } = req.body

      // Create analysis session
      const sessionId = await logAnalysisSession({ make, model, year, mileage, trim, engine, vin })

      // Query AI for unscheduled maintenance patterns
      const unscheduledPatterns = await queryUnscheduledMaintenance(
        make,
        model,
        year,
        trim || null,
        engine || null
      )
      await logAICall(sessionId, 'unscheduled_maintenance', {
        make,
        model,
        year
      }, unscheduledPatterns)

      // Format AI data for display - return full data structure
      const unscheduledMaintenance = (!unscheduledPatterns || !unscheduledPatterns.items) 
        ? []
        : unscheduledPatterns.items.map(pattern => ({
        item: pattern.item || 'Unknown',
        forecast_mileage: pattern.forecastMileageMin && pattern.forecastMileageMax
          ? `${pattern.forecastMileageMin.toLocaleString()}-${pattern.forecastMileageMax.toLocaleString()}`
          : pattern.forecastMileageMin
          ? pattern.forecastMileageMin.toLocaleString()
          : 'N/A',
        probability: pattern.probability ? `${pattern.probability}%` : 'N/A',
        cost_range: pattern.costRange ? `$${pattern.costRange.min}-$${pattern.costRange.max}` : 'N/A',
        oem_cost: pattern.oemCost ? `$${pattern.oemCost.min}-$${pattern.oemCost.max}` : 'N/A',
        description: pattern.description || '',
        preventative_actions: pattern.preventativeActions || '',
        inspection: pattern.inspection || ''
      }))
      await logGeneratedTable(sessionId, 'unscheduled', unscheduledMaintenance)

      res.json({
        success: true,
        unscheduledMaintenance
      })
    } catch (error) {
      console.error('Error generating unscheduled maintenance:', error)
      res.status(500).json({ 
        error: 'Failed to generate unscheduled maintenance table',
        message: error.message 
      })
    }
  }
)

export default router

