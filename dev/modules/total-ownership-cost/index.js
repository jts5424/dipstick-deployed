/**
 * MODULE: TOTAL OWNERSHIP COST
 * 
 * Purpose: Calculate total cost of ownership for vehicles
 * 
 * This module calculates the total cost of ownership including purchase price,
 * maintenance, repairs, insurance, depreciation, and other ownership costs.
 */

import { ModuleBase } from '../../framework/module-base.js'
import { Validator } from '../../framework/validator.js'

export class TotalOwnershipCostModule extends ModuleBase {
  constructor() {
    super({
      id: 'total-ownership-cost',
      name: 'Total Ownership Cost',
      description: 'Calculate total cost of ownership for vehicles',
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

    if (params.purchasePrice !== undefined && (typeof params.purchasePrice !== 'number' || params.purchasePrice < 0)) {
      errors.push('purchasePrice must be a non-negative number')
    }

    if (params.ownershipPeriod && (typeof params.ownershipPeriod !== 'number' || params.ownershipPeriod <= 0)) {
      errors.push('ownershipPeriod must be a positive number (years)')
    }

    if (params.serviceHistory && !Array.isArray(params.serviceHistory)) {
      errors.push('serviceHistory must be an array')
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
    const { serviceId, vehicle, purchasePrice, ownershipPeriod, serviceHistory, ...serviceParams } = params

    if (serviceId) {
      const service = this.services.get(serviceId)
      if (!service) {
        throw new Error(`Service '${serviceId}' not found`)
      }
      return await service.execute({ vehicle, purchasePrice, ownershipPeriod, serviceHistory, ...serviceParams })
    }

    const results = []
    for (const [id, service] of this.services) {
      try {
        const result = await service.execute({ vehicle, purchasePrice, ownershipPeriod, serviceHistory, ...serviceParams })
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
      purchasePrice: 25000,
      ownershipPeriod: 5,
      serviceHistory: [],
      testCases: [
        {
          name: 'Basic total ownership cost',
          input: {
            vehicle: { make: 'Honda', model: 'Civic', year: 2020, mileage: 50000 },
            purchasePrice: 25000,
            ownershipPeriod: 5,
            serviceHistory: []
          }
        }
      ]
    }
  }
}

