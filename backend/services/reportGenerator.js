export async function generateReports(routineMaintenance, unscheduledMaintenance, currentMileage) {
  // Categorize items
  const immediatelyDue = []
  const next10kMiles = []
  const threeToFiveYear = []
  
  // Process routine maintenance
  for (const item of routineMaintenance) {
    if (item.status && item.status.includes('Overdue')) {
      immediatelyDue.push({
        type: 'routine',
        item: item.item,
        cost: item.cost_range,
        status: item.status
      })
    } else if (item.next_due_mileage && item.next_due_mileage - currentMileage < 10000) {
      next10kMiles.push({
        type: 'routine',
        item: item.item,
        cost: item.cost_range,
        status: item.status
      })
    }
  }
  
  // Process unscheduled maintenance
  for (const item of unscheduledMaintenance) {
    const forecastMileage = parseInt(item.forecast_mileage.replace(/,/g, ''))
    const milesUntilForecast = forecastMileage - currentMileage
    
    if (item.likelihood === 'High' || milesUntilForecast < 0) {
      immediatelyDue.push({
        type: 'unscheduled',
        item: item.item,
        cost: item.cost_range,
        likelihood: item.likelihood
      })
    } else if (milesUntilForecast < 10000) {
      next10kMiles.push({
        type: 'unscheduled',
        item: item.item,
        cost: item.cost_range,
        likelihood: item.likelihood
      })
    } else if (milesUntilForecast < 50000) {
      threeToFiveYear.push({
        type: 'unscheduled',
        item: item.item,
        cost: item.cost_range,
        likelihood: item.likelihood
      })
    }
  }
  
  // Calculate costs
  const calculateTotalCost = (items) => {
    let totalMin = 0
    let totalMax = 0
    
    for (const item of items) {
      const costMatch = item.cost.match(/\$(\d+)-?\$?(\d+)?/)
      if (costMatch) {
        totalMin += parseInt(costMatch[1])
        totalMax += parseInt(costMatch[2] || costMatch[1])
      }
    }
    
    return { min: totalMin, max: totalMax }
  }
  
  const immediatelyDueCost = calculateTotalCost(immediatelyDue)
  const next10kCost = calculateTotalCost(next10kMiles)
  const threeToFiveYearCost = calculateTotalCost(threeToFiveYear)
  const totalCost = {
    min: immediatelyDueCost.min + next10kCost.min + threeToFiveYearCost.min,
    max: immediatelyDueCost.max + next10kCost.max + threeToFiveYearCost.max
  }
  
  // Generate narrative
  const narrative = generateNarrative(
    immediatelyDue,
    next10kMiles,
    threeToFiveYear,
    immediatelyDueCost,
    next10kCost,
    threeToFiveYearCost,
    totalCost
  )
  
  return {
    immediatelyDue: {
      items: immediatelyDue,
      count: immediatelyDue.length,
      costRange: `$${immediatelyDueCost.min.toLocaleString()} - $${immediatelyDueCost.max.toLocaleString()}`
    },
    next10kMiles: {
      items: next10kMiles,
      count: next10kMiles.length,
      costRange: `$${next10kCost.min.toLocaleString()} - $${next10kCost.max.toLocaleString()}`
    },
    threeToFiveYear: {
      items: threeToFiveYear,
      count: threeToFiveYear.length,
      costRange: `$${threeToFiveYearCost.min.toLocaleString()} - $${threeToFiveYearCost.max.toLocaleString()}`
    },
    totalCost: `$${totalCost.min.toLocaleString()} - $${totalCost.max.toLocaleString()}`,
    narrative: narrative
  }
}

function generateNarrative(immediatelyDue, next10kMiles, threeToFiveYear, immediatelyDueCost, next10kCost, threeToFiveYearCost, totalCost) {
  let narrative = `Overall Vehicle Condition Summary:\n\n`
  
  narrative += `IMMEDIATELY DUE OR LIKELY TO OCCUR:\n`
  narrative += `There are ${immediatelyDue.length} items that require immediate attention or are likely to fail soon. `
  narrative += `The estimated cost range for these items is ${immediatelyDueCost.min.toLocaleString()} - $${immediatelyDueCost.max.toLocaleString()}. `
  if (immediatelyDue.length > 0) {
    narrative += `These include: ${immediatelyDue.map(i => i.item).join(', ')}.\n\n`
  } else {
    narrative += `\n\n`
  }
  
  narrative += `WITHIN NEXT 10,000 MILES:\n`
  narrative += `There are ${next10kMiles.length} items that will likely need attention within the next 10,000 miles. `
  narrative += `The estimated cost range for these items is $${next10kCost.min.toLocaleString()} - $${next10kCost.max.toLocaleString()}. `
  if (next10kMiles.length > 0) {
    narrative += `These include: ${next10kMiles.map(i => i.item).join(', ')}.\n\n`
  } else {
    narrative += `\n\n`
  }
  
  narrative += `3-5 YEAR FORECAST:\n`
  narrative += `There are ${threeToFiveYear.length} items that may need attention over the next 3-5 years. `
  narrative += `The estimated cost range for these items is $${threeToFiveYearCost.min.toLocaleString()} - $${threeToFiveYearCost.max.toLocaleString()}.\n\n`
  
  narrative += `TOTAL UPCOMING COST:\n`
  narrative += `The total estimated cost for all upcoming maintenance is $${totalCost.min.toLocaleString()} - $${totalCost.max.toLocaleString()}.`
  
  return narrative
}

