/**
 * MODULE: COMPARATOR
 * 
 * Purpose: Compare multiple vehicles side-by-side
 * 
 * This module allows users to compare multiple vehicles across various
 * metrics including cost, maintenance, reliability, and value.
 */

import { ModuleBase } from '../../framework/module-base.js'
import { Validator } from '../../framework/validator.js'

export class ComparatorModule extends ModuleBase {
  constructor() {
    super({
      id: 'comparator',
      name: 'Vehicle Comparator',
      description: 'Compare multiple vehicles side-by-side',
      version: '1.0.0',
      status: 'active'
    })

    this.services = new Map()
  }

  registerService(service) {
    this.services.set(service.id, service)
  }

  getAvailableServices() {
    return Array.from(this.services.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      requirements: s.requirements || {}
    }))
  }

  validateInput(params) {
    const errors = []

    if (!params.vehicles || !Array.isArray(params.vehicles)) {
      errors.push('vehicles must be an array')
    } else if (params.vehicles.length < 2) {
      errors.push('At least 2 vehicles are required for comparison')
    } else {
      params.vehicles.forEach((vehicle, index) => {
        const vehicleValidation = Validator.validateVehicleData(vehicle)
        if (!vehicleValidation.valid) {
          errors.push(`Vehicle ${index + 1}: ${vehicleValidation.errors.join(', ')}`)
        }
      })
    }

    if (params.comparisonMetrics && !Array.isArray(params.comparisonMetrics)) {
      errors.push('comparisonMetrics must be an array')
    }

    if (params.serviceId) {
      const service = this.services.get(params.serviceId)
      if (!service) {
        errors.push(`Service '${params.serviceId}' not found`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  async execute(params) {
    const { serviceId, vehicles, comparisonMetrics, ...serviceParams } = params

    if (serviceId) {
      const service = this.services.get(serviceId)
      if (!service) {
        throw new Error(`Service '${serviceId}' not found`)
      }
      return await service.execute({ vehicles, comparisonMetrics, ...serviceParams })
    }

    const results = []
    for (const [id, service] of this.services) {
      try {
        const result = await service.execute({ vehicles, comparisonMetrics, ...serviceParams })
        results.push({
          serviceId: id,
          serviceName: service.name,
          success: true,
          data: result
        })
      } catch (error) {
        results.push({
          serviceId: id,
          serviceName: service.name,
          success: false,
          error: error.message
        })
      }
    }

    return {
      vehicles,
      results,
      totalServices: results.length,
      successful: results.filter(r => r.success).length
    }
  }

  async compareServices(serviceIds, params) {
    const results = []
    const startTime = Date.now()

    for (const serviceId of serviceIds) {
      const service = this.services.get(serviceId)
      if (!service) {
        results.push({
          serviceId,
          success: false,
          error: `Service '${serviceId}' not found`
        })
        continue
      }

      const serviceStart = Date.now()
      try {
        const data = await service.execute({ ...params })
        results.push({
          serviceId,
          serviceName: service.name,
          success: true,
          executionTime: Date.now() - serviceStart,
          data
        })
      } catch (error) {
        results.push({
          serviceId,
          serviceName: service.name,
          success: false,
          executionTime: Date.now() - serviceStart,
          error: error.message
        })
      }
    }

    return {
      comparison: {
        params,
        services: results,
        totalTime: Date.now() - startTime,
        summary: {
          total: results.length,
          successful: results.filter(r => r.success).length,
          failed: results.filter(r => !r.success).length,
          fastest: results
            .filter(r => r.success)
            .sort((a, b) => a.executionTime - b.executionTime)[0]?.serviceId || null
        }
      }
    }
  }

  getTestData() {
    return {
      vehicles: [
        {
          make: 'Honda',
          model: 'Civic',
          year: 2020,
          mileage: 50000
        },
        {
          make: 'Toyota',
          model: 'Corolla',
          year: 2020,
          mileage: 45000
        }
      ],
      comparisonMetrics: ['cost', 'maintenance', 'reliability'],
      testCases: [
        {
          name: 'Basic vehicle comparison',
          input: {
            vehicles: [
              { make: 'Honda', model: 'Civic', year: 2020, mileage: 50000 },
              { make: 'Toyota', model: 'Corolla', year: 2020, mileage: 45000 }
            ],
            comparisonMetrics: ['cost', 'maintenance', 'reliability']
          }
        }
      ]
    }
  }
}

