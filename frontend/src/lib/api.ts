import { apiRequest } from "./queryClient";

// Base URL for the prototype backend API
// In development, this will proxy through the server
// In production, use environment variable or relative path
const API_BASE_URL = import.meta.env.VITE_PROTOTYPE_API_URL || '/api/prototype';

// Vehicle/Portfolio API
export interface VehicleData {
  make: string;
  model: string;
  year: number;
  mileage: number;
  trim?: string;
  engine?: string;
  vin?: string;
}

export interface Portfolio {
  portfolioId: string;
  vehicleData: VehicleData;
  serviceHistory?: any;
  parsedHistory?: any;
  serviceAnalysis?: any;
  routineMaintenance?: any;
  unscheduledMaintenance?: any;
  gapAnalysis?: any;
  riskEvaluation?: any;
  marketValuation?: any;
  totalCostOfOwnership?: any;
}

// Get all portfolios
export async function getAllPortfolios(): Promise<{ portfolios: Portfolio[] }> {
  const res = await apiRequest('GET', `${API_BASE_URL}/portfolio`);
  return res.json();
}

// Get a single portfolio
export async function getPortfolio(portfolioId: string): Promise<{ portfolio: Portfolio }> {
  const res = await apiRequest('GET', `${API_BASE_URL}/portfolio/${portfolioId}`);
  return res.json();
}

// Save/Update portfolio
export async function savePortfolio(portfolioData: Partial<Portfolio>): Promise<{ portfolio: Portfolio }> {
  const res = await apiRequest('POST', `${API_BASE_URL}/portfolio`, portfolioData);
  return res.json();
}

// Delete portfolio
export async function deletePortfolio(portfolioId: string): Promise<void> {
  await apiRequest('DELETE', `${API_BASE_URL}/portfolio/${portfolioId}`);
}

// Parse PDF
export async function parsePdf(pdfFile: File): Promise<any> {
  const formData = new FormData();
  formData.append('serviceHistory', pdfFile);

  const res = await fetch(`${API_BASE_URL}/parse-pdf`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  return res.json();
}

// Get routine maintenance
export async function getRoutineMaintenance(vehicleData: VehicleData): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/routine-maintenance`, vehicleData);
  return res.json();
}

// Get unscheduled maintenance
export async function getUnscheduledMaintenance(vehicleData: VehicleData): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/unscheduled-maintenance`, vehicleData);
  return res.json();
}

// Analyze service history
export async function analyzeServiceHistory(
  vehicleData: VehicleData,
  serviceHistory: any
): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/analyze-service-history`, {
    ...vehicleData,
    serviceHistory,
  });
  return res.json();
}

// Perform gap analysis
export async function performGapAnalysis(
  vehicleData: VehicleData,
  serviceHistory: any,
  routineMaintenance: any
): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/maintenance-gap-analysis`, {
    ...vehicleData,
    serviceHistory,
    routineMaintenance,
  });
  return res.json();
}

// Evaluate unscheduled maintenance risk
export async function evaluateUnscheduledMaintenanceRisk(
  vehicleData: VehicleData,
  serviceHistory: any,
  serviceHistoryAnalysis: any,
  unscheduledMaintenance: any
): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/unscheduled-maintenance-risk`, {
    ...vehicleData,
    serviceHistory,
    serviceHistoryAnalysis,
    unscheduledMaintenance,
  });
  return res.json();
}

// Get market valuation
export async function getMarketValuation(vehicleData: VehicleData): Promise<any> {
  const res = await apiRequest('POST', `${API_BASE_URL}/market-valuation`, vehicleData);
  return res.json();
}

// Calculate total cost of ownership
export async function calculateTotalCostOfOwnership(
  vehicleData: VehicleData,
  tcoParams: {
    purchasePrice: number;
    timePeriodYears: number;
    milesPerYear: number;
    gapAnalysis?: any;
    riskEvaluation?: any;
    serviceHistoryAnalysis?: any;
    routineMaintenance?: any;
    marketValuation?: any;
  }
): Promise<any> {
  const requestBody: any = {
    ...vehicleData,
    purchasePrice: tcoParams.purchasePrice,
    timePeriodYears: tcoParams.timePeriodYears,
    milesPerYear: tcoParams.milesPerYear,
  };

  if (tcoParams.gapAnalysis) requestBody.gapAnalysis = tcoParams.gapAnalysis;
  if (tcoParams.riskEvaluation) requestBody.riskEvaluation = tcoParams.riskEvaluation;
  if (tcoParams.serviceHistoryAnalysis) requestBody.serviceHistoryAnalysis = tcoParams.serviceHistoryAnalysis;
  if (tcoParams.routineMaintenance) requestBody.routineMaintenance = tcoParams.routineMaintenance;
  if (tcoParams.marketValuation) requestBody.marketValuation = tcoParams.marketValuation;

  const res = await apiRequest('POST', `${API_BASE_URL}/total-cost-of-ownership`, requestBody);
  return res.json();
}

