import { useState, useEffect } from 'react'
import VehicleForm from './components/VehicleForm'
import VehicleComparator from './components/VehicleComparator'
import { getAllPortfolios, deletePortfolio } from './services/api'
import '../../App.css'

function PrototypeApp() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [portfolios, setPortfolios] = useState([])
  const [selectedPortfolioId, setSelectedPortfolioId] = useState('')
  const [loadingPortfolios, setLoadingPortfolios] = useState(false)
  const [activeTab, setActiveTab] = useState('parsed-history')
  const [hasData, setHasData] = useState(false)
  const [showComparator, setShowComparator] = useState(false)
  const [tabData, setTabData] = useState({
    parsedHistory: false,
    serviceAnalysis: false,
    routineMaintenance: false,
    unscheduledMaintenance: false,
    gapAnalysis: false,
    riskEvaluation: false,
    marketValuation: false,
    totalCostOfOwnership: false
  })

  useEffect(() => {
    loadPortfolios()
  }, [])

  const loadPortfolios = async () => {
    try {
      setLoadingPortfolios(true)
      const result = await getAllPortfolios()
      setPortfolios(result.portfolios || [])
    } catch (err) {
      console.error('Error loading portfolios:', err)
    } finally {
      setLoadingPortfolios(false)
    }
  }

  const handleAnalysisComplete = (data) => {
    setLoading(false)
    setError(null)
    loadPortfolios()
  }

  const handleAnalysisStart = () => {
    setLoading(true)
    setError(null)
  }

  const handleError = (err) => {
    setError(err)
    setLoading(false)
  }

  const handlePortfolioSelect = (portfolioId) => {
    setSelectedPortfolioId(portfolioId)
  }

  const handlePortfolioSaved = () => {
    loadPortfolios()
  }

  const handleDeletePortfolio = async () => {
    if (!selectedPortfolioId) {
      return
    }

    const selectedPortfolio = portfolios.find(p => p.portfolioId === selectedPortfolioId)
    const vehicleLabel = selectedPortfolio 
      ? `${selectedPortfolio.vehicleData?.year} ${selectedPortfolio.vehicleData?.make} ${selectedPortfolio.vehicleData?.model}`
      : 'this vehicle'

    if (!window.confirm(`Are you sure you want to delete ${vehicleLabel}? This action cannot be undone.`)) {
      return
    }

    try {
      setLoadingPortfolios(true)
      await deletePortfolio(selectedPortfolioId)
      setSelectedPortfolioId('')
      setHasData(false)
      setTabData({
        parsedHistory: false,
        serviceAnalysis: false,
        routineMaintenance: false,
        unscheduledMaintenance: false,
        gapAnalysis: false,
        riskEvaluation: false,
        marketValuation: false,
        totalCostOfOwnership: false
      })
      await loadPortfolios()
    } catch (err) {
      console.error('Error deleting portfolio:', err)
      setError(`Failed to delete vehicle: ${err.message || 'Unknown error'}`)
    } finally {
      setLoadingPortfolios(false)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dipstik</h1>
        <p>Used Car Negotiation Leverage Platform</p>
      </header>
      <div className="App-container">
        <aside className="App-sidebar">
          <div className="sidebar-section">
            <button
              className={`sidebar-toggle ${showComparator ? 'active' : ''}`}
              onClick={() => setShowComparator(!showComparator)}
            >
              {showComparator ? '← Hide Comparator' : 'Show Comparator →'}
            </button>
          </div>

          <div className="portfolio-selector">
            <label htmlFor="portfolio-select">Portfolio:</label>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                id="portfolio-select"
                value={selectedPortfolioId}
                onChange={(e) => {
                  handlePortfolioSelect(e.target.value)
                }}
                disabled={loadingPortfolios}
                style={{ flex: 1 }}
              >
                <option value="">-- Select a car --</option>
                {portfolios.map((portfolio) => (
                  <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                    {portfolio.vehicleData?.year} {portfolio.vehicleData?.make} {portfolio.vehicleData?.model}
                    {portfolio.vehicleData?.mileage ? ` (${portfolio.vehicleData.mileage.toLocaleString()} mi)` : ''}
                  </option>
                ))}
              </select>
              {selectedPortfolioId && (
                <button
                  onClick={handleDeletePortfolio}
                  disabled={loadingPortfolios}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loadingPortfolios ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    opacity: loadingPortfolios ? 0.6 : 1
                  }}
                  title="Delete selected vehicle"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          {(hasData || selectedPortfolioId) && !showComparator && (
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab ${activeTab === 'parsed-history' ? 'active' : ''}`}
                onClick={() => setActiveTab('parsed-history')}
                disabled={!tabData.parsedHistory}
              >
                Parsed Service History
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'service-analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('service-analysis')}
                disabled={!tabData.serviceAnalysis}
              >
                Service History Analysis
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'routine-maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('routine-maintenance')}
                disabled={!tabData.routineMaintenance}
              >
                Routine Maintenance
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'unscheduled-maintenance' ? 'active' : ''}`}
                onClick={() => setActiveTab('unscheduled-maintenance')}
                disabled={!tabData.unscheduledMaintenance}
              >
                Unscheduled Maintenance
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'gap-analysis' ? 'active' : ''}`}
                onClick={() => setActiveTab('gap-analysis')}
                disabled={!tabData.gapAnalysis}
              >
                Gap Analysis
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'risk-evaluation' ? 'active' : ''}`}
                onClick={() => setActiveTab('risk-evaluation')}
                disabled={!tabData.riskEvaluation}
              >
                Risk Evaluation
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'market-valuation' ? 'active' : ''}`}
                onClick={() => setActiveTab('market-valuation')}
                disabled={!tabData.marketValuation}
              >
                Market Valuation
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'total-cost-of-ownership' ? 'active' : ''}`}
                onClick={() => setActiveTab('total-cost-of-ownership')}
                disabled={!tabData.parsedHistory}
              >
                Total Cost of Ownership
              </button>
            </div>
          )}
        </aside>
        <main className="App-main">
          {showComparator ? (
            <div className="comparator-main-container">
              <VehicleComparator />
            </div>
          ) : (
            <VehicleForm
              onAnalysisStart={handleAnalysisStart}
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
              selectedPortfolioId={selectedPortfolioId}
              onPortfolioSaved={handlePortfolioSaved}
              onPortfolioSelect={handlePortfolioSelect}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onDataChange={setHasData}
              onTabDataChange={setTabData}
            />
          )}
          {loading && (
            <div className="loading">
              <p>Generating reports...</p>
              <p style={{ fontSize: '0.9em', color: '#666' }}>
                Generating routine maintenance → Generating unscheduled maintenance
              </p>
            </div>
          )}
          {error && (
            <div className="error">
              <p>Error: {error}</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default PrototypeApp

