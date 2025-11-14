import { parseServiceHistory } from './pdfParser.js'
import { queryMaintenanceSchedule, queryUnscheduledMaintenance } from './aiResearchService.js'
import { compareSchedule } from './scheduleComparator.js'
import { generateReports } from './reportGenerator.js'
import { logAnalysisSession, logServiceHistory, logAICall, logGeneratedTable, logGeneratedReport } from './executionLogger.js'

export async function analyzeVehicleData(vehicleData, pdfFile) {
  // Create analysis session
  const sessionId = await logAnalysisSession(vehicleData)

  // Step 1: Parse PDF service history (always do this first)
  let serviceHistory
  try {
    serviceHistory = await parseServiceHistory(pdfFile.path)
    await logServiceHistory(sessionId, serviceHistory)
  } catch (error) {
    console.error('Error parsing PDF:', error)
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }

  // Return service history immediately - skip analysis for now
  return {
    sessionId,
    serviceHistory: {
      records: serviceHistory.records || [],
      metadata: serviceHistory.metadata || {},
      rawText: serviceHistory.rawText
    },
    routineMaintenance: [],
    unscheduledMaintenance: [],
    overallCondition: null
  }

  // TODO: Re-enable analysis when ready
  /*
  try {
    // Step 2: Query AI for maintenance schedules
    const maintenanceSchedule = await queryMaintenanceSchedule(
      vehicleData.make,
      vehicleData.model,
      vehicleData.year
    )
    await logAICall(sessionId, 'maintenance_schedule', {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year
    }, maintenanceSchedule)

    // Step 3: Query AI for unscheduled maintenance patterns
    const unscheduledPatterns = await queryUnscheduledMaintenance(
      vehicleData.make,
      vehicleData.model,
      vehicleData.year
    )
    await logAICall(sessionId, 'unscheduled_maintenance', {
      make: vehicleData.make,
      model: vehicleData.model,
      year: vehicleData.year
    }, unscheduledPatterns)

    // Step 4: Compare service history with schedule
    const routineMaintenance = await compareSchedule(
      serviceHistory,
      maintenanceSchedule,
      vehicleData.mileage
    )
    await logGeneratedTable(sessionId, 'routine', routineMaintenance)

    // Step 5: Generate forecast
    const unscheduledMaintenance = await generateForecast(
      serviceHistory,
      unscheduledPatterns,
      vehicleData.mileage,
      vehicleData.year
    )
    await logGeneratedTable(sessionId, 'unscheduled', unscheduledMaintenance)

    // Step 6: Generate overall condition report
    const overallCondition = await generateReports(
      routineMaintenance,
      unscheduledMaintenance,
      vehicleData.mileage
    )
    await logGeneratedReport(sessionId, 'overall', overallCondition)

    return {
      sessionId,
      serviceHistory: {
        records: serviceHistory.records,
        metadata: serviceHistory.metadata || {},
        rawText: serviceHistory.rawText
      },
      routineMaintenance,
      unscheduledMaintenance,
      overallCondition
    }
  } catch (error) {
    console.error('Error in vehicle analysis:', error)
    // Still return service history even if analysis fails
    return {
      sessionId,
      serviceHistory: {
        records: serviceHistory.records || [],
        metadata: serviceHistory.metadata || {},
        rawText: serviceHistory.rawText
      },
      routineMaintenance: [],
      unscheduledMaintenance: [],
      overallCondition: null,
      analysisError: error.message
    }
  }
  */
}

