import { useState } from 'react'
import MaintenanceTable from './MaintenanceTable'
import './ReportDisplay.css'

function ReportDisplay({ reportData }) {
  const [expandedSections, setExpandedSections] = useState({
    routineMaintenance: true,
    unscheduledMaintenance: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="report-display">
      <h2>Vehicle Analysis Report</h2>
      
      {/* Routine Maintenance */}
      {reportData.routineMaintenance && reportData.routineMaintenance.length > 0 && (
        <section className="report-section">
          <div className="section-header" onClick={() => toggleSection('routineMaintenance')}>
            <h3>Expert Recommended Routine Maintenance</h3>
            <span className="collapse-icon">{expandedSections.routineMaintenance ? '−' : '+'}</span>
          </div>
          {expandedSections.routineMaintenance && (
            <MaintenanceTable data={reportData.routineMaintenance} type="routine" />
          )}
        </section>
      )}

      {/* Unscheduled Maintenance */}
      {reportData.unscheduledMaintenance && reportData.unscheduledMaintenance.length > 0 && (
        <section className="report-section">
          <div className="section-header" onClick={() => toggleSection('unscheduledMaintenance')}>
            <h3>Unscheduled Maintenance Forecast</h3>
            <span className="collapse-icon">{expandedSections.unscheduledMaintenance ? '−' : '+'}</span>
          </div>
          {expandedSections.unscheduledMaintenance && (
            <MaintenanceTable data={reportData.unscheduledMaintenance} type="unscheduled" />
          )}
        </section>
      )}
    </div>
  )
}

export default ReportDisplay

