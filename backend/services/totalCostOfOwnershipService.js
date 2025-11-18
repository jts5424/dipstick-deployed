/**
 * Total Cost of Ownership Service
 * Calculates comprehensive ownership costs including:
 * - Immediate Cost Burden (ICB)
 * - Expected Unscheduled Repair Cost (EURC)
 * - 12-Month Cost Projection (C12)
 * - Condition Score (CS)
 * - Long-term TCO with depreciation
 */

/**
 * Calculate Immediate Cost Burden (ICB)
 * Sum of immediate routine maintenance costs + critical overdue service costs
 */
export function calculateICB(gapAnalysis) {
  if (!gapAnalysis || !gapAnalysis.allItems) {
    return { total: 0, items: [], breakdown: {} }
  }

  let total = 0
  const items = []
  const breakdown = {
    overdue: 0,
    dueNow: 0,
    critical: 0
  }

  for (const item of gapAnalysis.allItems) {
    const status = item.status || ''
    const isOverdue = status.includes('Overdue') || status.includes('Past Due')
    const isDueNow = status.includes('Due Now') || status === 'Due Now'
    const isCritical = item.severity === 'Critical' || item.risk_note?.toLowerCase().includes('critical')

    if (isOverdue || isDueNow || isCritical) {
      // Extract cost - try different possible fields
      let cost = 0
      if (item.cost_range) {
        // Handle format like "$50-$100" or "50-100"
        const rangeStr = item.cost_range.toString().replace(/\$/g, '').trim()
        const parts = rangeStr.split('-').map(s => parseFloat(s.replace(/[^0-9.]/g, '')) || 0)
        if (parts.length === 2) {
          cost = (parts[0] + parts[1]) / 2
        } else if (parts.length === 1) {
          cost = parts[0]
        }
      } else if (item.costRange) {
        // Handle object format { min: 50, max: 100 }
        if (item.costRange.min !== undefined && item.costRange.max !== undefined) {
          cost = (parseFloat(item.costRange.min) + parseFloat(item.costRange.max)) / 2
        }
      } else if (item.cost_min && item.cost_max) {
        cost = (parseFloat(item.cost_min) + parseFloat(item.cost_max)) / 2
      } else if (item.cost) {
        cost = parseFloat(item.cost) || 0
      } else if (item.oem_cost) {
        // Handle format like "$100-$200"
        const oemStr = item.oem_cost.toString().replace(/\$/g, '').trim()
        const oemParts = oemStr.split('-').map(s => parseFloat(s.replace(/[^0-9.]/g, '')) || 0)
        if (oemParts.length === 2) {
          cost = (oemParts[0] + oemParts[1]) / 2
        } else if (oemParts.length === 1) {
          cost = oemParts[0]
        }
      } else if (item.oemCost) {
        // Handle object format
        if (item.oemCost.min !== undefined && item.oemCost.max !== undefined) {
          cost = (parseFloat(item.oemCost.min) + parseFloat(item.oemCost.max)) / 2
        }
      }

      if (cost > 0) {
        total += cost
        items.push({
          item: item.item || item.maintenance_item,
          cost,
          status,
          severity: item.severity,
          riskNote: item.risk_note
        })

        if (isOverdue) breakdown.overdue += cost
        if (isDueNow) breakdown.dueNow += cost
        if (isCritical) breakdown.critical += cost
      }
    }
  }

  return { total, items, breakdown }
}

/**
 * Calculate Expected Unscheduled Repair Cost (EURC)
 * Probability-weighted expected costs from unscheduled maintenance risk evaluation
 */
