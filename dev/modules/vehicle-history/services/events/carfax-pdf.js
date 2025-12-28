/**
 * METHOD: Carfax PDF (Backup)
 * 
 * Parses vehicle history from Carfax PDF reports using backend AI service.
 * This is a backup method that uses the backend aiPdfParser service.
 */

import { parsePDFWithAI } from '../../../../backend/services/aiPdfParser.js'
import fs from 'fs'

export default {
  id: 'carfax-pdf',
  name: 'Carfax PDF Parser (Backup)',
  description: 'Parse vehicle history from Carfax PDF reports using backend AI service',
  
  async execute(params) {
    const { pdfPath, vin } = params
    
    if (!pdfPath) {
      throw new Error('PDF path is required')
    }
    
    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`)
    }
    
    // Use existing AI PDF parser
    const parsedData = await parsePDFWithAI(pdfPath)
    
    // Extract or use provided VIN
    const vehicleVIN = vin || parsedData.vehicleInfo?.vin || null
    
    return {
      source: 'carfax-pdf',
      vin: vehicleVIN,
      vehicleInfo: {
        ...parsedData.vehicleInfo,
        vin: vehicleVIN
      },
      records: parsedData.records || [],
      metadata: {
        ...parsedData.metadata,
        sourceType: 'pdf',
        sourceFormat: 'carfax',
        totalRecords: parsedData.records?.length || 0
      },
      rawText: parsedData.rawText
    }
  }
}


