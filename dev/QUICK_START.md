# Quick Start Guide

## Overview

This is a clean, service-based architecture for developing vehicle analysis modules. Each module represents a capability, and each service is a method of executing that capability.

## Structure

```
dev/
├── modules/                    # 8 core modules
│   ├── vehicle-history-events/
│   ├── routine-maintenance-schedule/
│   ├── unscheduled-repairs/
│   ├── maintenance-gap-analysis/
│   ├── future-repair-outlook/
│   ├── market-valuation/
│   ├── total-ownership-cost/
│   └── comparator/
├── framework/                  # Shared utilities
└── examples/                   # Usage examples
```

## Getting Started

### 1. Run Examples

```bash
npm run examples
```

This will demonstrate:
- Executing modules with specific services
- Executing all services for a module
- Comparing multiple services
- Getting module information
- Registering custom services
- Using the comparator module

### 2. Create a Service

Create a new service file in the appropriate module's `services/` directory:

```javascript
// dev/modules/market-valuation/services/kbb-api.js
export default {
  id: 'kbb-api',
  name: 'Kelley Blue Book API',
  description: 'Get market value from KBB API',
  requirements: {
    apiKey: true
  },
  async execute(params) {
    const { vehicle, condition, apiKey } = params
    
    // Your implementation here
    const response = await fetch('https://api.kbb.com/...', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    })
    
    return {
      vehicle,
      condition,
      value: response.value,
      source: 'kbb-api',
      timestamp: new Date().toISOString()
    }
  }
}
```

### 3. Register the Service

Register your service to the module:

```javascript
import { moduleRegistry } from './modules/index.js'
import kbbService from './modules/market-valuation/services/kbb-api.js'

moduleRegistry.registerService('market-valuation', kbbService)
```

### 4. Use the Service

```javascript
import { moduleRegistry } from './modules/index.js'

const result = await moduleRegistry.executeModule('market-valuation', {
  serviceId: 'kbb-api',
  vehicle: {
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    mileage: 50000
  },
  condition: 'good',
  apiKey: 'your-api-key'
})
```

## Module vs Service

**Module**: A capability (e.g., "Market Valuation")
- Has multiple services
- Provides standardized interface
- Handles validation
- Supports service comparison

**Service**: A method of executing a module (e.g., "KBB API", "Edmunds API", "AI-based valuation")
- Implements specific logic
- Can be compared with other services
- Has its own requirements

## Key Concepts

### Service Comparison

Compare different services for the same module:

```javascript
const comparison = await moduleRegistry.compareModuleServices(
  'market-valuation',
  ['kbb-api', 'edmunds-api', 'ai-valuation'],
  { vehicle: {...}, condition: 'good' }
)
```

This returns execution times, success rates, and results from each service.

### Module Registry

The `moduleRegistry` is a singleton that manages all modules:

```javascript
// Get all modules
const allModules = moduleRegistry.getAllModulesInfo()

// Get a specific module
const module = moduleRegistry.getModule('market-valuation')

// Execute a module
const result = await moduleRegistry.executeModule('market-valuation', {...})
```

## Next Steps

1. **Implement real services** - Replace example services with actual implementations
2. **Add tests** - Create tests for each service
3. **Build API endpoints** - Expose modules via API (see `framework/api-server.js`)
4. **Compare services** - Use the comparison feature to evaluate different approaches

## Module Details

### vehicle-history-events
Collects vehicle history events (accidents, ownership changes, service records)

**Input**: `{ vin, serviceId?, ... }`  
**Output**: Vehicle history events

### routine-maintenance-schedule
Generates recommended maintenance schedules

**Input**: `{ vehicle, serviceId?, ... }`  
**Output**: Maintenance schedule

### unscheduled-repairs
Identifies potential unscheduled repairs

**Input**: `{ vehicle, serviceHistory, serviceId?, ... }`  
**Output**: Unscheduled repair forecasts

### maintenance-gap-analysis
Compares recommended vs actual maintenance

**Input**: `{ vehicle, recommendedSchedule, actualServiceHistory, serviceId?, ... }`  
**Output**: Gap analysis results

### future-repair-outlook
Forecasts future repair needs and costs

**Input**: `{ vehicle, serviceHistory, forecastPeriod?, serviceId?, ... }`  
**Output**: Future repair forecast

### market-valuation
Determines market value

**Input**: `{ vehicle, condition?, serviceId?, ... }`  
**Output**: Market valuation

### total-ownership-cost
Calculates total cost of ownership

**Input**: `{ vehicle, purchasePrice?, ownershipPeriod?, serviceHistory?, serviceId?, ... }`  
**Output**: Total ownership cost breakdown

### comparator
Compares multiple vehicles

**Input**: `{ vehicles[], comparisonMetrics?, serviceId?, ... }`  
**Output**: Vehicle comparison results
