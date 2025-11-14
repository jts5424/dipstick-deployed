import OpenAI from 'openai'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

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
 * Query AI for recommended routine maintenance schedule
 */
export async function queryMaintenanceSchedule(make, model, year, trim = null, engine = null) {
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('OpenAI API key not configured. Returning placeholder data.')
    // Return minimal placeholder if no API key
    return {
      make,
      model,
      year,
      items: []
    }
  }

  const vehicleSpec = trim || engine 
    ? `${make} ${model} ${year}${trim ? ` ${trim.trim()}` : ''}${engine ? ` with ${engine.trim()} engine` : ''}`
    : `${make} ${model} ${year}`

  const prompt = `You are an expert automotive mechanic with access to manufacturer service manuals, technical service bulletins, and industry consensus data. You specialize in ${vehicleSpec} vehicles.

Provide a comprehensive routine maintenance schedule based on EXPERT CONSENSUS from:
- Manufacturer's official maintenance schedule
- Industry-standard recommendations from ASE-certified mechanics
- Technical service bulletins (TSBs) for this specific vehicle
- Consensus from independent mechanics who specialize in this make/model

Include ALL routine maintenance items that should be performed regularly for this EXACT vehicle specification.

For each maintenance item, provide:
- Item name (e.g., "Oil Change", "Air Filter Replacement", "Brake Fluid Flush")
- Interval in miles (typical interval for this service)
- Interval in months (typical time-based interval)
- Brief description
- Risk note (explanation of what happens if this maintenance is skipped or delayed - be specific about the risks)
- Cost range for independent shops (min and max in USD)
- Cost range for OEM/dealer service centers (min and max in USD)

Focus on items that are part of the manufacturer's recommended maintenance schedule. Include items like:
- Oil changes
- Filter replacements (air, cabin, fuel)
- Fluid changes (transmission, brake, coolant, power steering)
- Spark plug replacement
- Belt replacements
- Tire rotations
- Brake inspections and service
- Battery service
- And other routine items specific to this make/model/year

Return the data as a JSON object with this exact structure:
{
  "make": "${make}",
  "model": "${model}",
  "year": ${year},
  "trim": ${trim ? `"${trim}"` : 'null'},
  "engine": ${engine ? `"${engine}"` : 'null'},
  "items": [
    {
      "item": "Item name",
      "intervalMiles": number,
      "intervalMonths": number,
      "description": "Brief description",
      "riskNote": "Explanation of risks if this maintenance is skipped or delayed",
      "costRange": { "min": number, "max": number },
      "oemCost": { "min": number, "max": number }
    }
  ]
}

Include ALL routine maintenance items for this vehicle. Do not limit the list - be comprehensive and include every maintenance item that should be performed. Use realistic cost ranges based on current market rates.`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an automotive maintenance expert with access to manufacturer service manuals, technical service bulletins, and industry consensus data. Base all recommendations on expert consensus and official documentation. Always return valid JSON only, no additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0
    })

    const responseText = completion.choices[0].message.content
    const parsedData = JSON.parse(responseText)

    // Validate and clean the data
    if (!parsedData.items || !Array.isArray(parsedData.items)) {
      throw new Error('AI response did not contain valid items array')
    }

    // Clean and validate each item - include ALL items from AI
    const cleanedItems = parsedData.items.map(item => ({
      item: item.item || 'Unknown',
      intervalMiles: item.intervalMiles ? parseInt(item.intervalMiles) : null,
      intervalMonths: item.intervalMonths ? parseInt(item.intervalMonths) : null,
      description: item.description || '',
      riskNote: item.riskNote || '',
      costRange: {
        min: item.costRange?.min ? parseFloat(item.costRange.min) : 0,
        max: item.costRange?.max ? parseFloat(item.costRange.max) : 0
      },
      oemCost: {
        min: item.oemCost?.min ? parseFloat(item.oemCost.min) : 0,
        max: item.oemCost?.max ? parseFloat(item.oemCost.max) : 0
      }
    })).filter(item => item.item !== 'Unknown') // Only filter out items with no name

    return {
      make: parsedData.make || make,
      model: parsedData.model || model,
      year: parsedData.year || year,
      items: cleanedItems
    }
  } catch (error) {
    console.error('Error querying maintenance schedule from AI:', error)
    // Return empty structure on error
    return {
      make,
      model,
      year,
      items: []
    }
  }
}

/**
 * Query AI for typical unscheduled maintenance items and failure patterns
 */
export async function queryUnscheduledMaintenance(make, model, year, trim = null, engine = null) {
  const openai = getOpenAIClient()
  
  if (!openai) {
    console.warn('OpenAI API key not configured. Returning placeholder data.')
    // Return minimal placeholder if no API key
    return {
      make,
      model,
      year,
      items: []
    }
  }

  // HARD CODED FOR TESTING
  const vehicleSpec = 'Audi A6 2018 3.0L Quattro Premium Plus'
  
  // const vehicleSpec = trim || engine 
  //   ? `${make} ${model} ${year}${trim ? ` ${trim.trim()}` : ''}${engine ? ` with ${engine.trim()} engine` : ''}`
  //   : `${make} ${model} ${year}`

  console.log('Unscheduled Maintenance Query - Vehicle Spec (HARD CODED):', vehicleSpec)
  console.log('Unscheduled Maintenance Query - Make:', make, 'Model:', model, 'Year:', year, 'Trim:', trim, 'Engine:', engine)

  const prompt = `List the typical unscheduled maintenance and failure modes for this car: ${vehicleSpec}

Return ONLY a JSON object with this exact structure:
{
  "items": [
    {
      "item": "Item name",
      "forecastMileageMin": number,
      "forecastMileageMax": number,
      "probability": number (0-100),
      "description": "Brief description",
      "preventativeActions": "Specific preventative actions - be detailed",
      "inspection": "Specific inspection procedures - be detailed",
      "costRange": { "min": number, "max": number },
      "oemCost": { "min": number, "max": number }
    }
  ]
}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'Return ONLY valid JSON. No additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0
    })

    const responseText = completion.choices[0].message.content
    const parsedData = JSON.parse(responseText)

    // Validate and clean the data
    if (!parsedData.items || !Array.isArray(parsedData.items)) {
      throw new Error('AI response did not contain valid items array')
    }

    // Clean and validate each item - include ALL items from AI
    const cleanedItems = parsedData.items.map(item => ({
      item: item.item || 'Unknown',
      forecastMileageMin: item.forecastMileageMin ? parseInt(item.forecastMileageMin) : null,
      forecastMileageMax: item.forecastMileageMax ? parseInt(item.forecastMileageMax) : null,
      probability: item.probability ? Math.max(0, Math.min(100, parseFloat(item.probability))) : 50,
      description: item.description || '',
      preventativeActions: item.preventativeActions || '',
      inspection: item.inspection || '',
      costRange: {
        min: item.costRange?.min ? parseFloat(item.costRange.min) : 0,
        max: item.costRange?.max ? parseFloat(item.costRange.max) : 0
      },
      oemCost: {
        min: item.oemCost?.min ? parseFloat(item.oemCost.min) : 0,
        max: item.oemCost?.max ? parseFloat(item.oemCost.max) : 0
      }
    })).filter(item => item.item !== 'Unknown') // Only filter out items with no name

    return {
      make: parsedData.make || make,
      model: parsedData.model || model,
      year: parsedData.year || year,
      items: cleanedItems
    }
  } catch (error) {
    console.error('Error querying unscheduled maintenance from AI:', error)
    // Return empty structure on error
    return {
      make,
      model,
      year,
      items: []
    }
  }
}

