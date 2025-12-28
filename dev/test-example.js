/**
 * Example: Testing the three-tier structure
 * 
 * Module -> Service -> Method
 */

import module from './modules/vehicle-history-events/setup.js'

async function test() {
  console.log('=== Module Info ===')
  console.log(module.getInfo())
  console.log('\n=== Available Services ===')
  console.log(module.getAvailableServices())
  
  console.log('\n=== Executing Module ===')
  console.log('(This will execute ALL services)')
  
  const result = await module.execute({
    vin: 'TESTVIN12345678901',
    serviceConfig: {
      'maintenance-records': {
        methodId: 'carfax-report',
        pdfPath: '/path/to/carfax.pdf'
      }
    }
  })
  
  console.log('\n=== Result ===')
  console.log(JSON.stringify(result, null, 2))
}

test().catch(console.error)

