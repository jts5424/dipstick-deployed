import express from 'express'
import { validate, vehicleDataWithUnscheduledRiskSchema } from '../../middleware/validation.js'
import { evaluateUnscheduledMaintenanceRisk } from '../../services/unscheduledMaintenanceRiskEvaluator.js'
import { logAnalysisSession, logAICall, logGeneratedTable } from '../../services/executionLogger.js'

const router = express.Router()

// POST /api/unscheduled-maintenance-risk - Evaluate risk for unscheduled maintenance items
router.post('/', 
  validate(vehicleDataWithUnscheduledRiskSchema, 'body'), // Validate vehicle data with unscheduled maintenance
  async (req, res) => {
    try {
      // req.body is already validated and sanitized by middleware
      const { make, model, year, mileage, trim, engine, vin } = req.body
      const { serviceHistory, serviceHistoryAnalysis, unscheduledMaintenance } = req.body

      // Validate service history is provided
      if (!serviceHistory || !serviceHistory.records || !Array.isArray(serviceHistory.records)) {
        return res.status(400).json({
          error: 'Service history is required',
          message: 'Please provide serviceHistory with records array'
        })
      }

      // Validate unscheduled maintenance is provided
      if (!unscheduledMaintenance || !Array.isArray(unscheduledMaintenance) || unscheduledMaintenance.length === 0) {
        return res.status(400).json({
          error: 'Unscheduled maintenance items are required',
          message: 'Please provide unscheduledMaintenance array. Generate reports first to get the unscheduled maintenance forecast.'
        })
      }

      // Create analysis session
      const sessionId = await logAnalysisSession({ make, model, year, mileage, trim, engine, vin })

      // Convert formatted unscheduled maintenance back to original format for evaluator
      const formattedUnscheduledMaintenance = unscheduledMaintenance.map(item => {
        // Parse forecast mileage range (format: "X-Y" or "X")
        let forecastMileageMin = null
        let forecastMileageMax = null
        if (item.forecast_mileage && item.forecast_mileage !== 'N/A') {
          const rangeMatch = item.forecast_mileage.match(/([\d,]+)(?:\s*-\s*([\d,]+))?/)
          if (rangeMatch) {
            forecastMileageMin = parseInt(rangeMatch[1].replace(/,/g, ''))
            forecastMileageMax = rangeMatch[2] ? parseInt(rangeMatch[2].replace(/,/g, '')) : forecastMileageMin
          }
        }

        // Parse probability (format: "X%")
        let probability = null
        if (item.probability && item.probability !== 'N/A') {
          const probMatch = item.probability.match(/(\d+)/)
          if (probMatch) {
            probability = parseInt(probMatch[1])
          }
        }

        // Parse cost ranges
        const parseCostRange = (costStr) => {
          if (!costStr || costStr === 'N/A') return { min: 0, max: 0 }
          const matches = costStr.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/)
          if (matches) {
            return {
              min: parseFloat(matches[1].replace(/,/g, '')),
              max: parseFloat(matches[2].replace(/,/g, ''))
            }
          }
          return { min: 0, max: 0 }
        }

        return {
          item: item.item,
          forecastMileageMin,
          forecastMileageMax,
          probability: probability || 50,
          description: item.description || '',
          costRange: parseCostRange(item.cost_range),
          oemCost: parseCostRange(item.oem_cost)
        }
      })

      // Perform risk evaluation
      const riskEvaluation = await evaluateUnscheduledMaintenanceRisk(
        serviceHistory,
        serviceHistoryAnalysis || null,
        formattedUnscheduledMaintenance,
        { make, model, year, mileage, trim, engine, vin }
      )
      await logAICall(sessionId, 'unscheduled_maintenance_risk', {
        make,
        model,
        year,
        itemCount: unscheduledMaintenance.length
      }, riskEvaluation)

      // Format results for display - single table with all items
      const formattedResults = {
        allItems: (riskEvaluation.allItems || []).map(item => ({
          item: item.item,
          forecast_mileage: item.forecastMileageMin && item.forecastMileageMax
            ? `${item.forecastMileageMin.toLocaleString()}-${item.forecastMileageMax.toLocaleString()}`
            : item.forecastMileageMin
            ? item.forecastMileageMin.toLocaleString()
            : 'N/A',
          probability: item.probability ? `${item.probability}%` : 'N/A',
          risk_level: item.riskLevel || 'Unknown',
          risk_score: item.riskScore !== undefined ? item.riskScore : null,
          already_fixed: item.evidence?.alreadyFixed ? 'Yes' : 'No',
          service_history_evidence: item.evidence?.serviceHistoryEvidence || 'N/A',
          related_services: item.evidence?.relatedServices?.join('; ') || 'None',
          preventative_maintenance: item.evidence?.preventativeMaintenance || 'N/A',
          mileage_risk: item.mileageRisk?.riskAssessment || 'N/A',
          miles_until_failure: item.mileageRisk?.milesUntilTypicalFailure !== undefined
            ? item.mileageRisk.milesUntilTypicalFailure >= 0
              ? `${item.mileageRisk.milesUntilTypicalFailure.toLocaleString()} miles`
              : `Past by ${Math.abs(item.mileageRisk.milesUntilTypicalFailure).toLocaleString()} miles`
            : 'N/A',
          maintenance_quality: item.maintenanceQuality?.overallMaintenance || 'N/A',
          maintenance_impact: item.maintenanceQuality?.impactOnRisk || 'N/A',
          recommendation: item.recommendation || 'N/A',
          confidence: item.confidence || 'Unknown',
          urgency: item.urgency || 'Unknown'
        })),
        summary: riskEvaluation.summary
      }

      await logGeneratedTable(sessionId, 'unscheduled_risk_evaluation', formattedResults)

      res.json({
        success: true,
        riskEvaluation: formattedResults
      })
    } catch (error) {
      console.error('Error evaluating unscheduled maintenance risk:', error)
      res.status(500).json({ 
        error: 'Failed to evaluate unscheduled maintenance risk',
        message: error.message 
      })
    }
  }
)

export default router

