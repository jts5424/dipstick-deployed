/**
 * METHOD: Vehicle Databases API
 * 
 * Fetches vehicle history from Vehicle Databases service history API
 */

export default {
  id: 'vehicle-databases-api',
  name: 'Vehicle Databases API',
  description: 'Fetch vehicle history from Vehicle Databases service history API',
  
  async execute(params) {
    const { vin, apiKey, apiUrl } = params
    
    if (!vin || vin.length !== 17) {
      throw new Error('Valid 17-character VIN is required')
    }
    
    if (!apiKey) {
      throw new Error('API key is required')
    }
    
    const baseUrl = apiUrl || 'https://api.vehicledatabases.com/v1'
    const endpoint = `${baseUrl}/service-history`
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'X-API-Key': apiKey
        },
        body: JSON.stringify({ vin })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.message || 
          `API request failed with status ${response.status}`
        )
      }
      
      const apiData = await response.json()
      
      // Transform to standard format
      const records = (apiData.serviceHistory || apiData.records || []).map(record => ({
        date: record.serviceDate || record.date || null,
        mileage: record.mileage || record.odometer || null,
        description: record.description || record.serviceDescription || '',
        serviceType: record.serviceType || record.type || null,
        cost: record.cost || record.amount || null,
        location: record.location || record.shopName || record.dealerName || null
      }))
      
      const dates = records.map(r => r.date).filter(Boolean).sort()
      const mileages = records.map(r => r.mileage).filter(Boolean).sort((a, b) => a - b)
      
      return {
        source: 'vehicle-databases-api',
        vin: vin,
        vehicleInfo: {
          vin: vin,
          make: apiData.vehicle?.make || null,
          model: apiData.vehicle?.model || null,
          year: apiData.vehicle?.year || null,
          trim: apiData.vehicle?.trim || null,
          engine: apiData.vehicle?.engine || null
        },
        records: records,
        metadata: {
          sourceType: 'api',
          sourceFormat: 'vehicle-databases',
          totalRecords: records.length,
          dateRange: {
            earliest: dates[0] || null,
            latest: dates[dates.length - 1] || null
          },
          mileageRange: {
            lowest: mileages[0] || null,
            highest: mileages[mileages.length - 1] || null
          }
        },
        rawText: `Vehicle Databases API response for VIN: ${vin}`
      }
    } catch (error) {
      // In dev mode, return mock data if fetch fails
      if (process.env.DEV_MODE === 'true' && error.message.includes('fetch')) {
        return getMockData(vin)
      }
      throw error
    }
  }
}

/**
 * Get mock data for testing
 */
function getMockData(vin) {
    const now = new Date()
    const records = [
      {
        date: new Date(now.getFullYear() - 2, 0, 15).toISOString().split('T')[0],
        mileage: 30000,
        description: 'Oil change, Filter replacement',
        serviceType: 'Oil Change',
        cost: 45.99,
        location: 'Quick Lube Express'
      },
      {
        date: new Date(now.getFullYear() - 1, 3, 22).toISOString().split('T')[0],
        mileage: 45000,
        description: 'Brake pad replacement, Brake fluid flush',
        serviceType: 'Brake Service',
        cost: 325.00,
        location: 'AutoCare Center'
      }
    ]
    
    return {
      source: 'vehicle-databases-api',
      vin: vin,
      vehicleInfo: {
        vin: vin,
        make: 'Toyota',
        model: 'Camry',
        year: 2018,
        trim: 'LE',
        engine: '2.5L I4'
      },
      records: records,
      metadata: {
        sourceType: 'api',
        sourceFormat: 'vehicle-databases',
        totalRecords: records.length,
        dateRange: {
          earliest: records[0].date,
          latest: records[records.length - 1].date
        },
        mileageRange: {
          lowest: records[0].mileage,
          highest: records[records.length - 1].mileage
        },
        mockData: true
      },
      rawText: `Mock Vehicle Databases API response for VIN: ${vin}`
    }
}


