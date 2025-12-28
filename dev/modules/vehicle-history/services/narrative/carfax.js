/**
 * METHOD: Carfax
 * 
 * Analyzes Carfax reports and generates a narrative summary with expert perspective.
 * Uses extracted events table + full PDF for additional context.
 */

import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from 'canvas'

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
    const viewport = page.getViewport({ scale: 2.0 })
    
    const canvas = createCanvas(viewport.width, viewport.height)
    const context = canvas.getContext('2d')
    
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise
    
    const imageData = canvas.toDataURL('image/png')
    const base64Data = imageData.split(',')[1]
    
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
 * Generate narrative summary from extracted events + additional Carfax PDF context
 */
async function generateNarrative(events, images) {
  const client = getClaudeClient()
  
  const eventsJson = JSON.stringify(events, null, 2)
  
  const imageBlocks = images.map(img => ({
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/png',
      data: img.base64
    }
  }))
  
  const prompt = `You are an expert automotive analyst with deep knowledge of vehicle history reports, maintenance patterns, and used car evaluation.

You have been provided with:
1. **Extracted Vehicle History Events**: A structured table of all events extracted from the Carfax report (dates, mileage, descriptions, locations, costs, event types)
2. **Full Carfax PDF**: The complete Carfax report pages

Your task:
- Use the extracted events table as your PRIMARY source of structured event data
- Use the Carfax PDF to find ADDITIONAL context and information NOT captured in the extracted events table, such as:
  - Vehicle overview/summary sections
  - Ownership history summaries
  - Title status information
  - Overall report summaries or highlights
  - Any contextual information that provides additional insight beyond the individual events

Provide an expert overview of what this Carfax tells you about the vehicle, combining both the structured events and the additional context from the full report.

Provide:

1. **Overview**: A concise expert overview (2-4 sentences) of what the Carfax reveals about this vehicle - what stands out, what's notable, what an expert would notice
2. **Expert Analysis**: Your professional assessment including:
   - Overall vehicle condition indicators
   - Maintenance history quality
   - Red flags or concerns
   - Positive indicators
   - Risk factors
   - Value impact considerations

Write from the perspective of an experienced automotive expert. Be direct, honest, and practical. Focus on what matters for evaluating this vehicle.

Extracted Vehicle History Events:
${eventsJson}

Return your analysis as a JSON object with this structure:
{
  "overview": "Concise expert overview of what the Carfax reveals",
  "expertAnalysis": {
    "overallCondition": "Assessment of overall condition indicators",
    "maintenanceQuality": "Evaluation of maintenance history quality",
    "redFlags": ["List of red flags or concerns"],
    "positiveIndicators": ["List of positive indicators"],
    "riskFactors": ["List of risk factors"],
    "valueImpact": "Assessment of how history impacts vehicle value"
  }
}`

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.3,
      system: 'You are an expert automotive analyst providing professional vehicle history analysis. Write clearly, honestly, and helpfully. Focus on actionable insights for someone evaluating a used vehicle purchase. Use the extracted events as primary data, and the PDF to find additional context not in the events table.',
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

    const responseText = message.content[0].text
    
    // Extract JSON from response
    let jsonText = responseText
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/```\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }
    
    return JSON.parse(jsonText)
  } catch (error) {
    console.error('Error generating narrative:', error)
    throw new Error(`Failed to generate narrative: ${error.message}`)
  }
}

/**
 * Execute the carfax method
 */
export default {
  id: 'carfax',
  name: 'Carfax',
  description: 'Generate expert narrative summary and analysis of Carfax vehicle history reports',
  
  async execute(params) {
    const { vin, pdfPath, events } = params
    
    if (!events || !Array.isArray(events)) {
      throw new Error('events array is required for carfax method')
    }
    
    if (!pdfPath) {
      throw new Error('pdfPath is required for carfax method')
    }
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`)
    }
    
    try {
      // Convert PDF to images for additional context
      console.log('Converting PDF pages to images...')
      const images = await pdfToImages(pdfPath)
      console.log(`Converted ${images.length} page(s) to images`)
      
      // Generate narrative using extracted events + PDF for additional context
      console.log(`Generating expert narrative from ${events.length} extracted events + Carfax PDF context...`)
      const narrative = await generateNarrative(events, images)

      return {
        source: 'carfax',
        vin: vin || null,
        narrative,
        metadata: {
          generatedAt: new Date().toISOString(),
          sourceType: 'events_and_pdf',
          totalEvents: events.length,
          totalPages: images.length
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error generating history narrative:', error)
      
      if (error.message.includes('API key')) {
        throw new Error('Anthropic API key not configured. Please set ANTHROPIC_API_KEY environment variable.')
      }
      
      throw new Error(`Failed to generate history narrative: ${error.message}`)
    }
  }
}

