import pdfParse from 'pdf-parse'
import fs from 'fs'
import { parsePDFWithAI } from './aiPdfParser.js'

/**
 * Parse service history PDF
 * Uses AI parsing if OpenAI API key is configured, otherwise falls back to basic parsing
 */
export async function parseServiceHistory(pdfPath) {
  try {
    // Debug: Check if API key is available
    const hasApiKey = !!process.env.OPENAI_API_KEY
    console.log('OpenAI API Key check:', hasApiKey ? 'Found' : 'Not found')
    if (hasApiKey) {
      console.log('API Key starts with:', process.env.OPENAI_API_KEY.substring(0, 7) + '...')
    }
    
    // Try AI parsing first if API key is available
    if (process.env.OPENAI_API_KEY) {
      try {
        console.log('Using AI to parse PDF...')
        const result = await parsePDFWithAI(pdfPath)
        // Clean up uploaded file
        fs.unlinkSync(pdfPath)
        return result
      } catch (aiError) {
        console.warn('AI parsing failed, falling back to basic parsing:', aiError.message)
        // Fall through to basic parsing
      }
    }

    // Fallback to basic parsing
    console.log('Using basic PDF parsing...')
    const dataBuffer = fs.readFileSync(pdfPath)
    const data = await pdfParse(dataBuffer)
    
    // Extract text from PDF
    const text = data.text
    
    // Basic parsing - this will need to be enhanced based on actual PDF formats
    // For now, return structured data that can be improved
    const serviceRecords = parseServiceRecords(text)
    
    // Clean up uploaded file
    fs.unlinkSync(pdfPath)
    
    // Sort records by date (oldest first - ascending)
    const sortedRecords = sortRecordsByDate(serviceRecords)
    
    return {
      rawText: text,
      vehicleInfo: {
        make: null,
        model: null,
        year: null,
        trim: null,
        engine: null,
        vin: null
      },
      records: sortedRecords,
      metadata: {}
    }
  } catch (error) {
    console.error('Error parsing PDF:', error)
    // Clean up file even on error
    try {
      if (fs.existsSync(pdfPath)) {
        fs.unlinkSync(pdfPath)
      }
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw new Error(`Failed to parse service history PDF: ${error.message}`)
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

function parseServiceRecords(text) {
  // Placeholder parsing logic
  // This will need to be enhanced to handle various PDF formats
  // Look for dates, mileage, and service descriptions
  
  const records = []
  const lines = text.split('\n')
  
  // Basic pattern matching (will be improved)
  let currentRecord = null
  
  for (const line of lines) {
    // Look for date patterns (MM/DD/YYYY, DD-MM-YYYY, etc.)
    const dateMatch = line.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/)
    // Look for mileage patterns
    const mileageMatch = line.match(/(\d{1,3}(?:,\d{3})*)\s*(?:miles|mi|mileage)/i)
    
    if (dateMatch || mileageMatch) {
      if (currentRecord) {
        records.push(currentRecord)
      }
      currentRecord = {
        date: dateMatch ? dateMatch[1] : null,
        mileage: mileageMatch ? parseInt(mileageMatch[1].replace(/,/g, '')) : null,
        description: line.trim()
      }
    } else if (currentRecord && line.trim()) {
      currentRecord.description += ' ' + line.trim()
    }
  }
  
  if (currentRecord) {
    records.push(currentRecord)
  }
  
  return records
}

