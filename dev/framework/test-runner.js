/**
 * Test Runner Framework
 * 
 * Provides functionality to:
 * 1. Test individual services
 * 2. Compare different methods for the same service
 */

export class TestRunner {
  constructor() {
    this.results = []
  }

  /**
   * Test a service with a specific method
   * 
   * @param {ServiceBase} service - The service to test
   * @param {string} methodId - Which method to use
   * @param {Object} testParams - Parameters for the test
   * @returns {Promise<Object>} Test result
   */
  async testServiceMethod(service, methodId, testParams) {
    const startTime = Date.now()
    
    try {
      const result = await service.execute({
        methodId,
        ...testParams
      })
      
      const executionTime = Date.now() - startTime
      
      return {
        serviceId: service.id,
        methodId,
        success: true,
        executionTime,
        result,
        error: null
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      
      return {
        serviceId: service.id,
        methodId,
        success: false,
        executionTime,
        result: null,
        error: error.message
      }
    }
  }

  /**
   * Compare multiple methods for the same service
   * 
   * This runs the same service with different methods and compares results
   * 
   * @param {ServiceBase} service - The service to test
   * @param {string[]} methodIds - Array of method IDs to compare
   * @param {Object} testParams - Parameters for the test (same for all methods)
   * @returns {Promise<Object>} Comparison results
   */
  async compareServiceMethods(service, methodIds, testParams) {
    const startTime = Date.now()
    const methodResults = []
    
    // Execute each method
    for (const methodId of methodIds) {
      const result = await this.testServiceMethod(service, methodId, testParams)
      methodResults.push(result)
    }
    
    const totalTime = Date.now() - startTime
    
    // Analyze results
    const successful = methodResults.filter(r => r.success)
    const failed = methodResults.filter(r => !r.success)
    
    // Compare results if multiple succeeded
    let comparison = null
    if (successful.length > 1) {
      comparison = this._compareResults(successful.map(r => r.result))
    }
    
    return {
      serviceId: service.id,
      serviceName: service.name,
      methodIds,
      methodResults,
      totalTime,
      summary: {
        total: methodResults.length,
        successful: successful.length,
        failed: failed.length,
        fastest: successful.sort((a, b) => a.executionTime - b.executionTime)[0]?.methodId || null
      },
      comparison
    }
  }

  /**
   * Compare results from different methods
   * Looks for similarities and differences
   * 
   * @private
   */
  _compareResults(results) {
    if (results.length < 2) return null
    
    // Basic comparison - can be extended
    const allKeys = new Set()
    results.forEach(r => {
      if (r && typeof r === 'object') {
        Object.keys(r).forEach(k => allKeys.add(k))
      }
    })
    
    const comparison = {
      commonKeys: Array.from(allKeys),
      differences: [],
      similarities: []
    }
    
    // Check if results have same structure
    const firstResult = results[0]
    const allSameStructure = results.every(r => {
      if (!r || typeof r !== 'object') return false
      return Object.keys(r).every(k => firstResult.hasOwnProperty(k))
    })
    
    comparison.sameStructure = allSameStructure
    
    // Compare values for common keys
    allKeys.forEach(key => {
      const values = results.map(r => r?.[key])
      const allSame = values.every(v => JSON.stringify(v) === JSON.stringify(values[0]))
      
      if (allSame) {
        comparison.similarities.push({ key, value: values[0] })
      } else {
        comparison.differences.push({ 
          key, 
          values: values.map((v, i) => ({ methodIndex: i, value: v }))
        })
      }
    })
    
    return comparison
  }
}

/**
 * Module Test Runner
 * 
 * Provides isolated testing environment for individual modules
 */
export class ModuleTestRunner {
  constructor(module) {
    this.module = module
    this.results = []
  }

  /**
   * Run a single test case
   */
  async runTest(testCase) {
    const startTime = Date.now()
    const result = {
      name: testCase.name,
      input: testCase.input,
      expected: testCase.expected,
      timestamp: new Date().toISOString()
    }

    try {
      // Validate input
      const validation = this.module.validateInput(testCase.input)
      if (!validation.valid) {
        result.success = false
        result.error = `Validation failed: ${validation.errors.join(', ')}`
        result.executionTime = Date.now() - startTime
        return result
      }

      // Execute module
      const output = await this.module.execute(testCase.input)
      result.output = output
      result.executionTime = Date.now() - startTime

      // Validate output (if expected provided)
      if (testCase.expected) {
        result.success = this.validateOutput(output, testCase.expected)
        if (!result.success) {
          result.error = 'Output does not match expected result'
        }
      } else {
        result.success = true
      }

      return result
    } catch (error) {
      result.success = false
      result.error = error.message
      result.executionTime = Date.now() - startTime
      return result
    }
  }

  /**
   * Run all test cases
   */
  async runTests(testCases) {
    const results = []
    for (const testCase of testCases) {
      const result = await this.runTest(testCase)
      results.push(result)
    }
    return results
  }

  /**
   * Validate output against expected result
   */
  validateOutput(output, expected) {
    // Simple validation - can be enhanced
    if (typeof expected === 'object' && typeof output === 'object') {
      return JSON.stringify(output) === JSON.stringify(expected)
    }
    return output === expected
  }

  /**
   * Get test summary
   */
  getSummary(results) {
    const total = results.length
    const passed = results.filter(r => r.success).length
    const failed = total - passed
    const avgTime = results.reduce((sum, r) => sum + r.executionTime, 0) / total

    return {
      total,
      passed,
      failed,
      successRate: (passed / total) * 100,
      averageExecutionTime: avgTime,
      results
    }
  }
}
