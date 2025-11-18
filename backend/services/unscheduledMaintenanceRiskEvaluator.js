import OpenAI from 'openai'

// Lazy initialization of OpenAI client
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
}

/**
 * Evaluate risk for a single unscheduled maintenance item
 * This focused approach improves accuracy by analyzing one item at a time
 */
async function evaluateSingleUnscheduledItem(
  openai,
  unscheduledItem,
  serviceHistory,
  serviceHistoryAnalysis,
  vehicleData,
  vehicleSpec,
  currentMileage,
  currentDate
) {
  const prompt = `You are an expert automotive mechanic performing a risk evaluation for ONE specific unscheduled maintenance item on a ${vehicleSpec} vehicle.

UNSCHEDULED MAINTENANCE ITEM TO EVALUATE:
${JSON.stringify(unscheduledItem, null, 2)}

Vehicle Information:
- Vehicle: ${vehicleSpec}
- Current Mileage: ${currentMileage.toLocaleString()} miles
- Current Date: ${currentDate}
- Service History Records: ${serviceHistory.records.length} total records
- Date Range: ${serviceHistory.metadata?.dateRange?.earliest || 'Unknown'} to ${serviceHistory.metadata?.dateRange?.latest || 'Unknown'}
- Mileage Range: ${serviceHistory.metadata?.mileageRange?.lowest || 'Unknown'} to ${serviceHistory.metadata?.mileageRange?.highest || 'Unknown'} miles

Service History Analysis Summary:
${serviceHistoryAnalysis ? JSON.stringify(serviceHistoryAnalysis, null, 2) : 'No analysis available'}

ALL Service History Records (check EVERY record carefully):
${JSON.stringify(serviceHistory.records, null, 2)}

CRITICAL EVALUATION TASKS:

1. **Service History Evidence:**
   - Has this specific component already been fixed, replaced, or repaired? (Check ALL service history records)
   - Look for related services (e.g., if item is "Transmission Failure", check for transmission fluid changes, transmission repairs, transmission service, etc.)
   - Match intelligently using serviceType and description fields
   - Has preventative maintenance been done that would reduce risk for THIS specific component?
   - Find the most recent related service if any exists

2. **Mileage-Based Risk:**
   - Forecast failure range: ${unscheduledItem.forecastMileageMin ? unscheduledItem.forecastMileageMin.toLocaleString() : 'N/A'} - ${unscheduledItem.forecastMileageMax ? unscheduledItem.forecastMileageMax.toLocaleString() : 'N/A'} miles
   - Current mileage: ${currentMileage.toLocaleString()} miles
   - Is the vehicle approaching, at, or past the forecast mileage range?
   - Calculate miles until typical failure (negative if past)

3. **Maintenance Quality Indicators:**
   - Does the service history show good preventative maintenance that would prevent THIS specific issue?
   - Are there gaps in maintenance that increase risk for THIS component?
   - Does the service history analysis indicate recurring problems related to THIS item?
   - What specific maintenance factors affect this component?

4. **Current Risk Assessment:**
   - **Already Fixed/Replaced**: Component has been serviced/replaced recently (check service history)
   - **Low Risk**: Good maintenance history, not near failure mileage, preventative measures taken
   - **Moderate Risk**: Approaching failure mileage, some maintenance gaps, or mixed indicators
   - **High Risk**: Near or past failure mileage, poor maintenance history, or warning signs present
   - **Critical Risk**: Past failure mileage, poor maintenance, or service history shows related issues

Return ONLY a JSON object with this exact structure:
{
  "item": "${unscheduledItem.item}",
  "forecastMileageMin": ${unscheduledItem.forecastMileageMin || null},
  "forecastMileageMax": ${unscheduledItem.forecastMileageMax || null},
  "probability": ${unscheduledItem.probability || 50},
  "riskLevel": "Already Fixed/Replaced" | "Low" | "Moderate" | "High" | "Critical",
  "riskScore": number (0-100, where 0 = already fixed, 100 = critical risk),
  "evidence": {
    "serviceHistoryEvidence": "What service records show about this specific component",
    "alreadyFixed": true/false,
    "relatedServices": ["List of related service records with dates/mileages"],
    "preventativeMaintenance": "What preventative maintenance has been done (or not done) for this component"
  },
  "mileageRisk": {
    "currentMileage": ${currentMileage},
    "forecastRange": "${unscheduledItem.forecastMileageMin ? unscheduledItem.forecastMileageMin.toLocaleString() : 'N/A'}-${unscheduledItem.forecastMileageMax ? unscheduledItem.forecastMileageMax.toLocaleString() : 'N/A'} miles",
    "milesUntilTypicalFailure": number (negative if past typical failure mileage),
    "riskAssessment": "Not near / Approaching / At risk / Past typical failure"
  },
  "maintenanceQuality": {
    "overallMaintenance": "Good / Fair / Poor",
    "impactOnRisk": "Reduces risk / Neutral / Increases risk",
    "specificFactors": ["List of maintenance factors specifically affecting this component"]
  },
  "recommendation": "Specific recommendation for this item based on all available data",
  "confidence": "High" | "Medium" | "Low",
  "urgency": "Immediate" | "Soon" | "Monitor" | "Low Priority" | "Not Applicable"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automotive risk analyst. Evaluate ONE unscheduled maintenance item at a time. Analyze service history thoroughly, check mileage risk, and assess maintenance quality. Match service records intelligently using serviceType and description. Return ONLY valid JSON, no additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1 // Very low temperature for consistent, accurate analysis
    })

    const responseText = completion.choices[0].message.content
    return JSON.parse(responseText)
  } catch (error) {
    console.error(`Error evaluating unscheduled item "${unscheduledItem.item}":`, error)
    // Return default structure on error
    return {
      item: unscheduledItem.item,
      forecastMileageMin: unscheduledItem.forecastMileageMin,
      forecastMileageMax: unscheduledItem.forecastMileageMax,
      probability: unscheduledItem.probability || 50,
      riskLevel: 'Moderate',
      riskScore: 50,
      evidence: {
        serviceHistoryEvidence: 'Error analyzing service history',
        alreadyFixed: false,
        relatedServices: [],
        preventativeMaintenance: 'Unable to determine'
      },
      mileageRisk: {
        currentMileage: currentMileage,
        forecastRange: `${unscheduledItem.forecastMileageMin || 'N/A'}-${unscheduledItem.forecastMileageMax || 'N/A'} miles`,
        milesUntilTypicalFailure: null,
        riskAssessment: 'Unable to assess'
      },
      maintenanceQuality: {
        overallMaintenance: 'Unknown',
        impactOnRisk: 'Neutral',
        specificFactors: []
      },
      recommendation: 'Unable to provide recommendation',
      confidence: 'Low',
      urgency: 'Monitor'
    }
  }
}

/**
 * Evaluate risk level for each unscheduled maintenance item based on service history
 * Determines if items are already fixed, at risk, or likely to occur
 * Uses individual API calls for each item for better accuracy
 */
export async function evaluateUnscheduledMaintenanceRisk(
  serviceHistory,
  serviceHistoryAnalysis,
  unscheduledMaintenance,
  vehicleData
) {
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('OpenAI API key not configured. Returning placeholder data.')
    return {
      allItems: [],
      summary: 'OpenAI API key not configured'
    }
  }

  if (!unscheduledMaintenance || !Array.isArray(unscheduledMaintenance) || unscheduledMaintenance.length === 0) {
    return {
      allItems: [],
      summary: 'No unscheduled maintenance items available for evaluation'
    }
  }

  if (!serviceHistory || !serviceHistory.records || serviceHistory.records.length === 0) {
    return {
      allItems: [],
      summary: 'No service history available for evaluation'
    }
  }

  const vehicleSpec = vehicleData.trim || vehicleData.engine 
    ? `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}${vehicleData.trim ? ` ${vehicleData.trim.trim()}` : ''}${vehicleData.engine ? ` with ${vehicleData.engine.trim()} engine` : ''}`
    : `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}`

  const currentMileage = vehicleData.mileage || 0
  const currentDate = new Date().toISOString().split('T')[0]

  // Evaluate each unscheduled maintenance item individually for better accuracy
  console.log(`Evaluating ${unscheduledMaintenance.length} unscheduled maintenance items individually...`)
  const evaluatedItems = []
  
  for (let i = 0; i < unscheduledMaintenance.length; i++) {
    const item = unscheduledMaintenance[i]
    console.log(`Evaluating item ${i + 1}/${unscheduledMaintenance.length}: ${item.item}`)
    const evaluation = await evaluateSingleUnscheduledItem(
      openai,
      item,
      serviceHistory,
      serviceHistoryAnalysis,
      vehicleData,
      vehicleSpec,
      currentMileage,
      currentDate
    )
    evaluatedItems.push(evaluation)
    
    // Small delay to avoid rate limiting
    if (i < unscheduledMaintenance.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Count items by risk level for summary
  const alreadyFixedCount = evaluatedItems.filter(item => item.riskLevel === 'Already Fixed/Replaced').length
  const criticalCount = evaluatedItems.filter(item => item.riskLevel === 'Critical').length
  const highCount = evaluatedItems.filter(item => item.riskLevel === 'High').length
  const moderateCount = evaluatedItems.filter(item => item.riskLevel === 'Moderate').length
  const lowCount = evaluatedItems.filter(item => item.riskLevel === 'Low').length

  const summary = `Evaluated ${evaluatedItems.length} unscheduled maintenance items. Found ${alreadyFixedCount} already fixed/replaced, ${criticalCount} critical risk, ${highCount} high risk, ${moderateCount} moderate risk, and ${lowCount} low risk.`

  return {
    allItems: evaluatedItems,
    summary
  }
}

