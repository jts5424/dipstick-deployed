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
  const marketValuation = portfolio.marketValuation ? {
    retail: portfolio.marketValuation.retailValue || 0,
    retailRange: [
      portfolio.marketValuation.retailValueRange?.min || 0,
      portfolio.marketValuation.retailValueRange?.max || 0,
    ] as [number, number],
    privateParty: portfolio.marketValuation.privatePartyValue || 0,
    privateRange: [
      portfolio.marketValuation.privatePartyValueRange?.min || 0,
      portfolio.marketValuation.privatePartyValueRange?.max || 0,
    ] as [number, number],
    tradeIn: portfolio.marketValuation.tradeInValue || 0,
    tradeRange: [
      portfolio.marketValuation.tradeInValueRange?.min || 0,
      portfolio.marketValuation.tradeInValueRange?.max || 0,
    ] as [number, number],
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
  const gapAnalysis = portfolio.gapAnalysis ? {
    totalItems: portfolio.gapAnalysis.totalItems || 0,
    overdue: portfolio.gapAnalysis.overdue || 0,
    dueNow: portfolio.gapAnalysis.dueNow || 0,
    dueSoon: portfolio.gapAnalysis.dueSoon || 0,
    items: portfolio.gapAnalysis.items || [],
  } : {
    totalItems: 0,
    overdue: 0,
    dueNow: 0,
    dueSoon: 0,
    items: [],
  };

  // Transform risks
  const risks = portfolio.riskEvaluation?.risks?.map((risk: any, index: number) => ({
    id: `r${index}`,
    name: risk.name || '',
    windowMin: risk.windowMin,
    windowMax: risk.windowMax,
    riskLevel: risk.riskLevel || 'Moderate' as const,
    riskScore: risk.riskScore || 0,
    probability: risk.probability || 0,
    costMin: risk.costMin,
    costMax: risk.costMax,
    alreadyFixed: risk.alreadyFixed || false,
    mileageRisk: risk.mileageRisk,
    milesUntilFailureBucket: risk.milesUntilFailureBucket,
    maintenanceQuality: risk.maintenanceQuality,
    evidenceTags: risk.evidenceTags || [],
    recommendation: risk.recommendation,
  })) || [];

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