export function calculateEURC(riskEvaluation, timePeriodMonths = 12, milesPerYear = 12000) {
  if (!riskEvaluation || !riskEvaluation.allItems) {
    return { total: 0, items: [], breakdown: {} }
  }

  let total = 0
  const items = []
  const breakdown = {
    highRisk: 0,
    mediumRisk: 0,
    lowRisk: 0
  }

  const totalMiles = (timePeriodMonths / 12) * milesPerYear

  for (const item of riskEvaluation.allItems) {
    // Check if item is likely to occur within the time period
    // Handle both forecastMileage (single value) and forecastMileageMin/Max (range)
    let forecastMileage = 0
    if (item.forecast_mileage) {
      forecastMileage = parseFloat(item.forecast_mileage) || 0
    } else if (item.forecastMileageMin || item.forecastMileageMax) {
      // Use the minimum (earlier) forecast mileage for conservative estimate
      forecastMileage = parseFloat(item.forecastMileageMin) || parseFloat(item.forecastMileageMax) || 0
    } else if (item.mileageRisk?.milesUntilTypicalFailure !== undefined) {
      // Calculate from milesUntilTypicalFailure
      const milesUntil = parseFloat(item.mileageRisk.milesUntilTypicalFailure) || 0
      forecastMileage = milesUntil > 0 ? milesUntil : 0
    }
    
    const riskLevel = item.risk_level || item.riskLevel || ''
    // Handle probability as string ("50%") or number
    let probability = 0
    if (item.probability) {
      if (typeof item.probability === 'string') {
        probability = parseFloat(item.probability.replace('%', '').trim()) || 0
      } else {
        probability = parseFloat(item.probability) || 0
      }
    }
    const riskScore = parseFloat(item.risk_score || item.riskScore) || 0

    // Skip items that are already fixed/replaced
    if (item.riskLevel === 'Already Fixed/Replaced' || item.evidence?.alreadyFixed === true) {
      continue
    }

    // Only include items that could occur within the time period
    // If forecastMileage is 0 or not available, use riskScore to determine inclusion
    const shouldInclude = (forecastMileage > 0 && forecastMileage <= totalMiles) || 
                          (forecastMileage === 0 && riskScore >= 70)
    
    if (!shouldInclude) {
      // Skip items that won't occur in the time period
      continue
    }

    // Extract cost
      let cost = 0
      if (item.typical_cost) {
        // Handle formatted strings like "$500" or "$500-$1000"
        const costStr = item.typical_cost.toString().replace(/\$/g, '').trim()
        const costParts = costStr.split('-').map(s => parseFloat(s.replace(/[^0-9.]/g, '')) || 0)
        if (costParts.length === 2) {
          cost = (costParts[0] + costParts[1]) / 2
        } else if (costParts.length === 1) {
          cost = costParts[0]
        }
      } else if (item.cost_range) {
        // Handle format like "$50-$100" or "50-100"
        const rangeStr = item.cost_range.toString().replace(/\$/g, '').trim()
        const parts = rangeStr.split('-').map(s => parseFloat(s.replace(/[^0-9.]/g, '')) || 0)
        if (parts.length === 2) {
          cost = (parts[0] + parts[1]) / 2
        } else if (parts.length === 1) {
          cost = parts[0]
        }
      } else if (item.costRange) {
        // Handle object format { min: 50, max: 100 }
        if (item.costRange.min !== undefined && item.costRange.max !== undefined) {
          cost = (parseFloat(item.costRange.min) + parseFloat(item.costRange.max)) / 2
        }
      } else if (item.cost) {
        cost = parseFloat(item.cost) || 0
      }

      // Calculate expected cost = probability * cost
      const expectedCost = (probability / 100) * cost

      if (expectedCost > 0) {
        total += expectedCost
        items.push({
          item: item.item || item.failure_component,
          cost,
          probability,
          expectedCost,
          riskLevel,
          forecastMileage
        })

        if (riskScore >= 70 || riskLevel.includes('High') || riskLevel.includes('Critical')) {
          breakdown.highRisk += expectedCost
        } else if (riskScore >= 50) {
          breakdown.mediumRisk += expectedCost
        } else {
          breakdown.lowRisk += expectedCost
        }
      }
  }

  return { total, items, breakdown }
}

