/**
 * Development API Server
 * 
 * Lightweight server for testing modules in isolation
 * Exposes all modules from the module registry
 */

import express from 'express'
import cors from 'cors'
import { moduleRegistry } from '../modules/index.js'
import { TestRunner } from './test-runner.js'

const app = express()
const PORT = process.env.PORT || process.env.DEV_PORT || 5001

// Configure CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : '*', // Allow all origins in development if not specified
  credentials: true
}

app.use(cors(corsOptions))
app.use(express.json())

// Get all modules
app.get('/modules', (req, res) => {
  try {
    const modules = moduleRegistry.getAllModulesInfo()
    res.json({ success: true, modules })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get module status (includes services and methods)
app.get('/modules/:moduleId/status', (req, res) => {
  try {
    const { moduleId } = req.params
    const module = moduleRegistry.getModule(moduleId)
    
    if (!module) {
      return res.status(404).json({
        success: false,
        error: `Module '${moduleId}' not found`
      })
    }

    const services = module.getAvailableServices().map(serviceId => {
      const service = module.services.get(serviceId)
      const methods = service ? Array.from(service.methods.values()).map(m => ({
        id: m.id,
        name: m.name,
        description: m.description
      })) : []
      
      return {
        id: serviceId,
        name: service?.name || serviceId,
        description: service?.description || '',
        methods
      }
    })

    res.json({
      success: true,
      module: module.getInfo(),
      services
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get services for a module
app.get('/modules/:moduleId/services', (req, res) => {
  try {
    const { moduleId } = req.params
    const module = moduleRegistry.getModule(moduleId)
    
    if (!module) {
      return res.status(404).json({
        success: false,
        error: `Module '${moduleId}' not found`
      })
    }

    const services = module.getAvailableServices()
    res.json({ success: true, services })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Get methods for a service
app.get('/modules/:moduleId/services/:serviceId/methods', (req, res) => {
  try {
    const { moduleId, serviceId } = req.params
    const module = moduleRegistry.getModule(moduleId)
    
    if (!module) {
      return res.status(404).json({
        success: false,
        error: `Module '${moduleId}' not found`
      })
    }

    const service = module.services.get(serviceId)
    if (!service) {
      return res.status(404).json({
        success: false,
        error: `Service '${serviceId}' not found`
      })
    }

    const methods = Array.from(service.methods.values()).map(m => ({
      id: m.id,
      name: m.name,
      description: m.description
    }))

    res.json({ success: true, methods })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Execute a module
app.post('/modules/:moduleId/execute', async (req, res) => {
  try {
    const { moduleId } = req.params
    const module = moduleRegistry.getModule(moduleId)
    
    if (!module) {
      return res.status(404).json({
        success: false,
        error: `Module '${moduleId}' not found`
      })
    }

    const validation = module.validateInput(req.body)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      })
    }

    const result = await module.execute(req.body)
    res.json({ success: true, result })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Compare methods for a service
app.post('/modules/:moduleId/compare', async (req, res) => {
  try {
    const { moduleId } = req.params
    const { serviceId, methodIds, ...params } = req.body
    
    if (!serviceId) {
      return res.status(400).json({
        success: false,
        error: 'serviceId is required'
      })
    }
    
    if (!methodIds || !Array.isArray(methodIds) || methodIds.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 method IDs required'
      })
    }

    const result = await moduleRegistry.compareModuleServiceMethods(moduleId, serviceId, methodIds, params)
    res.json({ success: true, ...result })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

app.listen(PORT, () => {
  const modules = moduleRegistry.getAllModules()
  console.log(`🚀 Dev API Server running on port ${PORT}`)
  console.log(`   Modules: ${modules.length}`)
  modules.forEach(module => {
    console.log(`   - ${module.id}: ${module.getAvailableServices().length} service(s)`)
  })
})

