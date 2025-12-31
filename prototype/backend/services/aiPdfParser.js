import OpenAI from 'openai'
import fs from 'fs'
import pdfParse from 'pdf-parse'

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
 * Parse PDF using OpenAI API to extract structured service history
 * This handles complex formats like Carfax reports
 */
export async function parsePDFWithAI(pdfPath) {
  try {
    console.log('[PDF Parse] Step 1/3: Reading PDF file...')
    // Read PDF file
    const pdfBuffer = fs.readFileSync(pdfPath)
    
    console.log('[PDF Parse] Step 2/3: Extracting text from PDF...')
    // Option 1: Convert PDF to text first, then use AI to structure it
    // This is more cost-effective than vision API
    const pdfData = await pdfParse(pdfBuffer)
    const pdfText = pdfData.text
    console.log(`[PDF Parse]   Extracted ${pdfText.length} characters of text`)

    if (!pdfText || pdfText.trim().length === 0) {
      throw new Error('PDF appears to be empty or could not extract text')
    }

    console.log('[PDF Parse] Step 3/3: Sending to OpenAI for parsing (this may take 10-30 seconds)...')
    // Use OpenAI to extract structured service history from the text
    const structuredData = await extractServiceHistoryWithAI(pdfText)
    console.log('[PDF Parse]   ✅ OpenAI parsing complete')

    return {
      rawText: pdfText,
      vehicleInfo: structuredData.vehicleInfo || {
        make: null,
        model: null,
        year: null,
        trim: null,
        engine: null,
        vin: null
      },
      records: structuredData.records || [],
      metadata: structuredData.metadata || {}
    }
  } catch (error) {
    console.error('Error parsing PDF with AI:', error)
    
    if (error.message.includes('API key')) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.')
    }
    
    throw new Error(`Failed to parse PDF: ${error.message}`)
  }
}

/**
 * Sort service records by date (newest first)
 * Records without dates go to the end
 */
function sortRecordsByDate(records) {
  return [...records].sort((a, b) => {
    // If both have dates, compare them
    if (a.date && b.date) {
      const dateA = new Date(a.date)
      const dateB = new Date(b.date)
      // Return negative if dateA is older (older dates first - ascending)
      return dateA - dateB
    }
    // Records with dates come before records without dates
    if (a.date && !b.date) return -1
    if (!a.date && b.date) return 1
    // If neither has a date, maintain original order
    return 0
  })
}

/**
 * Clean up description to ensure it's a concise list of work items
 * Removes narrative text and converts to comma-separated list
 */
function cleanDescription(description) {
  if (!description || typeof description !== 'string') {
    return ''
  }
  
  let cleaned = description.trim()
  
  // If it's already a comma-separated list or short, return as is
  if (cleaned.length < 200 && (cleaned.includes(',') || cleaned.split(' ').length < 20)) {
    return cleaned
  }
  
  // Remove common narrative phrases
  cleaned = cleaned
    .replace(/performed\s+/gi, '')
    .replace(/service\s+performed[:\s]*/gi, '')
    .replace(/work\s+performed[:\s]*/gi, '')
    .replace(/services?\s+included[:\s]*/gi, '')
    .replace(/vehicle\s+was\s+/gi, '')
    .replace(/technician\s+/gi, '')
    .replace(/inspected\s+and\s+/gi, '')
    .replace(/\.\s+/g, ', ')
    .replace(/\n+/g, ', ')
    .replace(/\s+/g, ' ')
    .replace(/,\s*,/g, ',')
    .trim()
  
  // Remove trailing commas and periods
  cleaned = cleaned.replace(/[,\.]+$/, '').trim()
  
  return cleaned
}

/**
 * Use OpenAI to extract structured service history from PDF text
 */