/**
 * Calculate Condition Score (0-100)
 * Based on service history analysis
 */
export function calculateConditionScore(serviceHistoryAnalysis, gapAnalysis) {
  if (!serviceHistoryAnalysis) {
    return { score: 0, factors: [] }
  }

  let score = 100
  const factors = []

  // Service completeness (from gap analysis)
  if (gapAnalysis && gapAnalysis.allItems) {
    const totalItems = gapAnalysis.allItems.length
    const overdueItems = gapAnalysis.allItems.filter(item => 
      (item.status || '').includes('Overdue') || (item.status || '').includes('Past Due')
    ).length
    const dueNowItems = gapAnalysis.allItems.filter(item => 
      (item.status || '').includes('Due Now')
    ).length

    const completenessScore = ((totalItems - overdueItems - dueNowItems) / totalItems) * 100
    const penalty = (overdueItems * 5) + (dueNowItems * 2) // Penalty points
    score -= penalty
    factors.push({
      factor: 'Service Completeness',
      impact: -penalty,
      details: `${overdueItems} overdue, ${dueNowItems} due now out of ${totalItems} items`
    })
  }

  // Red flags from service history analysis
  const evaluation = serviceHistoryAnalysis.evaluation || ''
  const analysis = serviceHistoryAnalysis.analysis || {}
  
  // Check for red flags
  const redFlagKeywords = ['suspicious', 'phishy', 'abnormal', 'concerning', 'warning', 'red flag', 'inconsistent']
  const redFlagCount = redFlagKeywords.filter(keyword => 
    evaluation.toLowerCase().includes(keyword)
  ).length

  if (redFlagCount > 0) {
    const penalty = redFlagCount * 10
    score -= penalty
    factors.push({
      factor: 'Red Flags in Service History',
      impact: -penalty,
      details: `Found ${redFlagCount} concerning patterns`
    })
  }

  // Check for positive indicators
  const positiveKeywords = ['well-maintained', 'excellent', 'proper', 'regular', 'consistent', 'good']
  const positiveCount = positiveKeywords.filter(keyword => 
    evaluation.toLowerCase().includes(keyword)
  ).length

  if (positiveCount > 0) {
    const bonus = Math.min(positiveCount * 3, 15) // Max 15 point bonus
    score += bonus
    factors.push({
      factor: 'Positive Maintenance Indicators',
      impact: bonus,
      details: `Found ${positiveCount} positive maintenance patterns`
    })
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)))

  return { score, factors }
}

/**
 * Calculate projected routine maintenance costs over time period
 */
