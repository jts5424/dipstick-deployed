import { useState } from 'react'
import { compareMethods } from '../services/devApi'
import './MethodComparator.css'

function MethodComparator({ modules, selectedModule, onModuleSelect }) {
  const [serviceId, setServiceId] = useState('')
  const [methodIds, setMethodIds] = useState([])
  const [params, setParams] = useState({})
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCompare = async () => {
    if (!selectedModule) {
      setError('Please select a module first')
      return
    }

    if (!serviceId) {
      setError('Please select a service')
      return
    }

    if (methodIds.length < 2) {
      setError('Please select at least 2 methods to compare')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await compareMethods(selectedModule.id, serviceId, methodIds, params)
      setResult(response)
    } catch (err) {
      setError(err.message || 'Failed to compare methods')
    } finally {
      setLoading(false)
    }
  }

  const toggleMethod = (methodId) => {
    setMethodIds(prev => 
      prev.includes(methodId)
        ? prev.filter(id => id !== methodId)
        : [...prev, methodId]
    )
  }

  return (
    <div className="method-comparator">
      <h2>Method Comparator</h2>
      
      {!selectedModule && (
        <div className="select-module-prompt">
          <p>Please select a module from the Module Explorer to compare methods</p>
        </div>
      )}

      {selectedModule && (
        <>
          <div className="module-info">
            <h3>Module: {selectedModule.module?.name || selectedModule.id}</h3>
          </div>

          <div className="comparison-form">
            <div className="form-section">
              <h4>Select Service</h4>
              <select
                value={serviceId}
                onChange={(e) => {
                  setServiceId(e.target.value)
                  setMethodIds([])
                }}
              >
                <option value="">-- Select a service --</option>
                {selectedModule.services?.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name || service.id}
                  </option>
                ))}
              </select>
            </div>

            {serviceId && selectedModule.services?.find(s => s.id === serviceId)?.methods && (
              <div className="form-section">
                <h4>Select Methods to Compare (at least 2)</h4>
                <div className="methods-checkboxes">
                  {selectedModule.services.find(s => s.id === serviceId).methods.map((method) => (
                    <label key={method.id} className="method-checkbox">
                      <input
                        type="checkbox"
                        checked={methodIds.includes(method.id)}
                        onChange={() => toggleMethod(method.id)}
                      />
                      <span>{method.name || method.id}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="form-section">
              <h4>Test Parameters</h4>
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
                rows={8}
              />
            </div>

            <button onClick={handleCompare} disabled={loading || methodIds.length < 2}>
              {loading ? 'Comparing...' : 'Compare Methods'}
            </button>
          </div>

          {error && (
            <div className="error-result">
              <h4>Error</h4>
              <pre>{error}</pre>
            </div>
          )}

          {result && (
            <div className="comparison-result">
              <h4>Comparison Results</h4>
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MethodComparator