async function extractServiceHistoryWithAI(pdfText) {
  const openai = getOpenAIClient()
  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.')
  }

  const prompt = `You are an expert at parsing vehicle service history documents, including Carfax reports, dealer service records, and independent shop records.

FIRST, extract vehicle identification information from the document:
- Make (e.g., "Toyota", "Ford", "Honda")
- Model (e.g., "Camry", "F-150", "Civic")
- Year (e.g., 2018, 2020)
- Trim (if available, e.g., "LE", "XLE", "Limited")
- Engine (if available, e.g., "3.5L V6", "2.0L I4 Turbo")
- VIN (Vehicle Identification Number, if available)

THEN, extract ALL service history records from the following document text. For each service record, you MUST identify and extract:

1. Date: Convert to YYYY-MM-DD format if possible. Look for dates in any format (MM/DD/YYYY, DD-MM-YYYY, Month DD YYYY, etc.)
2. Mileage: Extract as a number (remove commas, spaces, and "mi" or "miles" text). Look for odometer readings, mileage indicators.
3. Description: Extract ONLY the list of work items performed. Format as a comma-separated list or bullet points. DO NOT include full paragraphs, explanations, or narrative text. Only include the actual work items (e.g., "Oil change, Filter replacement, Tire rotation" or "Brake pad replacement, Brake fluid flush"). Keep it concise and factual.
4. Service Type: Categorize the primary service type (e.g., "Oil Change", "Brake Service", "Tire Replacement", "Engine Service", "Transmission Service", "Battery Replacement", "Inspection", etc.). Choose the most significant service if multiple items were done.
5. Cost: Extract the total cost as a number (remove $, commas, currency symbols). Look for "Total", "Amount", "Cost", "Price" fields.
6. Location/Shop: Extract the service facility name, dealer name, or shop name. Look for "Dealer", "Service Center", "Shop", facility names, or business names.

IMPORTANT INSTRUCTIONS:
- Extract EVERY SINGLE service record from the document. Do not skip any records.
- Extract EVERY field that is available in the document. Do not leave fields as null if the information exists in the text.
- For description: Only list the work items, not explanations or context. If the document says "Performed oil change and filter replacement. Vehicle inspected.", the description should be "Oil change, Filter replacement, Vehicle inspection" - NOT the full sentence.
- Parse each service record separately. If multiple services are listed together, split them into separate records if they have different dates/mileage.
- Be thorough and systematic - extract ALL records from the document.

Return the data as a JSON object with this exact structure:
{
  "vehicleInfo": {
    "make": "string or null",
    "model": "string or null",
    "year": number or null,
    "trim": "string or null",
    "engine": "string or null",
    "vin": "string or null"
  },
  "records": [
    {
      "date": "YYYY-MM-DD or null",
      "mileage": number or null,
      "description": "comma-separated list of work items only",
      "serviceType": "categorized service type",
      "cost": number or null,
      "location": "shop name or null"
    }
  ],
  "metadata": {
    "totalRecords": number,
    "dateRange": {
      "earliest": "YYYY-MM-DD or null",
      "latest": "YYYY-MM-DD or null"
    },
    "mileageRange": {
      "lowest": number or null,
      "highest": number or null
    }
  }
}

Document text:
${pdfText.substring(0, 15000)}${pdfText.length > 15000 ? '\n\n[... document truncated for length ...]' : ''}`

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // Use gpt-4o-mini for cost efficiency, or gpt-4o for better accuracy
      messages: [
        {
          role: 'system',
          content: 'You are a data extraction specialist for vehicle service history. Extract structured data accurately and systematically. Extract EVERY SINGLE service record from the document - do not skip any. For descriptions, return ONLY comma-separated work items, not full paragraphs. Extract ALL available fields (date, mileage, cost, location) - do not leave them null if the information exists. Always return valid JSON only, no additional text or explanation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' }, // Force JSON response
      temperature: 0 // Deterministic extraction - same input always produces same output
    })

    const responseText = completion.choices[0].message.content
    const parsedData = JSON.parse(responseText)

    console.log('AI parsed vehicleInfo:', parsedData.vehicleInfo)

    // Validate and clean the data
    if (!parsedData.records || !Array.isArray(parsedData.records)) {
      throw new Error('AI response did not contain valid records array')
    }

    // Clean and validate each record - KEEP ALL RECORDS even if some fields are missing
    const cleanedRecords = parsedData.records.map(record => ({
      date: record.date || null,
      mileage: record.mileage ? parseInt(record.mileage) : null,
      description: cleanDescription(record.description || ''),
      serviceType: record.serviceType || null,
      cost: record.cost ? parseFloat(record.cost) : null,
      location: record.location || null
    }))
    // DO NOT filter - keep all records even if description is empty

    // Sort records by date (oldest first - ascending)
    const sortedRecords = sortRecordsByDate(cleanedRecords)

    return {
      vehicleInfo: parsedData.vehicleInfo || {
        make: null,
        model: null,
        year: null,
        trim: null,
        engine: null,
        vin: null
      },
      records: sortedRecords,
      metadata: parsedData.metadata || {}
    }
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('AI returned invalid JSON response')
    }
    throw error
  }
}


