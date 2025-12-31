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
 * Analyze a single maintenance item against service history
 * This focused approach improves matching accuracy
 */
async function analyzeSingleMaintenanceItem(openai, maintenanceItem, serviceHistory, vehicleData, vehicleSpec, currentMileage, currentDate) {
  const prompt = `You are an expert automotive mechanic analyzing ONE specific maintenance item for a ${vehicleSpec} vehicle.

MAINTENANCE ITEM TO ANALYZE:
${JSON.stringify(maintenanceItem, null, 2)}

Vehicle Information:
- Vehicle: ${vehicleSpec}
- Current Mileage: ${currentMileage.toLocaleString()} miles
- Current Date: ${currentDate}
- Service History Records: ${serviceHistory.records.length} total records

ALL Service History Records (check EVERY record carefully):
${JSON.stringify(serviceHistory.records, null, 2)}

CRITICAL MATCHING INSTRUCTIONS:
1. Look through ALL service history records for this maintenance item
2. Match intelligently using:
   - Service Type field (e.g., "Oil Change" service type matches "Oil Change" maintenance item)
   - Description field (e.g., "Engine Oil Change", "Oil and Filter Change", "Synthetic Oil Change" all match "Oil Change")
   - Look for partial matches, synonyms, and related terms
   - Consider abbreviations and variations (e.g., "Transmission Fluid" = "Trans Fluid" = "ATF")
3. Find the MOST RECENT matching service record
4. Extract the date and mileage from that record

ANALYSIS TASKS:
1. Has this maintenance item been performed? (YES if you find ANY matching service record)
2. If YES, what is the MOST RECENT date it was performed? (from the matching service record)
3. If YES, what mileage was it performed at? (from the matching service record)
4. If NEVER performed, set lastPerformedMileage = 0
5. Calculate delta: delta = lastPerformedMileage + recommendedIntervalMiles - currentMileage (${currentMileage})
6. If delta < 0: item is OVERDUE by abs(delta) miles. Set overdueByMiles = abs(delta), dueInMiles = null
7. If delta >= 0: item is due in delta miles. Set overdueByMiles = null, dueInMiles = delta
8. Calculate nextDueMileage: nextDueMileage = lastPerformedMileage + recommendedIntervalMiles (this is when it SHOULD be done)
9. Determine status:
   - "Overdue" if delta < 0 (overdue by abs(delta) miles)
   - "Due Now" if delta is between 0 and 1000 miles OR if never performed (lastPerformedMileage = 0)
   - "Near Future" if delta is between 1000 and 10,000 miles
   - "Not Due" if delta > 10,000 miles

CRITICAL FORMULA: delta = (lastPerformedMileage || 0) + intervalMiles - currentMileage
- Negative delta = overdue by abs(delta) miles
- Positive delta = due in delta miles

Return ONLY a JSON object with this exact structure:
{
  "item": "${maintenanceItem.item}",
  "lastPerformedMileage": number or null,
  "lastPerformedDate": "YYYY-MM-DD or null",
  "recommendedIntervalMiles": ${maintenanceItem.intervalMiles || null},
  "recommendedIntervalMonths": ${maintenanceItem.intervalMonths || null},
  "nextDueMileage": number,
  "nextDueDate": "YYYY-MM-DD or null",
  "overdueByMiles": number or null,
  "overdueByMonths": number or null,
  "dueInMiles": number or null,
  "dueInMonths": number or null,
  "status": "Overdue" | "Due Now" | "Near Future" | "Not Due",
  "severity": "Critical/High/Medium/Low" or null,
  "riskNote": "${maintenanceItem.riskNote || ''}",
  "costRange": ${JSON.stringify(maintenanceItem.costRange || { min: 0, max: 0 })},
  "oemCost": ${JSON.stringify(maintenanceItem.oemCost || { min: 0, max: 0 })},
  "shouldCompleteBeforePurchase": true/false,
  "matchingServiceRecords": ["List of service record dates/mileages that matched this item"]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automotive maintenance analyst. Analyze ONE maintenance item at a time. Match service history records intelligently using serviceType and description fields. Look for partial matches, synonyms, and variations. Find the most recent matching service. Return ONLY valid JSON, no additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1 // Very low temperature for consistent, accurate matching
    })

    const responseText = completion.choices[0].message.content
    return JSON.parse(responseText)
  } catch (error) {
    console.error(`Error analyzing maintenance item "${maintenanceItem.item}":`, error)
    // Return default structure on error
    return {
      item: maintenanceItem.item,
      lastPerformedMileage: null,
      lastPerformedDate: null,
      recommendedIntervalMiles: maintenanceItem.intervalMiles,
      recommendedIntervalMonths: maintenanceItem.intervalMonths,
      nextDueMileage: null,
      nextDueDate: null,
      overdueByMiles: null,
      overdueByMonths: null,
      dueInMiles: null,
      dueInMonths: null,
      status: 'Not Due',
      severity: 'Medium',
      riskNote: maintenanceItem.riskNote || '',
      costRange: maintenanceItem.costRange || { min: 0, max: 0 },
      oemCost: maintenanceItem.oemCost || { min: 0, max: 0 },
      shouldCompleteBeforePurchase: false,
      matchingServiceRecords: []
    }
  }
}

/**
 * Compare service history against routine maintenance schedule and perform gap analysis
 * Identifies overdue items, due items, and near-future maintenance needs
 * Uses individual API calls for each maintenance item for better accuracy
 */
export async function analyzeMaintenanceGaps(serviceHistory, maintenanceSchedule, vehicleData) {
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('OpenAI API key not configured. Returning placeholder data.')
    return {
      overdueItems: [],
      dueItems: [],
      nearFutureItems: [],
      summary: 'OpenAI API key not configured'
    }
  }

  if (!maintenanceSchedule || !maintenanceSchedule.items || maintenanceSchedule.items.length === 0) {
    return {
      overdueItems: [],
      dueItems: [],
      nearFutureItems: [],
      summary: 'No maintenance schedule available for comparison'
    }
  }

  if (!serviceHistory || !serviceHistory.records || serviceHistory.records.length === 0) {
    return {
      overdueItems: [],
      dueItems: [],
      nearFutureItems: [],
      summary: 'No service history available for comparison'
    }
  }

  const vehicleSpec = vehicleData.trim || vehicleData.engine 
    ? `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}${vehicleData.trim ? ` ${vehicleData.trim.trim()}` : ''}${vehicleData.engine ? ` with ${vehicleData.engine.trim()} engine` : ''}`
    : `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}`

  const currentMileage = vehicleData.mileage || 0
  const currentDate = new Date().toISOString().split('T')[0]

  // Analyze each maintenance item individually for better accuracy
  console.log(`Analyzing ${maintenanceSchedule.items.length} maintenance items individually...`)
  const analyzedItems = []
  
  for (let i = 0; i < maintenanceSchedule.items.length; i++) {
    const item = maintenanceSchedule.items[i]
    console.log(`Analyzing item ${i + 1}/${maintenanceSchedule.items.length}: ${item.item}`)
    const analysis = await analyzeSingleMaintenanceItem(
      openai,
      item,
      serviceHistory,
      vehicleData,
      vehicleSpec,
      currentMileage,
      currentDate
    )
    analyzedItems.push(analysis)
    
    // Small delay to avoid rate limiting
    if (i < maintenanceSchedule.items.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }

  // Return all items with their status - frontend will display in a single table
  const allItems = analyzedItems.map(item => ({
    item: item.item,
    status: item.status || 'Not Due',
    lastPerformedMileage: item.lastPerformedMileage,
    lastPerformedDate: item.lastPerformedDate,
    recommendedIntervalMiles: item.recommendedIntervalMiles,
    recommendedIntervalMonths: item.recommendedIntervalMonths,
    nextDueMileage: item.nextDueMileage,
    nextDueDate: item.nextDueDate,
    overdueByMiles: item.overdueByMiles,
    overdueByMonths: item.overdueByMonths,
    dueInMiles: item.dueInMiles,
    dueInMonths: item.dueInMonths,
    severity: item.severity || 'Medium',
    riskNote: item.riskNote || '',
    costRange: item.costRange,
    oemCost: item.oemCost,
    shouldCompleteBeforePurchase: item.shouldCompleteBeforePurchase || false
  }))

  // Count items by status for summary
  const overdueCount = allItems.filter(item => item.status === 'Overdue').length
  const dueNowCount = allItems.filter(item => item.status === 'Due Now').length
  const nearFutureCount = allItems.filter(item => item.status === 'Near Future').length

  const summary = `Analyzed ${allItems.length} maintenance items. Found ${overdueCount} overdue, ${dueNowCount} due now, and ${nearFutureCount} due in the near future.`

  return {
    allItems,
    summary
  }
}

