/**
 * Module Registry
 * 
 * Central registry for all modules and their services.
 * This provides a single entry point to access and manage all modules.
 */

import { VehicleHistoryModule } from './vehicle-history/index.js'
import { RoutineMaintenanceScheduleModule } from './routine-maintenance-schedule/index.js'
import { UnscheduledRepairsModule } from './unscheduled-repairs/index.js'
import { MaintenanceGapAnalysisModule } from './maintenance-gap-analysis/index.js'
import { FutureRepairOutlookModule } from './future-repair-outlook/index.js'
import { MarketValuationModule } from './market-valuation/index.js'
import { TotalOwnershipCostModule } from './total-ownership-cost/index.js'
import { ComparatorModule } from './comparator/index.js'

/**
 * Module Registry Class
 */
export class ModuleRegistry {
  constructor() {
    this.modules = new Map()

    // Initialize all modules
    this.registerModule(new VehicleHistoryModule())
    this.registerModule(new RoutineMaintenanceScheduleModule())
    this.registerModule(new UnscheduledRepairsModule())
    this.registerModule(new MaintenanceGapAnalysisModule())
    this.registerModule(new FutureRepairOutlookModule())
    this.registerModule(new MarketValuationModule())
    this.registerModule(new TotalOwnershipCostModule())
    this.registerModule(new ComparatorModule())
  }

  /**
   * Register a module
   */
  registerModule(module) {
    this.modules.set(module.id, module)
  }

  /**
   * Get a module by ID
   */
  getModule(moduleId) {
    return this.modules.get(moduleId)
  }

  /**
   * Get all modules
   */
  getAllModules() {
    return Array.from(this.modules.values())
  }

  /**
   * Get module info (metadata only)
   */
  getModuleInfo(moduleId) {
    const module = this.modules.get(moduleId)
    if (!module) return null

    return {
      ...module.getInfo(),
      availableServices: module.getAvailableServices()
    }
  }

  /**
   * Get all modules info
   */
  getAllModulesInfo() {
    return this.getAllModules().map(module => ({
      ...module.getInfo(),
      availableServices: module.getAvailableServices()
    }))
  }

  /**
   * Register a service to a module
   */
  registerService(moduleId, service) {
    const module = this.modules.get(moduleId)
    if (!module) {
      throw new Error(`Module '${moduleId}' not found`)
    }
    module.registerService(service)
  }

  /**
   * Execute a module
   */
  async executeModule(moduleId, params) {
    const module = this.modules.get(moduleId)
    if (!module) {
      throw new Error(`Module '${moduleId}' not found`)
    }
    return await module.execute(params)
  }

  /**
   * Compare methods for a service within a module
   * Uses TestRunner to compare different methods for the same service
   */
  async compareModuleServiceMethods(moduleId, serviceId, methodIds, params) {
    const module = this.modules.get(moduleId)
    if (!module) {
      throw new Error(`Module '${moduleId}' not found`)
    }
    
    const service = module.services.get(serviceId)
    if (!service) {
      throw new Error(`Service '${serviceId}' not found in module '${moduleId}'`)
    }
    
    // Use TestRunner to compare methods
    const { TestRunner } = await import('../framework/test-runner.js')
    const testRunner = new TestRunner()
    return await testRunner.compareServiceMethods(service, methodIds, params)
  }
}

// Create and export a singleton instance
export const moduleRegistry = new ModuleRegistry()

// Export individual module classes for direct use if needed
export {
  VehicleHistoryModule,
  RoutineMaintenanceScheduleModule,
  UnscheduledRepairsModule,
  MaintenanceGapAnalysisModule,
  FutureRepairOutlookModule,
  MarketValuationModule,
  TotalOwnershipCostModule,
  ComparatorModule
}

