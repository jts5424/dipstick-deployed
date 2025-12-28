import { useState, useEffect } from 'react'
import VehicleForm from './components/VehicleForm'
import VehicleComparator from './components/VehicleComparator'
import { getAllPortfolios } from './services/api'
import './App.css'

function App() {
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
    // Reload portfolios after analysis completes
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
            <select
              id="portfolio-select"
              value={selectedPortfolioId}
              onChange={(e) => {
                // Allow switching portfolios even during analysis
                handlePortfolioSelect(e.target.value)
              }}
              disabled={loadingPortfolios}
            >
              <option value="">-- Select a car --</option>
              {portfolios.map((portfolio) => (
                <option key={portfolio.portfolioId} value={portfolio.portfolioId}>
                  {portfolio.vehicleData?.year} {portfolio.vehicleData?.make} {portfolio.vehicleData?.model}
                  {portfolio.vehicleData?.mileage ? ` (${portfolio.vehicleData.mileage.toLocaleString()} mi)` : ''}
                </option>
              ))}
            </select>
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

export default App

