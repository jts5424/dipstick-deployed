import Joi from 'joi'

/**
 * Validation middleware factory
 * Creates a middleware function that validates request data against a Joi schema
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all validation errors, not just the first one
      stripUnknown: true // Remove unknown properties
    })

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      })
    }

    // Replace request data with validated and sanitized data
    req[property] = value
    next()
  }
}

/**
 * Vehicle data validation schema
 */
export const vehicleDataSchema = Joi.object({
  make: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Make is required',
      'string.min': 'Make must be at least 1 character',
      'string.max': 'Make must not exceed 50 characters',
      'any.required': 'Make is required'
    }),

  model: Joi.string()
    .trim()
    .min(1)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Model is required',
      'string.min': 'Model must be at least 1 character',
      'string.max': 'Model must not exceed 50 characters',
      'any.required': 'Model is required'
    }),

  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required()
    .messages({
      'number.base': 'Year must be a number',
      'number.integer': 'Year must be an integer',
      'number.min': 'Year must be 1900 or later',
      'number.max': `Year must be ${new Date().getFullYear() + 1} or earlier`,
      'any.required': 'Year is required'
    }),

  mileage: Joi.number()
    .integer()
    .min(0)
    .max(1000000)
    .required()
    .messages({
      'number.base': 'Mileage must be a number',
      'number.integer': 'Mileage must be an integer',
      'number.min': 'Mileage must be 0 or greater',
      'number.max': 'Mileage must not exceed 1,000,000 miles',
      'any.required': 'Mileage is required'
    }),

  trim: Joi.string()
    .trim()
    .max(50)
    .allow(null, '')
    .optional(),

  engine: Joi.string()
    .trim()
    .max(100)
    .allow(null, '')
    .optional(),

  vin: Joi.string()
    .trim()
    .allow(null, '')
    .optional()
    .custom((value, helpers) => {
      if (value && value.length > 0 && value.length !== 17) {
        return helpers.error('string.length')
      }
      return value
    })
    .messages({
      'string.length': 'VIN must be exactly 17 characters if provided'
    })
})

/**
 * File validation helper
 * Validates that a PDF file was uploaded
 */
export const validatePDFFile = (req, res, next) => {
  console.log('[PDF Parse] 🔍 Validation middleware: Checking file...')
  const file = req.file

  if (!file) {
    console.log('[PDF Parse] ❌ Validation failed: No file in request')
    return res.status(400).json({
      error: 'Validation failed',
      details: [{
        field: 'serviceHistory',
        message: 'Service history PDF file is required'
      }]
    })
  }
  
  console.log('[PDF Parse] ✅ Validation passed:', file.originalname)

  // Check file extension
  const allowedExtensions = ['.pdf']
  const fileExtension = file.originalname.toLowerCase().substring(
    file.originalname.lastIndexOf('.')
  )

  if (!allowedExtensions.includes(fileExtension)) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{
        field: 'serviceHistory',
        message: 'File must be a PDF (.pdf)'
      }]
    })
  }

  // Check MIME type if available
  if (file.mimetype && !file.mimetype.includes('pdf')) {
    return res.status(400).json({
      error: 'Validation failed',
      details: [{
        field: 'serviceHistory',
        message: 'File must be a PDF document'
      }]
    })
  }

  next()
}

/**
 * Vehicle data validation schema with service history (for analyze-service-history endpoint)
 */
export const vehicleDataWithServiceHistorySchema = vehicleDataSchema.keys({
  serviceHistory: Joi.object({
    records: Joi.array().items(Joi.object()).required(),
    metadata: Joi.object().optional(),
    vehicleInfo: Joi.object().optional()
  }).required()
})

/**
 * Vehicle data validation schema with routine maintenance (for gap analysis endpoint)
 */
export const vehicleDataWithRoutineMaintenanceSchema = vehicleDataSchema.keys({
  serviceHistory: Joi.object({
    records: Joi.array().items(Joi.object()).required(),
    metadata: Joi.object().optional(),
    vehicleInfo: Joi.object().optional()
  }).required(),
  routineMaintenance: Joi.array().items(Joi.object()).required()
})

/**
 * Vehicle data validation schema with unscheduled maintenance and service history analysis (for risk evaluation endpoint)
 */
export const vehicleDataWithUnscheduledRiskSchema = vehicleDataSchema.keys({
  serviceHistory: Joi.object({
    records: Joi.array().items(Joi.object()).required(),
    metadata: Joi.object().optional(),
    vehicleInfo: Joi.object().optional()
  }).required(),
  serviceHistoryAnalysis: Joi.object().optional(),
  unscheduledMaintenance: Joi.array().items(Joi.object()).required()
})

/**
 * Total Cost of Ownership validation schema
 */
export const totalCostOfOwnershipSchema = vehicleDataSchema.keys({
  purchasePrice: Joi.number().min(0).required(),
  timePeriodYears: Joi.number().min(0.5).max(10).required(),
  milesPerYear: Joi.number().min(0).max(50000).required(),
  gapAnalysis: Joi.object().optional(),
  riskEvaluation: Joi.object().optional(),
  serviceHistoryAnalysis: Joi.object().optional(),
  routineMaintenance: Joi.array().items(Joi.object()).optional(),
  marketValuation: Joi.object().optional()
})

