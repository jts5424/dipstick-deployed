# Validation Testing Guide

## Backend Validation Tests

### Test 1: Missing Required Fields
```bash
# This should return validation errors
curl -X POST http://localhost:5000/api/analyze \
  -F "make=" \
  -F "model=Camry" \
  -F "year=2018" \
  -F "mileage=75000"
```

### Test 2: Invalid Year
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "make=Toyota" \
  -F "model=Camry" \
  -F "year=1800" \
  -F "mileage=75000"
```

### Test 3: Invalid Mileage
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "make=Toyota" \
  -F "model=Camry" \
  -F "year=2018" \
  -F "mileage=-100"
```

### Test 4: Missing PDF File
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "make=Toyota" \
  -F "model=Camry" \
  -F "year=2018" \
  -F "mileage=75000"
```

### Test 5: Valid Request (should work)
```bash
curl -X POST http://localhost:5000/api/analyze \
  -F "make=Toyota" \
  -F "model=Camry" \
  -F "year=2018" \
  -F "mileage=75000" \
  -F "serviceHistory=@path/to/test.pdf"
```

## Expected Behavior

All invalid requests should return:
- Status: 400 Bad Request
- Response format:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "make",
      "message": "Make is required"
    }
  ]
}
```

