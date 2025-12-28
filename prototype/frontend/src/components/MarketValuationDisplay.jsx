import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } from 'recharts'
import './MarketValuationDisplay.css'

function MarketValuationDisplay({ valuation, vehicleMileage }) {
  if (!valuation) {
    return <div className="market-valuation-display">No valuation data available.</div>
  }

  const { 
    currentValuation, 
    depreciation, 
    depreciationCurve = [], 
    currentVehiclePosition,
    marketAnalysis,
    valueFactors
  } = valuation

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Prepare chart data
  const chartData = depreciationCurve.map(point => ({
    mileage: point.mileage,
    retailValue: point.retailValue,
    privatePartyValue: point.privatePartyValue,
    age: point.age
  }))

  // Add current vehicle position to chart data if available
  let currentVehiclePoint = null
  if (currentVehiclePosition && vehicleMileage !== undefined) {
    currentVehiclePoint = {
      mileage: currentVehiclePosition.mileage || vehicleMileage,
      retailValue: currentVehiclePosition.retailValue,
      privatePartyValue: currentVehiclePosition.privatePartyValue
    }
  }

  return (
    <div className="market-valuation-display">
      <h3>Market Valuation & Depreciation Analysis</h3>

      {/* Current Valuation */}
      {currentValuation && (
        <section className="valuation-section">
          <h4>Current Market Valuation</h4>
          <div className="valuation-grid">
            <div className="valuation-card">
              <h5>Retail Value</h5>
              <div className="valuation-range">
                <span className="valuation-min">{formatCurrency(currentValuation.retail?.min)}</span>
                <span className="valuation-avg">{formatCurrency(currentValuation.retail?.average)}</span>
                <span className="valuation-max">{formatCurrency(currentValuation.retail?.max)}</span>
              </div>
              <p className="valuation-label">Dealer/Retail Price</p>
            </div>
            <div className="valuation-card">
              <h5>Private Party Value</h5>
              <div className="valuation-range">
                <span className="valuation-min">{formatCurrency(currentValuation.privateParty?.min)}</span>
                <span className="valuation-avg">{formatCurrency(currentValuation.privateParty?.average)}</span>
                <span className="valuation-max">{formatCurrency(currentValuation.privateParty?.max)}</span>
              </div>
              <p className="valuation-label">Private Sale Price</p>
            </div>
            <div className="valuation-card">
              <h5>Trade-In Value</h5>
              <div className="valuation-range">
                <span className="valuation-min">{formatCurrency(currentValuation.tradeIn?.min)}</span>
                <span className="valuation-avg">{formatCurrency(currentValuation.tradeIn?.average)}</span>
                <span className="valuation-max">{formatCurrency(currentValuation.tradeIn?.max)}</span>
              </div>
              <p className="valuation-label">Trade-In Value</p>
            </div>
          </div>
        </section>
      )}

      {/* Depreciation Analysis */}
      {depreciation && (
        <section className="depreciation-section">
          <h4>Depreciation Analysis</h4>
          <div className="depreciation-grid">
            <div className="depreciation-item">
              <span className="depreciation-label">Original MSRP:</span>
              <span className="depreciation-value">{formatCurrency(depreciation.originalMSRP)}</span>
            </div>
            <div className="depreciation-item">
              <span className="depreciation-label">Total Depreciation:</span>
              <span className="depreciation-value">{formatCurrency(depreciation.totalDepreciation)} ({depreciation.totalDepreciationPercent?.toFixed(1)}%)</span>
            </div>
            <div className="depreciation-item">
              <span className="depreciation-label">Annual Depreciation Rate:</span>
              <span className="depreciation-value">{depreciation.annualDepreciationRate?.toFixed(1)}%</span>
            </div>
            <div className="depreciation-item">
              <span className="depreciation-label">Value Retention:</span>
              <span className="depreciation-value">{depreciation.valueRetention?.toFixed(1)}%</span>
            </div>
            {depreciation.mileageImpact && (
              <div className="depreciation-item">
                <span className="depreciation-label">Mileage Impact:</span>
                <span className="depreciation-value">{depreciation.mileageImpact}</span>
              </div>
            )}
          </div>

          {/* Projected Values */}
          {depreciation.projectedValues && (
            <div className="projected-values">
              <h5>Projected Future Values</h5>
              <div className="projected-grid">
                {depreciation.projectedValues.oneYear && (
                  <div className="projected-item">
                    <span className="projected-label">1 Year:</span>
                    <span className="projected-value">Retail: {formatCurrency(depreciation.projectedValues.oneYear.retail)} | Private: {formatCurrency(depreciation.projectedValues.oneYear.privateParty)}</span>
                  </div>
                )}
                {depreciation.projectedValues.twoYears && (
                  <div className="projected-item">
                    <span className="projected-label">2 Years:</span>
                    <span className="projected-value">Retail: {formatCurrency(depreciation.projectedValues.twoYears.retail)} | Private: {formatCurrency(depreciation.projectedValues.twoYears.privateParty)}</span>
                  </div>
                )}
                {depreciation.projectedValues.threeYears && (
                  <div className="projected-item">
                    <span className="projected-label">3 Years:</span>
                    <span className="projected-value">Retail: {formatCurrency(depreciation.projectedValues.threeYears.retail)} | Private: {formatCurrency(depreciation.projectedValues.threeYears.privateParty)}</span>
                  </div>
                )}
                {depreciation.projectedValues.fiveYears && (
                  <div className="projected-item">
                    <span className="projected-label">5 Years:</span>
                    <span className="projected-value">Retail: {formatCurrency(depreciation.projectedValues.fiveYears.retail)} | Private: {formatCurrency(depreciation.projectedValues.fiveYears.privateParty)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Depreciation Graph */}
      {chartData.length > 0 && (
        <section className="chart-section">
          <h4>Depreciation Curve</h4>
          <p className="chart-description">
            Depreciation curve for this model. The highlighted point shows where your vehicle currently sits.
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="mileage" 
                label={{ value: 'Mileage', position: 'insideBottom', offset: -5 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                label={{ value: 'Value ($)', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => `Mileage: ${label.toLocaleString()} miles`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="retailValue" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="Retail Value"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="privatePartyValue" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Private Party Value"
                dot={false}
              />
              {currentVehiclePoint && (
                <ReferenceDot
                  x={currentVehiclePoint.mileage}
                  y={currentVehiclePoint.retailValue}
                  r={8}
                  fill="#ef4444"
                  stroke="#dc2626"
                  strokeWidth={2}
                  label={{ value: 'Your Vehicle', position: 'top', fill: '#ef4444', fontSize: 12 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </section>
      )}

      {/* Current Vehicle Position */}
      {currentVehiclePosition && (
        <section className="position-section">
          <h4>Your Vehicle's Position</h4>
          <div className="position-grid">
            <div className="position-item">
              <span className="position-label">Current Mileage:</span>
              <span className="position-value">{currentVehiclePosition.mileage?.toLocaleString()} miles</span>
            </div>
            <div className="position-item">
              <span className="position-label">Retail Value:</span>
              <span className="position-value">{formatCurrency(currentVehiclePosition.retailValue)}</span>
            </div>
            <div className="position-item">
              <span className="position-label">Private Party Value:</span>
              <span className="position-value">{formatCurrency(currentVehiclePosition.privatePartyValue)}</span>
            </div>
            <div className="position-item">
              <span className="position-label">Depreciation Phase:</span>
              <span className="position-value">{currentVehiclePosition.positionOnCurve}</span>
            </div>
            <div className="position-item">
              <span className="position-label">Value Retention:</span>
              <span className="position-value">{currentVehiclePosition.valueRetention?.toFixed(1)}%</span>
            </div>
            <div className="position-item">
              <span className="position-label">vs. Average:</span>
              <span className="position-value">{currentVehiclePosition.comparisonToAverage}</span>
            </div>
          </div>
        </section>
      )}

      {/* Market Analysis */}
      {marketAnalysis && (
        <section className="market-analysis-section">
          <h4>Market Analysis</h4>
          <div className="market-analysis-grid">
            <div className="market-item">
              <span className="market-label">Market Condition:</span>
              <span className={`market-value market-${marketAnalysis.marketCondition?.toLowerCase()}`}>
                {marketAnalysis.marketCondition}
              </span>
            </div>
            <div className="market-item">
              <span className="market-label">Market Trend:</span>
              <span className="market-value">{marketAnalysis.trends}</span>
            </div>
            <div className="market-item">
              <span className="market-label">Market Segment:</span>
              <span className="market-value">{marketAnalysis.marketSegment}</span>
            </div>
          </div>
          {marketAnalysis.factors && marketAnalysis.factors.length > 0 && (
            <div className="market-factors">
              <h5>Key Market Factors:</h5>
              <ul>
                {marketAnalysis.factors.map((factor, idx) => (
                  <li key={idx}>{factor}</li>
                ))}
              </ul>
            </div>
          )}
          {marketAnalysis.regionalVariations && (
            <div className="regional-variations">
              <h5>Regional Variations:</h5>
              <p>{marketAnalysis.regionalVariations}</p>
            </div>
          )}
        </section>
      )}

      {/* Value Factors */}
      {valueFactors && (
        <section className="value-factors-section">
          <h4>Value Impact Factors</h4>
          <div className="factors-grid">
            {valueFactors.mileageImpact && (
              <div className="factor-item">
                <h5>Mileage Impact</h5>
                <p>{valueFactors.mileageImpact}</p>
              </div>
            )}
            {valueFactors.ageImpact && (
              <div className="factor-item">
                <h5>Age Impact</h5>
                <p>{valueFactors.ageImpact}</p>
              </div>
            )}
            {valueFactors.trimEngineImpact && (
              <div className="factor-item">
                <h5>Trim/Engine Impact</h5>
                <p>{valueFactors.trimEngineImpact}</p>
              </div>
            )}
            {valueFactors.brandReputation && (
              <div className="factor-item">
                <h5>Brand Reputation</h5>
                <p>{valueFactors.brandReputation}</p>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

export default MarketValuationDisplay

