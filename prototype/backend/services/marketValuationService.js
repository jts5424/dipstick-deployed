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
 * Get comprehensive market valuation for a vehicle
 * Includes retail value, private sale value, depreciation analysis, and market trends
 */
export async function getMarketValuation(vehicleData) {
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('OpenAI API key not configured. Returning placeholder data.')
    return {
      valuation: null,
      depreciation: null,
      marketAnalysis: null,
      error: 'OpenAI API key not configured'
    }
  }

  const vehicleSpec = vehicleData.trim || vehicleData.engine 
    ? `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}${vehicleData.trim ? ` ${vehicleData.trim.trim()}` : ''}${vehicleData.engine ? ` with ${vehicleData.engine.trim()} engine` : ''}`
    : `${vehicleData.make} ${vehicleData.model} ${vehicleData.year}`

  const currentMileage = vehicleData.mileage || 0
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear()
  const vehicleAge = currentYear - vehicleData.year

  const prompt = `You are an expert automotive market analyst specializing in vehicle valuation, depreciation analysis, and market trends.

Provide a COMPREHENSIVE and DETAILED market valuation analysis for this EXACT vehicle specification:

Vehicle: ${vehicleSpec}
Current Mileage: ${currentMileage.toLocaleString()} miles
Vehicle Age: ${vehicleAge} years
Current Date: ${currentDate.toISOString().split('T')[0]}

CRITICAL REQUIREMENTS:

1. **Current Market Valuation:**
   - Retail Value (Dealer/Retail Price): Provide a precise range (min/max) and average
   - Private Party Value: Provide a precise range (min/max) and average
   - Trade-In Value: Provide a precise range (min/max) and average
   - All values should be based on CURRENT market conditions and the vehicle's specific mileage, age, and condition
   - **IMPORTANT: All dollar amounts must be in FULL DOLLARS (e.g., 25000 for $25,000), NOT in thousands (e.g., NOT 25 for $25,000). Return the complete dollar amount as a number.**

2. **Depreciation Analysis:**
   - Original MSRP when new (${vehicleData.year}) - **in full dollars, not thousands**
   - Current value (both retail and private party) - **in full dollars, not thousands**
   - Total depreciation amount and percentage
   - Annual depreciation rate
   - Projected future depreciation (1 year, 2 years, 3 years, 5 years from now) - **all values in full dollars, not thousands**
   - Mileage impact on depreciation

3. **Depreciation Curve Data Points:**
   - Provide depreciation data points for this EXACT model from new (0 miles, year ${vehicleData.year}) through typical ownership periods
   - Include data points for: 0 miles (new), 10k, 20k, 30k, 40k, 50k, 60k, 70k, 80k, 90k, 100k, 120k, 150k, 200k miles
   - For each mileage point, provide:
     * Retail value at that mileage - **in full dollars (e.g., 25000), NOT in thousands (e.g., NOT 25)**
     * Private party value at that mileage - **in full dollars (e.g., 22000), NOT in thousands (e.g., NOT 22)**
     * Vehicle age at that mileage (assuming average annual mileage)
   - This will be used to create a depreciation graph
   - **CRITICAL: All dollar values must be the complete dollar amount, not divided by 1000**

4. **Market Analysis:**
   - Current market conditions (strong/weak/stable)
   - Factors affecting value (supply, demand, seasonality, economic factors)
   - Comparison to similar vehicles in the market
   - Regional variations (if applicable)
   - Market trends (appreciating, depreciating, stable)

5. **Value Factors:**
   - Mileage impact on value (above/below average)
   - Age impact on value
   - Market segment analysis (luxury, economy, etc.)
   - Brand/model reputation impact
   - Specific trim/engine impact on value

6. **Current Vehicle Position:**
   - Where this specific vehicle (${currentMileage.toLocaleString()} miles) sits on the depreciation curve
   - Value retention percentage
   - Comparison to average depreciation for this model
   - **All dollar values must be in full dollars (e.g., 25000), NOT in thousands (e.g., NOT 25)**

Return ONLY a JSON object with this exact structure:
{
  "currentValuation": {
    "retail": {
      "min": number,
      "max": number,
      "average": number,
      "currency": "USD"
    },
    "privateParty": {
      "min": number,
      "max": number,
      "average": number,
      "currency": "USD"
    },
    "tradeIn": {
      "min": number,
      "max": number,
      "average": number,
      "currency": "USD"
    }
  },
  "depreciation": {
    "originalMSRP": number,
    "currentRetailValue": number,
    "currentPrivatePartyValue": number,
    "totalDepreciation": number,
    "totalDepreciationPercent": number,
    "annualDepreciationRate": number,
    "mileageImpact": "Above average / Average / Below average",
    "valueRetention": number (percentage),
    "projectedValues": {
      "oneYear": { "retail": number, "privateParty": number },
      "twoYears": { "retail": number, "privateParty": number },
      "threeYears": { "retail": number, "privateParty": number },
      "fiveYears": { "retail": number, "privateParty": number }
    }
  },
  "depreciationCurve": [
    {
      "mileage": number,
      "age": number (years),
      "retailValue": number,
      "privatePartyValue": number
    }
  ],
  "currentVehiclePosition": {
    "mileage": ${currentMileage},
    "retailValue": number,
    "privatePartyValue": number,
    "positionOnCurve": "Early / Mid / Late depreciation phase",
    "valueRetention": number (percentage),
    "comparisonToAverage": "Above / At / Below average"
  },
  "marketAnalysis": {
    "marketCondition": "Strong / Weak / Stable",
    "factors": ["List of key factors affecting value"],
    "trends": "Appreciating / Depreciating / Stable",
    "regionalVariations": "Description of regional value differences",
    "marketSegment": "Luxury / Mid-range / Economy / etc."
  },
  "valueFactors": {
    "mileageImpact": "Description of how mileage affects this vehicle's value",
    "ageImpact": "Description of how age affects this vehicle's value",
    "trimEngineImpact": "Description of how specific trim/engine affects value",
    "brandReputation": "Description of brand/model reputation impact"
  }
}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert automotive market analyst. Provide comprehensive, accurate vehicle valuations based on current market data, depreciation curves, and market trends. CRITICAL: All dollar amounts must be returned as FULL DOLLAR VALUES (e.g., 25000 for $25,000), NOT in thousands format (e.g., NOT 25 for $25,000). Return ONLY valid JSON, no additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2 // Low temperature for consistent, accurate valuations
    })

    const responseText = completion.choices[0].message.content
    const parsedData = JSON.parse(responseText)

    // Return the full structure with currentValuation (not valuation) to match TCO expectations
    return {
      currentValuation: parsedData.currentValuation || null,
      depreciation: parsedData.depreciation || null,
      depreciationCurve: parsedData.depreciationCurve || [],
      currentVehiclePosition: parsedData.currentVehiclePosition || null,
      marketAnalysis: parsedData.marketAnalysis || null,
      valueFactors: parsedData.valueFactors || null
    }
  } catch (error) {
    console.error('Error getting market valuation:', error)
    return {
      currentValuation: null,
      depreciation: null,
      depreciationCurve: [],
      currentVehiclePosition: null,
      marketAnalysis: null,
      valueFactors: null,
      error: error.message
    }
  }
}