export function calculateProjectedRoutineCosts(routineMaintenance, timePeriodMonths, milesPerYear, currentMileage) {
  if (!routineMaintenance || !Array.isArray(routineMaintenance)) {
    return { total: 0, items: [] }
  }

  let total = 0
  const items = []
  const totalMiles = (timePeriodMonths / 12) * milesPerYear
  const endMileage = currentMileage + totalMiles

  for (const item of routineMaintenance) {
    // Parse interval_miles - handle formatted strings like "5,000" or "N/A"
    let intervalMiles = 0
    if (item.interval_miles && item.interval_miles !== 'N/A') {
      const milesStr = item.interval_miles.toString().replace(/,/g, '').trim()
      intervalMiles = parseFloat(milesStr) || 0
    }
    // Also check for intervalMiles (camelCase) from raw API data
    if (intervalMiles === 0 && item.intervalMiles) {
      intervalMiles = parseFloat(item.intervalMiles) || 0
    }

    // Parse interval_months - handle formatted strings like "6" or "N/A"
    let intervalMonths = 0
    if (item.interval_months && item.interval_months !== 'N/A') {
      const monthsStr = item.interval_months.toString().replace(/,/g, '').trim()
      intervalMonths = parseFloat(monthsStr) || 0
    }
    // Also check for intervalMonths (camelCase) from raw API data
    if (intervalMonths === 0 && item.intervalMonths) {
      intervalMonths = parseFloat(item.intervalMonths) || 0
    }

    if (intervalMiles === 0 && intervalMonths === 0) continue

    // Calculate how many times this service will be needed
    // Use whichever interval requires more frequent service
    let occurrencesByMiles = 0
    let occurrencesByMonths = 0

    if (intervalMiles > 0) {
      const milesToDrive = totalMiles
      occurrencesByMiles = Math.ceil(milesToDrive / intervalMiles)
    }

    if (intervalMonths > 0) {
      occurrencesByMonths = Math.ceil(timePeriodMonths / intervalMonths)
    }

    // Take the maximum - service needs to happen whichever comes first
    const occurrences = Math.max(occurrencesByMiles, occurrencesByMonths)

    if (occurrences > 0) {
      // Get cost - handle formatted strings like "$50-$100"
      let cost = 0
      if (item.cost_range) {
        // Handle format like "$50-$100" or "50-100"
        const rangeStr = item.cost_range.toString().replace(/\$/g, '').trim()
        const parts = rangeStr.split('-').map(s => parseFloat(s.replace(/[^0-9.]/g, '')) || 0)
        if (parts.length === 2) {
          cost = (parts[0] + parts[1]) / 2
        } else if (parts.length === 1) {
          cost = parts[0]
        }
      } else if (item.cost_min && item.cost_max) {
        cost = (parseFloat(item.cost_min) + parseFloat(item.cost_max)) / 2
      } else if (item.costRange) {
        // Handle object format { min: 50, max: 100 }
        if (item.costRange.min !== undefined && item.costRange.max !== undefined) {
          cost = (parseFloat(item.costRange.min) + parseFloat(item.costRange.max)) / 2
        }
      } else if (item.cost) {
        cost = parseFloat(item.cost) || 0
      }

      if (cost > 0) {
        const itemTotal = cost * occurrences
        total += itemTotal

        items.push({
          item: item.item || item.maintenance_item,
          cost,
          occurrences,
          total: itemTotal,
          interval: intervalMiles > 0 && intervalMonths > 0 
            ? `${intervalMiles.toLocaleString()} miles / ${intervalMonths} months`
            : intervalMiles > 0 
              ? `${intervalMiles.toLocaleString()} miles`
              : `${intervalMonths} months`
        })
      }
    }
  }

  return { total, items }
}

/**
 * Main TCO calculation function
 */
