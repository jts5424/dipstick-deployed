/**
 * Shared utilities for Carfax services
 */

import fs from 'fs'
import Anthropic from '@anthropic-ai/sdk'
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs'
import { createCanvas } from 'canvas'

/**
 * Get Claude client
 */
export function getClaudeClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is required')
  }
  
  return new Anthropic({ apiKey })
}

/**
 * Convert PDF pages to base64-encoded images
 */
export async function pdfToImages(pdfPath) {
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
export function cleanDescription(description) {
  if (!description) return ''
  
  // Only normalize excessive whitespace, preserve everything else
  return description.trim().replace(/\s+/g, ' ')
}

