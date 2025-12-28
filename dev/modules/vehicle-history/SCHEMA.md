# Vehicle History Events - Extraction Schema

## Purpose
This module extracts vehicle history events from Carfax PDFs and assigns event types. 
It does NOT add calculated fields, analysis, or data from other modules - just pure extraction.

## Core Schema

```typescript
interface VehicleHistoryEvent {
  // Event Classification
  eventType: EventType           // Type of event (required)
  
  // Temporal Information (from Carfax)
  date: string | null            // Event date in YYYY-MM-DD format
  mileage: number | null         // Odometer reading at time of event
  
  // Description (from Carfax)
  description: string            // Description as it appears in Carfax
  
  // Location (from Carfax)
  location: string | null        // Location as it appears in Carfax
  
  // Cost (from Carfax - if present)
  cost: number | null            // Cost if shown in Carfax
}
```

## Event Types

The module classifies each Carfax event into one of these types:

```typescript
type EventType = 
  | "service"                    // Maintenance, repairs, inspections
  | "title_change"               // Title transfers, ownership changes
  | "accident"                   // Accidents, collisions, damage
  | "registration"               // Registration renewals, state changes
  | "inspection"                 // Safety inspections, emissions tests
  | "recall"                     // Manufacturer recalls
  | "warranty"                   // Warranty claims, coverage
  | "auction"                    // Auction sales
  | "theft"                      // Theft reports, recoveries
  | "flood_damage"               // Flood damage reports
  | "fire_damage"                // Fire damage reports
  | "structural_damage"          // Structural/frame damage
  | "lien"                       // Liens, repossession
  | "other"                      // Other events not categorized above
```

## What We Extract

**From Carfax, we extract:**
- Date (if present)
- Mileage/Odometer reading (if present)
- Description (what happened)
- Location (where it happened)
- Cost (if shown)

**We add:**
- `eventType` - Classification of what type of event this is

**We do NOT add:**
- Calculated fields
- Analysis
- Data from other sources
- Normalized/standardized data
- Confidence scores
- Verification status
- Any metadata beyond what's in Carfax

## Example Records

### Service Event
```json
{
  "eventType": "service",
  "date": "2023-06-15",
  "mileage": 45000,
  "description": "Oil change, Filter replacement, Tire rotation",
  "location": "Honda of Los Angeles",
  "cost": 89.95
}
```

### Accident Event
```json
{
  "eventType": "accident",
  "date": "2022-03-20",
  "mileage": 32000,
  "description": "Accident reported - Front impact",
  "location": "Los Angeles, CA",
  "cost": null
}
```

### Title Change Event
```json
{
  "eventType": "title_change",
  "date": "2021-05-10",
  "mileage": 25000,
  "description": "Title issued or updated - New owner reported",
  "location": "California",
  "cost": null
}
```

## Extraction Rules

1. **Extract exactly what's in Carfax** - Don't interpret, normalize, or enhance
2. **Assign eventType** - Classify each event based on the description
3. **Preserve original text** - Keep descriptions as they appear
4. **Handle missing data** - Use null for fields not present in Carfax
5. **One event per line/item** - Each history line in Carfax = one event record

## Next Steps

1. Define the extraction prompt for Claude to match this schema
2. Implement event type classification logic
3. Test with real Carfax PDFs
