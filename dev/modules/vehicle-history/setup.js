/**
 * Setup file for Vehicle History Module
 * 
 * This wires up:
 * - Methods to Services
 * - Services to Module
 */

import { VehicleHistoryModule } from './index.js'
import eventsService from './services/events/index.js'
import narrativeService from './services/narrative/index.js'

// Create the module
const module = new VehicleHistoryModule()

// Register services (ServiceBase instances with methods)
module.registerService(eventsService)
module.registerService(narrativeService)

export default module

