/**
 * SERVICE: Events
 * 
 * Service for extracting vehicle history events from various sources.
 * This service can be executed using different methods:
 * - carfax (extract from Carfax PDF using Claude Vision)
 * - vehicle-databases-api (fetch from Vehicle Databases API)
 * - carfax-pdf (backup method using backend service)
 */

import { ServiceBase } from '../../../../framework/service-base.js'
import carfaxMethod from './carfax.js'
import vehicleDatabasesMethod from './vehicle-databases-api.js'
import carfaxPdfMethod from './carfax-pdf.js'

// Create the service
const eventsService = new ServiceBase({
  id: 'events',
  name: 'Vehicle History Events',
  description: 'Extract vehicle history events from various sources'
})

// Register methods
eventsService.registerMethod(carfaxMethod)
eventsService.registerMethod(vehicleDatabasesMethod)
eventsService.registerMethod(carfaxPdfMethod)

export default eventsService

