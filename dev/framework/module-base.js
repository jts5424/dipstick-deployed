/**
 * Base Module Class
 * 
 * Three-tier hierarchy:
 * 1. Module = A capability (e.g., "Vehicle History Events")
 * 2. Service = A piece/aspect of the module (e.g., "maintenance-records", "title-changes")
 * 3. Method = Ways to execute a service (e.g., "carfax-report", "vehicle-databases-api")
 * 
 * To execute a module, ALL services must be completed.
 * Each service can be executed using different methods.
 */

export class ModuleBase {
  constructor(config) {
    this.id = config.id
    this.name = config.name
    this.description = config.description
    this.version = config.version || '1.0.0'
    this.status = config.status || 'active'
    
    // Services are pieces/aspects of this module
    // Each service has multiple methods for execution
    this.services = new Map()
  }

  /**
   * Get module metadata
   */
  getInfo() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      version: this.version,
      status: this.status
    }
  }

  /**
   * Register a service for this module
   * Services are pieces/aspects of the module
   */
  registerService(service) {
    this.services.set(service.id, service)
  }

  /**
   * Get available services
   */
  getAvailableServices() {
    return Array.from(this.services.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description,
      availableMethods: s.getAvailableMethods ? s.getAvailableMethods() : []
    }))
  }

  /**
   * Validate input parameters
   * Override in child classes
   */
  validateInput(params) {
    return { valid: true, errors: [] }
  }

  /**
   * Get test data for this module
   * Override in child classes
   */
  getTestData() {
    return null
  }

  /**
   * Execute the module
   * 
   * Executes ALL services for this module.
   * Each service can specify which method to use via serviceConfig.
   * 
   * @param {Object} params - Module parameters
   * @param {Object} params.serviceConfig - Optional config per service: { "service-id": { methodId: "method-id" } }
   * @returns {Promise} Results from all services
   */
  async execute(params) {
    const { serviceConfig = {}, ...moduleParams } = params
    
    // Execute all services - all must complete for module to complete
    const serviceResults = []
    
    for (const [serviceId, service] of this.services) {
      const config = serviceConfig[serviceId] || {}
      const result = await service.execute({
        ...moduleParams,
        ...config
      })
      
      serviceResults.push({
        serviceId,
        serviceName: service.name,
        success: true,
        data: result
      })
    }
    
    return {
      moduleId: this.id,
      services: serviceResults,
      totalServices: serviceResults.length,
      successful: serviceResults.filter(r => r.success).length
    }
  }
}
