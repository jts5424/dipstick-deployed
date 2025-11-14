import axios from 'axios'

// Use environment variable with fallback to proxy path for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

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

