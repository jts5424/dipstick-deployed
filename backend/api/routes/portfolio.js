import express from 'express'
import { savePortfolio, getAllPortfolios, getPortfolio, deletePortfolio, deletePortfolioField } from '../../services/executionLogger.js'

const router = express.Router()

// GET /api/portfolio - Get all portfolios
router.get('/', async (req, res) => {
  try {
    const portfolios = await getAllPortfolios()
    res.json({
      success: true,
      portfolios: portfolios.map(p => ({
        portfolioId: p.portfolio_id,
        vehicleData: {
          make: p.vehicle_make,
          model: p.vehicle_model,
          year: p.vehicle_year,
          mileage: p.mileage,
          trim: p.trim,
          engine: p.engine,
          vin: p.vin
        },
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }))
    })
  } catch (error) {
    console.error('Error fetching portfolios:', error)
    res.status(500).json({
      error: 'Failed to fetch portfolios',
      message: error.message
    })
  }
})

// GET /api/portfolio/:portfolioId - Get a specific portfolio
router.get('/:portfolioId', async (req, res) => {
  try {
    const { portfolioId } = req.params
    const portfolio = await getPortfolio(portfolioId)
    
    if (!portfolio) {
      return res.status(404).json({
        error: 'Portfolio not found'
      })
    }

    res.json({
      success: true,
      portfolio
    })
  } catch (error) {
    console.error('Error fetching portfolio:', error)
    res.status(500).json({
      error: 'Failed to fetch portfolio',
      message: error.message
    })
  }
})

// POST /api/portfolio - Save a portfolio
router.post('/', async (req, res) => {
  try {
    const portfolioData = req.body
    const portfolioId = await savePortfolio(portfolioData)
    
    res.json({
      success: true,
      portfolioId
    })
  } catch (error) {
    console.error('Error saving portfolio:', error)
    res.status(500).json({
      error: 'Failed to save portfolio',
      message: error.message
    })
  }
})

// DELETE /api/portfolio/:portfolioId - Delete a portfolio
router.delete('/:portfolioId', async (req, res) => {
  try {
    const { portfolioId } = req.params
    const deleted = await deletePortfolio(portfolioId)
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Portfolio not found'
      })
    }

    res.json({
      success: true,
      message: 'Portfolio deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting portfolio:', error)
    res.status(500).json({
      error: 'Failed to delete portfolio',
      message: error.message
    })
  }
})

// DELETE /api/portfolio/:portfolioId/field/:fieldName - Delete a specific field from a portfolio
router.delete('/:portfolioId/field/:fieldName', async (req, res) => {
  try {
    const { portfolioId, fieldName } = req.params
    
    // Validate field name
    const validFields = [
      'parsedServiceHistory',
      'serviceHistoryAnalysis',
      'routineMaintenance',
      'unscheduledMaintenance',
      'gapAnalysis',
      'riskEvaluation',
      'marketValuation'
    ]
    
    if (!validFields.includes(fieldName)) {
      return res.status(400).json({
        error: 'Invalid field name',
        message: `Field must be one of: ${validFields.join(', ')}`
      })
    }
    
    const deleted = await deletePortfolioField(portfolioId, fieldName)
    
    if (!deleted) {
      return res.status(404).json({
        error: 'Portfolio not found'
      })
    }

    res.json({
      success: true,
      message: `Field ${fieldName} deleted successfully`
    })
  } catch (error) {
    console.error('Error deleting portfolio field:', error)
    res.status(500).json({
      error: 'Failed to delete portfolio field',
      message: error.message
    })
  }
})

export default router

