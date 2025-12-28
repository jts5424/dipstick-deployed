/**
 * MODULE: MAINTENANCE GAP ANALYSIS
 * 
 * Purpose: Analyze gaps between recommended maintenance and actual service history
 * 
 * This module compares the recommended maintenance schedule with actual service
 * history to identify gaps, overdue items, and maintenance risks.
 */

import { ModuleBase } from '../../framework/module-base.js'
import { Validator } from '../../framework/validator.js'

export class MaintenanceGapAnalysisModule extends ModuleBase {
  constructor() {
    super({
      id: 'maintenance-gap-analysis',
      name: 'Maintenance Gap Analysis',
      description: 'Analyze gaps between recommended maintenance and actual service history',
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

    if (!params.recommendedSchedule) {
      errors.push('recommendedSchedule is required')
    }

    if (!params.actualServiceHistory) {
      errors.push('actualServiceHistory is required')
    } else if (!Array.isArray(params.actualServiceHistory)) {
      errors.push('actualServiceHistory must be an array')
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
    const { serviceId, vehicle, recommendedSchedule, actualServiceHistory, ...serviceParams } = params

    if (serviceId) {
      const service = this.services.get(serviceId)
      if (!service) {
        throw new Error(`Service '${serviceId}' not found`)
      }
      return await service.execute({ vehicle, recommendedSchedule, actualServiceHistory, ...serviceParams })
    }

    const results = []
    for (const [id, service] of this.services) {
      try {
        const result = await service.execute({ vehicle, recommendedSchedule, actualServiceHistory, ...serviceParams })
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
      recommendedSchedule: [],
      actualServiceHistory: [],
      testCases: [
        {
          name: 'Basic gap analysis',
          input: {
            vehicle: { make: 'Honda', model: 'Civic', year: 2020, mileage: 50000 },
            recommendedSchedule: [],
            actualServiceHistory: []
          }
        }
      ]
    }
  }
}

