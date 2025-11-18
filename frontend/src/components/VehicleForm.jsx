import { useState, useEffect } from 'react'
import ServiceHistoryTable from './ServiceHistoryTable'
import MaintenanceTable from './MaintenanceTable'
import MarketValuationDisplay from './MarketValuationDisplay'
import TotalCostOfOwnershipDisplay from './TotalCostOfOwnershipDisplay'
import './VehicleForm.css'

function VehicleForm({ onAnalysisStart, onAnalysisComplete, onError, selectedPortfolioId, onPortfolioSaved, onPortfolioSelect, activeTab, setActiveTab, onDataChange, onTabDataChange }) {
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
  const [serviceHistoryAnalysis, setServiceHistoryAnalysis] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [gapAnalysis, setGapAnalysis] = useState(null)
  const [routineMaintenanceSchedule, setRoutineMaintenanceSchedule] = useState(null)
  const [unscheduledMaintenanceRisk, setUnscheduledMaintenanceRisk] = useState(null)
  const [unscheduledMaintenanceItems, setUnscheduledMaintenanceItems] = useState(null)
  const [routineMaintenance, setRoutineMaintenance] = useState(null)
  const [unscheduledMaintenance, setUnscheduledMaintenance] = useState(null)
  const [currentPortfolioId, setCurrentPortfolioId] = useState(null)
  const [marketValuation, setMarketValuation] = useState(null)
  const [isLoadingValuation, setIsLoadingValuation] = useState(false)
  
  // Use activeTab from props if provided, otherwise use local state
  const localActiveTab = activeTab !== undefined ? activeTab : 'parsed-history'
  const setLocalActiveTab = setActiveTab || (() => {})

  // Notify parent when data changes so tabs can be shown
  useEffect(() => {
    const hasData = !!(parsedServiceHistory || serviceHistoryAnalysis || routineMaintenance || 
      unscheduledMaintenance || gapAnalysis || unscheduledMaintenanceRisk || marketValuation)
    if (onDataChange) {
      onDataChange(hasData)
    }
    if (onTabDataChange) {
      onTabDataChange({
        parsedHistory: !!(parsedServiceHistory && parsedServiceHistory.records && parsedServiceHistory.records.length > 0),
        serviceAnalysis: !!serviceHistoryAnalysis,
        routineMaintenance: !!(routineMaintenance && routineMaintenance.length > 0),
        unscheduledMaintenance: !!(unscheduledMaintenance && unscheduledMaintenance.length > 0),
        gapAnalysis: !!gapAnalysis,
        riskEvaluation: !!unscheduledMaintenanceRisk,
        marketValuation: !!marketValuation
      })
    }
  }, [parsedServiceHistory, serviceHistoryAnalysis, routineMaintenance, 
      unscheduledMaintenance, gapAnalysis, unscheduledMaintenanceRisk, marketValuation, onDataChange, onTabDataChange])

  // Load portfolio when selected - allow switching even during analysis
  useEffect(() => {
    if (selectedPortfolioId) {
      // Always allow loading portfolio, even during analysis
      // User should be able to switch to old portfolios while new analysis runs
      loadPortfolio(selectedPortfolioId)
    }
    // Don't clear data when selectedPortfolioId is empty - user might be working on a new car
    // Only clear when explicitly loading a portfolio
  }, [selectedPortfolioId])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPdfFile(file)
      // Reset parsed service history when file changes
      setParsedServiceHistory(null)
      // Clear portfolio selection when selecting a new file
      if (onPortfolioSelect) {
        onPortfolioSelect('')
      }
      setCurrentPortfolioId(null)
      // Clear other analysis data when selecting a new file
      setServiceHistoryAnalysis(null)
      setRoutineMaintenance(null)
      setUnscheduledMaintenance(null)
      setGapAnalysis(null)
      setUnscheduledMaintenanceRisk(null)
      setMarketValuation(null)
    }
  }

  const handleParsePdf = async () => {
    if (!pdfFile) {
      onError('Please select a PDF file first')
      return
    }

    // Clear portfolio selection when parsing a new car
    // This ensures the new car isn't associated with an old portfolio
    if (onPortfolioSelect) {
      onPortfolioSelect('')
    }
    setCurrentPortfolioId(null)
    
    // Clear previous analysis results when parsing a new car
    setServiceHistoryAnalysis(null)
    setRoutineMaintenance(null)
    setUnscheduledMaintenance(null)
    setGapAnalysis(null)
    setUnscheduledMaintenanceRisk(null)

    setIsParsing(true)
    onError(null)

    try {
      const { parsePdf } = await import('../services/api')
      const result = await parsePdf(pdfFile)
      
      // Store parsed service history
      setParsedServiceHistory(result.serviceHistory)
      
      // Save to portfolio immediately after parsing (with just parsed data)
      const cleanedData = {
        make: formData.make.trim() || null,
        model: formData.model.trim() || null,
        year: formData.year ? parseInt(formData.year) : null,
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        trim: formData.trim.trim() || null,
        engine: formData.engine.trim() || null,
        vin: formData.vin.trim() || null
      }
      
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
        
        // Update cleanedData with auto-populated values
        if (vehicleInfo && vehicleInfo.make) cleanedData.make = vehicleInfo.make
        if (vehicleInfo && vehicleInfo.model) cleanedData.model = vehicleInfo.model
        if (vehicleInfo && vehicleInfo.year) cleanedData.year = vehicleInfo.year
        if (vehicleInfo && vehicleInfo.trim) cleanedData.trim = vehicleInfo.trim
        if (vehicleInfo && vehicleInfo.engine) cleanedData.engine = vehicleInfo.engine
        if (vehicleInfo && vehicleInfo.vin) cleanedData.vin = vehicleInfo.vin
        if (hasMileageToPopulate) cleanedData.mileage = highestMileage
      }
      
      // Save to portfolio immediately after parsing
      const savedPortfolioId = await saveToPortfolio(cleanedData, result.serviceHistory, null, null, null, null, null, null)
      
      // Refresh portfolio list so new car appears in dropdown
      if (onPortfolioSaved) {
        onPortfolioSaved()
      }
      
      // Switch to parsed history tab
      if (setLocalActiveTab) {
        setLocalActiveTab('parsed-history')
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

  // Helper function to check if data exists
  const hasData = (data) => {
    if (!data) return false
    if (Array.isArray(data)) return data.length > 0
    if (typeof data === 'object') return Object.keys(data).length > 0
    return true
  }

  const handleAnalyze = async (e) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      onError(validationErrors.join('. '))
      return
    }

    // Check if PDF has been parsed
    if (!parsedServiceHistory) {
      onError('Please parse the PDF first')
      return
    }

    setIsAnalyzing(true)
    setAnalysisStatus('Starting analysis...')
    onError(null)
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

      const { 
        analyzeServiceHistory, 
        getRoutineMaintenance, 
        getUnscheduledMaintenance,
        performGapAnalysis,
        evaluateUnscheduledMaintenanceRisk,
        getMarketValuation
      } = await import('../services/api')

      // Step 1: Analyze service history (skip if already exists)
      let serviceHistoryResult = null
      if (!hasData(serviceHistoryAnalysis)) {
        setAnalysisStatus('Analyzing service history for expert evaluation...')
        serviceHistoryResult = await analyzeServiceHistory(cleanedData, parsedServiceHistory)
        setServiceHistoryAnalysis(serviceHistoryResult.analysis)
      } else {
        setAnalysisStatus('Service history analysis already exists, skipping...')
        serviceHistoryResult = { analysis: serviceHistoryAnalysis }
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Step 2: Generate maintenance schedules (skip if already exists)
      let routineResult = null
      let unscheduledResult = null
      
      // Check if we need to fetch routine maintenance
      if (!hasData(routineMaintenance)) {
        setAnalysisStatus('Generating routine maintenance schedule...')
        routineResult = await getRoutineMaintenance(cleanedData)
        setRoutineMaintenance(routineResult.routineMaintenance || [])
        setRoutineMaintenanceSchedule(routineResult.routineMaintenance || [])
      } else {
        setAnalysisStatus('Routine maintenance already exists, skipping...')
        routineResult = { routineMaintenance }
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      // Check if we need to fetch unscheduled maintenance
      if (!hasData(unscheduledMaintenance)) {
        setAnalysisStatus('Generating unscheduled maintenance schedule...')
        unscheduledResult = await getUnscheduledMaintenance(cleanedData)
        setUnscheduledMaintenance(unscheduledResult.unscheduledMaintenance || [])
        setUnscheduledMaintenanceItems(unscheduledResult.unscheduledMaintenance || [])
      } else {
        setAnalysisStatus('Unscheduled maintenance already exists, skipping...')
        unscheduledResult = { unscheduledMaintenance }
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Step 3: Perform gap analysis (skip if already exists)
      let gapResult = null
      if (!hasData(gapAnalysis)) {
        setAnalysisStatus('Performing maintenance gap analysis...')
        gapResult = await performGapAnalysis(cleanedData, parsedServiceHistory, routineResult.routineMaintenance || routineMaintenance || [])
        setGapAnalysis(gapResult.gapAnalysis)
      } else {
        setAnalysisStatus('Gap analysis already exists, skipping...')
        gapResult = { gapAnalysis }
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Step 4: Evaluate unscheduled maintenance risk (skip if already exists)
      let riskResult = null
      if (!hasData(unscheduledMaintenanceRisk)) {
        setAnalysisStatus('Evaluating unscheduled maintenance risk...')
        riskResult = await evaluateUnscheduledMaintenanceRisk(
          cleanedData,
          parsedServiceHistory,
          serviceHistoryResult.analysis || serviceHistoryAnalysis,
          unscheduledResult.unscheduledMaintenance || unscheduledMaintenance || []
        )
        setUnscheduledMaintenanceRisk(riskResult.riskEvaluation)
      } else {
        setAnalysisStatus('Risk evaluation already exists, skipping...')
        riskResult = { riskEvaluation: unscheduledMaintenanceRisk }
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Step 5: Get market valuation (skip if already exists)
      let valuationResult = null
      if (!hasData(marketValuation)) {
        setAnalysisStatus('Calculating market valuation...')
        const apiResult = await getMarketValuation(cleanedData)
        // API returns { success: true, valuation: {...} }
        // valuation is the full object with currentValuation, depreciation, etc.
        const valuationData = apiResult.valuation || apiResult
        setMarketValuation(valuationData)
        valuationResult = { valuation: valuationData }
      } else {
        setAnalysisStatus('Market valuation already exists, skipping...')
        valuationResult = { valuation: marketValuation }
        await new Promise(resolve => setTimeout(resolve, 300))
      }

      // Combine all results for ReportDisplay component
      const data = {
        serviceHistory: parsedServiceHistory,
        routineMaintenance: routineResult.routineMaintenance || [],
        unscheduledMaintenance: unscheduledResult.unscheduledMaintenance || [],
        overallCondition: null
      }

      setAnalysisStatus('Analysis complete!')
      onAnalysisComplete(data)
      
      // Save to portfolio (use existing data if service was skipped)
      await saveToPortfolio(
        cleanedData, 
        parsedServiceHistory, 
        serviceHistoryResult?.analysis || serviceHistoryAnalysis, 
        routineResult?.routineMaintenance || routineMaintenance || [], 
        unscheduledResult?.unscheduledMaintenance || unscheduledMaintenance || [],
        gapResult?.gapAnalysis || gapAnalysis, 
        riskResult?.riskEvaluation || unscheduledMaintenanceRisk,
        valuationResult?.valuation || marketValuation
      )
      
      // Switch to gap analysis tab
      if (setLocalActiveTab) {
        setLocalActiveTab('gap-analysis')
      }
    } catch (error) {
      // Handle validation errors from backend
      if (error.response?.data?.details) {
        const backendErrors = error.response.data.details.map(d => d.message).join('. ')
        onError(backendErrors)
      } else {
        onError(error.message || 'Failed to complete analysis')
      }
      setAnalysisStatus('')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDeleteSection = async (fieldName) => {
    if (!currentPortfolioId) {
      onError('No portfolio selected')
      return
    }

    if (!window.confirm(`Are you sure you want to delete this section? You can rerun the analysis to regenerate it.`)) {
      return
    }

    try {
      const { deletePortfolioField } = await import('../services/api')
      await deletePortfolioField(currentPortfolioId, fieldName)
      
      // Clear the corresponding state
      switch (fieldName) {
        case 'parsedServiceHistory':
          setParsedServiceHistory(null)
          break
        case 'serviceHistoryAnalysis':
          setServiceHistoryAnalysis(null)
          break
        case 'routineMaintenance':
          setRoutineMaintenance(null)
          setRoutineMaintenanceSchedule(null)
          break
        case 'unscheduledMaintenance':
          setUnscheduledMaintenance(null)
          setUnscheduledMaintenanceItems(null)
          break
        case 'gapAnalysis':
          setGapAnalysis(null)
          break
        case 'riskEvaluation':
          setUnscheduledMaintenanceRisk(null)
          break
        case 'marketValuation':
          setMarketValuation(null)
          break
      }
      
      // Reload portfolio to get updated data
      if (currentPortfolioId) {
        await loadPortfolio(currentPortfolioId)
      }
    } catch (error) {
      onError(error.message || 'Failed to delete section')
    }
  }

  const loadPortfolio = async (portfolioId) => {
    try {
      const { getPortfolio } = await import('../services/api')
      const result = await getPortfolio(portfolioId)
      
      if (result.portfolio) {
        const portfolio = result.portfolio
        
        // Clear all existing data first to prevent showing wrong vehicle's data
        setPdfFile(null)
        setParsedServiceHistory(null)
        setServiceHistoryAnalysis(null)
        setRoutineMaintenance(null)
        setUnscheduledMaintenance(null)
        setGapAnalysis(null)
        setUnscheduledMaintenanceRisk(null)
        setMarketValuation(null)
        
        // Reset file input
        const fileInput = document.getElementById('pdfFile')
        if (fileInput) {
          fileInput.value = ''
        }
        
        // Load vehicle data
        setFormData({
          make: portfolio.vehicleData?.make || '',
          model: portfolio.vehicleData?.model || '',
          year: portfolio.vehicleData?.year?.toString() || '',
          mileage: portfolio.vehicleData?.mileage?.toString() || '',
          trim: portfolio.vehicleData?.trim || '',
          engine: portfolio.vehicleData?.engine || '',
          vin: portfolio.vehicleData?.vin || ''
        })
        
        // Load all analysis data
        if (portfolio.parsedServiceHistory) {
          setParsedServiceHistory(portfolio.parsedServiceHistory)
        }
        if (portfolio.serviceHistoryAnalysis) {
          setServiceHistoryAnalysis(portfolio.serviceHistoryAnalysis)
        }
        if (portfolio.routineMaintenance) {
          setRoutineMaintenance(portfolio.routineMaintenance)
          setRoutineMaintenanceSchedule(portfolio.routineMaintenance)
        }
        if (portfolio.unscheduledMaintenance) {
          setUnscheduledMaintenance(portfolio.unscheduledMaintenance)
          setUnscheduledMaintenanceItems(portfolio.unscheduledMaintenance)
        }
        if (portfolio.gapAnalysis) {
          setGapAnalysis(portfolio.gapAnalysis)
        }
        if (portfolio.riskEvaluation) {
          setUnscheduledMaintenanceRisk(portfolio.riskEvaluation)
        }
        if (portfolio.marketValuation) {
          // Handle both old format (valuation) and new format (currentValuation)
          const marketVal = portfolio.marketValuation
          if (marketVal.valuation && !marketVal.currentValuation) {
            // Convert old format to new format
            setMarketValuation({
              ...marketVal,
              currentValuation: marketVal.valuation
            })
          } else {
            setMarketValuation(marketVal)
          }
        }
        
        setCurrentPortfolioId(portfolioId)
        if (setLocalActiveTab) {
          setLocalActiveTab('parsed-history')
        }
      }
    } catch (error) {
      onError(error.message || 'Failed to load portfolio')
    }
  }

  const saveToPortfolio = async (vehicleData, parsedServiceHistory, serviceHistoryAnalysis,
    routineMaintenance, unscheduledMaintenance, gapAnalysis, riskEvaluation, marketValuation = null) => {
    try {
      const { savePortfolio } = await import('../services/api')
      
      const portfolioData = {
        portfolioId: currentPortfolioId, // Will create new if null
        vehicleData: {
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          mileage: vehicleData.mileage,
          trim: vehicleData.trim,
          engine: vehicleData.engine,
          vin: vehicleData.vin
        },
        parsedServiceHistory,
        serviceHistoryAnalysis,
        routineMaintenance,
        unscheduledMaintenance,
        gapAnalysis,
        riskEvaluation,
        marketValuation
      }
      
      const result = await savePortfolio(portfolioData)
      setCurrentPortfolioId(result.portfolioId)
      return result.portfolioId
    } catch (error) {
      console.error('Error saving portfolio:', error)
      // Don't show error to user as this is a background operation
      return null
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
          {isParsing ? 'Parsing...' : 'Parse'}
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
          type="button" 
          className="analyze-button"
          onClick={handleAnalyze}
          disabled={!parsedServiceHistory || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>

        {isAnalyzing && analysisStatus && (
          <div className="analysis-status">
            <p>{analysisStatus}</p>
          </div>
        )}
      </div>

      {/* Tab Content */}
      {(parsedServiceHistory || serviceHistoryAnalysis || routineMaintenance || unscheduledMaintenance || gapAnalysis || unscheduledMaintenanceRisk) && (
        <div className="tabs-content-container">
          {/* Tab 1: Parsed Service History */}
          {localActiveTab === 'parsed-history' && parsedServiceHistory && parsedServiceHistory.records && parsedServiceHistory.records.length > 0 && (
            <div className="tab-content">
              <div className="parsed-history-preview">
                <div className="section-header">
                  <h3>Parsed Service History ({parsedServiceHistory.records.length} records)</h3>
                  {currentPortfolioId && (
                    <button 
                      type="button" 
                      className="delete-section-btn"
                      onClick={() => handleDeleteSection('parsedServiceHistory')}
                      title="Delete this section to rerun parsing"
                    >
                      Delete Section
                    </button>
                  )}
                </div>
                <p className="preview-note">Review the extracted service history below.</p>
                <ServiceHistoryTable records={parsedServiceHistory.records} />
              </div>
            </div>
          )}

          {/* Tab 2: Service History Expert Analysis */}
          {localActiveTab === 'service-analysis' && serviceHistoryAnalysis && (
            <div className="tab-content">
              <div className="service-history-analysis">
                <div className="section-header">
                  <h3>Service History Expert Analysis</h3>
                  {currentPortfolioId && (
                    <button 
                      type="button" 
                      className="delete-section-btn"
                      onClick={() => handleDeleteSection('serviceHistoryAnalysis')}
                      title="Delete this section to rerun analysis"
                    >
                      Delete Section
                    </button>
                  )}
                </div>
                {serviceHistoryAnalysis.evaluation && (
                  <div className="analysis-section">
                    <h4>Overall Evaluation</h4>
                    <p className="evaluation-text">{serviceHistoryAnalysis.evaluation}</p>
                  </div>
                )}

                {serviceHistoryAnalysis.suspiciousItems && serviceHistoryAnalysis.suspiciousItems.length > 0 && (
                  <div className="analysis-section">
                    <h4>Suspicious Patterns</h4>
                    <ul>
                      {serviceHistoryAnalysis.suspiciousItems.map((item, idx) => (
                        <li key={idx}>
                          <strong>{item.item}</strong> ({item.severity} severity)
                          <p>{item.explanation}</p>
                          {item.relatedRecords && item.relatedRecords.length > 0 && (
                            <p><em>Related records: {item.relatedRecords.join(', ')}</em></p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {serviceHistoryAnalysis.anomalies && serviceHistoryAnalysis.anomalies.length > 0 && (
                  <div className="analysis-section">
                    <h4>Anomalies & Concerns</h4>
                    <ul>
                      {serviceHistoryAnalysis.anomalies.map((anomaly, idx) => (
                        <li key={idx}>
                          <strong>{anomaly.item}</strong> ({anomaly.type})
                          <p>{anomaly.explanation}</p>
                          <p><em>Concern: {anomaly.concern}</em></p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {serviceHistoryAnalysis.frequentServices && serviceHistoryAnalysis.frequentServices.length > 0 && (
                  <div className="analysis-section">
                    <h4>Services Performed More Than Normal</h4>
                    <ul>
                      {serviceHistoryAnalysis.frequentServices.map((service, idx) => (
                        <li key={idx}>
                          <strong>{service.service}</strong>
                          <p>Frequency: {service.frequency} | Normal: {service.normalFrequency}</p>
                          <p>Interpretation: {service.interpretation}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {serviceHistoryAnalysis.expertNotes && serviceHistoryAnalysis.expertNotes.length > 0 && (
                  <div className="analysis-section">
                    <h4>Expert Notes</h4>
                    <ul>
                      {serviceHistoryAnalysis.expertNotes.map((note, idx) => (
                        <li key={idx}>
                          <strong>{note.category}:</strong> {note.note}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Routine Maintenance */}
          {localActiveTab === 'routine-maintenance' && routineMaintenance && routineMaintenance.length > 0 && (
            <div className="tab-content">
              <div className="maintenance-section">
                <div className="section-header">
                  <h3>Routine Maintenance Schedule</h3>
                  {currentPortfolioId && (
                    <button 
                      type="button" 
                      className="delete-section-btn"
                      onClick={() => handleDeleteSection('routineMaintenance')}
                      title="Delete this section to rerun generation"
                    >
                      Delete Section
                    </button>
                  )}
                </div>
                <MaintenanceTable data={routineMaintenance} type="routine" />
              </div>
            </div>
          )}

          {/* Tab 4: Unscheduled Maintenance */}
          {localActiveTab === 'unscheduled-maintenance' && unscheduledMaintenance && unscheduledMaintenance.length > 0 && (
            <div className="tab-content">
              <div className="maintenance-section">
                <div className="section-header">
                  <h3>Unscheduled Maintenance Forecast</h3>
                  {currentPortfolioId && (
                    <button 
                      type="button" 
                      className="delete-section-btn"
                      onClick={() => handleDeleteSection('unscheduledMaintenance')}
                      title="Delete this section to rerun generation"
                    >
                      Delete Section
                    </button>
                  )}
                </div>
                <MaintenanceTable data={unscheduledMaintenance} type="unscheduled" />
              </div>
            </div>
          )}

          {/* Tab 5: Gap Analysis */}
          {localActiveTab === 'gap-analysis' && gapAnalysis && (
            <div className="tab-content">
              <div className="gap-analysis-results">
                <div className="section-header">
                  <h3>Maintenance Gap Analysis</h3>
                  {currentPortfolioId && (
                    <button 
                      type="button" 
                      className="delete-section-btn"
                      onClick={() => handleDeleteSection('gapAnalysis')}
                      title="Delete this section to rerun analysis"
                    >
                      Delete Section
                    </button>
                  )}
                </div>
                {gapAnalysis.summary && (
                  <div className="gap-summary">
                    <p><strong>Summary:</strong> {gapAnalysis.summary}</p>
                  </div>
                )}

                {/* Single table with all maintenance items */}
                {gapAnalysis.allItems && gapAnalysis.allItems.length > 0 && (
                  <div className="gap-section">
                    <h4>All Routine Maintenance Items ({gapAnalysis.allItems.length})</h4>
                    <p className="section-description">Complete status of all routine maintenance items based on service history comparison.</p>
                    <div className="table-container">
                      <table className="maintenance-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Status</th>
                            <th>Status Details</th>
                            <th>Last Performed</th>
                            <th>Interval</th>
                            <th>Next Due</th>
                            <th>Severity</th>
                            <th>Risk Note</th>
                            <th>Cost Range</th>
                            <th>OEM Cost</th>
                            <th>Complete Before Purchase?</th>
                          </tr>
                        </thead>
                        <tbody>
                          {gapAnalysis.allItems.map((item, idx) => {
                            const rowClass = item.status === 'Overdue' 
                              ? (item.severity === 'Critical' ? 'critical-row' : item.severity === 'High' ? 'high-row' : '')
                              : item.status === 'Due Now'
                              ? 'due-row'
                              : ''
                            return (
                              <tr key={idx} className={rowClass}>
                                <td><strong>{item.item}</strong></td>
                                <td>
                                  <span className={`status-badge status-${item.status?.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td>{item.status_info}</td>
                                <td>{item.last_performed}</td>
                                <td>{item.interval}</td>
                                <td>{item.next_due}</td>
                                <td>
                                  {item.severity && item.status === 'Overdue' ? (
                                    <span className={`severity-badge severity-${item.severity?.toLowerCase()}`}>
                                      {item.severity}
                                    </span>
                                  ) : 'N/A'}
                                </td>
                                <td>{item.risk_note}</td>
                                <td>{item.cost_range}</td>
                                <td>{item.oem_cost}</td>
                                <td><strong>{item.should_complete_before_purchase}</strong></td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(!gapAnalysis.allItems || gapAnalysis.allItems.length === 0) && (
                  <p>No gap analysis items found. All maintenance appears to be up to date.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 6: Risk Evaluation */}
          {localActiveTab === 'risk-evaluation' && unscheduledMaintenanceRisk && (
            <div className="tab-content">
              <div className="risk-evaluation-results">
                <div className="section-header">
                  <h3>Unscheduled Maintenance Risk Evaluation</h3>
                  {currentPortfolioId && (
                    <button 
                      type="button" 
                      className="delete-section-btn"
                      onClick={() => handleDeleteSection('riskEvaluation')}
                      title="Delete this section to rerun evaluation"
                    >
                      Delete Section
                    </button>
                  )}
                </div>
                {unscheduledMaintenanceRisk.summary && (
                  <div className="risk-summary">
                    <p><strong>Summary:</strong> {unscheduledMaintenanceRisk.summary}</p>
                  </div>
                )}

                {/* Single table with all unscheduled maintenance items */}
                {unscheduledMaintenanceRisk.allItems && unscheduledMaintenanceRisk.allItems.length > 0 && (
                  <div className="risk-section">
                    <h4>All Unscheduled Maintenance Items ({unscheduledMaintenanceRisk.allItems.length} items)</h4>
                    <p className="section-description">Complete risk evaluation of all unscheduled maintenance items based on service history, mileage, and maintenance quality.</p>
                    <div className="table-container">
                      <table className="maintenance-table">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>Forecast Mileage</th>
                            <th>Probability</th>
                            <th>Risk Level</th>
                            <th>Risk Score</th>
                            <th>Already Fixed?</th>
                            <th>Mileage Risk</th>
                            <th>Miles Until Failure</th>
                            <th>Maintenance Quality</th>
                            <th>Recommendation</th>
                            <th>Urgency</th>
                            <th>Confidence</th>
                          </tr>
                        </thead>
                        <tbody>
                          {unscheduledMaintenanceRisk.allItems.map((item, idx) => {
                            const riskClass = item.risk_level === 'Critical' ? 'critical-row' 
                              : item.risk_level === 'High' ? 'high-row'
                              : item.risk_level === 'Already Fixed/Replaced' ? 'fixed-row'
                              : ''
                            return (
                              <tr key={idx} className={riskClass}>
                                <td><strong>{item.item}</strong></td>
                                <td>{item.forecast_mileage}</td>
                                <td>{item.probability}</td>
                                <td>
                                  <span className={`risk-badge risk-${item.risk_level?.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '')}`}>
                                    {item.risk_level}
                                  </span>
                                </td>
                                <td>
                                  {item.risk_score !== null ? (
                                    <span className={`risk-score risk-score-${item.risk_score >= 75 ? 'high' : item.risk_score >= 50 ? 'medium' : 'low'}`}>
                                      {item.risk_score}
                                    </span>
                                  ) : 'N/A'}
                                </td>
                                <td>{item.already_fixed}</td>
                                <td>{item.mileage_risk}</td>
                                <td>{item.miles_until_failure}</td>
                                <td>{item.maintenance_quality}</td>
                                <td>{item.recommendation}</td>
                                <td>
                                  <span className={`urgency-badge urgency-${item.urgency?.toLowerCase().replace(/\s+/g, '-')}`}>
                                    {item.urgency}
                                  </span>
                                </td>
                                <td>{item.confidence}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {(!unscheduledMaintenanceRisk.allItems || unscheduledMaintenanceRisk.allItems.length === 0) && (
                  <p>No risk evaluation items found.</p>
                )}
              </div>
            </div>
          )}

          {/* Tab 7: Market Valuation */}
          {localActiveTab === 'market-valuation' && marketValuation && (
            <div className="tab-content">
              <div className="section-header">
                <h3>Market Valuation & Depreciation Analysis</h3>
                {currentPortfolioId && (
                  <button 
                    type="button" 
                    className="delete-section-btn"
                    onClick={() => handleDeleteSection('marketValuation')}
                    title="Delete this section to rerun valuation"
                  >
                    Delete Section
                  </button>
                )}
              </div>
              <MarketValuationDisplay 
                valuation={marketValuation} 
                vehicleMileage={formData.mileage ? parseInt(formData.mileage) : undefined}
              />
            </div>
          )}

          {/* Tab 8: Total Cost of Ownership */}
          {localActiveTab === 'total-cost-of-ownership' && (
            <div className="tab-content">
              <TotalCostOfOwnershipDisplay
                vehicleData={{
                  make: formData.make,
                  model: formData.model,
                  year: parseInt(formData.year),
                  mileage: parseInt(formData.mileage),
                  trim: formData.trim,
                  engine: formData.engine,
                  vin: formData.vin
                }}
                gapAnalysis={gapAnalysis}
                riskEvaluation={unscheduledMaintenanceRisk}
                serviceHistoryAnalysis={serviceHistoryAnalysis}
                routineMaintenance={routineMaintenance}
                marketValuation={marketValuation}
              />
            </div>
          )}
        </div>
      )}
    </form>
  )
}

export default VehicleForm