export function calculateTotalCostOfOwnership({
  gapAnalysis,
  riskEvaluation,
  serviceHistoryAnalysis,
  routineMaintenance,
  marketValuation,
  purchasePrice,
  timePeriodYears,
  milesPerYear,
  currentMileage
}) {
  const timePeriodMonths = timePeriodYears * 12

  // 1. Calculate ICB (Immediate Cost Burden)
  const icb = calculateICB(gapAnalysis)

  // 2. Calculate EURC (Expected Unscheduled Repair Cost) for the time period
  const eurc = calculateEURC(riskEvaluation, timePeriodMonths, milesPerYear)

  // 3. Calculate C12 (12-Month Cost Projection)
  const c12 = {
    total: icb.total + eurc.total,
    icb: icb.total,
    eurc: eurc.total
  }

  // 4. Calculate Condition Score
  const conditionScore = calculateConditionScore(serviceHistoryAnalysis, gapAnalysis)

  // 5. Calculate projected routine maintenance costs
  const projectedRoutine = calculateProjectedRoutineCosts(
    routineMaintenance,
    timePeriodMonths,
    milesPerYear,
    currentMileage
  )

  // 6. Calculate current market value from market valuation
  // Prefer private party value, fall back to retail value, then try min/max
  // Ensure values are parsed as numbers (handle string values from JSON)
  const parseValue = (val) => {
    if (val === null || val === undefined) return 0
    if (typeof val === 'string') {
      // Remove currency symbols and commas, but keep decimal points
      const cleaned = val.replace(/[^0-9.-]/g, '')
      return parseFloat(cleaned) || 0
    }
    return parseFloat(val) || 0
  }
  
  const currentValue = parseValue(marketValuation?.currentValuation?.privateParty?.average) || 
                      parseValue(marketValuation?.currentValuation?.retail?.average) || 
                      parseValue(marketValuation?.currentValuation?.privateParty?.max) ||
                      parseValue(marketValuation?.currentValuation?.retail?.max) ||
                      parseValue(marketValuation?.currentValuation?.privateParty?.min) ||
                      parseValue(marketValuation?.currentValuation?.retail?.min) ||
                      0

  // 7. Calculate depreciation
  let depreciation = 0
  let expectedSalePrice = 0
  let depreciationData = null

  if (marketValuation && marketValuation.depreciation && currentValue > 0) {
    const dep = marketValuation.depreciation

    // Get projected value based on time period
    if (timePeriodYears === 1 && dep.projectedValues?.oneYear) {
      expectedSalePrice = dep.projectedValues.oneYear.privateParty || dep.projectedValues.oneYear.retail || 0
    } else if (timePeriodYears === 2 && dep.projectedValues?.twoYears) {
      expectedSalePrice = dep.projectedValues.twoYears.privateParty || dep.projectedValues.twoYears.retail || 0
    } else if (timePeriodYears === 3 && dep.projectedValues?.threeYears) {
      expectedSalePrice = dep.projectedValues.threeYears.privateParty || dep.projectedValues.threeYears.retail || 0
    } else if (timePeriodYears === 5 && dep.projectedValues?.fiveYears) {
      expectedSalePrice = dep.projectedValues.fiveYears.privateParty || dep.projectedValues.fiveYears.retail || 0
    } else {
      // Estimate based on annual depreciation rate
      const annualRate = dep.annualDepreciationRate || 0
      expectedSalePrice = currentValue * Math.pow(1 - annualRate / 100, timePeriodYears)
    }

    depreciation = currentValue - expectedSalePrice
    depreciationData = {
      currentValue,
      expectedSalePrice,
      depreciation,
      annualRate: dep.annualDepreciationRate
    }
  }

  // 8. Calculate total costs over time period
  const totalCosts = {
    immediateCostBurden: icb.total,
    projectedRoutineMaintenance: projectedRoutine.total,
    expectedUnscheduledRepairs: eurc.total,
    depreciation: depreciation,
    total: icb.total + projectedRoutine.total + eurc.total + depreciation
  }

  // 9. Calculate current value vs purchase price + ICB
  let currentValueMinusPurchaseAndICB = null
  if (purchasePrice && currentValue > 0) {
    currentValueMinusPurchaseAndICB = currentValue - (purchasePrice + icb.total)
  }

  // 10. Calculate total loss if purchase price is provided
  let totalLoss = null
  if (purchasePrice) {
    const totalSpent = purchasePrice + totalCosts.total
    totalLoss = totalSpent - expectedSalePrice
  }

  // 11. Calculate adjusted value
  const adjustedValue = (purchasePrice || 0) + c12.total

  return {
    immediateCostBurden: icb,
    expectedUnscheduledRepairCost: eurc,
    c12Projection: c12,
    conditionScore,
    projectedRoutineMaintenance: projectedRoutine,
    depreciation: depreciationData,
    totalCosts,
    currentValueMinusPurchaseAndICB,
    totalLoss,
    adjustedValue,
    summary: {
      purchasePrice: purchasePrice || 0,
      currentValue,
      timePeriodYears,
      milesPerYear,
      totalCosts: totalCosts.total,
      expectedSalePrice,
      currentValueMinusPurchaseAndICB: currentValueMinusPurchaseAndICB || 0,
      totalLoss: totalLoss || 0,
      conditionScore: conditionScore.score,
      adjustedValue
    }
  }
}

