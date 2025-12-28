import axios from 'axios'

// Use environment variable with fallback to proxy path for development
// In production, use VITE_PROTOTYPE_API_URL, in dev use /api proxy
const API_BASE_URL = import.meta.env.VITE_PROTOTYPE_API_URL || '/api'

// Step 1: Parse PDF and get service history
export const parsePdf = async (pdfFile) => {
  const formData = new FormData()
  formData.append('serviceHistory', pdfFile)

  const response = await axios.post(`${API_BASE_URL}/parse-pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data
}

// Step 2: Get routine maintenance table
export const getRoutineMaintenance = async (vehicleData) => {
  const response = await axios.post(`${API_BASE_URL}/routine-maintenance`, {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    mileage: vehicleData.mileage,
    trim: vehicleData.trim || null,
    engine: vehicleData.engine || null,
    vin: vehicleData.vin || null
  })

  return response.data
}

// Step 3: Get unscheduled maintenance table
export const getUnscheduledMaintenance = async (vehicleData) => {
  const response = await axios.post(`${API_BASE_URL}/unscheduled-maintenance`, {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    mileage: vehicleData.mileage,
    trim: vehicleData.trim || null,
    engine: vehicleData.engine || null,
    vin: vehicleData.vin || null
  })

  return response.data
}

// Analyze service history for expert evaluation
export const analyzeServiceHistory = async (vehicleData, serviceHistory) => {
  const response = await axios.post(`${API_BASE_URL}/analyze-service-history`, {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    mileage: vehicleData.mileage,
    trim: vehicleData.trim || null,
    engine: vehicleData.engine || null,
    vin: vehicleData.vin || null,
    serviceHistory: serviceHistory
  })

  return response.data
}

// Perform maintenance gap analysis
export const performGapAnalysis = async (vehicleData, serviceHistory, routineMaintenance) => {
  const response = await axios.post(`${API_BASE_URL}/maintenance-gap-analysis`, {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    mileage: vehicleData.mileage,
    trim: vehicleData.trim || null,
    engine: vehicleData.engine || null,
    vin: vehicleData.vin || null,
    serviceHistory: serviceHistory,
    routineMaintenance: routineMaintenance
  })

  return response.data
}

// Evaluate risk for unscheduled maintenance items
export const evaluateUnscheduledMaintenanceRisk = async (vehicleData, serviceHistory, serviceHistoryAnalysis, unscheduledMaintenance) => {
  const response = await axios.post(`${API_BASE_URL}/unscheduled-maintenance-risk`, {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    mileage: vehicleData.mileage,
    trim: vehicleData.trim || null,
    engine: vehicleData.engine || null,
    vin: vehicleData.vin || null,
    serviceHistory: serviceHistory,
    serviceHistoryAnalysis: serviceHistoryAnalysis,
    unscheduledMaintenance: unscheduledMaintenance
  })

  return response.data
}

// Portfolio API functions
export const getAllPortfolios = async () => {
  const response = await axios.get(`${API_BASE_URL}/portfolio`)
  return response.data
}

export const getPortfolio = async (portfolioId) => {
  const response = await axios.get(`${API_BASE_URL}/portfolio/${portfolioId}`)
  return response.data
}

export const savePortfolio = async (portfolioData) => {
  const response = await axios.post(`${API_BASE_URL}/portfolio`, portfolioData)
  return response.data
}

export const deletePortfolio = async (portfolioId) => {
  const response = await axios.delete(`${API_BASE_URL}/portfolio/${portfolioId}`)
  return response.data
}

export const deletePortfolioField = async (portfolioId, fieldName) => {
  const response = await axios.delete(`${API_BASE_URL}/portfolio/${portfolioId}/field/${fieldName}`)
  return response.data
}

// Get market valuation for a vehicle
export const getMarketValuation = async (vehicleData) => {
  const response = await axios.post(`${API_BASE_URL}/market-valuation`, {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    mileage: vehicleData.mileage,
    trim: vehicleData.trim || null,
    engine: vehicleData.engine || null,
    vin: vehicleData.vin || null
  })

  return response.data
}

// Calculate total cost of ownership
export const calculateTotalCostOfOwnership = async (vehicleData, tcoParams) => {
  // Build request body, only including fields that have values
  const requestBody = {
    make: vehicleData.make,
    model: vehicleData.model,
    year: vehicleData.year,
    mileage: vehicleData.mileage,
    purchasePrice: tcoParams.purchasePrice,
    timePeriodYears: tcoParams.timePeriodYears,
    milesPerYear: tcoParams.milesPerYear
  }

  // Add optional fields only if they exist
  if (vehicleData.trim) requestBody.trim = vehicleData.trim
  if (vehicleData.engine) requestBody.engine = vehicleData.engine
  if (vehicleData.vin) requestBody.vin = vehicleData.vin
  if (tcoParams.gapAnalysis) requestBody.gapAnalysis = tcoParams.gapAnalysis
  if (tcoParams.riskEvaluation) requestBody.riskEvaluation = tcoParams.riskEvaluation
  if (tcoParams.serviceHistoryAnalysis) requestBody.serviceHistoryAnalysis = tcoParams.serviceHistoryAnalysis
  if (tcoParams.routineMaintenance && Array.isArray(tcoParams.routineMaintenance) && tcoParams.routineMaintenance.length > 0) {
    requestBody.routineMaintenance = tcoParams.routineMaintenance
  }
  if (tcoParams.marketValuation) requestBody.marketValuation = tcoParams.marketValuation

  const response = await axios.post(`${API_BASE_URL}/total-cost-of-ownership`, requestBody, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  return response.data
}

