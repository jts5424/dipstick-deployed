/**
 * SERVICE: Narrative
 * 
 * Service for generating expert narrative analysis from vehicle history.
 * This service can be executed using different methods:
 * - carfax (generate narrative from Carfax PDF + extracted events)
 */

import { ServiceBase } from '../../../../framework/service-base.js'
import carfaxMethod from './carfax.js'

// Create the service
const narrativeService = new ServiceBase({
  id: 'narrative',
  name: 'History Narrative',
  description: 'Generate expert narrative analysis from vehicle history reports'
})

// Register methods
narrativeService.registerMethod(carfaxMethod)

export default narrativeService

