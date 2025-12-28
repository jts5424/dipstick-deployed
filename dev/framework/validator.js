/**
 * Data Validation Utilities
 * 
 * Standardized validation for module inputs/outputs
 */

export class Validator {
  /**
   * Validate VIN
   */
  static validateVIN(vin) {
    if (!vin) return { valid: false, error: 'VIN is required' }
    if (typeof vin !== 'string') return { valid: false, error: 'VIN must be a string' }
    if (vin.length !== 17) return { valid: false, error: 'VIN must be exactly 17 characters' }
    return { valid: true }
  }

  /**
   * Validate vehicle data
   */
  static validateVehicleData(data) {
    const errors = []

    if (!data.make || typeof data.make !== 'string' || data.make.trim().length === 0) {
      errors.push('make is required')
    }

    if (!data.model || typeof data.model !== 'string' || data.model.trim().length === 0) {
      errors.push('model is required')
    }

    if (!data.year || typeof data.year !== 'number' || data.year < 1900 || data.year > new Date().getFullYear() + 1) {
      errors.push('year must be a valid year')
    }

    if (data.mileage !== undefined && (typeof data.mileage !== 'number' || data.mileage < 0)) {
      errors.push('mileage must be a non-negative number')
    }

    if (data.vin) {
      const vinValidation = this.validateVIN(data.vin)
      if (!vinValidation.valid) {
        errors.push(vinValidation.error)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate service history record
   */
  static validateServiceRecord(record) {
    const errors = []

    if (!record.description || typeof record.description !== 'string' || record.description.trim().length === 0) {
      errors.push('description is required')
    }

    if (record.date && !/^\d{4}-\d{2}-\d{2}$/.test(record.date)) {
      errors.push('date must be in YYYY-MM-DD format')
    }

    if (record.mileage !== undefined && (typeof record.mileage !== 'number' || record.mileage < 0)) {
      errors.push('mileage must be a non-negative number')
    }

    if (record.cost !== undefined && (typeof record.cost !== 'number' || record.cost < 0)) {
      errors.push('cost must be a non-negative number')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate service history array
   */
  static validateServiceHistory(history) {
    if (!Array.isArray(history.records)) {
      return { valid: false, errors: ['records must be an array'] }
    }

    const errors = []
    history.records.forEach((record, index) => {
      const validation = this.validateServiceRecord(record)
      if (!validation.valid) {
        errors.push(`Record ${index + 1}: ${validation.errors.join(', ')}`)
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}


