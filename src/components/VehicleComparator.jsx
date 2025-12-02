import { useState, useEffect } from 'react'
import { getAllPortfolios, getPortfolio, calculateTotalCostOfOwnership } from '../services/api'
import './VehicleComparator.css'

function VehicleComparator() {
  const [portfolios, setPortfolios] = useState([])
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState([])
  const [comparisonInputs, setComparisonInputs] = useState({
    purchasePrices: {}, // { portfolioId: price }
    timePeriodYears: '3',
    milesPerYear: '12000'
  })
  const [comparisonResults, setComparisonResults] = useState([])
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadPortfolios()
  }, [])

  const loadPortfolios = async () => {
    try {
      const result = await getAllPortfolios()
      setPortfolios(result.portfolios || [])
    } catch (err) {
      console.error('Error loading portfolios:', err)
      setError('Failed to load portfolios')
    }
  }

  const handlePortfolioToggle = (portfolioId) => {
    setSelectedPortfolioIds(prev => {
      if (prev.includes(portfolioId)) {
        // Remove from selection
        const newPrices = { ...comparisonInputs.purchasePrices }
        delete newPrices[portfolioId]
        setComparisonInputs({ ...comparisonInputs, purchasePrices: newPrices })
        return prev.filter(id => id !== portfolioId)
      } else {
        // Add to selection
        return [...prev, portfolioId]
      }
    })
  }

  const handlePurchasePriceChange = (portfolioId, price) => {
    setComparisonInputs({
      ...comparisonInputs,
      purchasePrices: {
        ...comparisonInputs.purchasePrices,
        [portfolioId]: price
      }
    })
  }

  const handleCompare = async () => {
    if (selectedPortfolioIds.length === 0) {
      setError('Please select at least one vehicle to compare')
      return
    }

    if (selectedPortfolioIds.length < 2) {
      setError('Please select at least 2 vehicles to compare')
      return
    }

    // Check if all selected vehicles have purchase prices
    const missingPrices = selectedPortfolioIds.filter(id => !comparisonInputs.purchasePrices[id])
    if (missingPrices.length > 0) {
      setError(`Please enter purchase prices for all selected vehicles`)
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const results = []
      
      for (const portfolioId of selectedPortfolioIds) {
        // Load portfolio data
        const portfolioResult = await getPortfolio(portfolioId)
        const portfolio = portfolioResult.portfolio

        if (!portfolio) {
          continue
        }

        // Calculate TCO for this vehicle
        const tcoResult = await calculateTotalCostOfOwnership(
          {
            make: portfolio.vehicleData?.make,
            model: portfolio.vehicleData?.model,
            year: portfolio.vehicleData?.year,
            mileage: portfolio.vehicleData?.mileage,
            trim: portfolio.vehicleData?.trim,
            engine: portfolio.vehicleData?.engine,
            vin: portfolio.vehicleData?.vin
          },
          {
            purchasePrice: parseFloat(comparisonInputs.purchasePrices[portfolioId]),
            timePeriodYears: parseFloat(comparisonInputs.timePeriodYears),
            milesPerYear: parseFloat(comparisonInputs.milesPerYear),
            gapAnalysis: portfolio.gapAnalysis,
            riskEvaluation: portfolio.riskEvaluation,
            serviceHistoryAnalysis: portfolio.serviceHistoryAnalysis,
            routineMaintenance: portfolio.routineMaintenance,
            marketValuation: portfolio.marketValuation
          }
        )

        results.push({
          portfolioId,
          vehicle: {
            make: portfolio.vehicleData?.make,
            model: portfolio.vehicleData?.model,
            year: portfolio.vehicleData?.year,
            mileage: portfolio.vehicleData?.mileage,
            trim: portfolio.vehicleData?.trim
          },
          tco: tcoResult.tco
        })
      }

      setComparisonResults(results)
    } catch (err) {
      setError(err.message || 'Failed to calculate comparison')
      console.error('Comparison error:', err)
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getVehicleLabel = (vehicle) => {
    return `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ''}`
  }

  return (
    <div className="vehicle-comparator">
      <h3>Vehicle Comparator</h3>

      {/* Input Section */}
      <div className="comparator-inputs">
        <div className="input-group">
          <label>Ownership Period (Years)</label>
          <input
            type="number"
            value={comparisonInputs.timePeriodYears}
            onChange={(e) => setComparisonInputs({ ...comparisonInputs, timePeriodYears: e.target.value })}
            min="0.5"
            max="10"
            step="0.5"
          />
        </div>
        <div className="input-group">
          <label>Miles Per Year</label>
          <input
            type="number"
            value={comparisonInputs.milesPerYear}
            onChange={(e) => setComparisonInputs({ ...comparisonInputs, milesPerYear: e.target.value })}
            min="0"
            max="50000"
            step="1000"
          />
        </div>
      </div>

      {/* Vehicle Selection */}
      <div className="vehicle-selection">
        <h4>Select Vehicles to Compare</h4>
        <div className="portfolio-list">
          {portfolios.map(portfolio => {
            const portfolioId = portfolio.portfolio_id || portfolio.portfolioId
            const isSelected = selectedPortfolioIds.includes(portfolioId)
            const vehicleLabel = `${portfolio.vehicle_year || portfolio.vehicleData?.year} ${portfolio.vehicle_make || portfolio.vehicleData?.make} ${portfolio.vehicle_model || portfolio.vehicleData?.model}${(portfolio.trim || portfolio.vehicleData?.trim) ? ` ${portfolio.trim || portfolio.vehicleData?.trim}` : ''}`
            
            return (
              <div key={portfolioId} className="portfolio-item">
                <label className="portfolio-checkbox">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handlePortfolioToggle(portfolioId)}
                  />
                  <span className="vehicle-name">{vehicleLabel}</span>
                </label>
                {isSelected && (
                  <div className="purchase-price-input">
                    <label>Purchase Price ($)</label>
                    <input
                      type="number"
                      value={comparisonInputs.purchasePrices[portfolioId] || ''}
                      onChange={(e) => handlePurchasePriceChange(portfolioId, e.target.value)}
                      placeholder="e.g., 25000"
                      min="0"
                      step="100"
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <button 
        className="compare-button" 
        onClick={handleCompare}
        disabled={isCalculating || selectedPortfolioIds.length < 2}
      >
        {isCalculating ? 'Calculating...' : 'Compare Vehicles'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {/* Comparison Results */}
      {comparisonResults.length > 0 && (
        <div className="comparison-results">
          <h4>Comparison Results</h4>
          
          {/* Summary Comparison Table */}
          <div className="comparison-table-container">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Purchase Price</th>
                  <th>Current Value - (Purchase + ICB)</th>
                  <th>ICB</th>
                  <th>EURC</th>
                  <th>C12</th>
                  <th>Total Costs ({comparisonInputs.timePeriodYears} yrs)</th>
                  <th>Total Loss</th>
                  <th>Condition Score</th>
                  <th>Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {comparisonResults.map((result, idx) => {
                  const tco = result.tco
                  const riskLevel = tco.expectedUnscheduledRepairCost.total > 3000 ? 'High' : 
                                  tco.expectedUnscheduledRepairCost.total > 1500 ? 'Medium' : 'Low'
                  
                  return (
                    <tr key={result.portfolioId} className={idx === 0 ? 'best-value' : ''}>
                      <td className="vehicle-cell">
                        <strong>{getVehicleLabel(result.vehicle)}</strong>
                        <div className="vehicle-details">
                          {result.vehicle.mileage?.toLocaleString()} miles
                        </div>
                      </td>
                      <td>{formatCurrency(tco.summary.purchasePrice)}</td>
                      <td className={tco.currentValueMinusPurchaseAndICB >= 0 ? 'positive' : 'negative'}>
                        {formatCurrency(tco.currentValueMinusPurchaseAndICB)}
                      </td>
                      <td>{formatCurrency(tco.immediateCostBurden.total)}</td>
                      <td>{formatCurrency(tco.expectedUnscheduledRepairCost.total)}</td>
                      <td>{formatCurrency(tco.c12Projection.total)}</td>
                      <td>{formatCurrency(tco.totalCosts.total)}</td>
                      <td className="loss-cell">{formatCurrency(tco.totalLoss)}</td>
                      <td>
                        <span className={`condition-score score-${tco.conditionScore.score >= 80 ? 'excellent' : tco.conditionScore.score >= 60 ? 'good' : tco.conditionScore.score >= 40 ? 'fair' : 'poor'}`}>
                          {tco.conditionScore.score}/100
                        </span>
                      </td>
                      <td>
                        <span className={`risk-badge risk-${riskLevel.toLowerCase()}`}>
                          {riskLevel}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Detailed Breakdown */}
          <div className="detailed-comparison">
            <h5>Detailed Cost Breakdown</h5>
            <div className="detailed-table-container">
              <table className="detailed-comparison-table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Immediate Cost Burden</th>
                    <th>Projected Routine Maintenance</th>
                    <th>Expected Unscheduled Repairs</th>
                    <th>Depreciation</th>
                    <th>Total Costs</th>
                    <th>Expected Sale Price</th>
                    <th>Adjusted Value (Purchase + C12)</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonResults.map((result) => {
                    const tco = result.tco
                    return (
                      <tr key={result.portfolioId}>
                        <td className="vehicle-cell">
                          <strong>{getVehicleLabel(result.vehicle)}</strong>
                        </td>
                        <td>{formatCurrency(tco.totalCosts.immediateCostBurden)}</td>
                        <td>{formatCurrency(tco.totalCosts.projectedRoutineMaintenance)}</td>
                        <td>{formatCurrency(tco.totalCosts.expectedUnscheduledRepairs)}</td>
                        <td>{formatCurrency(tco.totalCosts.depreciation)}</td>
                        <td><strong>{formatCurrency(tco.totalCosts.total)}</strong></td>
                        <td>{formatCurrency(tco.summary.expectedSalePrice)}</td>
                        <td>{formatCurrency(tco.adjustedValue)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VehicleComparator

