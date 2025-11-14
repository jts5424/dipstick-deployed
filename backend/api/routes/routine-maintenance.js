import express from 'express'
import { validate, vehicleDataSchema } from '../../middleware/validation.js'
import { queryMaintenanceSchedule } from '../../services/aiResearchService.js'
import { logAnalysisSession, logAICall, logGeneratedTable } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/routine-maintenance - Get routine maintenance table
router.post('/', 
  validate(vehicleDataSchema, 'body'), // Validate vehicle data
  async (req, res) => {
    try {
      // req.body is already validated and sanitized by middleware
      const { make, model, year, mileage, trim, engine, vin } = req.body

      // Create analysis session
      const sessionId = await logAnalysisSession({ make, model, year, mileage, trim, engine, vin })

      // Query AI for maintenance schedule
      const maintenanceSchedule = await queryMaintenanceSchedule(
        make,
        model,
        year,
        trim || null,
        engine || null
      )
      await logAICall(sessionId, 'maintenance_schedule', {
        make,
        model,
        year
      }, maintenanceSchedule)

      // Format AI data for display
      const routineMaintenance = (!maintenanceSchedule || !maintenanceSchedule.items) 
        ? []
        : maintenanceSchedule.items.map(scheduleItem => ({
            item: scheduleItem.item,
            interval_miles: scheduleItem.intervalMiles ? scheduleItem.intervalMiles.toLocaleString() : 'N/A',
            interval_months: scheduleItem.intervalMonths ? scheduleItem.intervalMonths.toString() : 'N/A',
            cost_range: `$${scheduleItem.costRange.min}-$${scheduleItem.costRange.max}`,
            oem_cost: `$${scheduleItem.oemCost.min}-$${scheduleItem.oemCost.max}`,
            description: scheduleItem.description || '',
            risk_note: scheduleItem.riskNote || ''
          }))
      
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

