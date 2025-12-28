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
 * Analyze service history for expert evaluation, suspicious patterns, and anomalies
 */
export async function analyzeServiceHistory(serviceHistory, vehicleData) {
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('OpenAI API key not configured. Returning placeholder data.')
    return {
      evaluation: 'OpenAI API key not configured',
      suspiciousItems: [],
      anomalies: [],
      expertNotes: [],
      frequentServices: []
    }
  }

  const vehicleSpec = vehicleData.trim || vehicleData.engine 
    ? `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}${vehicleData.trim ? ` ${vehicleData.trim.trim()}` : ''}${vehicleData.engine ? ` with ${vehicleData.engine.trim()} engine` : ''}`
    : `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}`

  // Prepare service history summary for AI
  const serviceHistorySummary = {
    totalRecords: serviceHistory.records?.length || 0,
    dateRange: serviceHistory.metadata?.dateRange || null,
    mileageRange: serviceHistory.metadata?.mileageRange || null,
    currentMileage: vehicleData.mileage || null,
    records: serviceHistory.records || []
  }

  const prompt = `You are an expert automotive mechanic and service history analyst with deep knowledge of ${vehicleSpec} vehicles. 

Analyze the following service history records and provide a comprehensive expert evaluation. Look for:

1. **Suspicious or Phishy Patterns:**
   - Unusually frequent service visits (more than normal for the vehicle)
   - Services performed at suspiciously short intervals
   - Missing critical maintenance items that should have been done
   - Gaps in service history that are concerning
   - Services that don't make sense for the mileage/age
   - Cost anomalies (unusually high or low for the service)
   - Multiple repairs of the same component (indicates recurring problems)
   - Services performed at unusual locations or patterns

2. **Things Done More Than Normal:**
   - Services performed more frequently than typical for this vehicle
   - What this could indicate (e.g., recurring problems, aggressive maintenance, potential issues)
   - Whether this is good (preventative) or bad (symptom of problems)

3. **Expert Evaluation:**
   - Overall quality of maintenance
   - Red flags or concerns
   - Positive indicators
   - Missing critical services
   - Service pattern analysis
   - Recommendations based on the history

4. **Anomalies and Concerns:**
   - Any unusual patterns or inconsistencies
   - Potential hidden problems
   - Things that don't add up

Service History Data:
- Vehicle: ${vehicleSpec}
- Current Mileage: ${vehicleData.mileage || 'Unknown'}
- Total Service Records: ${serviceHistorySummary.totalRecords}
- Date Range: ${serviceHistorySummary.dateRange?.earliest || 'Unknown'} to ${serviceHistorySummary.dateRange?.latest || 'Unknown'}
- Mileage Range: ${serviceHistorySummary.mileageRange?.lowest || 'Unknown'} to ${serviceHistorySummary.mileageRange?.highest || 'Unknown'} miles

Service Records:
${JSON.stringify(serviceHistorySummary.records, null, 2)}

Return ONLY a JSON object with this exact structure:
{
  "evaluation": "Overall expert evaluation of the service history - comprehensive analysis",
  "suspiciousItems": [
    {
      "item": "Description of suspicious pattern or item",
      "severity": "High/Medium/Low",
      "explanation": "Why this is suspicious and what it could mean",
      "relatedRecords": ["Brief description of related service records"]
    }
  ],
  "anomalies": [
    {
      "item": "Description of anomaly or unusual pattern",
      "type": "Frequency/Cost/Gap/Missing/Other",
      "explanation": "What this anomaly indicates",
      "concern": "Level of concern and potential implications"
    }
  ],
  "expertNotes": [
    {
      "category": "Maintenance Quality/Recurring Issues/Missing Services/Positive Indicators/etc",
      "note": "Expert observation or recommendation"
    }
  ],
  "frequentServices": [
    {
      "service": "Service name or type",
      "frequency": "How often it was performed",
      "normalFrequency": "What's normal for this vehicle",
      "interpretation": "What doing this more than normal could mean (good or bad)"
    }
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automotive service history analyst. Analyze service records thoroughly for suspicious patterns, anomalies, and provide expert evaluation. Be detailed and specific. Return ONLY valid JSON, no additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3 // Slight creativity for analysis but still consistent
    })

    const responseText = completion.choices[0].message.content
    const parsedData = JSON.parse(responseText)

    // Validate and clean the data
    return {
      evaluation: parsedData.evaluation || 'No evaluation provided',
      suspiciousItems: parsedData.suspiciousItems || [],
      anomalies: parsedData.anomalies || [],
      expertNotes: parsedData.expertNotes || [],
      frequentServices: parsedData.frequentServices || []
    }
  } catch (error) {
    console.error('Error analyzing service history:', error)
    return {
      evaluation: 'Error analyzing service history',
      suspiciousItems: [],
      anomalies: [],
      expertNotes: [],
      frequentServices: [],
      error: error.message
    }
  }
}

