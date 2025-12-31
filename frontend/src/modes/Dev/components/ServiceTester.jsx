import { useState } from 'react'
import { executeModule } from '../services/devApi'
import './ServiceTester.css'

function ServiceTester({ modules, selectedModule, onModuleSelect }) {
  const [params, setParams] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleExecute = async () => {
    if (!selectedModule) {
      setError('Please select a module first')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await executeModule(selectedModule.id, params)
      setResult(response)
    } catch (err) {
      setError(err.message || 'Failed to execute module')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="service-tester">
      <h2>Service Tester</h2>
      
      {!selectedModule && (
        <div className="select-module-prompt">
          <p>Please select a module from the Module Explorer to test</p>
        </div>
      )}

      {selectedModule && (
        <>
          <div className="module-info">
            <h3>Testing: {selectedModule.module?.name || selectedModule.id}</h3>
          </div>

          <div className="test-form">
            <h4>Test Parameters</h4>
            <div className="params-input">
              <textarea
                value={JSON.stringify(params, null, 2)}
                onChange={(e) => {
                  try {
                    setParams(JSON.parse(e.target.value))
                    setError(null)
                  } catch (err) {
                    setError('Invalid JSON')
                  }
                }}
                placeholder='{"vin": "TESTVIN12345678901", "pdfPath": "/path/to/test.pdf"}'
                rows={10}
              />
            </div>
            <button onClick={handleExecute} disabled={loading}>
              {loading ? 'Executing...' : 'Execute Module'}
            </button>
          </div>

          {error && (
            <div className="error-result">
              <h4>Error</h4>
              <pre>{error}</pre>
            </div>
          )}

          {result && (
            <div className="test-result">
              <h4>Result</h4>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ServiceTester


