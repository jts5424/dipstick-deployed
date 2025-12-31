import { useState } from 'react'
import './ModuleExplorer.css'

function ModuleExplorer({ modules, selectedModule, onModuleSelect }) {
  return (
    <div className="module-explorer">
      <h2>Module Explorer</h2>
      
      <div className="modules-list">
        {modules.length === 0 ? (
          <p className="no-modules">No modules available</p>
        ) : (
          modules.map((module) => (
            <div
              key={module.id}
              className={`module-card ${selectedModule?.id === module.id ? 'selected' : ''}`}
              onClick={() => onModuleSelect(module.id)}
            >
              <h3>{module.name || module.id}</h3>
              <p className="module-description">{module.description || 'No description'}</p>
              {module.services && (
                <div className="module-services">
                  <span className="services-count">{module.services.length} service(s)</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {selectedModule && (
        <div className="module-details">
          <h3>Module Details: {selectedModule.module?.id || selectedModule.id}</h3>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">ID:</span>
              <span className="detail-value">{selectedModule.module?.id || selectedModule.id}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Name:</span>
              <span className="detail-value">{selectedModule.module?.name || 'N/A'}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Services:</span>
              <span className="detail-value">{selectedModule.services?.length || 0}</span>
            </div>
          </div>

          {selectedModule.services && selectedModule.services.length > 0 && (
            <div className="services-list">
              <h4>Services</h4>
              {selectedModule.services.map((service) => (
                <div key={service.id} className="service-item">
                  <h5>{service.name || service.id}</h5>
                  <p>{service.description || 'No description'}</p>
                  {service.methods && (
                    <div className="methods-list">
                      <span className="methods-count">{service.methods.length} method(s)</span>
                      <ul>
                        {service.methods.map((method) => (
                          <li key={method.id}>{method.name || method.id}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ModuleExplorer


