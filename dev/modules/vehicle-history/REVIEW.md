# Vehicle History Module - Review

## Current Structure

```
dev/modules/vehicle-history/
├── index.js                    # Module class
├── setup.js                    # Service registration
├── SCHEMA.md                   # Event extraction schema
├── PARSING_APPROACH.md         # PDF parsing approach
├── CARFAX_SCHEMA.md           # Carfax schema docs
└── services/
    ├── events/
    │   └── carfax.js          # Events extraction service
    └── narrative/
        └── carfax.js          # Narrative generation service
```

## Architecture Analysis

### ✅ What's Working

1. **Structure matches pattern**: `modules/<module type>/services/<service type>/`
   - Module: `vehicle-history`
   - Service types: `events`, `narrative`
   - Implementations: `carfax.js` in each

2. **Module class**: Extends `ModuleBase` correctly
   - Has proper metadata (id, name, description)
   - Registers services via `registerService()`

3. **Services are functional**: Both services have:
   - `id`, `name`, `description`
   - `execute()` method
   - Proper error handling

4. **Documentation preserved**: Schema and approach docs are in place

### ⚠️ Issues & Inconsistencies

1. **Services don't use ServiceBase**
   - Current: Services are plain objects with `execute()`
   - Framework expects: Services extend `ServiceBase` and have methods
   - **Impact**: Services work but don't follow the three-tier hierarchy (Module → Service → Method)

2. **No method layer**
   - Current: `carfax.js` files ARE the services
   - Expected: Services should have methods, and `carfax.js` should be a method
   - **Impact**: Can't compare different methods for the same service

3. **Service IDs conflict**
   - Both services have `id: 'carfax'`
   - They're in different folders so no runtime conflict, but confusing
   - **Impact**: Could cause issues if services are accessed by ID

4. **Module.execute() behavior**
   - Current: Calls `service.execute()` directly
   - Framework expects: Services need `methodId` parameter
   - **Impact**: Module.execute() will fail because services don't accept methodId

5. **Missing validation**
   - Module doesn't override `validateInput()`
   - No input validation for required params (vin, pdfPath, events)

6. **Code duplication**
   - Both services have identical `pdfToImages()` function
   - Both services have identical `getClaudeClient()` function
   - **Impact**: Maintenance burden, potential inconsistencies

## Recommendations

### Option 1: Keep Current Structure (Simpler)
- Services are direct implementations (no ServiceBase)
- Update module.execute() to work with direct services
- Rename service IDs to be unique: `events-carfax`, `narrative-carfax`

### Option 2: Use Full Three-Tier Hierarchy
- Create ServiceBase instances for `events` and `narrative`
- Make `carfax.js` files into methods
- Structure: `services/events/index.js` (ServiceBase) + `services/events/methods/carfax.js`
- Allows adding more methods later (e.g., `autocheck`, `vehicle-databases`)

### Option 3: Hybrid Approach
- Keep services as direct implementations for now
- Add method layer later when needed
- Extract shared utilities (pdfToImages, getClaudeClient) to common file

## Current Service Details

### events/carfax.js
- **Purpose**: Extract all vehicle history events from Carfax PDF
- **Input**: `{ vin?, pdfPath }`
- **Output**: `{ source, vin, events[], metadata, timestamp }`
- **Technology**: Claude 3.5 Sonnet Vision API
- **Status**: ✅ Functional

### narrative/carfax.js
- **Purpose**: Generate expert narrative from Carfax
- **Input**: `{ vin?, pdfPath, events[] }`
- **Output**: `{ source, vin, narrative, metadata, timestamp }`
- **Technology**: Claude 3.5 Sonnet Vision API
- **Status**: ✅ Functional

## Questions to Resolve

1. Should services use ServiceBase and methods, or stay as direct implementations?
2. Should we extract shared utilities (pdfToImages, getClaudeClient)?
3. Should service IDs be more descriptive (`events-carfax` vs `carfax`)?
4. Should module have input validation?
5. How should module.execute() work with these services?

