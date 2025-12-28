/**
 * Vehicle History Module Tests
 * 
 * Isolated test suite for Vehicle History module
 */

import { ModuleTestRunner } from '../../framework/test-runner.js'
import vehicleHistoryModule from './setup.js'

// Test cases
const testCases = [
  {
    name: 'Get module info',
    input: { action: 'getInfo' },
    expected: { id: 'vehicle-history' }
  },
  {
    name: 'Get available services',
    input: { action: 'getServices' },
    expected: { services: 2 } // Should have 2 services (events, narrative)
  },
  {
    name: 'Execute module with events service',
    input: {
      serviceConfig: {
        events: { methodId: 'carfax' },
        narrative: { methodId: 'carfax' }
      },
      vin: 'TESTVIN12345678901',
      pdfPath: '/path/to/test.pdf',
      events: [] // Mock events for narrative
    },
    expected: { totalServices: 2 }
  }
]

// Run tests
async function runTests() {
  console.log('🧪 Running Vehicle History Module Tests...\n')
  
  const runner = new ModuleTestRunner(vehicleHistoryModule)
  const results = await runner.runTests(testCases)
  const summary = runner.getSummary(results)
  
  console.log('Test Results:')
  console.log(`  Total: ${summary.total}`)
  console.log(`  Passed: ${summary.passed}`)
  console.log(`  Failed: ${summary.failed}`)
  console.log(`  Success Rate: ${summary.successRate.toFixed(1)}%`)
  console.log(`  Avg Time: ${summary.averageExecutionTime.toFixed(2)}ms\n`)
  
  results.forEach(result => {
    const status = result.success ? '✓' : '✗'
    console.log(`${status} ${result.name}`)
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`)
    }
  })
  
  return summary
}

// Export for use in test runner
export { vehicleHistoryModule, testCases, runTests }

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error)
}


