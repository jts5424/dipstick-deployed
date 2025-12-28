import express from 'express'
import { validate, vehicleDataWithRoutineMaintenanceSchema } from '../../middleware/validation.js'
import { analyzeMaintenanceGaps } from '../../services/maintenanceGapAnalyzer.js'
import { logAnalysisSession, logAICall, logGeneratedTable } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/maintenance-gap-analysis - Compare service history to maintenance schedule
router.post('/', 
  validate(vehicleDataWithRoutineMaintenanceSchema, 'body'), // Validate vehicle data with routine maintenance
  async (req, res) => {
    try {
      // req.body is already validated and sanitized by middleware
      const { make, model, year, mileage, trim, engine, vin } = req.body
      const { serviceHistory, routineMaintenance } = req.body

      // Validate service history is provided
      if (!serviceHistory || !serviceHistory.records || !Array.isArray(serviceHistory.records)) {
        return res.status(400).json({
          error: 'Service history is required',
          message: 'Please provide serviceHistory with records array'
        })
      }

      // Validate routine maintenance is provided
      if (!routineMaintenance || !Array.isArray(routineMaintenance) || routineMaintenance.length === 0) {
        return res.status(400).json({
          error: 'Routine maintenance schedule is required',
          message: 'Please provide routineMaintenance array. Generate reports first to get the maintenance schedule.'
        })
      }

      // Create analysis session
      const sessionId = await logAnalysisSession({ make, model, year, mileage, trim, engine, vin })

      // Convert formatted routine maintenance back to schedule format for gap analyzer
      // The frontend sends formatted data, but the analyzer needs the original schedule format
      const parseCostRange = (costStr) => {
        if (!costStr || costStr === 'N/A') return { min: 0, max: 0 }
        // Format: "$50-$100" or "$50-$100"
        const matches = costStr.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/)
        if (matches) {
          return {
            min: parseFloat(matches[1].replace(/,/g, '')),
            max: parseFloat(matches[2].replace(/,/g, ''))
          }
        }
        return { min: 0, max: 0 }
      }

      const maintenanceSchedule = {
        make,
        model,
        year,
        items: routineMaintenance.map(item => ({
          item: item.item,
          intervalMiles: item.interval_miles && item.interval_miles !== 'N/A' 
            ? parseInt(item.interval_miles.replace(/,/g, '')) 
            : null,
          intervalMonths: item.interval_months && item.interval_months !== 'N/A' 
            ? parseInt(item.interval_months) 
            : null,
          description: item.description || '',
          riskNote: item.risk_note || '',
          costRange: parseCostRange(item.cost_range),
          oemCost: parseCostRange(item.oem_cost)
        }))
      }

      // Perform gap analysis
      const gapAnalysis = await analyzeMaintenanceGaps(
        serviceHistory,
        maintenanceSchedule,
        { make, model, year, mileage, trim, engine, vin }
      )
      await logAICall(sessionId, 'maintenance_gap_analysis', {
        make,
        model,
        year,
        recordCount: serviceHistory.records.length
      }, gapAnalysis)

      // Format results for display - single table with all items
      const formattedResults = {
        allItems: (gapAnalysis.allItems || []).map(item => {
          // Format status-specific fields
          let statusInfo = 'N/A'
          if (item.status === 'Overdue') {
            statusInfo = item.overdueByMiles !== undefined && item.overdueByMiles !== null
              ? `Overdue by ${item.overdueByMiles.toLocaleString()} miles${item.overdueByMonths ? ` / ${item.overdueByMonths} months` : ''}`
              : 'Overdue'
          } else if (item.status === 'Due Now') {
            statusInfo = item.dueInMiles !== undefined && item.dueInMiles !== null
              ? `Due now (${item.dueInMiles >= 0 ? item.dueInMiles.toLocaleString() : 'Overdue'} miles${item.dueInMonths !== undefined && item.dueInMonths !== null ? ` / ${item.dueInMonths >= 0 ? item.dueInMonths : 'Overdue'} months` : ''})`
              : 'Due now'
          } else if (item.status === 'Near Future') {
            statusInfo = item.dueInMiles !== undefined && item.dueInMiles !== null
              ? `Due in ${item.dueInMiles.toLocaleString()} miles${item.dueInMonths !== undefined && item.dueInMonths !== null ? ` / ${item.dueInMonths} months` : ''}`
              : 'Near future'
          } else {
            statusInfo = item.dueInMiles !== undefined && item.dueInMiles !== null
              ? `Due in ${item.dueInMiles.toLocaleString()} miles${item.dueInMonths !== undefined && item.dueInMonths !== null ? ` / ${item.dueInMonths} months` : ''}`
              : 'Not due'
          }

          return {
            item: item.item,
            status: item.status || 'Not Due',
            status_info: statusInfo,
            last_performed: item.lastPerformedMileage 
              ? `${item.lastPerformedMileage.toLocaleString()} miles${item.lastPerformedDate ? ` (${item.lastPerformedDate})` : ''}`
              : 'Never',
            interval: `${item.recommendedIntervalMiles ? item.recommendedIntervalMiles.toLocaleString() : 'N/A'} miles / ${item.recommendedIntervalMonths || 'N/A'} months`,
            next_due: item.nextDueMileage ? `${item.nextDueMileage.toLocaleString()} miles${item.nextDueDate ? ` (${item.nextDueDate})` : ''}` : 'N/A',
            severity: item.severity || 'Medium',
            risk_note: item.riskNote || '',
            cost_range: item.costRange ? `$${item.costRange.min}-$${item.costRange.max}` : 'N/A',
            oem_cost: item.oemCost ? `$${item.oemCost.min}-$${item.oemCost.max}` : 'N/A',
            should_complete_before_purchase: item.shouldCompleteBeforePurchase ? 'Yes' : 'No'
          }
        }),
        summary: gapAnalysis.summary
      }

      await logGeneratedTable(sessionId, 'gap_analysis', formattedResults)

      res.json({
        success: true,
        gapAnalysis: formattedResults
      })
    } catch (error) {
      console.error('Error performing maintenance gap analysis:', error)
      res.status(500).json({ 
        error: 'Failed to perform maintenance gap analysis',
        message: error.message 
      })
    }
  }
)

export default router

