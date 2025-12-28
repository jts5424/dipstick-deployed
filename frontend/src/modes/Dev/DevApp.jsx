import { useState, useEffect } from 'react'
import ModuleExplorer from './components/ModuleExplorer'
import ServiceTester from './components/ServiceTester'
import MethodComparator from './components/MethodComparator'
import { getModules, getModuleStatus } from './services/devApi'
import './DevApp.css'

function DevApp() {
  const [modules, setModules] = useState([])
  const [selectedModule, setSelectedModule] = useState(null)
  const [activeTab, setActiveTab] = useState('explorer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      setLoading(true)
      const result = await getModules()
      setModules(result.modules || [])
    } catch (err) {
      setError(err.message || 'Failed to load modules')
      console.error('Error loading modules:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleSelect = async (moduleId) => {
    try {
      const status = await getModuleStatus(moduleId)
      setSelectedModule({ id: moduleId, ...status })
    } catch (err) {
      setError(err.message || 'Failed to load module status')
    }
  }

  return (
    <div className="dev-app">
      <header className="dev-header">
        <h1>Dev Admin Interface</h1>
        <p>Module Testing & Development Tools</p>
      </header>
      
      {error && (
        <div className="error-banner">
          <p>Error: {error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <div className="dev-container">
        <aside className="dev-sidebar">
          <div className="sidebar-tabs">
            <button
              className={`sidebar-tab ${activeTab === 'explorer' ? 'active' : ''}`}
              onClick={() => setActiveTab('explorer')}
            >
              Module Explorer
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'tester' ? 'active' : ''}`}
              onClick={() => setActiveTab('tester')}
            >
              Service Tester
            </button>
            <button
              className={`sidebar-tab ${activeTab === 'comparator' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparator')}
            >
              Method Comparator
            </button>
          </div>
        </aside>

        <main className="dev-main">
          {loading && <div className="loading">Loading modules...</div>}
          
          {activeTab === 'explorer' && (
            <ModuleExplorer
              modules={modules}
              selectedModule={selectedModule}
              onModuleSelect={handleModuleSelect}
            />
          )}
          
          {activeTab === 'tester' && (
            <ServiceTester
              modules={modules}
              selectedModule={selectedModule}
              onModuleSelect={handleModuleSelect}
            />
          )}
          
          {activeTab === 'comparator' && (
            <MethodComparator
              modules={modules}
              selectedModule={selectedModule}
              onModuleSelect={handleModuleSelect}
            />
          )}
        </main>
      </div>
    </div>
  )
}

export default DevApp

