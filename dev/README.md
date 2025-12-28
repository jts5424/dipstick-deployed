# Development Framework

Clean, isolated development environment for building and testing individual modules.

## Architecture

This framework is built around **modules** and **services**:

- **Modules**: High-level capabilities (e.g., "Vehicle History Events", "Market Valuation")
- **Services**: Individual methods/implementations for executing a module (e.g., "Carfax API", "KBB API", "AI-based valuation")

Each module can have multiple services, allowing you to compare different approaches to solving the same problem.

## Module Structure

```
dev/
├── modules/                    # All modules
│   ├── vehicle-history-events/
│   │   ├── index.js           # Module class
│   │   └── services/          # Service implementations
│   │       └── example-service.js
│   ├── routine-maintenance-schedule/
│   ├── unscheduled-repairs/
│   ├── maintenance-gap-analysis/
│   ├── future-repair-outlook/
│   ├── market-valuation/
│   ├── total-ownership-cost/
│   └── comparator/
├── framework/                  # Shared framework utilities
│   ├── module-base.js         # Base class for all modules
│   ├── validator.js           # Data validation utilities
│   ├── test-runner.js         # Module testing framework
│   └── api-server.js          # API server for testing
└── modules/index.js           # Module registry
```

## Available Modules

1. **vehicle-history-events** - Collect and aggregate vehicle history events
2. **routine-maintenance-schedule** - Generate routine maintenance schedules
3. **unscheduled-repairs** - Identify and forecast unscheduled repairs
4. **maintenance-gap-analysis** - Analyze gaps between recommended and actual maintenance
5. **future-repair-outlook** - Forecast future repair needs and costs
6. **market-valuation** - Determine market value of vehicles
7. **total-ownership-cost** - Calculate total cost of ownership
8. **comparator** - Compare multiple vehicles side-by-side

## Usage

### Basic Module Execution

```javascript
import { moduleRegistry } from './modules/index.js'

// Execute a module with a specific service
const result = await moduleRegistry.executeModule('market-valuation', {
  serviceId: 'kbb-api',
  vehicle: {
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    mileage: 50000
  },
  condition: 'good'
})
```

### Execute All Services for a Module

```javascript
// Execute all available services (no serviceId specified)
const results = await moduleRegistry.executeModule('market-valuation', {
  vehicle: {
    make: 'Honda',
    model: 'Civic',
    year: 2020,
    mileage: 50000
  },
  condition: 'good'
})

// Results will contain outputs from all registered services
console.log(`Executed ${results.totalServices} services, ${results.successful} successful`)
```

### Compare Services

```javascript
// Compare multiple services for the same module
const comparison = await moduleRegistry.compareModuleServices(
  'market-valuation',
  ['kbb-api', 'edmunds-api', 'ai-valuation'],
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

// Comparison includes execution times, success rates, and results
console.log(comparison.comparison.summary)
```

### Register a New Service

```javascript
import { moduleRegistry } from './modules/index.js'

// Create a service
const myService = {
  id: 'my-custom-service',
  name: 'My Custom Service',
  description: 'A custom implementation',
  requirements: {
    apiKey: true
  },
  async execute(params) {
    // Your service logic here
    return {
      // Service output
    }
  }
}

// Register it to a module
moduleRegistry.registerService('market-valuation', myService)
```

### Get Module Information

```javascript
// Get info about a specific module
const moduleInfo = moduleRegistry.getModuleInfo('market-valuation')
console.log(moduleInfo.availableServices)

// Get info about all modules
const allModules = moduleRegistry.getAllModulesInfo()
```

## Service Structure

Each service must implement:

```javascript
{
  id: 'service-id',              // Unique identifier
  name: 'Service Name',          // Human-readable name
  description: 'Description',    // What this service does
  requirements: {                // What this service needs
    apiKey: false,              // Does it need an API key?
    pdf: false,                 // Does it need a PDF?
    // ... other requirements
  },
  async execute(params) {       // Main execution method
    // Service logic
    return {
      // Service output
    }
  }
}
```

## Philosophy

- **One module = One capability** - Each module has a single, well-defined purpose
- **Modules are independent** - Can be developed/tested in isolation
- **Services are interchangeable** - Different services can solve the same problem
- **Standardized interfaces** - All modules follow the same patterns
- **No duplication** - Shared utilities in framework/

## Development Workflow

1. **Create a service** in the appropriate module's `services/` directory
2. **Register the service** to the module (either in the module's index.js or dynamically)
3. **Test the service** using the module's execute method
4. **Compare services** to evaluate different approaches

## Next Steps

- Implement actual service logic for each module
- Add service-specific tests
- Create service comparison utilities
- Build API endpoints for module execution
