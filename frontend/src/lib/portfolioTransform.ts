import type { Portfolio } from "./api";
import type { Vehicle } from "./mockData";

/**
 * Transform a backend Portfolio to a frontend Vehicle format
 * This is a basic transformation - you may need to enhance it based on your needs
 */
export function portfolioToVehicle(portfolio: Portfolio): Vehicle {
  const vehicleData = portfolio.vehicleData;
  
  // Generate a basic vehicle ID from portfolio ID
  const vehicleId = portfolio.portfolioId.replace('portfolio_', '');
  
  // Extract basic vehicle info
  const baseVehicle: Partial<Vehicle> = {
    id: vehicleId,
    year: vehicleData.year,
    make: vehicleData.make,
    model: vehicleData.model,
    trim: vehicleData.trim || '',
    mileage: vehicleData.mileage,
    vin: vehicleData.vin || '',
    engine: vehicleData.engine || '',
    location: 'Unknown', // Default location - can be updated from parsed data
    imageUrl: undefined, // No default image - only show if provided
  };

  // Transform service records from parsedServiceHistory
  // Backend returns: { records: [{ date, mileage, description, serviceType, cost, location }], metadata: {...}, vehicleInfo: {...} }
  const serviceRecords = portfolio.parsedServiceHistory?.records?.map((record: any, index: number) => {
    // Map serviceType to category enum
    const serviceType = (record.serviceType || '').toLowerCase();
    let category: 'admin' | 'maintenance' | 'inspection' | 'repair' | 'tire' = 'maintenance';
    
    if (serviceType.includes('tire') || serviceType.includes('wheel')) {
      category = 'tire';
    } else if (serviceType.includes('inspection') || serviceType.includes('inspect')) {
      category = 'inspection';
    } else if (serviceType.includes('repair') || serviceType.includes('fix') || serviceType.includes('replace')) {
      category = 'repair';
    } else if (serviceType.includes('admin') || serviceType.includes('registration')) {
      category = 'admin';
    } else {
      category = 'maintenance'; // Default
    }
    
    return {
      id: `s${index}`,
      date: record.date || '',
      mileage: record.mileage || null,
      category,
      description: record.description || '',
      location: record.location || '',
      costEstimate: record.cost || undefined,
    };
  }) || [];

  // Transform market valuation if available
  // Backend returns: { currentValuation: { retail: {min, max, average}, privateParty: {min, max, average}, tradeIn: {min, max, average} }, depreciation, ... }
  // Frontend expects: { retail, privateParty, tradeIn, retailRange, privateRange, tradeRange, ... }
  const marketValuation = portfolio.marketValuation ? {
    // Get values from currentValuation object (backend structure)
    // Backend has: currentValuation.retail.average, currentValuation.retail.min, currentValuation.retail.max
    retail: portfolio.marketValuation.currentValuation?.retail?.average || 
            portfolio.marketValuation.currentValuation?.retailValue || 
            portfolio.marketValuation.retailValue || 
            portfolio.marketValuation.retail || 0,
    retailRange: portfolio.marketValuation.currentValuation?.retail
      ? [portfolio.marketValuation.currentValuation.retail.min || 0, portfolio.marketValuation.currentValuation.retail.max || 0] as [number, number]
      : portfolio.marketValuation.currentValuation?.retailValueRange 
      ? [portfolio.marketValuation.currentValuation.retailValueRange.min || 0, portfolio.marketValuation.currentValuation.retailValueRange.max || 0] as [number, number]
      : portfolio.marketValuation.retailValueRange
      ? [portfolio.marketValuation.retailValueRange.min || 0, portfolio.marketValuation.retailValueRange.max || 0] as [number, number]
      : portfolio.marketValuation.retailRange || [0, 0] as [number, number],
    privateParty: portfolio.marketValuation.currentValuation?.privateParty?.average || 
                  portfolio.marketValuation.currentValuation?.privatePartyValue || 
                  portfolio.marketValuation.privatePartyValue || 
                  portfolio.marketValuation.privateParty || 0,
    privateRange: portfolio.marketValuation.currentValuation?.privateParty
      ? [portfolio.marketValuation.currentValuation.privateParty.min || 0, portfolio.marketValuation.currentValuation.privateParty.max || 0] as [number, number]
      : portfolio.marketValuation.currentValuation?.privatePartyValueRange
      ? [portfolio.marketValuation.currentValuation.privatePartyValueRange.min || 0, portfolio.marketValuation.currentValuation.privatePartyValueRange.max || 0] as [number, number]
      : portfolio.marketValuation.privatePartyValueRange
      ? [portfolio.marketValuation.privatePartyValueRange.min || 0, portfolio.marketValuation.privatePartyValueRange.max || 0] as [number, number]
      : portfolio.marketValuation.privateRange || [0, 0] as [number, number],
    tradeIn: portfolio.marketValuation.currentValuation?.tradeIn?.average || 
             portfolio.marketValuation.currentValuation?.tradeInValue || 
             portfolio.marketValuation.tradeInValue || 
             portfolio.marketValuation.tradeIn || 0,
    tradeRange: portfolio.marketValuation.currentValuation?.tradeIn
      ? [portfolio.marketValuation.currentValuation.tradeIn.min || 0, portfolio.marketValuation.currentValuation.tradeIn.max || 0] as [number, number]
      : portfolio.marketValuation.currentValuation?.tradeInValueRange
      ? [portfolio.marketValuation.currentValuation.tradeInValueRange.min || 0, portfolio.marketValuation.currentValuation.tradeInValueRange.max || 0] as [number, number]
      : portfolio.marketValuation.tradeInValueRange
      ? [portfolio.marketValuation.tradeInValueRange.min || 0, portfolio.marketValuation.tradeInValueRange.max || 0] as [number, number]
      : portfolio.marketValuation.tradeRange || [0, 0] as [number, number],
    depreciationCurve: portfolio.marketValuation.depreciationCurve || [],
    projectedFutureValues: {
      year1: { retail: 0, private: 0 },
      year2: { retail: 0, private: 0 },
      year3: { retail: 0, private: 0 },
      year5: { retail: 0, private: 0 },
    },
    depreciationStats: {
      msrp: 0,
      totalDepreciation: 0,
      totalDepreciationPct: 0,
      annualRate: 0,
      valueRetention: 0,
      mileageImpact: 'Unknown',
      phase: 'Unknown',
      vsAverage: 'Unknown',
      marketCondition: 'Unknown',
      marketTrend: 'Unknown',
      marketSegment: 'Unknown',
    },
  } : {
    retail: 0,
    retailRange: [0, 0] as [number, number],
    privateParty: 0,
    privateRange: [0, 0] as [number, number],
    tradeIn: 0,
    tradeRange: [0, 0] as [number, number],
    depreciationCurve: [],
    projectedFutureValues: {
      year1: { retail: 0, private: 0 },
      year2: { retail: 0, private: 0 },
      year3: { retail: 0, private: 0 },
      year5: { retail: 0, private: 0 },
    },
    depreciationStats: {
      msrp: 0,
      totalDepreciation: 0,
      totalDepreciationPct: 0,
      annualRate: 0,
      valueRetention: 0,
      mileageImpact: 'Unknown',
      phase: 'Unknown',
      vsAverage: 'Unknown',
      marketCondition: 'Unknown',
      marketTrend: 'Unknown',
      marketSegment: 'Unknown',
    },
  };

  // Transform TCO if available
  const tco = portfolio.totalCostOfOwnership ? {
    years: portfolio.totalCostOfOwnership.timePeriodYears || 3,
    milesPerYear: portfolio.totalCostOfOwnership.milesPerYear || 12000,
    askingPrice: portfolio.totalCostOfOwnership.purchasePrice || 0,
    immediateCostBurden: portfolio.totalCostOfOwnership.immediateCostBurden || 0,
    routineMaintenanceCost: portfolio.totalCostOfOwnership.routineMaintenanceCost || 0,
    expectedUnscheduledRepairCost: portfolio.totalCostOfOwnership.expectedUnscheduledRepairCost || 0,
    depreciationLoss: portfolio.totalCostOfOwnership.depreciationLoss || 0,
    totalCost: portfolio.totalCostOfOwnership.totalCost || 0,
    expectedSalePrice: portfolio.totalCostOfOwnership.expectedSalePrice || 0,
    totalLoss: portfolio.totalCostOfOwnership.totalLoss || 0,
    breakdown: portfolio.totalCostOfOwnership.breakdown || [],
  } : {
    years: 3,
    milesPerYear: 12000,
    askingPrice: 0,
    immediateCostBurden: 0,
    routineMaintenanceCost: 0,
    expectedUnscheduledRepairCost: 0,
    depreciationLoss: 0,
    totalCost: 0,
    expectedSalePrice: 0,
    totalLoss: 0,
    breakdown: [],
  };

  // Transform scores (compute from available data)
  const scores = {
    dipstickScore: 0, // TODO: Compute from analysis data
    dealScore: 0, // TODO: Compute from TCO and valuation
    conditionScore: 0, // TODO: Compute from service history
    riskLevel: 'Moderate' as const,
    counts: {
      high: portfolio.riskEvaluation?.highRiskItems?.length || 0,
      moderate: portfolio.riskEvaluation?.moderateRiskItems?.length || 0,
      low: portfolio.riskEvaluation?.lowRiskItems?.length || 0,
      critical: 0,
      fixed: 0,
    },
  };

  // Transform expert analysis
  const expertAnalysis = portfolio.serviceHistoryAnalysis ? {
    overallEvaluation: portfolio.serviceHistoryAnalysis.overallEvaluation || '',
    confidenceScore: portfolio.serviceHistoryAnalysis.confidenceScore || 'Medium' as const,
    confidenceReason: portfolio.serviceHistoryAnalysis.confidenceReason || '',
    gaps: portfolio.serviceHistoryAnalysis.gaps || [],
    inconsistentMileage: portfolio.serviceHistoryAnalysis.inconsistentMileage || [],
    servicesPerformedMoreThanNormal: portfolio.serviceHistoryAnalysis.servicesPerformedMoreThanNormal || [],
    expertNotes: portfolio.serviceHistoryAnalysis.expertNotes || [],
    anomalies: portfolio.serviceHistoryAnalysis.anomalies || [],
    concerns: portfolio.serviceHistoryAnalysis.concerns || [],
    positiveFindings: portfolio.serviceHistoryAnalysis.positiveFindings || [],
  } : {
    overallEvaluation: '',
    confidenceScore: 'Low' as const,
    confidenceReason: 'No analysis available',
    gaps: [],
    inconsistentMileage: [],
    servicesPerformedMoreThanNormal: [],
    expertNotes: [],
    anomalies: [],
    concerns: [],
    positiveFindings: [],
  };

  // Transform maintenance schedule
  const routineMaintenanceSchedule = portfolio.routineMaintenance?.schedule?.map((item: any, index: number) => ({
    id: `rm${index}`,
    item: item.name || item.item || '',
    intervalMiles: item.intervalMiles || 0,
    intervalMonths: item.intervalMonths || 0,
    costRange: item.costRange || [0, 0] as [number, number],
    oemCostRange: item.oemCostRange || [0, 0] as [number, number],
    description: item.description,
    status: item.status,
    statusDetails: item.statusDetails,
    lastPerformed: item.lastPerformed,
    lastDoneMiles: item.lastDoneMiles,
    nextDue: item.nextDue,
    riskNote: item.riskNote,
    severity: item.severity,
  })) || [];

  // Transform unscheduled forecast
  const unscheduledForecast = portfolio.unscheduledMaintenance?.items?.map((item: any, index: number) => ({
    id: `uf${index}`,
    name: item.name || '',
    windowMin: item.windowMin || 0,
    windowMax: item.windowMax || 0,
    probability: item.probability || 0,
    costMin: item.costMin || 0,
    costMax: item.costMax || 0,
    oemCostMin: item.oemCostMin || 0,
    oemCostMax: item.oemCostMax || 0,
    description: item.description,
  })) || [];

  // Transform gap analysis
  // Backend returns: { allItems: [...], summary: "..." }
  // Frontend expects: { items: [...], totalItems, overdue, dueNow, dueSoon }
  const gapAnalysis = portfolio.gapAnalysis ? {
    totalItems: portfolio.gapAnalysis.totalItems || (portfolio.gapAnalysis.allItems?.length || 0),
    overdue: portfolio.gapAnalysis.overdue || 0,
    dueNow: portfolio.gapAnalysis.dueNow || 0,
    dueSoon: portfolio.gapAnalysis.dueSoon || 0,
    items: (portfolio.gapAnalysis.items || portfolio.gapAnalysis.allItems || []).map((item: any, index: number) => {
      // Transform backend format to frontend format
      // Backend uses: status, status_info, last_performed, interval, next_due, severity, risk_note, cost_range, oem_cost
      // Frontend expects: id, item, status, statusDetails, lastPerformed, intervalMiles, intervalMonths, nextDue, severity, riskNote, costRange, oemCostRange
      
      // Parse cost range from string "$50-$100" to [50, 100]
      const parseCostRange = (costStr: string): [number, number] => {
        if (!costStr || costStr === 'N/A') return [0, 0];
        const matches = costStr.match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
        if (matches) {
          return [
            parseFloat(matches[1].replace(/,/g, '')),
            parseFloat(matches[2].replace(/,/g, ''))
          ];
        }
        return [0, 0];
      };

      // Parse interval from "50000 miles / 6 months" to { miles: 50000, months: 6 }
      const parseInterval = (intervalStr: string) => {
        if (!intervalStr || intervalStr === 'N/A') return { miles: 0, months: 0 };
        const milesMatch = intervalStr.match(/([\d,]+)\s*miles/);
        const monthsMatch = intervalStr.match(/(\d+)\s*months/);
        return {
          miles: milesMatch ? parseInt(milesMatch[1].replace(/,/g, '')) : 0,
          months: monthsMatch ? parseInt(monthsMatch[1]) : 0
        };
      };

      // Parse last performed mileage from "50000 miles (2020-01-01)" or just "50000 miles"
      const parseLastPerformedMiles = (lastPerformedStr: string): number | null => {
        if (!lastPerformedStr || lastPerformedStr === 'Never') return null;
        const match = lastPerformedStr.match(/([\d,]+)\s*miles/);
        return match ? parseInt(match[1].replace(/,/g, '')) : null;
      };

      // Parse next due mileage from "60000 miles (2021-01-01)" or just "60000 miles"
      const parseNextDueMiles = (nextDueStr: string): number | null => {
        if (!nextDueStr || nextDueStr === 'N/A') return null;
        const match = nextDueStr.match(/([\d,]+)\s*miles/);
        return match ? parseInt(match[1].replace(/,/g, '')) : null;
      };

      // Use raw backend data if available, otherwise parse from formatted strings
      const lastPerformedMiles = item.lastPerformedMileage !== undefined && item.lastPerformedMileage !== null
        ? item.lastPerformedMileage
        : parseLastPerformedMiles(item.last_performed || item.lastPerformed || '');
      
      const intervalMiles = item.recommendedIntervalMiles !== undefined && item.recommendedIntervalMiles !== null
        ? item.recommendedIntervalMiles
        : (parseInterval(item.interval || '').miles);
      
      const intervalMonths = item.recommendedIntervalMonths !== undefined && item.recommendedIntervalMonths !== null
        ? item.recommendedIntervalMonths
        : (parseInterval(item.interval || '').months);
      
      // Get overdue information from backend (raw data)
      const overdueByMiles = item.overdueByMiles !== undefined ? item.overdueByMiles : null;
      const nextDueMiles = item.nextDueMileage !== undefined && item.nextDueMileage !== null
        ? item.nextDueMileage
        : parseNextDueMiles(item.next_due || item.nextDue || '');
      
      // Normalize status: "Overdue" -> "overdue", "Due Now" -> "dueNow", "Near Future" -> "dueSoon"
      let normalizedStatus = item.status || 'notDue';
      if (normalizedStatus === 'Overdue') normalizedStatus = 'overdue';
      else if (normalizedStatus === 'Due Now') normalizedStatus = 'dueNow';
      else if (normalizedStatus === 'Near Future') normalizedStatus = 'dueSoon';
      else if (normalizedStatus === 'Not Due') normalizedStatus = 'notDue';
      
      // If never performed (lastPerformedMiles is null) and we have an interval, it's overdue
      if (lastPerformedMiles === null && intervalMiles > 0) {
        normalizedStatus = 'overdue';
      }
      
      // Build clear status details
      let statusDetails = '';
      if (normalizedStatus === 'overdue' || normalizedStatus === 'dueNow') {
        if (lastPerformedMiles === null) {
          statusDetails = 'Never performed - Due immediately';
        } else if (overdueByMiles !== null && overdueByMiles !== undefined && overdueByMiles > 0) {
          statusDetails = `Overdue by ${overdueByMiles.toLocaleString()} miles`;
        } else {
          statusDetails = 'Due now';
        }
      } else if (normalizedStatus === 'dueSoon') {
        const dueInMiles = item.dueInMiles !== undefined ? item.dueInMiles : (item.due_in_miles !== undefined ? item.due_in_miles : null);
        if (dueInMiles !== null && dueInMiles !== undefined) {
          statusDetails = `Due in ${dueInMiles.toLocaleString()} miles`;
        } else {
          statusDetails = 'Due soon';
        }
      } else {
        const dueInMiles = item.dueInMiles !== undefined ? item.dueInMiles : (item.due_in_miles !== undefined ? item.due_in_miles : null);
        if (dueInMiles !== null && dueInMiles !== undefined) {
          statusDetails = `Due in ${dueInMiles.toLocaleString()} miles`;
        } else {
          statusDetails = item.status_info || item.statusDetails || 'Not due';
        }
      }

      return {
        id: item.id || `gap_${index}`,
        item: item.item || '',
        status: normalizedStatus,
        statusDetails: statusDetails,
        lastPerformed: lastPerformedMiles !== null && lastPerformedMiles !== undefined
          ? `${lastPerformedMiles.toLocaleString()} miles${item.last_performed_date || item.lastPerformedDate ? ` (${item.last_performed_date || item.lastPerformedDate})` : ''}`
          : 'Never',
        lastPerformedDate: item.last_performed_date || item.lastPerformedDate || null,
        lastDoneMiles: lastPerformedMiles,
        intervalMiles: intervalMiles,
        intervalMonths: intervalMonths,
        nextDue: nextDueMiles !== null && nextDueMiles !== undefined
          ? `${nextDueMiles.toLocaleString()} miles${item.next_due_date || item.nextDueDate ? ` (${item.next_due_date || item.nextDueDate})` : ''}`
          : 'N/A',
        nextDueDate: item.next_due_date || item.nextDueDate || null,
        dueInMiles: item.dueInMiles !== undefined ? item.dueInMiles : (item.due_in_miles !== undefined ? item.due_in_miles : null),
        nextDueMiles: nextDueMiles, // Store the actual next due mileage from backend
        overdueByMiles: overdueByMiles, // Store how many miles overdue
        severity: item.severity || 'Medium',
        riskNote: item.risk_note || item.riskNote || '',
        costRange: item.costRange || parseCostRange(item.cost_range || ''),
        oemCostRange: item.oemCost || parseCostRange(item.oem_cost || ''),
      };
    }),
  } : {
    totalItems: 0,
    overdue: 0,
    dueNow: 0,
    dueSoon: 0,
    items: [],
  };

  // Transform risks
  // Backend returns: { allItems: [...], summary: "..." }
  // Backend structure: { item, forecastMileageMin, forecastMileageMax, probability, riskLevel, riskScore, evidence: { alreadyFixed }, mileageRisk: { milesUntilTypicalFailure }, ... }
  // Frontend expects: risks array with specific structure
  const risks = (portfolio.riskEvaluation?.risks || portfolio.riskEvaluation?.allItems || []).map((risk: any, index: number) => {
    // Backend now returns both formatted strings AND raw numeric values
    // Use raw values (forecastMileageMin/Max) if available, otherwise parse from formatted strings
    const windowMin = risk.forecastMileageMin !== undefined && risk.forecastMileageMin !== null
      ? risk.forecastMileageMin
      : (() => {
          // Fallback: try to parse from string format if available
          const forecastStr = risk.forecast_mileage || risk.forecastMileage || '';
          if (typeof forecastStr === 'string' && forecastStr !== 'N/A') {
            const rangeMatch = forecastStr.match(/([\d,]+)(?:\s*-\s*([\d,]+))?/);
            if (rangeMatch) {
              return parseInt(rangeMatch[1].replace(/,/g, ''));
            }
          }
          return 0;
        })();
    
    const windowMax = risk.forecastMileageMax !== undefined && risk.forecastMileageMax !== null
      ? risk.forecastMileageMax
      : (() => {
          // Fallback: try to parse from string format if available
          const forecastStr = risk.forecast_mileage || risk.forecastMileage || '';
          if (typeof forecastStr === 'string' && forecastStr !== 'N/A') {
            const rangeMatch = forecastStr.match(/([\d,]+)(?:\s*-\s*([\d,]+))?/);
            if (rangeMatch) {
              return rangeMatch[2] ? parseInt(rangeMatch[2].replace(/,/g, '')) : parseInt(rangeMatch[1].replace(/,/g, ''));
            }
          }
          return windowMin; // Default to windowMin if no max
        })();

    // Parse probability - backend returns probabilityRaw as number (0-100) or probability as string "50%"
    const probability = risk.probabilityRaw !== undefined 
      ? (risk.probabilityRaw > 1 ? risk.probabilityRaw / 100 : risk.probabilityRaw) // Convert 0-100 to 0-1 if needed
      : (risk.probability !== undefined 
          ? (typeof risk.probability === 'number' 
              ? (risk.probability > 1 ? risk.probability / 100 : risk.probability)
              : (() => {
                  const match = String(risk.probability).match(/(\d+)/);
                  return match ? parseInt(match[1]) / 100 : 0;
                })())
          : 0);

    // Parse cost range - backend now includes costRange object with min/max
    const costMin = risk.costRange?.min !== undefined ? risk.costRange.min : 
                   (risk.costMin !== undefined ? risk.costMin : 
                   (risk.cost_range ? (() => {
                     const matches = String(risk.cost_range).match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
                     return matches ? parseFloat(matches[1].replace(/,/g, '')) : 0;
                   })() : 0));
    
    const costMax = risk.costRange?.max !== undefined ? risk.costRange.max :
                   (risk.costMax !== undefined ? risk.costMax :
                   (risk.cost_range ? (() => {
                     const matches = String(risk.cost_range).match(/\$?([\d,]+)\s*-\s*\$?([\d,]+)/);
                     return matches ? parseFloat(matches[2].replace(/,/g, '')) : 0;
                   })() : 0));

    // Normalize risk level - backend returns "High", "Moderate", "Low", "Critical", "Already Fixed/Replaced"
    let normalizedRiskLevel = (risk.risk_level || risk.riskLevel || 'Moderate').toString();
    if (normalizedRiskLevel.includes('Already Fixed') || normalizedRiskLevel.includes('Fixed')) {
      normalizedRiskLevel = 'Low'; // Treat as low risk if already fixed
    } else if (normalizedRiskLevel.includes('High') || normalizedRiskLevel.includes('Critical')) {
      normalizedRiskLevel = 'High';
    } else if (normalizedRiskLevel.includes('Moderate') || normalizedRiskLevel.includes('Medium')) {
      normalizedRiskLevel = 'Moderate';
    } else {
      normalizedRiskLevel = 'Low';
    }

    // Get alreadyFixed from evidence object or direct field
    const alreadyFixed = risk.alreadyFixed === true || // Raw boolean from backend
                        risk.evidence?.alreadyFixed === true || 
                        risk.already_fixed === 'Yes' || 
                        (risk.riskLevel && risk.riskLevel.toString().includes('Already Fixed'));

    // Get miles until failure from mileageRisk object or direct field
    const milesUntilFailure = risk.milesUntilTypicalFailure !== undefined && risk.milesUntilTypicalFailure !== null
      ? risk.milesUntilTypicalFailure // Raw number from backend
      : (risk.mileageRisk?.milesUntilTypicalFailure !== undefined
        ? risk.mileageRisk.milesUntilTypicalFailure
        : null);

    return {
      id: risk.id || `r${index}`,
      name: risk.item || risk.name || '',
      windowMin: windowMin,
      windowMax: windowMax,
      riskLevel: normalizedRiskLevel as 'High' | 'Moderate' | 'Low',
      riskScore: risk.risk_score !== undefined ? (typeof risk.risk_score === 'number' ? risk.risk_score : parseFloat(risk.risk_score) || 0) : (risk.riskScore || 0),
      probability: probability, // 0-1 scale
      costMin: costMin,
      costMax: costMax,
      alreadyFixed: alreadyFixed,
      mileageRisk: risk.mileageRisk?.riskAssessment || risk.mileage_risk || risk.mileageRisk || 'N/A',
      milesUntilFailureBucket: milesUntilFailure !== null && milesUntilFailure !== undefined 
        ? `${milesUntilFailure >= 0 ? milesUntilFailure.toLocaleString() : `Past by ${Math.abs(milesUntilFailure).toLocaleString()}`} miles`
        : (risk.miles_until_failure || risk.milesUntilFailure || 'N/A'),
      maintenanceQuality: risk.maintenanceQuality?.overallMaintenance || 
                         (typeof risk.maintenanceQuality === 'string' ? risk.maintenanceQuality : null) ||
                         risk.maintenance_quality || 'N/A',
      evidenceTags: risk.evidence?.relatedServices || risk.evidenceTags || [],
      recommendation: risk.recommendation || 'N/A',
    };
  });

  // Transform leverage items (compute from risks and gaps)
  const leverageItems = [
    ...risks.filter(r => r.riskLevel === 'High').map(risk => ({
      id: `l_${risk.id}`,
      title: `${risk.name} Risk`,
      severity: 'High' as const,
      costMin: risk.costMin || 0,
      costMax: risk.costMax || 0,
      negotiationAngle: risk.recommendation || `High risk of ${risk.name} failure`,
      questionsToAsk: [`Has ${risk.name} been inspected?`, `Any signs of ${risk.name} issues?`],
      evidenceTags: risk.evidenceTags || [],
    })),
  ];

  return {
    ...baseVehicle,
    valuation: marketValuation,
    tco,
    scores,
    serviceRecords,
    expertAnalysis,
    routineMaintenanceSchedule,
    unscheduledForecast,
    gapAnalysis,
    risks,
    leverageItems,
  } as Vehicle;
}

