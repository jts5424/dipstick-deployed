/**
 * METHOD: Carfax
 * 
 * Extracts ALL vehicle history events from Carfax PDF reports using Claude 3.5 Sonnet Vision API.
 * Converts PDF pages to images to preserve layout and formatting fidelity.
 * Classifies each event by type (service, accident, title_change, etc.)
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from 'canvas'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Get Claude client
 */
function getClaudeClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }
  
  return new Anthropic({ apiKey })
}

/**
 * Convert PDF pages to base64-encoded images
 */
async function pdfToImages(pdfPath) {
  const pdfBuffer = fs.readFileSync(pdfPath)
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer })
  const pdf = await loadingTask.promise
  
  const images = []
  
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: 2.0 }) // Higher scale for better quality
    
    // Create canvas
    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise
    
    // Convert canvas to base64 image
    const imageData = canvas.toDataURL('image/png')
    const base64Data = imageData.split(',')[1] // Remove data:image/png;base64, prefix
    
    images.push({
      pageNumber: pageNum,
      base64: base64Data,
      width: viewport.width,
      height: viewport.height
    })
  }
  
  return images
}

/**
 * Clean description text (preserve original but normalize whitespace)
 */
function cleanDescription(description) {
  if (!description) return ''
  
  // Only normalize excessive whitespace, preserve everything else
  return description.trim().replace(/\s+/g, ' ')
}

/**
 * Extract ALL vehicle history events from PDF images using Claude 3.5 Sonnet Vision
 */
async function extractVehicleHistoryEvents(images) {
  const client = getClaudeClient()
  
  // Prepare image content blocks
  const imageBlocks = images.map(img => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/png',
      data: img.base64
    }
  }))
  
  const prompt = `You are an expert at parsing Carfax Vehicle History Reports. Analyze the provided PDF pages (images) and extract ALL vehicle history events.

Extract EVERY event from the Carfax report, including:
- Service/maintenance records (oil changes, repairs, inspections)
- Accidents and damage reports
- Title changes and ownership transfers
- Registration events
- Safety/emissions inspections
- Manufacturer recalls
- Warranty claims
- Auction sales
- Theft reports
- Flood/fire/structural damage
- Liens and repossessions
- Any other events shown in the report

For EACH event, extract:
1. **date**: Event date in YYYY-MM-DD format (or null if not present)
2. **mileage**: Odometer reading as a number (or null if not present)
3. **description**: The description exactly as it appears in Carfax (preserve original text)
4. **location**: Location as it appears in Carfax (or null if not present)
5. **cost**: Cost as a number (or null if not present - most events won't have cost)

Then, classify each event by assigning an **eventType** based on the description:
- "service" - Maintenance, repairs, inspections, routine service
- "accident" - Accidents, collisions, damage reports
- "title_change" - Title transfers, ownership changes, new owner reported
- "registration" - Registration renewals, state changes
- "inspection" - Safety inspections, emissions tests
- "recall" - Manufacturer recalls
- "warranty" - Warranty claims, warranty work
- "auction" - Auction sales
- "theft" - Theft reports, vehicle recovered
- "flood_damage" - Flood damage reports
- "fire_damage" - Fire damage reports
- "structural_damage" - Structural/frame damage
- "lien" - Liens, repossession
- "other" - Events that don't fit the above categories

IMPORTANT RULES:
- Extract EXACTLY what's in Carfax - don't interpret, normalize, or enhance
- Preserve original text in descriptions - don't summarize or rephrase
- Extract ALL events from ALL pages - don't skip any
- One event per line/item in the Carfax report
- Use null for fields that are not present in Carfax
- Classify eventType based on the description content

Return the data as a JSON object with this exact structure:
{
  "events": [
    {
      "eventType": "service" | "accident" | "title_change" | etc.,
      "date": "YYYY-MM-DD or null",
      "mileage": number or null,
      "description": "description exactly as in Carfax",
      "location": "location as in Carfax or null",
      "cost": number or null
    }
  ]
}`

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192, // Increased for longer reports
      temperature: 0, // Deterministic extraction
      system: 'You are a data extraction specialist for Carfax Vehicle History Reports. Extract ALL events accurately and systematically from PDF images. Extract EVERY SINGLE event from ALL pages - do not skip any. Preserve original text exactly as it appears in Carfax. Classify each event by type based on the description. Extract ALL available fields (date, mileage, description, location, cost) - use null if not present. Always return valid JSON only, no additional text or explanation.',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            ...imageBlocks
          ]
        }
      ]
    })

    // Extract JSON from Claude's response
    const responseText = message.content[0].text
    
    // Claude may wrap JSON in markdown code blocks, extract it
    let jsonText = responseText
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }
    
    const parsedData = JSON.parse(jsonText)

    // Validate and clean the data
    if (!parsedData.events || !Array.isArray(parsedData.events)) {
      throw new Error('Claude response did not contain valid events array')
    }

    // Clean and validate each event
    const validEventTypes = [
      'service', 'accident', 'title_change', 'registration', 'inspection',
      'recall', 'warranty', 'auction', 'theft', 'flood_damage',
      'fire_damage', 'structural_damage', 'lien', 'other'
    ]

    const cleanedEvents = parsedData.events.map(event => {
      // Validate eventType
      const eventType = validEventTypes.includes(event.eventType) 
        ? event.eventType 
        : 'other'

      return {
        eventType,
        date: event.date || null,
        mileage: event.mileage ? parseInt(event.mileage) : null,
        description: cleanDescription(event.description || ''),
        location: event.location || null,
        cost: event.cost ? parseFloat(event.cost) : null
      }
    })

    return cleanedEvents
  } catch (error) {
    console.error('Error extracting vehicle history events with Claude Vision:', error)
    throw new Error(`Failed to extract vehicle history events: ${error.message}`)
  }
}

/**
 * Execute the carfax method
 */
export default {
  id: 'carfax',
  name: 'Carfax',
  description: 'Extract all vehicle history events from Carfax PDF reports using Claude 3.5 Sonnet Vision API',
  
  async execute(params) {
    const { vin, pdfPath } = params
    
    if (!pdfPath) {
      throw new Error('pdfPath is required for carfax method')
    }
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`)
    }
    
    try {
      // Convert PDF pages to images
      console.log('Converting PDF pages to images...')
      const images = await pdfToImages(pdfPath)
      console.log(`Converted ${images.length} page(s) to images`)
      
      // Use Claude Vision to extract all vehicle history events
      console.log('Extracting vehicle history events with Claude Vision...')
      const events = await extractVehicleHistoryEvents(images)
      console.log(`Extracted ${events.length} event(s)`)

      return {
        source: 'carfax',
        vin: vin || null,
        events,
        metadata: {
          sourceType: 'pdf',
          sourceFormat: 'carfax',
          totalPages: images.length,
          totalEvents: events.length
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error parsing Carfax PDF:', error)
      
      if (error.message.includes('API key')) {
        throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.')
      }
      
      throw new Error(`Failed to parse Carfax PDF: ${error.message}`)
    }
  }
}

