import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { calculateTotalCostOfOwnership } from '../services/api'
import './TotalCostOfOwnershipDisplay.css'

function TotalCostOfOwnershipDisplay({ 
  vehicleData, 
  gapAnalysis, 
  riskEvaluation, 
  serviceHistoryAnalysis, 
  routineMaintenance, 
  marketValuation 
}) {
  const [inputs, setInputs] = useState({
    purchasePrice: '',
    timePeriodYears: '3',
    milesPerYear: '12000'
  })
  const [tcoData, setTcoData] = useState(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [error, setError] = useState(null)

  const formatCurrency = (value) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const handleCalculate = async () => {
    if (!inputs.purchasePrice || !inputs.timePeriodYears || !inputs.milesPerYear) {
      setError('Please fill in all fields')
      return
    }

    setIsCalculating(true)
    setError(null)

    try {
      const result = await calculateTotalCostOfOwnership(vehicleData, {
        purchasePrice: parseFloat(inputs.purchasePrice),
        timePeriodYears: parseFloat(inputs.timePeriodYears),
        milesPerYear: parseFloat(inputs.milesPerYear),
        gapAnalysis,
        riskEvaluation,
        serviceHistoryAnalysis,
        routineMaintenance,
        marketValuation
      })

      setTcoData(result.tco)
    } catch (err) {
      setError(err.message || 'Failed to calculate TCO')
      console.error('TCO calculation error:', err)
    } finally {
      setIsCalculating(false)
    }
  }

  // Prepare chart data for cost over time
  const prepareChartData = () => {
    if (!tcoData || !inputs.timePeriodYears) return []

    const years = parseInt(inputs.timePeriodYears)
    const data = []
    const annualRoutine = tcoData.projectedRoutineMaintenance.total / years
    const annualUnscheduled = tcoData.expectedUnscheduledRepairCost.total / years
    const annualDepreciation = tcoData.depreciation?.depreciation / years || 0

    for (let i = 0; i <= years; i++) {
      const cumulativeRoutine = annualRoutine * i
      const cumulativeUnscheduled = annualUnscheduled * i
      const cumulativeDepreciation = annualDepreciation * i
      const cumulativeTotal = cumulativeRoutine + cumulativeUnscheduled + cumulativeDepreciation + (i === 0 ? tcoData.immediateCostBurden.total : 0)

      data.push({
        year: i,
        'Routine Maintenance': cumulativeRoutine,
        'Unscheduled Repairs': cumulativeUnscheduled,
        'Depreciation': cumulativeDepreciation,
        'Total Cost': cumulativeTotal
      })
    }

    return data
  }

  const chartData = prepareChartData()

  return (
    <div className="tco-display">
      <h3>Total Cost of Ownership Analysis</h3>

      {/* Input Form */}
      <div className="tco-input-form">
        <h4>Ownership Parameters</h4>
        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="purchasePrice">Purchase Price ($)</label>
            <input
              type="number"
              id="purchasePrice"
              value={inputs.purchasePrice}
              onChange={(e) => setInputs({ ...inputs, purchasePrice: e.target.value })}
              placeholder="e.g., 25000"
              min="0"
              step="100"
            />
          </div>
          <div className="input-group">
            <label htmlFor="timePeriodYears">Ownership Period (Years)</label>
            <input
              type="number"
              id="timePeriodYears"
              value={inputs.timePeriodYears}
              onChange={(e) => setInputs({ ...inputs, timePeriodYears: e.target.value })}
              placeholder="e.g., 3"
              min="0.5"
              max="10"
              step="0.5"
            />
          </div>
          <div className="input-group">
            <label htmlFor="milesPerYear">Miles Driven Per Year</label>
            <input
              type="number"
              id="milesPerYear"
              value={inputs.milesPerYear}
              onChange={(e) => setInputs({ ...inputs, milesPerYear: e.target.value })}
              placeholder="e.g., 12000"
              min="0"
              max="50000"
              step="1000"
            />
          </div>
        </div>
        <button 
          className="calculate-button" 
          onClick={handleCalculate}
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Calculate TCO'}
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>

      {/* Results */}
      {tcoData && (
        <>
          {/* Summary Badge */}
          <div className="tco-summary-badge">
            <div className="badge-item highlight">
              <span className="badge-label">Current Value - (Purchase + ICB)</span>
              <span className={`badge-value ${(tcoData.currentValueMinusPurchaseAndICB || 0) >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(tcoData.currentValueMinusPurchaseAndICB)}
              </span>
            </div>
            <div className="badge-item highlight">
              <span className="badge-label">Total Loss ({inputs.timePeriodYears} Years)</span>
              <span className="badge-value loss">{formatCurrency(tcoData.totalLoss)}</span>
            </div>
            <div className="badge-item">
              <span className="badge-label">Condition Score</span>
              <span className={`badge-value score score-${tcoData.conditionScore.score >= 80 ? 'excellent' : tcoData.conditionScore.score >= 60 ? 'good' : tcoData.conditionScore.score >= 40 ? 'fair' : 'poor'}`}>
                {tcoData.conditionScore.score}/100
              </span>
            </div>
            <div className="badge-item">
              <span className="badge-label">Risk Level</span>
              <span className={`badge-value risk risk-${tcoData.expectedUnscheduledRepairCost.total > 3000 ? 'high' : tcoData.expectedUnscheduledRepairCost.total > 1500 ? 'medium' : 'low'}`}>
                {tcoData.expectedUnscheduledRepairCost.total > 3000 ? 'High' : tcoData.expectedUnscheduledRepairCost.total > 1500 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>

          {/* C12 Projection */}
          <div className="tco-section">
            <h4>12-Month Cost Projection (C12)</h4>
            <div className="c12-breakdown">
              <div className="c12-item">
                <span className="c12-label">Immediate Cost Burden (ICB)</span>
                <span className="c12-value">{formatCurrency(tcoData.c12Projection.icb)}</span>
              </div>
              <div className="c12-item">
                <span className="c12-label">Expected Unscheduled Repairs (EURC)</span>
                <span className="c12-value">{formatCurrency(tcoData.c12Projection.eurc)}</span>
              </div>
              <div className="c12-total">
                <span className="c12-label">Total C12</span>
                <span className="c12-value">{formatCurrency(tcoData.c12Projection.total)}</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="tco-section">
            <h4>Total Cost Breakdown ({inputs.timePeriodYears} Years)</h4>
            <div className="cost-breakdown-grid">
              <div className="cost-item">
                <span className="cost-label">Immediate Cost Burden</span>
                <span className="cost-value">{formatCurrency(tcoData.totalCosts.immediateCostBurden)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Projected Routine Maintenance</span>
                <span className="cost-value">{formatCurrency(tcoData.totalCosts.projectedRoutineMaintenance)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Expected Unscheduled Repairs</span>
                <span className="cost-value">{formatCurrency(tcoData.totalCosts.expectedUnscheduledRepairs)}</span>
              </div>
              <div className="cost-item">
                <span className="cost-label">Depreciation</span>
                <span className="cost-value">{formatCurrency(tcoData.totalCosts.depreciation)}</span>
              </div>
              <div className="cost-total">
                <span className="cost-label">Total Costs</span>
                <span className="cost-value">{formatCurrency(tcoData.totalCosts.total)}</span>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="tco-section">
            <h4>Financial Summary</h4>
            <div className="financial-summary">
              <div className="financial-item">
                <span className="financial-label">Purchase Price</span>
                <span className="financial-value">{formatCurrency(tcoData.summary.purchasePrice)}</span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Immediate Cost Burden (ICB)</span>
                <span className="financial-value">{formatCurrency(tcoData.immediateCostBurden.total)}</span>
              </div>
              <div className="financial-item highlight">
                <span className="financial-label">Current Market Value</span>
                <span className="financial-value">{formatCurrency(tcoData.summary.currentValue)}</span>
              </div>
              <div className="financial-item highlight">
                <span className="financial-label">Current Value - (Purchase + ICB)</span>
                <span className={`financial-value ${(tcoData.currentValueMinusPurchaseAndICB || 0) >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(tcoData.currentValueMinusPurchaseAndICB)}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Total Costs Over {inputs.timePeriodYears} Years</span>
                <span className="financial-value">{formatCurrency(tcoData.totalCosts.total)}</span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Total Spent</span>
                <span className="financial-value">{formatCurrency(tcoData.summary.purchasePrice + tcoData.totalCosts.total)}</span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Expected Sale Price ({inputs.timePeriodYears} years)</span>
                <span className="financial-value">{formatCurrency(tcoData.summary.expectedSalePrice)}</span>
              </div>
              <div className="financial-total-loss">
                <span className="financial-label">Total Loss</span>
                <span className="financial-value loss">{formatCurrency(tcoData.totalLoss)}</span>
              </div>
              <div className="financial-item">
                <span className="financial-label">Adjusted Value (Purchase + C12)</span>
                <span className="financial-value">{formatCurrency(tcoData.adjustedValue)}</span>
              </div>
            </div>
          </div>

          {/* Cost Over Time Chart */}
          {chartData.length > 0 && (
            <div className="tco-section">
              <h4>Cost Accumulation Over Time</h4>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="year" 
                    label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelFormatter={(label) => `Year ${label}`}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Routine Maintenance" stroke="#2563eb" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Unscheduled Repairs" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Depreciation" stroke="#6b7280" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Total Cost" stroke="#10b981" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Condition Score Details */}
          <div className="tco-section">
            <h4>Condition Score: {tcoData.conditionScore.score}/100</h4>
            {tcoData.conditionScore.factors && tcoData.conditionScore.factors.length > 0 && (
              <div className="condition-factors">
                {tcoData.conditionScore.factors.map((factor, idx) => (
                  <div key={idx} className={`condition-factor ${factor.impact >= 0 ? 'positive' : 'negative'}`}>
                    <span className="factor-name">{factor.factor}</span>
                    <span className={`factor-impact ${factor.impact >= 0 ? 'positive' : 'negative'}`}>
                      {factor.impact >= 0 ? '+' : ''}{factor.impact} points
                    </span>
                    <span className="factor-details">{factor.details}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expert Notes */}
          <div className="tco-section">
            <h4>Expert Analysis Summary</h4>
            <div className="expert-notes">
              {serviceHistoryAnalysis?.evaluation && (
                <div className="expert-note">
                  <h5>Service History:</h5>
                  <p>{serviceHistoryAnalysis.evaluation.substring(0, 300)}...</p>
                </div>
              )}
              {gapAnalysis?.summary && (
                <div className="expert-note">
                  <h5>Routine Maintenance Gap:</h5>
                  <p>{gapAnalysis.summary}</p>
                </div>
              )}
              {riskEvaluation?.summary && (
                <div className="expert-note">
                  <h5>Unscheduled Risk Assessment:</h5>
                  <p>{riskEvaluation.summary}</p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Breakdowns */}
          {tcoData.immediateCostBurden.items.length > 0 && (
            <div className="tco-section">
              <h4>Immediate Cost Burden Items</h4>
              <div className="breakdown-table">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Cost</th>
                      <th>Status</th>
                      <th>Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tcoData.immediateCostBurden.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.item}</td>
                        <td>{formatCurrency(item.cost)}</td>
                        <td>{item.status}</td>
                        <td>{item.severity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default TotalCostOfOwnershipDisplay

