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
      const vehicleData = {
        make: req.body.make,
        model: req.body.model,
        year: req.body.year,
        mileage: req.body.mileage,
        trim: req.body.trim || null,
        engine: req.body.engine || null,
        vin: req.body.vin || null
      }

      // Create analysis session
      const sessionId = await logAnalysisSession(vehicleData)

      // Query AI for unscheduled maintenance patterns
      console.log('Unscheduled Maintenance Route - Received vehicle data:', {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year,
        trim: vehicleData.trim,
        engine: vehicleData.engine
      })
      
      const unscheduledPatterns = await queryUnscheduledMaintenance(
        vehicleData.make,
        vehicleData.model,
        vehicleData.year,
        vehicleData.trim,
        vehicleData.engine
      )
      await logAICall(sessionId, 'unscheduled_maintenance', {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year
      }, unscheduledPatterns)

      // Format AI data for display - just return the list
      const unscheduledMaintenance = unscheduledPatterns.items.map(pattern => ({
        item: pattern.item || 'Unknown'
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

