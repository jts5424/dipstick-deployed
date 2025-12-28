# Carfax Report → Structured Table Schema

## What's in a Carfax Report?

Carfax reports typically contain several types of history events:

1. **Service/Maintenance Records** - Oil changes, repairs, inspections
2. **Title/Ownership Changes** - Title transfers, ownership history
3. **Accident/Damage Reports** - Accidents, damage, total loss
4. **Registration Events** - Registration renewals, state changes
5. **Emission/Safety Inspections** - State inspections, emissions tests
6. **Recalls** - Manufacturer recalls
7. **Warranty Information** - Warranty claims, coverage

## Current Schema (from archived code)

The archived code used this structure for service records:

```json
{
  "date": "YYYY-MM-DD or null",
  "mileage": number or null,
  "description": "comma-separated list of work items",
  "serviceType": "categorized service type",
  "cost": number or null,
  "location": "shop name or null"
}
```

## Questions to Consider:

### 1. **Event Type**
Should we have a field to distinguish between different event types?
- `eventType`: "service" | "title_change" | "accident" | "registration" | "inspection" | "recall" | "warranty"

### 2. **Date Fields**
Carfax often shows:
- Event date
- Report date (when it was reported to Carfax)
- Should we capture both?

### 3. **Mileage**
- Odometer reading at time of event
- Sometimes shown as "Actual" vs "Not Actual" - should we flag this?

### 4. **Description**
- For service: work items performed
- For accidents: damage description
- For title changes: what changed
- Should this be structured differently per event type?

### 5. **Location**
- Service facility name
- State/location for title changes
- Should we separate facility name from location/state?

### 6. **Cost**
- Only relevant for service records
- Should be null for non-service events

### 7. **Additional Fields to Consider**

**For Service Records:**
- `serviceCategory`: "Maintenance" | "Repair" | "Inspection" | "Recall"
- `partsReplaced`: Array of parts?
- `laborCost` vs `partsCost` vs `totalCost`?

**For Accidents:**
- `severity`: "Minor" | "Moderate" | "Severe" | "Total Loss"
- `damageAreas`: Array of body areas?
- `airbagsDeployed`: boolean

**For Title Changes:**
- `titleType`: "Clean" | "Salvage" | "Rebuilt" | "Lemon" | etc.
- `previousOwnerCount`: number
- `ownershipDuration`: string or number?

**For All Events:**
- `source`: "Carfax" | "Dealer" | "Service Facility" | etc.
- `reportedDate`: When was this reported to Carfax?
- `verified`: boolean - Is this verified information?

## Proposed Schema Options:

### Option 1: Single Unified Table (All Event Types)
```json
{
  "date": "YYYY-MM-DD",
  "mileage": number,
  "eventType": "service" | "title_change" | "accident" | etc.,
  "description": "string",
  "location": "string",
  "cost": number | null,
  "metadata": {
    // Event-type-specific fields
    "serviceType": "string" | null,
    "titleType": "string" | null,
    "accidentSeverity": "string" | null,
    // etc.
  }
}
```

### Option 2: Separate Tables by Event Type
- `service_records` table
- `title_changes` table
- `accidents` table
- etc.

### Option 3: Core Fields + Flexible Metadata
```json
{
  "date": "YYYY-MM-DD",
  "mileage": number,
  "eventType": "string",
  "description": "string",
  "location": "string",
  "cost": number | null,
  "eventSpecificData": {
    // Flexible object that varies by event type
  }
}
```

## Recommendation:

Start with **Option 1** (unified table) but with clear event types. This gives us:
- One table to query
- Easy to filter by event type
- Can add event-specific fields in metadata as needed

## Next Steps:

1. **Decide on event types** - Which ones do we care about for the vehicle history module?
2. **Define core fields** - What fields are common across all event types?
3. **Define event-specific fields** - What additional fields do we need per event type?
4. **Create the schema** - Write it out as a TypeScript interface or JSON schema

What do you think? Should we focus on just service records first, or capture all event types?

