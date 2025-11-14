export async function compareSchedule(serviceHistory, maintenanceSchedule, currentMileage) {
  // Just pass through the AI data directly - NO service history comparisons
  if (!maintenanceSchedule || !maintenanceSchedule.items) {
    return []
  }
  
  return maintenanceSchedule.items.map(scheduleItem => ({
    item: scheduleItem.item,
    interval_miles: scheduleItem.intervalMiles ? scheduleItem.intervalMiles.toLocaleString() : 'N/A',
    interval_months: scheduleItem.intervalMonths ? scheduleItem.intervalMonths.toString() : 'N/A',
    cost_range: `$${scheduleItem.costRange.min}-$${scheduleItem.costRange.max}`,
    oem_cost: `$${scheduleItem.oemCost.min}-$${scheduleItem.oemCost.max}`,
    description: scheduleItem.description || '',
    risk_note: scheduleItem.riskNote || ''
  }))
}

