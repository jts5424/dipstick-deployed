import axios from 'axios'

// Use environment variable with fallback to proxy path for development
const API_BASE_URL = import.meta.env.VITE_DEV_API_URL || '/dev-api'

// Get all modules
export const getModules = async () => {
  const response = await axios.get(`${API_BASE_URL}/modules`)
  return response.data
}

// Get module status
export const getModuleStatus = async (moduleId) => {
  const response = await axios.get(`${API_BASE_URL}/modules/${moduleId}/status`)
  return response.data
}

// Execute a module
export const executeModule = async (moduleId, params) => {
  const response = await axios.post(`${API_BASE_URL}/modules/${moduleId}/execute`, params)
  return response.data
}

// Compare service methods
export const compareMethods = async (moduleId, serviceId, methodIds, params) => {
  const response = await axios.post(`${API_BASE_URL}/modules/${moduleId}/compare`, {
    serviceId,
    methodIds,
    ...params
  })
  return response.data
}

// Get available services for a module
export const getModuleServices = async (moduleId) => {
  const response = await axios.get(`${API_BASE_URL}/modules/${moduleId}/services`)
  return response.data
}

// Get available methods for a service
export const getServiceMethods = async (moduleId, serviceId) => {
  const response = await axios.get(`${API_BASE_URL}/modules/${moduleId}/services/${serviceId}/methods`)
  return response.data
}


