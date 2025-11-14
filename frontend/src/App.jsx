import { useState } from 'react'
import VehicleForm from './components/VehicleForm'
import ReportDisplay from './components/ReportDisplay'
import './App.css'

function App() {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleAnalysisComplete = (data) => {
    setReportData(data)
    setLoading(false)
    setError(null)
  }

  const handleAnalysisStart = () => {
    setLoading(true)
    setError(null)
    setReportData(null)
  }

  const handleError = (err) => {
    setError(err)
    setLoading(false)
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Dipstik</h1>
        <p>Used Car Negotiation Leverage Platform</p>
      </header>
      <main className="App-main">
        <VehicleForm
          onAnalysisStart={handleAnalysisStart}
          onAnalysisComplete={handleAnalysisComplete}
          onError={handleError}
        />
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
        {reportData && <ReportDisplay reportData={reportData} />}
      </main>
    </div>
  )
}

export default App

