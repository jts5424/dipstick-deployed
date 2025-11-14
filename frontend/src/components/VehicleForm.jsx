import { useState } from 'react'
import ServiceHistoryTable from './ServiceHistoryTable'
import './VehicleForm.css'

function VehicleForm({ onAnalysisStart, onAnalysisComplete, onError }) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    mileage: '',
    trim: '',
    engine: '',
    vin: ''
  })
  const [pdfFile, setPdfFile] = useState(null)
  const [parsedServiceHistory, setParsedServiceHistory] = useState(null)
  const [isParsing, setIsParsing] = useState(false)
  const [isServiceHistoryExpanded, setIsServiceHistoryExpanded] = useState(true)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setPdfFile(file)
    // Reset parsed service history when file changes
    setParsedServiceHistory(null)
  }

  const handleParsePdf = async () => {
    if (!pdfFile) {
      onError('Please select a PDF file first')
      return
    }

    setIsParsing(true)
    onError(null)

    try {
      const { parsePdf } = await import('../services/api')
      const result = await parsePdf(pdfFile)
      
      // Store parsed service history
      setParsedServiceHistory(result.serviceHistory)
      
      // Auto-populate form fields if PDF contains vehicle info
      const vehicleInfo = result.serviceHistory?.vehicleInfo || result.vehicleInfo || null
      const metadata = result.serviceHistory?.metadata || {}
      const highestMileage = metadata.mileageRange?.highest || null
      
      // Check if we have vehicle info OR mileage to populate
      const hasVehicleInfoToPopulate = vehicleInfo && (vehicleInfo.make || vehicleInfo.model || vehicleInfo.year || vehicleInfo.trim || vehicleInfo.engine || vehicleInfo.vin)
      const hasMileageToPopulate = highestMileage !== null && highestMileage !== undefined
      
      if (hasVehicleInfoToPopulate || hasMileageToPopulate) {
        // Helper to safely get value (handle null, undefined, empty string)
        const getValue = (value) => {
          if (value === null || value === undefined || value === '') {
            return ''
          }
          return String(value).trim()
        }
        
        setFormData(prev => ({
          ...prev,
          // Update vehicle info fields - use empty string if value is null/undefined, otherwise use the value
          make: vehicleInfo && vehicleInfo.make !== null && vehicleInfo.make !== undefined ? getValue(vehicleInfo.make) : prev.make,
          model: vehicleInfo && vehicleInfo.model !== null && vehicleInfo.model !== undefined ? getValue(vehicleInfo.model) : prev.model,
          year: vehicleInfo && vehicleInfo.year !== null && vehicleInfo.year !== undefined ? getValue(vehicleInfo.year) : prev.year,
          trim: vehicleInfo && vehicleInfo.trim !== null && vehicleInfo.trim !== undefined ? getValue(vehicleInfo.trim) : prev.trim,
          engine: vehicleInfo && vehicleInfo.engine !== null && vehicleInfo.engine !== undefined ? getValue(vehicleInfo.engine) : prev.engine,
          vin: vehicleInfo && vehicleInfo.vin !== null && vehicleInfo.vin !== undefined ? getValue(vehicleInfo.vin) : prev.vin,
          // Update mileage with highest mileage from metadata
          mileage: hasMileageToPopulate ? String(highestMileage) : prev.mileage
        }))
      }
    } catch (error) {
      onError(error.message || 'Failed to parse PDF. Please check the file and try again.')
    } finally {
      setIsParsing(false)
    }
  }

  const validateForm = () => {
    const errors = []

    // Validate make
    if (!formData.make || formData.make.trim().length === 0) {
      errors.push('Make is required')
    } else if (formData.make.trim().length > 50) {
      errors.push('Make must not exceed 50 characters')
    }

    // Validate model
    if (!formData.model || formData.model.trim().length === 0) {
      errors.push('Model is required')
    } else if (formData.model.trim().length > 50) {
      errors.push('Model must not exceed 50 characters')
    }

    // Validate year
    const year = parseInt(formData.year)
    if (!formData.year || isNaN(year)) {
      errors.push('Year must be a valid number')
    } else if (year < 1900) {
      errors.push('Year must be 1900 or later')
    } else if (year > new Date().getFullYear() + 1) {
      errors.push(`Year must be ${new Date().getFullYear() + 1} or earlier`)
    }

    // Validate mileage
    const mileage = parseInt(formData.mileage)
    if (!formData.mileage || isNaN(mileage)) {
      errors.push('Mileage must be a valid number')
    } else if (mileage < 0) {
      errors.push('Mileage must be 0 or greater')
    } else if (mileage > 1000000) {
      errors.push('Mileage must not exceed 1,000,000 miles')
    }

    // PDF validation is handled separately - not required for form validation
    return errors
  }

  const handleGenerateReports = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      onError(validationErrors.join('. '))
      return
    }

    // Check if PDF has been parsed
    if (!parsedServiceHistory) {
      onError('Please parse the PDF first by clicking "Parse Carfax Report"')
      return
    }

    onAnalysisStart()

    try {
      // Trim string fields before sending
      const cleanedData = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        trim: formData.trim.trim() || null,
        engine: formData.engine.trim() || null,
        vin: formData.vin.trim() || null
      }

      // Use parsed service history and generate reports
      const { getRoutineMaintenance, getUnscheduledMaintenance } = await import('../services/api')
      
      // Get routine and unscheduled maintenance in parallel
      const [routineResult, unscheduledResult] = await Promise.all([
        getRoutineMaintenance(cleanedData),
        getUnscheduledMaintenance(cleanedData)
      ])

      // Combine all results
      const data = {
        serviceHistory: parsedServiceHistory,
        routineMaintenance: routineResult.routineMaintenance || [],
        unscheduledMaintenance: unscheduledResult.unscheduledMaintenance || [],
        overallCondition: null
      }

      onAnalysisComplete(data)
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.details) {
        const backendErrors = error.response.data.details.map(d => d.message).join('. ')
        onError(backendErrors)
      } else {
        onError(error.message || 'Failed to generate reports')
      }
    }
  }

  return (
    <form className="vehicle-form">
      <h2>Vehicle Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="make">Make</label>
          <input
            type="text"
            id="make"
            name="make"
            value={formData.make}
            onChange={handleInputChange}
            placeholder="e.g., Toyota"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleInputChange}
            placeholder="e.g., Camry"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="year">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            placeholder="e.g., 2018"
            min="1900"
            max={new Date().getFullYear() + 1}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="mileage">Current Mileage</label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleInputChange}
            placeholder="e.g., 75000"
            min="0"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="trim">Trim (Optional)</label>
          <input
            type="text"
            id="trim"
            name="trim"
            value={formData.trim}
            onChange={handleInputChange}
            placeholder="e.g., LE, XLE, Limited"
          />
        </div>
        <div className="form-group">
          <label htmlFor="engine">Engine (Optional)</label>
          <input
            type="text"
            id="engine"
            name="engine"
            value={formData.engine}
            onChange={handleInputChange}
            placeholder="e.g., 3.5L V6, 2.0L I4 Turbo"
          />
        </div>
        <div className="form-group">
          <label htmlFor="vin">VIN (Optional)</label>
          <input
            type="text"
            id="vin"
            name="vin"
            value={formData.vin}
            onChange={handleInputChange}
            placeholder="17-character VIN"
            maxLength="17"
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="pdfFile">Service History PDF</label>
        <input
          type="file"
          id="pdfFile"
          name="pdfFile"
          accept=".pdf"
          onChange={handleFileChange}
          required
        />
      </div>
      
      <div className="button-group">
        <button 
          type="button" 
          className="parse-button"
          onClick={handleParsePdf}
          disabled={!pdfFile || isParsing}
        >
          {isParsing ? 'Parsing...' : 'Parse Carfax Report'}
        </button>
        
        {parsedServiceHistory && (
          <div className="parse-success">
            ✓ PDF parsed successfully! {parsedServiceHistory.records?.length || 0} service records found.
            {parsedServiceHistory.vehicleInfo && (
              <span> Vehicle info auto-populated above. Please verify and edit if needed.</span>
            )}
          </div>
        )}
        
        <button 
          type="submit" 
          className="submit-button"
          onClick={handleGenerateReports}
          disabled={!parsedServiceHistory}
        >
          Generate Reports
        </button>
      </div>
      
      {/* Show parsed service history after parsing */}
      {parsedServiceHistory && parsedServiceHistory.records && parsedServiceHistory.records.length > 0 && (
        <div className="parsed-history-preview">
          <div 
            className="section-header" 
            onClick={() => setIsServiceHistoryExpanded(!isServiceHistoryExpanded)}
          >
            <h3>Parsed Service History ({parsedServiceHistory.records.length} records)</h3>
            <span className="collapse-icon">
              {isServiceHistoryExpanded ? '−' : '+'}
            </span>
          </div>
          {isServiceHistoryExpanded && (
            <>
              <p className="preview-note">Review the extracted service history below. If it looks correct, click "Generate Reports" above.</p>
              <ServiceHistoryTable records={parsedServiceHistory.records} />
            </>
          )}
        </div>
      )}
    </form>
  )
}

export default VehicleForm

