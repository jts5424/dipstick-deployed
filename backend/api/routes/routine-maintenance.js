import express from 'express'
import { validate, vehicleDataSchema } from '../../middleware/validation.js'
import { queryMaintenanceSchedule } from '../../services/aiResearchService.js'
import { compareSchedule } from '../../services/scheduleComparator.js'
import { logAnalysisSession, logAICall, logGeneratedTable } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/routine-maintenance - Get routine maintenance table
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

      // Query AI for maintenance schedule
      const maintenanceSchedule = await queryMaintenanceSchedule(
        vehicleData.make,
        vehicleData.model,
        vehicleData.year,
        vehicleData.trim,
        vehicleData.engine
      )
      await logAICall(sessionId, 'maintenance_schedule', {
        make: vehicleData.make,
        model: vehicleData.model,
        year: vehicleData.year
      }, maintenanceSchedule)

      // Pass through AI data - NO service history comparisons
      const routineMaintenance = await compareSchedule(
        null, // Not used
        maintenanceSchedule,
        null // Not used
      )
      await logGeneratedTable(sessionId, 'routine', routineMaintenance)

      res.json({
        success: true,
        routineMaintenance
      })
    } catch (error) {
      console.error('Error generating routine maintenance:', error)
      res.status(500).json({ 
        error: 'Failed to generate routine maintenance table',
        message: error.message 
      })
    }
  }
)

export default router

