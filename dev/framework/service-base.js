/**
 * Base Service Class
 * 
 * Services are pieces/aspects of a module.
 * Each service can be executed using different methods.
 * 
 * Example:
 * - Service: "maintenance-records"
 *   - Method: "carfax-report"
 *   - Method: "vehicle-databases-api"
 */

export class ServiceBase {
  constructor(config) {
    this.id = config.id
    this.name = config.name
    this.description = config.description
    
    // Methods are different ways to execute this service
    this.methods = new Map()
  }

  /**
   * Register a method for this service
   */
  registerMethod(method) {
    this.methods.set(method.id, method)
  }

  /**
   * Get available methods
   */
  getAvailableMethods() {
    return Array.from(this.methods.values()).map(m => ({
      id: m.id,
      name: m.name,
      description: m.description
    }))
  }

  /**
   * Execute the service using a specific method
   * 
   * @param {Object} params - Service parameters including methodId
   * @param {string} params.methodId - Which method to use for execution
   * @returns {Promise} Result from the method execution
   */
  async execute(params) {
    const { methodId, ...methodParams } = params
    
    if (!methodId) {
      throw new Error(`methodId is required for service '${this.id}'`)
    }
    
    const method = this.methods.get(methodId)
    if (!method) {
      throw new Error(`Method '${methodId}' not found in service '${this.id}'`)
    }
    
    // Execute the method
    return await method.execute(methodParams)
  }
}

