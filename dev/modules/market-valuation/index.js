/**
 * MODULE: MARKET VALUATION
 * 
 * Purpose: Determine market value of vehicles
 * 
 * This module calculates the current market value of vehicles based on
 * make, model, year, mileage, condition, and market data.
 */

import { ModuleBase } from '../../framework/module-base.js'
import { Validator } from '../../framework/validator.js'

export class MarketValuationModule extends ModuleBase {
  constructor() {
    super({
      id: 'market-valuation',
      name: 'Market Valuation',
      description: 'Determine market value of vehicles',
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

    const vehicleValidation = Validator.validateVehicleData(params.vehicle || {})
    if (!vehicleValidation.valid) {
      errors.push(...vehicleValidation.errors)
    }

    if (params.condition && !['excellent', 'good', 'fair', 'poor'].includes(params.condition)) {
      errors.push('condition must be one of: excellent, good, fair, poor')
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
    const { serviceId, vehicle, condition, ...serviceParams } = params

    if (serviceId) {
      const service = this.services.get(serviceId)
      if (!service) {
        throw new Error(`Service '${serviceId}' not found`)
      }
      return await service.execute({ vehicle, condition, ...serviceParams })
    }

    const results = []
    for (const [id, service] of this.services) {
      try {
        const result = await service.execute({ vehicle, condition, ...serviceParams })
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
      vehicle,
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
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        mileage: 50000
      },
      condition: 'good',
      testCases: [
        {
          name: 'Basic market valuation',
          input: {
            vehicle: { make: 'Honda', model: 'Civic', year: 2020, mileage: 50000 },
            condition: 'good'
          }
        }
      ]
    }
  }
}

