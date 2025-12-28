/**
 * Basic Usage Examples
 * 
 * This file demonstrates how to use the module system
 */

import { moduleRegistry } from '../modules/index.js'

/**
 * Example 1: Execute a module with a specific service
 */
async function example1_executeWithService() {
  console.log('\n=== Example 1: Execute with specific service ===')
  
  try {
    const result = await moduleRegistry.executeModule('market-valuation', {
      serviceId: 'example-service',
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        mileage: 50000
      },
      condition: 'good'
    })
    
    console.log('Result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

/**
 * Example 2: Execute all services for a module
 */
async function example2_executeAllServices() {
  console.log('\n=== Example 2: Execute all services ===')
  
  try {
    const result = await moduleRegistry.executeModule('market-valuation', {
      vehicle: {
        make: 'Honda',
        model: 'Civic',
        year: 2020,
        mileage: 50000
      },
      condition: 'good'
    })
    
    console.log(`Executed ${result.totalServices} services`)
    console.log(`Successful: ${result.successful}`)
    console.log('Results:', JSON.stringify(result.results, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

/**
 * Example 3: Compare multiple services
 */
async function example3_compareServices() {
  console.log('\n=== Example 3: Compare services ===')
  
  try {
    const comparison = await moduleRegistry.compareModuleServices(
      'market-valuation',
      ['example-service'], // Add more service IDs as you create them
      {
        vehicle: {
          make: 'Honda',
          model: 'Civic',
          year: 2020,
          mileage: 50000
        },
        condition: 'good'
      }
    )
    
    console.log('Comparison Summary:', comparison.comparison.summary)
    console.log('Total Time:', comparison.comparison.totalTime, 'ms')
    console.log('Results:', JSON.stringify(comparison.comparison.services, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

/**
 * Example 4: Get module information
 */
async function example4_getModuleInfo() {
  console.log('\n=== Example 4: Get module information ===')
  
  // Get info about a specific module
  const moduleInfo = moduleRegistry.getModuleInfo('market-valuation')
  console.log('Market Valuation Module:', JSON.stringify(moduleInfo, null, 2))
  
  // Get info about all modules
  const allModules = moduleRegistry.getAllModulesInfo()
  console.log('\nAll Modules:')
  allModules.forEach(module => {
    console.log(`  - ${module.name} (${module.id}): ${module.description}`)
    console.log(`    Available services: ${module.availableServices.length}`)
  })
}

/**
 * Example 5: Register a custom service
 */
async function example5_registerService() {
  console.log('\n=== Example 5: Register custom service ===')
  
  // Create a custom service
  const customService = {
    id: 'custom-valuation',
    name: 'Custom Valuation Service',
    description: 'A custom market valuation implementation',
    requirements: {
      apiKey: false
    },
    async execute(params) {
      const { vehicle, condition } = params
      
      // Simple mock implementation
      return {
        vehicle,
        condition: condition || 'good',
        value: 20000,
        valueRange: { min: 18000, max: 22000 },
        source: 'custom-valuation',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  // Register it
  moduleRegistry.registerService('market-valuation', customService)
  
  // Now use it
  const result = await moduleRegistry.executeModule('market-valuation', {
    serviceId: 'custom-valuation',
    vehicle: {
      make: 'Honda',
      model: 'Civic',
      year: 2020,
      mileage: 50000
    },
    condition: 'good'
  })
  
  console.log('Custom service result:', JSON.stringify(result, null, 2))
}

/**
 * Example 6: Use comparator module
 */
async function example6_comparator() {
  console.log('\n=== Example 6: Compare vehicles ===')
  
  try {
    const result = await moduleRegistry.executeModule('comparator', {
      serviceId: 'example-service',
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
      comparisonMetrics: ['cost', 'maintenance', 'reliability']
    })
    
    console.log('Comparison result:', JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('Error:', error.message)
  }
}

// Run all examples
async function runExamples() {
  console.log('=== Module System Examples ===\n')
  
  await example4_getModuleInfo()
  await example1_executeWithService()
  await example2_executeAllServices()
  await example3_compareServices()
  await example5_registerService()
  await example6_comparator()
  
  console.log('\n=== Examples Complete ===')
}

// Run if this file is executed directly
if (import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  runExamples().catch(console.error)
} else {
  // Also run if called directly (for testing)
  const isMainModule = import.meta.url.includes('basic-usage.js')
  if (isMainModule) {
    runExamples().catch(console.error)
  }
}

export {
  example1_executeWithService,
  example2_executeAllServices,
  example3_compareServices,
  example4_getModuleInfo,
  example5_registerService,
  example6_comparator
}

